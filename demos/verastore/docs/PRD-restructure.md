# PRD: Restructuración de Vera Store (CUADRA Tienda) — one-page → sitio multi-página

**Status**: Shipped · **Autor**: PM · **Fecha**: 2026-09-13 · **Versión**: 1.0
**Run**: 1/5 — Reestructurar demo Vera Store · **Stakeholders**: UI Designer, Orion (Workflow Orchestrator)
**URL pública**: `https://cuadrastudio.uy/demos/verastore/` (subruta del sitio corporativo Cuadra — las rutas internas son **relativas**, nunca root-relative absolutas)

---

## 1. Problema y objetivo

Vera Store (demo de la vertical **CUADRA Tienda**) es hoy una landing one-page: el catálogo completo (14 productos, 4 categorías) vive inline en `index.html` con anclas (`#catalogo`, `#destacados`). El modelo de producto CUADRA (canonizado en `generator/pages.js` y `docs/estructura-webs-cuadra.md`) exige **URLs reales por catálogo, categoría y producto**: "Google indexa URLs, no secciones". La vertical Tienda es donde esta estructura "no es opcional" (§5 de estructura-webs-cuadra).

**Objetivo**: convertir el demo en un sitio multi-página de 27 URLs indexables + utilitarias, fiel al modelo canónico Tienda, manteniéndolo **estático sin build**, con identidad ficticia y aviso DEMO en todas las páginas.

**Reglas que gobiernan todas las decisiones**:
- R1: demo ficticio → aviso "Sitio de demostración" en el footer de **todas** las páginas.
- R2: subruta `/demos/verastore/` → todo link/asset **relativo** (con `../` según profundidad), nunca `href="/..."`.
- R3: nunca una página vacía (regla dura del modelo, §2).
- R4: `admin.html`, `gracias.html`, `404.html`, `privacy.html` ya existen y funcionan → **no se reescriben**, solo se actualizan links si aplica.

---

## 2. Inventario de páginas finales

Convención de archivos: carpeta + `index.html` (modelo §3.1). Excepciones planas existentes: `admin.html`, `gracias.html`, `404.html`, `privacy.html`.

### 2.1 Inventario completo

