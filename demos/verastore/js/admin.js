'use strict';
/**
 * Vera Store — admin.js
 * Panel admin demo: pedidos del día persistidos en localStorage
 * (verastore_demo_orders). Auto-login con el PIN demo 0000.
 */
(function (root) {
  var cfg = root.SHOP_CONFIG || {};
  var DEMO = cfg.demo || {};
  var ORDERS_KEY = DEMO.storageKey || 'verastore_demo_orders';
  var SESSION_KEY = 'verastore_admin_token';
  var DEMO_PIN = String(DEMO.pin || '0000');

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatPrice(n) {
    return '$ ' + (Number(n) || 0).toLocaleString('es-UY');
  }

  function safeStorage() {
    try {
      var t = '__vs_admin__'; root.localStorage.setItem(t, '1'); root.localStorage.removeItem(t);
      return root.localStorage;
    } catch (e) { return null; }
  }
  var store = safeStorage();

  function readJSON(key, fallback) {
    if (!store) { return fallback; }
    try {
      var raw = store.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    if (!store) { return; }
    try { store.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  function isToday(iso) {
    if (!iso) { return false; }
    var d = new Date(iso);
    var now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function variantText(v) {
    if (!v) { return ''; }
    var parts = [];
    if (v.talle) { parts.push('Talle ' + v.talle); }
    if (v.color) { parts.push('Color ' + v.color); }
    return parts.join(', ');
  }

  /* Semilla de pedidos de ejemplo (solo si no hay ninguno aún). */
  function seedIfEmpty() {
    var orders = readJSON(ORDERS_KEY, []);
    if (Array.isArray(orders) && orders.length) { return; }
    var now = Date.now();
    var seed = [
      {
        id: 'PED-100241',
        cliente: 'Cliente Demo',
        telefono: '099123456',
        items: [
          { id: 'camisola-nube', name: 'Camisola Nube', price: 1900, qty: 1, variant: { talle: 'M', color: 'Terracota' }, subtotal: 1900 },
          { id: 'aros-sol', name: 'Aros Sol', price: 690, qty: 2, variant: { talle: null, color: 'Dorado' }, subtotal: 1380 }
        ],
        total: 3280,
        entrega: 'retiro',
        estado: 'pendiente',
        fecha: new Date(now - 40 * 60 * 1000).toISOString()
      },
      {
        id: 'PED-100238',
        cliente: 'Cliente Demo 2',
        telefono: '099000111',
        items: [
          { id: 'vela-ambar', name: 'Vela Ámbar', price: 850, qty: 1, variant: null, subtotal: 850 }
        ],
        total: 850,
        entrega: 'envio',
        estado: 'confirmado',
        fecha: new Date(now - 3 * 60 * 60 * 1000).toISOString()
      }
    ];
    writeJSON(ORDERS_KEY, seed);
  }

  /* ------------------------------ Login ---------------------------------- */
  function showPanel() {
    var login = $('#login-view');
    var panel = $('#admin-panel');
    if (login) { login.hidden = true; }
    if (panel) { panel.hidden = false; }
    render();
  }
  function doLogin(pin) {
    if (String(pin) === DEMO_PIN) {
      try { root.sessionStorage.setItem(SESSION_KEY, 'demo'); } catch (e) { /* ignore */ }
      showPanel();
      return true;
    }
    var err = $('#login-error');
    if (err) { err.textContent = 'PIN incorrecto. Para el demo usá 0000.'; err.hidden = false; }
    return false;
  }
  function logout() {
    try { root.sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
    var login = $('#login-view');
    var panel = $('#admin-panel');
    if (login) { login.hidden = false; }
    if (panel) { panel.hidden = true; }
  }
  function hasSession() {
    try { return !!root.sessionStorage.getItem(SESSION_KEY); } catch (e) { return false; }
  }

  /* ------------------------------ Render --------------------------------- */
  function getTodayOrders() {
    var orders = readJSON(ORDERS_KEY, []);
    if (!Array.isArray(orders)) { return []; }
    return orders.filter(function (o) { return isToday(o.fecha); });
  }

  function render() {
    var orders = getTodayOrders();
    var pendientes = orders.filter(function (o) { return o.estado !== 'confirmado'; }).length;
    var confirmados = orders.filter(function (o) { return o.estado === 'confirmado'; }).length;
    var total = orders.reduce(function (acc, o) { return acc + (Number(o.total) || 0); }, 0);

    var kToday = $('#kpi-orders'); if (kToday) { kToday.textContent = orders.length; }
    var kPend = $('#kpi-pending'); if (kPend) { kPend.textContent = pendientes; }
    var kConf = $('#kpi-confirmed'); if (kConf) { kConf.textContent = confirmados; }
    var kTotal = $('#kpi-total'); if (kTotal) { kTotal.textContent = formatPrice(total); }
    var sub = $('#admin-date'); if (sub) { sub.textContent = 'Pedidos del ' + todayISO(); }

    var list = $('#orders-list');
    if (!list) { return; }
    if (!orders.length) {
      list.innerHTML = '<div class="admin-empty"><p style="margin:0">Todavía no hay pedidos hoy.</p>' +
        '<p style="margin:6px 0 0;font-size:.85rem">Hacé un pedido de prueba desde la tienda y aparecerá acá.</p></div>';
      return;
    }
    list.innerHTML = orders.map(function (o) {
      var estado = o.estado === 'confirmado' ? 'confirmado' : 'pendiente';
      return '' +
        '<article class="order-card" data-order="' + esc(o.id) + '">' +
          '<div class="order-card__head">' +
            '<div>' +
              '<p class="order-card__id">' + esc(o.id) + '</p>' +
              '<p class="order-card__meta">' + esc(o.cliente) + ' · ' + esc(o.telefono || '') + ' · ' + esc(o.entrega === 'envio' ? 'Envío' : 'Retiro') + '</p>' +
            '</div>' +
            '<span class="order-status order-status--' + estado + '">' + (estado === 'confirmado' ? 'Confirmado' : 'Pendiente') + '</span>' +
          '</div>' +
          '<div class="order-lines">' +
            (o.items || []).map(function (it) {
              var vt = variantText(it.variant);
              return '<div class="order-line"><span>' + it.qty + 'x ' + esc(it.name) +
                (vt ? ' <span class="order-line__variant">(' + esc(vt) + ')</span>' : '') + '</span>' +
                '<span>' + formatPrice(it.subtotal != null ? it.subtotal : it.price * it.qty) + '</span></div>';
            }).join('') +
          '</div>' +
          '<div class="order-card__foot">' +
            '<div class="order-card__total"><span>Total</span>' + formatPrice(o.total) + '</div>' +
            '<div class="order-card__actions">' +
              (estado === 'pendiente'
                ? '<button type="button" class="btn btn--solid btn--sm" data-confirm="' + esc(o.id) + '">Marcar confirmado</button>'
                : '<button type="button" class="btn btn--ghost btn--sm" data-reopen="' + esc(o.id) + '">Volver a pendiente</button>') +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  function setEstado(id, estado) {
    var orders = readJSON(ORDERS_KEY, []);
    if (!Array.isArray(orders)) { return; }
    orders.forEach(function (o) { if (o.id === id) { o.estado = estado; } });
    writeJSON(ORDERS_KEY, orders);
    render();
  }

  function bind() {
    var form = $('#login-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('#pin-input');
        doLogin(input ? input.value : '');
      });
    }
    var loginBtn = $('#login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        var input = $('#pin-input');
        doLogin(input ? input.value : '');
      });
    }
    var logoutBtn = $('#logout-btn');
    if (logoutBtn) { logoutBtn.addEventListener('click', logout); }

    var list = $('#orders-list');
    if (list) {
      list.addEventListener('click', function (e) {
        var c = e.target.closest('[data-confirm]');
        if (c) { setEstado(c.getAttribute('data-confirm'), 'confirmado'); return; }
        var r = e.target.closest('[data-reopen]');
        if (r) { setEstado(r.getAttribute('data-reopen'), 'pendiente'); }
      });
    }
  }

  function init() {
    bind();
    seedIfEmpty();
    // Auto-login con PIN demo si no hay token de sesión.
    if (hasSession()) {
      showPanel();
    } else {
      doLogin(DEMO_PIN);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
