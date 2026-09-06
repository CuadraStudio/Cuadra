# CUADRA — Informe de Performance (Stage 11)

**Fecha**: 2026-09-05
**Alcance**: Sitio estático de 3 páginas (`index.html`, `proyectos.html`, `contacto.html`) — dark-first, sin framework.
**Método**: Medición local con Chrome 126 (Playwright CDP) sobre `http://127.0.0.1:8899`, 3 corridas cold-cache por página. Mobile = viewport 390×844 dpr3 + throttling de red (RTT 150ms, ~1.6 Mbps) + 4× CPU. Desktop = 1440×900, sin throttle, más una pasada con 4× CPU para referencia. **No hay RUM (Real User Monitoring) ni deploy remoto aprobado**: todos los valores de CWV son de laboratorio sobre servidor local; la extrapolación a producción se marca como *estimada*.

---

## 1. Resumen ejecutivo — Veredicto Core Web Vitals

| Métrica | Umbral (verde) | Desktop (lab) | Mobile (lab, throttled) | Veredicto |
|---|---|---|---|---|
| **LCP** | ≤ 2.5s | 0.11–0.17s (0.38–0.88s con 4× CPU) | 1.27–2.34s (peor corrida: proyectos) | 🟢 **Verde** |
| **INP** | ≤ 200ms | no medible de forma útil (página casi estática) | 16–120ms según interacción | 🟢 **Verde** |
| **CLS** | ≤ 0.1 | 0.0001–0.0055 | 0.0000 | 🟢 **Verde** |
| **TTFB** | ≤ 800ms | 2–45ms (local; *estimado* 100–300ms en producción) | 2–66ms (local; *estimado* 100–300ms en producción) | 🟢 **Verde** |

**Veredicto global: 🟢 PASS — Core Web Vitals en verde para el target desktop + mobile**, con LCP mobile holgadamente por debajo del umbral en la mayoría de corridas. Riesgo residual: ver Hallazgo F4 (PNG de 1.07 MB) — es el único factor que puede empujar LCP hacia el umbral en conexiones lentas reales.

> ⚠️ **Nota de confianza**: valores de laboratorio sobre localhost. En producción (Render + TLS + CDN de Google Fonts externo) el TTFB y el LCP reales dependerán del cold-start de Render y de la latencia del usuario. Recomendado validar con PageSpeed Insights / CrUX una vez haya deploy aprobado.

---

## 2. Métricas por página

### index.html (home)

| Métrica | Run 1 | Run 2 | Run 3 | Mediana | Estado |
|---|---|---|---|---|---|
| **LCP desktop** (medido) | 172ms (H1 hero) | 116ms (H1 hero) | 108ms (H1 hero) | **116ms** | 🟢 |
| **LCP desktop 4×CPU** (medido) | 880ms (nav logo) | — | — | 880ms | 🟢 |
| **LCP mobile throttled** (medido) | 1468ms (H1 hero) | 1452ms (H1 hero) | 1420ms (nav logo) | **1452ms** | 🟢 |
| **CLS desktop** (medido) | 0.00006 | 0.00006 | 0.00546 | **0.00006** | 🟢 |
| **CLS mobile** (medido) | 0.00000 | 0.00000 | 0.00000 | **0.00000** | 🟢 |
| **INP mobile** (medido, tap menú) | 24ms | 24ms | 32ms | **24ms** | 🟢 |
| **FCP desktop / mobile** (medido) | 144 / 1188ms | 84 / 1156ms | 80 / 1420ms | 84 / 1188ms | 🟢 |
| **TTFB local** (medido) | 45ms | 11ms | 10ms | **11ms** | 🟢 |
| **DCL / Load desktop** (medido) | 116 / 181ms | 63 / 123ms | 58 / 94ms | 63 / 123ms | — |
| **DCL / Load mobile throttled** (medido) | 1186 / 1327ms | 1158 / 1310ms | 1424 / 1446ms | 1186 / 1310ms | — |

### proyectos.html