| # | Página | URL pública (subruta) | Archivo objetivo | Contenido | Fuente / generación |
|---|--------|----------------------|------------------|-----------|---------------------|
| 1 | Home | `/demos/verastore/` | `index.html` (reescrito) | Hero, destacados (4), entrada a categorías (4 tiles), teaser Nosotros (Camila), reseñas (3), strip contacto, CTA a `/catalogo/` | Estático + JS (`DEMO_CATALOG`) |
| 2 | Catálogo | `/demos/verastore/catalogo/` | `catalogo/index.html` | Grilla completa con filtros por categoría/precio-todos, contadores, intro corta | Estático + JS (`DEMO_CATALOG`) |
| 3–6 | Categoría ×4 | `/demos/verastore/catalogo/{slug}/` | `catalogo/{slug}/index.html` | Intro propia ≥150 palabras + grilla filtrada de la categoría + breadcrumb | Estático (plantilla) + JS con filtro `data-catalog-filter` |
| 7–20 | Producto ×14 | `/demos/verastore/producto/{slug}/` | `producto/{slug}/index.html` | Ficha completa: galería (img), precio, desc larga, variantes con stock, entrega, CTA agregar, 3–4 relacionados, breadcrumb | **Generado** por script desde `DEMO_CATALOG` (ver §7) |
| 21 | Pedido (checkout) | `/demos/verastore/pedido/` | `pedido/index.html` | Carrito expandido (resumen, cantidades, entrega retiro/envío, nombre/teléfono, botón WhatsApp que arma el mensaje → `gracias.html`) | Estático; lógica de `shop.js` |
| 22 | Envíos | `/demos/verastore/envios/` | `envios/index.html` | Zonas/costos/tiempos, retiro en local (dirección+horarios), qué pasa si no estás, FAQ de envíos | Estático (copy manual) |
| 23 | Cambios | `/demos/verastore/cambios/` | `cambios/index.html` | Plazos (15 días), condiciones, pasos por WhatsApp, FAQ cambios | Estático (copy manual) |
| 24 | Talles | `/demos/verastore/talles/` | `talles/index.html` | Tablas reales del demo (Remeras/camisolas S-M-L, Camisas S-M-L, Sweaters M-L), cómo medirse, equivalencias | Estático (copy manual, coherente con el catálogo real) |
| 25 | Nosotros | `/demos/verastore/nosotros/` | `nosotros/index.html` | La marca + bio de Camila (curadora), cómo se produce, punto de retiro en Pocitos, foto | Estático (copy manual, base = sección Camila actual) |
| 26 | Preguntas | `/demos/verastore/preguntas/` | `preguntas/index.html` | FAQ 8–10 preguntas reales del demo (pedido, pagos, stock, reservas, envíos, probador, regalo) | Estático (copy manual, 4 actuales + canon `tienda.json`) |
| 27 | Contacto | `/demos/verastore/contacto/` | `contacto/index.html` | Dirección + mapa, horarios, teléfono, WhatsApp, Instagram, email, cómo llegar | Estático (copy manual) |
| — | **Utilitarias existentes (NO se reescriben)** | | | | |
| 28 | Gracias | `gracias.html` | `gracias.html` | noindex. Resumen del pedido + reenviar WhatsApp | Existente — solo ajustar link "Volver a la tienda" |
| 29 | Admin | `admin.html` | `admin.html` | noindex. Panel de pedidos demo | Existente — sin cambios |
| 30 | 404 | `404.html` | `404.html` | noindex. Error pp | Existente — opcional link a `/catalogo/` |
| 31 | Privacidad | `privacy.html` | `privacy.html` | legal | Existente — sin cambios |
| — | **Infra (nuevas, noindex-agnósticas)** | | | | |
| 32 | sitemap | `sitemap.xml` | `sitemap.xml` | URLs absolutas SOLO de páginas indexables (§6) | Generado por script del inventario |
| 33 | robots | `robots.txt` | `robots.txt` | apunta al sitemap; `Disallow: admin.html, gracias.html, 404.html` | Estático |

**Total: 27 páginas públicas indexables (1 home + 1 catálogo + 4 categorías + 14 productos + 7 contenido/pedido) + 4 utilitarias + 2 infra.**

### 2.2 Slugs — mapeo nombre de categoría → slug (fuente: `DEMO_CATALOG.category`)

| Nombre en catálogo | Slug público | Prod. |
|--------------------|--------------|-------|
| Accesorios | `catalogo/accesorios/` | 4 (aros-sol, collar-luna, gorra-lino, bufanda-ambar) |
| Indumentaria | `catalogo/indumentaria/` | 4 (camisola-nube, remera-basica, camisa-lino, sweater-crudo) |
| Bolsos y Mochilas | `catalogo/bolsos-y-mochilas/` | 3 (bolso-tote, mochila-lona, rinonera-siena) |
| Cuidado y Hogar | `catalogo/cuidado-y-hogar/` | 3 (vela-ambar, jabon-avena, difusor-savia) |

Slugs de producto = `id` del item en `DEMO_CATALOG` (14 ids: `aros-sol`, `collar-luna`, `gorra-lino`, `bufanda-ambar`, `camisola-nube`, `remera-basica`, `camisa-lino`, `sweater-crudo`, `bolso-tote`, `mochila-lona`, `rinonera-siena`, `vela-ambar`, `jabon-avena`, `difusor-savia`).
*Nota de drift*: el ejemplo canónico usa `bolso-tote-roma`; el demo usa id `bolso-tote`. Para esta restauración el **id del demo es la fuente de verdad** (url `producto/bolso-tote/`). Si en el futuro se regenera desde `generator/examples/tienda.json`, alinear ids y slugs.

---

## 3. Justificación vs modelo canónico Tienda

### 3.1 Páginas añadidas (todas del modelo canónico, plan equivalente **Profesional**)

