# Estudio Trazo — demo de producto CUADRA (vertical Agenda)

Sitio ficticio de barbería en Montevideo (Bulevar Artigas 2026), construido como demo de producto de la plataforma CUADRA. No corresponde a un negocio real.

## Cómo correr local

Desde esta carpeta:

- Python: `python -m http.server 8000`
- Node: `npx serve .`

Abrí `http://localhost:8000/` (o el puerto que indique el servidor) y navegá el demo. La página `gracias.html` aparece después de completar una reserva de prueba desde `reservar.html`.

## Estructura

| Página | Descripción |
| --- | --- |
| `index.html` | Home: servicios, equipo, FAQ y ubicación |
| `reservar.html` | Reserva de turno online (wizard de 4 pasos) |
| `admin.html` | Panel administrativo (demo) |
| `gracias.html` | Confirmación post-reserva |
| `404.html` | Página no encontrada |
| `privacy.html` | Política de privacidad |
| `llms.txt` | Metadatos del sitio para LLMs |

## Identidad y datos

Los datos del demo viven en `js/config.js` (`window.CCESCO_CONFIG`):

- API: `https://cuadra-api-t7rg.onrender.com/api/demoagenda`
- Sin tenant → demo mode con datos locales del navegador (localStorage)
- Con tenant → API multi-tenant

## Nota

El demo es una subruta del sitio CUADRA: `https://cuadrastudio.uy/demos/estudiotrazo/`