| Métrica | Run 1 | Run 2 | Run 3 | Mediana | Estado |
|---|---|---|---|---|---|
| **LCP desktop** (medido) | 116ms (H1 hero) | 108ms (H1 hero) | 104ms (H1 hero) | **108ms** | 🟢 |
| **LCP desktop 4×CPU** (medido) | 504ms (nav logo) | — | — | 504ms | 🟢 |
| **LCP mobile throttled** (medido) | 1284ms (H1 hero) | 1296ms (H1 hero) | 2344ms (H1 hero) | **1296ms** | 🟢 |
| **CLS desktop** (medido) | 0.00546 | 0.00546 | 0.00546 | **0.00546** | 🟢 |
| **CLS mobile** (medido) | 0.00000 | 0.00000 | 0.00000 | **0.00000** | 🟢 |
| **INP mobile** (medido, tap menú) | 24ms | 16ms | 16ms | **16ms** | 🟢 |
| **FCP desktop / mobile** (medido) | 92 / 1028ms | 84 / 1036ms | 76 / 2092ms | 84 / 1036ms | 🟢 |
| **TTFB local** (medido) | 15ms | 10ms | 10ms | **10ms** | 🟢 |
| **DCL / Load desktop** (medido) | 70 / 104ms | 62 / 95ms | 59 / 93ms | 62 / 95ms | — |
| **DCL / Load mobile throttled** (medido) | 1027 / 6660ms* | 1037 / 6616ms* | 2108 / 7684ms* | 1037 / 6616ms* | ⚠️ ver nota |

\* El `load` mobile de proyectos está inflado por la descarga de `img/thefaleros.png` (1.07 MB, 5.6s en el throttling) — el evento `load` espera a la primera imagen del grid. **No afecta LCP** (imagen lazy por debajo del fold inicial), pero explica la cola de descarga.

### contacto.html

| Métrica | Run 1 | Run 2 | Run 3 | Mediana | Estado |
|---|---|---|---|---|---|
| **LCP desktop** (medido) | 96ms (nav logo) | 96ms (nav logo) | 92ms (nav logo) | **96ms** | 🟢 |
| **LCP desktop 4×CPU** (medido) | 380ms (nav logo) | — | — | 380ms | 🟢 |
| **LCP mobile throttled** (medido) | 1388ms | 1272ms (H1 hero) | 1296ms (H1 hero) | **1296ms** | 🟢 |
| **CLS desktop** (medido) | 0.00542 | 0.00542 | 0.00542 | **0.00542** | 🟢 |
| **CLS mobile** (medido) | 0.00000 | 0.00000 | 0.00000 | **0.00000** | 🟢 |
| **INP mobile** (medido) — submit vacío | 56ms | 64ms | 24ms | **56ms** | 🟢 |
| **INP mobile** (medido) — submit completo (validación + open WhatsApp) | 120ms | 104ms | — | **112ms** | 🟢 |
| **FCP desktop / mobile** (medido) | 96 / 1388ms | 96 / 1004ms | 92 / 1064ms | 96 / 1064ms | 🟢 |
| **TTFB local** (medido) | 10ms | 11ms | 10ms | **10ms** | 🟢 |
| **DCL / Load desktop** (medido) | 61 / 101ms | 64 / 117ms | 60 / 112ms | 61 / 112ms | — |
| **DCL / Load mobile throttled** (medido) | 1448 / 1554ms | 1006 / 1370ms | 1068 / 1377ms | 1068 / 1377ms | — |

**Elementos LCP observados**: H1 del hero (`.hero__title`) en la mayoría de corridas; en mobile la animación `reveal` (opacity 0 → visible) hace que a veces gane el logo del nav (`.nav__logo`) como LCP hasta que el H1 aparece. Ambos son texto, por lo que el LCP incluye el swap de fuente (FOUT con `display=swap`).

---

## 3. Análisis de peso

**Servidor local sin compresión** (verificado: `Content-Encoding` vacío en HTML/CSS/PNG) → **transfer size ≈ peso en disco** para assets locales. En producción, Render no comprime por defecto; asumir el mismo peso salvo CDN/proxy configurado.

### Peso de assets (medido en disco / transfer)

| Asset | Peso | Transfer (lab, run1 desktop) | Notas |
|---|---|---|---|
| `index.html` | 23.2 KB | 23.2 KB | Sin compresión |
| `proyectos.html` | 13.0 KB | 13.0 KB | Sin compresión |
| `contacto.html` | 9.8 KB | 9.8 KB | Sin compresión |
| `css/tokens.css` | 10.2 KB | 10.5 KB | Render-blocking |
| `css/base.css` | 3.6 KB | 3.9 KB | Render-blocking |
| `css/layout.css` | 3.7 KB | 4.0 KB | Render-blocking |
| `css/components.css` | 26.8 KB | 27.1 KB | Render-blocking, el más pesado |
| `css/pages.css` | 13.0 KB | 13.3 KB | Render-blocking |
| `css/animations.css` | 1.7 KB | 2.0 KB | Render-blocking |
| **CSS total** | **58.9 KB** | ~60.8 KB al transferir | 6 requests render-blocking |
| `js/main.js` | 9.0 KB | 9.3 KB | `defer` — no bloquea |
| `img/thefaleros.png` | **1,070.7 KB** | 1,096.7 KB | 1280×6077 px |
| `img/sagastudio.png` | 391.3 KB | 401.0 KB | 1280×5772 px |
| `img/ccescostudio.png` | 461.4 KB | 472.4 KB | 1280×5123 px |
| `favicon.svg` + `assets/*.svg` | 1.0 KB | 0.6 KB | Insignificante |
| **Fuentes Google (WOFF2, estimado)** | Space Grotesk ~22 KB + Inter ~47 KB (latin default), +variantes 500/600 si se usan (~10–25 KB c/u, *estimado* de archivos individuales; no se capturó transfer real en los runs throttled porque resource timing los reportó en 0) | — | Codificadas en la hoja `fonts.googleapis.com/css2?...` (solo latin: 10 @font-face declarados, el navegador descarga solo los subsets usados) |

