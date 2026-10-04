# CUADRA — Dirección artística v2: "Plano de manzana"

Análisis de la web actual + dirección visual propuesta. No cambia el código todavía: es la base para aprobar antes de implementar.

---

## 1. Diagnóstico

Se revisaron `index-web.html` (home real), `index.html` (teaser), `productos`, `proyectos`, `contacto`, `diferencias`, `css/*` y `DESIGN.md`.

**Lo que funciona (se conserva)**
- Isotipo geométrico fuerte y propio (esquinas/ángulos rectos): es el mejor activo de la marca.
- Paleta contenida (black / graphite / sage / mist / warm white / concrete) y tono arquitectónico.
- Estructura editorial con índices `01 —`, coordenadas `34.90°S / 56.16°W`, metabar de estado. Buen vocabulario, poco explotado.
- Accesibilidad sólida (contrastes documentados, skip link, focus).

**Lo que debilita el diseño**
1. **Monotonía total.** Todo es negro sobre negro; cada sección repite la misma fórmula (índice + lede + grilla + línea divisoria). No hay ritmo, clímax ni respiración. Las variantes `.section--light` y `.section--mist` existen en `tokens.css` pero no se usan en la home: la proporción real es ~95 % black / 3 % graphite / <2 % sage, muy lejos del 40/20/20/10/5/5 que define el propio sistema.
2. **Hero sin ancla visual.** Titular grande a la izquierda y media pantalla vacía a la derecha; solo un botón blanco flotando. El isotipo y la idea de "cuadra" no aparecen en ningún gráfico.
3. **Sage como color de una palabra.** El acento solo tiñe media frase del h1 y los círculos del stepper. No guía la vista ni marca jerarquía.
4. **Tarjetas de demo genéricas.** Cajas grises iguales, título en mayúsculas con tracking enorme (contradice `DESIGN.md`: titulares en sentence case, peso 600), screenshot plano sin marco ni contexto. Son la prueba más vendedora del sitio y se ven como un listado.
5. **Tipografía inconsistente con su propio sistema.** `tokens.css` todavía declara peso 300 y `--letter-spacing-interface: 0.38em`, mientras `DESIGN.md` dice 600 / 0.04–0.14em. Botones con tracking muy ancho reducen legibilidad y "gritan" igual que los títulos.
6. **Escala plana.** Display ≈ 60 px máx. contra cuerpo 16 px; falta el contraste dramático que hace "editorial" a un sitio. Labels de 11–12 px en gris sobre negro, muy débiles.
7. **Stepper y FAQ estándar.** Círculos con número + línea: patrón de plantilla. FAQ correcta pero sin personalidad.
8. **`productos.html` ≈ 11.000 px de alto**, todo con el mismo peso visual: planes, extras, transparencia y FAQ se leen igual. Falta jerarquía entre "entender", "comparar" y "configurar".
9. **Contacto y subpáginas:** hero a la izquierda con mitad derecha vacía; formulario correcto pero anónimo.
10. **Teaser (`index.html`):** tres botones apilados de ancho distinto (desprolijo); footer con una sola columna perdida a la izquierda.
11. **Detalles:** botón flotante de WhatsApp cuadrado, a mitad de pantalla, pisa contenido; muchos `style="..."` inline que rompen el sistema; footer "Elsewhere" mezcla inglés/español.

---

## 2. Concepto

> **CUADRA = una cuadra de ciudad: una unidad medida, construida pieza por pieza.**
> El sitio se siente como **un plano de obra editorial**: grilla visible, esquinas de replanteo, cotas y coordenadas, sobre un fondo oscuro que de pronto se abre en bandas claras como una fachada iluminada.

Referencias mentales: plano arquitectónico, revista de arquitectura, señalética urbana uruguaya, ingeniería digital (no "tech startup" ni SaaS).

**Tres palabras guía:** *Medido · Estructural · Sobrio-con-carácter.*

---

## 3. Los 6 principios visuales

### 3.1 La grilla se ve
- Líneas hairline verticales (1 px, `rgba(242,241,237,.06)`) que marcan 12 columnas como fondo del hero y de secciones clave.
- **Marcas de esquina** (`⌐ ¬ └ ┘`, derivadas del isotipo) en tarjetas, imágenes y bloques destacados, en vez de bordes redondeados cerrados.
- Cotas y etiquetas técnicas: `01 —`, `M.01`, `34.90°S / 56.16°W`, `5–10 d.h.`, alineadas a la grilla.

### 3.2 Escala dramática
- Display hero: `clamp(3rem, 9vw, 8.5rem)`, peso 600, tracking −0.03em, line-height 0.95.
- Titulares de sección: `clamp(2rem, 5vw, 4rem)` en vez de una etiqueta diminuta como único encabezado.
- Labels: 11–12 px, mayúsculas, tracking 0.12em, **concrete claro** (no más grises débiles).
- Regla: cada pantalla tiene **un solo elemento enorme** y todo lo demás es pequeño y preciso.

### 3.3 Ritmo de superficies (usar la paleta real)
Secuencia propuesta para la home:

| Bloque | Superficie | Por qué |
|---|---|---|
| Hero | Black + grilla + isotipo gigante | Entrada |
| Líneas de producto | Black, tarjetas con esquinas | Continuidad |
| Cómo trabajamos | **Mist** (texto black) | Respiro, "se enciende la luz" |
| Demos | **Graphite**, mockups grandes | Foco en la prueba |
| FAQ | Warm white | Lectura cómoda |
| CTA final | **Sage sólido**, texto black, full-bleed | El único momento de sage masivo |
| Footer | Black | Cierre |

Esto cumple por fin la proporción del sistema de diseño.

