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
    "enabled": false,
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
    "enabled": true,
    "citasKey": "estudiotrazo_demo_turnos"
  }
};
