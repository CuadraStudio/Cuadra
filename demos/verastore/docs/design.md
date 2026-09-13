# Spec de UI — Vera Store multi-página (CUADRA Tienda)

**Stage**: 2/5 · **Autor**: UI Designer · **Fecha**: 2026-09-13 · **Versión**: 1.0
**Base**: DG real de `css/styles.css` (paleta, tipografía, tokens y componentes existentes — **no se rediseña identidad**).
**Destinatario**: Frontend Developer (implementación del shell y las 27 páginas según PRD-restructure.md).

---

## 0. Reglas no negociables (heredadas del PRD, la spec no las contradice)

- R1: aviso **"Sitio de demostración"** en el footer de **todas** las páginas (string exacto del one-page actual: `Sitio de demostración. Todos los nombres, productos y datos son ficticios.`).
- R2: rutas 100% relativas (`../` según profundidad), nunca `href="/..."`. Desde `producto/{slug}/` el CSS es `../../css/styles.css`.
- R3: ninguna página vacía: ≥1 `<h1>`, ≥150 palabras de copy O ≥6 ítems (grillas, FAQ ≥8).
- DR (de diseño): solo tokens de `styles.css` (variables `--*` listadas en §1). No se agregan colores, fuentes ni radios nuevos; los componentes nuevos usan tokens existentes.
- DR2: nav/footer se emiten en el HTML de cada página (nunca inyectados por JS — PRD §5.1/§3.3). El JS solo hidrata carrito/filtros/ficha.
- DR3: el modal de ficha queda **desactivado en páginas públicas**; su rol lo cumplen `producto/{slug}/` (PRD §4). Se preserva `id="product-card"` en la primera card de cada grilla (gate E2E).

---

## 1. Fundamentos — tokens del DG que gobiernan todo (fuente: styles.css)

| Token | Valor | Uso |
|---|---|---|
| `--cream` / `--cream-2` / `--cream-3` | `#FAF7F2` / `#F1E7DA` / `#EFE8DC` | Fondos de página / alt / superficies internas |
| `--terracotta` / `--terracotta-dark` | `#C4592B` / `#a8471f` | Acciones, foco, elementos activos |
| `--ink` / `--ink-soft` / `--muted` | `#201A14` / `#4a4138` / `#6f6458` | Texto H1→cuerpo→auxiliar |
| `--sage` / `--sage-dark` | `#6B7D5E` / `#55654a` | Categorías, éxito, stickers, WA float |
| `--line` / `--line-soft` | `rgba(32,26,20,.14)` / `.08` | Bordes |
| `--sand` | `#E0A15A` | Detalle (estrellas, títulos footer) |
| `--font-display` / `--font-body` | Playfair Display / Work Sans | Títulos / cuerpo (invariante) |
| `--radius` 14 / `--radius-sm` 9 / `--radius-lg` 26 | | Cards, inputs, hero frame |
| `--header-h` 66px · `--wrap` 1180px · sombras `--shadow-sm/md/lg` | | Shell y elevación |
| `.btn` (+ `--solid/outline/ghost/dark/sm/block`), `.chip`, `.product-card`, `.faq`, `.reviews`, `.cart-drawer`, `.toast` | | Componentes reutilizados |

Breakpoints reales del DG (verificados en styles.css): **560** (label carrito) · **640** (label WA float) · **700** (grid producto 3 col) · **760** (footer) · **780** (reviews) · **800** (ficha 2 col) · **820** (bio) · **900** (nav desktop) · **1040** (grid 4 col). Mobile-first.

Variantes de botón reutilizadas por rol: primaria = `.btn--solid`; secundaria = `.btn--outline`; terciaria = `.btn--ghost`; énfasis oscuro = `.btn--dark` (solo útil en fondos crema-2 altos).

---

## 2. Shell compartido (todas las páginas públicas + pedido)

### 2.1 Header desktop (≥900px)

Estructura HTML idéntica en todas las páginas (solo cambian hrefs según profundidad y el `aria-current`):

```
.site-header (fijo, blur, is-scrolled al hacer scroll — clases existentes)
├─ .brand → {BASE}index.html ("VERA STORE" + brand__dot)
├─ nav.nav > ul.nav__list   [máx. 5 ítems + CTA — PRD §5.1]
│   1. Catálogo → {BASE}catalogo/
│   2. Talles   → {BASE}talles/
│   3. Envíos   → {BASE}envios/
│   4. Nosotros → {BASE}nosotros/
│   5. Contacto → {BASE}contacto/
└─ .header-actions
   └─ a.cart-btn.cart-btn--link (NUEVO) "Mi pedido" + span.cart-btn__count[data-cart-count] → {BASE}pedido/
```

