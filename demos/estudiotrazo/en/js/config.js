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
    "message": "Hi Estudio Trazo, I'd like to book a slot."
  },
  "booking": {
    "slotStepMin": 15,
    "minAdvanceMin": 60,
    "maxGuests": 8,
    "hours": [
      {
        "days": "Monday to Friday",
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
        "days": "Saturdays",
        "open": "09:00",
        "close": "18:00",
        "dayIndexes": [
          6
        ]
      },
      {
        "days": "Sundays",
        "dayIndexes": [
          0
        ]
      }
    ]
  },
  "catalog": [],
  "menuItems": [],
  "base": "/demos/estudiotrazo/en",
  "lang": "en",
  "demo": {
    "enabled": true
  },
  "admin": {
    "pin": "0000",
    "services": [
      {
        "slug": "corte-clasico",
        "name": "Classic haircut",
        "category": "Corte",
        "price": 650,
        "duration": 40,
        "featured": true,
        "short": "Scissor and clipper cut, wash and style. The full job, no rush.",
        "long": [
          "We start by talking about what you want and what keeps your hair looking good between cuts. From there we set the length, texture and outline.",
          "We work with scissors and clippers depending on your hair type, with a wash beforehand and a style to finish. If your hair has grown out a lot, budget ten extra minutes."
        ],
        "includes": [
          "Wash with massage",
          "Scissor and clipper cut",
          "Outline shaping",
          "Style and product"
        ],
        "images": [
          {
            "src": "/img/servicios/corte-clasico.jpg",
            "alt": "Corte clásico en Estudio Trazo"
          }
        ],
        "faq": [
          {
            "q": "How long does it take?",
            "a": "Forty minutes. If it's your first time, we book ten more to talk through the cut."
          },
          {
            "q": "Can I walk in without booking?",
            "a": "You can, but we'll fit you in based on availability. With a booking you skip the wait."
          }
        ]
      },
      {
        "slug": "corte-y-barba",
        "name": "Haircut & beard",
        "category": "Corte",
        "price": 900,
        "duration": 60,
        "featured": true,
        "short": "The full combo: haircut, straight-razor beard shaping and hot towel.",
        "long": [
          "A complete haircut plus beard work: razor shaping, hot towel and oil. It's the most requested service on Fridays and Saturdays.",
          "If you're heading to an event, book a couple of days ahead: afternoon slots fill up first."
        ],
        "includes": [
          "Everything in the classic haircut",
          "Razor shaping",
          "Hot towel",
          "Oil and balm"
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
        "name": "Beard shaping",
        "category": "Barba",
        "price": 450,
        "duration": 25,
        "short": "Outline definition, scissor trim and razor finish.",
        "long": [
          "We tidy up the outline, even out the length and finish with a razor and hot towel. Ideal between haircuts."
        ],
        "includes": [
          "Scissor trim",
          "Razor on the outline",
          "Hot towel"
        ]
      },
      {
        "slug": "color-y-cobertura",
        "name": "Color & gray coverage",
        "category": "Color",
        "price": 1400,
        "duration": 75,
        "short": "Natural coloring with ammonia-free product. Includes a prior diagnosis.",
        "long": [
          "We pick the tone together with you and apply an ammonia-free product, designed to grow out gradually so regrowth doesn't show.",
          "Includes a wash, post-color treatment and style."
        ],
        "includes": [
          "Color diagnosis",
          "Application",
          "Post-color treatment",
          "Style"
        ]
      },
      {
        "slug": "corte-infantil",
        "name": "Kids' haircut",
        "category": "Corte",
        "price": 450,
        "duration": 30,
        "short": "Up to age 12, patient and unhurried. First cut comes with a certificate.",
        "long": [
          "We work calmly, at the kid's own pace. If it's their first haircut, they take home a lock of hair and a certificate."
        ]
      },
      {
        "slug": "ritual-completo",
        "name": "Full ritual",
        "category": "Combos",
        "price": 1600,
        "duration": 90,
        "short": "Haircut, beard, hair treatment and massage. Ninety minutes just for you.",
        "long": [
          "The studio's most complete service: haircut, razor beard work, a hair treatment suited to your hair type, and a scalp massage."
        ],
        "includes": [
          "Full haircut",
          "Razor beard work",
          "Hair treatment",
          "Scalp massage",
          "Coffee or beer"
        ]
      }
    ],
    "team": [
      {
        "slug": "martina-vera",
        "name": "Martina Vera",
        "role": "Owner & barber",
        "experience": "12 years in the trade",
        "location": "parque-rodo",
        "image": "/img/equipo/martina.jpg",
        "short": "Founded the studio in 2019. Focuses on scissor cuts and natural color.",
        "bio": [
          "Martina trained in Montevideo and spent six years working in salons downtown before opening Estudio Trazo in 2019.",
          "She cares about a cut that holds up on its own: still looking good three weeks in, without you having to fight it every morning."
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
        "role": "Barber",
        "experience": "7 years in the trade",
        "location": "parque-rodo",
        "image": "/img/equipo/joaquin.jpg",
        "short": "Beard and razor specialist. His calendar fills up fast on Fridays.",
        "bio": [
          "Joaquín has worked on beards since he started. Classic shaping, razor and hot towel: what he's best at, and what people ask for most."
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
        "role": "Barber & colorist",
        "experience": "5 years in the trade",
        "location": "cordon",
        "image": "/img/equipo/sofia.jpg",
        "short": "Color, gray coverage and textured cuts.",
        "bio": [
          "Sofía trained in colorimetry and runs the color side of the studio. She works out of the Cordón location."
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
