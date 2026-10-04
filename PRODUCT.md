# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS, sin build step. Deploy en Render Static Site (dominio cuadrastudio.uy). Formularios por email vía FormSubmit (`js/site-config.js`); `workers/confirm-email/` (Worker + Resend) manda la copia al visitante y está desactivado mientras `confirmEndpoint` esté vacío. Modo del sitio con `scripts/site-mode.py`: hoy **hidden** (en `/` solo el teaser "en construcción"; la home completa vive en `/index-web.html`, noindex).

## Users

Dueños/operadores de negocios locales chicos en Montevideo, Uruguay, no técnicos, que ya atienden clientes por WhatsApp. Cuatro rubros con línea de producto propia (sistema completo, a medida):

- **Agenda**: servicios con turnos (barberías, peluquerías, estéticas, masajes, tatuajes, gimnasios, clínicas).
- **Tienda**: comercios con catálogo (indumentaria, accesorios, artesanías, productos locales).
- **Restó**: gastronomía (restaurantes, parrillas, cafés, bares, rotiserías, pizzerías).
- **Consulta**: profesionales independientes (abogados, contadores, consultores, arquitectos, psicólogos, nutricionistas).

Más dos productos de presencia web sin sistema, para quien todavía no necesita reservas/pedidos/agenda:

- **Landing**: negocio que solo necesita una página con lo esencial (quién es, qué ofrece, contacto).
- **Institucional**: negocio o profesional que necesita contar más de sí mismo en varias páginas, sin operar nada online todavía.

Su trabajo hoy: atender reservas/pedidos/consultas a mano por WhatsApp o llamada, sin web propia o con una que no resuelve nada operativo.

## Product Purpose

CUADRA arma, para cada negocio, una web a medida + un sistema operativo propio de su rubro (reservas, pedidos, carta digital o agenda de consultas) + WhatsApp automatizado, como un solo servicio mensual. El objetivo es que el negocio deje de perder turnos/pedidos por no atender a tiempo, sin que el dueño tenga que aprender una herramienta nueva.

## Positioning

A diferencia de una agencia que solo entrega una web estática, o de un SaaS genérico de turnos sin presencia web propia, CUADRA vende web + sistema + WhatsApp integrados desde el día uno de una sola línea de producto por rubro. Precios **a la carta**: cada línea tiene una base obligatoria (implementación + mensual) y extras individuales con precio propio — nunca niveles de plan tipo Básico/Profesional/Premium (modelo explícitamente descartado, verificado también en el backend real: `plans.js`/`extrasCatalog.js` no tienen campo de tier).

Landing e Institucional son la puerta de entrada para quien todavía no necesita sistema — precio fijo, sin extras — no reemplazan la propuesta central (web + sistema + WhatsApp); la preceden.

## Operating Context

El dueño del negocio gestiona casi todo por WhatsApp: confirma reservas/pedidos, cobra seña, responde consultas. Panel de administración simple para ver el día. La implementación carga contenido real del cliente (fotos, precios, horarios) — no es una plantilla genérica con el logo pegado.

## Capabilities and Constraints

- 4 líneas de producto, cada una con base fija + extras propios (específicos de línea + comunicación/clientes + crecimiento/fidelización, compartidos entre líneas).
- **Precios públicos en USD**, netos, sin IVA (IVA 22% trasladable a empresas); equivalen a los $U de `docs/negocio/planes-producto-cuadra.md` en el repo Webs (TC 1 USD ≈ $U 40). Implementación + mantenimiento y soporte mensual:
  - **Landing:** USD 200 + USD 10/mes (~$U 8.000 + 390). **Institucional:** USD 325 + USD 15/mes (~$U 13.000 + 590). Precio fijo, sin extras ni panel de administración, sin reservas/pedidos/agenda.
  - **Líneas a medida:** Agenda USD 550 · Restó USD 625 · Tienda USD 700 · Consulta USD 375, todas con USD 25/mes (~$U 990). Extras individuales, a la carta (p. ej. recordatorios por WhatsApp USD 10/mes, clientes con historial USD 5/mes, Google Calendar USD 25, multi-idioma USD 50, profesional adicional USD 15, sede adicional USD 40); el listado completo está en `armar-plan.html`.
