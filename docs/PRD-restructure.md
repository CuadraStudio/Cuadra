# PRD: Reestructuración de Landing Page (index.html)

**Status**: Approved
**Author**: Alex (Product Manager)
**Last Updated**: 2026-09-08
**Version**: 1.0
**Stakeholders**: Vega (Orchestrator), Frontend Developer, Senior Developer

---

## 1. Problem Statement

La landing actual de CUADRA tiene un orden de secciones que no sigue una narrativa de conversión clásica. El cliente pidió reestructurar para un flujo Hero → Social proof → Problem → Solution → How it works → FAQ → CTA. El sitio ya tiene contenido real y verificado (testimonios, stats, proyectos, proceso, pricing, FAQ). No se inventa nada: se reordena, se reencuadra, y se toman decisiones de scope sobre contenido existente.

**Evidencia:**
- Contenido verificado en disco: 50+ reservas, 48h entrega, 3 negocios activos, 3 testimonios reales, 3 proyectos con demo live, 3 planes de pricing, 4 FAQs.
- El orden actual (Hero → Stats → Before/After → Proyectos → Proceso → Testimonios → Pricing → FAQ → CTA) no sigue el flujo de conversión pedido.

---

## 2. Goals & Success Metrics

| Goal | Metric | Target | Measurement |
|------|--------|--------|-------------|
| Estructura de conversión correcta | Orden de secciones visible en DOM | 7 secciones en el orden exacto especificado | Inspección manual + checklist |
| Sin pérdida de contenido real | Contenido HTML existente preservado | 0 datos inventados, 0 testimonios nuevos, 0 stats nuevos | Auditoría de contenido |
| Contenido sin duplicación | Cada dato real aparece 1 vez | 0 duplicaciones de datos (e.g. "3 negocios activos") | Auditoría de copy |
| Links intactos | Todos los href funcionan | 100% links internos y externos válidos | Validación manual |
| Accesibilidad mantenida | IDs, aria-labels, sr-only, roles | Todas las secciones con aria-labelledby funcional | Inspección DOM |

---

## 3. Non-Goals

- **No se rediseña la identidad visual.** Se mantiene el sistema de diseño (DESIGN.md): dark-first, sage como acento, Space Grotesk + Inter.
- **No se modifica nav, footer, FAB, ni outras páginas** (proyectos.html, contacto.html).
- **No se agrega funcionalidad nueva.** No hay JavaScript nuevo, no hay componentes nuevos.
- **No se modifica tokens.css, layout.css, components.css, pages.css, animations.css, base.css** salvo que sea estrictamente necesario para el reordenamiento.
- **No se inventa contenido.** Todo el copy, stats, testimonios, precios y proyectos son los que ya existen en index.html.

---

## 4. Mapa de Secciones Objetivo

### Sección 1 — Hero

| Campo | Valor |
|-------|-------|
| **Rol en narrativa** | Primera impresión. Comunica qué hace CUADRA, para quién, y el resultado tangible. Genera interés inmediato. |
| **Bloque de contenido real** | Líneas 70–96 del index.html actual (sección completa `.hero`) |
| **Título / H2 sugerido** | No aplica — es H1 interno del hero |
| **Micro-ajustes de copy** | Ninguno. El hero actual ya contiene: label ("Cuadra — Desarrollo Web · Montevideo, Uruguay"), H1 ("CUADRA / Sitios web que funcionan / y generan resultados"), subtítulo (72h, reservas online, presencia Google, resultados medibles), 2 CTAs ("Ver proyectos" + "Quiero mi sitio"). Todo es real y preciso. |
| **Background** | Dark (`.hero` — ya existente) |

---

### Sección 2 — Social Proof

