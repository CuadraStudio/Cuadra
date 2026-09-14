'use strict';
/**
 * Vera Store — generate-pages.js (dev-time, NO va a producción)
 * ====================================================================
 * Genera las páginas estáticas del demo (SEO = URL real por archivo):
 *
 *   - catalogo/index.html                  (grilla completa + chips estáticos)
 *   - catalogo/{slug}/index.html ×4        (grilla por categoría + intro)
 *   - producto/{slug}/index.html ×14       (ficha completa + relacionadas)
 *   - sitemap.xml                          (URLs absolutas indexables)
 *
 * Fuente de verdad: js/config.js → window.SHOP_CONFIG.DEMO_CATALOG.
 * Los datos de producto (precio, variantes, stock, entrega, img) se leen
 * del catálogo; el copy de intro/desc larga vive acá y se regenera junto
 * con el HTML cuando cambia el catálogo.
 *
 * Cómo correr:
 *   node scripts/generate-pages.js
 *
 * Cierre: los archivos generados quedan commiteables (HTML plano, sin
 * build step en deploy). Si el catálogo cambia, volver a correr este
 * script y commitear la diferencia. Las páginas de contenido (home,
 * pedido, envios, cambios, talles, nosotros, preguntas, contacto) y las
 * utilitarias se editan a mano y NO se generan acá.
 * ====================================================================
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var DEMO_DIR = path.resolve(__dirname, '..');
var IMG_DIR = 'img';
var PUBLIC_BASE = 'https://cuadrastudio.uy/demos/verastore/';

/* ------------------------- Cargar DEMO_CATALOG ------------------------- */
var configJs = fs.readFileSync(path.join(DEMO_DIR, 'js', 'config.js'), 'utf8');
var sandbox = { window: {} };
vm.runInNewContext(configJs, sandbox);
var cfg = (sandbox.window && sandbox.window.SHOP_CONFIG) || {};
var CATALOG = (cfg.DEMO_CATALOG || []).slice();
var TENANT = cfg.tenant || {};

var CURRENCY = TENANT.currency || 'UYU';

/* ------------------------- Utilidades de datos ------------------------- */
function fmtPrice(n) {
  return '$ ' + (Number(n) || 0).toLocaleString('es-UY');
}