Decisiones concretas:
- **Estado activo**: el link de la página actual lleva `aria-current="page"`. Estilo: `color: var(--ink)` persistente + subrayado terracota visible (regla existente `.nav__link::after` con `width: 100%`). No se crea estilo nuevo.
- **CTA "Mi pedido (n)"**: el botón-cart actual (`button[data-cart-btn]`) se convierte en **link** `.cart-btn` hacia `{BASE}pedido/`. El badge `[data-cart-count]` y el `aria-label` con conteo se mantienen exactos (shop.js ya los actualiza). Label visible "Mi pedido" (nunca "Carrito") para no duplicar concepto con el mini-cart.
- El drawer mini-cart **no** se abre desde el header: se abre contextualmente tras "Agregar al carrito" (comportamiento actual de `addCurrentToCart`) y desde el CTA interno del propio drawer. (Decisión para cumplir PRD §5.1 CTA→pedido y §8.1 drawer mini-cart.)
- La profundidad del enlace se resuelve con el atributo `data-site-base` en `<html>` (`""` home, `"../"` catálogo/categorías/contenido, `"../../"` producto) — mecanismo técnico del PRD §8.1; el diseño solo exige que el CTA y el nav usen esa base.

### 2.2 Drawer móvil (<900px)

Estructura: `scrim[data-nav-scrim]` + `nav.nav-drawer` (clases existentes), con contenido actualizado:

```
a.nav-drawer__link (Catálogo) → {BASE}catalogo/
div.nav-drawer__group (NUEVO)  [desplegable "Catálogo" con las 4 categorías]
  button[aria-expanded] "Catálogo" + 4 links .nav-drawer__sublink:
     Accesorios → {BASE}catalogo/accesorios/
     Indumentaria → {BASE}catalogo/indumentaria/
     Bolsos y Mochilas → {BASE}catalogo/bolsos-y-mochilas/
     Cuidado y Hogar → {BASE}catalogo/cuidado-y-hogar/
a.nav-drawer__link (Talles / Envíos / Nosotros / Contacto) → páginas
a.nav-drawer__cta .btn.btn--solid .btn--block (NUEVO) "Mi pedido (n)" con [data-cart-count] → {BASE}pedido/
.nav-drawer__contact (bloque existente: WhatsApp 099 000 000)
```

Decisiones concretas:
- El desplegable de categorías usa el patrón `details`/`summary` del FAQ existente (mismo idioma visual: Playfair, "+" terracota rotando a 45° en open) o botón con `aria-expanded`; **mismo resultado visual**. Abierto por defecto en `catalogo/` y categorías (contexto), cerrado en el resto.
- Los 5 ítems principales del drawer = mismos del nav desktop (misma IA, PRD §5.2). La categoría activa (en categoría/producto) lleva `aria-current="page"` y color terracota.
- Estado activo del ítem padre de página: mismo tratamiento `color: var(--terracotta)` + borde inferior presente.
- Cierra al navegar: se reutiliza el binding existente de `.nav-drawer__link`; los sublinks y el CTA del drawer deben sumarse a ese selector (Nota técnica para frontend: agregar a `$$('.nav-drawer__link, [data-nav-close]')`).
- `nav-drawer__cta`: `.btn--solid` ancho completo, con badge de conteo; altura de toque ≥44px.

### 2.3 Mini-cart drawer (todas las páginas públicas)

Se conserva `#cart-drawer` con la **misma mecánica** (body.cart-open, scrim, Esc cierra) pero el pie cambia — PRD §8.1:

```
.cart-drawer__head → "Tu carrito" + cerrar        (existente)
.cart-items → ítems con qty +/- y quitar           (existente)
.cart-drawer__foot (NUEVO contenido, sin form):
   .cart-total (subtotal)                          (existente)
   a.btn.btn--solid.btn--block "Ir a mi pedido" → {BASE}pedido/
   button#cart-clear.btn.btn--ghost "Vaciar carrito" (existente)
   a.cart-drawer__back "Seguir comprando" (cierra drawer, texto muted, link a {BASE}catalogo/)
```

Decisiones concretas:
- Se **elimina** del drawer: form nombre/teléfono, toggle entrega y `#whatsapp-order` (todo se muda a `pedido/`). El drawer es solo resumen + navegación (PRD DoD 8).
- `updateWhatsAppLink` queda sin target en páginas públicas → el frontend neutraliza ese binding fuera de `pedido/` (Nota técnica; diseño no cambia).
- Altura y padding del foot: mantener `padding: 18px 22px 22px`, fondo `--white`, borde `--line`.

