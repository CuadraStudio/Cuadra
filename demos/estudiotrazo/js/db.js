/**
 * demoAgenda_static_site — DB Adapter (window.CCESCO_DB)
 *
 * Patrón portado de sagastudio/thefaleros. Dos capas:
 *
 *  1) Lecturas de catálogo para index.html (main.js): getServices /
 *     getBarbers / getWorkingPlan. Contrato intacto: NUNCA lanzan al
 *     usuario; cualquier fallo resuelve [] y el caller no toca el DOM.
 *
 *  2) Motor de reservas para el wizard (docs/design.md §R11, portado de
 *     thefaleros db.js líneas 10–258): getAvailability / getMonthAvailability
 *     computan slots cliente-side y createAppointment confirma contra la API.
 *     Estas operaciones SÍ propagan el error (.code: SLOT_TAKEN, PAST_DATE,
 *     PAST_TIME, INVALID_*) porque la UI debe distinguir vacío / error /
 *     franja ocupada (R3–R5). El server revalida solapamientos.
 *
 *   POST https://cuadra-api-t7rg.onrender.com/api/demoagenda
 *   body: { action, payload }  →  { ok:true, data } | { ok:false, error:{code,message} }
 *
 * ADAPTACIÓN demoagenda (findazgo Vega): en thefaleros computeSlots retorna []
 * sin barberos activos. En demoagenda HOY no hay barberos en producción, pero
 * existe fila general del plan (barber_id null). Si no hay barberos Y hay
 * fila general para ese dow, se generan slots con barberRef=null (los
 * conflictos contra turnos barber_id null se detectan igual). Con barberos,
 * el comportamiento es idéntico al de thefaleros.
 */
