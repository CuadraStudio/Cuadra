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
    "enabled": true,
    "citasKey": "verastore_demo_pedidos"
  }
};