### 2.4 Footer por grupos (todas las páginas, incl. pedido solo breve)

Estructura — `.site-footer` existente (fondo ink, título `--sand`, links hover `--sand`):

```
.site-footer > .wrap
├─ .footer-grid (NUEVA composición, ver responsive §6)
│   Col. 1 · .footer-brand: brand + frase + NAP
│      Vera Store · 21 de Setiembre 3421, Pocitos · 099 000 000 (tel) · L–V 10–19 / Sáb 10–14
│   Col. 2 · .footer-title "Explorar"          [grupo FOOTER_GROUPS]
│      Catálogo · Accesorios · Indumentaria · Bolsos y Mochilas · Cuidado y Hogar · Nosotros
│   Col. 3 · .footer-title "Atención"
│      Pedido · Talles · Envíos · Cambios · Preguntas · Contacto
│   Col. 4 · .footer-title "Legal" + .footer-title "Seguinos"
│      Privacidad (privacy.html) · Panel de pedidos (admin.html, rel=nofollow)
│      WhatsApp · Instagram (@verastore.demouy) · hola@verastore.uy
└─ .footer-bottom (existente)
   © <span data-year> Vera Store  ·  .site-footer__notice "Sitio de demostración. Todos los nombres, productos y datos son ficticios."  (R1, TODAS las páginas)
```

