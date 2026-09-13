# Validación Final Independiente — Vera Store (restructuración multi-página)

**Autor**: PM (Alex) · **Fecha**: 2026-09-13 · **Stage**: 5 — Validación final vs modelo canónico Tienda · **Attempt**: 1/2
**Método**: verificación sobre disco real (Glob/Read/Grep/PowerShell sobre `demos/verastore/`), independiente del review previo. No se modificó código ni HTML.
**Resultado**: ✅ **SHIP**

---

## 1. Estructura real en disco vs modelo canónico Tienda (`generator/pages.js` → `const tienda`)

Modelo canónico (`pages.js:162-210`): `home`, `catalogo` (+1 por categoría en colección), `producto` (+1 por producto en colección), `pedido`, `envios`, `cambios`, `talles`, `lookbook` (Premium, omitible por `needs`), `common` (nosotros, preguntas, contacto, gracias, privacidad, 404; galeria excluida) y `blog` (Premium, omitible).

**7 fijas** (home + catálogo + 5 content/flow en plan Profesional del canon, menos lookbook/novedades por falta de contenido):

| Página canónica | Archivo real | En disco |
|---|---|---|
| `home` | `index.html` | ✅ |
| `catalogo` | `catalogo/index.html` | ✅ |
| `pedido` | `pedido/index.html` | ✅ |
| `envios` | `envios/index.html` | ✅ |
| `cambios` | `cambios/index.html` | ✅ |
| `talles` | `talles/index.html` | ✅ |
| `nosotros` + `preguntas` + `contacto` | `nosotros/`, `preguntas/`, `contacto/index.html` | ✅ ✅ ✅ |

**1 por categoría** (4, mapeo exacto §2.2 del PRD):

| Categoría (config.js `category`) | Slug | En disco |
|---|---|---|
| Accesorios | `catalogo/accesorios/index.html` | ✅ |
| Indumentaria | `catalogo/indumentaria/index.html` | ✅ |
| Bolsos y Mochilas | `catalogo/bolsos-y-mochilas/index.html` | ✅ |
| Cuidado y Hogar | `catalogo/cuidado-y-hogar/index.html` | ✅ |

**1 por producto** (14, ids = slugs de `DEMO_CATALOG`, `config.js:36-214`):

aros-sol ✅ · collar-luna ✅ · gorra-lino ✅ · bufanda-ambar ✅ · camisola-nube ✅ · remera-basica ✅ · camisa-lino ✅ · sweater-crudo ✅ · bolso-tote ✅ (drift consentido: id demo `bolso-tote`) · mochila-lona ✅ · rinonera-siena ✅ · vela-ambar ✅ · jabon-avena ✅ · difusor-savia ✅ — todos en `producto/{slug}/index.html`.

**Utilitarias** (R4, no reescritas): `gracias.html` ✅ `admin.html` ✅ `404.html` ✅ `privacy.html` ✅
**Infra**: `sitemap.xml` ✅ (28 locs) · `robots.txt` ✅ · `scripts/` (generate-pages, verify, minify-hand, minify-assets, gen-og-preview) ✅

**Total verificado por glob**: 31 HTML = 27 públicas + 4 utilitarias. `scripts/verify.js` (ítem 7): rutas esperadas 33, faltan 0. `catalogo/index.html` conserva `id="product-card"` (gate E2E, count=1).

**Omissiones canónicas** (lookbook, promociones, fidelidad, novedades/blog, opiniones, términos, galeria, `/en/`): documentadas y justificadas en PRD §3.2 (regla dura "nunca página vacía" y `needs` no satisfechos). Coherente.

---

## 2. DoD del PRD — 12 criterios con evidencia