function slugOf(name) {
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

var CATEGORY_SLUG = {};
CATALOG.forEach(function (p) {
  if (!CATEGORY_SLUG[p.category]) { CATEGORY_SLUG[p.category] = slugOf(p.category); }
});

function cats() {
  var list = [];
  CATALOG.forEach(function (p) { if (list.indexOf(p.category) === -1) { list.push(p.category); } });
  return list;
}

function byCat(cat) { return CATALOG.filter(function (p) { return p.category === cat; }); }

function soldOut(p) {
  if (p.variants && p.variants.length) { return p.variants.every(function (v) { return v.stock === 'agotado'; }); }
  return p.stock === 'agotado';
}

function deliveryLabel(p) {
  if (p.delivery === 'envio') { return 'Envío a domicilio'; }
  if (p.delivery === 'retiro') { return 'Retiro en local'; }
  return 'Retiro en local o envío a domicilio';
}

function corresp(p) { return { id: p.id, name: p.name }; }

/* ---------------------- Copy: intros de categoría ----------------------- */
/* Cada intro supera las 150 palabras (regla R3 — nunca página vacía). */
var CATEGORY_COPY = {
  'Accesorios': [
    'La línea de accesorios de Vera Store reúne piezas chicas con carácter: aros, collares, gorras y bufandas pensados para combinar con todo y durar más de una temporada. Arrancamos con los Aros Sol ($690), bañados en oro, livianos y con textura mate, perfectos para usar todos los días sin que pesen. El Collar Luna ($890) suma un dije de media luna en acero quirúrgico con cadena fina, un básico que no se oxida ni mancha la piel.',
    'Para el verano y la media estación está la Gorra de Lino ($1.190), con visera curva y cierre ajustable, disponible en arena, terracota y verde salvia. Y cuando bajan las temperaturas, la Bufanda Ámbar ($990) es la primera que se agota: tejido suave en tono ámbar, abrigada y liviana a la vez.',
    'Todas las piezas se pueden retirar en el local de Pocitos (21 de Setiembre 3421) o pedir con envío a todo Uruguay; los costos y tiempos se coordinan por WhatsApp al momento del pedido. Como trabajamos con lotes chicos y algunas variantes se agotan durante la semana, te recomendamos escribirnos antes si querés asegurar un color puntual: te confirmamos el stock real y, si lo que buscás no está, te avisamos al reponer.'
  ].join(' '),

  'Indumentaria': [
    'La ropa de Vera Store está pensada para vestir todos los días sin pensar dos veces: cortes simples, telas que respiran y colores que combinan entre sí. La Camisola Nube ($1.900) abre la línea: viscosa con caída fluida y mangas amplias, cómoda de día y de noche. La Remera Básica ($1.290) es la base del guardarropa, en algodón peinado con corte relajado y cuello redondo, disponible en crema y tinta.',
    'Para un escalón más formal, la Camisa de Lino ($2.400) usa lino europeo con botones de nácar: transpirable, elegante y fácil de combinar. Y cuando el frío aprieta, el Sweater Crudo ($2.700) de punto grueso con hombros caídos y puños anchos es el abrigo que pedimos por WhatsApp todos los inviernos.',
    'Trabajamos talles S, M y L (el demo no vende XL: la guía de talles en /talles/ te ayuda a elegir). La mayoría de los modelos se pueden retirar en el local de Pocitos o pedir con envío; te confirmamos stock real de cada talle y color antes de armar el pedido, así nunca llega el momento de hacer un cambio por talle.'
  ].join(' '),

  'Bolsos y Mochilas': [
    'Los bolsos y mochilas de Vera Store nacieron por una necesidad simple: que entre todo y que dure. El Bolso Tote Roma ($2.900) es el más pedido de la casa: cuero sintético con interior reforzado y bolsillo con cierre, en terracota o tinta. Le alcanza para el día de trabajo, los libros y, si hace falta, el tupper.',
    'La Mochila de Lona ($2.350) está hecha con lona encerada resistente al agua y tiene compartimento para notebook: cómoda para la facultad y para la bici. La Riñonera Siena ($1.490) cierra el trío: compacta, con dos cierres y correa ajustable, para salir con las manos libres.',
    'Los tres modelos se pueden retirar en Pocitos o pedir con envío a todo Uruguay. Como son piezas que se usan todos los días, prestamos atención extra al control de costuras y terminaciones antes de despachar; si algo no te convence cuando lo tenés en mano, el cambio dentro de los 15 días lo cubre.'
  ].join(' '),

  'Cuidado y Hogar': [
    'La línea Cuidado y Hogar es la más regalona de Vera Store: tres productos chicos, honestos y con aroma a regalo de cumpleaños. La Vela Ámbar ($850) está hecha con cera de soja y aroma a ámbar y vainilla; son 40 horas de encendido y el vaso se reutiliza como maceta o portalápices. El Jabón de Avena ($350) es artesanal, de avena y miel, apto para piel sensible y hecho a mano en tandas chicas.',
    'El Difusor Savia ($1.190) perfuma el ambiente por semanas con notas verdes y cítricas: llega con sus varillas listo para usar. Son los productos que más se envían como regalo, así que también los envolvemos sin cargo si avisás por WhatsApp al momento del pedido.',
    'Por el tipo de producto, estos artículos se recomiendan para retiro en el local de Pocitos (21 de Setiembre 3421), aunque los envíos a todo Uruguay también están disponibles; el vidrio de la vela y el difusor viaja bien protegido. Coordinamos costos y tiempos por WhatsApp.'
  ].join(' ')
};

var CATEGORY_H1 = {
  'Accesorios': 'Accesorios',
  'Indumentaria': 'Indumentaria',
  'Bolsos y Mochilas': 'Bolsos y Mochilas',
  'Cuidado y Hogar': 'Cuidado y Hogar'
};

var CATEGORY_DESC = {
  'Accesorios': 'Aros, collares, gorras y bufandas con carácter para sumar todos los días. Precios desde $690 hasta $1.190, con retiro en Pocitos o envío a todo Uruguay.',
  'Indumentaria': 'Camisolas, remeras, camisas de lino y sweaters en talles S a L. Precios desde $1.290 hasta $2.700, con stock real confirmado por WhatsApp.',
  'Bolsos y Mochilas': 'Tote, mochila de lona y riñonera hechas para durar. Precios desde $1.490 hasta $2.900, con retiro en local o envío a todo el país.',
  'Cuidado y Hogar': 'Vela de soja, jabón de avena y difusor de varillas: regalos infalibles desde $350. Retiro recomendado en Pocitos y envío disponible.'
};

var CATEGORY_TILE_IMG = {
  'Accesorios': 'img/accesorios-gorra.jpg',
  'Indumentaria': 'img/indumentaria-camisola.jpg',
  'Bolsos y Mochilas': 'img/bolsos-tote.jpg',
  'Cuidado y Hogar': 'img/hogar-vela.jpg'
};

/* ------------------- Copy: descripción larga de producto ------------------ */
var PRODUCT_EXTRA = {
  'aros-sol': 'Van bañados en dorado o plateado con terminación mate, livianos y sin níquel, pensados para usarse de mañana a noche sin molestias.',
  'collar-luna': 'El dije mide unos 16 mm y cuelga de una cadena fina ajustable. Se puede usar como collar solo o junto a otros dijes para armar capas.',
  'gorra-lino': 'El lino lavado hace que la gorra sea fresca incluso los días de calor, y el cierre trasero ajustable permite regular el ajuste.',
  'bufanda-ambar': 'La trama abrigada pero liviana la hace ideal para las mañanas frescas de otoño y para llevar en el bolso por si refresca.',
  'camisola-nube': 'La viscosa cae con movimiento sin ajustarse, y las mangas amplias la hacen cómoda para trabajar y para salir de noche. Viene en talles S, M y L.',
  'remera-basica': 'El algodón peinado se siente suave desde el primer lavado y mantiene el color. Corte relajado, ni muy suelto ni muy ajustado.',
  'camisa-lino': 'El lino europeo es transpirable y se va poniendo más lindo con cada lavado; los botones de nácar son el detalle que la saca de lo básico.',
  'sweater-crudo': 'El punto grueso abriga de verdad y el tono crudo combina con todo. Hombros caídos y puños anchos para un corte relajado, en M y L.',
  'bolso-tote': 'Las asas quedan cómodas en el hombro, el interior reforzado aguanta el uso de todos los días y el bolsillo con cierre cuida lo importante.',
  'mochila-lona': 'La lona encerada resiste el agua de una llovizna y se limpia fácil. El compartimento para notebook tiene base acolchada.',
  'rinonera-siena': 'Dos cierres para separar lo esencial (llaves, billetera, celular) y correa ajustable en largo. Cabe un libro chico.',
  'vela-ambar': 'Cera de soja de quema limpia y lenta: 40 horas de encendido. El vaso de vidrio reutilizable se puede volver a usar cuando se termina.',
  'jabon-avena': 'Hecho a mano en tandas chicas con avena y miel, sin fragancias fuertes. Apto para piel sensible y para usar en el día a día.',
  'difusor-savia': 'Las varillas de rattán reparten la fragancia de notas verdes y cítricas de forma pareja. Duración aproximada: 6 a 8 semanas según el ambiente.'
};

var BUY_COPY = '¿Dudas? Escribinos por WhatsApp y te confirmamos stock real, tiempos y talles. Los pedidos se coordinan por WhatsApp y el pago se acuerda al confirmar (transferencia o efectivo).';

/* ------------------------- Shell compartido ------------------------------ */
function headHTML(opts) {
  var title = opts.title;
  var desc = opts.desc;
  var canonical = opts.canonical;
  var ogImage = opts.ogImage || PUBLIC_BASE + 'img/og-preview.png';
  var jsonld = opts.jsonld || [];
  var base = opts.base || '';

  var ld = jsonld.map(function (o) {
    return '<script type="application/ld+json" class="ld-seo">' + JSON.stringify(o).replace(/<\//g, '<\\/') + '</script>';
  }).join('\n  ');

  return '' +
    '<!DOCTYPE html>\n' +
    '<html lang="es" data-site-base="' + base + '">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '  <title>' + title + '</title>\n' +
    '  <meta name="description" content="' + desc + '">\n' +
    '  <link rel="canonical" href="' + canonical + '">\n\n' +
    '  <meta property="og:title" content="' + title + '">\n' +
    '  <meta property="og:description" content="' + desc + '">\n' +
    '  <meta property="og:url" content="' + canonical + '">\n' +
    '  <meta property="og:image" content="' + ogImage + '">\n' +
    '  <meta property="og:type" content="website">\n' +
    '  <meta property="og:site_name" content="Vera Store — Pocitos">\n' +
    '  <meta property="og:locale" content="es_UY">\n' +
    '  <meta name="twitter:card" content="summary_large_image">\n' +
    '  <meta name="robots" content="index, follow, max-image-preview:large">\n' +
    '  <meta name="theme-color" content="#FAF7F2">\n\n' +
    '  <link rel="icon" type="image/svg+xml" href="' + base + 'favicon.svg">\n\n' +
    '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Work+Sans:wght@400;500;600;700&display=swap" media="print" onload="this.media=\'all\'">\n' +
    '  <link rel="stylesheet" href="' + base + 'css/styles.css?v=20260913e">\n' +
    (ld ? '  ' + ld + '\n' : '') +
    '</head>\n';
}

function headerHTML(base, active, activeCat, openCat) {
  active = active || '';
  activeCat = activeCat || '';
  openCat = !!openCat;
  function link(href, label, isActive, extra) {
    return '<li><a class="nav__link" href="' + base + href + '"' +
      (isActive ? ' aria-current="page"' : '') +
      (extra || '') + '>' + label + '</a></li>';
  }
  return '' +
    '<a class="skip-link" href="#main-content">Saltar al contenido</a>\n\n' +
    '  <header class="site-header">\n' +
    '    <div class="site-header__inner">\n' +
    '      <a href="' + base + 'index.html" class="brand" aria-label="Vera Store — Inicio">VERA STORE<span class="brand__dot" aria-hidden="true"></span></a>\n' +
    '      <nav class="nav" aria-label="Principal">\n' +
    '        <ul class="nav__list">\n' +
    link('catalogo/', 'Catálogo', active === 'catalogo') +
    link('talles/', 'Talles', active === 'talles') +
    link('envios/', 'Envíos', active === 'envios') +
    link('nosotros/', 'Nosotros', active === 'nosotros') +
    link('contacto/', 'Contacto', active === 'contacto') +
    '        </ul>\n' +
    '      </nav>\n' +
    '      <div class="header-actions">\n' +
    '        <a class="cart-btn cart-btn--link" href="' + base + 'pedido/" aria-label="Tu pedido (0 productos)">\n' +
    '          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2 3h3l2.6 12.6a2 2 0 0 0 2 1.4h8.7a2 2 0 0 0 2-1.6L22 7H5.3"/></svg>\n' +
    '          <span class="cart-btn__label">Mi pedido</span>\n' +
    '          <span class="cart-btn__count" data-cart-count>0</span>\n' +
    '        </a>\n' +
    '        <button type="button" class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="nav-drawer" aria-label="Abrir menú">\n' +
    '          <span></span><span></span><span></span>\n' +
    '        </button>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </header>\n\n' +
    '  <div class="scrim" data-scrim aria-hidden="true"></div>\n' +
    '  <nav id="nav-drawer" class="nav-drawer" aria-label="Menú móvil">\n' +
    '    <div class="nav-drawer__group">\n' +
    '      <details' + (openCat ? ' open' : '') + '>\n' +
    '        <summary>Catálogo</summary>\n' +
    cats().map(function (c) {
      var activeCatLink = active === 'catalogo' && activeCat === c;
      return '        <a class="nav-drawer__sublink" href="' + base + 'catalogo/' + CATEGORY_SLUG[c] + '/"' +
        (activeCatLink ? ' aria-current="page"' : '') + '>' + c + '</a>';
    }).join('\n') +
    '        <a class="nav-drawer__sublink nav-drawer__sublink--all" href="' + base + 'catalogo/">Ver todo el catálogo</a>\n' +
    '      </details>\n' +
    '    </div>\n' +
    '    <a class="nav-drawer__link" href="' + base + 'talles/"' + (active === 'talles' ? ' aria-current="page"' : '') + '>Talles</a>\n' +
    '    <a class="nav-drawer__link" href="' + base + 'envios/"' + (active === 'envios' ? ' aria-current="page"' : '') + '>Envíos</a>\n' +
    '    <a class="nav-drawer__link" href="' + base + 'nosotros/"' + (active === 'nosotros' ? ' aria-current="page"' : '') + '>Nosotros</a>\n' +
    '    <a class="nav-drawer__link" href="' + base + 'contacto/"' + (active === 'contacto' ? ' aria-current="page"' : '') + '>Contacto</a>\n' +
    '    <a class="nav-drawer__cta btn btn--solid btn--block" href="' + base + 'pedido/">Mi pedido (<span data-cart-count>0</span>)</a>\n' +
    '    <div class="nav-drawer__contact">\n' +
    '      <p>Pedidos por WhatsApp:<br><a href="https://wa.me/59899000000" target="_blank" rel="noopener">099 000 000</a></p>\n' +
    '    </div>\n' +
    '  </nav>\n';
}

var optsActiveCat = ''; // legacy no-op (kept for clarity)

function cartDrawerHTML(base) {
  return '' +
    '  <div id="cart-drawer" class="cart-drawer" role="dialog" aria-modal="true" aria-label="Carrito de compras" aria-hidden="true">\n' +
    '    <div class="cart-drawer__head">\n' +
    '      <h2>Tu carrito</h2>\n' +
    '      <button type="button" class="cart-drawer__close" data-cart-close aria-label="Cerrar carrito">×</button>\n' +
    '    </div>\n' +
    '    <div id="cart-items" class="cart-items"></div>\n' +
    '    <div class="cart-drawer__foot">\n' +
    '      <div class="cart-total">\n' +
    '        <span>Subtotal</span>\n' +
    '        <strong id="cart-total">$ 0</strong>\n' +
    '      </div>\n' +
    '      <div class="cart-actions">\n' +
    '        <a class="btn btn--solid btn--block" href="' + base + 'pedido/">Ir a mi pedido</a>\n' +
    '        <button type="button" id="cart-clear" class="btn btn--ghost" disabled>Vaciar carrito</button>\n' +
    '      </div>\n' +
    '      <a class="cart-drawer__back" href="' + base + 'catalogo/">Seguir comprando</a>\n' +
    '    </div>\n' +
    '  </div>\n\n' +
    '  <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>\n';
}

function scriptsHTML(base) {
  return '  <script src="' + base + 'js/config.js"></script>\n' +
    '  <script src="' + base + 'js/shop.js"></script>\n';
}

function footerHTML(base, brief) {
  var g = function (title, items) {
    return '        <div>\n' +
      '          <p class="footer-title">' + title + '</p>\n' +
      '          <ul class="footer-list">\n' +
      items.map(function (it) {
        // links externos (https://, mailto:) NO llevan prefijo base relativo
        var url = it.ext ? it.h : base + it.h;
        var target = !it.noNew && it.ext && it.h.indexOf('mailto:') !== 0 ? ' target="_blank" rel="noopener"' : '';
        return '            <li><a href="' + url + '"' + (it.rel ? ' rel="' + it.rel + '"' : '') + target + '>' + it.label + '</a></li>';
      }).join('\n') +
      '\n          </ul>\n' +
      '        </div>\n';
  };
  var explorar = g('Explorar', [
    { h: 'catalogo/', label: 'Catálogo' },
    { h: 'catalogo/accesorios/', label: 'Accesorios' },
    { h: 'catalogo/indumentaria/', label: 'Indumentaria' },
    { h: 'catalogo/bolsos-y-mochilas/', label: 'Bolsos y Mochilas' },
    { h: 'catalogo/cuidado-y-hogar/', label: 'Cuidado y Hogar' },
    { h: 'nosotros/', label: 'Nosotros' }
  ]);
  var atencion = g('Atención', [
    { h: 'pedido/', label: 'Tu pedido' },
    { h: 'talles/', label: 'Talles' },
    { h: 'envios/', label: 'Envíos' },
    { h: 'cambios/', label: 'Cambios' },
    { h: 'preguntas/', label: 'Preguntas frecuentes' },
    { h: 'contacto/', label: 'Contacto' }
  ]);
  var legal = g('Legal', [
    { h: 'privacy.html', label: 'Privacidad' },
    { h: 'admin.html', label: 'Panel de pedidos', rel: 'nofollow' }
  ]);
  var segui = g('Seguinos', [
    { h: 'https://wa.me/59899000000', label: 'WhatsApp', ext: true },
    { h: 'https://instagram.com/verastore.demouy', label: '@verastore.demouy', ext: true },
    { h: 'mailto:hola@verastore.uy', label: 'hola@verastore.uy', ext: true, noNew: true }
  ]);

  var full = '' +
    '  <footer class="site-footer">\n' +
    '    <div class="wrap">\n' +
    '      <div class="footer-grid">\n' +
    '        <div class="footer-brand">\n' +
    '          <a href="' + base + 'index.html" class="brand" aria-label="Vera Store — Inicio">VERA STORE<span class="brand__dot" aria-hidden="true"></span></a>\n' +
    '          <p>Accesorios e indumentaria boutique en Pocitos, Montevideo. Tu look, en un clic. Pedido por WhatsApp.</p>\n' +
    '          <p class="footer-nap">21 de Setiembre 3421, Pocitos · <a href="tel:+59899000000">099 000 000</a> · L–V 10–19 / Sáb 10–14</p>\n' +
    '        </div>\n' +
    explorar +
    atencion +
    '        <div>\n' +
    legal +
    segui +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="footer-bottom">\n' +
    '        <p>© <span data-year>2026</span> Vera Store</p>\n' +
    '        <p class="site-footer__notice">Sitio de demostración. Todos los nombres, productos y datos son ficticios.</p>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </footer>\n';

  var briefHTML = '' +
    '  <footer class="site-footer site-footer--brief">\n' +
    '    <div class="wrap">\n' +
    '      <div class="footer-bottom">\n' +
    '        <p>© <span data-year>2026</span> Vera Store</p>\n' +
    '        <p class="site-footer__notice">Sitio de demostración. Todos los nombres, productos y datos son ficticios.</p>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </footer>\n';

  return brief ? briefHTML : full;
}

/* ------------------------- Card de producto ------------------------------ */
function cardHTML(p, base, opts) {
  opts = opts || {};
  var out = soldOut(p);
  var url = base + 'producto/' + p.id + '/';
  return '' +
    '<article class="product-card' + (out ? ' is-agotado' : '') + '" data-card data-id="' + p.id + '">' +
    (out ? '<span class="badge-agotado">Agotado</span>' : '') +
    '<a class="product-card__media" href="' + url + '" aria-label="' + (out ? 'Producto agotado: ' : 'Ver ficha de ') + p.name + '">' +
    '<img src="' + base + p.img + '" alt="' + p.name + ' — ' + p.category + '" loading="lazy" decoding="async">' +
    '</a>' +
    '<div class="product-card__body">' +
    '<span class="product-card__cat">' + p.category + '</span>' +
    '<h3 class="product-card__name"><a href="' + url + '">' + p.name + '</a></h3>' +
    '<span class="product-card__price">' + fmtPrice(p.price) + '</span>' +
    (opts.noCta ? '' : (out
      ? '<span class="btn btn--ghost btn--block product-card__cta" aria-disabled="true">Agotado</span>'
      : '<a class="btn btn--outline btn--block product-card__cta" href="' + url + '">Ver producto</a>')) +
    '</div>' +
    '</article>';
}

/* --------------------- Página: catálogo completo ------------------------- */
function catalogPageHTML() {
  var base = '../';
  var catsArr = cats();
  var priceRows = [
    { label: 'Todos', min: null, max: null },
    { label: 'Hasta $1.000', min: null, max: 1000 },
    { label: '$1.000–$1.500', min: 1000, max: 1500 },
    { label: '$1.500–$2.500', min: 1500, max: 2500 },
    { label: 'Más de $2.500', min: 2500, max: null }
  ];
  var priceTest = function (p, row) {
    if (row.min === null && row.max === null) { return true; }
    if (row.min === null) { return p.price <= row.max; }
    if (row.max === null) { return p.price > row.min; }
    return p.price > row.min && p.price <= row.max;
  };

  var itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Catálogo de Vera Store',
    'itemListElement': CATALOG.map(function (p, i) {
      return {
        '@type': 'ListItem',
        'position': i + 1,
        'item': {
          '@type': 'Product',
          'name': p.name,
          'image': PUBLIC_BASE + p.img,
          'url': PUBLIC_BASE + 'producto/' + p.id + '/',
          'offers': {
            '@type': 'Offer',
            'priceCurrency': CURRENCY,
            'price': p.price,
            'availability': soldOut(p) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
          }
        }
      };
    })
  };

  var body = '' +
    '  <main id="main-content">\n' +
    '    <nav class="crumbs" aria-label="Ruta de navegación">\n' +
    '      <div class="wrap">\n' +
    '        <ol>\n' +
    '          <li><a href="' + base + 'index.html">Inicio</a></li>\n' +
    '          <li aria-current="page">Catálogo</li>\n' +
    '        </ol>\n' +
    '      </div>\n' +
    '    </nav>\n' +
    '    <div class="wrap">\n' +
    '      <header class="page-head">\n' +
    '        <span class="section-head__eyebrow">Tienda</span>\n' +
    '        <h1>Catálogo</h1>\n' +
    '        <p>Los 14 productos de Vera Store: filtra por categoría o precio y entrá a cada ficha.</p>\n' +
    '      </header>\n' +
    '      <div id="cat-filter" class="cat-filter" role="group" aria-label="Filtrar catálogo por categoría y precio"></div>\n' +
    '      <div id="product-grid" class="product-grid" aria-live="polite">\n' +
    CATALOG.map(function (p, i) {
      var c = cardHTML(p, base, { first: i === 0 });
      return (i === 0) ? c.replace('<article class="product-card', '<article id="product-card" class="product-card') : c;
    }).join('\n        ') +
    '\n      </div>\n' +
    '    </div>\n' +
    '  </main>\n\n';

  return headHTML({
    base: base,
    title: 'Catálogo — Vera Store | Pocitos, Montevideo',
    desc: 'Catálogo completo de Vera Store: 14 productos en 4 categorías (accesorios, indumentaria, bolsos y cuidado del hogar) con precios desde $350. Pedido por WhatsApp.',
    canonical: PUBLIC_BASE + 'catalogo/',
    jsonld: [itemList]
  }) +
    '<body>\n' +
    headerHTML(base, 'catalogo', '', true) +
    body +
    footerHTML(base) +
    cartDrawerHTML(base) +
    scriptsHTML(base) +
    '</body>\n</html>\n';
}

/* --------------------- Página: categoría ---------------------------------- */
function categoryPageHTML(catName) {
  var base = '../';
  var slug = CATEGORY_SLUG[catName];
  var prods = byCat(catName);
  var allCats = cats();

  var collectionJson = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': CATEGORY_H1[catName] + ' — Vera Store',
    'description': CATEGORY_DESC[catName],
    'url': PUBLIC_BASE + 'catalogo/' + slug + '/',
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': prods.map(function (p, i) {
        return {
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'Product',
            'name': p.name,
            'url': PUBLIC_BASE + 'producto/' + p.id + '/',
            'offers': {
              '@type': 'Offer',
              'priceCurrency': CURRENCY,
              'price': p.price,
              'availability': soldOut(p) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
            }
          }
        };
      })
    }
  };

  var chips = allCats.map(function (c) {
    var url = base + 'catalogo/' + CATEGORY_SLUG[c] + '/';
    var isCurrent = c === catName;
    return isCurrent
      ? '<span class="chip" aria-current="page">' + c + '<span class="chip__count">' + byCat(c).length + '</span></span>'
      : '<a class="chip" href="' + url + '">' + c + '<span class="chip__count">' + byCat(c).length + '</span></a>';
  }).join('\n          ');

  var body = '' +
    '  <main id="main-content" data-catalog-filter="' + catName + '">\n' +
    '    <nav class="crumbs" aria-label="Ruta de navegación">\n' +
    '      <div class="wrap">\n' +
    '        <ol>\n' +
    '          <li><a href="' + base + 'index.html">Inicio</a></li>\n' +
    '          <li><a href="' + base + 'catalogo/">Catálogo</a></li>\n' +
    '          <li aria-current="page">' + CATEGORY_H1[catName] + '</li>\n' +
    '        </ol>\n' +
    '      </div>\n' +
    '    </nav>\n' +
    '    <div class="wrap">\n' +
    '      <header class="page-head">\n' +
    '        <span class="section-head__eyebrow">Categoría</span>\n' +
    '        <h1>' + CATEGORY_H1[catName] + '</h1>\n' +
    '      </header>\n' +
    '      <div class="prose category-intro">\n' +
    '        <p>' + CATEGORY_COPY[catName] + '</p>\n' +
    '      </div>\n' +
    '      <div class="cat-filter cat-filter--links" role="group" aria-label="Cambiar de categoría">\n' +
    chips +
    '\n      </div>\n' +
    '      <div id="product-grid" class="product-grid" aria-live="polite">\n' +
    prods.map(function (p, i) {
      var c = cardHTML(p, base);
      return (i === 0) ? c.replace('<article class="product-card', '<article id="product-card" class="product-card') : c;
    }).join('\n        ') +
    '\n      </div>\n' +
    '    </div>\n' +
    '  </main>\n\n';

  return headHTML({
    base: base,
    title: CATEGORY_H1[catName] + ' — Vera Store',
    desc: CATEGORY_DESC[catName],
    canonical: PUBLIC_BASE + 'catalogo/' + slug + '/',
    jsonld: [collectionJson]
  }) +
    '<body>\n' +
    headerHTML(base, 'catalogo', catName, true) +
    body +
    footerHTML(base) +
    cartDrawerHTML(base) +
    scriptsHTML(base) +
    '</body>\n</html>\n';
}

