/* Config del tenant — generado. Editar el JSON de origen, no este archivo. */
window.SITE_CONFIG = {
  "tenant": {
    "slug": "estudioarroyo",
    "name": "Estudio Arroyo",
    "vertical": "consulta",
    "plan": "premium",
    "currency": "UYU"
  },
  "api": {
    "enabled": false,
    "base": "https://cuadra-api-t7rg.onrender.com/api/democonsulta",
    "timeoutMs": 8000
  },
  "whatsapp": {
    "number": "59899000000",
    "message": "Hola Estudio Arroyo, quiero hacer una consulta."
  },
  "booking": {
    "slotStepMin": 45,
    "minAdvanceMin": 120,
    "maxGuests": 8,
    "hours": [
      {
        "days": "Lunes a viernes",
        "open": "09:00",
        "close": "18:00",
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
        "dayIndexes": [
          6
        ]
      }
    ]
  },
  "catalog": [],
  "menuItems": [],
  "base": "/demos/estudioarroyo",
  "demo": {
    "enabled": true,
    "citasKey": "estudioarroyo_demo_turnos"
  }
};
