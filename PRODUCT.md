# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS, sin build step. Deploy en Render Static Site (dominio cuadrastudio.uy).

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
- 2 productos de presencia web sin sistema, precio fijo (no a la carta, sin extras ni configurador): **Landing** (1 página, $U 8.000 único ~USD 200 + $U 390/mes) e **Institucional** (hasta 5 páginas, $U 13.000 único ~USD 325 + $U 590/mes). Ninguno incluye panel de administración ni reservas/pedidos/agenda.
- Pago: seña 50% al firmar + 50% contra entrega; mensualidad arranca con la entrega.
- Sin checkout de pago online todavía (roadmap, no implementado).
- Combo entre dos líneas posible: mismo tenant, una web, 10% off en la segunda línea.
- Opción 2 ("ya tengo web"): se cobra solo el setup de integración del sistema, exento si hay compromiso de 6 meses.

## Brand Commitments

- Nombre: **CUADRA**. Descriptor condicional: "Desarrollo web a medida" (solo cuando el contexto lo requiere).
- Isotipo geométrico, interpretación de "¬=" (bracket + doble barra). Archivo correcto: `assets/cuadra-logo-black.svg` / `assets/cuadra-logo-white.svg` (285×77.7, proporción real, nunca deformar). `assets/cuadra-isotipo-dark.svg`/`cuadra-isotipo.svg` son una versión reducida (solo el fragmento "¬"), válida para usos muy chicos (favicon-like), no como logo principal.
- Tipografía: Montserrat (pesos 300–700 cargados).
- **El sistema visual está en medio de un rediseño activo iniciado esta misma sesión**: se pasó de un sistema dark-first arquitectónico (negro/grafito/sage, Montserrat Light 300 con tracking ancho) a un sistema editorial claro tipo portfolio (fondo papel cálido `#F2F1ED`, tinta casi negra `#0F1111`, acento verde oscurecido `#3E6B62`, tipografía peso 600 en sentence-case), inspirado estructuralmente en sandeep.design. **`DESIGN.md` todavía describe el sistema viejo y no refleja la implementación actual** — no usarlo como fuente de verdad visual sin contrastarlo primero contra el CSS real (`css/home-editorial.css`, `css/tokens.css` con `.section--light`) y los estilos computados en pantalla.

## Evidence on Hand

- Demos de producto reales y funcionando, con negocios ficticios: **Vera Store** (Tienda), **Estudio Trazo** (Agenda), **El Fogatero** (Restó), **Estudio Arroyo** (Consulta). Screenshots en `img/demoagenda.png`, `img/demotienda.png`, `img/demoresto.png`, `img/democonsulta.png`.
- Backend real de precios (referencia, no se edita desde el sitio estático): `backend/render_web_services/api/plans.js`, `backend/render_web_services/api/extrasCatalog.js`.
- El dominio de producción (`cuadrastudio.uy`, repo `fedMiranda/Cuadra`) es un sitio real y separado de esta copia de trabajo (`Cuadra_static_site_draft`); no confundir ni empujar cambios de acá hacia ese repo sin confirmación explícita.

## Product Principles

1. **Todo por WhatsApp primero**: cualquier feature nueva se evalúa por si un negocio chico puede operarla sin salir de WhatsApp.
2. **A la carte, no por nivel**: nunca reintroducir lenguaje de "plan Básico/Profesional/Premium"; los extras son individuales por línea.
3. **Contenido real, no relleno**: cada implementación carga datos reales del cliente; las demos son ficticias pero están marcadas como tales.
4. **Honestidad ante todo**: no fabricar reseñas, testimonios ni social proof falso; declarar explícitamente cuando algo es una demo.

## Accessibility & Inclusion

Sin requisito específico más allá de WCAG AA estándar (ya verificado en el sistema de color actual: contrastes de texto ≥4.5:1, foco visible, formularios con labels).