- Cómo se contrata: el visitante arma su plan en `armar-plan.html` y lo envía **por email**; CUADRA responde para confirmar contenido, alcance y precio final. Seña 50% por transferencia al firmar + 50% contra entrega; el mantenimiento arranca con la entrega. Plazo: 5 a 10 días hábiles desde la seña.
- Contacto de Cuadra: email (`cuadrastudio.uy@gmail.com`) y botón flotante de WhatsApp; el teléfono se quitó de todo el sitio.
- Sin checkout de pago online todavía (roadmap, no implementado); pedidos y reservas de los negocios clientes se gestionan por WhatsApp.
- Opción 2 ("ya tengo web"): setup de integración escalado por línea (Agenda USD 110, Tienda USD 140, Restó USD 125, Consulta USD 75), eximido con compromiso de 6 meses; si se cancela antes, se factura en el último mes.
- El paso "combo" se quitó del configurador; la regla comercial de combo entre dos líneas no figura hoy en el sitio.

## Brand Commitments

- Nombre: **CUADRA**. Descriptor condicional: "Desarrollo web a medida" (solo cuando el contexto lo requiere).
- Isotipo geométrico, interpretación de "¬=" (bracket + doble barra). Archivo correcto: `assets/cuadra-logo-black.svg` / `assets/cuadra-logo-white.svg` (285×77.7, proporción real, nunca deformar). `assets/cuadra-isotipo-dark.svg`/`cuadra-isotipo.svg` son una versión reducida (solo el fragmento "¬"), válida para usos muy chicos (favicon-like), no como logo principal.
- Tipografía: **Montserrat por rol**, peso mínimo 400 (nada de Light 300): titulares 600 en sentence-case con tracking negativo; botones, eyebrows y etiquetas en mayúsculas con 500–600 y tracking 0,04–0,14em; cuerpo 400. Detalle en `DESIGN.md`.
- **Sistema visual vigente (verificado contra `origin/master` el 2026-10-03):** dark-first y editorial. Black `#0F1111`, Graphite, Sage `#AFC8C2` (acento; nunca como texto sobre claro), Mist y Warm White como bandas de respiro. Dirección artística "Plano de manzana" (`docs/art-direction.md`): grilla visible, marcas de esquina, cotas y coordenadas; ritmo de superficies hero en black, bandas mist/graphite/warm white y CTA final en sage. `DESIGN.md` y `docs/` de este repo son la fuente de verdad visual del sitio. La guía de marca general (redes, voz, tokens) está en el repo Webs: `docs/brand-guidelines.md` (borrador, sin APROBADO). Algunos documentos de este repo (`docs/typography-montserrat.md`, `copy-empresa.md`) conservan descripciones del sistema viejo.

## Evidence on Hand

- Cuatro demos hechos a mano con negocios ficticios, enlazados desde la home: **Cantina Bianchi** (Restó, `/demos/cantina-bianchi/`), **Cebador** (Tienda, `/demos/cebador/`), **Estudio Olmos** (Consulta, `/demos/olmos/`) y **Barbería Hierro** (Agenda, `/demos/hierro/`). En `demos/` quedan además carpetas sin enlace desde el sitio (`elfogatero`, `estudioarroyo`, `verastore`, `hierrobarberia`, y `brunoentrena` sin versionar): conviene revisarlas.
- Backend real de precios y extras (referencia, no se edita desde el sitio estático): `backend/render-api/api/plans.js` y `backend/render-api/api/extrasCatalog.js` en el repo Webs.
- Esta carpeta es un clon de `fedMiranda/Cuadra` (dominio de producción `cuadrastudio.uy`). `master` se sincronizó con `origin/master` el 2026-10-03 (merge `cb218ea`); no empujar cambios al remoto sin confirmación explícita.

## Product Principles

1. **Todo por WhatsApp primero**: cualquier feature nueva se evalúa por si un negocio chico puede operarla sin salir de WhatsApp.
2. **A la carte, no por nivel**: nunca reintroducir lenguaje de "plan Básico/Profesional/Premium"; los extras son individuales por línea.
3. **Contenido real, no relleno**: cada implementación carga datos reales del cliente; las demos son ficticias pero están marcadas como tales.
4. **Honestidad ante todo**: no fabricar reseñas, testimonios ni social proof falso; declarar explícitamente cuando algo es una demo.

## Accessibility & Inclusion

Sin requisito específico más allá de WCAG AA estándar (ya verificado en el sistema de color actual: contrastes de texto ≥4.5:1, foco visible, formularios con labels).
