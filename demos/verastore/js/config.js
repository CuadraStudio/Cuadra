/* Config del tenant — generado. Editar el JSON de origen, no este archivo. */
window.SITE_CONFIG = {
  "tenant": {
    "slug": "verastore",
    "name": "Vera Store",
    "vertical": "tienda",
    "plan": "premium",
    "currency": "UYU"
  },
  "api": {
    "enabled": true,
    "base": "https://cuadra-api-t7rg.onrender.com/api/verastore",
    "timeoutMs": 8000
  },
  "whatsapp": {
    "number": "59899000000",
    "message": "Hola Vera Store, quiero hacer una consulta."
  },
  "booking": {
    "slotStepMin": 30,
    "minAdvanceMin": 60,
    "maxGuests": 8,
    "hours": [
      {
        "days": "Lunes a viernes",
        "open": "10:00",
        "close": "19:00",
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
        "open": "10:00",
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
  "catalog": [
    {
      "slug": "aros-sol",
      "name": "Aros Sol",
      "price": 690
    },
    {
      "slug": "collar-luna",
      "name": "Collar Luna",
      "price": 890
    },
    {
      "slug": "gorra-lino",
      "name": "Gorra de Lino",
      "price": 1190
    },
    {
      "slug": "bufanda-ambar",
      "name": "Bufanda Ámbar",
      "price": 990
    },
    {
      "slug": "camisola-nube",
      "name": "Camisola Nube",
      "price": 1900
    },
    {
      "slug": "remera-basica",
      "name": "Remera Básica",
      "price": 1290
    },
    {
      "slug": "camisa-lino",
      "name": "Camisa de Lino",
      "price": 2400
    },
    {
      "slug": "sweater-crudo",
      "name": "Sweater Crudo",
      "price": 2700
    },
    {
      "slug": "bolso-tote-roma",
      "name": "Bolso Tote Roma",
      "price": 2900
    },
    {
      "slug": "mochila-lona",
      "name": "Mochila de Lona",
      "price": 2350
    },
    {
      "slug": "rinonera-siena",
      "name": "Riñonera Siena",
      "price": 1490
    },
    {
      "slug": "vela-ambar",
      "name": "Vela Ámbar",
      "price": 850
    },
    {
      "slug": "jabon-avena",
      "name": "Jabón de Avena",
      "price": 350
    },
    {
      "slug": "difusor-savia",
      "name": "Difusor Savia",
      "price": 1190
    }
  ],
  "menuItems": [],
  "base": "/demos/verastore",
  "demo": {
    "enabled": true
  },
  "admin": {
    "pin": "0000",
    "products": [
      {
        "slug": "aros-sol",
        "name": "Aros Sol",
        "category": "Accesorios",
        "price": 690,
        "featured": true,
        "sku": "VS-AC-001",
        "short": "Aros bañados en oro, livianos, con textura mate.",
        "long": [
          "El detalle dorado que levanta cualquier look. Livianos de verdad: se pueden usar todo el día sin que molesten.",
          "Bañados en oro de 18k sobre base de acero quirúrgico. No se ponen verdes ni irritan."
        ],
        "specs": {
          "Material": "Acero quirúrgico con baño de oro 18k",
          "Medida": "2,2 cm de diámetro",
          "Peso": "3 g por unidad"
        },
        "care": [
          "Guardalos secos, lejos del perfume. Si se opacan, pasales un paño suave."
        ],
        "images": [
          {
            "src": "/img/accesorios-aros.jpg",
            "alt": "Aros Sol dorados"
          }
        ],
        "variants": [
          {
            "color": "Dorado",
            "stock": "disponible"
          },
          {
            "color": "Plateado",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "collar-luna",
        "name": "Collar Luna",
        "category": "Accesorios",
        "price": 890,
        "sku": "VS-AC-002",
        "short": "Cadena fina con dije de luna, largo regulable.",
        "long": [
          "Cadena de 45 cm con extensión de 5, para que puedas usarlo corto o sobre una camisa."
        ],
        "specs": {
          "Material": "Acero quirúrgico",
          "Largo": "45–50 cm regulable"
        },
        "images": [
          {
            "src": "/img/accesorios-collar.jpg",
            "alt": "Collar Luna con dije"
          }
        ],
        "variants": [
          {
            "color": "Dorado",
            "stock": "disponible"
          },
          {
            "color": "Plateado",
            "stock": "agotado"
          }
        ]
      },
      {
        "slug": "gorra-lino",
        "name": "Gorra de Lino",
        "category": "Accesorios",
        "price": 1190,
        "short": "Lino liviano, visera blanda, calce regulable.",
        "long": [
          "Para el sol de verdad: el lino transpira y no te deja la cabeza mojada. Visera blanda, se puede doblar en el bolso."
        ],
        "images": [
          {
            "src": "/img/accesorios-gorra.jpg",
            "alt": "Gorra de lino"
          }
        ],
        "variants": [
          {
            "talle": "Único",
            "color": "Crudo",
            "stock": "disponible"
          },
          {
            "talle": "Único",
            "color": "Negro",
            "stock": "disponible"
          },
          {
            "talle": "Único",
            "color": "Verde",
            "stock": "agotado"
          }
        ]
      },
      {
        "slug": "bufanda-ambar",
        "name": "Bufanda Ámbar",
        "category": "Accesorios",
        "price": 990,
        "short": "Tejido suave en tono ámbar, 180 cm de largo.",
        "long": [
          "Tejida en telar por un taller de Canelones. Abriga sin pesar."
        ],
        "images": [
          {
            "src": "/img/accesorios-bufanda.jpg",
            "alt": "Bufanda color ámbar"
          }
        ],
        "stock": "disponible"
      },
      {
        "slug": "camisola-nube",
        "name": "Camisola Nube",
        "category": "Indumentaria",
        "price": 1900,
        "featured": true,
        "sku": "VS-IN-001",
        "short": "Camisola amplia de algodón, con caída suave.",
        "long": [
          "Corte amplio, cae sin marcar. Va con todo y aguanta lavados sin deformarse.",
          "Las medidas de cada talle están en la guía de talles."
        ],
        "specs": {
          "Composición": "100% algodón",
          "Calce": "Amplio",
          "Origen": "Confección nacional"
        },
        "images": [
          {
            "src": "/img/indumentaria-camisola.jpg",
            "alt": "Camisola Nube blanca"
          }
        ],
        "variants": [
          {
            "talle": "S",
            "color": "Crudo",
            "stock": "disponible"
          },
          {
            "talle": "M",
            "color": "Crudo",
            "stock": "disponible"
          },
          {
            "talle": "L",
            "color": "Crudo",
            "stock": "agotado"
          },
          {
            "talle": "M",
            "color": "Negro",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "remera-basica",
        "name": "Remera Básica",
        "category": "Indumentaria",
        "price": 1290,
        "featured": true,
        "short": "Algodón peinado, cuello reforzado, calce recto.",
        "long": [
          "La remera que se usa hasta que se rompe. Algodón peinado 24/1, cuello con refuerzo para que no se estire."
        ],
        "specs": {
          "Composición": "100% algodón peinado",
          "Calce": "Recto"
        },
        "images": [
          {
            "src": "/img/indumentaria-remera.jpg",
            "alt": "Remera básica"
          }
        ],
        "variants": [
          {
            "talle": "S",
            "color": "Blanco",
            "stock": "disponible"
          },
          {
            "talle": "M",
            "color": "Blanco",
            "stock": "disponible"
          },
          {
            "talle": "L",
            "color": "Negro",
            "stock": "disponible"
          },
          {
            "talle": "XL",
            "color": "Negro",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "camisa-lino",
        "name": "Camisa de Lino",
        "category": "Indumentaria",
        "price": 2400,
        "short": "Lino puro, botones de coco, calce holgado.",
        "long": [
          "Lino que se arruga: es parte del material y del look. Para verano no hay nada mejor."
        ],
        "specs": {
          "Composición": "100% lino",
          "Botones": "Coco natural"
        },
        "images": [
          {
            "src": "/img/indumentaria-camisa.jpg",
            "alt": "Camisa de lino"
          }
        ],
        "variants": [
          {
            "talle": "M",
            "color": "Crudo",
            "stock": "disponible"
          },
          {
            "talle": "L",
            "color": "Crudo",
            "stock": "disponible"
          },
          {
            "talle": "XL",
            "color": "Arena",
            "stock": "agotado"
          }
        ]
      },
      {
        "slug": "sweater-crudo",
        "name": "Sweater Crudo",
        "category": "Indumentaria",
        "price": 2700,
        "short": "Punto grueso, cuello redondo, tejido nacional.",
        "long": [
          "Punto grueso de lana con algodón: abriga sin picar. Tejido en Montevideo."
        ],
        "images": [
          {
            "src": "/img/indumentaria-sweater.jpg",
            "alt": "Sweater crudo de punto grueso"
          }
        ],
        "variants": [
          {
            "talle": "M",
            "stock": "disponible"
          },
          {
            "talle": "L",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "bolso-tote-roma",
        "name": "Bolso Tote Roma",
        "category": "Bolsos y mochilas",
        "price": 2900,
        "featured": true,
        "short": "Lona encerada con base de cuero. Entra una notebook de 15\".",
        "long": [
          "El bolso de todos los días: entra notebook, cuaderno y botella sin deformarse. Base de cuero para que apoye parado."
        ],
        "specs": {
          "Material": "Lona encerada y cuero vacuno",
          "Medidas": "38 × 34 × 12 cm",
          "Bolsillos": "Uno interno con cierre"
        },
        "images": [
          {
            "src": "/img/bolsos-tote.jpg",
            "alt": "Bolso tote de lona"
          }
        ],
        "variants": [
          {
            "color": "Natural",
            "stock": "disponible"
          },
          {
            "color": "Negro",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "mochila-lona",
        "name": "Mochila de Lona",
        "category": "Bolsos y mochilas",
        "price": 2350,
        "short": "Cierre principal, bolsillo acolchado, tiras regulables.",
        "long": [
          "Bolsillo interno acolchado para notebook de hasta 14\". Tiras anchas y regulables."
        ],
        "images": [
          {
            "src": "/img/bolsos-mochila.jpg",
            "alt": "Mochila de lona"
          }
        ],
        "variants": [
          {
            "color": "Verde",
            "stock": "disponible"
          },
          {
            "color": "Negro",
            "stock": "agotado"
          }
        ]
      },
      {
        "slug": "rinonera-siena",
        "name": "Riñonera Siena",
        "category": "Bolsos y mochilas",
        "price": 1490,
        "short": "Compacta, con dos compartimentos y correa ancha.",
        "long": [
          "Para salir liviano: entra celular, billetera y llaves. Correa ancha regulable, se puede usar cruzada."
        ],
        "images": [
          {
            "src": "/img/bolsos-rinonera.jpg",
            "alt": "Riñonera Siena"
          }
        ],
        "stock": "disponible"
      },
      {
        "slug": "vela-ambar",
        "name": "Vela Ámbar",
        "category": "Cuidado y hogar",
        "price": 850,
        "short": "Cera de soja con aroma a ámbar y vainilla. 40 horas.",
        "long": [
          "Cera de soja, mecha de algodón, sin parafina. Dura unas 40 horas de encendido."
        ],
        "images": [
          {
            "src": "/img/hogar-vela.jpg",
            "alt": "Vela de cera de soja"
          }
        ],
        "stock": "disponible"
      },
      {
        "slug": "jabon-avena",
        "name": "Jabón de Avena",
        "category": "Cuidado y hogar",
        "price": 350,
        "short": "Glicerina vegetal con avena molida. Apto piel sensible.",
        "long": [
          "Hecho en tandas chicas con glicerina vegetal y avena molida. Sin fragancia sintética."
        ],
        "images": [
          {
            "src": "/img/hogar-jabon.jpg",
            "alt": "Jabón artesanal de avena"
          }
        ],
        "stock": "disponible"
      },
      {
        "slug": "difusor-savia",
        "name": "Difusor Savia",
        "category": "Cuidado y hogar",
        "price": 1190,
        "short": "Difusor de varillas, aroma amaderado. Dura 3 meses.",
        "long": [
          "Ocho varillas de rattan y 150 ml de esencia amaderada. Rinde unos tres meses en un ambiente chico."
        ],
        "images": [
          {
            "src": "/img/hogar-difusor.jpg",
            "alt": "Difusor de varillas"
          }
        ],
        "stock": "agotado"
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
        "end_time": "19:00"
      },
      {
        "dow": 2,
        "active": true,
        "start_time": "10:00",
        "end_time": "19:00"
      },
      {
        "dow": 3,
        "active": true,
        "start_time": "10:00",
        "end_time": "19:00"
      },
      {
        "dow": 4,
        "active": true,
        "start_time": "10:00",
        "end_time": "19:00"
      },
      {
        "dow": 5,
        "active": true,
        "start_time": "10:00",
        "end_time": "19:00"
      },
      {
        "dow": 6,
        "active": true,
        "start_time": "10:00",
        "end_time": "14:00"
      }
    ]
  }
};