### Total por página (transfer, lab, cold-cache desktop)

| Página | HTML | CSS | JS | Imágenes PNG | Fonts (estimado) | **Total transfer** |
|---|---|---|---|---|---|---|
| `index.html` | 23.2 KB | 60.8 KB | 9.3 KB | thefaleros 1,096.7 + saga 401.0 (+ccesco 472.4 si el viewport lo pide, sí en 1440px) ≈ **1.97 MB** | ~70–100 KB | **≈ 2.15 MB** (peso transferido real medido: 1.57 MB en run donde ccesco quedó lazy; 1.57–2.03 MB según viewport) |
| `proyectos.html` | 13.0 KB | 60.8 KB | 9.3 KB | thefaleros 1,096.7 + saga 401.0 ≈ **1.50 MB** | ~70–100 KB | **≈ 1.63 MB** (medido 1.57 MB) |
| `contacto.html` | 9.8 KB | 60.8 KB | 9.3 KB | — (sin imágenes) | ~70–100 KB | **≈ 150–180 KB** (medido 71.8 KB sin fonts en resource timing + fonts estimadas) |

### Peso por categoría (todo el sitio, disco)

- **Imágenes PNG: 1,969 KB (96.6%)** ← dominante
- CSS: 58.9 KB, HTML: 46.0 KB, JS: 9.0 KB, SVGs: 1.0 KB

**Conclusión de peso**: el sitio transfiere ~1.5–2.1 MB por página principalmente por **3 screenshots PNG gigantes** que se renderizan en tarjetas de ~16:9. El texto/CSS/JS es liviano. Las fuentes externas agregan ~2 requests de WOFF2 (~70 KB) — correcto pero con latencia de tercer dominio.

---

## 4. Hallazgos concretos

- **F1 — PNGs sobredimensionados (impacto alto)** *(medido)*: `thefaleros.png` (1280×6077, **1.07 MB**), `ccescostudio.png` (1280×5123, 461 KB), `sagastudio.png` (1280×5772, 391 KB). Se muestran en `.card__image` con `aspect-ratio: 16/9` (components.css): el navegador descarga el PNG completo (5.6s en mobile throttled) pero solo muestra un crop de ~16:9. Peso real necesario: ~30–80 KB por imagen en WebP/AVIF o PNG recortado a la proporción mostrada.
- **F2 — Sin compresión del servidor (impacto medio-alto)** *(medido)*: HTML, CSS y JS se sirven sin `Content-Encoding` (gzip/brotli ausentes). Un `components.css` de 26.8 KB pasaría a ~7–8 KB con gzip/brotli. En producción, Render sirve estáticos sin comprimir por defecto.
- **F3 — 6 CSS render-blocking separados (impacto medio)** *(medido)*: `tokens/base/layout/components/pages/animations` = 6 requests paralelos (HTTP/1.1 = 6 round-trips) y todo el CSS debe parsearse antes del primer paint. `components.css` (26.8 KB) + `pages.css` (13 KB) son los dos más pesados. Opciones: concatenar, o convertir a `media` no crítico lo que no aplique arriba del fold.
- **F4 — LCP con dependencia de fuente externa (impacto medio)** *(medido/estimado)*: el LCP es texto (H1 hero) con Space Grotesk vía Google Fonts. Con TTFB de producción (*estimado*) + CSS de fonts render-blocking + descarga del WOFF2, el LCP mobile real probablemente quede en ~1.5–2.5s — verde pero con poca holgura. El `display=swap` evita FOIT (bloqueo de texto invisible) pero produce **FOUT** (texto en fallback → swap) que, combinado con la animación `reveal` (opacity), enmascara parcialmente el swap. No se observó FOIT.
- **F5 — CLS residual por swap de fuente del nav (impacto bajo)** *(medido)*: CLS desktop 0.0054–0.0055, origen en `nav__links`/`nav__link` — el nav usa Space Grotesk y el swap de fuente desplaza levemente los links al pintarse. Por debajo del umbral 0.1, sin acción requerida.
- **F6 — `load` mobile de proyectos muy alto (impacto bajo)** *(medido)*: el evento `load` espera a `thefaleros.png` (1.07 MB) → 6.6–7.7s en throttling. No afecta CWV (lazy), pero daña perceived performance y métricas secundarias (p.ej. TBT de auditorías).
- **F7 — Google Fonts sin `preload` (impacto bajo-medio)** *(estimado)*: el CSS de fonts (render-blocking) debe descargarse antes de que el navegador conozca los WOFF2; no hay `<link rel="preload">` para los archivos críticos. Añadir preload del WOFF2 de Space Grotesk (latin) recortaría el camino crítico. Los `preconnect` ya están presentes y correctos.
- **F8 — Sin optimizaciones de formato moderno (impacto medio)** *(medido/estimado)*: no hay `srcset`/`sizes`, ni imágenes WebP/AVIF, ni `width`/`height` explícitos en los `<img>` (mitigado por `aspect-ratio` en CSS, que ya evita CLS de imágenes).