| Página | Plan canónico | Por qué entra en el demo |
|--------|---------------|--------------------------|
| `catalogo/` + 4 categorías + 14 productos | Básico (generadas) | Es el núcleo del argumento de venta de Tienda; el demo debe mostrar exactamente esto |
| `pedido/` | Básico | Paso del flujo de conversión (criterio 3 de §2 del modelo) |
| `envios/` | Básico | Objeción previa a compra; contenido salvado de las secciones FAQ/contacto actuales |
| `talles/` y `cambios/` | Profesional | El demo demuestra el plan Profesional (fichas con variantes talle/color y stock justifican la guía de talles y la política de cambios). Suman 2 páginas con contenido real |
| `nosotros/`, `preguntas/`, `contacto/` | Básico | Núcleo común de 6 páginas (§3.2 del modelo); la sección Camila/FAQ/contacto ya existe en el one-page → se promueven a URLs reales |

### 3.2 Páginas que NO se crean (omisiones conscientes)

| Página canónica | Por qué se omite |
|-----------------|------------------|
| `lookbook/` (Premium, `needs: gallery ≥4`) | **No existe contenido**: no hay producción fotográfica ni feed IG; los SVGs de producto son tarjetas, no un lookbook. Crearla violaría la regla dura "nunca página vacía o de tres líneas" (§2). Se omite hasta que el demo tenga assets reales. |
| `promociones/`, `fidelidad/` (Premium) | No hay datos de promos ni programa de fidelidad en `SHOP_CONFIG`. Faltaría contenido real (`needs` no se cumple). |
| `novedades/` + fichas (Premium, blog) | No hay posts. Omitido por el mismo `needs: has('posts',1)`. |
| `opiniones/` (Premium, `needs: reviews ≥3`) | El demo tiene 3 testimonios estáticos. Por §3.8 del modelo, los testimonios en plan básico/pro se **pliegan como sección de la home** → quedan en la home, no como página. Si el demo sumara más reseñas, se reabre. |
| `terminos/` (Básico, común) | No existe hoy en el demo; sólo está `privacy.html`. Agregar una página legal de 3 líneas viola la regla de contenido mínimo. Revisitar si el demo necesita set legal completo. |
| `galeria/` | El modelo Tienda ya la excluye (`...filter(p => p.id !== 'galeria')` en `pages.js`). |
| Árbol `/en/` (espejo inglés) | Fuera de alcance del demo (feature Profesional no priorizada acá). |
| `404`, `admin`, `gracias`, `privacidad` | No se reescriben (§R4); viven con su nombre plano actual por lo que ya existen y funcionan. |

---

## 4. Qué se conserva del one-page, y a dónde viaja

| Sección actual (index.html) | Destino en el sitio multi-página |
|------------------------------|-----------------------------------|
| Hero (eyebrow, tagline, CTA "Ver catálogo", badges envío todos UY / retiro / WhatsApp) | **Home** — intacto; CTA ahora → `catalogo/` |
| "Lo más vendido" (`#destacados`, 4 productos) | **Home** — bloque destacados; cada card enlaza a `producto/{slug}/` (link real, no modal) |
| Catálogo completo (`#catalogo` + filtros + grilla 14) | **`catalogo/`** — la sección deja de vivir en la home; la home conserva un bloque de enlace + 4 tiles de categoría |
| Ficha de producto (modal) | **`producto/{slug}/`** — el modal se retira de las páginas públicas; su rol lo cumplen las fichas reales (la función `SHOP.openModal` queda disponible pero desactivada por defecto). Se **preserva** `id="product-card"` en la primera card del catálogo (gate E2E existente) |
| "Conocé a Camila" (`#camila`) | **`nosotros/`** — la bio de Camila es el contenido "quién está detrás" del modelo; la home deja un teaser con foto + link |
| Reseñas (`#resenas`, 3 testimonios) | **Home** — se mantienen como bloque (por §3.8 no alcanzan página propia) |
| FAQ (`#faq`, 4 preguntas) | **`preguntas/`** — las 4 actuales + preguntas del canon `tienda.json` (stock al día, reservas, tarjeta, probador, regalo) para llegar a 8–10 |
| Contacto (`#contacto`: tel, email, IG, dirección) | **`contacto/`** — se agregan horarios (L–V 10–19, Sáb 10–14) y mapa; la home deja un strip de contacto |
| Drawer carrito (form + WhatsApp) | **`pedido/`** — el checkout completo vive en su propia URL (§3.7 del modelo); el drawer pasa a **mini-cart** (resumen + "Ir a mi pedido") en todas las páginas |
| Footer (marca, navegación, contacto, demo notice) | **Footer estándar** en todas las páginas con grupos Explorar / Atención / Legal + aviso DEMO (ver §5.3) |

