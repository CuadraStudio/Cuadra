/**
 * Capa de datos del panel de administración — CUADRA_DB.
 *
 * Se copia tal cual a js/admin-db.js en todo tenant demo (independiente de
 * la vertical: agenda/tienda/resto/consulta comparten el mismo motor de
 * colecciones, solo cambian los nombres de colección que usa cada admin.js).
 *
 * No hay backend: todo vive en localStorage, sembrado una vez desde
 * window.SITE_CONFIG.admin (lo que ya cargaste en el config del tenant —
 * servicios, equipo, productos, carta, horarios). Así el panel abre ya con
 * el catálogo real del negocio, sin pantalla vacía.
 *
 * Todas las funciones devuelven Promise (aunque el storage es síncrono) para
 * que admin.js pueda tratar este módulo exactamente como trataría una API
 * real — el mismo código de UI sirve para el panel demo y, el día de mañana,
 * para una versión conectada a la API de CUADRA.
 */
(function (root) {
  'use strict';

  var CFG = root.SITE_CONFIG || {};
  var SLUG = (CFG.tenant && CFG.tenant.slug) || 'cuadra';
  var SEED = CFG.admin || {};

  function ok(v) { return Promise.resolve(v); }
  function fail(code, message) {
    var err = new Error(message || code);
    err.code = code;
    return Promise.reject(err);
  }

  function key(name) { return SLUG + '_db_' + name; }

  function genId(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------------------------------------------------------- storage core */

  function readRaw(name) {
    try { return JSON.parse(root.localStorage.getItem(key(name))) || null; } catch (e) { return null; }
  }
  function writeRaw(name, value) {
    try { root.localStorage.setItem(key(name), JSON.stringify(value)); } catch (e) { /* modo privado */ }
  }

  /** Colección con semilla: si nunca se guardó nada, arranca con `seed()`.
      `seed` es una función (no un valor) para no recalcular si ya hay datos. */
  function collection(name, seedFn) {
    return {
      all: function () {
        var list = readRaw(name);
        if (list === null) {
          list = seedFn ? seedFn() : [];
          writeRaw(name, list);
        }
        return list;
      },
      save: function (list) { writeRaw(name, list); return list; },
      reset: function () {
        var list = seedFn ? seedFn() : [];
        writeRaw(name, list);
        return list;
      }
    };
  }

  function findIndex(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return i;
    }
    return -1;
  }

  /* ------------------------------------------------------------------ auth
     Sin backend: el PIN vive en el config (admin.pin), default 0000 — mismo
     contrato que el resto de las demos CUADRA. */
  var PIN = SEED.pin || '0000';
  var AUTH = {
    loginPin: function (pin) {
      if (String(pin) === String(PIN)) return ok({ token: 'local' });
      return fail('INVALID_PIN');
    }
  };

  /* ------------------------------------------------------- seeds (mapeo
     config público del sitio -> forma que espera el panel). Todo lo que el
     tenant ya cargó en su config (servicios, equipo, horarios) aparece acá
     sin que el dueño tenga que cargarlo dos veces. */

  function seedServices() {
    return (SEED.services || []).map(function (s) {
      return {
        id: s.slug || genId('svc'),
        name_es: s.name,
        price: Number(s.price) || 0,
        duration_min: Number(s.duration) || 30,
        group_name: s.category || '',
        desc_es: s.short || '',
        image_url: s.image || null,
        active: true
      };
    });
  }

  function seedTeam() {
    return (SEED.team || []).map(function (m) {
      return { id: m.slug || genId('team'), name: m.name, role: m.role || '', active: true };
    });
  }

  function seedGeneralPlan() {
    /* SEED.hoursPlan ya viene armado como 7 filas (dow 0=domingo..6=sábado)
       desde build.js — evita reimplementar el parseo de dayOfWeek acá. */
    return SEED.hoursPlan || defaultWeekPlan();
  }

  function defaultWeekPlan() {
    var rows = [];
    for (var d = 0; d <= 6; d++) {
      rows.push({ dow: d, active: d >= 1 && d <= 5, start_time: '09:00', end_time: '19:00' });
    }
    return rows;
  }

  function seedProducts() {
    return (SEED.products || []).map(function (p) {
      return {
        id: p.slug || genId('prod'),
        name: p.name,
        price: Number(p.price) || 0,
        category: p.category || '',
        desc: p.short || '',
        image_url: p.image || null,
        stock: 'disponible',
        active: true
      };
    });
  }

  function seedDishes() {
    var out = [];
    (SEED.menu || []).forEach(function (section) {
      (section.items || []).forEach(function (item) {
        out.push({
          id: genId('dish'),
          name: item.name,
          price: Number(item.price) || 0,
          category: section.name || '',
          desc: item.description || '',
          active: true
        });
      });
    });
    return out;
  }

  function seedTables() {
    /* No hay "mesas" en el config público (el sitio solo modela franjas de
       reserva) — arranca con un salón genérico, editable desde el panel. */
    return [
      { id: genId('tbl'), name: 'Mesa 1', seats: 2, active: true },
      { id: genId('tbl'), name: 'Mesa 2', seats: 2, active: true },
      { id: genId('tbl'), name: 'Mesa 3', seats: 4, active: true },
      { id: genId('tbl'), name: 'Mesa 4', seats: 4, active: true },
      { id: genId('tbl'), name: 'Mesa 5', seats: 6, active: true },
      { id: genId('tbl'), name: 'Mesa 6', seats: 8, active: true }
    ];
  }

  var Services = collection('services', seedServices);
  var Team = collection('team', seedTeam);
  var Appointments = collection('appointments', function () { return []; });
  var Exceptions = collection('exceptions', function () { return []; });
  var GeneralPlan = collection('plan_general', seedGeneralPlan);

  var Products = collection('products', seedProducts);
  var Orders = collection('orders', function () { return []; });

  var Dishes = collection('dishes', seedDishes);
  var Tables = collection('tables', seedTables);
  var Reservations = collection('reservations', function () { return []; });

  function barberPlanCollection(barberId) {
    return collection('plan_barber_' + barberId, function () { return GeneralPlan.all().map(copyRow); });
  }
  function copyRow(r) { return { dow: r.dow, active: r.active, start_time: r.start_time, end_time: r.end_time }; }

  /* ============================================================ AGENDA /
     CONSULTA — turnos, servicios, equipo, horarios, excepciones */

  function matchesQuery(a, q) {
    if (!q) return true;
    if (q.date && a.date !== q.date) return false;
    if (q.dateFrom && a.date < q.dateFrom) return false;
    if (q.dateTo && a.date > q.dateTo) return false;
    if (q.status && a.status !== q.status) return false;
    return true;
  }

  function listAppointments(q) {
    var list = Appointments.all().filter(function (a) { return matchesQuery(a, q); });
    return ok(list.slice());
  }

  function createAppointment(doc) {
    var services = Services.all();
    var team = Team.all();
    var svc = null;
    for (var i = 0; i < services.length; i++) { if (services[i].id === doc.service_id) { svc = services[i]; break; } }
    var barber = null;
    for (var j = 0; j < team.length; j++) { if (team[j].id === doc.barber_id) { barber = team[j]; break; } }

    if (!doc.allowPast) {
      var todayMin = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0');
      if (doc.date < todayMin) return fail('INVALID_DATE', 'La fecha ya pasó.');
    }

    var rec = {
      id: genId('appt'),
      created: new Date().toISOString(),
      date: doc.date,
      time: doc.time,
      status: doc.status || 'pending',
      client_name: doc.client_name || '',
      client_phone: doc.client_phone || '',
      note: doc.note || null,
      service: svc ? { id: svc.id, name_es: svc.name_es } : null,
      barber: barber ? { id: barber.id, name: barber.name } : null,
      source: doc.source || 'web'
    };
    var list = Appointments.all();
    list.push(rec);
    Appointments.save(list);
    return ok(rec);
  }

  function updateAppointment(id, patch) {
    var list = Appointments.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    var services = Services.all();
    var team = Team.all();
    var a = list[idx];
    if (patch.client_name !== undefined) a.client_name = patch.client_name;
    if (patch.client_phone !== undefined) a.client_phone = patch.client_phone;
    if (patch.date !== undefined) a.date = patch.date;
    if (patch.time !== undefined) a.time = patch.time;
    if (patch.note !== undefined) a.note = patch.note;
    if (patch.service_id !== undefined) {
      var svc = null;
      for (var i = 0; i < services.length; i++) { if (services[i].id === patch.service_id) { svc = services[i]; break; } }
      a.service = svc ? { id: svc.id, name_es: svc.name_es } : null;
    }
    if (patch.barber_id !== undefined) {
      var barber = null;
      for (var j = 0; j < team.length; j++) { if (team[j].id === patch.barber_id) { barber = team[j]; break; } }
      a.barber = barber ? { id: barber.id, name: barber.name } : null;
    }
    Appointments.save(list);
    return ok(a);
  }

  function updateAppointmentStatus(id, status) {
    return updateAppointment(id, {}).then(function () {
      var list = Appointments.all();
      var idx = findIndex(list, id);
      if (idx < 0) return fail('NOT_FOUND');
      list[idx].status = status;
      Appointments.save(list);
      return list[idx];
    });
  }

  function deleteAppointment(id) {
    var list = Appointments.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Appointments.save(list);
    return ok(true);
  }

  function listServices() { return ok(Services.all().slice()); }
  function createService(doc) {
    var list = Services.all();
    var rec = Object.assign({ id: genId('svc'), active: true }, doc);
    list.push(rec);
    Services.save(list);
    return ok(rec);
  }
  function updateService(id, patch) {
    var list = Services.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list[idx] = Object.assign({}, list[idx], patch);
    Services.save(list);
    return ok(list[idx]);
  }
  function deleteService(id) {
    var list = Services.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Services.save(list);
    return ok(true);
  }

  function listBarbers() { return ok(Team.all().slice()); }
  function createBarber(doc) {
    var list = Team.all();
    var rec = Object.assign({ id: genId('team'), active: true }, doc);
    list.push(rec);
    Team.save(list);
    return ok(rec);
  }
  function updateBarber(id, patch) {
    var list = Team.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list[idx] = Object.assign({}, list[idx], patch);
    Team.save(list);
    return ok(list[idx]);
  }
  function deleteBarber(id) {
    var list = Team.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Team.save(list);
    return ok(true);
  }

  function getWorkingPlan() { return ok(GeneralPlan.all().slice()); }
  function updateGeneralPlanDay(dow, patch) {
    var rows = GeneralPlan.all();
    var idx = -1;
    for (var i = 0; i < rows.length; i++) { if (Number(rows[i].dow) === Number(dow)) { idx = i; break; } }
    if (idx < 0) { rows.push(Object.assign({ dow: dow }, patch)); }
    else { rows[idx] = Object.assign({}, rows[idx], patch); }
    GeneralPlan.save(rows);
    return ok(rows);
  }
  function getBarberPlan(barberId) { return ok(barberPlanCollection(barberId).all().slice()); }
  function updateBarberPlanDay(barberId, dow, patch) {
    var col = barberPlanCollection(barberId);
    var rows = col.all();
    var idx = -1;
    for (var i = 0; i < rows.length; i++) { if (Number(rows[i].dow) === Number(dow)) { idx = i; break; } }
    if (idx < 0) { rows.push(Object.assign({ dow: dow }, patch)); }
    else { rows[idx] = Object.assign({}, rows[idx], patch); }
    col.save(rows);
    return ok(rows);
  }
  function resetBarberPlan(barberId) { return ok(barberPlanCollection(barberId).reset()); }

  function listExceptions() { return ok(Exceptions.all().slice()); }
  function createException(doc) {
    var list = Exceptions.all();
    var rec = Object.assign({ id: genId('exc') }, doc);
    list.push(rec);
    Exceptions.save(list);
    return ok(rec);
  }
  function deleteException(id) {
    var list = Exceptions.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Exceptions.save(list);
    return ok(true);
  }

  /* ==================================================================
     TIENDA — productos, pedidos */

  function listProducts() { return ok(Products.all().slice()); }
  function createProduct(doc) {
    var list = Products.all();
    var rec = Object.assign({ id: genId('prod'), active: true, stock: 'disponible' }, doc);
    list.push(rec);
    Products.save(list);
    return ok(rec);
  }
  function updateProduct(id, patch) {
    var list = Products.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list[idx] = Object.assign({}, list[idx], patch);
    Products.save(list);
    return ok(list[idx]);
  }
  function deleteProduct(id) {
    var list = Products.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Products.save(list);
    return ok(true);
  }

  function listOrders(q) {
    var list = Orders.all().filter(function (o) {
      if (q && q.date && o.date !== q.date) return false;
      if (q && q.status && o.status !== q.status) return false;
      return true;
    });
    return ok(list.slice());
  }
  function createOrder(doc) {
    var rec = Object.assign({
      id: genId('ord'),
      created: new Date().toISOString(),
      date: doc.date || new Date().toISOString().slice(0, 10),
      status: doc.status || 'pending'
    }, doc);
    var list = Orders.all();
    list.push(rec);
    Orders.save(list);
    return ok(rec);
  }
  function updateOrderStatus(id, status) {
    var list = Orders.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list[idx].status = status;
    Orders.save(list);
    return ok(list[idx]);
  }
  function deleteOrder(id) {
    var list = Orders.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Orders.save(list);
    return ok(true);
  }

  /* ==================================================================
     RESTÓ — carta, mesas, reservas (+ pedidos de delivery via Orders) */

  function listDishes() { return ok(Dishes.all().slice()); }
  function createDish(doc) {
    var list = Dishes.all();
    var rec = Object.assign({ id: genId('dish'), active: true }, doc);
    list.push(rec);
    Dishes.save(list);
    return ok(rec);
  }
  function updateDish(id, patch) {
    var list = Dishes.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list[idx] = Object.assign({}, list[idx], patch);
    Dishes.save(list);
    return ok(list[idx]);
  }
  function deleteDish(id) {
    var list = Dishes.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Dishes.save(list);
    return ok(true);
  }

  function listTables() { return ok(Tables.all().slice()); }
  function createTable(doc) {
    var list = Tables.all();
    var rec = Object.assign({ id: genId('tbl'), active: true }, doc);
    list.push(rec);
    Tables.save(list);
    return ok(rec);
  }
  function updateTable(id, patch) {
    var list = Tables.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list[idx] = Object.assign({}, list[idx], patch);
    Tables.save(list);
    return ok(list[idx]);
  }
  function deleteTable(id) {
    var list = Tables.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Tables.save(list);
    return ok(true);
  }

  function listReservations(q) {
    var list = Reservations.all().filter(function (r) {
      if (q && q.date && r.date !== q.date) return false;
      if (q && q.dateFrom && r.date < q.dateFrom) return false;
      if (q && q.dateTo && r.date > q.dateTo) return false;
      if (q && q.status && r.status !== q.status) return false;
      return true;
    });
    return ok(list.slice());
  }
  function createReservation(doc) {
    var rec = Object.assign({
      id: genId('res'),
      created: new Date().toISOString(),
      status: doc.status || 'pending'
    }, doc);
    var list = Reservations.all();
    list.push(rec);
    Reservations.save(list);
    return ok(rec);
  }
  function updateReservationStatus(id, status) {
    var list = Reservations.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list[idx].status = status;
    Reservations.save(list);
    return ok(list[idx]);
  }
  function updateReservation(id, patch) {
    var list = Reservations.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list[idx] = Object.assign({}, list[idx], patch);
    Reservations.save(list);
    return ok(list[idx]);
  }
  function deleteReservation(id) {
    var list = Reservations.all();
    var idx = findIndex(list, id);
    if (idx < 0) return fail('NOT_FOUND');
    list.splice(idx, 1);
    Reservations.save(list);
    return ok(true);
  }

  /* ==================================================================
     Horarios simples (Tienda / Restó) — un único plan, sin excepción por
     empleado (no hay "equipo" con agenda propia en esas verticales). */
  function getSimpleHours() { return ok(GeneralPlan.all().slice()); }
  function updateSimpleHoursDay(dow, patch) { return updateGeneralPlanDay(dow, patch); }

  root.CUADRA_DB = {
    auth: AUTH,
    /* agenda / consulta */
    listAppointments: listAppointments,
    createAppointment: createAppointment,
    updateAppointment: updateAppointment,
    updateAppointmentStatus: updateAppointmentStatus,
    deleteAppointment: deleteAppointment,
    listServices: listServices,
    createService: createService,
    updateService: updateService,
    deleteService: deleteService,
    listBarbers: listBarbers,
    createBarber: createBarber,
    updateBarber: updateBarber,
    deleteBarber: deleteBarber,
    getWorkingPlan: getWorkingPlan,
    updateGeneralPlanDay: updateGeneralPlanDay,
    getBarberPlan: getBarberPlan,
    updateBarberPlanDay: updateBarberPlanDay,
    resetBarberPlan: resetBarberPlan,
    listExceptions: listExceptions,
    createException: createException,
    deleteException: deleteException,
    /* tienda */
    listProducts: listProducts,
    createProduct: createProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    listOrders: listOrders,
    createOrder: createOrder,
    updateOrderStatus: updateOrderStatus,
    deleteOrder: deleteOrder,
    /* resto */
    listDishes: listDishes,
    createDish: createDish,
    updateDish: updateDish,
    deleteDish: deleteDish,
    listTables: listTables,
    createTable: createTable,
    updateTable: updateTable,
    deleteTable: deleteTable,
    listReservations: listReservations,
    createReservation: createReservation,
    updateReservation: updateReservation,
    updateReservationStatus: updateReservationStatus,
    deleteReservation: deleteReservation,
    /* horarios simples */
    getSimpleHours: getSimpleHours,
    updateSimpleHoursDay: updateSimpleHoursDay
  };
}(typeof window !== 'undefined' ? window : this));
