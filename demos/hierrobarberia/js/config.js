/* Config del tenant — generado. Editar el JSON de origen, no este archivo. */
window.SITE_CONFIG = {
  "tenant": {
    "slug": "hierrobarberia",
    "name": "Hierro Barbería",
    "vertical": "agenda",
    "plan": "profesional",
    "currency": "UYU"
  },
  "api": {
    "enabled": false,
    "base": "https://cuadra-api-t7rg.onrender.com/api/hierrobarberia",
    "timeoutMs": 8000
  },
  "whatsapp": {
    "number": "59899000005",
    "message": "Hola Hierro Barbería, quiero reservar un turno."
  },
  "booking": {
    "slotStepMin": 15,
    "minAdvanceMin": 60,
    "maxGuests": 8,
    "hours": [
      {
        "days": "Lunes a viernes",
        "open": "10:00",
        "close": "20:00",
        "dayIndexes": [
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        "days": "Sábados",
        "open": "09:00",
        "close": "14:00",
        "dayIndexes": [
          6
        ]
      },
      {
        "days": "Domingos",
        "dayIndexes": [
          0
        ]
      }
    ]
  },
  "catalog": [],
  "menuItems": [],
  "base": "/demos/hierrobarberia",
  "demo": {
    "enabled": true
  },
  "admin": {
    "pin": "0000",
    "services": [
      {
        "slug": "corte-clasico",
        "name": "Corte clásico",
        "category": "Corte",
        "price": 650,
        "duration": 40,
        "featured": true,
        "short": "Técnica, forma y equilibrio. El corte que nunca falla, sin apuro.",
        "long": [
          "Empezamos conversando qué querés mantener entre corte y corte. Sobre eso definimos largo, textura y contorno.",
          "Trabajamos a tijera y máquina según el tipo de pelo, con lavado previo y toalla caliente al cierre."
        ],
        "includes": [
          "Lavado con masaje",
          "Corte a tijera y máquina",
          "Perfilado de contornos",
          "Toalla caliente"
        ],
        "images": [
          {
            "src": "/img/servicios/corte-clasico.jpg",
            "alt": "Corte clásico a máquina en Hierro Barbería"
          }
        ],
        "faq": [
          {
            "q": "¿Cuánto dura?",
            "a": "Cuarenta minutos. Si es tu primera vez, reservamos diez más para conversar el corte."
          },
          {
            "q": "¿Puedo venir sin turno?",
            "a": "Podés, pero te atendemos según disponibilidad. Con turno no esperás."
          }
        ]
      },
      {
        "slug": "corte-y-barba",
        "name": "Corte + barba",
        "category": "Corte",
        "price": 950,
        "duration": 60,
        "featured": true,
        "short": "El combo completo: corte, perfilado de barba con navaja y toalla caliente.",
        "long": [
          "Corte completo más trabajo de barba: perfilado con navaja, toalla caliente y aceite. El servicio más pedido los viernes y sábados.",
          "Si vas a un evento, reservá con un par de días de anticipación: los horarios de la tarde se llenan primero."
        ],
        "includes": [
          "Todo lo del corte clásico",
          "Perfilado con navaja",
          "Toalla caliente",
          "Aceite y bálsamo"
        ],
        "images": [
          {
            "src": "/img/servicios/corte-y-barba.jpg",
            "alt": "Perfilado de barba con navaja en Hierro Barbería"
          }
        ]
      },
      {
        "slug": "barba",
        "name": "Barba",
        "category": "Barba",
        "price": 450,
        "duration": 25,
        "short": "Definición de contornos, recorte a tijera y terminación con navaja.",
        "long": [
          "Ordenamos el contorno, emparejamos el largo y terminamos con navaja y toalla caliente. Ideal entre corte y corte."
        ],
        "includes": [
          "Recorte a tijera",
          "Navaja en contornos",
          "Toalla caliente"
        ]
      },
      {
        "slug": "ritual-completo",
        "name": "Ritual completo",
        "category": "Combos",
        "price": 1200,
        "duration": 90,
        "short": "Corte, barba y toalla caliente. A fuego lento, sin apuro.",
        "long": [
          "El servicio más completo del salón: corte, barba con navaja y una toalla caliente extendida. Noventa minutos pensados para vos, no para la agenda."
        ],
        "includes": [
          "Corte completo",
          "Barba con navaja",
          "Toalla caliente extendida",
          "Aceite y bálsamo"
        ]
      }
    ],
    "team": [
      {
        "slug": "bruno-ferreira",
        "name": "Bruno Ferreira",
        "role": "Dueño y barbero",
        "experience": "11 años de oficio",
        "image": "/img/equipo/bruno.jpg",
        "short": "Fundó Hierro en 2021. Trabaja fuerte el corte clásico y el ritual completo.",
        "bio": [
          "Bruno se formó en Montevideo y trabajó ocho años en barberías del Centro antes de abrir Hierro en 2021.",
          "Le interesa el corte que se sostiene solo: que a las tres semanas siga estando bien, sin que lo tengas que pelear cada mañana."
        ],
        "services": [
          "corte-clasico",
          "corte-y-barba",
          "ritual-completo"
        ]
      },
      {
        "slug": "nahuel-rocha",
        "name": "Nahuel Rocha",
        "role": "Barbero",
        "experience": "9 años de oficio",
        "image": "/img/equipo/nahuel.jpg",
        "short": "Especialista en barba y navaja. Los viernes su agenda vuela.",
        "bio": [
          "Nahuel trabaja barba desde que empezó. Perfilado clásico, navaja y toalla caliente: lo que más le sale y lo que más le piden."
        ],
        "services": [
          "corte-clasico",
          "barba",
          "ritual-completo"
        ]
      }
    ],
    "hoursPlan": [
      {
        "dow": 0,
        "active": false,
        "start_time": "09:00",
        "end_time": "19:00"
      },
      {
        "dow": 1,
        "active": true,
        "start_time": "10:00",
        "end_time": "20:00"
      },
      {
        "dow": 2,
        "active": true,
        "start_time": "10:00",
        "end_time": "20:00"
      },
      {
        "dow": 3,
        "active": true,
        "start_time": "10:00",
        "end_time": "20:00"
      },
      {
        "dow": 4,
        "active": true,
        "start_time": "10:00",
        "end_time": "20:00"
      },
      {
        "dow": 5,
        "active": true,
        "start_time": "10:00",
        "end_time": "20:00"
      },
      {
        "dow": 6,
        "active": true,
        "start_time": "09:00",
        "end_time": "14:00"
      }
    ]
  }
};