---

## 5. Navegación

### 5.1 Nav principal desktop (máx. 5 ítems + CTA — modelo §5.4 plan Profesional)

| Orden | Label | Href (relativo desde cualquier página) |
|-------|-------|----------------------------------------|
| — | (brand VERA STORE) | `index.html` / según profundidad `../index.html` |
| 1 | Catálogo | `<base>/../catalogo/` |
| 2 | Talles | `<base>/../talles/` |
| 3 | Envíos | `<base>/../envios/` |
| 4 | Nosotros | `<base>/../nosotros/` |
| 5 | Contacto | `<base>/../contacto/` |
| CTA | **Mi pedido (n)** | `<base>/../pedido/` — contador `[data-cart-count]` vivo desde localStorage |

Estado activo visible en la página actual. El nav se emite **en el HTML** de cada página (nunca inyectado por JS — §3.3 del modelo).

### 5.2 Drawer móvil

Mismos 5 ítems + CTA, más: desplegable **Catálogo** con las 4 categorías (`catalogo/accesorios/`, `catalogo/indumentaria/`, `catalogo/bolsos-y-mochilas/`, `catalogo/cuidado-y-hogar/`), y bloque de contacto WhatsApp al pie (como hoy). Cierra al navegar.

### 5.3 Footer (grupos del modelo — `FOOTER_GROUPS`)

| Grupo | Links |
|-------|-------|
| **Explorar** | Catálogo · Categorías (4) · Nosotros |
| **Atención** (ayuda) | Pedido · Talles · Envíos · Cambios · Preguntas · Contacto |
| **Legal** | Privacidad (`privacy.html`) · Panel de pedidos (`admin.html`, rel=nofollow) |
| Col. NAP | Vera Store · 21 de Setiembre 3421, Pocitos · 099 000 000 · L–V 10–19 / Sáb 10–14 (idéntica al contacto) |
| Col. social | WhatsApp · Instagram · hola@verastore.uy |
| Barra inferior | © año + "Sitio de demostración. Todos los nombres, productos y datos son ficticios." (**en todas las páginas**, R1) |

---

## 6. Breadcrumbs

Patrón padre-hijo (visible + `BreadcrumbList` JSON-LD con URLs absolutas):

| Página | Breadcrumb |
|--------|-----------|
| `catalogo/` | Inicio › Catálogo |
| `catalogo/{categoria}/` | Inicio › Catálogo › {Cat} |
| `producto/{slug}/` | Inicio › Catálogo › {Cat} › {Producto} |

El crumb de producto es **dos niveles de padre** (categoría real del producto, no solo catálogo), enlazando a `catalogo/`, `catalogo/{categoria}/` y producto (self).

---

## 7. Fichas de producto: decisión estática vs JS-render

**Decisión: URL estática por producto — `producto/{slug}/index.html` x14 — generadas por un script Node en desarrollo (no runtime).**