Decisiones concretas:
- Grupos y labels exactos del PRD §5.3: **Explorar / Atención / Legal** + NAP + social. Cada link usa ruta relativa según profundidad (`privacy.html` en home, `../privacy.html` en catálogo, `../../privacy.html` en producto).
- `admin.html` y `privacy.html` se enlazan con rutas relativas (R2); `admin.html` conserva `rel="nofollow"`.
- **Variación pedido/**: `pedido/` NO usa este footer largo (PRD §8.2: "sin footer largo"). Lleva solo `.footer-bottom` con aviso DEMO + crédito. El aviso DEMO es obligatorio también ahí (R1).
- Si el frontend reordena columnas en móvil: orden de apilado = Explorar, Atención, Legal+Seguinos, NAP (el NAP deja de ser la primera columna en móvil para privilegiar navegación; la marca queda arriba vía `.footer-brand`).

### 2.5 Elementos transversales

- `a.skip-link` → `#main-content` en todas las páginas (existente).
- Botón WA flotante `.wa-float` → presente en home y contenido/contacto; **ausente en pedido/ y fichas** (donde el CTA de compra es el protagonista) y en administración. (Decisión de jerarquía visual; el PRD no lo exige en ninguna.)
- `data-year` actualiza el año del footer (binding existente).

---

## 3. Breadcrumbs

Solo en: `catalogo/`, `catalogo/{categoria}/`, `producto/{slug}/` (PRD §6). Nuevo componente `.crumbs`:

| Página | Trail (visible) |
|---|---|
| `catalogo/` | Inicio › Catálogo |
| `catalogo/{slug}/` | Inicio › Catálogo › {Cat} |
| `producto/{slug}/` | Inicio › Catálogo › {Cat} › {Producto} |

Decisiones concretas:
- **Posición**: primera región de `<main>`, por encima del `<h1>`, con `padding-top: calc(var(--header-h) + 28px)` para compensar el header fijo (mismo patrón que `.legal`). Margen inferior 14px.
- **Estilo**: `nav.crumbs[aria-label="Ruta de navegación"]` → `ol` → `li` inline; texto Work Sans .82rem, color `--muted`; separador `›` (aria-hidden, no tipográfico en el label accesible); links hover `--terracotta`; último crumb `color: var(--ink); font-weight: 600` + `aria-current="page"` (sin link).
- **Enlazado**: Inicio → `{BASE}index.html`; Catálogo → `{BASE}catalogo/`; {Cat} → `{BASE}catalogo/{slug}/`; producto = self (texto, no link).
- **Móvil**: los crumbs envuelven con `flex-wrap` (no se trunc… el trail de producto es corto, 3 saltos máximo; no se aplica ellipsis).
- JSON-LD `BreadcrumbList` con URLs absolutas `https://cuadrastudio.uy/demos/verastore/...` (PRD §9).

---

## 4. Tipos de página

### 4.1 Home (`index.html`, reescrita)

Regiones, en orden (todas reutilizan clases existentes):

1. **Hero** — intacto salvo CTAs: "Ver catálogo" → `catalogo/` (`.btn--solid`); "Consultar por WhatsApp" se mantiene. Badges envío/retiro/WhatsApp intactos.
2. **Destacados** (`#featured-grid`, `.section--alt`) — 4 cards (camisola-nube, bolso-tote, aros-sol, vela-ambar vía shop.js). **Cambio clave**: cada card son `<a href="{BASE}producto/{slug}/">` reales (product-card__name y CTA enlazan, NO abren modal; el botón media deja de ser `button` y pasa a ser `<a>`). Se conserva `is-agotado` de bufanda si apareciera (no aplica en featured).
3. **Categorías** (NUEVO bloque `.section`, sin alt) — tiles de las 4 categorías: componente `.cat-tile` (§5.1) con imagen representativa, nombre y conteo ("14 productos" en el tile de catálogo o "4 productos" por categoría — usar: tile grande "Ver todo el catálogo" + 4 tiles de categoría, o directamente 4 tiles con link "Ver todo" al pie; **decisión:** 4 tiles de categoría + 1 CTA `.btn--outline` "Ver todo el catálogo" → `catalogo/`).
4. **Teaser Camila** (`.section--alt`, clase `.bio` existente) — foto + bio corta + link `.btn--ghost` → `nosotros/`.
5. **Reseñas** (`.section`) — 3 testimonios existentes intactos.
6. **Strip contacto** (`.section`) — las 3 cards de contacto existentes (tel / email-IG / local) + link → `contacto/` como `.btn--ghost` "Ver contacto y horarios".
7. Escala de títulos: H1 solo en hero ("Vera Store"); secciones usan H2 con `.section-head` (eyebrow + h2) — patrón existente.

### 4.2 Catálogo (`catalogo/index.html`)

```
.crumbs (Inicio › Catálogo)
header .page-head (NUEVO, reutiliza .section-head ampliado)
  eyebrow "Tienda" · h1 "Catálogo" · intro corta (1–2 líneas, .section-head p)
.cat-filter (existente) — chips categoría + chips precio (ver abajo)
#product-grid.product-grid (existente) — 14 cards, con id="product-card" en la primera
```

Decisiones concretas:
- **Filtros**: dos filas de `.chip[aria-pressed]` con `.chip__count`:
  - Categorías: Todos (14) · Accesorios (4) · Indumentaria (4) · Bolsos y Mochilas (3) · Cuidado y Hogar (3).
  - Precio (bandas derivadas de los precios reales del demo, 350–2900): Todos · Hasta $1.000 (5) · $1.000–$1.500 (4) · $1.500–$2.500 (3) · Más de $2.500 (2). *(Conteos verificados contra `DEMO_CATALOG`; si el frontend los calcula con shop.js, que coincidan con esta tabla.)*
  - Interacción: chips de categoría y precio **combinables** (AND). `aria-pressed` refleja el estado. Sin selección = "Todos" activo.
- **Grilla**: `.product-grid` existente (2 → 3 @700 → 4 @1040). Cards con `<a href>` reales a `producto/{slug}/`.
- **Estado vacío** (filtro sin resultados, p.ej. combinación imposible): `.empty-state` existente + botón `.btn--ghost` "Ver todo" que resetea filtros (shop.js `state.filter='Todos'`). Asegurar `aria-live="polite"` en el grid (ya está).
- **Orden móvil**: filtros arriba con `overflow-x: auto` (scroll horizontal con `scroll-snap-type: x proximity`), grilla después. Desktop: chips en wrap normal (2 filas).
- JSON-LD `ItemList` (PRD §9); `injectStructuredData` de shop.js debe apuntar las URLs a `producto/{id}/` (PRD §8.1.5).

### 4.3 Categoría (`catalogo/{slug}/index.html` ×4)

```
.crumbs (Inicio › Catálogo › {Cat})
header .page-head: eyebrow "Categoría" · h1 = nombre de categoría
prose de intro ≥150 palabras (copy estático, canon adaptado) en .prose (max-width 760px)
.cat-filter (existente) — SOLO chips de categoría (sin precio), para cross-navegación:
   las 5 chips con la categoría actual aria-pressed=true
#product-grid.product-grid — grilla de la categoría (4/4/3/3 ítems según slug)
```

Decisiones concretas:
- El `<h1>` es el nombre de la categoría (término perseguido, PRD §9). La intro >150 palabras vive **entre el h1 y los chips** (bloque `.prose`).
- Los chips de categoría funcionan como links de navegación: la chip activa es la página actual; las demás llevan `<a href>` a las otras categorías (estilo `.chip` existente pero como anchor; preservar look de pill). Alternativa aceptable: chips-button con click que navega — se prefiere `<a>` por ser output estático.
- Los productos NO se filtran por JS acá (la grilla es estática por slug); el hook `data-catalog-filter` del PRD §8.1 queda para el caso de que la grilla se re-arme por JS; por diseño la página muestra la grilla completa de su categoría.
- JSON-LD `CollectionPage` + `ItemList`.

### 4.4 Ficha de producto (`producto/{slug}/index.html` ×14)

```
.crumbs (Inicio › Catálogo › {Cat} › {Producto})
article.product-detail (clase existente, pero en página, sin contenedor modal)
├─ .product-detail__media: img SVG del producto (aspect-ratio 1/1, fondo --cream-2, borde redondeado)
└─ .product-detail__info
   p.product-detail__cat (categoría, texto sage-dark)
   h1.product-detail__name (único H1 de la página = nombre del producto)
   p.product-detail__price (precio UYU, formatPrice existente)
   #modal-stock → renombrado en página a .stock-note (ok/out, existente)
   .option-group Talle (si aplica) + .option-group Color (si aplica) — pills existentes:
       pills disabled cuando TODAS las variantes de ese valor están agotadas, con
       span.option-pill__agotado "Agotado" (patrón existente)
   .qty-row (selector cantidad existente)
   .delivery-info (existente): deliveryLabel del producto
   a/button.btn.btn--solid.btn--block "Agregar al carrito" [data-add-to-cart]
   p.hint (existente, "Elegí una opción disponible para continuar." si falta selección)
section.related (NUEVO): h2 "También te puede gustar" + .product-grid con 3–4 cards de la misma categoría
```

Decisiones concretas:
- **Galería simple**: una sola imagen (el SVG del catálogo); no hay miniaturas ni carrusel — el demo no tiene producción fotográfica (PRD §3.2, solo tarjetas SVG). La imagen es `<img alt="{Producto} — {Categoría}">`.
- **Estado agotado** (producto sin variantes con `stock:'agotado'`, ej. bufanda-ambar): media con `filter: grayscale` (regla `.product-card.is-agotado` aplicada también al bloque de ficha vía `.product-detail.is-agotado`), badge `.badge-agotado` sobre la media, stock-note `--out` "Sin stock", CTA `.btn--solid` disabled con texto "Agotado", qty deshabilitada.
- **Agregar al carrito**: número de cantidad ([1–9], `clampQty`), al agregar → cierra nada (no hay modal), abre **mini-cart drawer** + toast "Agregado al carrito" (comportamiento existente de `addCurrentToCart` sin openOverlay del modal). El botón puede ser `<a>` con `href="{BASE}pedido/"` como fallback sin-JS o `button` con JS; **decisión de diseño**: `button[data-add-to-cart]` con JS (la lógica de variantes lo exige); el frontend puede emitir el `<a>` como noscript.
- **Relacionados**: misma categoría, máx. 4 (Accesorios: 4 de 4; Indumentaria: 4 de 4; Bolsos/Mochilas y Cuidado/Hogar: 3 de 3). Cards-enlace reales a `producto/{id}/`.
- JSON-LD `Product` + `Offer` (UYU, availability por variante/stock) + `BreadcrumbList` (PRD §9).
- La hidratación usa el modo ficha `[data-product]` del PRD §8.1: variantes/stock impresos estáticos en el HTML; JS solo refresca disponibilidad y arma el carrito.

### 4.5 Pedido / checkout (`pedido/index.html`)

Header reducido: `.site-header` con brand + link "Volver a la tienda" (→ `{BASE}index.html`), **sin nav**, sin drawer ni WA float. Footer breve (solo footer-bottom + aviso DEMO, §2.4).

```
main .order-page (NUEVO)
  h1 "Tu pedido" (único H1) + p intro "Completá tus datos y envianos el pedido por WhatsApp."
  .order-layout (NUEVO grid, 2 col @800):
   Col. items:
     #cart-items expandido (reusa .cart-item + qty +/- y quitar)
     enlace .btn--ghost "Seguir comprando" → {BASE}catalogo/
   Col. summary (.card--form, NUEVO panel):
     .cart-total (subtotal, existente)
     form .cart-form (existente): nombre (autocomplete=name), teléfono (autocomplete=tel)
     .entrega-toggle (existente): Retiro en local / Envío
     a#whatsapp-order.btn.btn--solid.btn--block "Pedir por WhatsApp" (reusa buildWhatsAppMessage + saveOrder → gracias.html)
     button#cart-clear.btn.btn--ghost "Vaciar carrito"
     nota de ayuda: "Te contactamos por WhatsApp para coordinar pago y entrega."
```

Decisiones concretas:
- **Layout**: grid `1.1fr .9fr` @ ≥800px (items | formulario+total), 1 columna móvil (resumen primero). Panel de resumen con fondo `--white`, borde `--line-soft`, radius 14, sombra sm.
- **Estado vacío** (localStorage sin ítems): `.cart-empty` existente ("Tu carrito está vacío") + CTA `.btn--solid` "Ver catálogo" → `{BASE}catalogo/`. Ocultar form y toggle entrega.
- El botón WhatsApp arma mensaje, `saveOrder()` y redirige a `{BASE}gracias.html` (PRD §8.1.1: el redirect usa `data-site-base`; gracias resuelve desde `pedido/` como `../gracias.html`).
- `noindex` recomendado por PRD §8.2 (opcional, sin parámetros).
- Los campos no validadan bloqueante (flujo WhatsApp demo): validation suave = `required` en nombre/tel + hint si vacío, sin impedir el envío.

### 4.6 Contenido (envios, cambios, talles, nosotros, preguntas) — patrón común

Shell completo (header + nav + drawer + footer largo). Sin breadcrumb (no está en el PRD §6).

Patrón de página (reutiliza `.legal` como base de página de contenido: paddings, `.prose` max-width 760px):

```
header .page-head: eyebrow contextual + h1 único
.prose: bloques de copy con h2 de sección
componentes específicos por página (ver mapa)
```

| Página (ruta relativa) | H1 sugerido | Componentes/patrones |
|---|---|---|
| `envios/` | "Envíos y retiro" | Prose + `.info-table` (§5.2) zonas/costos/tiempos + `.faq` corto (FAQ envíos, 3–4) + bloque retiro (`.delivery-info` ampliado con dirección y horarios) |
| `cambios/` | "Cambios y devoluciones" | Prose + pasos numerados `.steps` (§5.3) + `.faq` (FAQ cambios, 2–3) + CTA WhatsApp |
| `talles/` | "Guía de talles" | `.info-table` real del demo (Remeras/camisolas S-M-L · Camisas S-M-L · Sweaters M-L — **no inventar XL**, alineado a `DEMO_CATALOG.variants`) + "Cómo medirte" prose + equivalencias |
| `nosotros/` | "Sobre Vera Store" | `.bio` (retrato camila-portrait.svg + bio larga) + marcas de confianza (prose) + punto de retiro (.delivery-info) + CTA "Escribinos" |
| `preguntas/` | "Preguntas frecuentes" | `.faq` con 8–10 `details` (4 actuales + canon: stock, reservas, tarjeta, probador, regalo) + CTA contacto |

Decisiones concretas:
- Todos los copy son estáticos (PRD §8: no requieren claves nuevas de config). La intro de cada página ≥1 párrafo; total ≥150 palabras (R3).
- `.page-head` (NUEVO, compartido con catálogo/categoría): eyebrow (`.section-head__eyebrow`), `h1` en clamp(1.9–2.7rem) como `.legal h1`, p intro `--muted`. No usar `.hero` para páginas internas (el hero queda solo en home).

### 4.7 Contacto (`contacto/index.html`)

Shell completo. Sin breadcrumb.

```
header .page-head: eyebrow "Contacto" · h1 "Hablemos" · p intro
.contact-layout (NUEVO grid 2 col @800):
  Col. información (.contact-cards → reusa .review cards existentes):
    • Dirección (21 de Setiembre 3421, Pocitos — link a maps externo)
    • Horarios (L–V 10–19 · Sáb 10–14)
    • Teléfono (tel:) · WhatsApp · Email (mailto:) · Instagram
    • Cómo llegar: 2–3 líneas de copy
  Col. mapa: iframe Google Maps embebido (https://www.google.com/maps?q=...&output=embed,
    sin API key — carga estática; título accesible via sr-only) en frame .contact-map
    con radius-lg + shadow-md
CTA final: .btn--solid WhatsApp "Consultar por WhatsApp"
```

Decisiones concretas:
- Horarios NAP idénticos a footer (fuente única: copy estático; PRD §5.3).
- Mapa: si el iframe se rechaza por política del demo, alternativa = card con link "Abrir en Google Maps" (el layout no se rompe; la col. mapa muestra la card). **Decisión de default**: iframe con fallback visual en card.
- JSON-LD `ContactPage` (PRD §9).

---

## 5. Componentes nuevos (solo 4 — todo lo demás se reutiliza)

### 5.1 `.cat-tile` (home)
Card de categoría: `a` con media (SVG representativo: accesorios-gorra, indumentaria-camisola, bolsos-tote, hogar-vela), capa de gradiente/solid `--ink` al 8% sobre media, nombre Playfair 1.25rem, footer con conteo `--muted` .8rem. Grid: 2 col móvil → 4 col @780. Bordes/radius/sombra = `.product-card` (radius 14, border line-soft, hover shadow-md + translateY -4px).

### 5.2 `.info-table` (envios, talles)
Tabla de datos: `table` full-width; `th` Work Sans .72rem uppercase letter-spacing .14em `--sage-dark`; filas con borde inferior `--line`; celdas padding 10px 12px; fondos alternados crema/white; `caption` sr-only con el nombre de la tabla. Responsive móvil: las tablas de talles/costos son cortas (≤4 filas) → se mantienen como tabla con `overflow-x:auto` en contenedor.

### 5.3 `.steps` (cambios, "cómo medirse")
Lista ordenada numerada: `ol` con contador Playfair terracota en círculo (44px, fondo crema, borde line); texto Work Sans `--ink-soft`; gap 14px; columna única hasta 780px, luego 2 columnas si aplica (envios: 1 col).

### 5.4 `.crumbs` + `.page-head` + `.order-layout` + `.contact-layout`
Detallados en §3, §4.5, §4.7. Todos usan tokens existentes.

---

## 6. Responsive — variaciones clave por página (breakpoints reales del DG)

| Página | <560 | 560–699 | 700–899 | 900–1039 | ≥1040 |
|---|---|---|---|---|---|
| Shell nav | drawer (toggle) | drawer | drawer | **nav desktop + CTA** | nav desktop |
| Home hero | 1 col | 1 col | 1 col | 2 col (media derecha) | 2 col |
| Home cat-tiles | 2 col | 2 col | 4 col | 4 col | 4 col |
| Home destacados | 2 col | 2 col | 3 col | 3 col | 4 col |
| Catálogo/categoría grilla | 2 col | 2 col | 3 col | 3 col | 4 col |
| Chip filtros | scroll horizontal snap | scroll horizontal | wrap | wrap | wrap |
| Ficha producto | 1 col | 1 col | 1 col | 2 col (@800) | 2 col |
| Pedido | 1 col | 1 col | 1 col | 2 col (@800) | 2 col |
| Contacto | 1 col | 1 col | 2 col (@800) | 2 col | 2 col |
| Footer grid | 1 col | 2 col | 2 col | 4 col | 4 col |
| Contenido (.prose) | 1 col | 1 col | 1 col | 1 col | 1 col (max 760px) |

- **Footer** (NUEVO grid): base 1 col; @560 → 2 col (Explorar / Atención, luego Legal/Seguinos + NAP debajo); @900 → 4 col (1.2fr 1fr 1fr 1fr). `.footer-bottom` ya pasa a fila @760 (existente).
- **Pedido**: el summary va bajo los items en móvil (flujo natural: eligió → confirma). En desktop, summary sticky (`position: sticky; top: calc(var(--header-h) + 20px)`) para ver el total mientras edita.
- **Ficha**: la info del producto en móvil queda debajo de media; el sticky de CTA no aplica (el CTA es largo y el drawer informa el éxito).
- **Contenido**: `.prose` nunca se expande a full-width (max 760px), consistente con `.legal`.

---

## 7. Accesibilidad (mantener el estándar AA del sitio)

- **Foco visible**: `:focus-visible` global existente (outline 3px terracotta) se mantiene; los nuevos componentes (.crumbs, .cat-tile, chips-ancla, .info-table links, drawer CTA) no lo anulan.
- **Skip link**: presente en todas (target `#main-content`).
- **Drawer nav**: conservar `aria-expanded` + `aria-controls` en toggle, Esc cierra, scrim clicable (bindings existentes). QA: devolver foco al toggle al cerrar (mejora opcional; no regresión).
- **Mini-cart drawer**: `role="dialog" aria-modal="true" aria-label="Carrito de compras"` (ya existe); conservar focus al cerrar y Esc.
- **Contraste**: usar solo pares existentes (muted sobre cream ≈ 4.6:1 ✓; terracotta sobre cream ≈ >4.5:1 ✓ en links; sand solo decorativo). No usar `--sand` como text body; `--muted` nunca sobre `--cream-2` para texto pequeño (<0.85rem) cuando sea crítico.
- **Semántica**: 1 H1 por página (ver checklist); categorías/prose con H2; chips de filtro con `aria-pressed`; tabla con `caption` sr-only; `aria-current="page"` en crumbs y nav activo.
- **Motion**: respeitar `prefers-reduced-motion` global existente (ya fuerza .001ms).
- **Estados**: `aria-live="polite"` en grids de producto, toast `role="status"`, stock-note `role="status"` (existentes), badge de carrito `aria-label` vivo (existente).

---

## 8. Checklist de consistencia (QA visual pre-handoff)

Antes de declarar implementación OK, recorrer el sitio y verificar:

- [ ] **1 H1 por página**: hero home, "Catálogo", nombre de categoría, nombre de producto, "Tu pedido", H1 de contenido/contacto. Ningún H2 con el mismo texto del H1 en la misma página.
- [ ] **Aviso DEMO**: string "Sitio de demostración" visible en footer de las 27 páginas + `gracias.html`, `admin.html`, `404.html`, `privacy.html` (R1; pedido/ aunque su footer sea breve).
- [ ] **Nav idéntico**: misma orden/labels/CTA en todas las páginas; `aria-current="page"` marca la página actual; CTA "Mi pedido (n)" con badge sincronizado entre páginas (2 clicks: agregar en home → ver conteo en producto/catálogo/pedido).
- [ ] **Rutas relativas**: desde `producto/{slug}/` todo resuelve con `../../`; cero `href="/` (grep).
- [ ] **Sin páginas vacías**: cada grilla ≥2 ítems en su estado por defecto; intro de categoría ≥150 palabras; FAQ ≥8.
- [ ] **Voz y paleta**: ninguna página introduce color/familia tipográfica nueva; Playfair solo en títulos/display, Work Sans en cuerpo.
- [ ] **Breadcrumbs coherentes**: presentes solo en catálogo/categoría/producto; crumb de producto = 2 niveles de padre enlazados.
- [ ] **Chips**: conteos de las bandas coinciden con la tabla §4.2 (14/5/4/3/2 y 14/4/4/3/3); estado activo visible; reset "Ver todo" recupera grilla completa.
- [ ] **Ficha**: toda opción agotada (ej. Collar Luna Plateado, Gorra Verde salvia, Camisola M Verde salvia, Mochila Arena, Remera S Tinta, Bufanda entera) se ve disabled + tag "Agotado"; CTA deshabilitado hasta elegir combinación válida; CTA deshabilitado en producto agotado.
- [ ] **Mini-cart**: sin form, con "Ir a mi pedido" → pedido/; el form completo (nombre/tel/entrega/WhatsApp/vaciar) vive SOLO en pedido/ (DoD 8).
- [ ] **Títulos/descriptions únicos**: `<title>` y `meta description` distintos por página (grep de duplicados); canonical absoluta presente.
- [ ] **Relacionados**: cada ficha enlaza a 3–4 productos de su misma categoría y esos links abren fichas reales (sin 404).
- [ ] **Footer**: 3 grupos + NAP + social + aviso; labels exactos Explorar/Atención/Legal; `admin.html` con `rel="nofollow"`.
- [ ] **Peso**: HTML+CSS+JS ≤ 400 KB (DoD 10; estimado ~240 KB según PRD Anexo B).
- [ ] **Preview file://**: abrir desde disco sin errores de assets ni links rotos (DoD 12); sitemap → archivos existentes (DoD 2).

---

## 9. Notas técnicas para el frontend (design-agnóstico, del PRD §8.1)

- `data-site-base` en `<html>` para resolver rutas desde `shop.js` (`""` / `"../"` / `"../../"`).
- Modo ficha: `[data-product]` en `<main>`; el HTML estático trae variantes/stock; `shop.js` solo hidrata.
- Modo categoría: `data-catalog-filter="{Categoría}"` si el grid se re-arma por JS.
- Redirect de `pedido/` a `gracias.html` resuelto con la base (nunca ruta absoluta).
- `injectStructuredData` deja de emitir `url: origin + '#' + id` → fichas reales (o se omite en fichas que llevan schema propio).
- Nav/footer **en el HTML** de cada página (no inyectados) — el shell se repite por template/script de generación, no por runtime.

*Documento de diseño — UI Designer. Siguiente handoff: Frontend Developer (implementación). Orion verifica `docs/design.md` en disco.*