| Campo | Valor |
|-------|-------|
| **Rol en narrativa** | Credibilidad inmediata después del hero. Responde "¿por qué debería creerte?" con datos duros y voces de clientes reales. |
| **Bloque de contenido real** | **Stats**: Líneas 98–117 (sección completa `.section--mist` con stats-grid: 50+ reservas, 48h entrega, 3 negocios activos). **Testimonios**: Líneas 217–275 (sección completa con 3 testimonios: Matías/The Faleros via WhatsApp, Santiago/Saga Studio via WhatsApp, Carlos/Ccesco Studio via Google reseña). |
| **Título / H2 sugerido** | Stats mantienen su `sr-only` title ("Números que hablan"). Testimonios mantienen "Lo que **dicen** mis clientes". |
| **Micro-ajustes de copy** | **Deduplicar**: "3 negocios ya activos en Montevideo" aparece tanto en Stats (línea 113) como en el panel "Con CUADRA" del Before/After (línea 144). Se mantiene en Stats (donde tiene más impacto como dato duro) y se elimina del panel "Después" del Before/After. |
| **Estructura visual** | Stats (mist) → Testimonios (light). Mantener ambos fondos distintos para ritmo visual. Los testimonials-grid ya funciona bien con 3 cards. |
| **Background** | Stats: `section--mist`. Testimonios: `section--light`. |

**Nota de implementación**: Stats y Testimonios son dos sub-secciones dentro de la sección de Social Proof. Se pueden envolver en un `<section>` contenedor con aria-label, o mantener como dos `<section>` hermanas secueltas (ambas son válidas; la segunda opción es más limpia porque mantiene los IDs existentes intactos).

---

### Sección 3 — Problem Statement

| Campo | Valor |
|-------|-------|
| **Rol en narrativa** | Presenta el dolor del usuario. "¿Te suena esto?" Antes de ofrecer la solución, hay que hacer sentir el problema. |
| **Bloque de contenido real** | Panel "Sin presencia online" del Before/After: Líneas 126–133 (`.comparison-card--before` con su label y 4 items). |
| **Título / H2 sugerido** | "**Sin** presencia online" — directo, sin eufemismos. O mantener el H2 actual "El cambio, en números" y mostrar solo el panel "antes". **Recomendación**: H2 nuevo = "Tu negocio **sin** presencia online" (tono directo, segundo persona, alineado con el tono del Design System — sección 20: "Directo, claro, profesional, técnico. Sin exageraciones.") |
| **Micro-ajustes de copy** | El título "El cambio, en números" no encaja como problem statement. Se reemplaza. Los 4 items del panel "antes" ya están escritos en tono directo y no necesitan cambios. |
| **Background** | `section--light` (ya existente) |

**Contenido a reutilizar**:
```html
<!-- Del panel "before" existente, líneas 127-133 -->
<p class="comparison-card__label">Sin presencia online</p>
<ul class="comparison-card__list">
  <li>Clientes no encontraban la barbería en Google</li>
  <li>Reservas solo por llamada o WhatsApp</li>
  <li>Ninguna reserva online generada</li>
  <li>Dependía del boca en boca del barrio</li>
</ul>
```

---

### Sección 4 — Solution / Value

| Campo | Valor |
|-------|-------|
| **Rol en narrativa** | Presenta la solución con evidencia: qué cambia con CUADRA (resultados medibles) + prueba visual (proyectos reales con demo live). El pricing se integra aquí como parte de la propuesta de valor (ver Decisión de Pricing abajo). |
| **Bloque de contenido real** | **Panel "Con CUADRA"**: Líneas 138–146 (`.comparison-card--after`, con deduplicación del item "3 negocios"). **Proyectos destacados**: Líneas 151–189 (sección completa con 3 cards: The Faleros, Saga Studio, Estudio Trazo — cada uno con screenshot, descripción y link a demo live). |
| **Título / H2 sugerido** | "Lo que **cambia** con CUADRA" (para el panel resultado). Los proyectos mantienen "Proyectos **destacados**". |
| **Micro-ajustes de copy** | Panel "Después" después de deduplicar queda con 3 items (50+ reservas, Google 24/7, reservan desde el celular). El cuarto item ("3 negocios ya activos") se eliminó porque ya está en Social Proof. **Opcional**: reemplazar el item eliminado con un dato real existente en el pricing o en otro lugar del copy, pero NO inventar nada. Si no hay dato de reemplazo, quedan 3 items — es suficiente. |
| **Background** | Resultado: `section--mist` (o mantener `section--light`). Proyectos: `section--dark` (ya existente, alto contraste). |

