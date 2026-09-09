# CUADRA — Hero: Textura Arquitectónica

> Especificación EJECUTABLE para el Frontend Developer.
> Objetivo: reemplazar el isotipo del hero (`.hero__avatar-wrap`) por una composición de textura arquitectónica de fondo — retícula de plano técnico + grain de hormigón + marca de agua `¬=` + coordenadas de esquina.
> Cero assets nuevos (todo inline/data-URI), cero JS, solo CSS + markup. El resto del sitio no se toca.

**Design read:** dark-first arquitectónico/editorial. La textura es *fondo*, nunca elemento. Todo a opacidades bajas (2–7%) para que el contenido (h1 blanco #F2F1ED) siga dominando y el contraste siga siendo AA. Nada decorativo que compita con la jerarquía.

---

## 1. Estructura de capas del fondo (paint order, bottom → top)

Sobre `.hero` (que ya tiene `position:relative; overflow:hidden; background:var(--color-black)`) se apilan, de abajo hacia arriba:

| # | Capa | Elemento | z-index | Contenido | Opacidad |
|---|------|----------|---------|-----------|----------|
| 0 | Fondo base | `.hero` | 0 | `background: #0F1111` | 100% |
| 1 | **GRID** plano técnico | `.hero::before` | 0 | 4 `repeating-linear-gradient` (celdas chicas 32px + maestras 256px) | ver gradientes |
| 2 | **MARCA DE AGUA** `¬=` | `.hero__texture-mark` (div real) | 0 | SVG inline 3 paths, desborda abajo-derecha, clip por `overflow:hidden` | `0.055` |
| 3 | **COORDENADAS** esquina | `.hero__coords` (div real) | 0 | `34.90°S / 56.16°W`, Space Grotesk mono ancho | `0.5` sobre `--color-concrete` |
| 4 | **CONTENIDO** | `.hero__grid` (existente) | 1 | label / h1 / subtitle / CTAs | 100% |
| 5 | **GRAIN** hormigón | `.hero::after` | 2 | SVG `feTurbulence` inline (data-URI) | `0.05` |

Reglas de convivencia:
- Todas las capas decorativas (1–3) llevan `pointer-events:none`.
- El grain (5) va **por encima del contenido** (z:2 > z:1): es el tratamiento "film" uniforme, opacidad neutra 5%, no degrada contraste (neutro, sin croma) y unifica texto+textura. `pointer-events:none` obligatorio.
- `.hero` ya tiene `overflow:hidden` → la marca de agua que desborda se recorta sola, sin JS.
- No usar `mix-blend-mode` en grid ni marca de agua (colores semi-transparentes directos, más predecible). Grain: `mix-blend-mode` **normal** (recomendado); `overlay`/`soft-light` opcional solo si el plomo se oscurece demasiado.
- Mover la capa radical sage actual del `.hero::after` (wash 5% radial) — se elimina: el grid la reemplaza como textura arquitectónica. No mezclar wash + grid + grain (ruido).

---

## 2. Capa 1 — GRID (`.hero::before`)

Retícula tipo plano técnico: celdas chicas cada `32px` + líneas maestras cada `8 celdas = 256px` (1px de grosor, `square`-feeling). Color de línea: derivado de `--color-graphite` (#292E2D) como tinta, tinte calado hacia blanco.

```css
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* celdas chicas: 1px @ 32px, tinta graphite tenue */
  /* líneas maestras: 1px @ 256px (cada 8 celdas), tinta más fuerte */
  background-image:
    repeating-linear-gradient(to right,  rgba(242, 241, 237, 0.035) 0 1px, transparent 1px 32px),
    repeating-linear-gradient(to bottom, rgba(242, 241, 237, 0.035) 0 1px, transparent 1px 32px),
    repeating-linear-gradient(to right,  rgba(242, 241, 237, 0.07) 0 1px, transparent 1px 256px),
    repeating-linear-gradient(to bottom, rgba(242, 241, 237, 0.07) 0 1px, transparent 1px 256px);
}
```

- **Ángulos:** 0deg (horizontal) y 90deg (vertical) — retícula ortogonal de plano, NO rotada (sin rombo/logo-degradado).
- **Grosor:** 1px fijo en los 4 gradientes.
- **Celdas chicas:** separación `32px`, alpha `0.035` (≈3.5%).
- **Maestras:** separación `256px` (8 × 32px), alpha `0.07` (≈7%).
- Efecto sobre #0F1111: zona de línea ≈ #191C1C (ver §4).

---

## 3. Capa 2 — MARCA DE AGUA `¬=` (`.hero__texture-mark`)

Marcador geométrico original de CUADRA (isotipo viejo) como watermark gigante desbordando a la derecha-abajo. NUNCA como tile ni avatar.

### Markup (añadir dentro de `.hero`, después de `.hero__grid`)

```html
<div class="hero__texture-mark" aria-hidden="true">
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#AFC8C2" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M10 14H45L58 36"/>
      <path d="M16 47H58"/>
      <path d="M16 56H58"/>
    </g>
  </svg>
</div>
```

> Los 3 paths se recuperaron de `assets/cuadra-isotipo.svg` previo al commit `074bb71` (stroke sage `#AFC8C2`). A opacidad `0.055` el sage se lee como gris-verde medio sobre negro, cohesionado con el acento del DS.

### CSS

```css
.hero__texture-mark {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: flex-end;     /* ancla abajo */
  justify-content: flex-end; /* ancla derecha */
  pointer-events: none;
}
.hero__texture-mark svg {
  width: clamp(340px, 52vmin, 640px);
  height: auto;
  opacity: 0.055;            /* muy tenue: dentro de 0.05–0.07, nunca más */
  transform: translate(12%, 14%); /* desborda +12% x / +14% y, se recorta con overflow:hidden */
  color: var(--color-sage);
}
```

- **Tamaño:** `clamp(340px, 52vmin, 640px)` — proporcional al viewport, escala en mobile.
- **Posición:** alineado abajo-derecha con `translate(12%, 14%)` para que el trazo diagonal (`M10 14H45L58 36`) quede cortado por el borde (efecto "plano que continúa fuera del marco").
- **Opacidad exacta:** `0.055`. Rango permitido 0.05–0.07; NO superar 0.07 (pasaría a competir con el h1).
- `aria-hidden="true"`: decoración pura, invisible a lectores de pantalla.

---

## 4. Capa 3 — COORDENADAS de esquina (`.hero__coords`)

Etiqueta técnica de ubicación, refuerza el lenguaje de plano/ingeniería. Se coloca en la esquina inferior-Izquierda (el contenido vive arriba/centro, la esquina queda libre).

### Markup

```html
<div class="hero__coords" aria-hidden="true">34.90°S / 56.16°W</div>
```

### CSS

```css
.hero__coords {
  position: absolute;
  left: clamp(1rem, 4vw, 3rem);      /* alineado al gutter del container */
  bottom: clamp(1.25rem, 3vw, 2rem);
  z-index: 0;
  font-family: var(--font-display);  /* Space Grotesk */
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.12em;            /* carácter técnico/monoífico */
  color: var(--color-concrete);      /* #A7AAAD */
  opacity: 0.5;
  text-transform: uppercase;
  pointer-events: none;
  white-space: nowrap;
}
```

- Concrete (#A7AAAD) a 50% sobre #0F1111 → suficiente para ser *legible* de cerca pero claramente secundario; es decoración (`aria-hidden="true"`), no contenido funcional, así que no necesita ratio 4.5:1 pleno.
- Uppercase + tracking 0.12em para la lectura de "etiqueta técnica".
- El `bottom` + `z-index:0` la mantiene por detrás del `.hero__grid` (z:1) y por debajo del grain (z:2).

---

## 5. Capa 5 — GRAIN de hormigón (`.hero::after`)

Grano fino tipo cemento/hormigón, uniforme sobre todo el hero (incluido el contenido). SVG `feTurbulence` inline como data-URI — cero archivos.

El pseudo `::after` existente (radial sage wash al 5%) **se reemplaza** por el grain.

```css
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;                 /* por encima del contenido (film grain) */
  pointer-events: none;
  opacity: 0.05;              /* hormigón: máx 4–5% */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Parámetros del noise (para regenerar / afinar):
- `baseFrequency='0.9'` — grano fino.
- `numOctaves='4'` — detalle suficiente sin bandas.
- `stitchTiles='stitch'` — tileable, sin costuras a lo ancho del hero.
- `feColorMatrix` → `F=0.5` reduce el alpha del noise a la mitad (control primario del peso; la `opacity:0.05` del layer es el tope).
- Rango autorizado de la capa: `0.04 – 0.06`. Nunca >0.07.
- No `blend-mode` inicialmente; si el grano plomea el texto, activar `mix-blend-mode: soft-light` en la misma regla.

---

## 6. Regla de contraste (verificación AA documentada)

El h1 del hero es `--color-text` = #F2F1ED (blanco). Fondo efectivo ≈ base #0F1111 + líneas graphite #292E2D al 7% (maestra) sobre él:

**Fondo efectivo de la zona de línea:** mezcla #292E2D al ~40% (densidad de 1px por 256px + celdas superpuestas) sobre #0F1111 ⇒ **≈ #191C1C**.

**Relativo a este fondo, el blanco #F2F1ED da:**

```
L(#F2F1ED) ≈ 0.882
L(#191C1C) ≈ 0.0117
Contraste = (0.882 + 0.05) / (0.0117 + 0.05) = 0.932 / 0.0617 ≈ 15.1 : 1
```

- **15.1:1 ≫ 4.5:1 (AA texto normal) y ≫ 7:1 (AAA).** El h1 cumple AA con margen.
- El grain (5%) y la marca de agua (5.5%) son neutros / muy tenues y no alteran materialmente este ratio.
- El subtitle usa `--color-text-secondary` (concrete #A7AAAD sobre #0F1111 = **8.1:1**, ya documentado en `tokens.css` nota 5) — se mantiene AA.
- Conclusión: la composición completa mantiene AA. No hay texto legible por encima de textura densa que rompa contraste (las coordenadas son decoración `aria-hidden`, opacidad 0.5).

---

## 7. Responsive (<768px)

Para no recargar el hero en mobile, se degrada así:

```css
@media (max-width: 767px) {
  .hero__coords {
    display: none;               /* se ocultan las coordenadas */
  }
  .hero__texture-mark svg {
    transform: translate(18%, 20%);  /* se empuja más fuera del marco */
    opacity: 0.04;                   /* marca aún más tenue */
  }
  /* grid y grain se mantienen (son background barato, no cargan assets) */
}
```

- `<768px`: **coordenadas ocultas** (`display:none`).
- Marca de agua: se **reduce de presencia** — opacity 0.04 + se desborda +18%/+20% (más fuera de vista), en vez de apagarse del todo, para no perder el guiño de marca pero sin competir con el h1 centrado/plegado.
- Grid y grain: se mantienen (son puro CSS/data-URI, no añaden peso ni repintado costoso; el hero no es contenedor de scroll — ver §9).
- `min-width:768px` (coincide con el breakpoint existente en `pages.css`): vuelven coordenadas y la marca a valores base.

---

## 8. Impacto

- **Cero assets nuevos:** grid (CSS), grain (data-URI inline), marca de agua (SVG inline en HTML), coordenadas (texto). Todos literales dentro de `index.html` / `pages.css`.
- **Cero JS:** no se toca `js/main.js`. Las capas son CSS puro (pseudo-elementos + position). El recorte de la marca desbordada usa el `overflow:hidden` ya presente en `.hero`.
- **Performance:** las 4 capas de textura son `position:absolute` con `pointer-events:none`; no animan (respetan `prefers-reduced-motion` por defecto, no hay motion). El grain (z:2, estático) no provoca repintado en scroll porque el hero no es contenedor de scroll.
- **Paleta:** solo se usan los tokens existentes — `--color-black`, `--color-graphite` (como derivación de tinta), `--color-concrete`, `--color-sage`, `--color-white`. Sin colores nuevos.

---

## 9. Archivos a tocar

| Archivo | Cambio |
|---------|--------|
| `index.html` | (1) **Eliminar** el bloque `.hero__avatar-wrap` (líneas ~83–89, el div con `role="img"`/`aria-label="Isotipo CUADRA"` y su SVG). (2) **Añadir** dentro de `.hero` (después del cierre de `.hero__grid`, antes de `</section>`): `.hero__texture-mark` (§3) y `.hero__coords` (§4). |
| `css/pages.css` | (1) **Eliminar** las reglas `.hero__avatar-wrap` (líneas ~110–120) y su media query `@media (min-width:1024px) { .hero__avatar-wrap {...} }`. (2) **Reemplazar** la regla `.hero::after` existente (radial sage wash, líneas ~23–34) por el grain de §5. (3) **Añadir** `.hero::before` grid (§2), `.hero__texture-mark` + svg (§3), `.hero__coords` (§4), y el bloque responsive `@media (max-width:767px)` (§7). |

> No se tocan: `nav`, el resto de secciones, `footer`, ni ningún otro CSS/JS. La marca de agua se recorta con el `overflow:hidden` ya existente en `.hero`.

---

## Definition of Done

- [x] `docs/hero-texture.md` existe con valores EXACTOS y copiables.
- [x] Contraste AA documentado con cálculo: blanco #F2F1ED sobre fondo efectivo ≈#191C1C = **~15.1:1** (AA/AAA PASS).
- [x] Responsive definido (<768px): coordenadas ocultas, marca reducida a 0.04 + más desbordada.
- [x] Cero assets nuevos y cero JS.
- [x] Paleta ceñida a los tokens de `DESIGN.md` / `tokens.css`.
