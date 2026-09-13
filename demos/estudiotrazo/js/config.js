/**
 * demoAgenda — Config del tenant demo (window.AGENDA_DEMO_CONFIG)
 *
 * Identidad ficticia (rebranding Estudio Trazo): demo de producto de la
 * vertical CUADRA Agenda, sin relación con ningún negocio real.
 * API multi-tenant: lecturas de catálogo y disponibilidad + escrituras del
 * wizard de reservas (createAppointment) y del panel admin.
 * Los placeholders PLACEHOLDER_* son el fallback diseñado (D2): viven
 * también como markup estático en index.html con data-placeholder="true";
 * este archivo es la referencia de datos para QA y para el renderer.
 * NOTA: el identificador interno window.CCESCO_CONFIG se mantiene por
 * contrato con db.js/admin.js/utils.js/main.js/booking.js (solo cambian
 * valores); no es visible al usuario.
 */
window.CCESCO_CONFIG = {
  tenant: {
    slug: 'demoagenda',
    name: 'Estudio Trazo',
    phone: '+59899000000',
    phoneDisplay: '099 000 000',
    currency: 'UYU',
    address: 'Bulevar Artigas 2026, Montevideo, Uruguay'
  },

  // BarberAPI multi-tenant: POST {action, payload}. Lecturas de catálogo y
  // disponibilidad + escrituras de reservas (wizard) y del panel admin.
  mongo: {
    enabled: true,
    apiBase: 'https://cuadra-api-t7rg.onrender.com/api/demoagenda',
    requestTimeoutMs: 8000   // cubre cold start de Render free tier (RF-2)
  },

  // Wizard de reservas (evolución de D1, docs/design.md §R11): el turno se
  // confirma contra la API y WhatsApp pasa a ser canal posterior. Estos
  // parámetros alimentan el motor de slots cliente-side de db.js.
  booking: {
    slotStepMin: 15,        // granularidad de franjas (cada 15 min)
    minAdvanceHours: 1      // antelación mínima para reservar el mismo día
  },

  /* ------------------------------------------------------------------
   * Modo demo local (R2-D3): catálogo ficticio accionable cuando la API
   * no tiene el tenant (UNKNOWN_TENANT), falla o devuelve vacío. db.js lo
   * activa automáticamente al PRIMER fallo de red y lo mantiene (latcheado);
   * los turnos creados en modo local se persisten en localStorage bajo
   * storageKey. El PIN demo habilita el panel admin offline.
   * ------------------------------------------------------------------ */
  demo: {
    enabled: true,
    // PIN de auto-acceso público del panel demo: con demo.enabled, el admin
    // (js/admin.js) intenta loginPin('0000') solo al abrir la página y deja
    // el form como fallback si el login no se puede completar.
    pin: '0000',
    storageKey: 'demoagenda_demo_appointments',
    // Sesión con el PIN demo = SOLO LECTURA (modo vista). El panel entra
    // igual (admin.js lo detecta por el PIN y activa VIEW_MODE): cada botón
    // y sección se explora, pero ninguna escritura persiste. El token demo
    // es local y jamás abre rutas cross-tenant.
    mode: 'viewer',
    // Versión del seed de ejemplo: si cambia, db.js re-siembra SOLO cuando
    // el storage de turnos está vacío (nunca pisa turnos del wizard).
    seedVersion: 1,
    // Excepciones de ejemplo con el shape API de listExceptions
    // ({id,date,barber_id,all_day,start_time,end_time,reason}): la sección
    // Horarios las muestra y el motor de slots las respeta. Fechas relativas
    // a HOY para que siempre haya excepciones futuras visibles.
    exceptions: (function () {
      function iso(offsetDays) {
        var d = new Date();
        d.setDate(d.getDate() + offsetDays);
        var mm = d.getMonth() + 1;
        var dd = d.getDate();
        return d.getFullYear() + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd;
      }
      return [
        { id: 'demo-exc-feriado', date: iso(10), barber_id: null, all_day: true, start_time: null, end_time: null, reason: 'Feriado local' },
        { id: 'demo-exc-reducido', date: iso(3), barber_id: null, all_day: false, start_time: '12:00', end_time: '18:00', reason: 'Capacitación de equipo' }
      ];
    })(),
    // Turnos de ejemplo (mismo shape que localCreateAppointment en db.js:
    // id/_id, service_id, barber_id, provider_id, date, time, client_name,
    // client_phone, note, source, status, createdAt + service/barber
    // anidados). Cobertura: hoy (1 pending + 1 confirmed + 1 cancelled),
    // mañana (2: pending + confirmed) y días pasados (2 confirmed + 1
    // cancelled). Las fechas son RELATIVAS a hoy (iso(offset)) para que el
    // demo siempre tenga "hoy" poblado; las horas caen dentro del plan
    // L–V 09:00–19:00 / Sáb 10:00–18:00 para cualquier día de la semana.
    appointments: (function () {
      function iso(offsetDays) {
        var d = new Date();
        d.setDate(d.getDate() + offsetDays);
        var mm = d.getMonth() + 1;
        var dd = d.getDate();
        return d.getFullYear() + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd;
      }
      var svcs = {
        corte: { id: 'svc-corte', name_es: 'Corte clásico', price: 450, duration_min: 30 },
        barba: { id: 'svc-barba', name_es: 'Perfilado de barba', price: 350, duration_min: 30 },
        corteBarba: { id: 'svc-corte-barba', name_es: 'Corte + barba', price: 750, duration_min: 45 },
        corteCejas: { id: 'svc-corte-cejas', name_es: 'Corte + cejas', price: 550, duration_min: 45 },
        completo: { id: 'svc-completo', name_es: 'Completo: corte + barba + cejas', price: 900, duration_min: 60 }
      };
      var barbers = {
        facundo: { id: 'bar-facundo', name: 'Facundo Reyes', role: 'Barbero' },
        martin: { id: 'bar-martin', name: 'Martín Suárez', role: 'Barbero' },
        agustin: { id: 'bar-agustin', name: 'Agustín Ferreira', role: 'Barbero' }
      };
      function mk(id, date, time, status, client, phone, svc, bb, note) {
        return {
          id: id, _id: id,
          service_id: svc.id,
          barber_id: bb ? bb.id : null,
          provider_id: bb ? bb.id : null,
          date: date, time: time,
          client_name: client,
          client_phone: phone,
          note: note || null,
          source: 'demo-seed',
          status: status,
          createdAt: new Date().toISOString(),
          service: svc,
          barber: bb
        };
      }
      return [
        mk('demo-seed-today-pending', iso(0), '10:00', 'pending', 'Rodrigo Ferreyra', '099123456', svcs.corte, barbers.facundo, 'Pide tijera, poco fade'),
        mk('demo-seed-today-confirmed', iso(0), '11:30', 'confirmed', 'Marcos Silva', '098765432', svcs.corteBarba, barbers.martin, null),
        mk('demo-seed-today-cancelled', iso(0), '15:00', 'cancelled', 'Ignacio Pereira', '091234567', svcs.barba, barbers.agustin, 'Avisó por WhatsApp'),
        mk('demo-seed-tomorrow-pending', iso(1), '10:30', 'pending', 'Sebastián Olivera', '092345678', svcs.completo, barbers.facundo, null),
        mk('demo-seed-tomorrow-confirmed', iso(1), '16:30', 'confirmed', 'Nicolás Acosta', '093456789', svcs.corteCejas, barbers.agustin, null),
        mk('demo-seed-past1-confirmed', iso(-1), '11:00', 'confirmed', 'Joaquín Ríos', '094567890', svcs.corte, barbers.martin, null),
        mk('demo-seed-past1-cancelled', iso(-1), '13:00', 'cancelled', 'Bruno Méndez', '095678901', svcs.corteBarba, barbers.facundo, 'No asistió'),
        mk('demo-seed-past3-confirmed', iso(-3), '16:00', 'confirmed', 'Emiliano Suárez', '096789012', svcs.barba, barbers.agustin, null)
      ];
    })()
  },

  whatsapp: {
    base: 'https://wa.me/59899000000',
    message: 'Hola Estudio Trazo, quiero reservar un turno.'
  },

  mapsUrl: 'https://maps.google.com/?q=Bulevar+Artigas+Montevideo,Uruguay',
  instagramUrl: 'https://www.instagram.com/estudiotrazo.demouy',

  // Fallback de horarios = literales genéricos del brief original (permitidos,
  // AC-9; no identifican ningún negocio real).
  hoursFallback: [
    { label: 'Lunes a viernes', time: '9:00–19:00', closed: false },
    { label: 'Sábado', time: '10:00–18:00', closed: false },
    { label: 'Domingo', time: 'Cerrado', closed: true }
  ],

  /* ------------------------------------------------------------------
   * PLACEHOLDERS (D2) — arquetipos genéricos autorizados, SIN precios
   * ni duraciones (null → se tipografían como "—"). El seed del tenant
   * está VACÍO: el sitio vive mayormente de este fallback hasta que el
   * cliente cargue catálogo real vía admin/seed.
   * ------------------------------------------------------------------ */
  PLACEHOLDER_SERVICES: [
    { name: 'Corte', price: null, durationMin: null,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' },
    { name: 'Perfilado de Barba', price: null, durationMin: null,
      image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80' },
    { name: 'Corte + Barba', price: null, durationMin: null,
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80' }
  ],

  PLACEHOLDER_TEAM: {
    text: 'Detrás de cada corte hay criterio, precisión y atención cercana. El trabajo del estudio vive en Instagram: miralo antes de reservar.',
    ctaLabel: 'Ver el trabajo en Instagram',
    ctaUrl: 'https://www.instagram.com/estudiotrazo.demouy'
  },

  /* Regla de Vega (design-gate punto 1) para las imágenes flotantes del
   * hover de filas de servicio: si el servicio de la API trae image_url
   * se usa esa; si no, se asigna del pool curado por índice (módulo).
   * En placeholders, cada arquetipo tiene su imagen propia (la misma del
   * markup estático). NUNCA se inventan imágenes por servicio. */
  FLOATING_IMAGE_POOL: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
  ],

  /* ------------------------------------------------------------------
   * DEMO_CATALOG (R2-D3) — catálogo ficticio del demo, en el MISMO shape
   * crudo que consume la API (snake_case bilingüe: name_es, duration_min,
   * barber_id…). db.js lo mapea con los mappers existentes y lo alimenta
   * al motor de slots cuando la API falla / el tenant no existe.
   *   services    → 5 arquetipos con precio UYU real y duración (30/45/60)
   *   barbers     → 3 barberos uruguayos ficticios (sin personas reales)
   *   workingPlan → L–V 09:00–19:00, Sáb 10:00–18:00, Dom cerrado
   *                 (fila general barber_id null; el motor fallbacka a ella)
   * NO trae image_url a propósito: el renderer asigna las imágenes del
   * pool curado por índice (regla de Vega, arriba).
   * ------------------------------------------------------------------ */
  DEMO_CATALOG: {
    services: [
      { id: 'svc-corte', name_es: 'Corte clásico', price: 450, duration_min: 30, sort_order: 1, active: true, group_name: 'Peluquería' },
      { id: 'svc-barba', name_es: 'Perfilado de barba', price: 350, duration_min: 30, sort_order: 2, active: true, group_name: 'Barbería' },
      { id: 'svc-corte-barba', name_es: 'Corte + barba', price: 750, duration_min: 45, sort_order: 3, active: true, group_name: 'Combinados' },
      { id: 'svc-corte-cejas', name_es: 'Corte + cejas', price: 550, duration_min: 45, sort_order: 4, active: true, group_name: 'Combinados' },
      { id: 'svc-completo', name_es: 'Completo: corte + barba + cejas', price: 900, duration_min: 60, sort_order: 5, active: true, group_name: 'Combinados' }
    ],
    barbers: [
      { id: 'bar-facundo', name: 'Facundo Reyes', role: 'Barbero', sort_order: 1, active: true },
      { id: 'bar-martin', name: 'Martín Suárez', role: 'Barbero', sort_order: 2, active: true },
      { id: 'bar-agustin', name: 'Agustín Ferreira', role: 'Barbero', sort_order: 3, active: true }
    ],
    workingPlan: [
      { dow: 1, start_time: '09:00', end_time: '19:00', barber_id: null, active: true },
      { dow: 2, start_time: '09:00', end_time: '19:00', barber_id: null, active: true },
      { dow: 3, start_time: '09:00', end_time: '19:00', barber_id: null, active: true },
      { dow: 4, start_time: '09:00', end_time: '19:00', barber_id: null, active: true },
      { dow: 5, start_time: '09:00', end_time: '19:00', barber_id: null, active: true },
      { dow: 6, start_time: '10:00', end_time: '18:00', barber_id: null, active: true },
      { dow: 0, start_time: '09:00', end_time: '18:00', barber_id: null, active: false }
    ]
  }
};