**Estructura visual**: Panel resultado (light/mist) → Proyectos (dark). El contraste entre ambos fondos crea separación clara entre "la promesa" y "la evidencia".

---

### Sección 5 — How It Works

| Campo | Valor |
|-------|-------|
| **Rol en narrativa** | Reduce la incertidumbre del proceso. "¿Cómo funciona? Es simple: 3 pasos." Elimina la fricción de no saber qué esperar. |
| **Bloque de contenido real** | Líneas 191–215 (sección completa "Mi proceso" con 3 step-cards: 01 Identifico tu negocio, 02 Diseño la solución, 03 Te lo presento). |
| **Título / H2 sugerido** | "Mi **proceso**" (ya existente). O "Cómo **funciona**" (más alineado con la convención de la estructura de conversión). **Recomendación**: "Cómo **funciona**" — más directo para el flujo de conversión, pero el actual "Mi proceso" también funciona. Ambos son válidos; "Cómo funciona" es estándar en landing de conversión. |
| **Micro-ajustes de copy** | Ninguno. Los 3 pasos ya están escritos en tono claro y directo: identifico → diseño → presento. Sin exageraciones. |
| **Background** | Default (dark, como la sección actual) |

---

### Sección 6 — FAQ

| Campo | Valor |
|-------|-------|
| **Rol en narrativa** | Resuelve objeciones finales antes del CTA. Cada pregunta es una barrera de conversión potencial que se elimina. |
| **Bloque de contenido real** | Líneas 334–359 (sección completa con 4 FAQs: tiempos, inclusión, forma de pago, conocimiento técnico). |
| **Título / H2 sugerido** | "Preguntas **frecuentes**" (ya existente). Sin cambios. |
| **Micro-ajustes de copy** | Ninguno. Las 4 preguntas ya cubren los objeciones clave: tiempos (48-72h), alcance (diseño + hosting + SEO + soporte), pago (50/50, transferencia/MP/efectivo), y requisito técnico (ninguno). |
| **Background** | `section--light` (ya existente) |

---

### Sección 7 — CTA

| Campo | Valor |
|-------|-------|
| **Rol en narrativa** | Cierre. Un solo pedido claro, sin distracciones. El usuario ya vio credibilidad, problema, solución, evidencia, proceso y objeciones resueltas. Ahora solo queda actuar. |
| **Bloque de contenido real** | Líneas 361–370 (sección completa "CTA Contacto" con H2 "Ya tengo tu solución", subtítulo, y botón "Reservá tu demo gratis"). |
| **Título / H2 sugerido** | "Ya tengo tu **solución**" (ya existente). Sin cambios. |
| **Micro-ajustes de copy** | Ninguno. El copy es directo y claro. |
| **Background** | Default (dark, como la sección actual) |

---

## 5. Decisión de Pricing

### Contexto

La estructura de 7 secciones pedida por el cliente no incluye pricing. El sitio actual tiene una sección "Inversión accesible" con 3 planes reales ($2.900 / $4.900 / $7.900) que incluyen detalles concretos de cada plan. Esta sección es contenido verificado y valioso.

### Opciones evaluadas