Justificación (alineada con `estructura-webs-cuadra.md` §5.3, "fichas estáticas, no `?id=`"):
1. `producto.html?id=aros-sol` es **una sola URL** para Google → destruye el argumento de venta del demo ("te encuentran por producto").
2. El demo ES la vitrina de venta de la vertical Tienda: sin páginas reales por producto no demuestra el producto.
3. HTML estático con title/description/OG/`Product`+`Offer`+`BreadcrumbList` schema propios queda **indexable sin JS** (cumple §3.5: el nav y las fichas se emiten en el HTML).
4. Peso: 14 páginas × ~6–8 KB ≈ +100 KB sobre los ~128 KB actuales — trivial para estático, imposible de lograr con framework.
5. "Sin build" se respeta: el script (`scripts/generate-products.js`, dev-time) emite HTML plano leyendo `js/config.js` (`DEMO_CATALOG`); **lo deployado es HTML+CSS+JS vanilla sin build step**. El script reemplaza a escribir 14 archivos a mano (evita drift de scaffold y breadcrumbs); se regenera cuando cambia el catálogo.
6. Hidratación: variantes/stock/pills se imprimen estáticos desde `DEMO_CATALOG.variants`; cantidad + "agregar al carrito" usan `shop.js` en modo ficha (ver §8.2), leyendo localStorage `verastore_cart` → carrito persiste entre páginas.

*Contraste*: alternativa "JS-render de una sola URL" — rechazada (punto 1). Alternativa "14 páginas escritas a mano" — descartada por riesgo de desincronización con el catálogo y trabajo repetitivo sin valor.

---

## 8. Requisitos de datos por página (campos de `window.SHOP_CONFIG`)

| Página | Campos que la alimentan | Uso |
|--------|-------------------------|-----|
| Home | `tenant.{name,tagline,phone,phoneDisplay,address,instagram}`, `DEMO_CATALOG` (featured ids: camisola-nube, bolso-tote, aros-sol, vela-ambar, same as `renderFeatured` de shop.js) | Hero, highlighted, NAP, CTA |
| Catálogo | `DEMO_CATALOG` completo; categorías derivadas de `p.category` (para chips/contadores) | Grilla + filtros |
| Categoría | `DEMO_CATALOG.filter(p => p.category === '{Nombre}')` según slug (tabla §2.2) | Grilla filtrada; intro como copy estático |
| Producto | `DEMO_CATALOG` por `id` (=slug): `name`, `price`, `desc` (base de `long`), `variants[].{talle,color,stock}`, `stock` (sin variantes), `delivery` (→ `deliveryLabel`), `img`, `category` (para breadcrumb + relacionados de la misma categoría, 3–4 ítems) | Ficha + schema Product/Offer/Breadcrumb + relacionados |
| Pedido | `tenant` (NAP del mensaje), `whatsapp.base`, `localStorage['verastore_cart']` | Carrito expandido, mensaje WhatsApp (reusa `SHOP.logic.buildWhatsAppMessage`), `saveOrder` + redirect a `gracias.html` |
| Envíos / Cambios / Talles / Nosotros / Preguntas / Contacto | **Copy estático** (no requiere claves nuevas en config). Zonas/costos y política de cambios se adaptan del canon `generator/examples/tienda.json` (shipping/returns/faq/sizeGuide/about/hours) al catálogo real del demo (ej. talles solo S–L porque el demo no vende XL) |
| Todas | `tenant.currency` (UYU) para `formatPrice`; `demo.storageKey` | |

### 8.1 Ajustes necesarios en `shop.js` (técnicos, para el stage de build)

1. **Resolución de rutas**: `root.location.href = 'gracias.html'` (hoy en el handler de WhatsApp) **se rompe desde páginas anidadas**. Introducir una constante de base por página — atributo `data-site-base` en `<html>` (`""` en home, `"../"` en `catalogo/`, `"../../"` en `producto/{slug}/`) que `shop.js` usa para construir URLs internas relativas.
2. **Modo categoría**: los grids cargan un filtro inicial leyendo `data-catalog-filter="Accesorios"` (nuevo hook; `renderFilters`/`renderCatalog` ya soportan estado).
3. **Modo ficha** (`producto/{slug}/`): detectar `[data-product]` en `<main>`; poblar variantes/stock/CTA usando la lógica pura existente (sin modal).
4. **Drawer mini-cart**: el CTA del drawer pasa a "Ir a mi pedido" (link a `pedido/`); el form de checkout (nombre/tel/entrega + WhatsApp) se mueve a la página `pedido/`. `saveOrder` y redirect a `gracias.html` ocurren solo desde `pedido/`.
5. `injectStructuredData` (ItemList) deja de emitir `url: origin + '#' + id` → apuntar a URLs reales `producto/{id}/` (o eliminar el bloque en fichas, que llevan schema propio).

