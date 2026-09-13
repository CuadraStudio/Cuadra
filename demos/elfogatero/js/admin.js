'use strict';
/**
 * El Fogatero — admin.js
 * Panel admin demo: reservas del día persistidas en localStorage
 * (fogatero_demo_reservas). Auto-login con el PIN demo 0000 y token
 * de sesión en sessionStorage (fogatero_admin_token).
 */
(function (root) {
  var cfg = root.RESTO_CONFIG || {};
  var DEMO = cfg.demo || {};
  var RESERVAS_KEY = DEMO.storageKey || 'fogatero_demo_reservas';
  var SESSION_KEY = DEMO.sessionKey || 'fogatero_admin_token';
  var DEMO_PIN = String(DEMO.pin || '0000');
  var SLOTS = cfg.slots || {};
  var BOOKING = cfg.booking || {};

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeStorage() {
    try {
      var t = '__resto_admin__';
      root.localStorage.setItem(t, '1');
      root.localStorage.removeItem(t);
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

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* '2026-09-13' → 'domingo 13 de setiembre de 2026' (espejo de RESTO.logic.formatDate). */
  function formatDate(iso) {
    var parts = String(iso || '').split('-');
    if (parts.length !== 3) { return String(iso || ''); }
    var days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
    var d = Number(parts[2]);
    var m = Number(parts[1]);
    var dt = new Date(Number(parts[0]), m - 1, d);
    return days[dt.getDay()] + ' ' + d + ' de ' + months[m - 1] + ' de ' + parts[0];
  }

  function slotLabel(franja) {
    return (SLOTS[franja] && SLOTS[franja].label) || franja || '';
  }

  /* Semilla de reservas de ejemplo del día (solo si no hay ninguna aún). */
  function seedIfEmpty() {
    var list = readJSON(RESERVAS_KEY, []);
    if (Array.isArray(list) && list.length) { return; }
    var hoy = todayISO();
    var now = new Date().toISOString();
    var seed = [
      {
        id: 'RES-000001',
        fecha: hoy,
        franja: 'cena',
        hora: '20:30',
        personas: 2,
        nombre: 'Cliente Demo',
        telefono: '099123456',
        estado: 'pendiente',
        creadoISO: now
      },
      {
        id: 'RES-000002',
        fecha: hoy,
        franja: 'cena',
        hora: '21:00',
        personas: 4,
        nombre: 'Cliente Demo 2',
        telefono: '099000111',
        estado: 'confirmado',
        creadoISO: now
      }
    ];
    writeJSON(RESERVAS_KEY, seed);
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
  function getReservasDelDia() {
    var list = readJSON(RESERVAS_KEY, []);
    if (!Array.isArray(list)) { return []; }
    var hoy = todayISO();
    return list.filter(function (r) { return r && r.fecha === hoy; });
  }

  function renderConfig() {
    var card = $('#config-card');
    if (!card) { return; }
    var html = '';
    Object.keys(SLOTS).forEach(function (key) {
      var s = SLOTS[key] || {};
      html += '<div class="config-row">' +
        '<span class="config-row__label">' + esc(s.label || key) + '</span>' +
        '<span class="config-row__value">' + esc((s.times || []).join(' · ')) + '</span>' +
        '<span class="config-row__value">Capacidad: ' + (Number(s.capacity) || 0) + ' personas</span>' +
      '</div>';
    });
    html += '<div class="config-row">' +
      '<span class="config-row__label">Tope por reserva</span>' +
      '<span class="config-row__value">Entre ' + ((BOOKING && BOOKING.minGuests) || 1) + ' y ' + ((BOOKING && BOOKING.maxGuests) || 8) + ' personas</span>' +
    '</div>';
    card.innerHTML = '<h2 class="config-card__title">Configuración (solo lectura)</h2>' +
      '<p class="config-card__note">Franjas, horarios y capacidad por franja se editan en el plan Profesional.</p>' +
      html;
  }

  function render() {
    var hoy = todayISO();
    var list = getReservasDelDia();
    var pendientes = list.filter(function (r) { return r.estado !== 'confirmado'; }).length;
    var confirmados = list.filter(function (r) { return r.estado === 'confirmado'; }).length;
    var personas = list.reduce(function (acc, r) { return acc + (Number(r.personas) || 0); }, 0);

    var kToday = $('#kpi-today'); if (kToday) { kToday.textContent = list.length; }
    var kPend = $('#kpi-pending'); if (kPend) { kPend.textContent = pendientes; }
    var kConf = $('#kpi-confirmed'); if (kConf) { kConf.textContent = confirmados; }
    var kGuests = $('#kpi-guests'); if (kGuests) { kGuests.textContent = personas; }
    var sub = $('#admin-date'); if (sub) { sub.textContent = 'Reservas del ' + formatDate(hoy); }

    renderConfig();

    var listEl = $('#reservations-list');
    if (!listEl) { return; }
    if (!list.length) {
      listEl.innerHTML = '<div class="admin-empty"><p style="margin:0">Todavía no hay reservas hoy.</p>' +
        '<p style="margin:6px 0 0;font-size:.85rem">Hacé una reserva de prueba desde la web y aparecerá acá.</p></div>';
      return;
    }
    listEl.innerHTML = list.map(function (r) {
      var estado = r.estado === 'confirmado' ? 'confirmado' : 'pendiente';
      return '' +
        '<article class="reserva-card" data-res-id="' + esc(r.id) + '">' +
          '<div class="reserva-card__head">' +
            '<div>' +
              '<p class="reserva-card__id">' + esc(r.id) + '</p>' +
              '<p class="reserva-card__meta">' + esc(r.nombre) + ' · ' + esc(r.telefono || '') + '</p>' +
            '</div>' +
            '<span class="reserva-status reserva-status--' + estado + '">' + (estado === 'confirmado' ? 'Confirmado' : 'Pendiente') + '</span>' +
          '</div>' +
          '<div class="reserva-card__body">' +
            '<span>' + esc(slotLabel(r.franja)) + ' · ' + esc(r.hora || '') + '</span>' +
            '<span>' + (Number(r.personas) || 0) + ' persona' + ((Number(r.personas) || 0) === 1 ? '' : 's') + '</span>' +
          '</div>' +
          '<div class="reserva-card__foot">' +
            (estado === 'pendiente'
              ? '<button type="button" class="btn btn--solid btn--sm" data-confirm="' + esc(r.id) + '">Marcar confirmada</button>'
              : '<button type="button" class="btn btn--ghost btn--sm" data-reopen="' + esc(r.id) + '">Volver a pendiente</button>') +
          '</div>' +
        '</article>';
    }).join('');
  }

  function setEstado(id, estado) {
    var list = readJSON(RESERVAS_KEY, []);
    if (!Array.isArray(list)) { return; }
    list.forEach(function (r) { if (r && r.id === id) { r.estado = estado; } });
    writeJSON(RESERVAS_KEY, list);
    render();
  }

  function bind() {
    var form = $('#login-form');
    if (form) {
      // #login-btn es type="submit": un solo handler (submit) evita doLogin doble.
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('#pin-input');
        doLogin(input ? input.value : '');
      });
    }
    var logoutBtn = $('#logout-btn');
    if (logoutBtn) { logoutBtn.addEventListener('click', logout); }

    var listEl = $('#reservations-list');
    if (listEl) {
      listEl.addEventListener('click', function (e) {
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