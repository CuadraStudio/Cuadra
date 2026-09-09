# Verificación de Logo CUADRA — v5 (nuevos SVGs, ratio 3.34:1)

**Run**: CUADRA dark-first · Verificación visual de logos actualizados · Attempt 1/2
**Fecha**: 2026-09-08
**Servidor**: http://127.0.0.1:8899 (200 en /index.html, /proyectos.html, /contacto.html, /favicon.svg, /img/logo_white.svg)
**Evidencia**: `C:\Users\fedem\Desktop\js\Webs\.orion\gates\screenshots\v5-logo\`

---

## 1. Veredicto: **PASS CON HALLAZGOS**

El logo nuevo **renderiza correctamente** (cargado, visible, centrado, sin overflow, contraste AAA) en nav y footer de las 3 páginas, desktop y mobile, y el favicon se sirve OK. **PERO** la altura renderizada creció de ~31px → **39.6px** (ratio nuevo), lo que cambia la proporción del wordmark en el nav/footer. No está roto; es un desvío de la proporción de diseño original que requiere decisión del cliente.

---

## 2. Evidencia por página y zona

### Datos computados (idénticos en index/proyectos/contacto — `geometry.json`)

| Zona | Desktop (1440) | Mobile (375) |
|---|---|---|
| Nav height (`.nav`) | 72px | 72px |
| Logo nav (`.nav__logo-img`) | **132 × 39.6px**, x=48, y=15.7 | **132 × 39.6px**, x=16, y=15.7 |
| Link nav (`.nav__logo`) | 148 × 57.6px (img + padding 9px) | idem |
| Centrado vertical del logo en nav | img center 35.5 vs nav center 36 → **0.5px de desvío** | idem |
| Logo footer (`.footer__logo-img`) | **132 × 39.6px**, x=48 | **132 × 39.6px**, x=121.5 (centrado: center 187.5 = 375/2) |
| `naturalWidth/Height` (SVG real) | 528 × 158 → ratio **3.342:1** | idem |
| Loaded / opacity / display | `true` / 1 / block | idem |
| Overflow horizontal | **NO** (docScrollWidth = innerWidth = 1440) | **NO** (= 375) |
| Hamburger (mobile) | — | x=315, w=44, right=359 → **167px de gap** con logo (right=148). Sin choque |
| Storage attrs HTML | `width="132" height="31"` (ahora inconsistentes, ver hallazgo 2) | idem |

### Favicon
- `/favicon.svg` → **200**, `image/svg+xml`, 303 B, referenciado en las 3 páginas (`<link rel="icon">` línea 20).
- Contenido verificado vía fetch: `rect #0F1111` + path `#AFC8C2` (sage) → forma "cuadra" correcta en el código fuente.

### Contraste (verificado por píxeles y tokens)
- Nav bg = footer bg = `rgb(15,17,17)` = `--color-black: #0F1111`.
- Fill del logo = `#ffffff`. **Contraste = 21:1** (AAA) — obvio, sin problemas.

### Rasterización (evidencia objetiva de "no blank/no roto")
- Muestreo de píxeles vía canvas (@ fase raster del SVG, ambas instancias nav/footer):
  - `nonBlank: true`, tinta blanca presente, bbox de tinta 525×157 (≈ frame completo del SVG).
  - Línea media del glyph: 1 corrida continua de tinta de 53px (pared vertical del bloque izquierdo de "¬=") → **la forma "cuadra" se dibuja**, no es un rectángulo vacío ni un archivo roto.

### Screenshots capturados (para inspección humana posterior)
- `desktop-{index,proyectos,contacto}-full.png` (1440×900, full-page)
- `mobile-{index,proyectos,contacto}-full.png` (375×812, full-page)
- `desktop-{...}-nav.png` / `-navlogo.png` / `-footer.png` · `mobile-{...}-nav.png` / `-navlogo.png` / `-footer.png`

---

## 3. Hallazgos con severidad + fix mínimo

### 🔴 M1 — Altura del logo renderizada a 39.6px en vez de ~31px (proporción del wordmark alterada)
**Evidencia**: `geometry.json` — `.nav__logo-img` y `.footer__logo-img` = 132 × **39.6px** en las 3 páginas × ambos viewports (antes ~31px con ratio 4.3:1; el nuevo ratio 3.342:1 con `width:132px; height:auto` da 39.6px). El logo ocupa **55% del alto del nav** (72px).
**Impacto**: No rompe layout (centrado, sin overflow, sin choque con hamburguesa), pero el wordmark queda ~28% más alto del tamaño de diseño original; en mobile ocupa espacio notable dentro de un nav de 72px.
**Fix mínimo propuesto** (1 línea de CSS, 2 archivos — no aplicado, solo recomendación):
```css
.nav__logo-img, .footer__logo-img { width: 104px; height: auto; } /* 104/3.342 ≈ 31.1px */
```
o, para altura exacta:
```css
.nav__logo-img, .footer__logo-img { width: auto; height: 31px; }
```

### 🟡 M2 — Atributos HTML obsoletos `width="132" height="31"` (mienten sobre el render real)
**Evidencia**: los 6 `<img>` (nav+footer × 3 páginas) declaran `height="31"`, que con `height:auto` en CSS no se respeta y el render real es 39.6px. El HTML describe una geometría que ya no existe.
**Impacto**: Bajo en runtime (el CSS manda), pero mantiene expectativas incorrectas y puede causar layout shift si alguien remueve `height:auto`.
**Fix mínimo**: actualizar los atributos al tamaño elegido (p.ej. `width="104" height="31"`) en las 3 páginas, o eliminar `height` ya que CSS define `height:auto`.

### 🟢 Información — `logo_white.svg` conserva dimensión intrínseca en milímetros
**Evidencia**: `<svg width="139.75632mm" height="41.926643mm" viewBox="0 0 139.75631 41.926643">`.
El render se resuelve por el ratio del viewBox (bien), pero las unidades `mm` en un asset web no son estándar; riesgo futuro de interpretación distinta según el consumidor.
**Fix opcional**: exportar sin `width/height` (solo `viewBox`), o en px.

---

## 4. Nota honesta sobre el método de inspección

**Este modelo NO tiene capacidad de visión** (big-pickle no soporta input de imágenes). **NO hubo inspección visual humana/IA de los screenshots.** El veredicto se basa en:
1. **DOM/geometría computada** (`getBoundingClientRect` en Chromium 1.55 real, 3 páginas × 2 viewports).
2. **Muestreo de píxeles programático** (rasterización del SVG a canvas: prueba de que hay tinta, forma y color correctos).
3. **Gráfics servidos** (HTTP 200, tipos y contenidos verificados).

Los screenshots quedaron guardados en `v5-logo\` **para que un revisor con visión confirme** la percepción estética (equilibrio visual del nav, "look" del logo a 39.6px). Las medidas objetivas ya no son opinables; la estética fina sí queda pendiente de un par de ojos.

---

## Resumen
| Check | Resultado |
|---|---|
| Logo renderiza (nav/footer × 3 págs) | ✅ PASS |
| Alineación vertical en nav | ✅ 0.5px de desvío (prácticamente perfecto) |
| Tamaño proporcional al diseño original | ❌ **HALLAZGO M1** (39.6px vs ~31px) |
| Overflow horizontal | ✅ Ninguno |
| Mobile: logo vs hamburguesa | ✅ Gap 167px, sin choque |
| Favicon | ✅ 200/303B, contenido correcto |
| Contraste #fff s/ #0F1111 | ✅ 21:1 (AAA) |