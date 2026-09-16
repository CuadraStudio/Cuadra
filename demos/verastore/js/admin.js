/**
 * Panel de administración — CUADRA Tienda.
 *
 * Mismo shell y misma capa de datos (CUADRA_DB) que el panel de Agenda,
 * pero el negocio es otro: pedidos en vez de turnos, catálogo en vez de
 * servicios, sin equipo con agenda propia. Tabs: Pedidos (dashboard),
 * Catálogo, Horarios.
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
  var orderDate = todayISO();
  var pollTimer = null;
  var knownPending = {};
  var notifReady = false;
  var notifAudioCtx = null;
  var notifAudioOk = false;
  var notifMuted = false;
  try { notifMuted = root.localStorage.getItem(NOTIF_MUTED_KEY) === '1'; } catch (e) {}

  var lastProducts = [];
  var editingProductId = null;

  var DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  var STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Entregado', cancelled: 'Cancelado' };

  function $(id) { return doc.getElementById(id); }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function addDaysISO(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function mondayOf(dateStr) { var d = new Date(dateStr + 'T12:00:00'); var dow = d.getDay(); return addDaysISO(dateStr, dow === 0 ? -6 : 1 - dow); }
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
    titleEl.textContent = fresh.length === 1 ? '¡Nuevo pedido!' : '¡' + fresh.length + ' pedidos nuevos!';
    listEl.innerHTML = fresh.map(function (o) { return '<li><strong>' + esc(o.client_name) + '</strong> · ' + money(o.total) + '</li>'; }).join('');
    banner.hidden = false;
    banner.classList.remove('admin-notif-banner--in');
    void banner.offsetWidth;
    banner.classList.add('admin-notif-banner--in');
    notifPlayDing();
  }
  function notifHideBanner() { var b = $('notif-banner'); if (b) b.hidden = true; }
  function updateBadge() {}

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
    wireDashNewOrder();
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
    if (name === 'catalogo') reloadCatalogo();
    if (name === 'horarios') reloadHorarios();
  }
  function wireDashNewOrder() {
    var btn = $('dash-new-appt');
    if (!btn || btn._wired) return;
    btn._wired = true;
    btn.addEventListener('click', renderNewOrderForm);
  }
  function sectionEl(name) { return $('tab-' + name); }

  // ============================================================ DASHBOARD

  function reloadDashboard() {
    var sub = $('dash-date-sub');
    if (sub) sub.textContent = cap(fmtDateLong(orderDate));
    $('dash-extra-1').innerHTML = '';
    $('dash-appointments').innerHTML = '<p class="admin-loading">Cargando…</p>';

    Promise.all([DB.listOrders({ date: orderDate }), DB.listProducts(), DB.listOrders({})]).then(function (res) {
      var todayList = res[0] || [];
      lastProducts = res[1] || [];
      var allList = res[2] || [];
      var weekStart = mondayOf(todayISO());
      var weekTotal = allList.filter(function (o) { return o.date >= weekStart && o.date <= addDaysISO(weekStart, 6); }).length;
      renderKpis(todayList, weekTotal);
      renderTopProducts(todayList);
      renderOrders(todayList);
    });
  }

  function renderKpis(list, weekTotal) {
    var counts = { total: list.length, pending: 0, confirmed: 0 };
    for (var i = 0; i < list.length; i++) { if (list[i].status === 'pending') counts.pending++; if (list[i].status === 'confirmed') counts.confirmed++; }
    $('kpi-today-count').textContent = String(counts.total);
    $('kpi-pending').textContent = String(counts.pending);
    $('kpi-confirmed').textContent = String(counts.confirmed);
    $('kpi-week-pct').textContent = String(weekTotal);
  }

  function renderTopProducts(list) {
    var map = {};
    list.forEach(function (o) { (o.items || []).forEach(function (it) { map[it.name] = (map[it.name] || 0) + (it.qty || 1); }); });
    var keys = Object.keys(map);
    var box = $('dash-extra-1');
    if (!keys.length) { box.innerHTML = '<h3 class="admin-dash-section__title">Productos pedidos hoy</h3><p class="admin-empty">Sin pedidos todavía.</p>'; return; }
    keys.sort(function (a, b) { return map[b] - map[a]; });
    var html = '<h3 class="admin-dash-section__title">Productos pedidos hoy</h3><div class="admin-dash-services">';
    keys.forEach(function (k, i) {
      html += '<div class="admin-svc-card"><span class="admin-svc-card__index">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="admin-svc-card__name">' + esc(k) + '</span><span class="admin-svc-card__count">' + map[k] + '</span></div>';
    });
    box.innerHTML = html + '</div>';
  }

  function renderOrders(list) {
    var container = $('dash-appointments');
    if (!list.length) { container.innerHTML = '<div class="admin-empty">Sin pedidos para ' + fmtDateShort(orderDate) + '.</div>'; return; }
    list.sort(function (a, b) { return String(b.created || '').localeCompare(String(a.created || '')); });

    var html = '<div class="admin-dash-appts">';
    list.forEach(function (o) {
      var itemsTxt = (o.items || []).map(function (it) { return it.qty + 'x ' + it.name; }).join(', ') || o.note || '—';
      var chipCls = o.status === 'confirmed' ? ' admin-chip--ok' : (o.status === 'cancelled' ? ' admin-chip--danger' : ' admin-chip--warn');
      var actions = '';
      if (o.status === 'pending') actions += ordActBtn(o.id, 'confirm', 'Marcar entregado');
      if (o.status !== 'cancelled') actions += ordActBtn(o.id, 'cancel', 'Cancelar');
      else actions += ordActBtn(o.id, 'pending', 'Reactivar');
      actions += ordActBtn(o.id, 'delete', 'Eliminar');

      html += '<div class="admin-dash-appt"><time class="admin-dash-appt__time">' + esc((o.created || '').slice(11, 16)) + '</time>' +
        '<div class="admin-dash-appt__info"><div class="admin-dash-appt__name">' + esc(o.client_name) + ' · ' + money(o.total) + '</div>' +
        '<div class="admin-dash-appt__meta">' + esc(itemsTxt) + (o.client_phone ? ' · ' + esc(o.client_phone) : '') + (o.entrega ? ' · ' + esc(o.entrega) : '') + '</div></div>' +
        '<span class="admin-chip' + chipCls + '">' + (STATUS_LABELS[o.status] || esc(o.status)) + '</span>' +
        '<div class="admin-dash-appt__actions">' + actions + '</div></div>';
    });
    container.innerHTML = html + '</div>';

    container.querySelectorAll('[data-ord]').forEach(function (btn) {
      btn.addEventListener('click', function () { handleOrderAction(this.getAttribute('data-do'), this.getAttribute('data-ord')); });
    });
  }

  function ordActBtn(id, action, label) { return '<button type="button" class="admin-btn" data-ord="' + esc(id) + '" data-do="' + action + '">' + label + '</button>'; }

  function handleOrderAction(action, id) {
    if (action === 'delete') {
      if (!root.confirm('¿Eliminar este pedido?')) return;
      DB.deleteOrder(id).then(function () { toast('Eliminado.'); reloadDashboard(); });
      return;
    }
    var status = action === 'confirm' ? 'confirmed' : (action === 'cancel' ? 'cancelled' : 'pending');
    DB.updateOrderStatus(id, status).then(function () { toast('Actualizado.'); reloadDashboard(); });
  }

  function renderNewOrderForm() {
    var overlay = $('appt-edit-overlay');
    if (!overlay) return;
    var opts = lastProducts.filter(function (p) { return p.active !== false; })
      .map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + ' — ' + money(p.price) + '</option>'; }).join('');

    overlay.innerHTML = '<div class="admin-appt-form"><div class="admin-appt-form__title">Nuevo pedido</div>' +
      '<form id="ord-form" class="admin-form">' +
      '<div class="admin-form__full"><label for="o-name">Cliente *</label><input type="text" id="o-name" required></div>' +
      '<div><label for="o-phone">Teléfono *</label><input type="text" id="o-phone" required></div>' +
      '<div><label for="o-prod">Producto</label><select id="o-prod"><option value="">— Ninguno —</option>' + opts + '</select></div>' +
      '<div><label for="o-qty">Cantidad</label><input type="number" id="o-qty" min="1" value="1"></div>' +
      '<div><label for="o-entrega">Entrega</label><select id="o-entrega"><option value="retiro">Retiro en el local</option><option value="envio">Envío</option></select></div>' +
      '<div class="admin-form__full"><label for="o-note">Otros ítems / notas</label><textarea id="o-note" rows="2"></textarea></div>' +
      '<p class="admin-error-text" id="o-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="o-cancel">Cancelar</button><button type="submit" class="admin-btn admin-btn--solid">Crear pedido</button></div></form></div>';

    overlay.hidden = false;
    $('o-cancel').addEventListener('click', function () { overlay.hidden = true; overlay.innerHTML = ''; });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) { overlay.hidden = true; overlay.innerHTML = ''; } });

    $('ord-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('o-error');
      fe.hidden = true;
      var name = $('o-name').value.trim(), phone = $('o-phone').value.trim();
      if (!name || !phone) { fe.textContent = 'Nombre y teléfono son obligatorios.'; fe.hidden = false; return; }
      var prodId = $('o-prod').value, qty = Number($('o-qty').value) || 1;
      var items = [];
      var total = 0;
      if (prodId) {
        var prod = null;
        for (var i = 0; i < lastProducts.length; i++) { if (lastProducts[i].id === prodId) { prod = lastProducts[i]; break; } }
        if (prod) { items.push({ name: prod.name, qty: qty, price: prod.price }); total = prod.price * qty; }
      }
      DB.createOrder({ client_name: name, client_phone: phone, entrega: $('o-entrega').value, items: items, total: total, note: $('o-note').value.trim() || null, date: orderDate }).then(function () {
        toast('Pedido creado.');
        overlay.hidden = true; overlay.innerHTML = '';
        reloadDashboard();
      });
    });
  }

  // ------------------------------------------------------------- catálogo

  function reloadCatalogo() {
    var sec = sectionEl('catalogo');
    sec.innerHTML = '<p class="admin-loading">Cargando catálogo…</p>';
    DB.listProducts().then(function (list) { lastProducts = list || []; renderCatalogo(lastProducts); });
  }

  function renderCatalogo(list) {
    var sec = sectionEl('catalogo');
    var rows;
    if (!list.length) {
      rows = '<div class="admin-empty">Sin productos. Creá el primero con "+ Nuevo producto".</div>';
    } else {
      rows = '<div class="admin-list">';
      list.forEach(function (p) {
        rows += '<div class="admin-list__item"><div class="admin-item__main">' +
          '<div class="admin-item__name">' + esc(p.name) + '</div>' +
          '<div class="admin-item__meta">' + money(p.price) + (p.category ? ' · ' + esc(p.category) : '') + ' · ' + esc(p.stock === 'agotado' ? 'Agotado' : 'Disponible') + '</div></div>' +
          '<span class="admin-chip ' + (p.active === false ? 'admin-chip--off' : 'admin-chip--ok') + '">' + (p.active === false ? 'Oculto' : 'Activo') + '</span>' +
          '<div class="admin-item__actions"><button type="button" class="admin-btn" data-p-stock="' + esc(p.id) + '">' + (p.stock === 'agotado' ? 'Marcar disponible' : 'Marcar agotado') + '</button>' +
          '<button type="button" class="admin-btn" data-p-edit="' + esc(p.id) + '">Editar</button>' +
          '<button type="button" class="admin-btn admin-btn--danger" data-p-del="' + esc(p.id) + '">Eliminar</button></div></div>';
      });
      rows += '</div>';
    }
    sec.innerHTML = '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Catálogo</h3>' +
      '<button type="button" class="admin-btn admin-btn--solid" id="p-new">+ Nuevo producto</button></div>' + rows + '<div id="p-form-wrap"></div>';

    $('p-new').addEventListener('click', function () { renderProductForm(null); });
    sec.querySelectorAll('[data-p-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-p-edit');
        var found = null;
        for (var i = 0; i < lastProducts.length; i++) { if (lastProducts[i].id === id) { found = lastProducts[i]; break; } }
        renderProductForm(found);
      });
    });
    sec.querySelectorAll('[data-p-stock]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-p-stock');
        var found = null;
        for (var i = 0; i < lastProducts.length; i++) { if (lastProducts[i].id === id) { found = lastProducts[i]; break; } }
        var next = found && found.stock === 'agotado' ? 'disponible' : 'agotado';
        DB.updateProduct(id, { stock: next }).then(function () { toast('Actualizado.'); reloadCatalogo(); });
      });
    });
    sec.querySelectorAll('[data-p-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!root.confirm('¿Eliminar este producto?')) return;
        DB.deleteProduct(this.getAttribute('data-p-del')).then(function () { toast('Eliminado.'); reloadCatalogo(); });
      });
    });
  }

  function renderProductForm(p) {
    var wrap = $('p-form-wrap');
    if (!wrap) return;
    editingProductId = p ? p.id : null;
    wrap.innerHTML = '<form class="admin-form" id="p-form">' +
      '<div class="admin-form__full"><label for="pf-name">Nombre *</label><input type="text" id="pf-name" value="' + esc(p && p.name) + '" required></div>' +
      '<div><label for="pf-price">Precio *</label><input type="number" id="pf-price" min="0" step="10" value="' + esc(p && p.price != null ? p.price : '') + '" required></div>' +
      '<div><label for="pf-cat">Categoría</label><input type="text" id="pf-cat" value="' + esc(p && p.category ? p.category : '') + '"></div>' +
      '<div class="admin-form__full"><label for="pf-desc">Descripción</label><textarea id="pf-desc" rows="2">' + esc(p && p.desc ? p.desc : '') + '</textarea></div>' +
      '<label class="admin-check"><input type="checkbox" id="pf-active"' + (!p || p.active !== false ? ' checked' : '') + '> Visible en la web</label>' +
      '<p class="admin-error-text" id="pf-error" hidden></p>' +
      '<div class="admin-form__actions"><button type="button" class="admin-btn admin-btn--ghosted" id="pf-cancel">Cancelar</button>' +
      '<button type="submit" class="admin-btn admin-btn--solid">' + (p ? 'Guardar cambios' : 'Crear producto') + '</button></div></form>';

    $('pf-cancel').addEventListener('click', function () { wrap.innerHTML = ''; });
    $('p-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fe = $('pf-error');
      fe.hidden = true;
      var patch = { name: $('pf-name').value.trim(), price: Number($('pf-price').value), category: $('pf-cat').value.trim(), desc: $('pf-desc').value.trim(), active: $('pf-active').checked };
      if (!patch.name || !(patch.price >= 0)) { fe.textContent = 'Nombre y precio son obligatorios.'; fe.hidden = false; return; }
      var op = editingProductId ? DB.updateProduct(editingProductId, patch) : DB.createProduct(patch);
      op.then(function () { toast(editingProductId ? 'Actualizado.' : 'Creado.'); wrap.innerHTML = ''; reloadCatalogo(); });
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
    sec.innerHTML = '<div class="admin-dash-section__head"><h3 class="admin-dash-section__title">Horario de atención</h3></div>' +
      '<div id="plan-rows"></div>' +
      '<div id="plan-save-wrap" style="margin-top:var(--sp-sm);text-align:right;" hidden><button type="button" class="admin-btn admin-btn--solid" id="plan-save-all">Guardar cambios</button></div>';

    var wrap = $('plan-rows');
    var html = '';
    for (var dow = 0; dow <= 6; dow++) {
      var r = null;
      for (var i = 0; i < rows.length; i++) { if (Number(rows[i].dow) === dow) { r = rows[i]; break; } }
      var active = r ? r.active !== false : false;
      var start = ((r && r.start_time) || '09:00').slice(0, 5);
      var end = ((r && r.end_time) || '19:00').slice(0, 5);
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
    DB.listOrders({ date: todayISO(), status: 'pending' }).then(function (list) {
      (list || []).forEach(function (o) { knownPending[o.id] = true; });
      notifReady = true;
    });
    pollTimer = setInterval(pollNotif, 45000);
    root.addEventListener('storage', onStorageChange);
  }
  function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } root.removeEventListener('storage', onStorageChange); }
  function onStorageChange(ev) { if (ev.key && ev.key.indexOf(SLUG + '_db_orders') === 0) pollNotif(); }
  function pollNotif() {
    if (!loggedIn) return;
    DB.listOrders({ date: todayISO(), status: 'pending' }).then(function (list) {
      var fresh = [];
      (list || []).forEach(function (o) { if (notifReady && !knownPending[o.id]) fresh.push(o); knownPending[o.id] = true; });
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
    if (prevBtn) prevBtn.onclick = function () { orderDate = addDaysISO(orderDate, -1); reloadDashboard(); };
    if (nextBtn) nextBtn.onclick = function () { orderDate = addDaysISO(orderDate, 1); reloadDashboard(); };
    if (todayBtn) todayBtn.onclick = function () { orderDate = todayISO(); reloadDashboard(); };
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