/* --------------------- Página: ficha de producto -------------------------- */
function optionPill(kind, value, p, state) {
  var variants = (p.variants || []).filter(function (v) { return v[kind] === value; });
  var agotada = variants.length > 0 && variants.every(function (v) { return v.stock === 'agotado'; });
  return '<button type="button" class="option-pill" data-opt="' + kind + '" data-value="' + value + '"' +
    ' aria-pressed="' + (state[kind] === value) + '"' + (agotada ? ' disabled' : '') + '>' +
    value + (agotada ? '<span class="option-pill__agotado">Agotado</span>' : '') + '</button>';
}

function productPageHTML(p) {
  var base = '../../';
  var catSlug = CATEGORY_SLUG[p.category];
  var out = soldOut(p);
  var talles = [];
  var colors = [];
  (p.variants || []).forEach(function (v) {
    if (v.talle && talles.indexOf(v.talle) === -1) { talles.push(v.talle); }
    if (v.color && colors.indexOf(v.color) === -1) { colors.push(v.color); }
  });
  var state = { talle: null, color: null };
  if (talles.length === 1) { state.talle = talles[0]; }
  if (colors.length === 1) { state.color = colors[0]; }

  var longDesc = p.desc + ' ' + (PRODUCT_EXTRA[p.id] || '') + ' ' + BUY_COPY;

  var offers = [];
  if (p.variants && p.variants.length) {
    p.variants.forEach(function (v) {
      var label = [v.talle ? 'Talle ' + v.talle : '', v.color ? 'Color ' + v.color : ''].filter(Boolean).join(' · ');
      offers.push({
        '@type': 'Offer',
        'name': label,
        'priceCurrency': CURRENCY,
        'price': p.price,
        'availability': v.stock === 'agotado' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
      });
    });
  } else {
    offers.push({
      '@type': 'Offer',
      'priceCurrency': CURRENCY,
      'price': p.price,
      'availability': out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
    });
  }

  var productJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': p.name,
    'description': p.desc,
    'image': [PUBLIC_BASE + p.img],
    'category': p.category,
    'brand': { '@type': 'Brand', 'name': 'Vera Store' },
    'offers': offers
  };
  var breadJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': PUBLIC_BASE },
      { '@type': 'ListItem', 'position': 2, 'name': 'Catálogo', 'item': PUBLIC_BASE + 'catalogo/' },
      { '@type': 'ListItem', 'position': 3, 'name': p.category, 'item': PUBLIC_BASE + 'catalogo/' + catSlug + '/' },
      { '@type': 'ListItem', 'position': 4, 'name': p.name, 'item': PUBLIC_BASE + 'producto/' + p.id + '/' }
    ]
  };

  var related = byCat(p.category).filter(function (x) { return x.id !== p.id; }).slice(0, 4);

  var optionsHTML = '';
  if (talles.length) {
    optionsHTML += '<div class="option-group"><span class="option-group__label">Talle</span><div class="option-values">' +
      talles.map(function (t) { return optionPill('talle', t, p, state); }).join('') +
      '</div></div>';
  }
  if (colors.length) {
    optionsHTML += '<div class="option-group"><span class="option-group__label">Color</span><div class="option-values">' +
      colors.map(function (c) { return optionPill('color', c, p, state); }).join('') +
      '</div></div>';
  }

  var stockText = out ? 'Sin stock' : (p.variants && p.variants.length ? 'Elegí talle y color para ver disponibilidad' : 'Stock disponible');

  var body = '' +
    '  <main id="main-content" data-product="' + p.id + '">\n' +
    '    <nav class="crumbs" aria-label="Ruta de navegación">\n' +
    '      <div class="wrap">\n' +
    '        <ol>\n' +
    '          <li><a href="' + base + 'index.html">Inicio</a></li>\n' +
    '          <li><a href="' + base + 'catalogo/">Catálogo</a></li>\n' +
    '          <li><a href="' + base + 'catalogo/' + catSlug + '/">' + p.category + '</a></li>\n' +
    '          <li aria-current="page">' + p.name + '</li>\n' +
    '        </ol>\n' +
    '      </div>\n' +
    '    </nav>\n' +
    '    <div class="wrap product-detail-page">\n' +
    '      <article class="product-detail' + (out ? ' is-agotado' : '') + '">\n' +
    '        <div class="product-detail__media">\n' +
    (out ? '          <span class="badge-agotado">Agotado</span>\n' : '') +
    '          <img src="' + base + p.img + '" alt="' + p.name + ' — ' + p.category + '" fetchpriority="high">\n' +
    '        </div>\n' +
    '        <div class="product-detail__info">\n' +
    '          <p class="product-detail__cat">' + p.category + '</p>\n' +
    '          <h1 class="product-detail__name">' + p.name + '</h1>\n' +
    '          <p class="product-detail__price">' + fmtPrice(p.price) + '</p>\n' +
    '          <div id="modal-options">' + optionsHTML + '</div>\n' +
    '          <p id="modal-stock" class="stock-note" role="status">' + stockText + '</p>\n' +
    '          <div class="qty-row">\n' +
    '            <span class="option-group__label qty-row__label">Cantidad</span>\n' +
    '            <div class="qty">\n' +
    '              <button type="button" data-qty="-1" aria-label="Restar cantidad">−</button>\n' +
    '              <span class="qty__value" id="modal-qty">1</span>\n' +
    '              <button type="button" data-qty="1" aria-label="Sumar cantidad">+</button>\n' +
    '            </div>\n' +
    '          </div>\n' +
    '          <div class="delivery-info"><strong>Entrega:</strong> ' + deliveryLabel(p) + '.</div>\n' +
    '          <button type="button" class="btn btn--solid btn--block" id="modal-add" data-add-to-cart' + (out ? ' disabled' : '') + '>' + (out ? 'Agotado' : 'Agregar al carrito') + '</button>\n' +
    '          <p class="hint" id="modal-hint" hidden>Elegí una opción disponible para continuar.</p>\n' +
    '          <p class="product-detail__desc long-desc">' + longDesc + '</p>\n' +
    '        </div>\n' +
    '      </article>\n' +
    '      <section class="related" aria-labelledby="related-title">\n' +
    '        <h2 id="related-title">También te puede gustar</h2>\n' +
    '        <div class="product-grid">\n' +
    related.map(function (r) { return cardHTML(r, base, { noCta: true }); }).join('\n          ') +
    '\n        </div>\n' +
    '      </section>\n' +
    '    </div>\n' +
    '  </main>\n\n';

  return headHTML({
    base: base,
    title: p.name + ' — Vera Store',
    desc: p.name + ', ' + p.category.toLowerCase() + ' de Vera Store ($' + p.price.toLocaleString('es-UY') + '). ' + p.desc + ' Pedido por WhatsApp con retiro en Pocitos o envío.',
    canonical: PUBLIC_BASE + 'producto/' + p.id + '/',
    jsonld: [productJson, breadJson]
  }) +
    '<body>\n' +
    headerHTML(base, 'catalogo') +
    body +
    footerHTML(base) +
    '\n' +
    cartDrawerHTML(base) +
    scriptsHTML(base) +
    '</body>\n</html>\n';
}