---

## 5. Recomendaciones priorizadas

| Prioridad | Acción | Impacto estimado | Esfuerzo | Notas |
|---|---|---|---|---|
| **P1** | Comprimir/recortar los 3 PNGs: recortar a la proporción mostrada (~16:9) y exportar WebP/AVIF (~30–80 KB c/u) | **−1.9–2.0 MB por página** (−95% del peso de imágenes); LCP mobile mejora ~350–900ms en conexiones lentas; `load` de proyectos pasa de 6.6s a <1.5s | Bajo (regenerar screenshots) | El mayor win posible; ataca F1 y F6 |
| **P1** | Habilitar compresión (gzip/brotli) en el host estático (Render: middleware o CDN con compresión) | −70–80% en HTML/CSS/JS (~60–70 KB → ~15–20 KB por página); mejora TTFB percepción y reduce transfer | Bajo (config) | Ataca F2 |
| **P2** | Añadir `<link rel="preload" as="font">` para los WOFF2 críticos (Space Grotesk latin + Inter 400 latin) | LCP mobile −100–300ms; menos FOUT en el H1 | Bajo | Solo 1–2 archivos; ataca F4 |
| **P2** | Concatenar/minificar los 6 CSS (o al menos los 3 más grandes) en 1–2 archivos | −1–2 round-trips y menos parseo antes del primer paint; with gzip, ~−15 KB | Bajo-medio | Ataca F3 |
| **P2** | Agregar `srcset`/`sizes` y `width`/`height` en las 3 `<img>` (WebP 1x/2x) | Carga el tamaño correcto según viewport/dpr (mobile no descarga la versión de 5,077–6,077 px de alto) | Medio | Complementa P1; ataca F8 y F1 |
| **P3** | Evaluar self-hosting de las fuentes (woff2 locales, subset latino) | Elimina latencia de tercer dominio y dependencia de Google Fonts; ~−0–100ms TTFB font | Medio | Ataca F4/F7; opcional si se conserva Google Fonts |
| **P3** | Considerar `loading="lazy"` ya presente + `fetchpriority="high"` para el H1/fuente crítica | Prioriza el recurso que alimenta el LCP | Bajo | Micro-tuning; revisar tras P1 |

**Prioridad recomendada**: ejecutar P1 (imágenes) y P2 (compresión) antes que cualquier micro-tuning — son los únicos que mueven la aguja de forma significativa. El resto del sitio (CSS 59 KB, JS 9 KB, sin frameworks, sin librerías) ya es estructuralmente liviano.

---

## 6. Limitaciones de la medición

- **Sin RUM**: INP real de usuarios no medible (no hay analytics ni deploy). Valores INP son de laboratorio con CPU throttle.
- **TTFB local (2–66ms) no representa producción**: Render tiene TLS + cold-start. Estimación *estimada* 100–300ms; dentro del umbral verde de 800ms salvo cold-start extremo.
- **Fonts**: el `transferSize` de los WOFF2 apareció en 0 en resource timing bajo throttling (artifact); el peso de fuentes se marcó como *estimado* desde los archivos descargados individualmente (verificado ~22 KB Space Grotesk + ~47 KB Inter latin default; variantes 500/600 extra si el contenido las usa).
- **Compresión**: la medición es sobre servidor local sin gzip; en producción con CDN/compresión los transfers de texto bajarían.

---
**Performance Benchmarker** · Veredicto: **PASS** · Escalabilidad: OK para tráfico típico de sitio estático (3 páginas, sin backend).