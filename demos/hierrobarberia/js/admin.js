/**
 * Panel de administración — CUADRA Agenda / CUADRA Consulta.
 *
 * Portado de sagastudio_static_site/js/admin.js (real, en producción) a la
 * capa de datos local CUADRA_DB (window.CUADRA_DB, ver js/admin-db.js) en
 * vez de la API real: mismo panel, mismas pantallas, sin backend detrás.
 *
 * Alcance:
 *   Login por PIN (config admin.pin, default 0000)
 *   Dashboard:  operación del día, equipo en salón, servicios del día, agenda
 *   Semana:     navegación por semana, vista expandible por día, totales
 *   Servicios:  CRUD completo
 *   Equipo:     CRUD de profesionales + activo/inactivo
 *   Horarios:   plan general, plan por profesional (+reset), excepciones
 *   Notif:      turno nuevo -> toast + sonido (poll local + evento storage
 *               entre pestañas, para que un turno reservado en la web
 *               pública se note al instante en el panel abierto en otra)
 */
(function (root) {
  'use strict';

  var DB = root.CUADRA_DB;
  var doc = document;
  var CFG = root.SITE_CONFIG || {};
  var SLUG = (CFG.tenant && CFG.tenant.slug) || 'cuadra';
  var IS_CONSULTA = CFG.tenant && CFG.tenant.vertical === 'consulta';
  var ENTITY_LABEL = IS_CONSULTA ? 'Consulta' : 'Turno';
  var ENTITY_LABEL_PL = IS_CONSULTA ? 'consultas' : 'turnos';

  var SESSION_KEY = SLUG + '_admin_session';
  var DELETED_KEY = SLUG + '_admin_deleted';
  var NOTIF_MUTED_KEY = SLUG + '_admin_notif_muted';

  var loggedIn = false;
  var currentTab = 'dashboard';
  var apptDate = todayISO();
  var undoTimer = null;
  var undoData = null;
  var deletedCache = [];
  var editingServiceId = null;
  var editingBarberId = null;
  var planScopeBarber = '';
  var knownPending = {};
  var notifReady = false;
  var pollTimer = null;
  var notifAudioCtx = null;
  var notifAudioOk = false;
  var notifMuted = false;
  try { notifMuted = root.localStorage.getItem(NOTIF_MUTED_KEY) === '1'; } catch (e) { /* noop */ }

  var weekStart = mondayOf(todayISO());
  var openDays = {};

  var cachedBarbers = [];
  var lastServices = [];
  var lastPlanRows = [];
  var lastExceptions = [];

  var DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  var STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado' };

  // ------------------------------------------------------------------ utils

  function $(id) { return doc.getElementById(id); }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function addDaysISO(iso, n) {
    var d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function mondayOf(dateStr) {
    var d = new Date(dateStr + 'T12:00:00');
    var dow = d.getDay();
    var diff = dow === 0 ? -6 : 1 - dow;
    return addDaysISO(dateStr, diff);
  }
  function fmtDateLong(iso) {
    var d = new Date(iso + 'T12:00:00');
    return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' de ' + d.toLocaleDateString('es-UY', { month: 'long' }) +
      (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
  }
  function fmtDateShort(iso) {
    var d = new Date(iso + 'T12:00:00');
    return d.getDate() + ' ' + MONTH_SHORT[d.getMonth()];
  }
  function formatRange(ws) {
    var mon = new Date(ws + 'T12:00:00');
    var sun = new Date(addDaysISO(ws, 6) + 'T12:00:00');
    return mon.getDate() + ' ' + MONTH_SHORT[mon.getMonth()] + ' – ' + sun.getDate() + ' ' + MONTH_SHORT[sun.getMonth()] + ' ' + sun.getFullYear();
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmtDuration(min) {
    var n = Number(min) || 0;
    if (n < 60) return n + ' min';
    var h = Math.floor(n / 60);
    var rest = n % 60;
    return h + 'h' + (rest ? ' ' + rest + 'min' : '');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function validatePhoneUY(phone) {
    var digits = String(phone || '').replace(/\D/g, '');
    if (digits.length === 11 && digits.indexOf('598') === 0) { digits = '0' + digits.slice(3); }
    return /^09[1-9]\d{6}$/.test(digits);
  }

  function apptErrorMessage(err) {
    var code = err && err.code;
    if (code === 'INVALID_DATE') return 'Esa fecha ya pasó.';
    if (err && err.message) return err.message;
    return 'No pudimos guardar el turno.';
  }

  var toastTimer = null;
  function toast(msg, isError) {
    var t = $('toast');
    if (!t) return;
    t.textContent = isError ? 'Error: ' + msg : msg;
    t.className = 'admin-toast' + (isError ? ' admin-toast--error' : '');
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, isError ? 5200 : 3200);
  }

  (function () {
    var t = $('toast');
    if (!t) return;
    t.style.cursor = 'pointer';
    t.addEventListener('click', function () { t.hidden = true; if (toastTimer) clearTimeout(toastTimer); });
  })();

  // ------------------------------------------------------------------ audio
  function notifEnsureAudio() {
    if (notifAudioCtx) return;
    try {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) { notifAudioOk = false; return; }
      notifAudioCtx = new AC();
      notifAudioOk = true;
    } catch (e) { notifAudioOk = false; }
  }
  function notifSafeResume() {
    if (!notifAudioCtx) return;
    try { var r = notifAudioCtx.resume(); if (r && r.catch) r.catch(function () {}); } catch (e) {}
  }
  function notifTone(freq, start, dur, vol) {
    try {
      var osc = notifAudioCtx.createOscillator();
      var gain = notifAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.012);
      gain.gain.setValueAtTime(vol, start + dur - 0.05);
      gain.gain.linearRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain); gain.connect(notifAudioCtx.destination);
      osc.start(start); osc.stop(start + dur + 0.05);
    } catch (e) {}
  }
  function notifPlayDing() {
    if (notifMuted || !notifAudioOk || !notifAudioCtx) return;
    try {
      notifSafeResume();
      var t = notifAudioCtx.currentTime;
      notifTone(880, t, 0.15, 0.3);
      notifTone(1170, t + 0.18, 0.18, 0.22);
    } catch (e) { notifAudioOk = false; }
  }
  function notifShowBanner(fresh) {
    var banner = $('notif-banner'), titleEl = $('notif-banner-title'), listEl = $('notif-banner-list');
    if (!banner || !titleEl || !listEl) return;
    titleEl.textContent = fresh.length === 1 ? '¡Nuevo ' + ENTITY_LABEL.toLowerCase() + '!' : '¡' + fresh.length + ' ' + ENTITY_LABEL_PL + ' nuevos!';
    var html = '';
    for (var i = 0; i < fresh.length; i++) {
      var a = fresh[i];
      var svcName = a.service && a.service.name_es ? a.service.name_es : 'Servicio';
      html += '<li><strong>' + esc(a.client_name) + '</strong> · ' + esc(svcName) + ' · ' + esc(fmtDateShort(a.date)) + ' ' + esc(a.time) + '</li>';
    }
    listEl.innerHTML = html;
    banner.hidden = false;
    banner.classList.remove('admin-notif-banner--in');
    void banner.offsetWidth;
    banner.classList.add('admin-notif-banner--in');
    notifPlayDing();
  }
  function notifHideBanner() { var b = $('notif-banner'); if (b) b.hidden = true; }

  function updateBadge(pendingCount) {
    var b = $('badge-week');
    if (!b) return;
    if (pendingCount > 0) { b.textContent = String(pendingCount); b.hidden = false; }
    else { b.hidden = true; }
  }

  // ---------------------------------------------------------- login/logout

  function initLogin() {
    $('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var pin = $('login-pin').value.trim();
      hideErr();
      if (!pin) { showErr('Ingresá el PIN de acceso.'); return; }
      DB.auth.loginPin(pin).then(function () {
        try { root.sessionStorage.setItem(SESSION_KEY, '1'); } catch (e2) {}
        $('login-pin').value = '';
        enterPanel();
      }).catch(function (err) {
        showErr(err && err.code === 'INVALID_PIN' ? 'PIN incorrecto.' : 'No pudimos verificar el PIN.');
      });
    });
    $('btn-logout').addEventListener('click', logout);
  }

  function logout() {
    stopPoll();
    notifHideBanner();
    loggedIn = false;
    try { root.sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    showLogin(null);
  }

  function showErr(msg) { var e = $('login-error'); e.textContent = msg; e.hidden = false; }
  function hideErr() { $('login-error').hidden = true; }

  function showLogin(message) {
    $('view-panel').hidden = true;
    $('view-login').hidden = false;
    if (message) showErr(message); else hideErr();
    try { $('login-pin').focus(); } catch (e) {}
  }

  function enterPanel() {
    loggedIn = true;
    $('view-login').hidden = true;
    $('view-panel').hidden = false;
    notifReady = false;
    knownPending = {};
    notifInitUI();
    initDateNav();
    wireDashNewAppt();
    switchTab('dashboard');
    startPoll();
  }

  // ------------------------------------------------------------------ tabs

  function initTabs() {
    var items = doc.querySelectorAll('.admin-bottomnav__item');
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function () { switchTab(this.getAttribute('data-tab')); });
    }
  }

  function switchTab(name) {
    currentTab = name;
    var items = doc.querySelectorAll('.admin-bottomnav__item');
    var sections = doc.querySelectorAll('.admin-section');
    for (var i = 0; i < items.length; i++) {
      var on = items[i].getAttribute('data-tab') === name;
      items[i].classList.toggle('is-active', on);
      items[i].setAttribute('aria-selected', String(on));
    }
    for (var j = 0; j < sections.length; j++) {
      sections[j].classList.toggle('is-active', sections[j].id === 'tab-' + name);
    }
    if (name === 'dashboard') reloadDashboard();
    if (name === 'semana') reloadWeek();
    if (name === 'servicios') reloadServicios();
    if (name === 'equipo') reloadEquipo();
    if (name === 'horarios') reloadHorarios();

    var activeSection = doc.querySelector('.admin-section.is-active');
    if (activeSection) {
      var heading = activeSection.querySelector('h2, h3');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    }
  }

  function wireDashNewAppt() {
    var newBtn = $('dash-new-appt');
    if (!newBtn || newBtn._wired) return;
    newBtn._wired = true;
    newBtn.addEventListener('click', function () { renderNewApptForm(); });
  }

  function sectionEl(name) { return $('tab-' + name); }

  // ============================================================ DASHBOARD

  function reloadDashboard() {
    var sub = $('dash-date-sub');
    if (sub) sub.textContent = cap(fmtDateLong(apptDate));

    setDashKPIs('—', '—', '—', '—');
    $('dash-team').innerHTML = '<p class="admin-loading">Cargando…</p>';
    $('dash-services').innerHTML = '';
    $('dash-appointments').innerHTML = '';
    loadDeleted();

    Promise.all([
      DB.listAppointments({ date: apptDate }),
      DB.listBarbers(),
      DB.listServices(),
      DB.listAppointments({ dateFrom: weekStart, dateTo: addDaysISO(weekStart, 6) }),
      loadPlan('')
    ]).then(function (res) {
      var todayList = res[0] || [];
      cachedBarbers = res[1] || [];
      lastServices = res[2] || [];
      var weekList = res[3] || [];
      lastPlanRows = res[4] || [];
      renderDashboard(todayList, weekList);
    });
  }

  function setDashKPIs(total, pending, confirmed, weekPct) {
    var el;
    el = $('kpi-today-count'); if (el) el.textContent = total;
    el = $('kpi-pending'); if (el) el.textContent = pending;
    el = $('kpi-confirmed'); if (el) el.textContent = confirmed;
    el = $('kpi-week-pct'); if (el) el.textContent = weekPct;
  }

  function renderDashboard(todayList, weekList) {
    var counts = { total: todayList.length, pending: 0, confirmed: 0, cancelled: 0 };
    for (var i = 0; i < todayList.length; i++) { if (counts[todayList[i].status] !== undefined) counts[todayList[i].status]++; }
    updateBadge(counts.pending);

    var weekConfirmed = 0;
    for (var w = 0; w < weekList.length; w++) { if (weekList[w].status === 'confirmed') weekConfirmed++; }
    var weeklyCap = calcWeeklyCapacity();
    var weekPct = weeklyCap > 0 ? Math.round((weekConfirmed / weeklyCap) * 100) + '%' : '—';

    setDashKPIs(String(counts.total), String(counts.pending), String(counts.confirmed), weekPct);
    renderDashTeam(todayList);
    renderDashServices(todayList);
    renderDashAppointments(todayList);
  }

  function renderDashTeam(list) {
    var teamMap = {};
    for (var i = 0; i < cachedBarbers.length; i++) {
      var b = cachedBarbers[i];
      if (b.active === false) continue;
      teamMap[b.id] = { name: b.name, role: b.role || (IS_CONSULTA ? 'Profesional' : 'Barbero'), count: 0 };
    }
    for (var j = 0; j < list.length; j++) {
      var a = list[j];
      var bId = a.barber && a.barber.id ? a.barber.id : '_general';
      if (!teamMap[bId]) teamMap[bId] = { name: a.barber && a.barber.name ? a.barber.name : 'General', role: '', count: 0 };
      teamMap[bId].count++;
    }
    var container = $('dash-team');
    var keys = Object.keys(teamMap);
    if (!keys.length) { container.innerHTML = '<p class="admin-empty">Sin equipo activo.</p>'; return; }
    var html = '';
    for (var k = 0; k < keys.length; k++) {
      var tm = teamMap[keys[k]];
      html += '<div class="admin-team-card"><div class="admin-team-card__info">' +
        '<div class="admin-team-card__name">' + esc(tm.name) + '</div>' +
        '<div class="admin-team-card__role">' + esc(tm.role) + '</div></div>' +
        '<div class="admin-team-card__stat"><span class="admin-team-card__count">' + tm.count + '</span>' +
        '<span class="admin-team-card__label">' + (tm.count === 1 ? ENTITY_LABEL.toLowerCase() : ENTITY_LABEL_PL) + '</span></div></div>';
    }
    container.innerHTML = html;
  }

  function renderDashServices(list) {
    var svcMap = {};
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.status !== 'confirmed') continue;
      var svcName = a.service && a.service.name_es ? a.service.name_es : 'Sin servicio';
      svcMap[svcName] = (svcMap[svcName] || 0) + 1;
    }
    var container = $('dash-services');
    var keys = Object.keys(svcMap);
    if (!keys.length) { container.innerHTML = '<p class="admin-empty">Sin servicios confirmados hoy.</p>'; return; }
    keys.sort(function (a, b) { return svcMap[b] - svcMap[a]; });
    var html = '';
    for (var k = 0; k < keys.length; k++) {
      html += '<div class="admin-svc-card"><span class="admin-svc-card__index">' + String(k + 1).padStart(2, '0') + '</span>' +
        '<span class="admin-svc-card__name">' + esc(keys[k]) + '</span>' +
        '<span class="admin-svc-card__count">' + svcMap[keys[k]] + '</span></div>';
    }
    container.innerHTML = html;
  }

  function renderDashAppointments(list) {
    var container = $('dash-appointments');
    if (!list.length) {
      container.innerHTML = '<div class="admin-empty">Sin ' + ENTITY_LABEL_PL + ' para ' + fmtDateShort(apptDate) + '.</div>';
      renderDeletedSection();
      return;
    }
    list.sort(function (a, b) { return String(a.time || '').localeCompare(String(b.time || '')); });

    var html = '<div class="admin-dash-appts">';
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var svcName = a.service && a.service.name_es ? a.service.name_es : '(servicio eliminado)';
      var barberName = a.barber && a.barber.name ? a.barber.name : 'General';
      var chipCls = a.status === 'confirmed' ? ' admin-chip--ok' : (a.status === 'cancelled' ? ' admin-chip--danger' : ' admin-chip--warn');

      var actions = '';
      if (a.status === 'pending') actions += dashActBtn(a.id, 'confirm', 'Confirmar');
      if (a.status !== 'cancelled') actions += dashActBtn(a.id, 'cancel', 'Cancelar');
      else actions += dashActBtn(a.id, 'pending', 'Reactivar');
      actions += dashActBtn(a.id, 'edit', 'Editar');
      actions += dashActBtn(a.id, 'delete', 'Eliminar');

      html += '<div class="admin-dash-appt" data-appt-id="' + esc(a.id) + '">' +
        '<time class="admin-dash-appt__time">' + esc(a.time) + '</time>' +
        '<div class="admin-dash-appt__info"><div class="admin-dash-appt__name">' + esc(a.client_name) + '</div>' +
        '<div class="admin-dash-appt__meta">' + esc(svcName) + ' · ' + esc(barberName) + (a.client_phone ? ' · ' + esc(a.client_phone) : '') + '</div></div>' +
        '<span class="admin-chip' + chipCls + '">' + (STATUS_LABELS[a.status] || esc(a.status)) + '</span>' +
        '<div class="admin-dash-appt__actions">' + actions + '</div></div>';
    }
    html += '</div>';
    container.innerHTML = html;

    var btns = container.querySelectorAll('[data-appt]');
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', function () { handleDashAction(this.getAttribute('data-do'), this.getAttribute('data-appt')); });
    }
    renderDeletedSection();
  }

  function dashActBtn(id, action, label) {
    return '<button type="button" class="admin-btn" data-appt="' + esc(id) + '" data-do="' + action + '">' + label + '</button>';
  }

  function handleDashAction(action, id) {
    if (!id) return;
    if (action === 'edit') { openEditAppt(id); return; }
    if (action === 'delete') { confirmDeleteAppt(id); return; }
    var p;
    if (action === 'confirm') p = DB.updateAppointmentStatus(id, 'confirmed');
    else if (action === 'cancel') p = DB.updateAppointmentStatus(id, 'cancelled');
    else if (action === 'pending') p = DB.updateAppointmentStatus(id, 'pending');
    else return;
    p.then(function () {
      toast(action === 'confirm' ? (IS_CONSULTA ? 'Consulta confirmada.' : 'Turno confirmado.') : (action === 'cancel' ? 'Cancelado.' : 'Reactivado.'));
      reloadDashboard();
    }).catch(function () { toast('No pudimos actualizar.', true); });
  }

  // ------------------------------------------- edit / new appointment form

  function openEditAppt(id) {
    DB.listAppointments({ date: apptDate }).then(function (list) {
      var appt = null;
      for (var i = 0; i < list.length; i++) { if (list[i].id === id) { appt = list[i]; break; } }
      if (!appt) { toast('No encontramos el registro.', true); return; }
      renderApptEditForm(appt);
    });
  }

  function renderNewApptForm() {
    var overlay = $('appt-edit-overlay');
    if (!overlay) return;
    var svcOpts = '';
    for (var i = 0; i < lastServices.length; i++) {
      var s = lastServices[i];
      if (s.active === false) continue;
      svcOpts += '<option value="' + esc(s.id) + '">' + esc(s.name_es) + ' — $' + (Number(s.price) || 0) + '</option>';
    }
    if (!svcOpts) svcOpts = '<option value="" disabled selected>Sin servicios disponibles</option>';

    var bbOpts = '<option value="">Sin profesional</option>';
    for (var j = 0; j < cachedBarbers.length; j++) {
      var b = cachedBarbers[j];
      if (b.active === false) continue;
      bbOpts += '<option value="' + esc(b.id) + '">' + esc(b.name) + '</option>';
    }

    overlay.innerHTML = '<div class="admin-appt-form">' +
      '<div class="admin-appt-form__title">Nuevo ' + ENTITY_LABEL.toLowerCase() + '</div>' +
      '<form id="appt-new-form" class="admin-form">' +
      '<div class="admin-form__full"><label for="an-name">Cliente *</label><input type="text" id="an-name" maxlength="60" required></div>' +
      '<div><label for="an-phone">Teléfono *</label><input type="text" id="an-phone" maxlength="20" placeholder="09X XXX XXX" required></div>' +
      '<div><label for="an-svc">Servicio *</label><select id="an-svc" required>' + svcOpts + '</select></div>' +
      '<div><label for="an-barber">Profesional</label><select id="an-barber">' + bbOpts + '</select></div>' +
      '<div><label for="an-date">Fecha *</label><input type="date" id="an-date" value="' + esc(apptDate) + '" required></div>' +
      '<div><label for="an-time">Hora *</label><input type="time" id="an-time" required></div>' +
      '<div class="admin-form__full"><label for="an-note">Nota (opcional)</label><textarea id="an-note" rows="2" maxlength="200"></textarea></div>' +
      '<p class="admin-error-text" id="an-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="an-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">Crear</button></div></form></div>';

    overlay.hidden = false;
    $('an-cancel').addEventListener('click', function () { overlay.hidden = true; overlay.innerHTML = ''; });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) { overlay.hidden = true; overlay.innerHTML = ''; } });
    try { $('an-name').focus(); } catch (e) {}

    $('appt-new-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('an-error');
      fe.hidden = true;
      var payload = {
        service_id: $('an-svc').value,
        barber_id: $('an-barber').value || null,
        date: $('an-date').value,
        time: $('an-time').value,
        client_name: $('an-name').value.trim(),
        client_phone: $('an-phone').value.trim(),
        note: $('an-note').value.trim(),
        status: 'pending',
        source: 'admin',
        allowPast: true
      };
      if (!payload.client_name) { fe.textContent = 'Ingresá el nombre del cliente.'; fe.hidden = false; return; }
      if (!validatePhoneUY(payload.client_phone)) { fe.textContent = 'Ingresá un teléfono válido: 09X XXX XXX.'; fe.hidden = false; return; }
      if (!payload.service_id) { fe.textContent = 'Seleccioná un servicio.'; fe.hidden = false; return; }
      if (!payload.date || !payload.time) { fe.textContent = 'Ingresá la fecha y hora.'; fe.hidden = false; return; }

      DB.createAppointment(payload).then(function () {
        toast('Creado.');
        overlay.hidden = true; overlay.innerHTML = '';
        reloadDashboard();
      }).catch(function (err) { fe.textContent = apptErrorMessage(err); fe.hidden = false; });
    });
  }

  function renderApptEditForm(appt) {
    var overlay = $('appt-edit-overlay');
    if (!overlay) return;
    var svcOpts = '';
    for (var i = 0; i < lastServices.length; i++) {
      var s = lastServices[i];
      svcOpts += '<option value="' + esc(s.id) + '"' + (s.id === (appt.service && appt.service.id) ? ' selected' : '') + '>' + esc(s.name_es) + ' — $' + (Number(s.price) || 0) + '</option>';
    }
    var bbOpts = '<option value="">Sin profesional</option>';
    for (var j = 0; j < cachedBarbers.length; j++) {
      var b = cachedBarbers[j];
      if (b.active === false) continue;
      bbOpts += '<option value="' + esc(b.id) + '"' + (b.id === (appt.barber && appt.barber.id) ? ' selected' : '') + '>' + esc(b.name) + '</option>';
    }

    overlay.innerHTML = '<div class="admin-appt-form">' +
      '<div class="admin-appt-form__title">Editar ' + ENTITY_LABEL.toLowerCase() + '</div>' +
      '<form id="appt-edit-form" class="admin-form">' +
      '<div class="admin-form__full"><label for="ae-name">Cliente *</label><input type="text" id="ae-name" maxlength="60" value="' + esc(appt.client_name) + '" required></div>' +
      '<div><label for="ae-phone">Teléfono *</label><input type="text" id="ae-phone" maxlength="20" value="' + esc(appt.client_phone || '') + '" required></div>' +
      '<div><label for="ae-svc">Servicio *</label><select id="ae-svc" required>' + svcOpts + '</select></div>' +
      '<div><label for="ae-barber">Profesional</label><select id="ae-barber">' + bbOpts + '</select></div>' +
      '<div><label for="ae-date">Fecha *</label><input type="date" id="ae-date" value="' + esc(appt.date) + '" required></div>' +
      '<div><label for="ae-time">Hora *</label><input type="time" id="ae-time" value="' + esc((appt.time || '').slice(0, 5)) + '" required></div>' +
      '<div><label for="ae-status">Estado</label><select id="ae-status">' +
      '<option value="pending"' + (appt.status === 'pending' ? ' selected' : '') + '>Pendiente</option>' +
      '<option value="confirmed"' + (appt.status === 'confirmed' ? ' selected' : '') + '>Confirmado</option>' +
      '<option value="cancelled"' + (appt.status === 'cancelled' ? ' selected' : '') + '>Cancelado</option></select></div>' +
      '<div class="admin-form__full"><label for="ae-note">Nota (opcional)</label><textarea id="ae-note" rows="2" maxlength="200">' + esc(appt.note || '') + '</textarea></div>' +
      '<p class="admin-error-text" id="ae-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="ae-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">Guardar cambios</button></div></form></div>';

    overlay.hidden = false;
    $('ae-cancel').addEventListener('click', function () { overlay.hidden = true; overlay.innerHTML = ''; });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) { overlay.hidden = true; overlay.innerHTML = ''; } });

    $('appt-edit-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('ae-error');
      fe.hidden = true;
      var newStatus = $('ae-status').value;
      var clientName = $('ae-name').value.trim();
      var clientPhone = $('ae-phone').value.trim();
      var serviceId = $('ae-svc').value;
      var date = $('ae-date').value;
      var time = $('ae-time').value;

      if (!clientName) { fe.textContent = 'Ingresá el nombre del cliente.'; fe.hidden = false; return; }
      if (!validatePhoneUY(clientPhone)) { fe.textContent = 'Ingresá un teléfono válido: 09X XXX XXX.'; fe.hidden = false; return; }
      if (!serviceId) { fe.textContent = 'Seleccioná un servicio.'; fe.hidden = false; return; }
      if (!date || !time) { fe.textContent = 'Ingresá la fecha y hora.'; fe.hidden = false; return; }

      var patch = {
        client_name: clientName, client_phone: clientPhone, service_id: serviceId,
        barber_id: $('ae-barber').value || null, date: date, time: time,
        note: $('ae-note').value.trim() || null
      };

      var ops = [DB.updateAppointment(appt.id, patch)];
      if (newStatus !== appt.status) ops.push(DB.updateAppointmentStatus(appt.id, newStatus));

      Promise.all(ops).then(function () {
        toast('Actualizado.');
        overlay.hidden = true; overlay.innerHTML = '';
        reloadDashboard();
      }).catch(function (err) { fe.textContent = apptErrorMessage(err); fe.hidden = false; });
    });
  }

  // ------------------------------------------- delete (with undo)

  function confirmDeleteAppt(id) {
    DB.listAppointments({ date: apptDate }).then(function (list) {
      var appt = null;
      for (var i = 0; i < list.length; i++) { if (list[i].id === id) { appt = list[i]; break; } }
      if (!appt) { toast('No encontramos el registro.', true); return; }
      performDeleteAppt(appt);
    });
  }

  function performDeleteAppt(appt) {
    undoData = {
      id: appt.id, date: appt.date, time: appt.time, client_name: appt.client_name,
      client_phone: appt.client_phone || '', status: appt.status,
      service_id: appt.service ? appt.service.id : null, barber_id: appt.barber ? appt.barber.id : null,
      note: appt.note || null
    };
    DB.deleteAppointment(appt.id).then(function () {
      saveDeleted(undoData);
      showUndoToast('Eliminado.');
      reloadDashboard();
    }).catch(function () { toast('No pudimos eliminar.', true); undoData = null; });
  }

  function showUndoToast(msg) {
    var t = $('toast');
    if (!t) return;
    t.innerHTML = '<span class="admin-toast__msg">' + esc(msg) + '</span><button type="button" class="admin-toast__undo" id="toast-undo-btn">Deshacer</button>';
    t.className = 'admin-toast admin-toast--undo';
    t.hidden = false;
    if (undoTimer) clearTimeout(undoTimer);
    var undoBtn = $('toast-undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', function () {
        if (!undoData) return;
        recoverAppointment(undoData);
        t.hidden = true;
        if (undoTimer) clearTimeout(undoTimer);
      });
    }
    undoTimer = setTimeout(function () { t.hidden = true; undoData = null; }, 8000);
  }

  function recoverAppointment(data) {
    if (!data) return;
    DB.createAppointment({
      service_id: data.service_id, barber_id: data.barber_id, date: data.date, time: data.time,
      client_name: data.client_name, client_phone: data.client_phone, note: data.note,
      status: data.status || 'pending', allowPast: true, source: 'admin_recover'
    }).then(function () {
      removeDeleted(data.id);
      toast('Recuperado.');
      reloadDashboard();
    }).catch(function () { toast('No pudimos recuperar.', true); });
  }

  function loadDeleted() {
    try { deletedCache = JSON.parse(root.localStorage.getItem(DELETED_KEY) || '[]'); } catch (e) { deletedCache = []; }
  }
  function saveDeleted(appt) {
    loadDeleted();
    for (var i = 0; i < deletedCache.length; i++) { if (deletedCache[i].id === appt.id) return; }
    deletedCache.push(appt);
    try { root.localStorage.setItem(DELETED_KEY, JSON.stringify(deletedCache)); } catch (e) {}
  }
  function removeDeleted(id) {
    loadDeleted();
    var filtered = [];
    for (var i = 0; i < deletedCache.length; i++) { if (deletedCache[i].id !== id) filtered.push(deletedCache[i]); }
    deletedCache = filtered;
    try { root.localStorage.setItem(DELETED_KEY, JSON.stringify(deletedCache)); } catch (e) {}
  }

  function renderDeletedSection() {
    var sec = sectionEl('dashboard');
    if (!sec) return;
    var delContainer = sec.querySelector('.admin-deleted-section');
    if (!delContainer) { delContainer = doc.createElement('div'); delContainer.className = 'admin-deleted-section'; sec.appendChild(delContainer); }
    loadDeleted();
    var todayDel = [];
    for (var i = 0; i < deletedCache.length; i++) { if (deletedCache[i].date === apptDate) todayDel.push(deletedCache[i]); }
    if (!todayDel.length) { delContainer.innerHTML = ''; return; }

    var html = '<h3 class="admin-deleted-section__title">Eliminados hoy (recuperar)</h3>';
    for (var j = 0; j < todayDel.length; j++) {
      var d = todayDel[j];
      html += '<div class="admin-deleted-item"><div class="admin-deleted-item__info">' +
        '<div class="admin-deleted-item__name">' + esc(d.client_name) + '</div>' +
        '<div class="admin-deleted-item__meta">' + esc(d.time || '') + '</div></div>' +
        '<div class="admin-deleted-item__actions">' +
        '<button type="button" class="admin-btn" data-recover="' + esc(d.id) + '">Recuperar</button>' +
        '<button type="button" class="admin-btn admin-btn--danger" data-purge="' + esc(d.id) + '">Quitar</button></div></div>';
    }
    delContainer.innerHTML = html;

    var recoverBtns = delContainer.querySelectorAll('[data-recover]');
    for (var k = 0; k < recoverBtns.length; k++) {
      recoverBtns[k].addEventListener('click', function () {
        var rid = this.getAttribute('data-recover');
        for (var m = 0; m < deletedCache.length; m++) { if (deletedCache[m].id === rid) { recoverAppointment(deletedCache[m]); break; } }
      });
    }
    var purgeBtns = delContainer.querySelectorAll('[data-purge]');
    for (var p = 0; p < purgeBtns.length; p++) {
      purgeBtns[p].addEventListener('click', function () {
        removeDeleted(this.getAttribute('data-purge'));
        toast('Quitado del historial.');
        renderDeletedSection();
      });
    }
  }

  // ============================================================ WEEK VIEW

  function reloadWeek() {
    var rangeEl = $('week-range');
    if (rangeEl) rangeEl.textContent = formatRange(weekStart);
    $('week-days').innerHTML = '<p class="admin-loading">Cargando semana…</p>';
    setWeekKPIs('—', '—', '—');
    DB.listAppointments({ dateFrom: weekStart, dateTo: addDaysISO(weekStart, 6) }).then(function (list) { renderWeek(list || []); });
  }

  function setWeekKPIs(total, pending, confirmed) {
    var el;
    el = $('wk-total'); if (el) el.textContent = total;
    el = $('wk-pending'); if (el) el.textContent = pending;
    el = $('wk-confirmed'); if (el) el.textContent = confirmed;
  }

  function renderWeek(list) {
    var groups = {};
    for (var i = 0; i < list.length; i++) { var d = list[i].date; (groups[d] = groups[d] || []).push(list[i]); }

    var counts = { total: list.length, pending: 0, confirmed: 0 };
    for (var k = 0; k < list.length; k++) {
      if (list[k].status === 'pending') counts.pending++;
      if (list[k].status === 'confirmed') counts.confirmed++;
    }
    setWeekKPIs(String(counts.total), String(counts.pending), String(counts.confirmed));
    updateBadge(counts.pending);

    var today = todayISO();
    var html = '';
    for (var day = 0; day < 7; day++) {
      var dateStr = addDaysISO(weekStart, day);
      var dObj = new Date(dateStr + 'T12:00:00');
      var dayList = groups[dateStr] || [];
      var isToday = dateStr === today;
      var isOpen = isToday || !!openDays[dateStr];
      var pendingCount = 0;
      for (var p = 0; p < dayList.length; p++) { if (dayList[p].status === 'pending') pendingCount++; }

      html += '<div class="admin-week-day' + (isToday ? ' is-today' : '') + (isOpen ? ' is-open' : '') + '" data-date="' + esc(dateStr) + '">';
      html += '<button type="button" class="admin-week-day__head" aria-expanded="' + (isOpen ? 'true' : 'false') + '">';
      html += '<div class="admin-week-day__info"><span class="admin-week-day__name">' + esc(DAY_NAMES[dObj.getDay()]) + '</span>' +
        '<span class="admin-week-day__date">' + dObj.getDate() + ' ' + esc(MONTH_SHORT[dObj.getMonth()]) + '</span></div>';
      html += '<div class="admin-week-day__counts"><span class="admin-week-day__count">' + dayList.length + '</span>';
      if (pendingCount > 0) html += '<span class="admin-week-day__badge admin-week-day__badge--pending">' + pendingCount + '</span>';
      html += '<span class="admin-week-day__chevron" aria-hidden="true">›</span></div></button>';

      html += '<div class="admin-week-day__body">';
      if (!dayList.length) {
        html += '<p class="admin-week-day__empty">Sin ' + ENTITY_LABEL_PL + '</p>';
      } else {
        dayList.sort(function (a, b) { return String(a.time || '').localeCompare(String(b.time || '')); });
        html += '<div class="admin-dash-appts">';
        for (var j = 0; j < dayList.length; j++) {
          var a = dayList[j];
          var svcName = a.service && a.service.name_es ? a.service.name_es : '(servicio eliminado)';
          var barberName = a.barber && a.barber.name ? a.barber.name : 'General';
          var chipCls = a.status === 'confirmed' ? ' admin-chip--ok' : (a.status === 'cancelled' ? ' admin-chip--danger' : ' admin-chip--warn');
          html += '<div class="admin-dash-appt"><time class="admin-dash-appt__time">' + esc(a.time) + '</time>' +
            '<div class="admin-dash-appt__info"><div class="admin-dash-appt__name">' + esc(a.client_name) + '</div>' +
            '<div class="admin-dash-appt__meta">' + esc(svcName) + ' · ' + esc(barberName) + '</div></div>' +
            '<span class="admin-chip' + chipCls + '">' + (STATUS_LABELS[a.status] || esc(a.status)) + '</span></div>';
        }
        html += '</div>';
      }
      html += '</div></div>';
    }
    $('week-days').innerHTML = html;

    var dayBtns = $('week-days').querySelectorAll('.admin-week-day__head');
    for (var d2 = 0; d2 < dayBtns.length; d2++) {
      dayBtns[d2].addEventListener('click', function () {
        var group = this.closest('.admin-week-day');
        if (!group) return;
        apptDate = group.getAttribute('data-date');
        switchTab('dashboard');
      });
    }
    var prevBtn = $('week-prev'), nextBtn = $('week-next'), todayBtn = $('week-today');
    if (prevBtn) prevBtn.onclick = function () { weekStart = addDaysISO(weekStart, -7); openDays = {}; reloadWeek(); };
    if (nextBtn) nextBtn.onclick = function () { weekStart = addDaysISO(weekStart, 7); openDays = {}; reloadWeek(); };
    if (todayBtn) todayBtn.onclick = function () { weekStart = mondayOf(todayISO()); openDays = {}; reloadWeek(); };
  }

  // ------------------------------------------------------------- servicios

  function reloadServicios() {
    var sec = sectionEl('servicios');
    sec.innerHTML = '<p class="admin-loading">Cargando servicios…</p>';
    DB.listServices().then(function (list) { lastServices = list || []; renderServicios(lastServices); });
  }

  function renderServicios(list) {
    var sec = sectionEl('servicios');
    var rows;
    if (!list.length) {
      rows = '<div class="admin-empty">Todavía no hay servicios. Creá el primero con "+ Nuevo servicio".</div>';
    } else {
      rows = '<div class="admin-list">';
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        rows += '<div class="admin-list__item"><div class="admin-item__main">' +
          '<div class="admin-item__name">' + esc(s.name_es) + '</div>' +
          '<div class="admin-item__meta">$ ' + (Number(s.price) || 0) + ' · ' + fmtDuration(s.duration_min) + (s.group_name ? ' · ' + esc(s.group_name) : '') + '</div></div>' +
          '<span class="admin-chip ' + (s.active === false ? 'admin-chip--off' : 'admin-chip--ok') + '">' + (s.active === false ? 'Oculto' : 'Activo') + '</span>' +
          '<div class="admin-item__actions"><button type="button" class="admin-btn" data-svc-edit="' + esc(s.id) + '">Editar</button>' +
          '<button type="button" class="admin-btn admin-btn--danger" data-svc-del="' + esc(s.id) + '">Eliminar</button></div></div>';
      }
      rows += '</div>';
    }
    sec.innerHTML = '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Carta de servicios</h3>' +
      '<button type="button" class="admin-btn admin-btn--solid" id="svc-new">+ Nuevo servicio</button></div>' + rows + '<div id="svc-form-wrap"></div>';

    $('svc-new').addEventListener('click', function () { renderServiceForm(null); });
    wirePairClicks(sec, 'data-svc-edit', function (id) {
      var found = null;
      for (var j = 0; j < lastServices.length; j++) { if (lastServices[j].id === id) { found = lastServices[j]; break; } }
      renderServiceForm(found);
    }, 'data-svc-del', function (id) {
      if (!root.confirm('¿Eliminar este servicio?')) return;
      DB.deleteService(id).then(function () { toast('Servicio eliminado.'); reloadServicios(); });
    });
  }

  function wirePairClicks(scope, attrA, fnA, attrB, fnB) {
    var as = scope.querySelectorAll('[' + attrA + ']');
    for (var i = 0; i < as.length; i++) { as[i].addEventListener('click', function () { fnA(this.getAttribute(attrA), this); }); }
    if (!attrB) return;
    var bs = scope.querySelectorAll('[' + attrB + ']');
    for (var j = 0; j < bs.length; j++) { bs[j].addEventListener('click', function () { fnB(this.getAttribute(attrB), this); }); }
  }

  function renderServiceForm(svc) {
    var wrap = $('svc-form-wrap');
    if (!wrap) return;
    editingServiceId = svc ? svc.id : null;
    wrap.innerHTML = '<form class="admin-form" id="svc-form">' +
      '<div class="admin-form__full"><label for="f-name">Nombre *</label><input type="text" id="f-name" maxlength="60" value="' + esc(svc && svc.name_es) + '" required></div>' +
      '<div><label for="f-price">Precio *</label><input type="number" id="f-price" min="0" step="10" value="' + esc(svc && svc.price != null ? svc.price : '') + '" required></div>' +
      '<div><label for="f-dur">Duración (min) *</label><input type="number" id="f-dur" min="5" step="5" value="' + esc(svc && svc.duration_min != null ? svc.duration_min : '') + '" required></div>' +
      '<div><label for="f-group">Categoría</label><input type="text" id="f-group" maxlength="40" value="' + esc(svc && svc.group_name ? svc.group_name : '') + '"></div>' +
      '<div class="admin-form__full"><label for="f-desc">Descripción (opcional)</label><textarea id="f-desc" rows="2" maxlength="200">' + esc(svc && svc.desc_es ? svc.desc_es : '') + '</textarea></div>' +
      '<label class="admin-check"><input type="checkbox" id="f-active"' + (!svc || svc.active !== false ? ' checked' : '') + '> Visible en la web</label>' +
      '<p class="admin-error-text" id="f-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="f-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">' + (svc ? 'Guardar cambios' : 'Crear servicio') + '</button></div></form>';

    try { $('f-name').focus(); } catch (e) {}
    $('f-cancel').addEventListener('click', function () { wrap.innerHTML = ''; });
    $('svc-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('f-error');
      fe.hidden = true;
      var patch = {
        name_es: $('f-name').value.trim(), price: Number($('f-price').value), duration_min: Number($('f-dur').value),
        group_name: $('f-group').value.trim(), desc_es: $('f-desc').value.trim(), active: $('f-active').checked
      };
      if (!patch.name_es || !(patch.price >= 0) || !(patch.duration_min > 0)) { fe.textContent = 'Nombre, precio y duración son obligatorios.'; fe.hidden = false; return; }
      var op = editingServiceId ? DB.updateService(editingServiceId, patch) : DB.createService(patch);
      op.then(function () { toast(editingServiceId ? 'Servicio actualizado.' : 'Servicio creado.'); wrap.innerHTML = ''; reloadServicios(); });
    });
  }

  // ---------------------------------------------------------------- equipo

  function reloadEquipo() {
    var sec = sectionEl('equipo');
    sec.innerHTML = '<p class="admin-loading">Cargando equipo…</p>';
    DB.listBarbers().then(function (list) { cachedBarbers = list || []; renderEquipo(cachedBarbers); });
  }

  function renderEquipo(list) {
    var sec = sectionEl('equipo');
    var rows;
    if (!list.length) {
      rows = '<div class="admin-empty">Sin equipo cargado. Con al menos un profesional activo se puede reservar.</div>';
    } else {
      rows = '<div class="admin-list">';
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        rows += '<div class="admin-list__item"><div class="admin-item__main">' +
          '<div class="admin-item__name">' + esc(b.name) + '</div><div class="admin-item__meta">' + esc(b.role || '') + '</div></div>' +
          '<span class="admin-chip ' + (b.active === false ? 'admin-chip--off' : 'admin-chip--ok') + '">' + (b.active === false ? 'Inactivo' : 'Activo') + '</span>' +
          '<div class="admin-item__actions"><button type="button" class="admin-btn" data-bb-toggle="' + esc(b.id) + '" data-next="' + (b.active === false ? '1' : '0') + '">' +
          (b.active === false ? 'Activar' : 'Desactivar') + '</button>' +
          '<button type="button" class="admin-btn admin-btn--danger" data-bb-del="' + esc(b.id) + '">Eliminar</button></div></div>';
      }
      rows += '</div>';
    }
    sec.innerHTML = '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Equipo</h3>' +
      '<button type="button" class="admin-btn admin-btn--solid" id="bb-new">+ Agregar</button></div>' + rows + '<div id="bb-form-wrap"></div>';

    $('bb-new').addEventListener('click', function () { renderBarberForm(null); });
    wirePairClicks(sec, 'data-bb-toggle', function (id, ev) {
      var makeActive = ev.getAttribute('data-next') === '1';
      DB.updateBarber(id, { active: makeActive }).then(function () { toast(makeActive ? 'Activado.' : 'Desactivado.'); reloadEquipo(); });
    }, 'data-bb-del', function (id) {
      if (!root.confirm('¿Eliminar? Su historial de turnos queda igual.')) return;
      DB.deleteBarber(id).then(function () { toast('Eliminado.'); reloadEquipo(); });
    });
  }

  function renderBarberForm(bb) {
    var wrap = $('bb-form-wrap');
    if (!wrap) return;
    editingBarberId = bb ? bb.id : null;
    wrap.innerHTML = '<form class="admin-form" id="bb-form">' +
      '<div><label for="b-name">Nombre *</label><input type="text" id="b-name" maxlength="60" value="' + esc(bb && bb.name) + '" required></div>' +
      '<div><label for="b-role">Rol</label><input type="text" id="b-role" maxlength="40" value="' + esc(bb && bb.role ? bb.role : '') + '"></div>' +
      '<label class="admin-check"><input type="checkbox" id="b-active"' + (!bb || bb.active !== false ? ' checked' : '') + '> Activo</label>' +
      '<p class="admin-error-text" id="b-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="b-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">' + (bb ? 'Guardar cambios' : 'Agregar') + '</button></div></form>';

    try { $('b-name').focus(); } catch (e) {}
    $('b-cancel').addEventListener('click', function () { wrap.innerHTML = ''; });
    $('bb-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var be = $('b-error');
      be.hidden = true;
      var patch = { name: $('b-name').value.trim(), role: $('b-role').value.trim(), active: $('b-active').checked };
      if (!patch.name) { be.textContent = 'El nombre es obligatorio.'; be.hidden = false; return; }
      var op = editingBarberId ? DB.updateBarber(editingBarberId, patch) : DB.createBarber(patch);
      op.then(function () { toast(editingBarberId ? 'Actualizado.' : 'Agregado.'); wrap.innerHTML = ''; reloadEquipo(); });
    });
  }

  // -------------------------------------------------------------- horarios

  function reloadHorarios() {
    var sec = sectionEl('horarios');
    sec.innerHTML = '<p class="admin-loading">Cargando horarios…</p>';
    Promise.all([DB.listBarbers(), DB.listExceptions()]).then(function (res) {
      cachedBarbers = res[0] || [];
      lastExceptions = res[1] || [];
      renderHorariosShell();
      return loadPlan(planScopeBarber);
    }).then(function (rows) { lastPlanRows = rows || []; paintPlanRows(); renderExceptions(); });
  }

  function renderHorariosShell() {
    var sec = sectionEl('horarios');
    var opts = '<option value="">Plan general</option>';
    for (var i = 0; i < cachedBarbers.length; i++) {
      opts += '<option value="' + esc(cachedBarbers[i].id) + '"' + (cachedBarbers[i].id === planScopeBarber ? ' selected' : '') + '>' + esc(cachedBarbers[i].name) + '</option>';
    }
    sec.innerHTML = '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Horarios</h3>' +
      '<select id="plan-scope" class="admin-select-inline" aria-label="Ámbito del plan">' + opts + '</select></div>' +
      '<p style="font-size:0.8125rem;color:var(--muted-text);margin-bottom:var(--sp-sm);">El plan general rige los turnos sin profesional asignado; el plan por profesional lo pisa cuando existe.</p>' +
      '<div id="plan-rows"></div>' +
      '<div id="plan-save-wrap" style="margin-top:var(--sp-sm);text-align:right;" hidden><button type="button" class="admin-btn admin-btn--solid" id="plan-save-all">Guardar cambios</button></div>' +
      '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Excepciones</h3><button type="button" class="admin-btn" id="exc-new">+ Nueva excepción</button></div>' +
      '<div id="exc-list"></div><div id="exc-form-wrap"></div>';

    $('plan-scope').addEventListener('change', function () {
      planScopeBarber = this.value;
      var saveWrap = $('plan-save-wrap');
      if (saveWrap) saveWrap.hidden = true;
      loadPlan(planScopeBarber).then(function (rows) { lastPlanRows = rows || []; paintPlanRows(); });
    });
    $('exc-new').addEventListener('click', renderExceptionForm);
  }

  function loadPlan(scopeId) {
    if (scopeId) return DB.getBarberPlan(scopeId);
    return DB.getWorkingPlan();
  }

  function planRowFor(dow) {
    for (var i = 0; i < lastPlanRows.length; i++) { if (Number(lastPlanRows[i].dow) === dow) return lastPlanRows[i]; }
    return null;
  }
  function timeToMin(t) { var p = String(t).split(':'); return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0); }

  function calcWeeklyCapacity() {
    var step = (CFG.booking && CFG.booking.slotStepMin) || 15;
    var total = 0;
    for (var d = 0; d <= 6; d++) {
      var row = planRowFor(d);
      if (!row || row.active === false) continue;
      var s = timeToMin(row.start_time || '09:00');
      var e = timeToMin(row.end_time || '19:00');
      if (e > s) total += Math.floor((e - s) / step);
    }
    return total;
  }

  function paintPlanRows() {
    var wrap = $('plan-rows');
    if (!wrap) return;
    var html = '';
    for (var dow = 0; dow <= 6; dow++) {
      var r = planRowFor(dow);
      var active = r ? r.active !== false : false;
      var start = ((r && r.start_time) || '09:00').slice(0, 5);
      var end = ((r && r.end_time) || '19:00').slice(0, 5);
      html += '<div class="admin-plan-row" data-dow="' + dow + '"><span class="admin-plan-row__day">' + DAY_NAMES[dow] + '</span>' +
        '<label class="admin-check admin-check--bare"><input type="checkbox" data-pactive' + (active ? ' checked' : '') + '> Activo</label>' +
        '<div class="admin-plan-row__times"><input type="time" data-pstart value="' + esc(start) + '"' + (active ? '' : ' disabled') + '>' +
        '<span aria-hidden="true">—</span><input type="time" data-pend value="' + esc(end) + '"' + (active ? '' : ' disabled') + '></div></div>';
    }
    wrap.innerHTML = html;

    var boxes = wrap.querySelectorAll('[data-pactive]');
    for (var b = 0; b < boxes.length; b++) {
      boxes[b].addEventListener('change', function () {
        var row = this.closest('.admin-plan-row');
        if (!row) return;
        var dis = !this.checked;
        row.querySelector('[data-pstart]').disabled = dis;
        row.querySelector('[data-pend]').disabled = dis;
        markPlanDirty();
      });
    }
    var timeInputs = wrap.querySelectorAll('input[type="time"]');
    for (var t = 0; t < timeInputs.length; t++) timeInputs[t].addEventListener('change', markPlanDirty);

    var saveWrap = $('plan-save-wrap');
    if (saveWrap) saveWrap.hidden = true;
    var saveAllBtn = $('plan-save-all');
    if (saveAllBtn) saveAllBtn.addEventListener('click', saveAllPlanDays);
  }

  function markPlanDirty() { var saveWrap = $('plan-save-wrap'); if (saveWrap) saveWrap.hidden = false; }

  function saveAllPlanDays() {
    var wrap = $('plan-rows');
    if (!wrap) return;
    var rows = wrap.querySelectorAll('.admin-plan-row');
    var promises = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var dow = Number(row.getAttribute('data-dow'));
      var patch = {
        active: row.querySelector('[data-pactive]').checked,
        start_time: row.querySelector('[data-pstart]').value,
        end_time: row.querySelector('[data-pend]').value
      };
      if (patch.active && !(patch.start_time && patch.end_time)) {
        toast('Completá hora de inicio y fin para ' + DAY_NAMES[dow] + '.', true);
        return;
      }
      promises.push(planScopeBarber ? DB.updateBarberPlanDay(planScopeBarber, dow, patch) : DB.updateGeneralPlanDay(dow, patch));
    }
    Promise.all(promises).then(function () {
      toast('Horarios guardados.');
      var saveWrap = $('plan-save-wrap');
      if (saveWrap) saveWrap.hidden = true;
    });
  }

  function renderExceptions() {
    var wrap = $('exc-list');
    if (!wrap) return;
    function barberName(id) {
      if (!id) return 'Todos';
      for (var i = 0; i < cachedBarbers.length; i++) { if (cachedBarbers[i].id === id) return cachedBarbers[i].name; }
      return 'Profesional';
    }
    var sorted = lastExceptions.slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    var today = todayISO();
    var future = sorted.filter(function (x) { return String(x.date) >= today; });
    if (!future.length) { wrap.innerHTML = '<div class="admin-empty">Sin excepciones próximas.</div>'; return; }

    var html = '<div class="admin-list">';
    for (var k = 0; k < future.length; k++) {
      var x = future[k];
      var detail = x.all_day ? 'Todo el día' : ((x.start_time || '').slice(0, 5) + '-' + (x.end_time || '').slice(0, 5));
      html += '<div class="admin-list__item"><div class="admin-item__main">' +
        '<div class="admin-item__name">' + esc(x.date) + ' · ' + esc(barberName(x.barber_id)) + '</div>' +
        '<div class="admin-item__meta">' + esc(detail) + (x.reason ? ' · ' + esc(x.reason) : '') + '</div></div>' +
        '<div class="admin-item__actions"><button type="button" class="admin-btn admin-btn--danger" data-exc-del="' + esc(x.id) + '">Quitar</button></div></div>';
    }
    wrap.innerHTML = html + '</div>';

    wirePairClicks(wrap, 'data-exc-del', function (id) {
      DB.deleteException(id).then(function () { toast('Excepción quitada.'); return DB.listExceptions(); })
        .then(function (list) { lastExceptions = list || []; renderExceptions(); });
    }, null, null);
  }

  function renderExceptionForm() {
    var wrap = $('exc-form-wrap');
    if (!wrap) return;
    if (wrap.innerHTML) { wrap.innerHTML = ''; return; }
    var opts = '<option value="">Todos</option>';
    for (var i = 0; i < cachedBarbers.length; i++) opts += '<option value="' + esc(cachedBarbers[i].id) + '">' + esc(cachedBarbers[i].name) + '</option>';

    wrap.innerHTML = '<form class="admin-form" id="exc-form">' +
      '<div><label for="x-date">Fecha *</label><input type="date" id="x-date" value="' + todayISO() + '" required></div>' +
      '<div><label for="x-barber">Profesional</label><select id="x-barber">' + opts + '</select></div>' +
      '<label class="admin-check"><input type="checkbox" id="x-allday" checked> Todo el día</label>' +
      '<div><label for="x-start">Desde</label><input type="time" id="x-start" disabled></div>' +
      '<div><label for="x-end">Hasta</label><input type="time" id="x-end" disabled></div>' +
      '<div class="admin-form__full"><label for="x-reason">Motivo</label><input type="text" id="x-reason" maxlength="120" placeholder="Feriado, licencia, evento…"></div>' +
      '<p class="admin-error-text" id="x-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="submit" class="admin-btn admin-btn--solid">Crear excepción</button></div></form>';

    $('x-allday').addEventListener('change', function () { $('x-start').disabled = this.checked; $('x-end').disabled = this.checked; });
    $('exc-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var xe = $('x-error');
      xe.hidden = true;
      var allDay = $('x-allday').checked;
      var body = { barber_id: $('x-barber').value || null, date: $('x-date').value, all_day: allDay, start_time: allDay ? null : $('x-start').value, end_time: allDay ? null : $('x-end').value, reason: $('x-reason').value.trim() || null };
      if (!body.date || (!allDay && !(body.start_time && body.end_time))) { xe.textContent = 'Fecha obligatoria; si no es todo el día, franja completa.'; xe.hidden = false; return; }
      DB.createException(body).then(function () { toast('Excepción creada.'); wrap.innerHTML = ''; return DB.listExceptions(); })
        .then(function (list) { lastExceptions = list || []; renderExceptions(); });
    });
  }

  // --------------------------------------------------- notificaciones

  function startPoll() {
    stopPoll();
    notifSeedBaseline();
    pollTimer = setInterval(pollNotif, 45000);
    root.addEventListener('storage', onStorageChange);
    doc.addEventListener('visibilitychange', onVisibilityChange);
  }
  function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    root.removeEventListener('storage', onStorageChange);
    doc.removeEventListener('visibilitychange', onVisibilityChange);
  }
  function onStorageChange(ev) {
    if (ev.key && ev.key.indexOf(SLUG + '_db_appointments') === 0) pollNotif();
  }
  function onVisibilityChange() {
    if (doc.hidden) { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } return; }
    if (!pollTimer) { pollNotif(); pollTimer = setInterval(pollNotif, 45000); }
  }
  function notifSeedBaseline() {
    DB.listAppointments({ date: todayISO(), status: 'pending' }).then(function (list) {
      for (var i = 0; i < (list || []).length; i++) knownPending[list[i].id] = true;
      notifReady = true;
    });
  }
  function pollNotif() {
    if (!loggedIn) return;
    DB.listAppointments({ date: todayISO(), status: 'pending' }).then(function (list) {
      var pend = 0, fresh = [];
      for (var i = 0; i < (list || []).length; i++) {
        pend++;
        if (notifReady && !knownPending[list[i].id]) fresh.push(list[i]);
        knownPending[list[i].id] = true;
      }
      notifReady = true;
      if (currentTab !== 'dashboard') updateBadge(pend);
      if (fresh.length) { notifShowBanner(fresh); reloadDashboard(); }
    });
  }
  function notifInitUI() {
    var cta = $('notif-banner-cta'), close = $('notif-banner-close');
    if (cta) cta.addEventListener('click', function () { notifHideBanner(); if (currentTab !== 'dashboard') switchTab('dashboard'); else reloadDashboard(); });
    if (close) close.addEventListener('click', notifHideBanner);
    var unlock = function () { notifEnsureAudio(); notifSafeResume(); doc.removeEventListener('pointerdown', unlock); doc.removeEventListener('keydown', unlock); };
    doc.addEventListener('pointerdown', unlock);
    doc.addEventListener('keydown', unlock);
    syncSoundToggle();
  }
  function syncSoundToggle() {
    var btn = $('btn-sound-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(!notifMuted));
    btn.classList.toggle('is-muted', notifMuted);
  }
  function toggleNotifSound() {
    notifMuted = !notifMuted;
    try { root.localStorage.setItem(NOTIF_MUTED_KEY, notifMuted ? '1' : '0'); } catch (e) {}
    syncSoundToggle();
    toast(notifMuted ? 'Sonido silenciado.' : 'Sonido activado.');
  }

  // ------------------------------------------------------------------- boot

  function initDateNav() {
    var prevBtn = $('dash-date-prev'), nextBtn = $('dash-date-next'), todayBtn = $('dash-date-today');
    if (prevBtn) prevBtn.onclick = function () { apptDate = addDaysISO(apptDate, -1); reloadDashboard(); };
    if (nextBtn) nextBtn.onclick = function () { apptDate = addDaysISO(apptDate, 1); reloadDashboard(); };
    if (todayBtn) todayBtn.onclick = function () { apptDate = todayISO(); reloadDashboard(); };
  }

  function init() {
    if (!DB) { showLogin('Módulo de datos no disponible.'); return; }
    initLogin();
    initTabs();
    var soundBtn = $('btn-sound-toggle');
    if (soundBtn) soundBtn.addEventListener('click', toggleNotifSound);

    var hasSession = false;
    try { hasSession = root.sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) {}
    if (hasSession) enterPanel(); else showLogin(null);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
}(typeof window !== 'undefined' ? window : this));