| # | DoD | Evidencia (path / comando) | Estado |
|---|---|---|---|
| 1 | Rutas 100% relativas | Grep `(href\|src)="/` → 0 en 31 HTML y JS; `url(/` en CSS → 0. `data-site-base` presente en 27 públicas: `""` (home), `../` (catálogo/categorías/contenido/pedido), `../../` (14 fichas). Ej. `producto/aros-sol/index.html:1` → `../../css/styles.css?v=`, `../../favicon.svg` | ✅ |
| 2 | Inventario completo emitido | Glob: 27 públicas + 4 utilitarias existen. `sitemap.xml` 28 locs → 0 archivos inexistentes (Test-Path por cada `<loc>` → missing 0; verify ítem 8: rotos 0) | ✅ |
| 3 | Ninguna página vacía | verify ítem 5: 0 páginas con h1≠1. Conteo palabras: categorías 340–373 (intro propia, review: 159–202); envios 496, cambios 720, talles 526, nosotros 623, contacto 286; preguntas 15 `<details>`; pedido = flujo con form (excepción legítima de grilla/flow) | ✅ |
| 4 | Aviso DEMO (R1) | `Select-String 'Sitio de demostración'` sobre los 31 `*.html` → 0 faltantes; verificado dentro de `<footer>` (envios) y en las 27 públicas + utilitarias vía verify ítem 3 (sin aviso: 0) | ✅ |
| 5 | SEO único por página | Títulos: 31 únicos (verify ítem 4: duplicados 0). Meta descriptions: 27/27 únicas (group-by → 0 dups). Canonical absoluta en 27 públicas. H1=1 en todas. JSON-LD: 0 bloques inválidos, tipos correctos (home ClothingStore+WebSite; catálogo ItemList; categorías CollectionPage; fichas Product+Offer+BreadcrumbList; contacto ContactPage; nosotros AboutPage). `<img>` sin `alt`: 0 | ✅ (notas H1–H3 abajo) |
| 6 | Carrito persiste + checkout → gracias | `js/shop.js:9` `CART_KEY='verastore_cart'`; contador `[data-cart-count]` en home/catálogo/fichas; `shop.js:753` `root.location.href = BASE + 'gracias.html'` (BASE = `data-site-base`, resuelve desde rutas anidadas); `saveOrder()` en `shop.js:596`; `gracias.html` noindex con links `index.html`/`catalogo/` | ✅ (verificación estática; interacción de navegador = prueba manual de QA) |
| 7 | Fichas enlazadas desde cards + relacionadas + breadcrumb | home: 12 `<a href=...producto/...>`; catálogo: 41; fichas breadcrumb `Inicio › Catálogo › {Cat} › {Prod}` (verif. aros-sol, camisa-lino, todo `../../` correcto); relacionados = todos los otros de la misma categoría (3 en Accesorios/Indumentaria; 2 en Bolsos/Cuidado = máximo posible, categorías de 3 ítems §2.2) | ✅ |
| 8 | Checkout único en `pedido/` | Drawer mini-cart con CTA "Ir a mi pedido" en las 27 públicas; `pedido/` con header reducido (brand + "Volver a la tienda", sin `nav__list`), sin drawer (`details=0`), sin WA float, `wa-float=False` | ✅ |
| 9 | Utilitarias intactas | `admin/gracias/404` → `robots="noindex, nofollow"`; `privacy` → `index, follow`; `admin.js:12` `ORDERS_KEY`=`verastore_demo_orders` y `admin.js:12,110-117,229-233` PIN `0000` + auto-login; `gracias.html` funciona con `saveOrder` y enlaza a tienda. `node --check` sin errores en los 7 scripts | ✅ |
| 10 | Peso ≤ 400 KiB | 27 HTML públicas + `css/styles.css` + `js/config.js` + `js/shop.js` = **405.059 B = 395,57 KiB** (< 400 KiB = 409.600 B) — verify ítem 10 `true` | ✅ |
| 11 | Navegación | Nav desktop 5 ítems (Catálogo/Talles/Envíos/Nosotros/Contacto) + CTA "Mi pedido" con `data-cart-count` (home, header real); drawer móvil con 4 categorías; `<details open>` solo en catálogo/categorías (home y fichas cerrados — D-2026-03); footer 3 grupos (Explorar/Atención/Legal) + NAP Pocitos + aviso DEMO | ✅ |
| 12 | Preview local OK | 0 rutas absolutas, profundidades `../` correctas por nivel verificadas en `<head>` real de home/nivel1/fichas; sitemap 28/28 mapean a archivos existentes; robots declara sitemap. Prueba de navegador final queda a cargo del gate de QA del pipeline (proxy estático: 10/10) | ✅ |

**Evidencia automatizada**: `cmd /c node scripts\verify.js` (workdir `demos/verastore`) → **10/10** (31 HTML · 0 absolutas · 0 sin aviso · 0 títulos duplicados · 0 h1≠1 · ld-seo por página correcta · 33 rutas, 0 faltan · 28 locs, 0 rotos · 0 modales/og:svg, 14 fichas `data-product` únicas · 395.57 KiB < 400KiB).