| Opción | Pros | Contras |
|--------|------|---------|
| **(a) Eliminar pricing** | Respeta literalmente las 7 secciones pedidas. Landing más limpia. | Pierde contenido real de alto valor. La transparencia de precios es una ventaja competitiva (la mayoría de estudios de web no muestran precios). El usuario pierde información clave para decidir antes del CTA. Genera más fricción ("¿cuánto cuesta?"), no menos. |
| **(b) Integrar en Solution/Value** | Los precios forman parte de la propuesta de valor. Mantiene las 7 secciones sin agregar una octava. | Distorsiona la narrativa de Solution/Value: los 3 planes con sus listas de features son mucho más que "esto es lo que cambia". Genera una sección demasiado larga y mixta (resultados + proyectos + pricing = sobrecarga cognitiva). |
| **(c) Mantener antes del CTA final** | Patrón estándar en landing de conversión: valor → precio → acción. El pricing refuerza la propuesta justo antes de pedir el contacto. La transparencia genera confianza. Se mantiene el contenido real sin inventar nada. | Agrega una 8ª sección. Pero se integra de forma fluida: FAQ → Pricing → CTA es un cierre natural (resolvés dudas → ves el precio → actuás). |

### Recomendación: Opción (c)

**Mantener pricing como sección de refuerzo de valor antes del CTA final.** Razones:

1. **Conversión**: El pricing en una landing de servicios es contenido de alta señal. Un usuario que llega al CTA sin saber cuánto cuesta tiene más fricción que uno que ya vio los precios. Pricing antes del CTA es el patrón más probado en landing de servicios y productos con precio fijo.
2. **Transparencia como propuesta de valor**: CUADRA ya tiene como tono "sin sorpresas, sin costos ocultos". La sección de pricing demuestra eso. Eliminarla contradice el posicionamiento.
3. **El Design System lo soporta**: La sección de pricing ya usa `section--mist`, que crea un ritmo visual limpio entre FAQ (light) y CTA (dark). Mist → CTA es una transición natural.
4. **Las 7 secciones del cliente se respetan**: Pricing se integra como parte del cierre (entre FAQ y CTA), no como una sección disruptiva. El flujo Hero → Social proof → Problem → Solution → How it works → FAQ → **Pricing** → CTA es una variación estándar de la estructura de 7.

**Nota**: Si el cliente insiste en eliminar pricing en una revisión posterior, se puede quitar sin afectar la estructura de las 7 secciones principales. El PRD lo documenta como integrado pero no bloqueante.

### Contenido de Pricing a reutilizar

Líneas 277–332 del index.html actual:
- H2 "Inversión **accesible**"
- Subtítulo "Sin sorpresas. Sin costos ocultos. Todo incluido."
- 3 pricing cards (Básico $2.900, Popular $4.900, Premium $7.900) con features y CTAs
- Background: `section--mist`

---

## 6. Orden Final de Secciones (DOM)

```
1. Hero                    → Líneas 70–96   (dark)
2. Stats                   → Líneas 98–117  (mist)
3. Testimonios             → Líneas 217–275 (light)
4. Problem (antes)         → Líneas 126–133 (light)  [extracto del Before/After]
5. Solution (después)      → Líneas 138–146 (mist)   [extracto del Before/After, deduplicado]
6. Proyectos destacados    → Líneas 151–189 (dark)
7. Proceso (3 pasos)       → Líneas 191–215 (dark)
8. Pricing                 → Líneas 277–332 (mist)
9. FAQ                     → Líneas 334–359 (light)
10. CTA Contacto           → Líneas 361–370 (dark)
```

**Agrupación lógica en 7 secciones de conversión:**
1. Hero
2. Social Proof = Stats + Testimonios (2 sub-secciones)
3. Problem = Panel "antes" del Before/After
4. Solution = Panel "después" + Proyectos destacados (2 sub-secciones)
5. How It Works = Proceso en 3 pasos
6. FAQ + Pricing (cierre de objeciones + refuerzo de valor)
7. CTA

---

## 7. Criterios de Aceptación Medibles