/* ------------------------- sitemap.xml ------------------------------------ */
function sitemapXML() {
  var urls = [];
  urls.push({ loc: PUBLIC_BASE, prio: '1.0', freq: 'weekly' });
  urls.push({ loc: PUBLIC_BASE + 'catalogo/', prio: '0.9', freq: 'weekly' });
  cats().forEach(function (c) {
    urls.push({ loc: PUBLIC_BASE + 'catalogo/' + CATEGORY_SLUG[c] + '/', prio: '0.8', freq: 'weekly' });
  });
  CATALOG.forEach(function (p) {
    urls.push({ loc: PUBLIC_BASE + 'producto/' + p.id + '/', prio: '0.7', freq: 'monthly' });
  });
  [['pedido/', '0.4'], ['envios/', '0.5'], ['cambios/', '0.5'], ['talles/', '0.6'], ['nosotros/', '0.5'], ['preguntas/', '0.5'], ['contacto/', '0.6']].forEach(function (row) {
    urls.push({ loc: PUBLIC_BASE + row[0], prio: row[1], freq: 'monthly' });
  });
  urls.push({ loc: PUBLIC_BASE + 'privacy.html', prio: '0.2', freq: 'yearly' });

  var lines = urls.map(function (u) {
    return '  <url>\n    <loc>' + u.loc + '</loc>\n    <changefreq>' + u.freq + '</changefreq>\n    <priority>' + u.prio + '</priority>\n  </url>';
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + lines.join('\n') + '\n</urlset>\n';
}

/* --------------------------- Escritura ------------------------------------ */
// Minificado seguro para HTML estático: elimina comentarios y colapsa el
// espacio en blanco ENTRE etiquetas. No toca el contenido de atributos ni de
// texto entre apertura/cierre, así que el texto visible queda intacto.
function minifyHTML(html) {
  return html
    .replace(/\n\s*<!--[\s\S]*?-->\s*\n/g, '\n')
    .replace(/>\s+</g, '><')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

function write(rel, content) {
  var file = path.join(DEMO_DIR, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  var out = rel.indexOf('sitemap.xml') === -1 ? minifyHTML(content) : content;
  fs.writeFileSync(file, out, 'utf8');
  console.log('generated: ' + rel);
}

console.log('DEMO_CATALOG items: ' + CATALOG.length);
console.log('Categorías: ' + cats().join(' | '));

write('catalogo/index.html', catalogPageHTML());

cats().forEach(function (c) {
  write('catalogo/' + CATEGORY_SLUG[c] + '/index.html', categoryPageHTML(c));
});

CATALOG.forEach(function (p) {
  write('producto/' + p.id + '/index.html', productPageHTML(p));
});

write('sitemap.xml', sitemapXML());

console.log('OK — set completo generado.');