### 3.4 Sage como señal, no como adorno
- Un solo acento sage por viewport: CTA primario, estado activo o dato clave.
- Sage masivo únicamente en el CTA final. Sobre claros se usa `--color-accent-ink` (#3E6B62) ya definido.

### 3.5 Imagen = evidencia
- Demos dentro de un **marco de navegador minimal** (hairline + 3 puntos) con marcas de esquina, recortadas en ángulo de 3/4, ocupando 1 columna completa en desktop (no 4 cajitas iguales). Alternar izquierda/derecha.
- Hover: el screenshot se desplaza (scroll interno simulado) + etiqueta `Ver demo →`.
- Overlay de datos por demo: línea de producto, rubro, "5–10 días", a modo de ficha técnica.
- `loading="lazy"` se mantiene, pero reservar `aspect-ratio` para evitar cajas vacías.

### 3.6 Movimiento con intención
- Hero: las esquinas del isotipo se "dibujan" (stroke-dashoffset) y la grilla aparece línea por línea (600–900 ms, `--ease-out`).
- Secciones: índice `01 —` y línea divisoria se dibujan al entrar; texto con `clip-path` inferior, no fade genérico.
- Stepper: línea de progreso que avanza con el scroll.
- Todo respeta `prefers-reduced-motion` (ya existe `animations.css`).

---

## 4. Sistema tipográfico (ajustes)

Mantener Montserrat como única familia principal. Cambios:

- **Sincronizar `tokens.css` con `DESIGN.md`**: pesos 600/400/500, eliminar `--letter-spacing-interface: 0.38em` (bajar a 0.12em) y los `font: 300 …`.
- **Botones**: 600, 13–14 px, tracking 0.06em (hoy parecen 0.3em), altura 52 px.
- **Títulos de tarjeta**: sentence case, 600, −0.01em (no mayúsculas).
- **Decisión abierta:** añadir una mono (p. ej. *JetBrains Mono* o *IBM Plex Mono*, 400) **solo** para coordenadas, índices, precios y cotas. Refuerza el lenguaje de plano. Sin ella, se resuelve con Montserrat 500 + tracking.

---

## 5. Componentes clave (especificación)

- **Botón primario:** sage sólido, texto black, radio 2 px, flecha que se desplaza 4 px en hover; en bandas claras: black sólido con texto warm white.
- **Botón secundario:** hairline 1 px + marcas de esquina que se cierran al hover (efecto "encuadrar").
- **Tarjeta de línea (Agenda/Tienda/Restó/Consulta):** sin caja; 4 columnas separadas por hairlines, número grande `01` en outline, título 600, texto corto, flecha. Hover: fondo graphite + línea sage superior.
- **Stepper:** 3 columnas con número gigante (6rem, outline), conectadas por línea hairline que se dibuja.
- **Pricing (productos):** tabla tipo ficha técnica; plan recomendado con marca de esquina sage; precio en mono/tabular.
- **FAQ:** `+` → rotación a `×`, índice `Q.01`, respuesta con borde izquierdo sage 2 px.
- **Metabar:** se mantiene (es un gran rasgo editorial), con punto de estado animado muy sutil.
- **WhatsApp FAB:** circular 56 px, esquina inferior derecha, sin tapar contenido; sage sobre oscuro.
- **Formulario:** inputs con solo línea inferior (hairline) y label flotante; foco = línea sage 2 px.

---

## 6. Dirección por página

- **Home (`index-web.html`)**: hero con grilla + isotipo gigante recortado a la derecha y titular enorme; ritmo de bandas de §3.3; demos como 4 "filas" con marco de navegador; CTA sage full-bleed.
- **Productos**: dividir visualmente en 3 actos con encabezados grandes — *Entender* (black) → *Comparar* (mist, tabla de planes) → *Configurar* (graphite, configurador). Sticky mini-nav lateral con los actos. Reducir altura ~30 % con tabs/acordeones en Transparencia y Extras.
- **Proyectos**: mismo componente de demo que la home, en filas alternadas, con ficha técnica.
- **Diferencias**: valores como lista tipográfica numerada enorme (01–0N), sin cajas.
- **Contacto**: hero partido 50/50 (titular a la izquierda, datos de contacto a la derecha en grande); formulario de líneas inferiores.
- **Teaser (`index.html`)**: isotipo grande animado al centro, botones en una fila (WhatsApp sage + 2 secundarios), footer centrado.
- **404 / legales / blog**: heredan header, metabar y footer; tipografía de lectura a 68 ch máx.

---

## 7. Hoja de ruta propuesta

| Fase | Alcance | Riesgo |
|---|---|---|
| **1 — Fundaciones** | Sincronizar `tokens.css` con `DESIGN.md`; nuevos tokens (hairline grid, corner marks, escala display); botones y tipografía; retirar `style=""` inline | Bajo |
| **2 — Home** | Hero, ritmo de bandas, líneas, stepper, demos, CTA sage, FAB | Medio |
| **3 — Páginas** | Productos, Proyectos, Diferencias, Contacto, Teaser | Medio |
| **4 — Motion y pulido** | Animaciones de trazo, hover, reduced-motion, performance (Lighthouse) y regresión de contrastes | Bajo |

Criterios de aceptación: contraste AA en todas las bandas, CLS ≈ 0 (aspect-ratio en imágenes), sin dependencias nuevas salvo la fuente mono opcional, sitio sigue siendo HTML/CSS/JS vanilla.

---

## 8. Decisiones que necesito de ti

1. ¿Aprobás el concepto "Plano de manzana" (grilla visible + esquinas + bandas claras)?
2. ¿Sumamos fuente monoespaciada para cotas/precios, o nos quedamos solo con Montserrat?
3. ¿Bandas claras (mist / warm white) en la home, o preferís mantener el sitio 100 % oscuro?
4. ¿Empiezo por Fase 1 + Home, o por otra página?