| # | Criterio | Cómo se mide | Pass/Fail |
|---|----------|-------------|-----------|
| CA-1 | El orden visible de secciones en el DOM sigue: Hero → Social Proof → Problem → Solution → How it works → FAQ → Pricing → CTA | Inspección del DOM: contar secciones en orden | |
| CA-2 | Cada sección contiene el contenido real preexistente (stats, testimonios, before/after items, proyectos, proceso, pricing, FAQ) | Comparación side-by-side del HTML nuevo vs. original | |
| CA-3 | Ningún dato fue inventado: 0 testimonios nuevos, 0 stats nuevos, 0 proyectos nuevos, 0 precios nuevos | Auditoría de copy: cada claim rastreable al index.html original | |
| CA-4 | No hay duplicación de contenido: "3 negocios activos" aparece solo en Social Proof (Stats) | Búsqueda de texto en el HTML reestructurado | |
| CA-5 | Todos los links internos (/proyectos.html, /contacto.html, /) y externos (demos de The Faleros, Saga Studio, Estudio Trazo; WhatsApp) funcionan | Validación manual de cada href | |
| CA-6 | Todas las secciones mantienen sus aria-labelledby o aria-label funcionales | Inspección DOM: verificar que cada ID referenciado existe | |
| CA-7 | La sección de pricing mantiene los 3 planes con features, precios y CTAs intactos | Comparación del bloque de pricing vs. original | |
| CA-8 | No se modificaron nav, footer, FAB, ni otras páginas | Comparación de nav/footer/FAB entre HTML viejo y nuevo | |
| CA-9 | El skip-link sigue funcionando (apunta a #contenido) | Verificación en DOM | |
| CA-10 | El sistema de diseño se mantiene: tokens de color, tipografía, espaciado sin cambios | Auditoría de clases CSS usadas vs. tokens existentes | |

---

## 8. Lo que NO Cambia

| Elemento | Estado |
|----------|--------|
| Nav (líneas 41–66) | Sin cambios |
| Footer (líneas 380–396) | Sin cambios |
| WhatsApp FAB (líneas 374–377) | Sin cambios |
| Skip link (línea 38) | Sin cambios |
| Head / meta tags (líneas 1–34) | Sin cambios |
| Script (línea 398) | Sin cambios |
| proyectos.html | Sin cambios |
| contacto.html | Sin cambios |
| Tokens.css, base.css, layout.css, components.css, pages.css, animations.css | Sin cambios (salvo que sea estrictamente necesario para el reordenamiento) |
| Copy de testimonios (quotes, nombres, roles, fuentes, fechas) | Sin cambios |
| Copy de pricing (planes, features, precios) | Sin cambios |
| Copy de FAQ (preguntas y respuestas) | Sin cambios |
| Copy de proceso (3 pasos) | Sin cambios |
| Copy de hero (título, subtítulo, CTAs) | Sin cambios |
| Copy de proyectos (descripciones, links a demo) | Sin cambios |
| Identidad visual (DESIGN.md) | Sin cambios |

---

## 9. Dependencias y Riesgos

**Dependencias:**
- Ninguna. Todo el contenido ya existe en index.html. No hay llamadas a APIs, no hay assets nuevos, no hay diseño nuevo.

**Riesgos conocidos:**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Duplicación de "3 negocios activos" entre Stats y panel "Después" | Alta | Bajo | Eliminar del panel "Después" (ya documentado en CA-4) |
| Sección de Problem queda muy "vacía" con solo 4 items | Media | Bajo | Los 4 items ya funcionan como block de contenido. No es necesario agregar nada. El foco es la claridad del problema, no la cantidad de texto. |
| Pricing antes del CTA puede parecer agresivo | Baja | Medio | La sección ya existe con tono "inversión accesible". Se mantiene el mismo tono. El usuario que llega al pricing ya vio toda la evidencia. |

---

## 10. Notas de Copy (Tono del Design System)

Todo copy propuesto o ajustado debe seguir el tono definido en DESIGN.md sección 20:
- **Directo, claro, profesional, técnico. Sin exageraciones.**
- Segunda persona ("tu negocio", "vost")
- Sage como acento visual, no como tono de copy
- Sin emojis en el código
- Sin superlativos vacíos ("el mejor", "increíble", "revolucionario")

Los títulos H2 sugeridos en este PRD ya están escritos en este tono. Cualquier ajuste adicional debe validarse contra esta regla.