### 8.2 Página `pedido/` (flujo limpio, §3.7)

Header reducido (brand + "volver"), sin footer largo. Contenido: resumen de ítems con cantidades editables, toggle entrega retiro/envío, campos nombre/teléfono, total, botón "Pedir por WhatsApp" (arma mensaje, `saveOrder()`, redirect `gracias.html`), "vaciar carrito". `noindex` no requerido para el demo (sin parámetros), pero se recomienda por consistencia canónica.

---

## 9. SEO obligatorio por página

| Elemento | Regla |
|----------|-------|
| `<title>` | Único por página. Patrón: `{Página} — Vera Store | Pocitos, Montevideo` (ej. "Aros Sol — Vera Store | Pocitos, Montevideo") |
| `meta description` | Única, **140–160 caracteres**, escrita (no compuesta), inyectando datos reales (precio, talle, categoría) |
| `link rel="canonical"` | Absoluta `https://cuadrastudio.uy/demos/verastore/...` en TODAS (también home) |
| OG / Twitter | `og:type`, `og:title`, `og:description`, `og:url`, `og:image` absoluta por página; en fichas la imagen es el SVG del producto (limitación del demo: no hay raster; aceptable) |
| JSON-LD | Home: `ClothingStore`+`WebSite`. Catálogo: `ItemList`. Categoría: `CollectionPage`+`ItemList`. Producto: `Product`+`Offer` (`priceCurrency: UYU`, `availability` por variante/stock) + `BreadcrumbList`. Preguntas: `FAQPage` (opcional). Contacto: `ContactPage`. Nosotros: `AboutPage` |
| H1 | Uno por página, con el término perseguido (nombre del producto / de la categoría) |
| `sitemap.xml` | Solo URLs indexables (excluye `gracias.html`, `admin.html`, `404.html`, `privacy.html` mantiene `noindex`? — `privacy.html` NO lleva noindex hoy, se incluye con prioridad 0.2) |
| `robots.txt` | `Disallow: /demos/verastore/admin.html`, `gracias.html`, `404.html`; `Sitemap:` absoluto |

---

## 10. Criterios de aceptación (DoD) — verificables en disco