(function (root) {
  'use strict';

  var cfg = root.CCESCO_CONFIG || {};
  var API_BASE = (cfg.mongo && cfg.mongo.apiBase) || '/api/demoagenda';
  var TIMEOUT_MS = (cfg.mongo && Number(cfg.mongo.requestTimeoutMs)) || 8000;
  /* Concurrencia máxima del prefetch mensual (1 job por día del calendario).
     La API free-tier satura con ~30 requests paralelos: con pool el mes
     completo carga en ~4 tandas dentro del timeout. Ajustable por config. */
  var MONTH_POOL = Math.max(1, (cfg.mongo && Number(cfg.mongo.monthConcurrency)) || 4);

  // Cache en memoria. Catálogo sin TTL (página de vista única); la
  // disponibilidad se invalida por prefijo tras crear un turno.
  var cache = {};

  // =========================================================================
  // Modo demo local (R2-D3): catálogo ficticio (cfg.DEMO_CATALOG) accionable
  // cuando la API no tiene el tenant (UNKNOWN_TENANT), falla o devuelve
  // vacío. `useLocalDemo` se activa al PRIMER fallo de red y queda latcheado:
  // no se vuelve a pegar a la API (cacheo de la decisión). Configurable vía
  // cfg.demo {enabled, pin, storageKey}. Los turnos locales se persisten en
  // localStorage y el panel admin los lee con el token demo (PIN cfg.demo.pin).
  // Contrato CCESCO_* intacto: solo se agregan valores y ramas locales.
  // =========================================================================
  var DEMO_ADMIN_TOKEN = 'ccesco-demo-admin';
  var DEMO = cfg.demo || {};
  var demoCatalog = cfg.DEMO_CATALOG || { services: [], barbers: [], workingPlan: [] };
  var LOCAL_APPT_KEY = DEMO.storageKey || 'demoagenda_demo_appointments';
  var useLocalDemo = false;

  function demoFallbackAllowed() { return DEMO.enabled !== false; }

  function rawDemoServices() {
    return (demoCatalog.services || []).slice().sort(function (a, b) {
      return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
    });
  }

  function rawDemoBarbers() {
    return (demoCatalog.barbers || []).slice().sort(function (a, b) {
      return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
    });
  }

  function rawDemoPlan() { return (demoCatalog.workingPlan || []).slice(); }

  /** Marca el modo local UNA sola vez (latcheado) y lo loguea para QA. */
  function noteLocalFallback(reason) {
    if (useLocalDemo) { return; }
    useLocalDemo = true;
    if (root.console && typeof root.console.warn === 'function') {
      root.console.warn('[demoagenda] modo demo local activado',
        reason && (reason.code || reason.message || reason));
    }
  }

  /** Turnos guardados localmente (shape CRUDO que consume el motor). */
  function getLocalAppointments() {
    var arr = [];
    try { arr = JSON.parse(root.localStorage.getItem(LOCAL_APPT_KEY) || '[]'); } catch (e) { arr = []; }
    if (!Array.isArray(arr)) { arr = []; }
    return arr;
  }

  function saveLocalAppointments(arr) {
    try { root.localStorage.setItem(LOCAL_APPT_KEY, JSON.stringify(arr || [])); } catch (e) { /* noop */ }
  }

  /* Seed de ejemplo del modo vista (cfg.demo.appointments, R2-D3 viewer).
   * sekey: marca de versión (`demoagenda_demo_seed_v`): en la primera visita
   * o si `cfg.demo.seedVersion` cambió, se siembran los turnos de ejemplo SI
   * el storage está vacío. Nunca pisa turnos ya creados por el wizard: si el
   * storage tiene datos, solo se actualiza la marca de versión. */
  var SEED_VERSION_KEY = 'demoagenda_demo_seed_v';

  function seedDemoIfNeeded() {
    if (!demoFallbackAllowed() || !DEMO) { return; }
    var seedVersion = (DEMO.seedVersion != null) ? String(DEMO.seedVersion) : '';
    var storedVersion = null;
    try { storedVersion = root.localStorage.getItem(SEED_VERSION_KEY); } catch (e) { /* noop */ }
    if (storedVersion === seedVersion) { return; }
    var arr = getLocalAppointments();
    if (!arr.length) {
      var seeds = DEMO.appointments || [];
      if (seeds.length) { saveLocalAppointments(seeds.slice()); }
    }
    try { root.localStorage.setItem(SEED_VERSION_KEY, seedVersion); } catch (e) { /* noop */ }
  }

  /** Resuelve remoto; ante error O vacío cambia a local (una sola vez).
   *  Si el demo está deshabilitado, el comportamiento es el original. */
  function localOrRemote(action, payload, localFactory) {
    if (!demoFallbackAllowed()) { return mongoRequest(action, payload || {}); }
    if (useLocalDemo) { return Promise.resolve(localFactory()); }
    return mongoRequest(action, payload || {}).then(function (data) {
      var list = Array.isArray(data) ? data : ((data && data.list) || []);
      if (!list.length) {
        noteLocalFallback(action + ' vacío');
        return localFactory();
      }
      return list;
    }, function (err) {
      noteLocalFallback(err);
      return localFactory();
    });
  }

  /** Av de un día en modo local: plan + barberos ficticios, excepciones [],
   *  turnos persistidos (los cancelados no ocupan slot). */
  function localAvailability(dateISO) {
    return {
      workingPlan: rawDemoPlan(),
      exceptions: [],
      appointments: getLocalAppointments().filter(function (a) {
        return String(a.date) === dateISO && a.status !== 'cancelled';
      }),
      barbers: rawDemoBarbers()
    };
  }

  function apiError(json, status) {
    var msg = (json && json.error && json.error.message) ? json.error.message : 'Error del servidor';
    var err = new Error(msg);
    if (json && json.error && json.error.code) { err.code = json.error.code; }
    if (status) { err.status = status; }
    return err;
  }

  /**
   * mongoRequest(action, payload[, token]) → Promise<data>
   * fetch POST + tolerancia a JSON inválido + timeout con AbortController
   * si existe (feature-detect); el wrapper de carrera funciona sin él.
   * token (opcional): Authorization Bearer para acciones ADMIN_ACTIONS.
   */
  function mongoRequest(action, payload, token) {
    var controller = (typeof root.AbortController === 'function') ? new root.AbortController() : null;
    var headers = { 'Content-Type': 'application/json' };
    if (token) { headers.Authorization = 'Bearer ' + token; }

    var doFetch = fetch(API_BASE, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ action: action, payload: payload || {} }),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (json) {
        return { status: res.status, json: json };
      });
    }).then(function (r) {
      var json = r.json;
      if (!json || !json.ok) { throw apiError(json, r.status); }
      return json.data;
    });

    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) { return; }
        settled = true;
        if (controller) { try { controller.abort(); } catch (e) { /* noop */ } }
        var err = new Error('TIMEOUT');
        err.code = 'TIMEOUT';
        reject(err);
      }, TIMEOUT_MS);

      doFetch.then(
        function (value) {
          if (settled) { return; }
          settled = true;
          clearTimeout(timer);
          resolve(value);
        },
        function (err) {
          if (settled) { return; }
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      );
    });
  }

  function cacheGet(key) {
    return Object.prototype.hasOwnProperty.call(cache, key) ? cache[key] : null;
  }

  function cacheSet(key, data) { cache[key] = data; }

  /** Promesas en vuelo por clave: deduplica la manada de truenos. */
  var inflight = {};

  /**
   * cached(key, loader): memoiza resueltos Y comparte la promesa mientras
   * carga. Sin deduplicación, el prefetch mensual (31 días en paralelo
   * sobre caché fría) dispara 31 listServices + 31 listBarbers duplicados.
   * Si el load falla, la clave se libera: el próximo caller reintenta.
   */
  function cached(key, loader) {
    var hit = cacheGet(key);
    if (hit !== null) { return Promise.resolve(hit); }
    if (inflight[key]) { return inflight[key]; }
    var p = loader().then(function (data) {
      delete inflight[key];
      cache[key] = data;
      return data;
    }, function (err) {
      delete inflight[key];
      throw err;
    });
    inflight[key] = p;
    return p;
  }

  /** Variante que SÍ propaga el rechazo (wizard: distingue vacío de error). */
  function cachedStrict(key, loader) {
    return cached(key, loader);
  }

  /**
   * pool(jobs, limit) → Promise<results[]>
   * Ejecuta thunks con concurrencia acotada preservando el orden. El
   * prefetch mensual genera un job por día del calendario (~31): sin pool,
   * la ráfaga satura la API free-tier (Render) y TODOS los requests caen
   * juntos por timeout del cliente (8s). Con pool, el mes carga en tandas.
   */
  function pool(jobs, limit) {
    return new Promise(function (resolve, reject) {
      var results = new Array(jobs.length);
      var nextIndex = 0;
      var active = 0;
      var failed = false;

      function launch() {
        if (failed) { return; }
        while (active < limit && nextIndex < jobs.length) {
          (function (idx) {
            active++;
            jobs[idx]().then(function (value) {
              active--;
              results[idx] = value;
              launch();
            }, function (err) {
              if (!failed) { failed = true; reject(err); }
            });
          })(nextIndex);
          nextIndex++;
        }
        if (!failed && active === 0 && nextIndex >= jobs.length) { resolve(results); }
      }

      launch();
    });
  }

  /** Invalida por prefijo (tras crear turno: toda la disponibilidad). */
  function cacheClearPrefix(prefix) {
    var keys = Object.keys(cache);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf(prefix) === 0) { delete cache[keys[i]]; }
    }
    // También suelta promesas en vuelo de esas claves: tras invalidar,
    // un caller nuevo no debe esperar el dato viejo que viene en camino.
    keys = Object.keys(inflight);
    for (var j = 0; j < keys.length; j++) {
      if (keys[j].indexOf(prefix) === 0) { delete inflight[keys[j]]; }
    }
  }

  /** Envoltura de seguridad (catálogo): log para QA, [] para el usuario. */
  function safe(key, loader) {
    if (typeof root.fetch !== 'function') { return Promise.resolve([]); }
    return cached(key, loader).catch(function (err) {
      if (root.console && typeof root.console.warn === 'function') {
        root.console.warn('[demoagenda]', key, err && (err.code || err.message));
      }
      return [];
    });
  }

  // =========================================================================
  // Mappers (API snake_case → shape de presentación, architecture.md §3.5)
  // Defensivos con defaults: el sitio nunca renderiza basura (R8).
  // `_id` se preserva: el wizard lo usa como value de radios/filtros.
  // =========================================================================

  function mapService(s) {
    return {
      _id: (s && s.id) || null,
      name: String((s && s.name_es) || ''),
      price: Number(s && s.price) || 0,
      durationMin: Number(s && s.duration_min) || 0,
      imageUrl: String((s && s.image_url) || ''),
      order: Number(s && s.sort_order) || 0,
      active: !(s && s.active === false)
    };
  }

  function mapBarber(b) {
    return {
      _id: (b && b.id) || null,
      name: String((b && b.name) || ''),
      role: String((b && b.role) || ''),
      order: Number(b && b.sort_order) || 0,
      active: !(b && b.active === false)
    };
  }

  function normTime(t) { return t ? String(t).slice(0, 5) : ''; }

  function mapPlanRow(r) {
    return {
      dow: Number(r && r.dow),
      start: normTime(r && r.start_time),
      end: normTime(r && r.end_time),
      active: !(r && r.active === false),
      barberRef: (r && r.barber_id) || null
    };
  }

  function byOrder(a, b) { return (Number(a.order) || 0) - (Number(b.order) || 0); }
  function byDow(a, b) { return (Number(a.dow) || 0) - (Number(b.dow) || 0); }

  // =========================================================================
  // Motor de slots (portado de thefaleros js/db.js líneas 10–258).
  // Opera sobre filas de plan CRUDAS de la API ({dow,start_time,end_time,
  // barber_id,active}) exactamente como la referencia.
  // =========================================================================

  function padNum(n) { return n < 10 ? '0' + n : '' + n; }

  function dateToISO(d) {
    return d.getFullYear() + '-' + padNum(d.getMonth() + 1) + '-' + padNum(d.getDate());
  }

  function isoToDate(s) {
    var parts = String(s).split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function dayOfWeek(dateISO) { return isoToDate(dateISO).getDay(); }

  function engNormTime(t) { return t ? String(t).slice(0, 5) : null; }

  function timeToMin(t) {
    if (!t) { return null; }
    var p = String(t).split(':');
    return Number(p[0]) * 60 + Number(p[1] || 0);
  }

  function slotFreeForBarber(barberRef, time, dateISO, dateEx, appointments) {
    for (var i = 0; i < dateEx.length; i++) {
      var ex = dateEx[i];
      var applies = !ex.barber_id || ex.barber_id === barberRef;
      if (!applies) { continue; }
      if (ex.all_day) { return false; }
      if (ex.start_time && ex.end_time) {
        var st = engNormTime(ex.start_time);
        var en = engNormTime(ex.end_time);
        if (time >= st && time < en) { return false; }
      }
    }
    for (var j = 0; j < appointments.length; j++) {
      var app = appointments[j];
      if (String(app.date) === dateISO &&
          app.barber_id === barberRef &&
          engNormTime(app.time) === time &&
          app.status !== 'cancelled') {
        return false;
      }
    }
    return true;
  }

  function slotOverlapsForBarber(barberRef, dateISO, time, durationMin, dateEx, appointments, servicesMap) {
    var startMin = timeToMin(time);
    if (startMin === null) { return false; }
    var endMin = startMin + (Number(durationMin) > 0 ? Number(durationMin) : 60);
    for (var i = 0; i < dateEx.length; i++) {
      var ex = dateEx[i];
      var applies = !ex.barber_id || ex.barber_id === barberRef;
      if (!applies) { continue; }
      if (ex.all_day) { return false; }
      if (ex.start_time && ex.end_time) {
        var stMin = timeToMin(engNormTime(ex.start_time));
        var enMin = timeToMin(engNormTime(ex.end_time));
        if (startMin < enMin && stMin < endMin) { return false; }
      }
    }
    for (var j = 0; j < appointments.length; j++) {
      var app = appointments[j];
      if (String(app.date) !== dateISO || app.barber_id !== barberRef || app.status === 'cancelled') {
        continue;
      }
      var appStart = timeToMin(engNormTime(app.time));
      if (appStart === null) { continue; }
      var serv = (servicesMap && app.service_id) ? servicesMap[app.service_id] : null;
      var appDur = (serv && Number(serv.duration_min) > 0) ? Number(serv.duration_min) : 60;
      var appEnd = appStart + appDur;
      if (startMin < appEnd && appStart < endMin) { return false; }
    }
    return true;
  }

  function planRowForDate(plan, dateISO, barberRefOrNull) {
    var dow = dayOfWeek(dateISO);
    var general = null;
    for (var i = 0; i < plan.length; i++) {
      var r = plan[i];
      if (Number(r.dow) !== dow) { continue; }
      if (barberRefOrNull && r.barber_id === barberRefOrNull) { return r; }
      if (!r.barber_id && !general) { general = r; }
    }
    return general;
  }

  /**
   * computeSlots(plan, exceptions, appointments, barbers, dateISO,
   *              barberRefOrNull, services, newDurationMin) → ['HH:MM', …]
   * Portado de thefaleros + adaptación demoagenda: sin barberos activos, si
   * existe fila general del dow se generan slots con barberRef=null.
   */
  function computeSlots(plan, exceptions, appointments, barbers, dateISO, barberRefOrNull, services, newDurationMin) {
    var dateEx = [];
    for (var x = 0; x < exceptions.length; x++) {
      if (String(exceptions[x].date) === dateISO) { dateEx.push(exceptions[x]); }
    }

    var servicesMap = null;
    if (services && services.length) {
      servicesMap = {};
      for (var sm = 0; sm < services.length; sm++) { servicesMap[services[sm].id] = services[sm]; }
    }
    var newDur = (Number(newDurationMin) > 0) ? Number(newDurationMin) : 0;

    function slotStartsFree(barberRef, time) {
      var startMin = timeToMin(time);
      if (startMin === null) { return false; }
      for (var i = 0; i < dateEx.length; i++) {
        var ex = dateEx[i];
        var applies = !ex.barber_id || ex.barber_id === barberRef;
        if (!applies) { continue; }
        if (ex.all_day) { return false; }
        if (ex.start_time && ex.end_time) {
          var stM = timeToMin(engNormTime(ex.start_time));
          var enM = timeToMin(engNormTime(ex.end_time));
          if (startMin >= stM && startMin < enM) { return false; }
        }
      }
      for (var j = 0; j < appointments.length; j++) {
        var app = appointments[j];
        if (String(app.date) !== dateISO || app.barber_id !== barberRef || app.status === 'cancelled') { continue; }
        var appStart = timeToMin(engNormTime(app.time));
        if (appStart === null) { continue; }
        var serv = (servicesMap && app.service_id) ? servicesMap[app.service_id] : null;
        var appDur = (serv && Number(serv.duration_min) > 0) ? Number(serv.duration_min) : 60;
        if (startMin >= appStart && startMin < appStart + appDur) { return false; }
      }
      return true;
    }

    function slotIsFree(barberRef, time) {
      if (servicesMap) {
        return newDur > 0
          ? slotOverlapsForBarber(barberRef, dateISO, time, newDur, dateEx, appointments, servicesMap)
          : slotStartsFree(barberRef, time);
      }
      return slotFreeForBarber(barberRef, time, dateISO, dateEx, appointments);
    }

    var today = new Date();
    var isToday = dateISO === dateToISO(today);
    var minAdvanceMin = (cfg.booking && Number(cfg.booking.minAdvanceHours) > 0) ? Number(cfg.booking.minAdvanceHours) * 60 : 0;
    var minSlotTime = (isToday && minAdvanceMin > 0) ? today.getTime() + minAdvanceMin * 60000 : 0;
    var stepMin = (cfg.booking && Number(cfg.booking.slotStepMin) > 0) ? Number(cfg.booking.slotStepMin) : 30;

    function isPastSlot(min) {
      if (minSlotTime <= 0) { return false; }
      var slotDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), Math.floor(min / 60), min % 60, 0);
      return slotDate.getTime() <= minSlotTime;
    }

    function slotsFromRow(row, barberRef) {
      var sMin = timeToMin(engNormTime(row.start_time));
      var eMin = timeToMin(engNormTime(row.end_time));
      if (sMin === null || eMin === null) { return []; }
      var out = [];
      for (var m = sMin; m < eMin; m += stepMin) {
        var time = padNum(Math.floor(m / 60)) + ':' + padNum(m % 60);
        if (isPastSlot(m)) { continue; }
        if (slotIsFree(barberRef, time)) { out.push(time); }
      }
      return out;
    }

    // --- Camino 1: barbero específico (idéntico a thefaleros) ---
    if (barberRefOrNull) {
      var planRow = planRowForDate(plan, dateISO, barberRefOrNull);
      if (!planRow || planRow.active === false) { return []; }
      return slotsFromRow(planRow, barberRefOrNull);
    }

    // --- Camino 2: "Cualquiera" con barberos activos (unión de slots) ---
    var activeBarbers = [];
    for (var ab = 0; ab < barbers.length; ab++) {
      if (barbers[ab].active !== false) { activeBarbers.push(barbers[ab]); }
    }

    if (activeBarbers.length) {
      var effectiveRows = [];
      for (var b = 0; b < activeBarbers.length; b++) {
        var row = planRowForDate(plan, dateISO, activeBarbers[b].id);
        if (!row || row.active === false) { continue; }
        effectiveRows.push({ barberRef: activeBarbers[b].id, row: row });
      }
      if (!effectiveRows.length) { return []; }
      var minStart = 24, maxEnd = 0;
      for (var e = 0; e < effectiveRows.length; e++) {
        var sh = parseInt(effectiveRows[e].row.start_time.slice(0, 2), 10);
        var eh = parseInt(effectiveRows[e].row.end_time.slice(0, 2), 10);
        if (sh < minStart) { minStart = sh; }
        if (eh > maxEnd) { maxEnd = eh; }
      }
      var slots = [];
      for (var m2 = minStart * 60; m2 < maxEnd * 60; m2 += stepMin) {
        var t = padNum(Math.floor(m2 / 60)) + ':' + padNum(m2 % 60);
        if (isPastSlot(m2)) { continue; }
        var anyFree = false;
        for (var e2 = 0; e2 < effectiveRows.length; e2++) {
          var er = effectiveRows[e2];
          var st = engNormTime(er.row.start_time);
          var en = engNormTime(er.row.end_time);
          if (!(t >= st && t < en)) { continue; }
          if (slotIsFree(er.barberRef, t)) { anyFree = true; break; }
        }
        if (anyFree) { slots.push(t); }
      }
      return slots;
    }

    // --- Camino 3 (ADAPTACIÓN demoagenda): sin barberos, fila general ---
    var generalRow = planRowForDate(plan, dateISO, null);
    if (!generalRow || generalRow.active === false) { return []; }
    return slotsFromRow(generalRow, null);
  }

  /**
   * pickFreeBarber: primer barbero activo libre para fecha+hora+duración.
   * Sin barberos activos devuelve null (el doc se crea con barber_id null
   * y el server valida contra la fila general).
   */
  function pickFreeBarber(barbers, exceptions, appointments, dateISO, time, durationMin, services, plan) {
    var dateEx = [];
    for (var x = 0; x < exceptions.length; x++) {
      if (String(exceptions[x].date) === dateISO) { dateEx.push(exceptions[x]); }
    }
    var servicesMap = null;
    if (services && services.length) {
      servicesMap = {};
      for (var sm = 0; sm < services.length; sm++) { servicesMap[services[sm].id] = services[sm]; }
    }
    var useDuration = Number(durationMin) > 0;
    for (var i = 0; i < barbers.length; i++) {
      var b = barbers[i];
      if (b.active === false) { continue; }
      if (plan) {
        var row = planRowForDate(plan, dateISO, b.id);
        if (!row || row.active === false) { continue; }
        var st = engNormTime(row.start_time);
        var en = engNormTime(row.end_time);
        if (!st || !en) { continue; }
        if (useDuration) {
          var stM = timeToMin(st), enM = timeToMin(en), tmM = timeToMin(time);
          if (tmM < stM || tmM + (Number(durationMin) || 0) > enM) { continue; }
        } else {
          if (!(time >= st && time < en)) { continue; }
        }
      }
      if (useDuration) {
        if (slotOverlapsForBarber(b.id, dateISO, time, durationMin, dateEx, appointments, servicesMap)) { return b.id; }
      } else {
        if (slotFreeForBarber(b.id, time, dateISO, dateEx, appointments)) { return b.id; }
      }
    }
    return null;
  }

  // =========================================================================
  // Loaders crudos para el motor (filas API sin mapear)
  // =========================================================================

  function loadRawServices() {
    return cached('rawServices', function () {
      return localOrRemote('listServices', {}, rawDemoServices);
    });
  }

  function loadRawBarbers() {
    return cached('rawBarbers', function () {
      return localOrRemote('listBarbers', {}, rawDemoBarbers);
    });
  }

  /** Plan COMPLETO (incluye filas por barbero): el motor necesita todo. */
  function loadRawPlan() {
    return cached('planRaw', function () {
      return localOrRemote('getWorkingPlan', {}, rawDemoPlan);
    });
  }

  function loadAvailabilityData(dateISO) {
    return cached('av:' + dateISO, function () {
      if (!demoFallbackAllowed()) {
        return mongoRequest('getAvailabilityData', { dateISO: dateISO }).then(function (data) {
          var av = data || {};
          av.workingPlan = av.workingPlan || [];
          av.exceptions = av.exceptions || [];
          av.appointments = av.appointments || [];
          av.barbers = av.barbers || [];
          return av;
        });
      }
      if (useLocalDemo) { return Promise.resolve(localAvailability(dateISO)); }
      return mongoRequest('getAvailabilityData', { dateISO: dateISO }).then(function (data) {
        var av = data || {};
        av.workingPlan = av.workingPlan || [];
        av.exceptions = av.exceptions || [];
        av.appointments = av.appointments || [];
        av.barbers = av.barbers || [];
        if (!av.workingPlan.length && !av.barbers.length && !av.appointments.length) {
          noteLocalFallback('getAvailabilityData vacío');
          return localAvailability(dateISO);
        }
        return av;
      }, function (err) {
        noteLocalFallback(err);
        return localAvailability(dateISO);
      });
    });
  }

  /**
   * dayAvailability(dateISO, serviceRef, barberRef|null) → {slots, barbers}
   * Con barbero: slots de ese barbero. Con "Cualquiera": unión sobre
   * barberos activos; SIN barberos en el tenant: fila general (adaptación).
   */
  function dayAvailability(dateISO, serviceRef, barberRef) {
    return Promise.all([loadAvailabilityData(dateISO), loadRawServices(), loadRawBarbers()])
      .then(function (res) {
        var av = res[0], rawServices = res[1], rawBarbers = res[2];
        var serv = null;
        for (var i = 0; i < rawServices.length; i++) {
          if (rawServices[i].id === serviceRef) { serv = rawServices[i]; break; }
        }
        var durationMin = (serv && Number(serv.duration_min) > 0) ? Number(serv.duration_min) : 0;

        var slots = [];
        var availBarbers = [];

        if (barberRef) {
          slots = computeSlots(av.workingPlan, av.exceptions, av.appointments, rawBarbers, dateISO, barberRef, rawServices, durationMin);
          if (slots.length) {
            for (var k = 0; k < rawBarbers.length; k++) {
              if (rawBarbers[k].id === barberRef) { availBarbers.push(mapBarber(rawBarbers[k])); break; }
            }
          }
        } else {
          var anyActive = false;
          for (var j = 0; j < rawBarbers.length; j++) {
            if (rawBarbers[j].active === false) { continue; }
            anyActive = true;
            var bSlots = computeSlots(av.workingPlan, av.exceptions, av.appointments, rawBarbers, dateISO, rawBarbers[j].id, rawServices, durationMin);
            if (!bSlots.length) { continue; }
            availBarbers.push(mapBarber(rawBarbers[j]));
            for (var n = 0; n < bSlots.length; n++) {
              if (slots.indexOf(bSlots[n]) === -1) { slots.push(bSlots[n]); }
            }
          }
          if (slots.length) { slots.sort(); }
          if (!anyActive) {
            // ADAPTACIÓN demoagenda: tenant sin barberos → fila general.
            slots = computeSlots(av.workingPlan, av.exceptions, av.appointments, [], dateISO, null, rawServices, durationMin);
          }
        }

        return { slots: slots, barbers: availBarbers };
      });
  }

  function clearAvailabilityCache() {
    cacheClearPrefix('av:');
    cacheClearPrefix('day:');
    cacheClearPrefix('month:');
  }

  /** Crea el turno en modo demo local: lo persiste en localStorage y lo
   *  devuelve con _id generado para que el paso 4 de confirmación funcione.
   *  Incluye service/barber anidados (lo que el panel admin espera leer). */
  function localCreateAppointment(d) {
    var utils = root.CCESCO_UTILS || {};
    var phone = (typeof utils.normalizePhoneUY === 'function')
      ? utils.normalizePhoneUY(d.client_phone)
      : String(d.client_phone || '').replace(/\D/g, '');
    var svcs = rawDemoServices();
    var bbs = rawDemoBarbers();
    var service = null, barber = null;
    for (var i = 0; i < svcs.length; i++) {
      if (svcs[i].id === d.service_id) { service = svcs[i]; break; }
    }
    for (var j = 0; j < bbs.length; j++) {
      if (bbs[j].id === d.barber_id) { barber = bbs[j]; break; }
    }
    var id = 'demo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    var created = {
      id: id,
      _id: id,
      service_id: d.service_id,
      barber_id: d.barber_id || null,
      provider_id: d.barber_id || null,
      date: d.date,
      time: normTime(d.time),
      client_name: String(d.client_name || '').trim(),
      client_phone: phone,
      note: d.note ? String(d.note).trim() : null,
      source: d.source || 'web',
      status: 'pending',
      createdAt: new Date().toISOString(),
      service: service ? { id: service.id, name_es: service.name_es, price: service.price, duration_min: service.duration_min } : null,
      barber: barber ? { id: barber.id, name: barber.name, role: barber.role } : null
    };
    var arr = getLocalAppointments();
    arr.push(created);
    saveLocalAppointments(arr);
    clearAvailabilityCache();
    return created;
  }

  // =========================================================================
  // API pública
  // =========================================================================

  root.CCESCO_DB = {
    /** Catálogo index.html — jamás lanza (contrato main.js intacto). */
    getServices: function () {
      return safe('services', function () {
        return localOrRemote('listServices', {}, rawDemoServices).then(function (list) {
          return (list || []).map(mapService)
            .filter(function (s) { return s.active && s.name; })
            .sort(byOrder);
        });
      });
    },

    getBarbers: function () {
      return safe('barbers', function () {
        return localOrRemote('listBarbers', {}, rawDemoBarbers).then(function (list) {
          return (list || []).map(mapBarber)
            .filter(function (b) { return b.active && b.name; })
            .sort(byOrder);
        });
      });
    },

    getWorkingPlan: function () {
      return safe('plan', function () {
        return localOrRemote('getWorkingPlan', {}, rawDemoPlan).then(function (list) {
          // Solo filas generales (sin barber_id): horario del local.
          return (list || []).map(mapPlanRow)
            .filter(function (r) { return !r.barberRef; })
            .sort(byDow);
        });
      });
    },

    /** Catálogo wizard — propaga error (la UI distingue vacío/error, R3).
     *  En modo demo local resuelve con DEMO_CATALOG mapeado. */
    getServicesStrict: function () {
      return cachedStrict('services', function () {
        return localOrRemote('listServices', {}, rawDemoServices).then(function (list) {
          return (list || []).map(mapService)
            .filter(function (s) { return s.active && s.name; })
            .sort(byOrder);
        });
      });
    },

    getBarbersStrict: function () {
      return cachedStrict('barbers', function () {
        return localOrRemote('listBarbers', {}, rawDemoBarbers).then(function (list) {
          return (list || []).map(mapBarber)
            .filter(function (b) { return b.active && b.name; })
            .sort(byOrder);
        });
      });
    },

    /**
     * getAvailability(dateISO, serviceId, barberId|null) → {slots:[], barbers:[]}
     * Slots computados cliente-side (motor de arriba); errores propagan.
     */
    getAvailability: function (dateISO, serviceId, barberId) {
      var key = 'day:' + dateISO + ':' + (serviceId || 'any') + ':' + (barberId || 'any');
      // HOY no se cachea strict: sus slots dependen de la hora del reloj que avanza.
      // Si quedan memoizados (el prefetch mensual priva 'day:HOY' con los slots del
      // día completo), a las 14:03 seguirían apareciendo los de las 09:00.
      if (dateISO === dateToISO(new Date())) {
        return dayAvailability(dateISO, serviceId, barberId || null);
      }
      return cachedStrict(key, function () {
        return dayAvailability(dateISO, serviceId, barberId || null);
      });
    },

    /**
     * getMonthAvailability('YYYY-MM', serviceId, barberId|null)
     * → {days:{'YYYY-MM-DD':{slots:[]}}} — prefetch mensual del calendario
     * (mismo patrón que fetchAvailabilityForMonth de thefaleros). Cada día
     * queda además primado en la caché 'day:' para selección instantánea.
     */
    getMonthAvailability: function (monthStr, serviceId, barberId) {
      var key = 'month:' + monthStr + ':' + (serviceId || 'any') + ':' + (barberId || 'any');
      return cachedStrict(key, function () {
        var parts = String(monthStr).split('-');
        var year = Number(parts[0]);
        var monIdx = Number(parts[1]) - 1;
        var daysInMonth = new Date(year, monIdx + 1, 0).getDate();
        var jobs = [];
        var dates = [];
        for (var d = 1; d <= daysInMonth; d++) {
          var dateISO = year + '-' + padNum(monIdx + 1) + '-' + padNum(d);
          dates.push(dateISO);
          /* Thunks (no promesas): pool() decide cuántas corren en paralelo. */
        jobs.push(function () { return dayAvailability(dateISO, serviceId, barberId || null); });
        }
        return pool(jobs, MONTH_POOL).then(function (results) {
          var days = {};
          for (var i = 0; i < results.length; i++) {
            days[dates[i]] = { slots: results[i].slots };
            cacheSet('day:' + dates[i] + ':' + (serviceId || 'any') + ':' + (barberId || 'any'), results[i]);
          }
          return { days: days };
        });
      });
    },

    /**
     * createAppointment(doc) → Promise<turno creado>
     * Normaliza (HH:MM, tel UY a 9 dígitos) y propaga .code del server
     * (SLOT_TAKEN | PAST_DATE | PAST_TIME | INVALID_*). Al éxito invalida
     * TODA la caché de disponibilidad.
     */
    createAppointment: function (d) {
      if (useLocalDemo) { return Promise.resolve(localCreateAppointment(d)); }
      var utils = root.CCESCO_UTILS || {};
      var phone = (typeof utils.normalizePhoneUY === 'function')
        ? utils.normalizePhoneUY(d.client_phone)
        : String(d.client_phone || '').replace(/\D/g, '');
      var payload = {
        service_id: d.service_id,
        provider_id: d.barber_id || null,
        date: d.date,
        time: normTime(d.time),
        client_name: String(d.client_name || '').trim(),
        client_phone: phone,
        note: d.note ? String(d.note).trim() : null,
        source: d.source || 'web'
      };
      return mongoRequest('createAppointment', { doc: payload }).then(function (created) {
        clearAvailabilityCache();
        return created;
      });
    },

    /** Motor puro, expuesto para tests Node (tests/slots.test.js). */
    _engine: {
      padNum: padNum,
      dateToISO: dateToISO,
      isoToDate: isoToDate,
      dayOfWeek: dayOfWeek,
      timeToMin: timeToMin,
      slotFreeForBarber: slotFreeForBarber,
      slotOverlapsForBarber: slotOverlapsForBarber,
      planRowForDate: planRowForDate,
      computeSlots: computeSlots,
      pickFreeBarber: pickFreeBarber
    }
  };

  // =========================================================================
  // CCESCO_ADMIN — acciones autenticadas del panel (admin.html).
  // Todas tocan ADMIN_ACTIONS del server => exigen token de loginPin.
  // El token NO vive acá: lo administra js/admin.js (sessionStorage).
  // En modo demo local (R2-D3) existe un token de demo (DEMO_ADMIN_TOKEN):
  // loginPin acepta el PIN cfg.demo.pin ('0000') y el panel opera 100%
  // offline sobre localStorage ('demoagenda_demo_appointments'). El CRUD
  // de catálogo (servicios/barberos/plan/excepciones) en modo demo queda
  // remoto (documentado: el catálogo ficticio es fijo por sesión).
  // =========================================================================
  function isDemoToken(token) { return token === DEMO_ADMIN_TOKEN; }

  function localAdminListAppointments(q) {
    var all = getLocalAppointments().slice().sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time));
    });
    var query = q || {};
    if (query.date) {
      all = all.filter(function (a) { return String(a.date) === String(query.date); });
    }
    if (query.dateFrom) {
      all = all.filter(function (a) { return String(a.date) >= String(query.dateFrom); });
    }
    if (query.dateTo) {
      all = all.filter(function (a) { return String(a.date) <= String(query.dateTo); });
    }
    if (query.status) {
      all = all.filter(function (a) { return String(a.status) === String(query.status); });
    }
    return all;
  }

  function localAdminSaveAppointments(arr) {
    saveLocalAppointments(arr);
    clearAvailabilityCache();
  }

  function localAdminCreateAppointment(d) {
    var created = localCreateAppointment(d);
    if (d && d.status) { created.status = d.status; }
    return created;
  }

  function localAdminPatchById(id, patch, notFoundMsg) {
    var arr = getLocalAppointments();
    var hit = null;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._id === id || arr[i].id === id) { hit = arr[i]; break; }
    }
    if (!hit) {
      return Promise.reject({ ok: false, error: { code: 'NOT_FOUND', message: notFoundMsg || 'Turno no encontrado' } });
    }
    for (var p in (patch || {})) {
      if (Object.prototype.hasOwnProperty.call(patch, p)) { hit[p] = patch[p]; }
    }
    localAdminSaveAppointments(arr);
    return Promise.resolve(hit);
  }

  root.CCESCO_ADMIN = {
    /** loginPin(pin) → {token, expiresInMs}
     *  El PIN demo (cfg.demo.pin → '0000') da paso directo al panel local. */
    loginPin: function (pin) {
      var clean = String(pin || '').trim();
      if (demoFallbackAllowed() && clean === String(DEMO.pin)) {
        noteLocalFallback('login demo del panel admin');
        return Promise.resolve({ token: DEMO_ADMIN_TOKEN, expiresInMs: 8 * 3600 * 1000 });
      }
      return mongoRequest('loginPin', { pin: clean });
    },

    /** Turnos por día/rango; el server adjunta service y barbero anidados.
     *  Query soportada: {date}, {dateFrom,dateTo} y {date,status}. */
    listAppointments: function (token, query) {
      if (isDemoToken(token)) {
        return Promise.resolve(localAdminListAppointments(query));
      }
      return mongoRequest('listAppointments', { query: query || {} }, token);
    },
    updateAppointmentStatus: function (token, id, status) {
      if (isDemoToken(token)) {
        return localAdminPatchById(id, { status: status });
      }
      return mongoRequest('updateAppointmentStatus', { id: id, status: status }, token);
    },
    updateAppointment: function (token, id, patch) {
      if (isDemoToken(token)) {
        return localAdminPatchById(id, patch || {});
      }
      return mongoRequest('updateAppointment', { id: id, patch: patch }, token);
    },
    deleteAppointment: function (token, id) {
      if (isDemoToken(token)) {
        localAdminSaveAppointments(getLocalAppointments().filter(function (a) {
          return !(a._id === id || a.id === id);
        }));
        return Promise.resolve({ id: id, deleted: true });
      }
      return mongoRequest('deleteAppointment', { id: id }, token);
    },

    /** Lecturas del panel: acciones públicas listServices/listBarbers
     *  (el token va como Bearer pero la acción no lo exige). */
    listServices: function (token) {
      if (isDemoToken(token)) { return Promise.resolve(rawDemoServices()); }
      return mongoRequest('listServices', {}, token);
    },
    listBarbers: function (token) {
      if (isDemoToken(token)) { return Promise.resolve(rawDemoBarbers()); }
      return mongoRequest('listBarbers', {}, token);
    },

    /** Servicios: contrato snake_case bilingüe del server.
     *  En modo demo el CRUD del catálogo queda remoto (fijo por sesión). */
    createService: function (token, doc) {
      return mongoRequest('createService', { doc: doc }, token);
    },
    updateService: function (token, id, patch) {
      return mongoRequest('updateService', { id: id, patch: patch }, token);
    },
    deleteService: function (token, id) {
      return mongoRequest('deleteService', { id: id }, token);
    },

    /** Equipo. */
    createBarber: function (token, doc) {
      return mongoRequest('createBarber', { doc: doc }, token);
    },
    updateBarber: function (token, id, patch) {
      return mongoRequest('updateBarber', { id: id, patch: patch }, token);
    },
    deleteBarber: function (token, id) {
      return mongoRequest('deleteBarber', { id: id }, token);
    },

    /** Plan laboral: general (barber_id null) y por barbero. */
    getWorkingPlan: function (token) {
      if (isDemoToken(token)) { return Promise.resolve(rawDemoPlan()); }
      return mongoRequest('getWorkingPlan', {}, token);
    },
    updateGeneralPlanDay: function (token, dow, patch) {
      return mongoRequest('updateGeneralPlanDay', { dow: dow, patch: patch }, token);
    },
    getBarberPlan: function (token, barberId) {
      if (isDemoToken(token)) {
        return Promise.resolve(rawDemoPlan().filter(function (r) {
          return !r.barber_id || r.barber_id === barberId;
        }));
      }
      return mongoRequest('getBarberPlan', { barberId: barberId }, token);
    },
    updateBarberPlanDay: function (token, barberId, dow, patch) {
      return mongoRequest('updateBarberPlanDay', { barberId: barberId, dow: dow, patch: patch }, token);
    },
    resetBarberPlan: function (token, barberId) {
      return mongoRequest('resetBarberPlan', { barberId: barberId }, token);
    },

    /** Excepciones (feriados/licencias): all_day o franja, por barbero o todos.
     *  En modo demo se devuelven las excepciones de ejemplo de
     *  cfg.demo.exceptions (la sección Horarios muestra datos reales);
     *  el CRUD queda remoto (fijo por sesión). */
    listExceptions: function (token) {
      if (isDemoToken(token)) { return Promise.resolve((DEMO.exceptions || []).slice()); }
      return mongoRequest('listExceptions', {}, token);
    },
    createException: function (token, doc) {
      return mongoRequest('createException', { doc: doc }, token);
    },
    deleteException: function (token, id) {
      return mongoRequest('deleteException', { id: id }, token);
    },

    /* Alta manual desde el panel: allowPast exige token (lo valida el server).
       En modo demo persiste en el mismo storage que el wizard. */
    createAppointmentAdmin: function (token, apptDoc) {
      if (isDemoToken(token)) {
        return Promise.resolve(localAdminCreateAppointment(apptDoc));
      }
      var d = {};
      for (var k in apptDoc) {
        if (Object.prototype.hasOwnProperty.call(apptDoc, k)) { d[k] = apptDoc[k]; }
      }
      d.allowPast = true;
      return mongoRequest('createAppointment', { doc: d }, token);
    }
  };

  // Siembra de datos de ejemplo del modo vista: corre al cargar el módulo
  // (primera visita o versión distinta); nunca pisa turnos del wizard.
  seedDemoIfNeeded();

})(typeof window !== 'undefined' ? window : this);
