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
    "enabled": true,
    "citasKey": "verastore_demo_pedidos"
  }
};
