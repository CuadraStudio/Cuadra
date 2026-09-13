/**
 * demoAgenda_static_site - Panel de administracion (admin.html)
 * Rediseño mobile-first: Dashboard operativo + Vista semanal.
 *
 * Alcance:
 *   Login por PIN (loginPin -> token en sessionStorage; TTL server 12h)
 *   Dashboard:  operación del día, equipo en salón, servicios del día, agenda
 *   Semana:     navegación por semana, vista expandible por día, totales
 *   Servicios:  CRUD completo (contrato snake_case bilingüe)
 *   Equipo:     CRUD de barberos + activo/inactivo
 *   Horarios:   plan general, plan por barbero (+reset), excepciones
 *   Notif:      polling liviano (60s) -> toast ante nueva reserva pendiente
 *
 * Reglas: escape HTML SIEMPRE para datos remotos; sesion expirada ->
 * volver al login con mensaje; jamas se expone el token.
 */
(function (root) {
  'use strict';

  var A = root.CCESCO_ADMIN || null;
  var doc = document;

  var TOKEN_KEY = 'ccesco_admin_token';
  var POLL_MS = 60000;

  var token = '';
  try { token = root.sessionStorage.getItem(TOKEN_KEY) || ''; } catch (e) { /* sin storage */ }

  /* Modo vista (solo lectura): se activa cuando la sesión entra con el PIN
   * demo (cfg.demo.pin → token demo local). Toda acción mutadora pasa por
   * guardWrite(); los modales/botones siguen explorables, el bloqueo ocurre
   * al EJECUTAR (submit/acción). El banner #viewer-banner lo anuncia. */
  var VIEW_MODE = false;

  var currentTab = 'dashboard';
  var apptDate = todayISO();
  var barberFilter = '';
  var undoTimer = null;
  var undoData = null;
  var deletedCache = [];
  var DELETED_KEY = 'ccesco_deleted_appts';
  var editingServiceId = null;
  var editingBarberId = null;
  var planScopeBarber = '';
  var knownPending = {};
  var notifReady = false;
  var pollTimer = null;
  var notifInFlight = false;
  var notifAudioCtx = null;
  var notifAudioOk = false;
  var notifCurrent = [];
  var notifKnownIds = {};
  var notifStarted = false;
  var NOTIF_MUTED_KEY = 'ccesco_notif_muted';
  var notifMuted = false;
  try { notifMuted = root.localStorage.getItem(NOTIF_MUTED_KEY) === '1'; } catch (e) { /* noop */ }

  /* Week state */
  var weekStart = mondayOf(todayISO());
  var openDays = {};       /* dateStr -> true for expanded days in week view */

  var cachedBarbers = [];
  var lastServices = [];
  var lastPlanRows = [];
  var lastExceptions = [];

  var DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  var DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
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
    return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' de ' +
      d.toLocaleDateString('es-UY', { month: 'long' }) +
      (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
  }

  function fmtDateShort(iso) {
    var d = new Date(iso + 'T12:00:00');
    return d.getDate() + ' ' + MONTH_SHORT[d.getMonth()];
  }

  function formatRange(ws) {
    var mon = new Date(ws + 'T12:00:00');
    var sun = new Date(addDaysISO(ws, 6) + 'T12:00:00');
    return DAY_SHORT[mon.getDay()] + ' ' + mon.getDate() + ' ' + MONTH_SHORT[mon.getMonth()] +
      ' – ' + DAY_SHORT[sun.getDay()] + ' ' + sun.getDate() + ' ' + MONTH_SHORT[sun.getMonth()] + ' ' + sun.getFullYear();
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmtPrice(n) { return '$ ' + (Number(n) || 0); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Normaliza el contrato del server: los turnos llegan con `provider`
   *  poblado y sin `barber`. El frontend lee `a.barber` en varios lugares;
   *  acá mapeamos provider → barber cuando barber falte. */
  function normalizeAppts(list) {
    if (!list) { return list; }
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a && !a.barber && a.provider) { a.barber = a.provider; }
    }
    return list;
  }

  var toastTimer = null;
  function toast(msg, isError) {
    var t = $('toast');
    if (!t) { return; }
    t.textContent = isError ? 'Error: ' + msg : msg;
    t.className = 'admin-toast' + (isError ? ' admin-toast--error' : '');
    t.hidden = false;
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { t.hidden = true; }, isError ? 5200 : 3200);
  }

  /** Choke point de escrituras en modo vista: con VIEW_MODE activo, avisa
   *  con toast y devuelve false para abortar la mutación. Todo submit y
   *  botón que escriba (turnos, servicios, barberos, plan, excepciones)
   *  debe llamarlo al EJECUTAR. Leer, navegar, tabs y logout quedan libres. */
  function guardWrite() {
    if (!VIEW_MODE) { return true; }
    toast('Modo demo: solo lectura — mirá todo, pero no se guardan cambios');
    return false;
  }

  /** Muestra/oculta el banner #viewer-banner según VIEW_MODE y ajusta el
   *  offset sticky del topbar (el banner queda fijo arriba, el topbar debajo). */
  function applyViewMode() {
    var banner = $('viewer-banner');
    if (banner) { banner.hidden = !VIEW_MODE; }
    var panel = $('view-panel');
    if (panel) {
      var offset = (!VIEW_MODE || !banner || banner.hidden) ? '0px' : (banner.offsetHeight + 'px');
      panel.style.setProperty('--viewer-banner-offset', offset);
      panel.classList.toggle('has-viewer-banner', VIEW_MODE);
    }
  }

  (function () {
    var t = $('toast');
    if (!t) { return; }
    t.style.cursor = 'pointer';
    t.setAttribute('role', 'status');
    t.addEventListener('click', function () {
      t.hidden = true;
      if (toastTimer) { clearTimeout(toastTimer); }
    });
  })();

  // ------------------------------------------------------------------ audio
  function notifEnsureAudio() {
    if (notifAudioCtx) { return; }
    try {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) { notifAudioOk = false; return; }
      notifAudioCtx = new AC();
      notifAudioOk = true;
    } catch (e) {
      notifAudioOk = false;
    }
  }

  function notifSafeResume() {
    if (!notifAudioCtx) { return; }
    try {
      var r = notifAudioCtx.resume();
      if (r && typeof r.catch === 'function') { r.catch(function () { /* noop */ }); }
    } catch (e) { /* noop */ }
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
      osc.connect(gain);
      gain.connect(notifAudioCtx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    } catch (e) { /* noop */ }
  }

  function notifPlayDing() {
    if (notifMuted || !notifAudioOk || !notifAudioCtx) { return; }
    try {
      notifSafeResume();
      var t = notifAudioCtx.currentTime;
      notifTone(880, t, 0.15, 0.3);
      notifTone(1170, t + 0.18, 0.18, 0.22);
    } catch (e) {
      notifAudioOk = false;
    }
  }

  function notifShowBanner(fresh) {
    var banner = $('notif-banner');
    var titleEl = $('notif-banner-title');
    var listEl = $('notif-banner-list');
    if (!banner || !titleEl || !listEl) { return; }
    titleEl.textContent = fresh.length === 1
      ? '!Nueva reserva!'
      : '!' + fresh.length + ' reservas nuevas!';
    var html = '';
    for (var i = 0; i < fresh.length; i++) {
      var a = fresh[i];
      var svcName = a.service && a.service.name_es ? a.service.name_es : 'Servicio';
      var dayStr = a.date ? fmtDateShort(a.date) : '';
      html += '<li><strong>' + esc(a.client_name) + '</strong> \u00b7 ' + esc(svcName) +
        ' \u00b7 ' + esc(dayStr) + ' ' + esc(a.time) + '</li>';
    }
    listEl.innerHTML = html;
    banner.hidden = false;
    banner.classList.remove('admin-notif-banner--in');
    void banner.offsetWidth;
    banner.classList.add('admin-notif-banner--in');
    notifPlayDing();
  }

  function notifHideBanner() {
    var banner = $('notif-banner');
    if (banner) { banner.hidden = true; }
  }

  function api(fn) {
    return fn().catch(function (err) {
      var code = err && err.code;
      if (code === 'UNAUTHORIZED' || code === 'INVALID_TOKEN' || err.status === 401) {
        expireSession();
      }
      throw err;
    });
  }

  function expireSession() {
    stopPoll();
    token = '';
    try { root.sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* noop */ }
    VIEW_MODE = false;
    applyViewMode();
    showLogin('Tu sesion expiro. Ingresa tu PIN nuevamente.');
  }

  function updateBadge(pendingCount) {
    var b = $('badge-week');
    if (!b) { return; }
    if (pendingCount > 0) { b.textContent = String(pendingCount); b.hidden = false; }
    else { b.hidden = true; }
  }

  // ---------------------------------------------------------- login/logout

  function initLogin() {
    $('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var pin = $('login-pin').value.trim();
      hideErr();
      if (!pin) { showErr('Ingresa el PIN de acceso.'); return; }
      var btn = $('btn-login-submit');
      btn.disabled = true;
      btn.textContent = 'Verificando...';

      A.loginPin(pin).then(function (res) {
        token = (res && res.token) || '';
        VIEW_MODE = !!(root.CCESCO_CONFIG && root.CCESCO_CONFIG.demo &&
          pin === String(root.CCESCO_CONFIG.demo.pin));
        try { root.sessionStorage.setItem(TOKEN_KEY, token); } catch (e2) { /* noop */ }
        $('login-pin').value = '';
        enterPanel();
      }).catch(function (err) {
        showErr(err && err.code === 'INVALID_PIN'
          ? 'PIN incorrecto.'
          : 'No pudimos conectar. Intenta de nuevo en unos minutos.');
      }).then(function () {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      });
    });

    $('btn-logout').addEventListener('click', logout);
  }

  function logout() {
    stopPoll();
    notifHideBanner();
    notifCurrent = [];
    notifKnownIds = {};
    notifStarted = false;
    token = '';
    try { root.sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* noop */ }
    VIEW_MODE = false;
    applyViewMode();
    showLogin(null);
  }

  function showErr(msg) { var e = $('login-error'); e.textContent = msg; e.hidden = false; }
  function hideErr() { $('login-error').hidden = true; }

  function showLogin(message) {
    $('view-panel').hidden = true;
    $('view-login').hidden = false;
    if (message) { showErr(message); } else { hideErr(); }
    try { $('login-pin').focus(); } catch (e) { /* noop */ }
  }

  function enterPanel() {
    $('view-login').hidden = true;
    $('view-panel').hidden = false;
    applyViewMode();
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
    /* Bottom nav items */
    var items = doc.querySelectorAll('.admin-bottomnav__item');
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function () {
        switchTab(this.getAttribute('data-tab'));
      });
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
    if (name === 'dashboard') { reloadDashboard(); }
    if (name === 'semana') { reloadWeek(); }
    if (name === 'servicios') { reloadServicios(); }
    if (name === 'equipo') { reloadEquipo(); }
    if (name === 'horarios') { reloadHorarios(); }

    /* Focus management */
    var activeSection = doc.querySelector('.admin-section.is-active');
    if (activeSection) {
      var heading = activeSection.querySelector('h2, h3');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }
  }

  function wireDashNewAppt() {
    var newBtn = $('dash-new-appt');
    if (!newBtn || newBtn._wired) { return; }
    newBtn._wired = true;
    newBtn.addEventListener('click', function () {
      renderNewApptForm();
    });
  }

  function sectionEl(name) { return $('tab-' + name); }

  // ============================================================ DASHBOARD

  function reloadDashboard() {
    var sec = sectionEl('dashboard');
    if (!sec) { return; }

    /* Set date subtitle */
    var sub = $('dash-date-sub');
    if (sub) { sub.textContent = cap(fmtDateLong(apptDate)); }

    /* Show loading */
    setDashKPIs('—', '—', '—', '—');
    $('dash-team').innerHTML = '<p class="admin-loading">Cargando…</p>';
    $('dash-services').innerHTML = '';
    $('dash-appointments').innerHTML = '';

    /* Load deleted appointments from localStorage */
    loadDeleted();

    Promise.all([
      api(function () { return A.listAppointments(token, { date: apptDate }); }),
      api(function () { return A.listBarbers(token); }),
      api(function () { return A.listServices(token); }),
      api(function () { return A.listAppointments(token, { dateFrom: weekStart, dateTo: addDaysISO(weekStart, 6) }); }),
      loadPlan('').catch(function () { return []; })
    ]).then(function (res) {
      var todayList = normalizeAppts(res[0] || []);
      cachedBarbers = res[1] || [];
      lastServices = res[2] || [];
      var weekList = normalizeAppts(res[3] || []);
      lastPlanRows = res[4] || [];
      renderDashboard(todayList, weekList);
    }).catch(function (err) {
      if (!token) { return; }
      $('dash-team').innerHTML = '<div class="admin-empty">No pudimos cargar la operación.</div>';
    });
  }

  function setDashKPIs(total, pending, confirmed, weekPct) {
    var el;
    el = $('kpi-today-count'); if (el) { el.textContent = total; }
    el = $('kpi-pending'); if (el) { el.textContent = pending; }
    el = $('kpi-confirmed'); if (el) { el.textContent = confirmed; }
    el = $('kpi-week-pct'); if (el) { el.textContent = weekPct; }
  }

  function renderDashboard(todayList, weekList) {
    /* --- KPIs --- */
    var counts = { total: todayList.length, pending: 0, confirmed: 0, cancelled: 0 };
    for (var i = 0; i < todayList.length; i++) {
      if (counts[todayList[i].status] !== undefined) { counts[todayList[i].status]++; }
    }
    updateBadge(counts.pending);

    /* Week occupancy — real capacity-based metric */
    var weekConfirmed = 0;
    for (var w = 0; w < weekList.length; w++) {
      if (weekList[w].status === 'confirmed') { weekConfirmed++; }
    }
    var weeklyCap = calcWeeklyCapacity();
    var weekPct = weeklyCap > 0
      ? Math.round((weekConfirmed / weeklyCap) * 100) + '%'
      : '—';

    setDashKPIs(String(counts.total), String(counts.pending), String(counts.confirmed), weekPct);

    /* --- Team cards --- */
    renderDashTeam(todayList);

    /* --- Service breakdown --- */
    renderDashServices(todayList);

    /* --- Appointment list --- */
    renderDashAppointments(todayList);
  }

  function renderDashTeam(list) {
    var teamMap = {};
    for (var i = 0; i < cachedBarbers.length; i++) {
      var b = cachedBarbers[i];
      if (b.active === false) { continue; }
      teamMap[b.id] = { name: b.name, role: b.role || 'Barbero', count: 0, services: {} };
    }
    /* Count appointments per barber */
    for (var j = 0; j < list.length; j++) {
      var a = list[j];
      var bId = a.barber && a.barber.id ? a.barber.id : '_general';
      if (!teamMap[bId]) {
        teamMap[bId] = { name: a.barber && a.barber.name ? a.barber.name : 'General', role: 'Barbero', count: 0, services: {} };
      }
      teamMap[bId].count++;
      var svcName = a.service && a.service.name_es ? a.service.name_es : 'Servicio';
      teamMap[bId].services[svcName] = (teamMap[bId].services[svcName] || 0) + 1;
    }

    var container = $('dash-team');
    var html = '';
    var keys = Object.keys(teamMap);
    if (!keys.length) {
      html = '<p class="admin-empty">Sin barberos activos.</p>';
    } else {
      for (var k = 0; k < keys.length; k++) {
        var tm = teamMap[keys[k]];
        html += '<div class="admin-team-card">' +
          '<div class="admin-team-card__info">' +
          '<div class="admin-team-card__name">' + esc(tm.name) + '</div>' +
          '<div class="admin-team-card__role">' + esc(tm.role) + '</div>' +
          '</div>' +
          '<div class="admin-team-card__stat">' +
          '<span class="admin-team-card__count">' + tm.count + '</span>' +
          '<span class="admin-team-card__label">' + (tm.count === 1 ? 'turno' : 'turnos') + '</span>' +
          '</div></div>';
      }
    }
    container.innerHTML = html;
  }

  function renderDashServices(list) {
    var svcMap = {};
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.status !== 'confirmed') { continue; }
      var svcName = a.service && a.service.name_es ? a.service.name_es : 'Sin servicio';
      if (!svcMap[svcName]) { svcMap[svcName] = 0; }
      svcMap[svcName]++;
    }

    var container = $('dash-services');
    var html = '';
    var keys = Object.keys(svcMap);
    if (!keys.length) {
      html = '<p class="admin-empty">Sin servicios confirmados hoy.</p>';
    } else {
      /* Sort by count desc */
      keys.sort(function (a, b) { return svcMap[b] - svcMap[a]; });
      for (var k = 0; k < keys.length; k++) {
        var num = String(k + 1).padStart(2, '0');
        html += '<div class="admin-svc-card">' +
          '<span class="admin-svc-card__index">' + num + '</span>' +
          '<span class="admin-svc-card__name">' + esc(keys[k]) + '</span>' +
          '<span class="admin-svc-card__count">' + svcMap[keys[k]] + '</span>' +
          '</div>';
      }
    }
    container.innerHTML = html;
  }

  function renderDashAppointments(list) {
    var container = $('dash-appointments');
    if (!list.length) {
      container.innerHTML = '<div class="admin-empty">Sin turnos para ' + fmtDateShort(apptDate) + '.</div>';
      renderDeletedSection();
      return;
    }

    /* Sort by time */
    list.sort(function (a, b) {
      return String(a.time || '').localeCompare(String(b.time || ''));
    });

    var html = '<div class="admin-dash-appts">';
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var svcName = a.service && a.service.name_es ? a.service.name_es : '(servicio eliminado)';
      var barberName = a.barber && a.barber.name ? a.barber.name : 'General';
      var chipCls = a.status === 'confirmed' ? ' admin-chip--ok'
        : (a.status === 'cancelled' ? ' admin-chip--danger' : ' admin-chip--warn');

      var actions = '';
      if (a.status === 'pending') {
        actions += dashActBtn(a.id, 'confirm', 'Confirmar');
      }
      if (a.status !== 'cancelled') {
        actions += dashActBtn(a.id, 'cancel', 'Cancelar');
      } else {
        actions += dashActBtn(a.id, 'pending', 'Reactivar');
      }
      actions += dashActBtn(a.id, 'edit', 'Editar');
      actions += dashActBtn(a.id, 'delete', 'Eliminar');

      html += '<div class="admin-dash-appt" data-appt-id="' + esc(a.id) + '">' +
        '<time class="admin-dash-appt__time" datetime="' + esc(a.date) + 'T' + esc(a.time) + '">' + esc(a.time) + '</time>' +
        '<div class="admin-dash-appt__info">' +
        '<div class="admin-dash-appt__name">' + esc(a.client_name) + '</div>' +
        '<div class="admin-dash-appt__meta">' + esc(svcName) + ' · ' + esc(barberName) +
        (a.client_phone ? ' · ' + esc(a.client_phone) : '') + '</div>' +
        '</div>' +
        '<span class="admin-chip' + chipCls + '">' + (STATUS_LABELS[a.status] || esc(a.status)) + '</span>' +
        '<div class="admin-dash-appt__actions">' + actions + '</div>' +
        '</div>';
    }
    html += '</div>';
    container.innerHTML = html;

    /* Wire action buttons */
    var btns = container.querySelectorAll('[data-appt]');
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', function () {
        handleDashAction(this.getAttribute('data-do'), this.getAttribute('data-appt'));
      });
    }

    renderDeletedSection();
  }

  function dashActBtn(id, action, label) {
    return '<button type="button" class="admin-btn" data-appt="' + esc(id) +
      '" data-do="' + action + '">' + label + '</button>';
  }

  function handleDashAction(action, id) {
    if (!id) { return; }
    if (action === 'edit') { openEditAppt(id); return; }
    if (action === 'delete') { confirmDeleteAppt(id); return; }
    var p;
    if (action === 'confirm' || action === 'cancel' || action === 'pending') {
      if (!guardWrite()) { return; }
      if (action === 'confirm') { p = A.updateAppointmentStatus(token, id, 'confirmed'); }
      else if (action === 'cancel') { p = A.updateAppointmentStatus(token, id, 'cancelled'); }
      else if (action === 'pending') { p = A.updateAppointmentStatus(token, id, 'pending'); }
    } else { return; }

    p.then(function () {
      toast(action === 'confirm' ? 'Turno confirmado.' : (action === 'cancel' ? 'Turno cancelado.' : 'Turno reactivado.'));
      reloadDashboard();
    }).catch(function (err) {
      toast('No pudimos actualizar el turno.', true);
    });
  }

  // ------------------------------------------- edit appointment

  function openEditAppt(id) {
    /* Find the appointment from the last fetched list */
    var appt = null;
    api(function () { return A.listAppointments(token, { date: apptDate }); })
      .then(function (list) {
        list = normalizeAppts(list) || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === id) { appt = list[i]; break; }
        }
        if (!appt) { toast('No encontramos el turno.', true); return; }
        renderApptEditForm(appt);
      })
      .catch(function () { toast('No pudimos cargar los datos del turno.', true); });
  }

  /* ------------------------------------------------------------------ new appointment form */

  function renderNewApptForm() {
    var overlay = $('appt-edit-overlay');
    if (!overlay) { return; }

    /* Build service options */
    var svcOpts = '';
    for (var i = 0; i < lastServices.length; i++) {
      var s = lastServices[i];
      if (s.active === false) { continue; }
      svcOpts += '<option value="' + esc(s.id) + '">' + esc(s.name_es) + ' — $' + (Number(s.price) || 0) + '</option>';
    }
    if (!svcOpts) {
      svcOpts = '<option value="" disabled selected>Sin servicios disponibles</option>';
    }

    /* Build barber options */
    var bbOpts = '<option value="">Sin barbero</option>';
    for (var j = 0; j < cachedBarbers.length; j++) {
      var b = cachedBarbers[j];
      if (b.active === false) { continue; }
      bbOpts += '<option value="' + esc(b.id) + '">' + esc(b.name) + '</option>';
    }

    overlay.innerHTML = '<div class="admin-appt-form">' +
      '<div class="admin-appt-form__title">Nuevo turno</div>' +
      '<form id="appt-new-form" class="admin-form">' +
      '<div class="admin-form__full"><label for="an-name">Cliente *</label>' +
      '<input type="text" id="an-name" maxlength="60" required></div>' +
      '<div><label for="an-phone">Telefono</label>' +
      '<input type="text" id="an-phone" maxlength="20"></div>' +
      '<div><label for="an-svc">Servicio *</label>' +
      '<select id="an-svc" required>' + svcOpts + '</select></div>' +
      '<div><label for="an-barber">Barbero</label>' +
      '<select id="an-barber">' + bbOpts + '</select></div>' +
      '<div><label for="an-date">Fecha *</label>' +
      '<input type="date" id="an-date" value="' + esc(apptDate) + '" required></div>' +
      '<div><label for="an-time">Hora *</label>' +
      '<input type="time" id="an-time" required></div>' +
      '<div class="admin-form__full"><label for="an-note">Nota (opcional)</label>' +
      '<textarea id="an-note" rows="2" maxlength="200"></textarea></div>' +
      '<p class="admin-error-text" id="an-error" hidden></p>' +
      '<div class="admin-form__actions">' +
      '<button type="button" class="admin-btn admin-btn--ghosted" id="an-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">Crear turno</button>' +
      '</div></form></div>';

    overlay.hidden = false;

    $('an-cancel').addEventListener('click', function () { overlay.hidden = true; overlay.innerHTML = ''; });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { overlay.hidden = true; overlay.innerHTML = ''; }
    });

    try { $('an-name').focus(); } catch (e) { /* noop */ }

    $('appt-new-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('an-error');
      fe.hidden = true;

      var payload = {
        service_id: $('an-svc').value,
        provider_id: $('an-barber').value || null,
        date: $('an-date').value,
        time: $('an-time').value,
        client_name: $('an-name').value.trim(),
        client_phone: $('an-phone').value.trim(),
        note: $('an-note').value.trim(),
        status: 'pending',
        source: 'admin'
      };

      if (!payload.client_name) {
        fe.textContent = 'Ingresa el nombre del cliente.';
        fe.hidden = false;
        return;
      }
      if (!payload.service_id) {
        fe.textContent = 'Selecciona un servicio.';
        fe.hidden = false;
        return;
      }
      if (!payload.date || !payload.time) {
        fe.textContent = 'Ingresa la fecha y hora.';
        fe.hidden = false;
        return;
      }

      if (!guardWrite()) { return; }

      api(function () { return A.createAppointmentAdmin(token, payload); }).then(function () {
        toast('Turno creado.');
        overlay.hidden = true;
        overlay.innerHTML = '';
        reloadDashboard();
      }).catch(function (err) {
        fe.textContent = err && err.code === 'SLOT_TAKEN'
          ? 'Ese horario ya esta ocupado.'
          : 'No pudimos crear el turno.';
        fe.hidden = false;
      });
    });
  }

  function renderApptEditForm(appt) {
    var overlay = $('appt-edit-overlay');
    if (!overlay) { return; }

    /* Build service options */
    var svcOpts = '';
    for (var i = 0; i < lastServices.length; i++) {
      var s = lastServices[i];
      svcOpts += '<option value="' + esc(s.id) + '"' + (s.id === (appt.service && appt.service.id) ? ' selected' : '') + '>' + esc(s.name_es) + ' — $' + (Number(s.price) || 0) + '</option>';
    }

    /* Build barber options */
    var bbOpts = '<option value="">Sin barbero</option>';
    for (var j = 0; j < cachedBarbers.length; j++) {
      var b = cachedBarbers[j];
      if (b.active === false) { continue; }
      bbOpts += '<option value="' + esc(b.id) + '"' + (b.id === (appt.barber && appt.barber.id) ? ' selected' : '') + '>' + esc(b.name) + '</option>';
    }

    overlay.innerHTML = '<div class="admin-appt-form">' +
      '<div class="admin-appt-form__title">Editar turno</div>' +
      '<form id="appt-edit-form" class="admin-form">' +
      '<div class="admin-form__full"><label for="ae-name">Cliente *</label>' +
      '<input type="text" id="ae-name" maxlength="60" value="' + esc(appt.client_name) + '" required></div>' +
      '<div><label for="ae-phone">Telefono</label>' +
      '<input type="text" id="ae-phone" maxlength="20" value="' + esc(appt.client_phone || '') + '"></div>' +
      '<div><label for="ae-svc">Servicio *</label>' +
      '<select id="ae-svc" required>' + svcOpts + '</select></div>' +
      '<div><label for="ae-barber">Barbero</label>' +
      '<select id="ae-barber">' + bbOpts + '</select></div>' +
      '<div><label for="ae-date">Fecha *</label>' +
      '<input type="date" id="ae-date" value="' + esc(appt.date) + '" required></div>' +
      '<div><label for="ae-time">Hora *</label>' +
      '<input type="time" id="ae-time" value="' + esc((appt.time || '').slice(0, 5)) + '" required></div>' +
      '<div><label for="ae-status">Estado</label>' +
      '<select id="ae-status">' +
      '<option value="pending"' + (appt.status === 'pending' ? ' selected' : '') + '>Pendiente</option>' +
      '<option value="confirmed"' + (appt.status === 'confirmed' ? ' selected' : '') + '>Confirmado</option>' +
      '<option value="cancelled"' + (appt.status === 'cancelled' ? ' selected' : '') + '>Cancelado</option>' +
      '</select></div>' +
      '<div class="admin-form__full"><label for="ae-note">Nota (opcional)</label>' +
      '<textarea id="ae-note" rows="2" maxlength="200">' + esc(appt.note || '') + '</textarea></div>' +
      '<p class="admin-error-text" id="ae-error" hidden></p>' +
      '<div class="admin-form__actions">' +
      '<button type="button" class="admin-btn admin-btn--ghosted" id="ae-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">Guardar cambios</button>' +
      '</div></form></div>';

    overlay.hidden = false;

    $('ae-cancel').addEventListener('click', function () { overlay.hidden = true; overlay.innerHTML = '';
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { overlay.hidden = true; overlay.innerHTML = ''; }
    });

    $('appt-edit-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('ae-error');
      fe.hidden = true;
      var newStatus = $('ae-status').value;

      var clientName = $('ae-name').value.trim();
      var serviceId = $('ae-svc').value;
      var date = $('ae-date').value;
      var time = $('ae-time').value;

      if (!clientName) {
        fe.textContent = 'Ingresa el nombre del cliente.';
        fe.hidden = false;
        return;
      }
      if (!serviceId) {
        fe.textContent = 'Selecciona un servicio.';
        fe.hidden = false;
        return;
      }
      if (!date || !time) {
        fe.textContent = 'Ingresa la fecha y hora.';
        fe.hidden = false;
        return;
      }

      var patch = {
        client_name: clientName,
        client_phone: $('ae-phone').value.trim(),
        service_id: serviceId,
        provider_id: $('ae-barber').value || null,
        date: date,
        time: time,
        note: $('ae-note').value.trim() || null,
        allowPast: true
      };

      if (!guardWrite()) { return; }

      /* First update the appointment fields, then update status if changed */
      var ops = [api(function () { return A.updateAppointment(token, appt.id, patch); })];
      if (newStatus !== appt.status) {
        ops.push(api(function () { return A.updateAppointmentStatus(token, appt.id, newStatus); }));
      }

      Promise.all(ops).then(function () {
        toast('Turno actualizado.');
        overlay.hidden = true;
        overlay.innerHTML = '';
        reloadDashboard();
      }).catch(function (err) {
        fe.textContent = err && err.code === 'SLOT_TAKEN'
          ? 'Ese horario ya esta ocupado.'
          : 'No pudimos guardar los cambios.';
        fe.hidden = false;
      });
    });
  }

  // ------------------------------------------- delete appointment (with undo)

  function confirmDeleteAppt(id) {
    if (!guardWrite()) { return; }
    /* Find appointment data */
    api(function () { return A.listAppointments(token, { date: apptDate }); })
      .then(function (list) {
        list = normalizeAppts(list) || [];
        var appt = null;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === id) { appt = list[i]; break; }
        }
        if (!appt) { toast('No encontramos el turno.', true); return; }
        performDeleteAppt(appt);
      })
      .catch(function () { toast('No pudimos cargar los datos del turno.', true); });
  }

  function performDeleteAppt(appt) {
    /* Cache for undo */
    undoData = {
      id: appt.id,
      date: appt.date,
      time: appt.time,
      client_name: appt.client_name,
      client_phone: appt.client_phone || '',
      status: appt.status,
      service_id: appt.service && appt.service.id ? appt.service.id : null,
      barber_id: appt.barber && appt.barber.id ? appt.barber.id : null,
      note: appt.note || null,
      service: appt.service || null,
      barber: appt.barber || null
    };

    /* Perform server delete */
    api(function () { return A.deleteAppointment(token, appt.id); })
      .then(function () {
        /* Save to deleted cache for recovery */
        saveDeleted(undoData);
        showUndoToast('Turno eliminado.');
        reloadDashboard();
      })
      .catch(function () {
        toast('No pudimos eliminar el turno.', true);
        undoData = null;
      });
  }

  function showUndoToast(msg) {
    var t = $('toast');
    if (!t) { return; }
    t.innerHTML = '<span class="admin-toast__msg">' + esc(msg) + '</span>' +
      '<button type="button" class="admin-toast__undo" id="toast-undo-btn">Deshacer</button>';
    t.className = 'admin-toast admin-toast--undo';
    t.hidden = false;
    if (undoTimer) { clearTimeout(undoTimer); }

    var undoBtn = $('toast-undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', function () {
        if (!undoData) { return; }
        recoverAppointment(undoData);
        t.hidden = true;
        if (undoTimer) { clearTimeout(undoTimer); }
      });
    }

    undoTimer = setTimeout(function () {
      t.hidden = true;
      undoData = null;
    }, 8000);
  }

  function recoverAppointment(data) {
    if (!data) { return; }
    if (!guardWrite()) { return; }
    var doc = {
      service_id: data.service_id,
      provider_id: data.barber_id,
      date: data.date,
      time: data.time,
      client_name: data.client_name,
      client_phone: data.client_phone,
      note: data.note,
      status: data.status || 'pending',
      allowPast: true,
      source: 'admin_recover'
    };
    api(function () { return A.createAppointmentAdmin(token, doc); })
      .then(function () {
        /* Remove from deleted cache */
        removeDeleted(data.id);
        toast('Turno recuperado.');
        reloadDashboard();
      })
      .catch(function () {
        toast('No pudimos recuperar el turno.', true);
      });
  }

  // ------------------------------------------- deleted appointments persistence

  function loadDeleted() {
    try {
      deletedCache = JSON.parse(root.localStorage.getItem(DELETED_KEY) || '[]');
    } catch (e) { deletedCache = []; }
  }

  function saveDeleted(appt) {
    loadDeleted();
    /* Avoid duplicates */
    for (var i = 0; i < deletedCache.length; i++) {
      if (deletedCache[i].id === appt.id) { return; }
    }
    deletedCache.push(appt);
    try { root.localStorage.setItem(DELETED_KEY, JSON.stringify(deletedCache)); } catch (e) { /* noop */ }
  }

  function removeDeleted(id) {
    loadDeleted();
    var filtered = [];
    for (var i = 0; i < deletedCache.length; i++) {
      if (deletedCache[i].id !== id) { filtered.push(deletedCache[i]); }
    }
    deletedCache = filtered;
    try { root.localStorage.setItem(DELETED_KEY, JSON.stringify(deletedCache)); } catch (e) { /* noop */ }
  }

  function renderDeletedSection() {
    var sec = sectionEl('dashboard');
    if (!sec) { return; }

    /* Find or create the deleted section container */
    var delContainer = sec.querySelector('.admin-deleted-section');
    if (!delContainer) {
      delContainer = doc.createElement('div');
      delContainer.className = 'admin-deleted-section';
      sec.appendChild(delContainer);
    }

    /* Filter deleted items for today */
    loadDeleted();
    var todayDel = [];
    for (var i = 0; i < deletedCache.length; i++) {
      if (deletedCache[i].date === apptDate) { todayDel.push(deletedCache[i]); }
    }

    if (!todayDel.length) {
      delContainer.innerHTML = '';
      return;
    }

    var html = '<h3 class="admin-deleted-section__title">Turnos eliminados (recuperar)</h3>';
    for (var j = 0; j < todayDel.length; j++) {
      var d = todayDel[j];
      var svcName = d.service && d.service.name_es ? d.service.name_es : 'Servicio';
      html += '<div class="admin-deleted-item">' +
        '<div class="admin-deleted-item__info">' +
        '<div class="admin-deleted-item__name">' + esc(d.client_name) + '</div>' +
        '<div class="admin-deleted-item__meta">' + esc(d.time || '') + ' · ' + esc(svcName) + '</div>' +
        '</div>' +
        '<div class="admin-deleted-item__actions">' +
        '<button type="button" class="admin-btn" data-recover="' + esc(d.id) + '">Recuperar</button>' +
        '<button type="button" class="admin-btn admin-btn--danger" data-purge="' + esc(d.id) + '">Quitar</button>' +
        '</div></div>';
    }
    delContainer.innerHTML = html;

    /* Wire recover buttons */
    var recoverBtns = delContainer.querySelectorAll('[data-recover]');
    for (var k = 0; k < recoverBtns.length; k++) {
      recoverBtns[k].addEventListener('click', function () {
        var rid = this.getAttribute('data-recover');
        var found = null;
        for (var m = 0; m < deletedCache.length; m++) {
          if (deletedCache[m].id === rid) { found = deletedCache[m]; break; }
        }
        if (found) { recoverAppointment(found); }
      });
    }

    /* Wire purge buttons (permanent remove from cache) */
    var purgeBtns = delContainer.querySelectorAll('[data-purge]');
    for (var p = 0; p < purgeBtns.length; p++) {
      purgeBtns[p].addEventListener('click', function () {
        if (!guardWrite()) { return; }
        var pid = this.getAttribute('data-purge');
        removeDeleted(pid);
        toast('Registro eliminado del historial.');
        renderDeletedSection();
      });
    }
  }

  // ============================================================ WEEK VIEW

  function reloadWeek() {
    var sec = sectionEl('semana');
    if (!sec) { return; }

    /* Update range label */
    var rangeEl = $('week-range');
    if (rangeEl) { rangeEl.textContent = formatRange(weekStart); }

    /* Show loading */
    $('week-days').innerHTML = '<p class="admin-loading">Cargando semana…</p>';
    setWeekKPIs('—', '—', '—');

    api(function () {
      return A.listAppointments(token, { dateFrom: weekStart, dateTo: addDaysISO(weekStart, 6) });
    }).then(function (list) {
      renderWeek(normalizeAppts(list) || []);
    }).catch(function () {
      $('week-days').innerHTML = '<div class="admin-empty">No pudimos cargar la semana.</div>';
    });
  }

  function setWeekKPIs(total, pending, confirmed) {
    var el;
    el = $('wk-total'); if (el) { el.textContent = total; }
    el = $('wk-pending'); if (el) { el.textContent = pending; }
    el = $('wk-confirmed'); if (el) { el.textContent = confirmed; }
  }

  function renderWeek(list) {
    /* Group by date */
    var groups = {};
    for (var i = 0; i < list.length; i++) {
      var d = list[i].date;
      if (!groups[d]) { groups[d] = []; }
      groups[d].push(list[i]);
    }

    /* KPIs */
    var counts = { total: list.length, pending: 0, confirmed: 0 };
    for (var k = 0; k < list.length; k++) {
      if (list[k].status === 'pending') { counts.pending++; }
      if (list[k].status === 'confirmed') { counts.confirmed++; }
    }
    setWeekKPIs(String(counts.total), String(counts.pending), String(counts.confirmed));
    updateBadge(counts.pending);

    /* Render each day */
    var today = todayISO();
    var html = '';
    for (var day = 0; day < 7; day++) {
      var dateStr = addDaysISO(weekStart, day);
      var dObj = new Date(dateStr + 'T12:00:00');
      var dayList = groups[dateStr] || [];
      var isToday = dateStr === today;
      var isOpen = isToday || !!openDays[dateStr];
      var pendingCount = 0;
      for (var p = 0; p < dayList.length; p++) {
        if (dayList[p].status === 'pending') { pendingCount++; }
      }

      html += '<div class="admin-week-day' + (isToday ? ' is-today' : '') + (isOpen ? ' is-open' : '') + '" data-date="' + esc(dateStr) + '">';
      html += '<button type="button" class="admin-week-day__head" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="week-body-' + esc(dateStr) + '">';
      html += '<div class="admin-week-day__info">';
      html += '<span class="admin-week-day__name">' + esc(DAY_NAMES[dObj.getDay()]) + '</span>';
      html += '<span class="admin-week-day__date">' + dObj.getDate() + ' ' + esc(MONTH_SHORT[dObj.getMonth()]) + '</span>';
      html += '</div>';
      html += '<div class="admin-week-day__counts">';
      html += '<span class="admin-week-day__count">' + dayList.length + '</span>';
      if (pendingCount > 0) {
        html += '<span class="admin-week-day__badge admin-week-day__badge--pending" aria-label="' +
          (pendingCount === 1 ? '1 pendiente' : pendingCount + ' pendientes') + '">' + pendingCount + '</span>';
      }
      html += '<span class="admin-week-day__chevron" aria-hidden="true">›</span>';
      html += '</div>';
      html += '</button>';

      html += '<div class="admin-week-day__body" id="week-body-' + esc(dateStr) + '" role="region">';
      if (!dayList.length) {
        html += '<p class="admin-week-day__empty">Sin turnos</p>';
      } else {
        dayList.sort(function (a, b) { return String(a.time || '').localeCompare(String(b.time || '')); });
        html += '<div class="admin-dash-appts">';
        for (var j = 0; j < dayList.length; j++) {
          var a = dayList[j];
          var svcName = a.service && a.service.name_es ? a.service.name_es : '(servicio eliminado)';
          var barberName = a.barber && a.barber.name ? a.barber.name : 'General';
          var chipCls = a.status === 'confirmed' ? ' admin-chip--ok'
            : (a.status === 'cancelled' ? ' admin-chip--danger' : ' admin-chip--warn');

          html += '<div class="admin-dash-appt">' +
            '<time class="admin-dash-appt__time" datetime="' + esc(a.date) + 'T' + esc(a.time) + '">' + esc(a.time) + '</time>' +
            '<div class="admin-dash-appt__info">' +
            '<div class="admin-dash-appt__name">' + esc(a.client_name) + '</div>' +
            '<div class="admin-dash-appt__meta">' + esc(svcName) + ' · ' + esc(barberName) + '</div>' +
            '</div>' +
            '<span class="admin-chip' + chipCls + '">' + (STATUS_LABELS[a.status] || esc(a.status)) + '</span>' +
            '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
      html += '</div>';
    }
    $('week-days').innerHTML = html;      /* Wire day toggles — click navigates to dashboard for that date */
    var dayBtns = $('week-days').querySelectorAll('.admin-week-day__head');
    for (var d = 0; d < dayBtns.length; d++) {
      dayBtns[d].addEventListener('click', function () {
        var group = this.closest('.admin-week-day');
        if (!group) { return; }
        var dateStr = group.getAttribute('data-date');
        apptDate = dateStr;
        switchTab('dashboard');
      });
    }

    /* Wire nav buttons */
    var prevBtn = $('week-prev');
    var nextBtn = $('week-next');
    var todayBtn = $('week-today');
    if (prevBtn) {
      prevBtn.onclick = function () { weekStart = addDaysISO(weekStart, -7); openDays = {}; reloadWeek(); };
    }
    if (nextBtn) {
      nextBtn.onclick = function () { weekStart = addDaysISO(weekStart, 7); openDays = {}; reloadWeek(); };
    }
    if (todayBtn) {
      todayBtn.onclick = function () { weekStart = mondayOf(todayISO()); openDays = {}; reloadWeek(); };
    }
  }

  // ============================================================ TURNOS (legacy, kept for direct access)

  function reloadTurnos() {
    /* Redirect to dashboard if on dashboard tab */
    if (currentTab === 'dashboard') { reloadDashboard(); return; }
  }

  // ------------------------------------------------------------- servicios

  function reloadServicios() {
    var sec = sectionEl('servicios');
    sec.innerHTML = '<p class="admin-loading">Cargando servicios...</p>';
    api(function () { return A.listServices(token); })
      .then(function (list) {
        lastServices = list || [];
        renderServicios(lastServices);
      })
      .catch(function () {
        sec.innerHTML = '<div class="admin-empty">No pudimos cargar los servicios.</div>';
      });
  }

  function renderServicios(list) {
    var sec = sectionEl('servicios');
    var rows;

    if (!list.length) {
      rows = '<div class="admin-empty">Todavia no hay servicios. Crea el primero con "Nuevo servicio".</div>';
    } else {
      rows = '<div class="admin-list">';
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        rows += '<div class="admin-list__item">' +
          '<div class="admin-item__main">' +
          '<div class="admin-item__name">' + esc(s.name_es) + '</div>' +
          '<div class="admin-item__meta">' + fmtPrice(s.price) + ' &middot; ' +
          (Number(s.duration_min) || 0) + ' min' +
          (s.group_name ? ' &middot; ' + esc(s.group_name) : '') + '</div></div>' +
          '<span class="admin-chip ' + (s.active === false ? 'admin-chip--off' : 'admin-chip--ok') + '">' +
          (s.active === false ? 'Oculto' : 'Activo') + '</span>' +
          '<div class="admin-item__actions">' +
          '<button type="button" class="admin-btn" data-svc-edit="' + esc(s.id) + '">Editar</button>' +
          '<button type="button" class="admin-btn admin-btn--danger" data-svc-del="' + esc(s.id) + '">Eliminar</button>' +
          '</div></div>';
      }
      rows += '</div>';
    }

    sec.innerHTML =
      '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Carta de servicios</h3>' +
      '<button type="button" class="admin-btn admin-btn--solid" id="svc-new">+ Nuevo servicio</button></div>' +
      rows + '<div id="svc-form-wrap"></div>';

    $('svc-new').addEventListener('click', function () { renderServiceForm(null); });

    wirePairClicks(sec, 'data-svc-edit', function (id) {
      var found = null;
      for (var j = 0; j < lastServices.length; j++) {
        if (lastServices[j].id === id) { found = lastServices[j]; break; }
      }
      renderServiceForm(found);
    }, 'data-svc-del', function (id) {
      if (!guardWrite()) { return; }
      if (!root.confirm('?Eliminar este servicio? Los turnos pasados lo siguen mostrando.')) { return; }
      api(function () { return A.deleteService(token, id); })
        .then(function () { toast('Servicio eliminado.'); reloadServicios(); })
        .catch(function () { toast('No pudimos eliminar el servicio.', true); });
    });
  }

  function wirePairClicks(scope, attrA, fnA, attrB, fnB) {
    var as = scope.querySelectorAll('[' + attrA + ']');
    for (var i = 0; i < as.length; i++) {
      as[i].addEventListener('click', function () { fnA(this.getAttribute(attrA), this); });
    }
    if (!attrB) { return; }
    var bs = scope.querySelectorAll('[' + attrB + ']');
    for (var j = 0; j < bs.length; j++) {
      bs[j].addEventListener('click', function () { fnB(this.getAttribute(attrB), this); });
    }
  }

  function renderServiceForm(svc) {
    var wrap = $('svc-form-wrap');
    if (!wrap) { return; }
    editingServiceId = svc ? svc.id : null;

    wrap.innerHTML = '<form class="admin-form" id="svc-form">' +
      '<div class="admin-form__full"><label for="f-name">Nombre (espanol) *</label>' +
      '<input type="text" id="f-name" maxlength="60" value="' + esc(svc && svc.name_es) + '" required></div>' +
      '<div><label for="f-price">Precio UYU *</label>' +
      '<input type="number" id="f-price" min="0" step="10" value="' + esc(svc && svc.price != null ? svc.price : '') + '" required></div>' +
      '<div><label for="f-dur">Duracion (min) *</label>' +
      '<input type="number" id="f-dur" min="5" step="5" value="' + esc(svc && svc.duration_min != null ? svc.duration_min : '') + '" required></div>' +
      '<div><label for="f-group">Grupo</label>' +
      '<input type="text" id="f-group" maxlength="40" value="' + esc(svc && svc.group_name ? svc.group_name : 'Peluqueria') + '"></div>' +
      '<div class="admin-form__full"><label for="f-desc">Descripcion (opcional)</label>' +
      '<textarea id="f-desc" rows="2" maxlength="200" placeholder="Describe el servicio...">' + esc(svc && svc.desc_es ? svc.desc_es : '') + '</textarea></div>' +
      '<div class="admin-form__full"><label for="f-image">Imagen URL (opcional)</label>' +
      '<input type="text" id="f-image" maxlength="500" placeholder="https://..." value="' + esc(svc && svc.image_url ? svc.image_url : '') + '">' +
      '<p style="font-size:0.6875rem;color:var(--color-gray-mid);margin-top:4px;">Dejalo vacio si el servicio no tiene foto.</p></div>' +
      '<label class="admin-check"><input type="checkbox" id="f-active"' +
      (!svc || svc.active !== false ? ' checked' : '') + '> Visible en la web</label>' +
      '<p class="admin-error-text" id="f-error" hidden></p>' +
      '<div class="admin-form__actions">' +
      '<button type="button" class="admin-btn admin-btn--ghosted" id="f-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">' +
      (svc ? 'Guardar cambios' : 'Crear servicio') + '</button>' +
      '</div></form>';

    try { $('f-name').focus(); } catch (e) { /* noop */ }
    $('f-cancel').addEventListener('click', function () { wrap.innerHTML = ''; });

    $('svc-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('f-error');
      fe.hidden = true;
      var patch = {
        name_es: $('f-name').value.trim(),
        price: Number($('f-price').value),
        duration_min: Number($('f-dur').value),
        group_name: $('f-group').value.trim() || 'Peluqueria',
        desc_es: $('f-desc').value.trim(),
        image_url: $('f-image').value.trim() || null,
        active: $('f-active').checked
      };
      if (!patch.name_es || !(patch.price >= 0) || !(patch.duration_min > 0)) {
        fe.textContent = 'Nombre, precio y duracion son obligatorios.';
        fe.hidden = false;
        return;
      }
      if (!guardWrite()) { return; }
      var op = editingServiceId
        ? A.updateService(token, editingServiceId, patch)
        : A.createService(token, patch);
      api(function () { return op; }).then(function () {
        toast(editingServiceId ? 'Servicio actualizado.' : 'Servicio creado.');
        wrap.innerHTML = '';
        reloadServicios();
      }).catch(function () {
        fe.textContent = 'No pudimos guardar el servicio.';
        fe.hidden = false;
      });
    });
  }

  // ---------------------------------------------------------------- equipo

  function reloadEquipo() {
    var sec = sectionEl('equipo');
    sec.innerHTML = '<p class="admin-loading">Cargando equipo...</p>';
    api(function () { return A.listBarbers(token); })
      .then(function (list) {
        cachedBarbers = list || [];
        renderEquipo(cachedBarbers);
      })
      .catch(function () {
        sec.innerHTML = '<div class="admin-empty">No pudimos cargar el equipo.</div>';
      });
  }

  function renderEquipo(list) {
    var sec = sectionEl('equipo');
    var rows;

    if (!list.length) {
      rows = '<div class="admin-empty">Sin equipo cargado. Con al menos un barbero activo el wizard acepta reservas.</div>';
    } else {
      rows = '<div class="admin-list">';
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        rows += '<div class="admin-list__item">' +
          '<div class="admin-item__main">' +
          '<div class="admin-item__name">' + esc(b.name) + '</div>' +
          '<div class="admin-item__meta">' + esc(b.role || 'Barbero') + '</div></div>' +
          '<span class="admin-chip ' + (b.active === false ? 'admin-chip--off' : 'admin-chip--ok') + '">' +
          (b.active === false ? 'Inactivo' : 'Activo') + '</span>' +
          '<div class="admin-item__actions">' +
          '<button type="button" class="admin-btn" data-bb-toggle="' + esc(b.id) + '" data-next="' +
          (b.active === false ? '1' : '0') + '">' + (b.active === false ? 'Activar' : 'Desactivar') + '</button>' +
          '<button type="button" class="admin-btn admin-btn--danger" data-bb-del="' + esc(b.id) + '">Eliminar</button>' +
          '</div></div>';
      }
      rows += '</div>';
    }

    sec.innerHTML =
      '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Equipo</h3>' +
      '<button type="button" class="admin-btn admin-btn--solid" id="bb-new">+ Nuevo barbero</button></div>' +
      rows + '<div id="bb-form-wrap"></div>';

    $('bb-new').addEventListener('click', function () { renderBarberForm(null); });

    wirePairClicks(sec, 'data-bb-toggle', function (id, ev) {
      if (!guardWrite()) { return; }
      var makeActive = ev.getAttribute('data-next') === '1';
      api(function () { return A.updateBarber(token, id, { active: makeActive }); })
        .then(function () { toast(makeActive ? 'Barbero activado.' : 'Barbero desactivado.'); reloadEquipo(); })
        .catch(function () { toast('No pudimos actualizar el barbero.', true); });
    }, 'data-bb-del', function (id) {
      if (!guardWrite()) { return; }
      if (!root.confirm('?Eliminar este barbero? Sus turnos quedan huerfanos en el historico.')) { return; }
      api(function () { return A.deleteBarber(token, id); })
        .then(function () { toast('Barbero eliminado.'); reloadEquipo(); })
        .catch(function () { toast('No pudimos eliminar el barbero.', true); });
    });
  }

  function renderBarberForm(bb) {
    var wrap = $('bb-form-wrap');
    if (!wrap) { return; }
    editingBarberId = bb ? bb.id : null;

    wrap.innerHTML = '<form class="admin-form" id="bb-form">' +
      '<div><label for="b-name">Nombre *</label>' +
      '<input type="text" id="b-name" maxlength="60" value="' + esc(bb && bb.name) + '" required></div>' +
      '<div><label for="b-role">Rol</label>' +
      '<input type="text" id="b-role" maxlength="40" value="' + esc(bb && bb.role ? bb.role : 'Barbero') + '"></div>' +
      '<label class="admin-check"><input type="checkbox" id="b-active"' +
      (!bb || bb.active !== false ? ' checked' : '') + '> Activo</label>' +
      '<p class="admin-error-text" id="b-error" hidden></p>' +
      '<div class="admin-form__actions">' +
      '<button type="button" class="admin-btn admin-btn--ghosted" id="b-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">' + (bb ? 'Guardar cambios' : 'Agregar') + '</button>' +
      '</div></form>';

    try { $('b-name').focus(); } catch (e) { /* noop */ }
    $('b-cancel').addEventListener('click', function () { wrap.innerHTML = ''; });

    $('bb-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var be = $('b-error');
      be.hidden = true;
      var patch = {
        name: $('b-name').value.trim(),
        role: $('b-role').value.trim() || 'Barbero',
        active: $('b-active').checked
      };
      if (!patch.name) {
        be.textContent = 'El nombre es obligatorio.';
        be.hidden = false;
        return;
      }
      if (!guardWrite()) { return; }
      var op = editingBarberId
        ? A.updateBarber(token, editingBarberId, patch)
        : A.createBarber(token, patch);
      api(function () { return op; }).then(function () {
        toast(editingBarberId ? 'Barbero actualizado.' : 'Barbero agregado.');
        wrap.innerHTML = '';
        reloadEquipo();
      }).catch(function () {
        be.textContent = 'No pudimos guardar el barbero.';
        be.hidden = false;
      });
    });
  }

  // -------------------------------------------------------------- horarios

  function reloadHorarios() {
    var sec = sectionEl('horarios');
    sec.innerHTML = '<p class="admin-loading">Cargando horarios...</p>';

    Promise.all([
      api(function () { return A.listBarbers(token); }),
      api(function () { return A.listExceptions(token); })
    ]).then(function (res) {
      cachedBarbers = res[0] || [];
      lastExceptions = res[1] || [];
      renderHorariosShell();
      return loadPlan(planScopeBarber);
    }).then(function (rows) {
      lastPlanRows = rows || [];
      paintPlanRows();
      renderExceptions();
    }).catch(function () {
      sec.innerHTML = '<div class="admin-empty">No pudimos cargar los horarios.</div>';
    });
  }

  function renderHorariosShell() {
    var sec = sectionEl('horarios');
    var opts = '<option value="">Plan general</option>';
    for (var i = 0; i < cachedBarbers.length; i++) {
      opts += '<option value="' + esc(cachedBarbers[i].id) + '"' +
        (cachedBarbers[i].id === planScopeBarber ? ' selected' : '') + '>' +
        esc(cachedBarbers[i].name) + '</option>';
    }

    sec.innerHTML =
      '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Horarios</h3>' +
      '<select id="plan-scope" class="admin-select-inline" aria-label="Ambito del plan">' + opts + '</select></div>' +
      '<p style="font-size:0.8125rem;color:var(--color-gray-mid);margin-bottom:var(--sp-sm);">El plan general rige los turnos sin barbero asignado; el plan por barbero lo pisa cuando existe.</p>' +
      '<div id="plan-rows"></div>' +
      '<div id="plan-save-wrap" style="margin-top:var(--sp-sm);text-align:right;" hidden>' +
      '<button type="button" class="admin-btn admin-btn--solid" id="plan-save-all">Guardar cambios</button>' +
      '</div>' +
      '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Excepciones</h3>' +
      '<button type="button" class="admin-btn" id="exc-new">+ Nueva excepcion</button></div>' +
      '<div id="exc-list"></div><div id="exc-form-wrap"></div>';

    $('plan-scope').addEventListener('change', function () {
      planScopeBarber = this.value;
      var saveWrap = $('plan-save-wrap');
      if (saveWrap) { saveWrap.hidden = true; }
      loadPlan(planScopeBarber).then(function (rows) {
        lastPlanRows = rows || [];
        paintPlanRows();
      }).catch(function () { toast('No pudimos cargar el plan.', true); });
    });
    $('exc-new').addEventListener('click', renderExceptionForm);
  }

  function loadPlan(scopeId) {
    if (scopeId) {
      return api(function () { return A.getBarberPlan(token, scopeId); });
    }
    return api(function () { return A.getWorkingPlan(token); })
      .then(function (rows) {
        var general = [];
        for (var i = 0; i < (rows || []).length; i++) {
          if (!rows[i].barber_id) { general.push(rows[i]); }
        }
        return general;
      });
  }

  function planRowFor(dow) {
    for (var i = 0; i < lastPlanRows.length; i++) {
      if (Number(lastPlanRows[i].dow) === dow) { return lastPlanRows[i]; }
    }
    return null;
  }

  function timeToMin(t) {
    var p = String(t).split(':');
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }

  function calcWeeklyCapacity() {
    var step = (window.CCESCO_CONFIG && window.CCESCO_CONFIG.booking && window.CCESCO_CONFIG.booking.slotStepMin) || 15;
    var total = 0;
    for (var d = 0; d <= 6; d++) {
      var row = planRowFor(d);
      if (!row || row.active === false) { continue; }
      var s = timeToMin(row.start_time || row.start || '09:00');
      var e = timeToMin(row.end_time || row.end || '19:00');
      if (e > s) { total += Math.floor((e - s) / step); }
    }
    return total;
  }

  function paintPlanRows() {
    var wrap = $('plan-rows');
    if (!wrap) { return; }
    var html = '';

    for (var dow = 0; dow <= 6; dow++) {
      var r = planRowFor(dow);
      var active = r ? r.active !== false : false;
      var start = ((r && (r.start_time || r.start)) || '09:00').slice(0, 5);
      var end = ((r && (r.end_time || r.end)) || '19:00').slice(0, 5);

      html += '<div class="admin-plan-row" data-dow="' + dow + '">' +
        '<span class="admin-plan-row__day">' + DAY_NAMES[dow] + '</span>' +
        '<label class="admin-check admin-check--bare"><input type="checkbox" data-pactive' +
        (active ? ' checked' : '') + '> Activo</label>' +
        '<div class="admin-plan-row__times">' +
        '<input type="time" data-pstart value="' + esc(start) + '"' + (active ? '' : ' disabled') + '>' +
        '<span aria-hidden="true">—</span>' +
        '<input type="time" data-pend value="' + esc(end) + '"' + (active ? '' : ' disabled') + '>' +
        '</div>' +
        '</div>';
    }
    wrap.innerHTML = html;

    /* Checkbox toggle: enable/disable time inputs */
    var boxes = wrap.querySelectorAll('[data-pactive]');
    for (var b = 0; b < boxes.length; b++) {
      boxes[b].addEventListener('change', function () {
        var row = this.closest('.admin-plan-row');
        if (!row) { return; }
        var dis = !this.checked;
        row.querySelector('[data-pstart]').disabled = dis;
        row.querySelector('[data-pend]').disabled = dis;
        markPlanDirty();
      });
    }

    /* Time inputs: detect changes */
    var timeInputs = wrap.querySelectorAll('input[type="time"]');
    for (var t = 0; t < timeInputs.length; t++) {
      timeInputs[t].addEventListener('change', markPlanDirty);
    }

    /* Hide save button initially */
    var saveWrap = $('plan-save-wrap');
    if (saveWrap) { saveWrap.hidden = true; }

    /* Wire save-all button */
    var saveAllBtn = $('plan-save-all');
    if (saveAllBtn) {
      saveAllBtn.addEventListener('click', saveAllPlanDays);
    }
  }

  function markPlanDirty() {
    var saveWrap = $('plan-save-wrap');
    if (saveWrap) { saveWrap.hidden = false; }
  }

  function saveAllPlanDays() {
    var wrap = $('plan-rows');
    if (!wrap) { return; }
    if (!guardWrite()) { return; }
    var rows = wrap.querySelectorAll('.admin-plan-row');
    var promises = [];
    var hasError = false;

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var dow = Number(row.getAttribute('data-dow'));
      var patch = {
        active: row.querySelector('[data-pactive]').checked,
        start_time: row.querySelector('[data-pstart]').value,
        end_time: row.querySelector('[data-pend]').value
      };
      if (patch.active && !(patch.start_time && patch.end_time)) {
        toast('Completa hora de inicio y fin para ' + DAY_NAMES[dow] + '.', true);
        hasError = true;
        break;
      }
      var op = planScopeBarber
        ? A.updateBarberPlanDay(token, planScopeBarber, dow, patch)
        : A.updateGeneralPlanDay(token, dow, patch);
      promises.push(op);
    }

    if (hasError) { return; }

    Promise.all(promises).then(function () {
      toast('Horarios guardados.');
      var saveWrap = $('plan-save-wrap');
      if (saveWrap) { saveWrap.hidden = true; }
    }).catch(function () {
      toast('No pudimos guardar los horarios.', true);
    });
  }

  function renderExceptions() {
    var wrap = $('exc-list');
    if (!wrap) { return; }

    function barberName(id) {
      if (!id) { return 'Todos'; }
      for (var i = 0; i < cachedBarbers.length; i++) {
        if (cachedBarbers[i].id === id) { return cachedBarbers[i].name; }
      }
      return 'Barbero';
    }

    var sorted = lastExceptions.slice().sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
    var future = [];
    var today = todayISO();
    for (var j = 0; j < sorted.length; j++) {
      if (String(sorted[j].date) >= today) { future.push(sorted[j]); }
    }

    if (!future.length) {
      wrap.innerHTML = '<div class="admin-empty">Sin excepciones proximas.</div>';
      return;
    }

    var html = '<div class="admin-list">';
    for (var k = 0; k < future.length; k++) {
      var x = future[k];
      var xid = x.id || x._id;
      var detail = x.all_day ? 'Todo el dia'
        : ((x.start_time || '').slice(0, 5) + '-' + (x.end_time || '').slice(0, 5));
      html += '<div class="admin-list__item">' +
        '<div class="admin-item__main">' +
        '<div class="admin-item__name">' + esc(x.date) + ' &middot; ' + esc(barberName(x.barber_id)) + '</div>' +
        '<div class="admin-item__meta">' + esc(detail) + (x.reason ? ' &middot; ' + esc(x.reason) : '') + '</div></div>' +
        '<div class="admin-item__actions">' +
        '<button type="button" class="admin-btn admin-btn--danger" data-exc-del="' + esc(xid) + '">Quitar</button>' +
        '</div></div>';
    }
    wrap.innerHTML = html + '</div>';

    wirePairClicks(wrap, 'data-exc-del', function (id) {
      if (!guardWrite()) { return; }
      api(function () { return A.deleteException(token, id); }).then(function () {
        toast('Excepcion quitada.');
        return api(function () { return A.listExceptions(token); });
      }).then(function (list) {
        lastExceptions = list || [];
        renderExceptions();
      }).catch(function () { toast('No pudimos quitar la excepcion.', true); });
    }, null, null);
  }

  function renderExceptionForm() {
    var wrap = $('exc-form-wrap');
    if (!wrap) { return; }
    if (wrap.innerHTML) { wrap.innerHTML = ''; return; }

    var opts = '<option value="">Todos los barberos</option>';
    for (var i = 0; i < cachedBarbers.length; i++) {
      opts += '<option value="' + esc(cachedBarbers[i].id) + '">' + esc(cachedBarbers[i].name) + '</option>';
    }

    wrap.innerHTML = '<form class="admin-form" id="exc-form">' +
      '<div><label for="x-date">Fecha *</label>' +
      '<input type="date" id="x-date" value="' + todayISO() + '" required></div>' +
      '<div><label for="x-barber">Barbero</label><select id="x-barber">' + opts + '</select></div>' +
      '<label class="admin-check"><input type="checkbox" id="x-allday" checked> Todo el dia</label>' +
      '<div><label for="x-start">Desde</label><input type="time" id="x-start" disabled></div>' +
      '<div><label for="x-end">Hasta</label><input type="time" id="x-end" disabled></div>' +
      '<div class="admin-form__full"><label for="x-reason">Motivo</label>' +
      '<input type="text" id="x-reason" maxlength="120" placeholder="Feriado, licencia, evento..."></div>' +
      '<p class="admin-error-text" id="x-error" hidden></p>' +
      '<div class="admin-form__actions">' +
      '<button type="submit" class="admin-btn admin-btn--solid">Crear excepcion</button>' +
      '</div></form>';

    $('x-allday').addEventListener('change', function () {
      $('x-start').disabled = this.checked;
      $('x-end').disabled = this.checked;
    });

    $('exc-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var xe = $('x-error');
      xe.hidden = true;
      var allDay = $('x-allday').checked;
      var body = {
        barber_id: $('x-barber').value || null,
        date: $('x-date').value,
        all_day: allDay,
        start_time: allDay ? null : $('x-start').value,
        end_time: allDay ? null : $('x-end').value,
        reason: $('x-reason').value.trim() || null
      };
      if (!body.date || (!allDay && !(body.start_time && body.end_time))) {
        xe.textContent = 'Fecha obligatoria; si no es todo el dia, franja completa.';
        xe.hidden = false;
        return;
      }
      if (!guardWrite()) { return; }
      api(function () { return A.createException(token, body); }).then(function () {
        toast('Excepcion creada.');
        wrap.innerHTML = '';
        return api(function () { return A.listExceptions(token); });
      }).then(function (list) {
        lastExceptions = list || [];
        renderExceptions();
      }).catch(function () {
        xe.textContent = 'No pudimos crear la excepcion.';
        xe.hidden = false;
      });
    });
  }

  // --------------------------------------------------- notificaciones (poll)

  function startPoll() {
    stopPoll();
    notifSeedBaseline();
    pollNotif();
    pollTimer = setInterval(pollNotif, POLL_MS);
    doc.addEventListener('visibilitychange', onVisibilityChange);
  }

  function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    doc.removeEventListener('visibilitychange', onVisibilityChange);
  }

  function onVisibilityChange() {
    if (doc.hidden) {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      return;
    }
    if (!pollTimer) {
      pollNotif();
      pollTimer = setInterval(pollNotif, POLL_MS);
    }
  }

  function notifSeedBaseline() {
    api(function () {
      return A.listAppointments(token, { date: todayISO(), status: 'pending' });
    }).then(function (list) {
      for (var i = 0; i < (list || []).length; i++) {
        knownPending[list[i].id] = true;
      }
      notifReady = true;
    }).catch(function () { notifReady = true; });
  }

  function pollNotif() {
    if (!token || $('view-panel').hidden || notifInFlight) { return; }
    notifInFlight = true;
    api(function () {
      return A.listAppointments(token, { date: todayISO(), status: 'pending' });
    }).then(function (list) {
      notifInFlight = false;
      var pend = 0;
      var fresh = [];
      for (var i = 0; i < (list || []).length; i++) {
        pend++;
        if (notifReady && !knownPending[list[i].id]) { fresh.push(list[i]); }
        knownPending[list[i].id] = true;
      }
      notifReady = true;
      if (currentTab !== 'dashboard') { updateBadge(pend); }
      if (fresh.length) {
        notifShowBanner(fresh);
        reloadDashboard();
      }
    }).catch(function () { notifInFlight = false; });
  }

  function notifInitUI() {
    var cta = $('notif-banner-cta');
    var close = $('notif-banner-close');
    if (cta) {
      cta.addEventListener('click', function () {
        notifCurrent = [];
        notifHideBanner();
        if (currentTab !== 'dashboard') {
          switchTab('dashboard');
        }
        reloadDashboard();
      });
    }
    if (close) {
      close.addEventListener('click', function () {
        notifCurrent = [];
        notifHideBanner();
      });
    }
    var unlock = function () {
      notifEnsureAudio();
      notifSafeResume();
      doc.removeEventListener('pointerdown', unlock);
      doc.removeEventListener('keydown', unlock);
    };
    doc.addEventListener('pointerdown', unlock);
    doc.addEventListener('keydown', unlock);

    syncSoundToggle();
  }

  function syncSoundToggle() {
    var btn = $('btn-sound-toggle');
    if (!btn) { return; }
    btn.setAttribute('aria-pressed', String(!notifMuted));
    btn.classList.toggle('is-muted', notifMuted);
    btn.setAttribute('aria-label', notifMuted ? 'Activar sonido de notificaciones' : 'Silenciar sonido de notificaciones');
  }

  function toggleNotifSound() {
    if (!guardWrite()) { return; }
    notifMuted = !notifMuted;
    try { root.localStorage.setItem(NOTIF_MUTED_KEY, notifMuted ? '1' : '0'); } catch (e) { /* noop */ }
    syncSoundToggle();
    toast(notifMuted ? 'Sonido de notificaciones silenciado.' : 'Sonido de notificaciones activado.');
  }

  // ------------------------------------------------------------------- boot

  function initDateNav() {
    var prevBtn = $('dash-date-prev');
    var nextBtn = $('dash-date-next');
    var todayBtn = $('dash-date-today');
    if (prevBtn) {
      prevBtn.onclick = function () {
        apptDate = addDaysISO(apptDate, -1);
        reloadDashboard();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function () {
        apptDate = addDaysISO(apptDate, 1);
        reloadDashboard();
      };
    }
    if (todayBtn) {
      todayBtn.onclick = function () {
        apptDate = todayISO();
        reloadDashboard();
      };
    }
  }

  /** Auto-login silencioso del demo (acceso público al panel).
   *  Solo corre en init() cuando no hay token en sessionStorage y el demo
   *  está habilitado con PIN configurado. Éxito → enterPanel() directo;
   *  fracaso → showLogin(null) deja el form como fallback (p.ej. tenant
   *  real con otro PIN o rate limit). logout()/expireSession() NO lo
   *  re-disparan: pasan directo a showLogin(). */
  function demoAutoLogin() {
    var cfg = root.CCESCO_CONFIG || {};
    var demo = cfg.demo || {};
    if (!(demo.enabled && demo.pin)) { return false; }

    A.loginPin(String(demo.pin)).then(function (res) {
      if (res && res.token) {
        token = res.token;
        VIEW_MODE = true; // PIN demo → sesión viewer (solo lectura)
        try { root.sessionStorage.setItem(TOKEN_KEY, token); } catch (e) { /* noop */ }
        enterPanel();
      } else {
        showLogin(null);
      }
    }).catch(function () {
      showLogin(null);
    });
    return true;
  }

  function init() {
    if (!A) {
      showLogin('Modulo de datos no disponible.');
      return;
    }
    initLogin();
    initTabs();

    var soundBtn = $('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', toggleNotifSound);
    }

    if (token) {
      /* Sesión persistida: si es el token demo, la sesión también es de
         solo lectura (el PIN demo siempre entra en modo vista). */
      VIEW_MODE = (token === 'ccesco-demo-admin');
      applyViewMode();
      api(function () {
        return A.listAppointments(token, { date: todayISO(), status: 'pending' });
      }).then(function () { enterPanel(); })
        .catch(function () { /* expireSession ya mando a login si fue 401 */ });
    } else if (demoAutoLogin()) {
      /* Demo habilitado: login automático en curso; si falla, el fallback
         del form queda visible vía showLogin(null). */
    } else {
      showLogin(null);
    }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);
