'use strict';
/**
 * El Fogatero — resto.js
 * Carta digital con filtros por categoría, formulario de reserva con cupos
 * por franja, armado del mensaje de WhatsApp, persistencia de reservas en
 * localStorage y página gracias.
 *
 * La lógica pura (precios, disponibilidad, cupos, mensaje WhatsApp, reserva)
 * se expone en window.RESTO.logic para poder testearla con Node sin DOM.
 */
(function (root) {
  var cfg = root.RESTO_CONFIG || {};
  var tenant = cfg.tenant || {};
  var DEMO = cfg.demo || {};
  var MENU = (cfg.DEMO_MENU || []).slice();
  var SLOTS = cfg.slots || {};
  var BOOKING = cfg.booking || {};
  var RESERVAS_KEY = DEMO.storageKey || 'fogatero_demo_reservas';
  var WA_BASE = (cfg.whatsapp && cfg.whatsapp.base) || 'https://wa.me/59899000000';

  var RESTAURANT_NAME = tenant.name || 'El Fogatero';

  var DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

  /* ======================================================================
   * LÓGICA PURA (testeable en Node)
   * ==================================================================== */

  function formatPrice(n) {
    var num = Number(n) || 0;
    return '$ ' + num.toLocaleString('es-UY');
  }

  function isDishAvailable(dish) {
    return !!dish && dish.stock !== 'agotado';
  }

  function slotsOf(franja) {
    return (SLOTS[franja] && SLOTS[franja].times) || [];
  }

  /** Personas ya ocupadas de la misma fecha + franja (1 sala). */
  function occupiedPersons(reservas, fecha, franja) {
    reservas = reservas || [];
    var total = 0;
    for (var i = 0; i < reservas.length; i++) {
      var r = reservas[i] || {};
      if (r.fecha === fecha && r.franja === franja) {
        total += Number(r.personas) || 0;
      }
    }
    return total;
  }

  function capacityOf(franja) {
    return (SLOTS[franja] && SLOTS[franja].capacity) || 0;
  }

  /** ¿Entra la reserva? { ok, remaining } con remaining = cupos que quedan. */
  function canBook(ocupadas, personas, franja) {
    var cap = capacityOf(franja);
    var used = Number(ocupadas) || 0;
    var n = Number(personas) || 0;
    var remaining = Math.max(0, cap - used);
    var min = (BOOKING && BOOKING.minGuests) || 1;
    var ok = n >= min && n <= remaining;
    return { ok: ok, remaining: remaining };
  }

  function clampGuests(n) {
    var min = (BOOKING && BOOKING.minGuests) || 1;
    var max = (BOOKING && BOOKING.maxGuests) || 8;
    var v = Number(n);
    if (!isFinite(v)) { v = min; }
    return Math.max(min, Math.min(max, Math.round(v)));
  }

  /** '2026-09-19' → 'sábado 19 de setiembre de 2026' (fecha local). */
  function formatDate(iso) {
    var parts = String(iso || '').split('-');
    if (parts.length !== 3) { return String(iso || ''); }
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    var d = Number(parts[2]);
    var dt = new Date(y, m - 1, d);
    return DAYS[dt.getDay()] + ' ' + d + ' de ' + MONTHS[m - 1] + ' de ' + y;
  }

  /**
   * Mensaje pre-formateado de la reserva para WhatsApp (formato exacto PRD §5.2).
   * reserva: { fecha, franja, hora, personas, nombre, telefono }
   */
  function buildWhatsAppMessage(reserva) {
    var r = reserva || {};
    var franjaLabel = (SLOTS[r.franja] && SLOTS[r.franja].label) || r.franja || '';
    var lines = [
      'Hola ' + RESTAURANT_NAME + ', quiero reservar una mesa.',
      '',
      'Fecha: ' + formatDate(r.fecha),
      'Franja: ' + franjaLabel,
      'Horario: ' + (r.hora || ''),
      'Personas: ' + clampGuests(r.personas),
      'Nombre: ' + (r.nombre || ''),
      'Teléfono: ' + (r.telefono || ''),
      '',
      'Quedamos a la espera de confirmación. ¡Gracias!'
    ];
    return lines.join('\n');
  }

  function whatsappUrl(message) {
    return WA_BASE + '?text=' + encodeURIComponent(message);
  }

  function nextReservationId(existing) {
    existing = existing || [];
    var max = 0;
    for (var i = 0; i < existing.length; i++) {
      var m = /RES-(\d+)/.exec(String((existing[i] || {}).id || ''));
      if (m) {
        var n = Number(m[1]);
        if (n > max) { max = n; }
      }
    }
    return 'RES-' + String(max + 1).padStart(6, '0');
  }

  /** Crea la reserva { id, fecha, franja, hora, personas, nombre, telefono, estado, creadoISO }. */
  function createReservation(data, existing) {
    data = data || {};
    var list = existing != null ? existing : [];
    return {
      id: nextReservationId(list),
      fecha: data.fecha || '',
      franja: data.franja || 'almuerzo',
      hora: data.hora || '',
      personas: clampGuests(data.personas),
      nombre: String(data.nombre == null ? '' : data.nombre).trim(),
      telefono: String(data.telefono == null ? '' : data.telefono).trim(),
      estado: 'pendiente',
      creadoISO: new Date().toISOString()
    };
  }

  var LOGIC = {
    formatPrice: formatPrice,
    isDishAvailable: isDishAvailable,
    slotsOf: slotsOf,
    occupiedPersons: occupiedPersons,
    capacityOf: capacityOf,
    canBook: canBook,
    clampGuests: clampGuests,
    formatDate: formatDate,
    buildWhatsAppMessage: buildWhatsAppMessage,
    whatsappUrl: whatsappUrl,
    createReservation: createReservation
  };

  var RESTO = { config: cfg, logic: LOGIC, menu: MENU, keys: { reservas: RESERVAS_KEY } };
  root.RESTO = RESTO;

  /* ======================================================================
   * UI (solo en navegador)
   * ==================================================================== */
  if (typeof document === 'undefined') { return; }

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeStorage() {
    try {
      var t = '__resto_test__';
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
  function addDaysISO(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function categories() {
    var cats = [];
    MENU.forEach(function (d) { if (cats.indexOf(d.category) === -1) { cats.push(d.category); } });
    return cats;
  }

  var state = {
    filter: 'Todas',
    slot: 'almuerzo',
    time: null,
    guests: 4
  };

  /* ------------------------------ Carta --------------------------------- */
  function dishImg(dish) {
    return 'img/' + dish.id + '.jpg';
  }

  function dishCardHTML(dish) {
    var out = !isDishAvailable(dish);
    return '' +
      '<article class="dish-card' + (out ? ' is-agotado' : '') + '" data-dish-id="' + esc(dish.id) + '" data-stock="' + esc(dish.stock) + '">' +
        (out ? '<span class="badge-agotado">Agotado</span>' : '') +
        '<div class="dish-card__media">' +
          '<img src="' + esc(dishImg(dish)) + '" alt="' + esc(dish.name) + ' — ' + esc(dish.category) + '" loading="lazy" decoding="async" role="img">' +
        '</div>' +
        '<div class="dish-card__body">' +
          '<span class="dish-card__cat">' + esc(dish.category) + '</span>' +
          '<h3 class="dish-card__name">' + esc(dish.name) + '</h3>' +
          '<p class="dish-card__desc">' + esc(dish.desc) + '</p>' +
          '<div class="dish-card__foot">' +
            '<span class="dish-card__price">' + formatPrice(dish.price) + '</span>' +
            '<span class="dish-card__stock">' + (out ? 'Sin stock hoy' : 'Disponible') + '</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderFilters() {
    var box = $('#cat-filter');
    if (!box) { return; }
    var cats = ['Todas'].concat(categories());
    box.innerHTML = cats.map(function (cat) {
      var count = cat === 'Todas' ? MENU.length : MENU.filter(function (d) { return d.category === cat; }).length;
      return '<button type="button" class="chip" data-filter="' + esc(cat) + '" aria-pressed="' + (state.filter === cat) + '">' +
        esc(cat) + '<span class="chip__count">' + count + '</span></button>';
    }).join('');
  }

  function renderMenu() {
    var grid = $('#menu-grid');
    if (!grid) { return; }
    var list = state.filter === 'Todas'
      ? MENU
      : MENU.filter(function (d) { return d.category === state.filter; });
    if (!list.length) {
      grid.innerHTML = '<p class="empty-state">No hay platos en esta categoría.</p>';
      return;
    }
    grid.innerHTML = list.map(function (d) { return dishCardHTML(d); }).join('');
    var first = grid.querySelector('[data-dish-id]');
    if (first) { first.id = 'dish-card'; }
  }

  /* ------------------------- Formulario de reserva ---------------------- */
  function currentReservas() {
    var list = readJSON(RESERVAS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function renderSlotChips() {
    var box = $('#res-slot');
    if (!box) { return; }
    $$('#res-slot [data-franja]', box).forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-franja') === state.slot));
    });
  }

  function renderTimes() {
    var box = $('#res-time');
    var dateEl = $('#res-date');
    if (!box) { return; }
    var fecha = dateEl ? dateEl.value : state.fecha || todayISO();
    var times = slotsOf(state.slot);
    var ocupadas = occupiedPersons(currentReservas(), fecha, state.slot);
    var franjaLlena = ocupadas >= capacityOf(state.slot);
    if (!times.length) {
      box.innerHTML = '<p class="field-hint">Elegí una franja para ver los horarios.</p>';
      return;
    }
    box.innerHTML = times.map(function (t) {
      var disabled = franjaLlena;
      return '<button type="button" class="time-chip' + (state.time === t ? ' is-active' : '') + '" data-time="' + esc(t) + '"' +
        (disabled ? ' disabled' : '') + ' aria-pressed="' + (state.time === t) + '">' + esc(t) + '</button>';
    }).join('');
    box.setAttribute('aria-label', 'Horarios disponibles para ' + ((SLOTS[state.slot] || {}).label || '') + ' — quedan ' + Math.max(0, capacityOf(state.slot) - ocupadas) + ' lugares');
    // HU-3: aviso claro en #res-availability-msg cuando la franja está llena.
    if (franjaLlena) {
      var label = (SLOTS[state.slot] || {}).label || state.slot;
      setAvailabilityMsg(
        'La franja elegida está llena: no quedan cupos para ' + label + ' el ' + formatDate(fecha) +
        '. Probá otra franja u otra fecha.',
        'error'
      );
    } else {
      setAvailabilityMsg('');
    }
  }

  function renderGuests() {
    var box = $('#res-guests');
    if (!box) { return; }
    var value = box.querySelector('.stepper__value');
    if (value) { value.textContent = state.guests; }
  }

  function setAvailabilityMsg(text, kind) {
    var el = $('#res-availability-msg');
    if (!el) { return; }
    if (text) {
      el.textContent = text;
      el.className = 'availability-msg ' + (kind === 'error' ? 'availability-msg--error' : (kind === 'ok' ? 'availability-msg--ok' : ''));
      el.hidden = false;
    } else {
      el.textContent = '';
      el.className = 'availability-msg';
      el.hidden = true;
    }
  }

  function validateForm(data) {
    if (!data.fecha) { return 'Elegí una fecha para la reserva.'; }
    if (!data.hora) { return 'Elegí un horario dentro de la franja.'; }
    if (!data.nombre) { return 'Contanos tu nombre para la reserva.'; }
    if (!data.telefono) { return 'Dejanos un teléfono para confirmar por WhatsApp.'; }
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    var dateEl = $('#res-date');
    var nameEl = $('#res-name');
    var phoneEl = $('#res-phone');
    var data = {
      fecha: dateEl ? dateEl.value : '',
      franja: state.slot,
      hora: state.time,
      personas: state.guests,
      nombre: nameEl ? nameEl.value.trim() : '',
      telefono: phoneEl ? phoneEl.value.trim() : ''
    };

    var err = validateForm(data);
    if (err) { setAvailabilityMsg(err, 'error'); return; }

    var reservas = currentReservas();
    var ocupadas = occupiedPersons(reservas, data.fecha, data.franja);
    var check = canBook(ocupadas, data.personas, data.franja);

    if (!check.ok) {
      var franjaLabel = (SLOTS[data.franja] && SLOTS[data.franja].label) || data.franja;
      setAvailabilityMsg(
        'Franja llena: no quedan cupos para ' + franjaLabel + ' el ' + formatDate(data.fecha) +
        '. Quedan ' + check.remaining + ' lugar' + (check.remaining === 1 ? '' : 'es') +
        ' y la reserva es de ' + data.personas + ' persona' + (data.personas === 1 ? '' : 's') +
        '. Probá otra franja u otra fecha.',
        'error'
      );
      return; // NO se abre WhatsApp
    }

    var reserva = createReservation(data, reservas);
    reservas.unshift(reserva);
    writeJSON(RESERVAS_KEY, reservas);

    var msg = buildWhatsAppMessage(reserva);
    var waUrl = whatsappUrl(msg);
    root.open(waUrl, '_blank');

    setAvailabilityMsg('Reserva enviada por WhatsApp. Te redirigimos al resumen.', 'ok');

    var submit = $('#reserve-submit');
    if (submit) { submit.disabled = true; }
    setTimeout(function () {
      root.location.href = 'gracias.html';
    }, 900);
  }

  /* ------------------------------ Eventos ------------------------------- */
  function bindEvents() {
    var filter = $('#cat-filter');
    if (filter) {
      filter.addEventListener('click', function (e) {
        var chip = e.target.closest('[data-filter]');
        if (!chip) { return; }
        var next = chip.getAttribute('data-filter');
        state.filter = next;
        renderFilters();
        renderMenu();
        // P2-7: restaurar el foco en el chip activo tras el re-render.
        var restored = filter.querySelector('[data-filter="' + next + '"]');
        if (restored) { restored.focus(); }
      });
    }

    var slotBox = $('#res-slot');
    if (slotBox) {
      slotBox.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-franja]');
        if (!btn) { return; }
        state.slot = btn.getAttribute('data-franja');
        state.time = null;
        renderSlotChips();
        renderTimes();
      });
    }

    var timeBox = $('#res-time');
    if (timeBox) {
      timeBox.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-time]');
        if (!btn || btn.disabled) { return; }
        state.time = btn.getAttribute('data-time');
        renderTimes();
      });
    }

    var guestsBox = $('#res-guests');
    if (guestsBox) {
      guestsBox.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-gstep]');
        if (!btn) { return; }
        state.guests = clampGuests(state.guests + Number(btn.getAttribute('data-gstep')));
        renderGuests();
      });
    }

    var dateEl = $('#res-date');
    if (dateEl) {
      dateEl.addEventListener('change', function () {
        state.time = null;
        renderTimes();
        setAvailabilityMsg('');
      });
    }

    var form = $('#reservation-form');
    if (form) { form.addEventListener('submit', handleSubmit); }

    // Nav drawer (mobile) — accesible: inert al cerrar, focus trap al abrir.
    var drawer = $('#nav-drawer');
    var navToggle = $('[data-nav-toggle]');

    if (drawer) { drawer.setAttribute('tabindex', '-1'); }

    function drawerFocusables() {
      if (!drawer) { return []; }
      var nodes = drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      return Array.prototype.filter.call(nodes, function (el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
      });
    }

    function closeDrawer(returnFocus) {
      document.body.classList.remove('nav-open');
      if (navToggle) { navToggle.setAttribute('aria-expanded', 'false'); }
      if (returnFocus && navToggle) { navToggle.focus(); }
    }

    if (navToggle) {
      navToggle.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(open));
        if (open) {
          var firstLink = drawer && drawer.querySelector('a[href]');
          (firstLink || drawer || navToggle).focus();
        } else if (document.activeElement && drawer && drawer.contains(document.activeElement)) {
          navToggle.focus();
        }
      });
    }
    $$('.nav-drawer__link, [data-nav-close]').forEach(function (link) {
      link.addEventListener('click', function () { closeDrawer(true); });
    });
    $$('[data-scrim]').forEach(function (sc) {
      sc.addEventListener('click', function () { closeDrawer(true); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (document.body.classList.contains('nav-open')) { closeDrawer(true); }
        return;
      }
      if (e.key === 'Tab' && document.body.classList.contains('nav-open')) {
        var f = drawerFocusables();
        var active = document.activeElement;
        if (!f.length) {
          e.preventDefault();
          if (drawer) { drawer.focus(); }
          return;
        }
        var first = f[0];
        var last = f[f.length - 1];
        if (e.shiftKey) {
          if (active === first || !drawer || !drawer.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !drawer || !drawer.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    var header = $('.site-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', root.scrollY > 12); };
      root.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  function init() {
    var dateEl = $('#res-date');
    if (dateEl) {
      dateEl.min = todayISO();
      dateEl.max = addDaysISO((BOOKING && BOOKING.maxDaysAhead) || 60);
      dateEl.value = todayISO();
    }
    renderFilters();
    renderMenu();
    renderSlotChips();
    renderTimes();
    renderGuests();
    bindEvents();
  }

  RESTO.renderMenu = renderMenu;
  RESTO.renderFilters = renderFilters;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);