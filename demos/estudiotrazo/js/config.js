/* Config del tenant — generado. Editar el JSON de origen, no este archivo. */
window.SITE_CONFIG = {
  "tenant": {
    "slug": "estudiotrazo",
    "name": "Estudio Trazo",
    "vertical": "agenda",
    "plan": "premium",
    "currency": "UYU"
  },
  "api": {
    "enabled": true,
    "base": "https://cuadra-api-t7rg.onrender.com/api/estudiotrazo",
    "timeoutMs": 8000
  },
  "whatsapp": {
    "number": "59899000000",
    "message": "Hola Estudio Trazo, quiero reservar un turno."
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
        "close": "18:00",
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
  "base": "/demos/estudiotrazo",
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
        "short": "Corte a tijera y máquina, lavado y peinado. El trabajo completo, sin apuro.",
        "long": [
          "Empezamos conversando qué querés y qué mantiene bien tu pelo entre corte y corte. Sobre eso definimos largo, textura y contorno.",
          "Trabajamos a tijera y máquina según el tipo de pelo, con lavado previo y peinado final. Si venís con el pelo muy crecido, contá diez minutos extra."
        ],
        "includes": [
          "Lavado con masaje",
          "Corte a tijera y máquina",
          "Perfilado de contornos",
          "Peinado y producto"
        ],
        "images": [
          {
            "src": "/img/servicios/corte-clasico.jpg",
            "alt": "Corte clásico en Estudio Trazo"
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
        "name": "Corte y barba",
        "category": "Corte",
        "price": 900,
        "duration": 60,
        "featured": true,
        "short": "El combo completo: corte, perfilado de barba con navaja y toalla caliente.",
        "long": [
          "Corte completo más trabajo de barba: perfilado con navaja, toalla caliente y aceite. Es el servicio que más se pide los viernes y sábados.",
          "Si venís a un evento, reservá con un par de días de anticipación: los horarios de la tarde se llenan primero."
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
            "alt": "Corte y barba con navaja"
          }
        ]
      },
      {
        "slug": "perfilado-de-barba",
        "name": "Perfilado de barba",
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
        "slug": "color-y-cobertura",
        "name": "Color y cobertura de canas",
        "category": "Color",
        "price": 1400,
        "duration": 75,
        "short": "Coloración natural con producto sin amoníaco. Incluye diagnóstico previo.",
        "long": [
          "Elegimos el tono junto a vos y aplicamos producto sin amoníaco, pensado para que la salida sea gradual y no se note el crecimiento.",
          "Incluye lavado, tratamiento post color y peinado."
        ],
        "includes": [
          "Diagnóstico de color",
          "Aplicación",
          "Tratamiento post color",
          "Peinado"
        ]
      },
      {
        "slug": "corte-infantil",
        "name": "Corte infantil",
        "category": "Corte",
        "price": 450,
        "duration": 30,
        "short": "Hasta 12 años, con paciencia y sin apuro. Primera vez con certificado.",
        "long": [
          "Trabajamos tranquilos, al ritmo del nene o la nena. Si es el primer corte, se lleva un mechón y un certificado."
        ]
      },
      {
        "slug": "ritual-completo",
        "name": "Ritual completo",
        "category": "Combos",
        "price": 1600,
        "duration": 90,
        "short": "Corte, barba, tratamiento capilar y masaje. Noventa minutos para vos.",
        "long": [
          "El servicio más completo del estudio: corte, barba con navaja, tratamiento capilar según tu tipo de pelo y masaje de cuero cabelludo."
        ],
        "includes": [
          "Corte completo",
          "Barba con navaja",
          "Tratamiento capilar",
          "Masaje de cuero cabelludo",
          "Café o cerveza"
        ]
      }
    ],
    "team": [
      {
        "slug": "martina-vera",
        "name": "Martina Vera",
        "role": "Dueña y barbera",
        "experience": "12 años de oficio",
        "location": "parque-rodo",
        "image": "/img/equipo/martina.jpg",
        "short": "Fundó el estudio en 2019. Trabaja fuerte el corte a tijera y el color natural.",
        "bio": [
          "Martina se formó en Montevideo y trabajó seis años en salones del Centro antes de abrir Estudio Trazo en 2019.",
          "Le interesa el corte que se sostiene solo: que a las tres semanas siga estando bien, sin que tengas que pelearlo cada mañana."
        ],
        "services": [
          "corte-clasico",
          "color-y-cobertura",
          "ritual-completo",
          "corte-infantil"
        ]
      },
      {
        "slug": "joaquin-pereira",
        "name": "Joaquín Pereira",
        "role": "Barbero",
        "experience": "7 años de oficio",
        "location": "parque-rodo",
        "image": "/img/equipo/joaquin.jpg",
        "short": "Especialista en barba y navaja. Los viernes su agenda vuela.",
        "bio": [
          "Joaquín trabaja barba desde que empezó. Perfilado clásico, navaja y toalla caliente: lo que más le sale y lo que más le piden."
        ],
        "services": [
          "corte-clasico",
          "corte-y-barba",
          "perfilado-de-barba"
        ]
      },
      {
        "slug": "sofia-nunez",
        "name": "Sofía Núñez",
        "role": "Barbera y colorista",
        "experience": "5 años de oficio",
        "location": "cordon",
        "image": "/img/equipo/sofia.jpg",
        "short": "Color, cobertura de canas y cortes con textura.",
        "bio": [
          "Sofía se formó en colorimetría y lleva la parte de color del estudio. Trabaja en la sucursal de Cordón."
        ],
        "services": [
          "corte-clasico",
          "color-y-cobertura",
          "corte-infantil"
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
        "end_time": "18:00"
      }
    ]
  }
};
