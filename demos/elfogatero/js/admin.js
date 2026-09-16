/**
 * Panel de administración — CUADRA Restó.
 *
 * Mismo shell y misma capa de datos (CUADRA_DB) que el panel de Agenda,
 * adaptado a gastronomía: la agenda del día mezcla reservas de mesa y
 * pedidos de delivery/take-away. Tabs: Operación (dashboard), Carta, Mesas,
 * Horarios (franjas de cocina).
 */
(function (root) {
  'use strict';

  var DB = root.CUADRA_DB;
  var doc = document;
  var CFG = root.SITE_CONFIG || {};
  var SLUG = (CFG.tenant && CFG.tenant.slug) || 'cuadra';

  var SESSION_KEY = SLUG + '_admin_session';
  var NOTIF_MUTED_KEY = SLUG + '_admin_notif_muted';

  var loggedIn = false;
  var currentTab = 'dashboard';
  var opDate = todayISO();
  var pollTimer = null;
  var knownPending = {};
  var notifReady = false;
  var notifAudioCtx = null;
  var notifAudioOk = false;
  var notifMuted = false;
  try { notifMuted = root.localStorage.getItem(NOTIF_MUTED_KEY) === '1'; } catch (e) {}

  var lastDishes = [];
  var lastTables = [];
  var editingDishId = null;
  var editingTableId = null;

  var DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  var STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado' };

  function $(id) { return doc.getElementById(id); }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDaysISO(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function fmtDateLong(iso) {
    var d = new Date(iso + 'T12:00:00');
    return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' de ' + d.toLocaleDateString('es-UY', { month: 'long' });
  }
  function fmtDateShort(iso) { var d = new Date(iso + 'T12:00:00'); return d.getDate() + ' ' + MONTH_SHORT[d.getMonth()]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function money(n) { return '$ ' + (Number(n) || 0).toLocaleString('es-UY'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

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
  (function () { var t = $('toast'); if (t) t.addEventListener('click', function () { t.hidden = true; }); })();

  function notifEnsureAudio() {
    if (notifAudioCtx) return;
    try { var AC = root.AudioContext || root.webkitAudioContext; if (!AC) return; notifAudioCtx = new AC(); notifAudioOk = true; } catch (e) {}
  }
  function notifPlayDing() {
    if (notifMuted || !notifAudioOk || !notifAudioCtx) return;
    try {
      notifAudioCtx.resume();
      var t = notifAudioCtx.currentTime;
      [[880, t, 0.15, 0.3], [1170, t + 0.18, 0.18, 0.22]].forEach(function (p) {
        var osc = notifAudioCtx.createOscillator(), gain = notifAudioCtx.createGain();
        osc.type = 'sine'; osc.frequency.value = p[0];
        gain.gain.setValueAtTime(0.0001, p[1]);
        gain.gain.linearRampToValueAtTime(p[3], p[1] + 0.012);
        gain.gain.setValueAtTime(p[3], p[1] + p[2] - 0.05);
        gain.gain.linearRampToValueAtTime(0.0001, p[1] + p[2]);
        osc.connect(gain); gain.connect(notifAudioCtx.destination);
        osc.start(p[1]); osc.stop(p[1] + p[2] + 0.05);
      });
    } catch (e) {}
  }
  function notifShowBanner(fresh) {
    var banner = $('notif-banner'), titleEl = $('notif-banner-title'), listEl = $('notif-banner-list');
    if (!banner) return;
    titleEl.textContent = fresh.length === 1 ? '¡Novedad!' : '¡' + fresh.length + ' novedades!';
    listEl.innerHTML = fresh.map(function (r) { return '<li><strong>' + esc(r.client_name) + '</strong></li>'; }).join('');
    banner.hidden = false;
    banner.classList.remove('admin-notif-banner--in');
    void banner.offsetWidth;
    banner.classList.add('admin-notif-banner--in');
    notifPlayDing();
  }
  function notifHideBanner() { var b = $('notif-banner'); if (b) b.hidden = true; }

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
      }).catch(function (err) { showErr(err && err.code === 'INVALID_PIN' ? 'PIN incorrecto.' : 'No pudimos verificar el PIN.'); });
    });
    $('btn-logout').addEventListener('click', logout);
  }
  function logout() {
    stopPoll();
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
    wireDashNewReservation();
    switchTab('dashboard');
    startPoll();
  }

  // ------------------------------------------------------------------ tabs

  function initTabs() {
    var items = doc.querySelectorAll('.admin-bottomnav__item');
    for (var i = 0; i < items.length; i++) items[i].addEventListener('click', function () { switchTab(this.getAttribute('data-tab')); });
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
    for (var j = 0; j < sections.length; j++) sections[j].classList.toggle('is-active', sections[j].id === 'tab-' + name);
    if (name === 'dashboard') reloadDashboard();
    if (name === 'carta') reloadCarta();
    if (name === 'mesas') reloadMesas();
    if (name === 'horarios') reloadHorarios();
  }
  function wireDashNewReservation() {
    var btn = $('dash-new-appt');
    if (!btn || btn._wired) return;
    btn._wired = true;
    btn.addEventListener('click', renderNewReservationForm);
  }
  function sectionEl(name) { return $('tab-' + name); }

  // ============================================================ DASHBOARD

  function reloadDashboard() {
    var sub = $('dash-date-sub');
    if (sub) sub.textContent = cap(fmtDateLong(opDate));
    $('dash-extra-1').innerHTML = '';
    $('dash-appointments').innerHTML = '<p class="admin-loading">Cargando…</p>';

    Promise.all([DB.listReservations({ date: opDate }), DB.listOrders({ date: opDate }), DB.listTables()]).then(function (res) {
      var reservations = res[0] || [];
      var orders = res[1] || [];
      lastTables = res[2] || [];
      renderKpis(reservations, orders);
      renderTablesToday(reservations);
      renderMovements(reservations, orders);
    });
  }

  function renderKpis(reservations, orders) {
    var all = reservations.concat(orders);
    var counts = { total: all.length, pending: 0, confirmed: 0 };
    all.forEach(function (r) { if (r.status === 'pending') counts.pending++; if (r.status === 'confirmed') counts.confirmed++; });
    $('kpi-today-count').textContent = String(counts.total);
    $('kpi-pending').textContent = String(counts.pending);
    $('kpi-confirmed').textContent = String(counts.confirmed);
    var activeTables = lastTables.filter(function (t) { return t.active !== false; }).length;
    var pct = activeTables > 0 ? Math.round((reservations.filter(function (r) { return r.status === 'confirmed'; }).length / activeTables) * 100) + '%' : '—';
    $('kpi-week-pct').textContent = pct;
  }

  function renderTablesToday(reservations) {
    var box = $('dash-extra-1');
    var active = lastTables.filter(function (t) { return t.active !== false; });
    if (!active.length) { box.innerHTML = '<h3 class="admin-dash-section__title">Mesas</h3><p class="admin-empty">Sin mesas cargadas.</p>'; return; }
    var reservedByTable = {};
    reservations.forEach(function (r) { if (r.status !== 'cancelled' && r.table_id) reservedByTable[r.table_id] = (reservedByTable[r.table_id] || 0) + 1; });
    var html = '<h3 class="admin-dash-section__title">Mesas</h3><div class="admin-dash-team">';
    active.forEach(function (t) {
      var n = reservedByTable[t.id] || 0;
      html += '<div class="admin-team-card"><div class="admin-team-card__info"><div class="admin-team-card__name">' + esc(t.name) + '</div>' +
        '<div class="admin-team-card__role">' + t.seats + ' asientos</div></div>' +
        '<div class="admin-team-card__stat"><span class="admin-team-card__count">' + n + '</span><span class="admin-team-card__label">reservas</span></div></div>';
    });
    box.innerHTML = html + '</div>';
  }

  function renderMovements(reservations, orders) {
    var container = $('dash-appointments');
    var all = reservations.map(function (r) { return Object.assign({ _kind: 'reserva' }, r); })
      .concat(orders.map(function (o) { return Object.assign({ _kind: 'pedido' }, o); }));
    if (!all.length) { container.innerHTML = '<div class="admin-empty">Sin movimientos para ' + fmtDateShort(opDate) + '.</div>'; return; }
    all.sort(function (a, b) { return String(a.time || a.created || '').localeCompare(String(b.time || b.created || '')); });

    var html = '<div class="admin-dash-appts">';
    all.forEach(function (r) {
      var chipCls = r.status === 'confirmed' ? ' admin-chip--ok' : (r.status === 'cancelled' ? ' admin-chip--danger' : ' admin-chip--warn');
      var meta = r._kind === 'reserva'
        ? (tableName(r.table_id) + (r.personas ? ' · ' + r.personas + ' personas' : ''))
        : ((r.items || []).map(function (it) { return it.qty + 'x ' + it.name; }).join(', ') || 'Delivery');
      var actions = '';
      if (r.status === 'pending') actions += movActBtn(r._kind, r.id, 'confirm', 'Confirmar');
      if (r.status !== 'cancelled') actions += movActBtn(r._kind, r.id, 'cancel', 'Cancelar');
      else actions += movActBtn(r._kind, r.id, 'pending', 'Reactivar');

      html += '<div class="admin-dash-appt"><time class="admin-dash-appt__time">' + esc(r.time || (r.created || '').slice(11, 16)) + '</time>' +
        '<div class="admin-dash-appt__info"><div class="admin-dash-appt__name">' + esc(r.client_name) + ' <span class="admin-chip admin-chip--off">' + r._kind + '</span></div>' +
        '<div class="admin-dash-appt__meta">' + esc(meta) + (r.client_phone ? ' · ' + esc(r.client_phone) : '') + '</div></div>' +
        '<span class="admin-chip' + chipCls + '">' + (STATUS_LABELS[r.status] || esc(r.status)) + '</span>' +
        '<div class="admin-dash-appt__actions">' + actions + '</div></div>';
    });
    container.innerHTML = html + '</div>';

    container.querySelectorAll('[data-mov]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleMovAction(this.getAttribute('data-kind'), this.getAttribute('data-do'), this.getAttribute('data-mov'));
      });
    });
  }

  function tableName(id) {
    for (var i = 0; i < lastTables.length; i++) { if (lastTables[i].id === id) return lastTables[i].name; }
    return 'Sin mesa';
  }
  function movActBtn(kind, id, action, label) {
    return '<button type="button" class="admin-btn" data-mov="' + esc(id) + '" data-kind="' + kind + '" data-do="' + action + '">' + label + '</button>';
  }
  function handleMovAction(kind, action, id) {
    var status = action === 'confirm' ? 'confirmed' : (action === 'cancel' ? 'cancelled' : 'pending');
    var p = kind === 'reserva' ? DB.updateReservationStatus(id, status) : DB.updateOrderStatus(id, status);
    p.then(function () { toast('Actualizado.'); reloadDashboard(); });
  }

  function renderNewReservationForm() {
    var overlay = $('appt-edit-overlay');
    if (!overlay) return;
    var tblOpts = lastTables.filter(function (t) { return t.active !== false; })
      .map(function (t) { return '<option value="' + esc(t.id) + '">' + esc(t.name) + ' (' + t.seats + ')</option>'; }).join('');

    overlay.innerHTML = '<div class="admin-appt-form"><div class="admin-appt-form__title">Nueva reserva</div>' +
      '<form id="res-form" class="admin-form">' +
      '<div class="admin-form__full"><label for="r-name">Cliente *</label><input type="text" id="r-name" required></div>' +
      '<div><label for="r-phone">Teléfono *</label><input type="text" id="r-phone" required></div>' +
      '<div><label for="r-table">Mesa</label><select id="r-table"><option value="">Sin asignar</option>' + tblOpts + '</select></div>' +
      '<div><label for="r-personas">Personas</label><input type="number" id="r-personas" min="1" value="2"></div>' +
      '<div><label for="r-date">Fecha *</label><input type="date" id="r-date" value="' + esc(opDate) + '" required></div>' +
      '<div><label for="r-time">Hora *</label><input type="time" id="r-time" required></div>' +
      '<p class="admin-error-text" id="r-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="r-cancel">Cancelar</button><button type="submit" class="admin-btn admin-btn--solid">Crear reserva</button></div></form></div>';

    overlay.hidden = false;
    $('r-cancel').addEventListener('click', function () { overlay.hidden = true; overlay.innerHTML = ''; });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) { overlay.hidden = true; overlay.innerHTML = ''; } });

    $('res-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('r-error');
      fe.hidden = true;
      var name = $('r-name').value.trim(), phone = $('r-phone').value.trim(), date = $('r-date').value, time = $('r-time').value;
      if (!name || !phone) { fe.textContent = 'Nombre y teléfono son obligatorios.'; fe.hidden = false; return; }
      if (!date || !time) { fe.textContent = 'Ingresá fecha y hora.'; fe.hidden = false; return; }
      DB.createReservation({ client_name: name, client_phone: phone, table_id: $('r-table').value || null, personas: Number($('r-personas').value) || 2, date: date, time: time }).then(function () {
        toast('Reserva creada.');
        overlay.hidden = true; overlay.innerHTML = '';
        reloadDashboard();
      });
    });
  }

  // ------------------------------------------------------------------ carta

  function reloadCarta() {
    var sec = sectionEl('carta');
    sec.innerHTML = '<p class="admin-loading">Cargando carta…</p>';
    DB.listDishes().then(function (list) { lastDishes = list || []; renderCarta(lastDishes); });
  }

  function renderCarta(list) {
    var sec = sectionEl('carta');
    var rows;
    if (!list.length) {
      rows = '<div class="admin-empty">Sin platos. Creá el primero con "+ Nuevo plato".</div>';
    } else {
      rows = '<div class="admin-list">';
      list.forEach(function (d) {
        rows += '<div class="admin-list__item"><div class="admin-item__main">' +
          '<div class="admin-item__name">' + esc(d.name) + '</div>' +
          '<div class="admin-item__meta">' + money(d.price) + (d.category ? ' · ' + esc(d.category) : '') + '</div></div>' +
          '<span class="admin-chip ' + (d.active === false ? 'admin-chip--off' : 'admin-chip--ok') + '">' + (d.active === false ? 'Oculto' : 'Activo') + '</span>' +
          '<div class="admin-item__actions"><button type="button" class="admin-btn" data-d-edit="' + esc(d.id) + '">Editar</button>' +
          '<button type="button" class="admin-btn admin-btn--danger" data-d-del="' + esc(d.id) + '">Eliminar</button></div></div>';
      });
      rows += '</div>';
    }
    sec.innerHTML = '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Carta</h3>' +
      '<button type="button" class="admin-btn admin-btn--solid" id="d-new">+ Nuevo plato</button></div>' + rows + '<div id="d-form-wrap"></div>';

    $('d-new').addEventListener('click', function () { renderDishForm(null); });
    sec.querySelectorAll('[data-d-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-d-edit');
        var found = null;
        for (var i = 0; i < lastDishes.length; i++) { if (lastDishes[i].id === id) { found = lastDishes[i]; break; } }
        renderDishForm(found);
      });
    });
    sec.querySelectorAll('[data-d-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!root.confirm('¿Eliminar este plato?')) return;
        DB.deleteDish(this.getAttribute('data-d-del')).then(function () { toast('Eliminado.'); reloadCarta(); });
      });
    });
  }

  function renderDishForm(d) {
    var wrap = $('d-form-wrap');
    if (!wrap) return;
    editingDishId = d ? d.id : null;
    wrap.innerHTML = '<form class="admin-form" id="d-form">' +
      '<div class="admin-form__full"><label for="df-name">Nombre *</label><input type="text" id="df-name" value="' + esc(d && d.name) + '" required></div>' +
      '<div><label for="df-price">Precio *</label><input type="number" id="df-price" min="0" step="10" value="' + esc(d && d.price != null ? d.price : '') + '" required></div>' +
      '<div><label for="df-cat">Categoría</label><input type="text" id="df-cat" value="' + esc(d && d.category ? d.category : '') + '"></div>' +
      '<div class="admin-form__full"><label for="df-desc">Descripción</label><textarea id="df-desc" rows="2">' + esc(d && d.desc ? d.desc : '') + '</textarea></div>' +
      '<label class="admin-check"><input type="checkbox" id="df-active"' + (!d || d.active !== false ? ' checked' : '') + '> Visible en la web</label>' +
      '<p class="admin-error-text" id="df-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="df-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">' + (d ? 'Guardar cambios' : 'Crear plato') + '</button></div></form>';

    $('df-cancel').addEventListener('click', function () { wrap.innerHTML = ''; });
    $('d-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('df-error');
      fe.hidden = true;
      var patch = { name: $('df-name').value.trim(), price: Number($('df-price').value), category: $('df-cat').value.trim(), desc: $('df-desc').value.trim(), active: $('df-active').checked };
      if (!patch.name || !(patch.price >= 0)) { fe.textContent = 'Nombre y precio son obligatorios.'; fe.hidden = false; return; }
      var op = editingDishId ? DB.updateDish(editingDishId, patch) : DB.createDish(patch);
      op.then(function () { toast(editingDishId ? 'Actualizado.' : 'Creado.'); wrap.innerHTML = ''; reloadCarta(); });
    });
  }

  // ------------------------------------------------------------------ mesas

  function reloadMesas() {
    var sec = sectionEl('mesas');
    sec.innerHTML = '<p class="admin-loading">Cargando mesas…</p>';
    DB.listTables().then(function (list) { lastTables = list || []; renderMesas(lastTables); });
  }

  function renderMesas(list) {
    var sec = sectionEl('mesas');
    var rows;
    if (!list.length) {
      rows = '<div class="admin-empty">Sin mesas cargadas.</div>';
    } else {
      rows = '<div class="admin-list">';
      list.forEach(function (t) {
        rows += '<div class="admin-list__item"><div class="admin-item__main">' +
          '<div class="admin-item__name">' + esc(t.name) + '</div><div class="admin-item__meta">' + t.seats + ' asientos</div></div>' +
          '<span class="admin-chip ' + (t.active === false ? 'admin-chip--off' : 'admin-chip--ok') + '">' + (t.active === false ? 'Inactiva' : 'Activa') + '</span>' +
          '<div class="admin-item__actions"><button type="button" class="admin-btn" data-t-toggle="' + esc(t.id) + '" data-next="' + (t.active === false ? '1' : '0') + '">' +
          (t.active === false ? 'Activar' : 'Desactivar') + '</button>' +
          '<button type="button" class="admin-btn admin-btn--danger" data-t-del="' + esc(t.id) + '">Eliminar</button></div></div>';
      });
      rows += '</div>';
    }
    sec.innerHTML = '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Mesas</h3>' +
      '<button type="button" class="admin-btn admin-btn--solid" id="t-new">+ Agregar mesa</button></div>' + rows + '<div id="t-form-wrap"></div>';

    $('t-new').addEventListener('click', function () { renderTableForm(); });
    sec.querySelectorAll('[data-t-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        DB.updateTable(this.getAttribute('data-t-toggle'), { active: this.getAttribute('data-next') === '1' }).then(function () { toast('Actualizado.'); reloadMesas(); });
      });
    });
    sec.querySelectorAll('[data-t-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!root.confirm('¿Eliminar esta mesa?')) return;
        DB.deleteTable(this.getAttribute('data-t-del')).then(function () { toast('Eliminada.'); reloadMesas(); });
      });
    });
  }

  function renderTableForm() {
    var wrap = $('t-form-wrap');
    if (!wrap) return;
    wrap.innerHTML = '<form class="admin-form" id="t-form">' +
      '<div><label for="tf-name">Nombre *</label><input type="text" id="tf-name" placeholder="Mesa 7" required></div>' +
      '<div><label for="tf-seats">Asientos *</label><input type="number" id="tf-seats" min="1" value="2" required></div>' +
      '<p class="admin-error-text" id="tf-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="tf-cancel">Cancelar</button><button type="submit" class="admin-btn admin-btn--solid">Agregar</button></div></form>';
    $('tf-cancel').addEventListener('click', function () { wrap.innerHTML = ''; });
    $('t-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('tf-error');
      fe.hidden = true;
      var name = $('tf-name').value.trim();
      if (!name) { fe.textContent = 'El nombre es obligatorio.'; fe.hidden = false; return; }
      DB.createTable({ name: name, seats: Number($('tf-seats').value) || 2 }).then(function () { toast('Mesa agregada.'); wrap.innerHTML = ''; reloadMesas(); });
    });
  }

  // -------------------------------------------------------------- horarios

  function reloadHorarios() {
    var sec = sectionEl('horarios');
    sec.innerHTML = '<p class="admin-loading">Cargando horarios…</p>';
    DB.getSimpleHours().then(function (rows) { renderHorarios(rows || []); });
  }

  function renderHorarios(rows) {
    var sec = sectionEl('horarios');
    sec.innerHTML = '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Franjas de cocina</h3></div><div id="plan-rows"></div>' +
      '<div id="plan-save-wrap" style="margin-top:var(--sp-sm);text-align:right;" hidden><button type="button" class="admin-btn admin-btn--solid" id="plan-save-all">Guardar cambios</button></div>';

    var wrap = $('plan-rows');
    var html = '';
    for (var dow = 0; dow <= 6; dow++) {
      var r = null;
      for (var i = 0; i < rows.length; i++) { if (Number(rows[i].dow) === dow) { r = rows[i]; break; } }
      var active = r ? r.active !== false : false;
      var start = ((r && r.start_time) || '12:00').slice(0, 5);
      var end = ((r && r.end_time) || '23:00').slice(0, 5);
      html += '<div class="admin-plan-row" data-dow="' + dow + '"><span class="admin-plan-row__day">' + DAY_NAMES[dow] + '</span>' +
        '<label class="admin-check admin-check--bare"><input type="checkbox" data-pactive' + (active ? ' checked' : '') + '> Abierto</label>' +
        '<div class="admin-plan-row__times"><input type="time" data-pstart value="' + esc(start) + '"' + (active ? '' : ' disabled') + '>' +
        '<span aria-hidden="true">—</span><input type="time" data-pend value="' + esc(end) + '"' + (active ? '' : ' disabled') + '></div></div>';
    }
    wrap.innerHTML = html;

    wrap.querySelectorAll('[data-pactive]').forEach(function (box) {
      box.addEventListener('change', function () {
        var row = this.closest('.admin-plan-row');
        var dis = !this.checked;
        row.querySelector('[data-pstart]').disabled = dis;
        row.querySelector('[data-pend]').disabled = dis;
        $('plan-save-wrap').hidden = false;
      });
    });
    wrap.querySelectorAll('input[type="time"]').forEach(function (i) { i.addEventListener('change', function () { $('plan-save-wrap').hidden = false; }); });
    $('plan-save-all').addEventListener('click', function () {
      var promises = [];
      wrap.querySelectorAll('.admin-plan-row').forEach(function (row) {
        var dow = Number(row.getAttribute('data-dow'));
        promises.push(DB.updateSimpleHoursDay(dow, {
          active: row.querySelector('[data-pactive]').checked,
          start_time: row.querySelector('[data-pstart]').value,
          end_time: row.querySelector('[data-pend]').value
        }));
      });
      Promise.all(promises).then(function () { toast('Horarios guardados.'); $('plan-save-wrap').hidden = true; });
    });
  }

  // --------------------------------------------------- notificaciones

  function startPoll() {
    stopPoll();
    Promise.all([DB.listReservations({ date: todayISO(), status: 'pending' }), DB.listOrders({ date: todayISO(), status: 'pending' })]).then(function (res) {
      (res[0] || []).concat(res[1] || []).forEach(function (r) { knownPending[r.id] = true; });
      notifReady = true;
    });
    pollTimer = setInterval(pollNotif, 45000);
    root.addEventListener('storage', onStorageChange);
  }
  function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } root.removeEventListener('storage', onStorageChange); }
  function onStorageChange(ev) {
    if (ev.key && (ev.key.indexOf(SLUG + '_db_reservations') === 0 || ev.key.indexOf(SLUG + '_db_orders') === 0)) pollNotif();
  }
  function pollNotif() {
    if (!loggedIn) return;
    Promise.all([DB.listReservations({ date: todayISO(), status: 'pending' }), DB.listOrders({ date: todayISO(), status: 'pending' })]).then(function (res) {
      var list = (res[0] || []).concat(res[1] || []);
      var fresh = [];
      list.forEach(function (r) { if (notifReady && !knownPending[r.id]) fresh.push(r); knownPending[r.id] = true; });
      notifReady = true;
      if (fresh.length) { notifShowBanner(fresh); if (currentTab === 'dashboard') reloadDashboard(); }
    });
  }
  function notifInitUI() {
    var cta = $('notif-banner-cta'), close = $('notif-banner-close');
    if (cta) cta.addEventListener('click', function () { notifHideBanner(); switchTab('dashboard'); });
    if (close) close.addEventListener('click', notifHideBanner);
    var unlock = function () { notifEnsureAudio(); doc.removeEventListener('pointerdown', unlock); };
    doc.addEventListener('pointerdown', unlock);
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

  function initDateNav() {
    var prevBtn = $('dash-date-prev'), nextBtn = $('dash-date-next'), todayBtn = $('dash-date-today');
    if (prevBtn) prevBtn.onclick = function () { opDate = addDaysISO(opDate, -1); reloadDashboard(); };
    if (nextBtn) nextBtn.onclick = function () { opDate = addDaysISO(opDate, 1); reloadDashboard(); };
    if (todayBtn) todayBtn.onclick = function () { opDate = todayISO(); reloadDashboard(); };
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
