/**
 * demoAgenda_static_site — Wizard de reservas (reservar.html)
 *
 * IIFE ES5, sin dependencias, sin i18n (español directo). Toda lectura/
 * escritura de datos pasa por window.CCESCO_DB (jamás fetch directo).
 *
 * Flujo: 1 servicio → 2 día+hora → 3 datos → 4 confirmación contra la API
 * (CCESCO_DB.createAppointment); WhatsApp queda como canal de seguimiento.
 * Fechas SIEMPRE locales: parseISODate arma new Date(y, m, d) — nunca
 * Date.parse sobre ISO (bug de zona). Todo dato dinámico interpolado a
 * innerHTML pasa por escapeHtml (R9).
 */
(function (root) {
  'use strict';

  var doc = document;
  var db = root.CCESCO_DB || null;
  var u = root.CCESCO_UTILS || {};

  // -------------------------------------------------------------------------
  // Estado + caché local de disponibilidad (se invalida al cambiar filtro)
  // -------------------------------------------------------------------------
  var state = {
    step: 1,
    services: [],
    servicesLoaded: false,
    serviceId: null,
    service: null,
    barbers: [],
    barberId: null,
    barber: null,
    date: null,      // 'YYYY-MM-DD'
    time: null,      // 'HH:MM'
    stripInit: false,
    appointment: null,
    formData: { name: '', phone: '', note: '' }
  };

  var els = {};
  var availCache = {}; // dateISO → { slots:[], barbers:[] }

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  // -------------------------------------------------------------------------
  // Helpers puros
  // -------------------------------------------------------------------------
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function esc(s) { return u.escapeHtml(s); }

  function motionReduce() {
    return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /** ISO 'YYYY-MM-DD' → Date LOCAL medianoche. Nunca Date.parse (zona). */
  function parseISODate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) { return null; }
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function toISO(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  /** 'lunes, 24 de agosto de 2026' */
  function formatFullDate(dateISO) {
    var d = parseISODate(dateISO);
    if (!d) { return String(dateISO || ''); }
    return DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()] +
      ' de ' + d.getFullYear();
  }

  function formatDur(min) {
    var n = Math.round(Number(min));
    return n > 0 ? n + ' min' : '\u2014';
  }

  /** Dígitos → '09X XXX XXX' (máx 9 dígitos). */
  function formatPhoneInput(value) {
    var digits = String(value || '').replace(/\D/g, '');
    if (digits.length > 9) { digits = digits.slice(0, 9); }
    if (digits.length > 6) { return digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6); }
    if (digits.length > 3) { return digits.slice(0, 3) + ' ' + digits.slice(3); }
    return digits;
  }

  function parseQuery(search) {
    var out = {};
    var qs = String(search || '').replace(/^\?/, '');
    if (!qs) { return out; }
    var pairs = qs.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var kv = pairs[i].split('=');
      if (!kv[0]) { continue; }
      try {
        out[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      } catch (e) { /* parámetro malformado: se ignora */ }
    }
    return out;
  }

  function findService(id) {
    for (var i = 0; i < state.services.length; i++) {
      if (state.services[i]._id === id) { return state.services[i]; }
    }
    return null;
  }

  function findBarber(id) {
    for (var i = 0; i < state.barbers.length; i++) {
      if (state.barbers[i]._id === id) { return state.barbers[i]; }
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------------
  function init() {
    cacheElements();
    if (!db || !els.form) { return; } // sin capa de datos o sin markup: no-op

    // El markup trae role="grid" pero el calendario son botones planos con
    // aria-pressed (patrón thefaleros): un grid sin rows/cells inválido lo
    // degradamos a contenedor genérico.
    if (els.calendar.getAttribute('role') === 'grid') {
      els.calendar.removeAttribute('role');
    }

    bindEvents();
    loadFromUrl();
    renderStep();
  }

  function cacheElements() {
    els = {
      stepperItems: doc.querySelectorAll('.stepper__item'),
      panels: [
        doc.getElementById('step-1'),
        doc.getElementById('step-2'),
        doc.getElementById('step-3'),
        doc.getElementById('step-4')
      ],
      servicesGrid: doc.getElementById('services-grid'),
      next2: doc.querySelector('[data-next="2"]'),
      next3: doc.querySelector('[data-next="3"]'),
      barberFilter: doc.getElementById('barber-filter'),
      prevMonth: null,
      nextMonth: null,
      monthYear: doc.getElementById('month-year'),
      calendar: doc.getElementById('calendar'),
      timeslotGrid: doc.getElementById('timeslot-grid'),
      formSummary: doc.getElementById('form-summary'),
      form: doc.getElementById('booking-form'),
      clientName: doc.getElementById('client-name'),
      clientPhone: doc.getElementById('client-phone'),
      clientNote: doc.getElementById('client-note'),
      submitBtn: doc.getElementById('submit-booking'),
      bookingSummary: doc.getElementById('booking-summary'),
      whatsapp: doc.getElementById('whatsapp-confirm')
    };
  }

  function bindEvents() {
    // Paso 1: delegación de change sobre los radios (dentro de <label>)
    if (els.servicesGrid) {
      els.servicesGrid.addEventListener('change', function (e) {
        if (e.target && e.target.name === 'service') { selectService(e.target.value); }
      });
    }

    // Botones siguiente / atrás
    var nexts = doc.querySelectorAll('[data-next]');
    for (var i = 0; i < nexts.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          if (validateStep(state.step)) { goToStep(parseInt(btn.getAttribute('data-next'), 10)); }
        });
      })(nexts[i]);
    }
    var backs = doc.querySelectorAll('[data-back]');
    for (var j = 0; j < backs.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          goToStep(parseInt(btn.getAttribute('data-back'), 10));
        });
      })(backs[j]);
    }

    // Calendario: delegación de clicks sobre días
    if (els.calendar) {
      els.calendar.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.day') : null;
        var date = btn && !btn.disabled ? btn.getAttribute('data-date') : null;
        if (date) { selectDate(date); }
      });
    }
    /* Navegación de mes eliminada: tira horizontal de 14 días */

    // Filtro de barbero: invalida caché local y refetch
    if (els.barberFilter) {
      els.barberFilter.addEventListener('change', function (e) {
        onBarberChange(e.target.value);
      });
    }

    // Franjas horarias: delegación
    if (els.timeslotGrid) {
      els.timeslotGrid.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.timeslot') : null;
        if (btn && !btn.disabled) { selectTime(btn.getAttribute('data-time')); }
      });
    }

    // Formulario
    if (els.form) {
      els.form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitBooking();
      });
    }
    if (els.clientName) {
      els.clientName.addEventListener('input', function (e) {
        state.formData.name = e.target.value;
        clearFieldError(els.clientName);
      });
    }
    if (els.clientPhone) {
      els.clientPhone.addEventListener('input', function (e) {
        e.target.value = formatPhoneInput(e.target.value);
        state.formData.phone = e.target.value;
        clearFieldError(els.clientPhone);
      });
    }
    if (els.clientNote) {
      els.clientNote.addEventListener('input', function (e) {
        state.formData.note = e.target.value;
      });
    }
  }

  /** Deep-link: ?service=&date=&barber= precargan estado. */
  function loadFromUrl() {
    var q = parseQuery(root.location.search);
    if (q.service) { state.serviceId = q.service; }
    if (q.barber) { state.barberId = q.barber; }
    if (q.date && parseISODate(q.date)) { state.date = q.date; }
  }

  // -------------------------------------------------------------------------
  // Navegación de pasos
  // -------------------------------------------------------------------------
  function validateStep(step) {
    if (step === 1) { return !!state.serviceId; }
    if (step === 2) { return !!(state.date && state.time); }
    if (step === 3) { return validateForm(); }
    return true;
  }

  function goToStep(step) {
    if (step < 1 || step > 4) { return; }
    if (step >= 2 && !state.serviceId) { return; }
    if (step >= 3 && !(state.date && state.time)) { return; }
    if (step >= 4 && !state.appointment) { return; } // paso 4 solo tras submit OK
    state.step = step;
    renderStep();
  }

  function renderStep() {
    for (var i = 0; i < 4; i++) {
      if (els.panels[i]) {
        var isActive = (i + 1 === state.step);
        els.panels[i].style.display = isActive ? 'block' : 'none';
        els.panels[i].setAttribute('aria-hidden', isActive ? 'false' : 'true');
      }
    }
    for (var s = 0; s < els.stepperItems.length; s++) {
      var li = els.stepperItems[s];
      var n = parseInt(li.getAttribute('data-step'), 10);
      li.classList.toggle('is-done', n < state.step);
      li.classList.toggle('is-active', n === state.step);
      if (n === state.step) { li.setAttribute('aria-current', 'step'); }
      else { li.removeAttribute('aria-current'); }
    }

    switch (state.step) {
      case 1: renderServices(); break;
      case 2: enterStep2(); break;
      case 3: renderFormSummary(); break;
      case 4: renderConfirmation(); break;
    }

    // Foco al título del paso (tabindex="-1" en markup) + scroll top
    var title = doc.querySelector('#step-' + state.step + ' .wizard__panel-title');
    if (title) {
      try { title.focus({ preventScroll: true }); } catch (e) { title.focus(); }
    }
    try {
      root.scrollTo({ top: 0, behavior: motionReduce() ? 'auto' : 'smooth' });
    } catch (e) { root.scrollTo(0, 0); }
  }

  // -------------------------------------------------------------------------
  // Paso 1 · Servicios
  // -------------------------------------------------------------------------
  function renderServices() {
    if (!els.servicesGrid) { return; }
    if (state.servicesLoaded) { paintServices(); return; }

    els.servicesGrid.innerHTML = '<p class="wizard__loading">Cargando servicios\u2026</p>';
    db.getServicesStrict().then(function (list) {
      state.services = list || [];
      state.servicesLoaded = true;
      if (!state.services.length) {
        renderServicesEmpty('Carta en preparación',
          'Todavía no cargamos servicios online. Escribinos por WhatsApp y coordinamos tu turno.');
        return;
      }
      paintServices();
      paintMarquee(state.services);
      // Deep-link: si el servicio pre-seleccionado existe, inicializar state.service.
      if (state.serviceId && !state.service) { state.service = findService(state.serviceId); }
    }).catch(function (err) {
      if (root.console && root.console.warn) { root.console.warn('[demoagenda] servicios', err && (err.code || err.message)); }
      renderServicesEmpty('No pudimos cargar la carta',
        'Hay un problema de conexión. Recargá la página o escribinos por WhatsApp.');
    });
  }

  function paintServices() {
    // Deep-link a servicio inexistente: se limpia para no trabar el wizard.
    if (state.serviceId && !findService(state.serviceId)) {
      state.serviceId = null;
      state.service = null;
    }

    var html = '';
    for (var i = 0; i < state.services.length; i++) {
      var sv = state.services[i];
      var sel = state.serviceId === sv._id;
      html += '<label class="service-row' + (sel ? ' is-selected' : '') + '">'
        + '<input type="radio" class="sr-only" name="service" value="' + esc(sv._id) + '"' + (sel ? ' checked' : '') + '>'
        + '<span class="service-row__index meta-num" aria-hidden="true">' + pad2(i + 1) + '</span>'
        + '<span class="service-row__name heading-row">' + esc(sv.name) + '</span>'
        + '<span class="service-row__meta meta-num">'
        + '<span class="service-row__price">' + esc(u.formatPriceUYU(sv.price)) + '</span>'
        + '<span class="service-row__dur">' + esc(formatDur(sv.durationMin)) + '</span>'
        + '</span>'
        + '</label>';
    }
    els.servicesGrid.innerHTML = html;

    if (els.next2) {
      els.next2.style.display = '';
      els.next2.disabled = !state.serviceId;
    }
  }

  function renderServicesEmpty(title, text) {
    els.servicesGrid.innerHTML =
      '<div class="wizard__empty">'
      + '<h3>' + esc(title) + '</h3>'
      + '<p>' + esc(text) + '</p>'
      + '<a class="inline-link" href="' + esc(u.buildWaUrl()) + '" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>'
      + '</div>';
    if (els.next2) { els.next2.style.display = 'none'; }
  }

  function selectService(id) {
    state.serviceId = id;
    state.service = findService(id);
    // Cambiar servicio cambia duración → disponibilidad anterior inválida.
    state.date = null;
    state.time = null;
    availCache = {};
    if (els.barberFilter) { els.barberFilter.value = ''; }
    state.barberId = null;
    state.barber = null;

    var rows = els.servicesGrid.querySelectorAll('.service-row');
    for (var i = 0; i < rows.length; i++) {
      var input = rows[i].querySelector('input[name="service"]');
      var on = input && input.value === id;
      rows[i].classList.toggle('is-selected', !!on);
      if (on) { input.checked = true; }
    }
    if (els.next2) { els.next2.disabled = !state.service; }
  }

  // -------------------------------------------------------------------------
  // Paso 2 · Calendario + franjas
  // -------------------------------------------------------------------------
  function enterStep2() {
    if (!state.stripInit) {
      state.stripInit = true;
    }
    renderCalendar();
    loadBarberFilter();
    refreshMonth();
  }

  var DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var STRIP_DAYS = 14; // próximos 14 días visibles

  function renderCalendar() {
    if (!els.calendar) { return; }
    var today = new Date();
    var todayISO = toISO(today);

    updateMonthLabel(today);

    var html = '';
    for (var i = 0; i < STRIP_DAYS; i++) {
      var dateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      var dateISO = toISO(dateObj);
      var isToday = dateISO === todayISO;
      var isSelected = state.date === dateISO;

      var cls = 'day';
      if (isSelected) { cls += ' is-selected'; }
      if (isToday) { cls += ' is-today'; }

      html += '<button type="button" class="' + cls + '" data-date="' + dateISO + '"'
        + ' aria-pressed="' + isSelected + '"'
        + ' aria-label="' + esc(formatFullDate(dateISO)) + '">'
        + '<span class="day__dow">' + DIAS_CORTOS[dateObj.getDay()] + '</span>'
        + '<span class="day__num">' + dateObj.getDate() + '</span>'
        + '<span class="day__slots" aria-live="polite" aria-atomic="true"></span>'
        + '</button>';
    }
    els.calendar.innerHTML = html;
  }

  function navigateMonth(delta) {
    return; // no-op: tira horizontal sin navegación de mes
  }

  /** Carga disponibilidad de los próximos 14 días. */
  function refreshMonth() {
    if (!state.serviceId) { return; }
    var today = new Date();
    var monthStr = today.getFullYear() + '-' + pad2(today.getMonth() + 1);
    db.getMonthAvailability(monthStr, state.serviceId, state.barberId).then(function (res) {
      var days = (res && res.days) || {};
      var todayISO = toISO(today);
      // firstAvailable debe recaer SOLO en el strip visible (14 días desde HOY),
      // no en el mes completo: si no, preseleccionaba un día pasado/fuera del
      // strip, dejaba los horarios vacíos y obligaba a re-clikear HOY.
      var firstVisible = null;
      var firstAvailable = null;
      for (var date in days) {
        if (Object.prototype.hasOwnProperty.call(days, date)) {
          var slots = days[date].slots || [];
          updateDayCount(date, slots.length, slots);
          if (slots.length > 0) {
            if (!firstAvailable) { firstAvailable = date; }
            var inStrip = date >= todayISO;
            if (inStrip && !firstVisible) { firstVisible = date; }
          }
        }
      }
      // Prioridad: HOY si tiene horarios (refresca los del día actual sin
      // re-clikear), si no el primer día visible con cups, si no el primero del mes.
      var preselect = (days[todayISO] && days[todayISO].slots.length > 0)
        ? todayISO
        : (firstVisible || firstAvailable);
      if (state.date && daySlotsCache[state.date]) {
        loadDaySlots(state.date);
      } else if (!state.date && preselect) {
        selectDate(preselect);
      }
    }).catch(function (err) {
      if (root.console && root.console.warn) { root.console.warn('[demoagenda] mes', err && (err.code || err.message)); }
    });
  }

  /* Cache de disponibilidad por día para tooltips del calendario. */
  var daySlotsCache = {}; // dateISO → ['HH:MM', ...]

  function updateDayCount(dateISO, count, slots) {
    var btn = els.calendar ? els.calendar.querySelector('.day[data-date="' + dateISO + '"]') : null;
    if (!btn) { return; }
    var label = count === 0 ? '' : count === 1 ? '1 horario' : count + ' hor.';
    var span = btn.querySelector('.day__slots');
    if (span) { span.textContent = count > 0 ? label : ''; }
    btn.setAttribute('aria-label', formatFullDate(dateISO) + (count > 0 ? ', ' + label : ''));
    /* Dot indicator: días con slots disponibles */
    btn.classList.toggle('has-slots', count > 0);
    /* Tooltip con preview de horarios */
    if (slots && slots.length) {
      daySlotsCache[dateISO] = slots;
      var preview = slots.slice(0, 5).map(function (t) { return u.formatHour(t); }).join(', ');
      if (slots.length > 5) { preview += '…'; }
      btn.setAttribute('title', formatFullDate(dateISO) + ': ' + preview);
    } else {
      delete daySlotsCache[dateISO];
      btn.removeAttribute('title');
    }
    if (count === 0 && !btn.getAttribute('data-past')) {
      btn.classList.add('is-closed');
      btn.disabled = true;
      if (state.date === dateISO) { state.date = null; state.time = null; syncNext3(); }
    }
  }

  function updateMonthLabel(dateObj) {
    if (!els.monthYear) { return; }
    var d = dateObj || new Date();
    var nombre = MESES[d.getMonth()];
    els.monthYear.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1) + ' ' + d.getFullYear();
  }

  function selectDate(dateISO) {
    state.date = dateISO;
    state.time = null;
    syncNext3();

    var btns = els.calendar.querySelectorAll('.day');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-date') === dateISO;
      btns[i].classList.toggle('is-selected', on);
      btns[i].setAttribute('aria-pressed', String(on));
    }
    // Actualizar label del mes según el día seleccionado.
    var d = parseISODate(dateISO);
    if (d) { updateMonthLabel(d); }
    loadDaySlots(dateISO);
  }

  function loadDaySlots(dateISO) {
    var isToday = dateISO === toISO(new Date());
    // HOY nunca se cachea en availCache: sus slots dependen de la hora actual y
    // deben recargarse en cada render (si no, a las 14:03 siguen los de las 09:00).
    var hit = !isToday ? availCache[dateISO] : null;
    if (hit) { renderTimeslots(hit.slots); return; }

    showSlotsMessage('Cargando disponibilidad\u2026');
    db.getAvailability(dateISO, state.serviceId, state.barberId).then(function (data) {
      var slots = (data && data.slots) || [];
      if (!isToday) { availCache[dateISO] = { slots: slots, barbers: (data && data.barbers) || [] }; }
      updateDayCount(dateISO, slots.length, slots);
      if (state.date === dateISO) { renderTimeslots(slots); }
    }).catch(function (err) {
      if (root.console && root.console.warn) { root.console.warn('[demoagenda] día', err && (err.code || err.message)); }
      if (state.date === dateISO) { renderSlotsError(dateISO); }
    });
  }

  /** Error de red/API ≠ día sin horarios: estado propio con reintento (R4). */
  function renderSlotsError(dateISO) {
    var g = els.timeslotGrid;
    if (!g) { return; }
    g.removeAttribute('role');
    g.setAttribute('aria-live', 'assertive');
    g.innerHTML = '<p class="timeslot-empty">No pudimos cargar los horarios.</p>'
      + '<button type="button" class="btn-ghost timeslot-retry">Reintentar</button>';
    var retry = g.querySelector('.timeslot-retry');
    if (retry) {
      retry.addEventListener('click', function () {
        loadDaySlots(dateISO);
      });
    }
  }

  function showSlotsMessage(text) {
    if (!els.timeslotGrid) { return; }
    els.timeslotGrid.removeAttribute('role');
    els.timeslotGrid.setAttribute('aria-live', 'polite');
    els.timeslotGrid.innerHTML = '<p class="timeslot-empty">' + esc(text) + '</p>';
  }

  function renderTimeslots(slots) {
    var g = els.timeslotGrid;
    if (!g) { return; }
    if (!slots || !slots.length) {
      g.removeAttribute('role');
      g.innerHTML = '<p class="timeslot-empty">No hay horarios disponibles para este día</p>';
      syncNext3();
      return;
    }
    g.setAttribute('aria-label', 'Horarios disponibles');

    /* Agrupar por franja: Mañana (06–12) / Tarde (12–20) */
    var morning = [];
    var afternoon = [];
    for (var i = 0; i < slots.length; i++) {
      var hour = parseInt(String(slots[i]).split(':')[0], 10);
      if (hour < 12) { morning.push(slots[i]); }
      else { afternoon.push(slots[i]); }
    }

    function renderGroup(label, group) {
      if (!group.length) { return ''; }
      var html = '<div class="timeslot-group"><p class="timeslot-group__label">' + label + '</p><div style="display:flex;flex-wrap:wrap;gap:var(--sp-2xs)">';
      for (var j = 0; j < group.length; j++) {
        var t = String(group[j]);
        var disp = u.formatHour(t);
        if (!disp) { continue; }
        var sel = state.time === t;
        html += '<button type="button" class="timeslot' + (sel ? ' is-selected' : '') + '"'
          + ' aria-pressed="' + sel + '" data-time="' + esc(t) + '">'
          + esc(disp) + '</button>';
      }
      html += '</div></div>';
      return html;
    }

    g.innerHTML = renderGroup('Mañana', morning) + renderGroup('Tarde', afternoon);
    syncNext3();
  }

  function selectTime(time) {
    state.time = time;
    var btns = els.timeslotGrid.querySelectorAll('.timeslot');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-time') === time;
      btns[i].classList.toggle('is-selected', on);
      btns[i].setAttribute('aria-pressed', String(on));
    }
    syncNext3();
  }

  function syncNext3() { if (els.next3) { els.next3.disabled = !state.time; } }

  // -------------------------------------------------------------------------
  // Filtro de barberos
  // -------------------------------------------------------------------------
  function loadBarberFilter() {
    if (!els.barberFilter) { return; }
    db.getBarbersStrict().then(function (list) {
      state.barbers = list || [];
      var html = '';
      // Solo los barberos (activos); sin opción "Cualquiera" para evitar que el
      // union de slots muestre horarios que un barbero concreto no ofrece.
      for (var i = 0; i < state.barbers.length; i++) {
        html += '<option value="' + esc(state.barbers[i]._id) + '">' + esc(state.barbers[i].name) + '</option>';
      }
      els.barberFilter.innerHTML = html;
      // Deep-link: solo si el barbero existe.
      // Sin deep-link (o inválido): preseleccionar el primer barbero activo
      // (con un único barbero, siempre queda marcado y solo se muestran sus
      // horarios disponibles).
      var preselect = null;
      if (state.barberId && findBarber(state.barberId)) {
        preselect = findBarber(state.barberId);
      } else if (state.barbers.length) {
        preselect = state.barbers[0];
      }
      if (preselect && state.barberId !== preselect._id) {
        // Selecciona el barbero por defecto y refetch de disponibilidad
        // (onBarberChange invalida caché y vuelve a calcular el mes/día).
        onBarberChange(preselect._id);
      } else if (preselect) {
        els.barberFilter.value = preselect._id;
        state.barber = preselect;
      } else {
        // Tenant sin barberos activos: queda la fila general.
        state.barberId = null;
        state.barber = null;
      }
    }).catch(function (err) {
      if (root.console && root.console.warn) { root.console.warn('[demoagenda] barberos', err && (err.code || err.message)); }
      els.barberFilter.innerHTML = '';
    });
  }

  function onBarberChange(value) {
    state.barberId = value || null;
    state.barber = state.barberId ? findBarber(state.barberId) : null;
    state.time = null;
    availCache = {}; // el filtro cambia la disponibilidad: invalidar y refetch
    syncNext3();
    if (state.date) {
      // Si el día seleccionado está en el mes visto, refetch directo.
      // Si no, refreshMonth() se encarga (ya llama loadDaySlots si aplica).
      loadDaySlots(state.date);
    } else {
      refreshMonth();
    }
  }

  // -------------------------------------------------------------------------
  // Paso 3 · Datos del cliente
  // -------------------------------------------------------------------------
  function renderFormSummary() {
    if (!els.formSummary || !state.service) { return; }
    var barberName = state.barber ? state.barber.name : 'Cualquiera';
    els.formSummary.innerHTML =
      '<div class="summary-item"><strong>Servicio:</strong> ' + esc(state.service.name) + '</div>'
      + '<div class="summary-item"><strong>Fecha:</strong> ' + esc(formatFullDate(state.date)) + '</div>'
      + '<div class="summary-item"><strong>Hora:</strong> ' + esc(u.formatHour(state.time)) + '</div>'
      + '<div class="summary-item"><strong>Barbero:</strong> ' + esc(barberName) + '</div>'
      + '<div class="summary-item"><strong>Precio:</strong> ' + esc(u.formatPriceUYU(state.service.price)) + '</div>';

    // Valores persisten al volver atrás y reentrar.
    if (els.clientName) { els.clientName.value = state.formData.name || ''; }
    if (els.clientPhone) { els.clientPhone.value = state.formData.phone || ''; }
    if (els.clientNote) { els.clientNote.value = state.formData.note || ''; }
    hideAlert();
  }

  function setFieldError(input, message) {
    var field = input ? input.closest('.field') : null;
    if (!field) { return; }
    field.classList.add('field--error');
    var errEl = field.querySelector('.field__error');
    if (errEl) { errEl.textContent = message; }
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', input.id + '-error');
  }

  function clearFieldError(input) {
    var field = input ? input.closest('.field') : null;
    if (!field) { return; }
    field.classList.remove('field--error');
    var errEl = field.querySelector('.field__error');
    if (errEl) { errEl.textContent = ''; }
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  function validateForm() {
    var valid = true;
    var firstInvalid = null;

    var name = els.clientName ? els.clientName.value.trim() : '';
    if (!name) {
      setFieldError(els.clientName, 'Ingresá tu nombre.');
      valid = false;
      firstInvalid = els.clientName;
    } else {
      clearFieldError(els.clientName);
    }

    var phone = els.clientPhone ? els.clientPhone.value.trim() : '';
    if (!phone) {
      setFieldError(els.clientPhone, 'Ingresá tu teléfono.');
      valid = false;
      if (!firstInvalid) { firstInvalid = els.clientPhone; }
    } else if (!u.validatePhoneUY(phone)) {
      setFieldError(els.clientPhone, 'Formato esperado: 09X XXX XXX.');
      valid = false;
      if (!firstInvalid) { firstInvalid = els.clientPhone; }
    } else {
      clearFieldError(els.clientPhone);
    }

    if (!valid && firstInvalid) { firstInvalid.focus(); }
    return valid;
  }

  /** Mensaje inline del form (no hay toast en utils/main: lo más simple consistente). */
  function showAlert(message) {
    if (!els.form) { return; }
    var alert = doc.getElementById('booking-alert');
    if (!alert) {
      alert = doc.createElement('p');
      alert.id = 'booking-alert';
      alert.className = 'form-alert';
      alert.setAttribute('role', 'alert');
      els.form.insertBefore(alert, els.form.firstChild);
    }
    alert.textContent = message;
  }

  function hideAlert() {
    var alert = doc.getElementById('booking-alert');
    if (alert && alert.parentNode) { alert.parentNode.removeChild(alert); }
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  function submitBooking() {
    if (!validateForm()) { return; }

    var btn = els.submitBtn;
    btn.disabled = true;
    btn.classList.add('loading');
    btn.setAttribute('aria-busy', 'true');
    btn.setAttribute('aria-label', 'Confirmando reserva, por favor esperá');
    if (!btn.getAttribute('data-label')) { btn.setAttribute('data-label', btn.textContent); }
    btn.textContent = 'Confirmando\u2026';
    hideAlert();

    var payload = {
      service_id: state.serviceId,
      barber_id: state.barberId,
      date: state.date,
      time: state.time,
      client_name: els.clientName.value.trim(),
      client_phone: u.normalizePhoneUY(els.clientPhone.value),
      note: els.clientNote.value.trim(),
      source: 'web'
    };
    state.formData.name = payload.client_name;
    state.formData.phone = els.clientPhone.value;
    state.formData.note = payload.note;

    function finish() {
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.removeAttribute('aria-busy');
      btn.removeAttribute('aria-label');
      if (btn.getAttribute('data-label')) { btn.textContent = btn.getAttribute('data-label'); }
    }

    db.createAppointment(payload).then(function (created) {
      state.appointment = created || payload;
      availCache = {}; // el turno nuevo cambia la disponibilidad para próximos visitantes de paso 2
      // Persistencia aditiva para gracias.html (última reserva, patrón verastore):
      // falla silenciosa — el wizard sigue funcionando aunque localStorage no esté.
      try {
        root.localStorage.setItem('estudiotrazo_last_booking', JSON.stringify({
          id: (created && (created.id || created._id)) || state.appointment.service_id,
          servicio: state.service ? state.service.name : '',
          barbero: state.barber ? state.barber.name : 'Cualquiera',
          date: state.date,
          time: state.time,
          nombre: state.appointment.client_name || state.formData.name,
          telefono: state.appointment.client_phone || state.formData.phone
        }));
      } catch (e) { /* demo sigue sin persistencia si localStorage falla */ }
      finish();
      goToStep(4);
    }).catch(function (err) {
      finish();
      if (err && err.code === 'SLOT_TAKEN') {
        handleSlotTaken();
      } else {
        showAlert('No pudimos confirmar la reserva. Intentá de nuevo en unos minutos.');
        if (root.console && root.console.warn) { root.console.warn('[demoagenda] reserva', err && (err.code || err.message)); }
      }
    });
  }

  /**
   * Carrera de reservas: el slot se ocupó entre el render y el submit.
   * La caché de db.js solo se limpia en éxito, así que el refetch puede
   * traer dato stale: filtramos el tiempo tomado en cliente ⇒ UI correcta.
   */
  function handleSlotTaken() {
    showAlert('Ese horario acaba de ser reservado. Elegí otro.');
    var taken = state.time;
    state.time = null;
    syncNext3();

    db.getAvailability(state.date, state.serviceId, state.barberId).then(function (data) {
      var slots = ((data && data.slots) || []).filter(function (t) { return t !== taken; });
      availCache[state.date] = { slots: slots, barbers: (data && data.barbers) || [] };
      updateDayCount(state.date, slots.length);
      renderTimeslots(slots);
    }).catch(function () {
      var hit = availCache[state.date];
      renderTimeslots(hit ? hit.slots.filter(function (t) { return t !== taken; }) : []);
    });
  }

  // -------------------------------------------------------------------------
  // Paso 4 · Confirmación
  // -------------------------------------------------------------------------
  function renderConfirmation() {
    var a = state.appointment || {};
    var date = a.date || state.date;
    var time = a.time || state.time;
    var name = a.client_name || state.formData.name || '';
    var svcName = state.service ? state.service.name : '';
    var barberName = state.barber ? state.barber.name : 'Cualquiera';

    if (els.bookingSummary) {
      els.bookingSummary.innerHTML =
        '<div class="summary-item"><strong>Servicio:</strong> ' + esc(svcName) + '</div>'
        + '<div class="summary-item"><strong>Fecha:</strong> ' + esc(formatFullDate(date)) + '</div>'
        + '<div class="summary-item"><strong>Hora:</strong> ' + esc(u.formatHour(time)) + '</div>'
        + '<div class="summary-item"><strong>Barbero:</strong> ' + esc(barberName) + '</div>'
        + '<div class="summary-item"><strong>Nombre:</strong> ' + esc(name) + '</div>'
        + '<div class="summary-item"><strong>Teléfono:</strong> ' + esc(a.client_phone || u.normalizePhoneUY(state.formData.phone)) + '</div>'
        + '<p class="summary-note">Te esperamos en el estudio. Si necesitás cambiar o cancelar, avisanos por WhatsApp.</p>';
    }

    if (els.whatsapp) {
      var msg = 'Hola, reservé: ' + svcName + ' para el ' + formatFullDate(date)
        + ' a las ' + u.formatHour(time) + '. Nombre: ' + name + '.';
      els.whatsapp.href = u.buildWaUrl(msg);
      els.whatsapp.setAttribute('aria-label', 'Avisar por WhatsApp que reservaste ' + svcName + ' para el ' + formatFullDate(date));
    }
    // Ocultar botón WhatsApp si el href sigue vacío (precaución).
    var waActions = els.whatsapp ? els.whatsapp.parentNode : null;
    if (waActions && els.whatsapp.getAttribute('href') === '#') {
      els.whatsapp.style.display = 'none';
    } else if (els.whatsapp) {
      els.whatsapp.style.display = '';
    }
  }

  // -------------------------------------------------------------------------
  // Marquee dinámico con servicios del tenant
  // -------------------------------------------------------------------------

  /**
   * paintMarquee(services): reemplaza el contenido estático del marquee
   * con los nombres de servicio reales del tenant. Fallback: si no hay
   * servicios, el markup estático queda intacto.
   */
  function paintMarquee(services) {
    var track = doc.getElementById('reservar-marquee');
    if (!track || !services || !services.length) { return; }

    var items = ['ESTUDIO TRAZO'];
    for (var i = 0; i < services.length; i++) {
      if (services[i].name) { items.push(services[i].name.toUpperCase()); }
    }
    items.push('MONTEVIDEO');

    var groupHtml = '';
    for (var j = 0; j < items.length; j++) {
      groupHtml += '<span class="marquee__item">' + esc(items[j]) + '</span>'
        + '<span class="marquee__sep">·</span>';
    }

    track.innerHTML =
      '<div class="marquee__group">' + groupHtml + '</div>'
      + '<div class="marquee__group" aria-hidden="true">' + groupHtml + '</div>';
  }

  // -------------------------------------------------------------------------
  // Boot (mismo patrón que el resto del sitio)
  // -------------------------------------------------------------------------
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);
