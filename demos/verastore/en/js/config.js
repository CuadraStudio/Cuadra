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
    "enabled": false,
    "base": "https://cuadra-api-t7rg.onrender.com/api/verastore",
    "timeoutMs": 8000
  },
  "whatsapp": {
    "number": "59899000000",
    "message": "Hi Vera Store, I'd like to make an inquiry."
  },
  "booking": {
    "slotStepMin": 30,
    "minAdvanceMin": 60,
    "maxGuests": 8,
    "hours": [
      {
        "days": "Monday to Friday",
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
        "days": "Saturdays",
        "open": "10:00",
        "close": "14:00",
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
  "catalog": [
    {
      "slug": "aros-sol",
      "name": "Sun Earrings",
      "price": 690
    },
    {
      "slug": "collar-luna",
      "name": "Moon Necklace",
      "price": 890
    },
    {
      "slug": "gorra-lino",
      "name": "Linen Cap",
      "price": 1190
    },
    {
      "slug": "bufanda-ambar",
      "name": "Amber Scarf",
      "price": 990
    },
    {
      "slug": "camisola-nube",
      "name": "Cloud Tunic",
      "price": 1900
    },
    {
      "slug": "remera-basica",
      "name": "Basic Tee",
      "price": 1290
    },
    {
      "slug": "camisa-lino",
      "name": "Linen Shirt",
      "price": 2400
    },
    {
      "slug": "sweater-crudo",
      "name": "Off-white Sweater",
      "price": 2700
    },
    {
      "slug": "bolso-tote-roma",
      "name": "Roma Tote Bag",
      "price": 2900
    },
    {
      "slug": "mochila-lona",
      "name": "Canvas Backpack",
      "price": 2350
    },
    {
      "slug": "rinonera-siena",
      "name": "Siena Belt Bag",
      "price": 1490
    },
    {
      "slug": "vela-ambar",
      "name": "Amber Candle",
      "price": 850
    },
    {
      "slug": "jabon-avena",
      "name": "Oatmeal Soap",
      "price": 350
    },
    {
      "slug": "difusor-savia",
      "name": "Savia Reed Diffuser",
      "price": 1190
    }
  ],
  "menuItems": [],
  "base": "/demos/verastore/en",
  "lang": "en",
  "demo": {
    "enabled": true
  },
  "admin": {
    "pin": "0000",
    "products": [
      {
        "slug": "aros-sol",
        "name": "Sun Earrings",
        "category": "Accesorios",
        "price": 690,
        "featured": true,
        "sku": "VS-AC-001",
        "short": "Gold-plated earrings, lightweight, with a matte texture.",
        "long": [
          "The gold detail that elevates any look. Genuinely lightweight: you can wear them all day without noticing.",
          "18k gold-plated over a surgical steel base. Won't turn green or irritate skin."
        ],
        "specs": {
          "Material": "Surgical steel with 18k gold plating",
          "Medida": "2.2 cm diameter",
          "Peso": "3 g each"
        },
        "care": [
          "Store them dry, away from perfume. If they dull, wipe with a soft cloth."
        ],
        "images": [
          {
            "src": "/img/accesorios-aros.jpg",
            "alt": "Gold Sun Earrings"
          }
        ],
        "variants": [
          {
            "color": "Gold",
            "stock": "disponible"
          },
          {
            "color": "Silver",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "collar-luna",
        "name": "Moon Necklace",
        "category": "Accesorios",
        "price": 890,
        "sku": "VS-AC-002",
        "short": "Fine chain with a moon charm, adjustable length.",
        "long": [
          "45 cm chain with a 5 cm extension, so you can wear it short or over a shirt."
        ],
        "specs": {
          "Material": "Surgical steel",
          "Largo": "45–50 cm adjustable"
        },
        "images": [
          {
            "src": "/img/accesorios-collar.jpg",
            "alt": "Moon Necklace with charm"
          }
        ],
        "variants": [
          {
            "color": "Gold",
            "stock": "disponible"
          },
          {
            "color": "Silver",
            "stock": "agotado"
          }
        ]
      },
      {
        "slug": "gorra-lino",
        "name": "Linen Cap",
        "category": "Accesorios",
        "price": 1190,
        "short": "Lightweight linen, soft brim, adjustable fit.",
        "long": [
          "For real sun: linen breathes and won't leave your head sweaty. Soft brim, folds flat in a bag."
        ],
        "images": [
          {
            "src": "/img/accesorios-gorra.jpg",
            "alt": "Linen cap"
          }
        ],
        "variants": [
          {
            "talle": "One size",
            "color": "Off-white",
            "stock": "disponible"
          },
          {
            "talle": "One size",
            "color": "Black",
            "stock": "disponible"
          },
          {
            "talle": "One size",
            "color": "Green",
            "stock": "agotado"
          }
        ]
      },
      {
        "slug": "bufanda-ambar",
        "name": "Amber Scarf",
        "category": "Accesorios",
        "price": 990,
        "short": "Soft knit in amber tone, 180 cm long.",
        "long": [
          "Loom-woven by a workshop in Canelones. Warm without the bulk."
        ],
        "images": [
          {
            "src": "/img/accesorios-bufanda.jpg",
            "alt": "Amber-colored scarf"
          }
        ],
        "stock": "disponible"
      },
      {
        "slug": "camisola-nube",
        "name": "Cloud Tunic",
        "category": "Indumentaria",
        "price": 1900,
        "featured": true,
        "sku": "VS-IN-001",
        "short": "Loose cotton tunic, with a soft drape.",
        "long": [
          "Loose cut, drapes without clinging. Goes with everything and holds up to washing without losing shape.",
          "Each size's measurements are in the size guide."
        ],
        "specs": {
          "Composición": "100% cotton",
          "Calce": "Loose",
          "Origen": "Made in Uruguay"
        },
        "images": [
          {
            "src": "/img/indumentaria-camisola.jpg",
            "alt": "White Cloud Tunic"
          }
        ],
        "variants": [
          {
            "talle": "S",
            "color": "Off-white",
            "stock": "disponible"
          },
          {
            "talle": "M",
            "color": "Off-white",
            "stock": "disponible"
          },
          {
            "talle": "L",
            "color": "Off-white",
            "stock": "agotado"
          },
          {
            "talle": "M",
            "color": "Black",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "remera-basica",
        "name": "Basic Tee",
        "category": "Indumentaria",
        "price": 1290,
        "featured": true,
        "short": "Combed cotton, reinforced collar, straight fit.",
        "long": [
          "The tee you wear until it falls apart. 24/1 combed cotton, reinforced collar so it won't stretch out."
        ],
        "specs": {
          "Composición": "100% combed cotton",
          "Calce": "Straight"
        },
        "images": [
          {
            "src": "/img/indumentaria-remera.jpg",
            "alt": "Basic tee"
          }
        ],
        "variants": [
          {
            "talle": "S",
            "color": "White",
            "stock": "disponible"
          },
          {
            "talle": "M",
            "color": "White",
            "stock": "disponible"
          },
          {
            "talle": "L",
            "color": "Black",
            "stock": "disponible"
          },
          {
            "talle": "XL",
            "color": "Black",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "camisa-lino",
        "name": "Linen Shirt",
        "category": "Indumentaria",
        "price": 2400,
        "short": "Pure linen, coconut buttons, relaxed fit.",
        "long": [
          "Linen that wrinkles: it's part of the material and the look. Nothing beats it for summer."
        ],
        "specs": {
          "Composición": "100% linen",
          "Botones": "Natural coconut"
        },
        "images": [
          {
            "src": "/img/indumentaria-camisa.jpg",
            "alt": "Linen shirt"
          }
        ],
        "variants": [
          {
            "talle": "M",
            "color": "Off-white",
            "stock": "disponible"
          },
          {
            "talle": "L",
            "color": "Off-white",
            "stock": "disponible"
          },
          {
            "talle": "XL",
            "color": "Sand",
            "stock": "agotado"
          }
        ]
      },
      {
        "slug": "sweater-crudo",
        "name": "Off-white Sweater",
        "category": "Indumentaria",
        "price": 2700,
        "short": "Chunky knit, crew neck, made in Uruguay.",
        "long": [
          "Chunky wool-cotton blend knit: warm without the itch. Knitted in Montevideo."
        ],
        "images": [
          {
            "src": "/img/indumentaria-sweater.jpg",
            "alt": "Off-white chunky knit sweater"
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
        "name": "Roma Tote Bag",
        "category": "Bolsos y mochilas",
        "price": 2900,
        "featured": true,
        "short": "Waxed canvas with a leather base. Fits a 15\" laptop.",
        "long": [
          "The everyday bag: fits a laptop, notebook and water bottle without losing shape. Leather base so it stands upright."
        ],
        "specs": {
          "Material": "Waxed canvas and cowhide leather",
          "Medidas": "38 × 34 × 12 cm",
          "Bolsillos": "One zippered interior pocket"
        },
        "images": [
          {
            "src": "/img/bolsos-tote.jpg",
            "alt": "Canvas tote bag"
          }
        ],
        "variants": [
          {
            "color": "Natural",
            "stock": "disponible"
          },
          {
            "color": "Black",
            "stock": "disponible"
          }
        ]
      },
      {
        "slug": "mochila-lona",
        "name": "Canvas Backpack",
        "category": "Bolsos y mochilas",
        "price": 2350,
        "short": "Main zipper, padded pocket, adjustable straps.",
        "long": [
          "Padded interior pocket for laptops up to 14\". Wide, adjustable straps."
        ],
        "images": [
          {
            "src": "/img/bolsos-mochila.jpg",
            "alt": "Canvas backpack"
          }
        ],
        "variants": [
          {
            "color": "Green",
            "stock": "disponible"
          },
          {
            "color": "Black",
            "stock": "agotado"
          }
        ]
      },
      {
        "slug": "rinonera-siena",
        "name": "Siena Belt Bag",
        "category": "Bolsos y mochilas",
        "price": 1490,
        "short": "Compact, with two compartments and a wide strap.",
        "long": [
          "For traveling light: fits your phone, wallet and keys. Wide adjustable strap, can be worn crossbody."
        ],
        "images": [
          {
            "src": "/img/bolsos-rinonera.jpg",
            "alt": "Siena belt bag"
          }
        ],
        "stock": "disponible"
      },
      {
        "slug": "vela-ambar",
        "name": "Amber Candle",
        "category": "Cuidado y hogar",
        "price": 850,
        "short": "Soy wax with amber and vanilla scent. 40 hours.",
        "long": [
          "Soy wax, cotton wick, no paraffin. Burns for about 40 hours."
        ],
        "images": [
          {
            "src": "/img/hogar-vela.jpg",
            "alt": "Soy wax candle"
          }
        ],
        "stock": "disponible"
      },
      {
        "slug": "jabon-avena",
        "name": "Oatmeal Soap",
        "category": "Cuidado y hogar",
        "price": 350,
        "short": "Vegetable glycerin with ground oatmeal. Suitable for sensitive skin.",
        "long": [
          "Made in small batches with vegetable glycerin and ground oatmeal. No synthetic fragrance."
        ],
        "images": [
          {
            "src": "/img/hogar-jabon.jpg",
            "alt": "Handmade oatmeal soap"
          }
        ],
        "stock": "disponible"
      },
      {
        "slug": "difusor-savia",
        "name": "Savia Reed Diffuser",
        "category": "Cuidado y hogar",
        "price": 1190,
        "short": "Reed diffuser, woody scent. Lasts 3 months.",
        "long": [
          "Eight rattan reeds and 150 ml of woody-scented oil. Lasts about three months in a small room."
        ],
        "images": [
          {
            "src": "/img/hogar-difusor.jpg",
            "alt": "Reed diffuser"
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
