/**
 * El Fogatero — Config del tenant demo (window.RESTO_CONFIG)
 *
 * Sitio de DEMOSTRACIÓN. Identidad, platos, precios y datos son
 * ficticios: no representan ningún negocio real ni usan marcas reales.
 * Este archivo alimenta la carta local, el formulario de reserva
 * y el panel admin demo.
 */
window.RESTO_CONFIG = {
  tenant: {
    slug: 'demoresto',
    name: 'El Fogatero',
    type: 'parrilla',
    tagline: 'Brasas, vino y barrio.',
    phone: '+59899000000',
    phoneDisplay: '099 000 000',
    email: 'hola@elfogatero.uy',
    address: 'Pasaje Yuyos 2173, Cordón, Montevideo',
    instagramHandle: '@elfogatero.demouy',
    instagramUrl: 'https://instagram.com/elfogatero.demouy',
    hours: 'Mar a dom: almuerzo 12:00\u201315:00 \u00b7 cena 19:30\u201323:30 \u00b7 lun cerrado',
    currency: 'UYU'
  },

  /* API multi-tenant (anotada, NO consumida — demo 100% local). */
  api: {
    enabled: false,
    apiBase: 'https://cuadra-api-t7rg.onrender.com/api/demoresto',
    requestTimeoutMs: 8000
  },

  whatsapp: {
    base: 'https://wa.me/59899000000',
    message: 'Hola El Fogatero, quiero hacer una consulta.'
  },

  mapsUrl: 'https://maps.google.com/?q=Pasaje+Yuyos+2173+Cordon+Montevideo',

  /* ------------------------------------------------------------------
   * Modo demo local: reservas simuladas persistidas en localStorage.
   * El PIN demo habilita el panel admin offline (auto-login).
   * ------------------------------------------------------------------ */
  demo: {
    enabled: true,
    pin: '0000',
    storageKey: 'fogatero_demo_reservas',
    sessionKey: 'fogatero_admin_token'
  },

  /* ------------------------------------------------------------------
   * Franjas de reserva. capacity = personas por franja (1 sala).
   * ------------------------------------------------------------------ */
  slots: {
    almuerzo: {
      label: 'Almuerzo',
      start: '12:00',
      end: '15:00',
      times: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'],
      capacity: 40
    },
    cena: {
      label: 'Cena',
      start: '19:30',
      end: '23:30',
      times: ['19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'],
      capacity: 40
    }
  },

  booking: {
    minGuests: 1,
    maxGuests: 8,
    maxDaysAhead: 60
  },

  /* ------------------------------------------------------------------
   * Carta ficticia: 4 categorías x 5 platos = 20 platos.
   * Precios UYU 2026 realistas en bandas del PRD.
   * Al menos 1 agotado por categoría.
   * ------------------------------------------------------------------ */
  DEMO_MENU: [
    // ===================== Entradas (300–500) =====================
    {
      id: 'provoleta-fogatero',
      name: 'Provoleta El Fogatero',
      category: 'Entradas',
      desc: 'Provoleta ahumada al momento con orégano, ajo y salsa criolla de la casa.',
      price: 420,
      stock: 'disponible'
    },
    {
      id: 'mollejas-brasa',
      name: 'Mollejas a la brasa',
      category: 'Entradas',
      desc: 'Mollejas tiernas a la parrilla, con limón y perejil.',
      price: 460,
      stock: 'disponible'
    },
    {
      id: 'rabas-limon',
      name: 'Rabas con limón y aioli',
      category: 'Entradas',
      desc: 'Anillos de calamar crocantes con aioli de ajo asado.',
      price: 480,
      stock: 'agotado'
    },
    {
      id: 'ensalada-rusa-casa',
      name: 'Ensalada rusa de la casa',
      category: 'Entradas',
      desc: 'Papas, zanahoria y arvejas con mayonesa casera, bien de boliche.',
      price: 320,
      stock: 'disponible'
    },
    {
      id: 'bastones-boniato',
      name: 'Bastones de boniato',
      category: 'Entradas',
      desc: 'Bastones crocantes con provenzal y limón.',
      price: 350,
      stock: 'disponible'
    },

    // ===================== Principales (600–950) =====================
    {
      id: 'entrana-fogatero',
      name: 'Entraña El Fogatero (300 g)',
      category: 'Principales',
      desc: 'Entraña jugosa a la parrilla con papas a la crema.',
      price: 890,
      stock: 'disponible'
    },
    {
      id: 'tira-asado',
      name: 'Tira de asado (400 g)',
      category: 'Principales',
      desc: 'Tira de asado de novillo, cocción lenta sobre brasas de quebracho.',
      price: 820,
      stock: 'disponible'
    },
    {
      id: 'bife-chorizo',
      name: 'Bife de chorizo (400 g)',
      category: 'Principales',
      desc: 'El corte clásico, punto a elección, con guarnición de ensalada o papas.',
      price: 950,
      stock: 'disponible'
    },
    {
      id: 'matambre-pizza',
      name: 'Matambre a la pizza',
      category: 'Principales',
      desc: 'Matambre a la parrilla con tomate, mozzarella y orégano.',
      price: 680,
      stock: 'agotado'
    },
    {
      id: 'pollo-brasa-hierbas',
      name: 'Pollo a la brasa con hierbas',
      category: 'Principales',
      desc: 'Pollo entero a la brasa con romero, limón y provenzal.',
      price: 640,
      stock: 'disponible'
    },

    // ===================== Postres (250–400) =====================
    {
      id: 'chaja-dulce-leche',
      name: 'Chajá con dulce de leche',
      category: 'Postres',
      desc: 'El clásico uruguayo: merengue, crema y bizcochuelo con dulce de leche.',
      price: 330,
      stock: 'disponible'
    },
    {
      id: 'flan-casero',
      name: 'Flan casero',
      category: 'Postres',
      desc: 'Flan de huevo con crema batida y dulce de leche.',
      price: 300,
      stock: 'disponible'
    },
    {
      id: 'vigilante-queso-dulce',
      name: 'Queso y dulce (vigilante)',
      category: 'Postres',
      desc: 'Porción de queso con membrillo o batata.',
      price: 340,
      stock: 'disponible'
    },
    {
      id: 'budin-pan-oporto',
      name: 'Budín de pan con salsa de oporto',
      category: 'Postres',
      desc: 'Budín de pan casero con salsa tibia de oporto.',
      price: 350,
      stock: 'agotado'
    },
    {
      id: 'helado-mascarpone',
      name: 'Helado de mascarpone y nuez',
      category: 'Postres',
      desc: 'Dos bochas de helado artesanal con praliné de nuez.',
      price: 280,
      stock: 'disponible'
    },

    // ===================== Bebidas (150–400) =====================
    {
      id: 'agua-500',
      name: 'Agua mineral (500 ml)',
      category: 'Bebidas',
      desc: 'Agua mineral con o sin gas.',
      price: 150,
      stock: 'disponible'
    },
    {
      id: 'gaseosa-600',
      name: 'Gaseosa (600 ml)',
      category: 'Bebidas',
      desc: 'Cola, lima-limón o naranja, bien fría.',
      price: 190,
      stock: 'disponible'
    },
    {
      id: 'cerveza-tirada',
      name: 'Cerveza tirada (pinta)',
      category: 'Bebidas',
      desc: 'Pinta de cerveza tirada, bien fría.',
      price: 290,
      stock: 'disponible'
    },
    {
      id: 'clericot-jarra',
      name: 'Clericot por jarra',
      category: 'Bebidas',
      desc: 'Vino blanco con frutas de estación.',
      price: 390,
      stock: 'disponible'
    },
    {
      id: 'vino-copa-casa',
      name: 'Vino de la casa (copa)',
      category: 'Bebidas',
      desc: 'Copa de vino tinto o blanco de la casa.',
      price: 290,
      stock: 'agotado'
    }
  ]
};