1. **Rutas 100% relativas**: cero `href="/` o `src="/` en todo el sitio (grep). Desde cada archivo, la profundidad `../` resuelve CSS/JS/img/links internos (verificar: `css/styles.css` alcanzable desde `producto/aros-sol/` como `../../css/styles.css`).
2. **Inventario completo emitido**: existen `catalogo/index.html`, las 4 `catalogo/{slug}/index.html`, las 14 `producto/{slug}/index.html`, `pedido|envios|cambios|talles|nosotros|preguntas|contacto/index.html`, `sitemap.xml`, `robots.txt`. Ninguna URL del sitemap apunta a archivo inexistente.
3. **Ninguna página vacía**: cada página tiene ≥1 `<h1>` y ≥150 palabras de copy O ≥6 ítems (grillas, FAQ ≥8). La intro de cada categoría ≥150 palabras (no relleno, adaptada del canon).
4. **Aviso DEMO (R1)**: el string "Sitio de demostración" está en el footer de **todas** las `*.html` públicas y utilitarias (grep por página).
5. **SEO único por página**: `title` y `meta description` únicos en todo el sitio; `canonical` absoluta presente en todas; 1 solo `<h1>`; JSON-LD parseable por página; `<img>` con `alt`.
6. **Carrito persiste entre páginas**: agregar un producto en home → navegar y ver el contador `Mi pedido (n)` igual en `producto/`, `catalogo/` y `pedido/`; `localStorage['verastore_cart']` conserva items en el viaje; `saveOrder` desde `pedido/` y redirect a `gracias.html` sin 404 (gracias resuelve desde rutas anidadas).
7. **Fichas enlazadas**: toda card del catálogo/home/categoría enlaza a su URL real con `<a href>` (no solo JS), y cada ficha enlaza a 3–4 productos de su misma categoría + breadcrumb visible (Inicio › Catálogo › Cat › Prod).
8. **Flujo checkout único en `pedido/`**: el drawer es mini-cart; el form completo (nombre, teléfono, entrega, WhatsApp, vaciar) solo en `pedido/`.
9. **Utilitarias intactas**: `admin.html`, `404.html`, `privacy.html` sin cambios funcionales; `gracias.html` funciona con el pedido guardado y link a tienda; `admin.html` y `gracias.html`/`404.html` siguen `noindex`.
10. **Peso**: suma de HTML de las 27 páginas + CSS + JS ≲ 400 KB (estático, sin framework, sin build step en deploy).
11. **Navegación**: nav con máx. 5 ítems + CTA "Mi pedido (n)" con contador vivo; drawer móvil con las 4 categorías; estado activo por página; footer con los 3 grupos + columna NAP + aviso DEMO.
12. **Preview local OK**: abrir el sitio desde disco (file://) sin errores de assets ni links rotos (prueba manual final).

---

## 11. Fuera de alcance (explícito)

- **No** rediseñar identidad visual (tipografías Playfair/Work Sans, paleta, layout base se conservan).
- **No** integrar la API multi-tenant (`api.enabled` sigue `false`; el catálogo sigue siendo `DEMO_CATALOG` local).
- **No** implementar pagos reales (ni tarjetas, ni checkout externo — el flujo sigue siendo WhatsApp).
- **No** reescribir `admin.html`, `gracias.html`, `404.html`, `privacy.html`.
- **No** crear páginas Premium sin contenido: lookbook, promociones, fidelidad, novedades/blog, opiniones, términos.
- **No** árbol `/en/`, **no** multi-idioma, **no** pwa/manifest nuevo.
- **No** tocar el registro canónico `generator/pages.js` ni el generator (el demo se construye dentro de las reglas del modelo, fuera de él).
- **No** métricas/analytics de terceros (el demo no usa cookies de tracking).

---

## 12. Anexo A — Pruebas y verificación sugerida

```powershell
# 1. Sin rutas absolutas con / inicial
rg -n 'href="/|src="/' .  # → 0 resultados (ignorar http(s):// y #anclas)

# 2. Aviso DEMO en todas las páginas
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
  if (-not (Select-String -Path $_.FullName -Pattern 'Sitio de demostración' -Quiet)) { $_.FullName }
}  # → sin salida

# 3. Títulos únicos
rg -o '<title>[^<]+' --glob *.html | Sort-Object | Group-Object | Where-Object Count -gt 1

# 4. URLs del sitemap existentes
# (script sobre sitemap.xml → Test-Path por cada <loc> local)
```

## 13. Anexo B — Peso estimado

| Componente | Hoy | Pospuesto |
|-----------|-----|-----------|
| index.html | ~19 KB | ~22 KB (home enxugado) |
| 14 fichas producto | — | ~8 KB c/u ≈ +112 KB |
| 6 páginas copy + categorías + catálogo + pedido | — | ~30 KB |
| CSS + JS + config | ~67 KB | ~75 KB (shop.js con modo ficha/categoria) |
| **Total** | **≈128 KB** | **≈240 KB estático** — dentro de presupuesto |

---

*Documento operativo — PM. Siguiente handoff: UI Designer (sketch del shell multi-página). Orion verifica el PRD en disco antes de avanzar.*

---

## Estado: Shipped

Validación final independiente completada (Stage 5, 2026-09-13): veredicto **SHIP** — 12/12 DoD verificados sobre disco, estructura 1:1 con el modelo canónico Tienda, peso 395,57 KiB < 400 KiB, `verify.js` 10/10. Hallazgos no bloqueantes registrados en `docs/validation-final.md` (H1–H3, notas de pulido SEO/copy). URLs indexables sincronizadas con sitemap/robots y rutas 100% relativas para subruta `/demos/verastore/`.