---

## 3. Regla R1 y restricciones demo

- **R1 — identidad ficticia + aviso DEMO**: el string "Sitio de demostración" está en el footer de las 31 `*.html` (0 faltantes, verify ítem 3). Datos ficticios coherentes (Vera Store, 099 000 000, hola@verastore.uy).
- **PIN 0000**: `js/config.js:32` `pin:'0000'`; `js/admin.js` auto-login con PIN demo.
- **Carrito demo**: `js/shop.js:10` `ORDERS_KEY = DEMO.storageKey || 'verastore_demo_orders'`; `config.js:33` `storageKey:'verastore_demo_orders'`. Carrito de navegación: `verastore_cart` (`shop.js:9`).

---

## 4. Funcionamiento como subruta `/demos/verastore/`

- **Rutas internas 100% relativas**: 0 `href="/` y `src="/` en todo el sitio (HTML+JS+CSS). Profundidades correctas por nivel ("" / "../" / "../../").
- **`data-site-base` coherente**: `""` home · `../` catálogo/categorías/contenido/pedido · `../../` 14 fichas. `shop.js:186` lo usa como `BASE` para construir URLs internas runtime (links de producto, imágenes, redirect a `gracias.html`).
- **Sitemap/robots consistentes**: sitemap solo URLs indexables de `https://cuadrastudio.uy/demos/verastore/...` (28 locs, incluye `privacy.html` 0.2, excluye admin/gracias/404); `robots.txt` `Disallow` admin/gracias/404 y `Sitemap:` absoluto.
- **Canonical/OG**: URL canónica absoluta `https://cuadrastudio.uy/demos/verastore/...` presente en las 27 públicas (también home). `og:image` unificado a `img/og-preview.png` (PNG, no SVG — D-2026-02), 0 `og:image` .svg (verify ítem 9).

---

## 5. Hallazgos (no bloqueantes — no impiden SHIP)

- **H1 (nota)**: `privacy.html` es indexable (`index, follow` + en sitemap prioridad 0.2) pero no lleva `<link rel="canonical">` ni OG. Coherente con R4 (utilitaria no reescrita) y aceptado por el review; si se interpreta el §9 "canonical en TODAS" al pie de la letra, es la única indexable sin ella → pulido futuro opcional. Ruta: `privacy.html`.
- **H2 (nota SEO menor)**: meta description de fichas >160 caracteres (ej. `producto/aros-sol/index.html`: 190 chars). El dato clave (nombre, categoría, precio) está al inicio y el servidor trunca en SERP. DoD-5 (unicidad) se cumple → pulido de copy opcional en regeneración.
- **H3 (nota de patrón)**: títulos de fichas usan `{Producto} — Vera Store` sin el sufijo "| Pocitos, Montevideo" del patrón §9 (ej. en el PRD). Únicos, descriptivos y con el término perseguido → no afecta DoD-5; alinear si se desea el patrón literal.

*Nota de interpretación (no hallazgo)*: DoD-7 pide "3–4 relacionados de la misma categoría"; en categorías de 3 ítems (Bolsos, Cuidado) el máximo posible es 2 → las fichas muestran todos los demás de la categoría (lo más cercano al espíritu del criterio; el inventario §2.2 fija esos tamaños).

---

## 6. Veredicto

### ✅ **SHIP**

Los 12 DoD se cumplen con evidencia en disco, la estructura es 1:1 con el modelo canónico Tienda (7 fijas + 4 categorías + 14 fichas + utilitarias/infra), R1 y las restricciones demo (PIN 0000, `verastore_demo_orders`) están vigentes, el sitio opera como subruta con rutas 100% relativas y `data-site-base` coherente, y el peso del bundle está dentro de presupuesto (395,57 KiB < 400 KiB). Los hallazgos H1–H3 son notas de pulido SEO/copy, sin impacto funcional ni en los criterios de aceptación. El review previo (0 P0 / 1 P1 / 7 P2) quedó resuelto y verificado uno por uno (estado drawer, CTA carrito, header pedido, tags SEO, tablas caption, empty-state, og:image PNG); `verify.js` pasa 10/10 desde su directorio.

Se procede a marcar el PRD como **Shipped** y a sincronizar con el repositorio git (`fedMiranda/Cuadra.git`, master).