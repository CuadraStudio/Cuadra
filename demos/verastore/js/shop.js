'use strict';

(function (root) {
var cfg = root.SHOP_CONFIG || {};
var tenant = cfg.tenant || {};
var DEMO = cfg.demo || {};
var CATALOG = (cfg.DEMO_CATALOG || []).slice();

var CART_KEY = 'verastore_cart';
var ORDERS_KEY = DEMO.storageKey || 'verastore_demo_orders';
var WA_BASE = (cfg.whatsapp && cfg.whatsapp.base) || 'https://wa.me/59899000000';

function formatPrice(n) {
var num = Number(n) || 0;
return '$ ' + num.toLocaleString('es-UY');
}

function variantLabel(variant) {
if (!variant) { return ''; }
var parts = [];
if (variant.talle) { parts.push('Talle ' + variant.talle); }
if (variant.color) { parts.push('Color ' + variant.color); }
return parts.length ? '(' + parts.join(', ') + ')' : '';
}

function lineLabel(item) {
var qty = item.qty || 1;
var label = variantLabel(item.variant);
var subtotal = (Number(item.price) || 0) * qty;
return '- ' + qty + 'x ' + item.name + (label ? ' ' + label : '') + ' - ' + formatPrice(subtotal);
}

function cartTotals(items) {
var list = items || [];
var count = 0;
var total = 0;
for (var i = 0; i < list.length; i++) {
var qty = Number(list[i].qty) || 0;
count += qty;
total += (Number(list[i].price) || 0) * qty;
}
return { count: count, subtotal: total, total: total };
}

function variantAvailable(variant) {
return !!variant && variant.stock !== 'agotado';
}

function variantUnavailableMessage(variant) {
return variant ? 'Esta combinación está agotada' : 'Combinación no disponible';
}

function clampQty(q) {
return Math.max(1, Math.min(9, Number(q) || 1));
}

function productSoldOut(product) {
if (!product) { return true; }
if (product.variants && product.variants.length) {
return product.variants.every(function (v) { return !variantAvailable(v); });
}
return product.stock === 'agotado';
}

function matchVariantOf(product, variant) {
if (!product || !product.variants || !product.variants.length) { return null; }
var talles = uniqueValuesOf(product, 'talle');
var colors = uniqueValuesOf(product, 'color');
var selT = variant && variant.talle;
var selC = variant && variant.color;
var found = null;
product.variants.forEach(function (v) {
if (found) { return; }
var okT = !talles.length || v.talle === selT;
var okC = !colors.length || v.color === selC;
if (okT && okC) { found = v; }
});
return found;
}

function uniqueValuesOf(product, key) {
var vals = [];
(product.variants || []).forEach(function (v) {
if (v[key] && vals.indexOf(v[key]) === -1) { vals.push(v[key]); }
});
return vals;
}

function canAdd(product, variant) {
if (!product || productSoldOut(product)) { return false; }
if (product.variants && product.variants.length) {
var matched = matchVariantOf(product, variant);
return variantAvailable(matched);
}
return true;
}

function findProduct(id) {
for (var i = 0; i < CATALOG.length; i++) {
if (CATALOG[i].id === id) { return CATALOG[i]; }
}
return null;
}

function entregaLabel(entrega) {
return entrega === 'envio' ? 'envío a domicilio' : 'retiro en local';
}

function deliveryLabel(product) {
if (product.delivery === 'envio') { return 'Envío a domicilio'; }
if (product.delivery === 'retiro') { return 'Retiro en local'; }
return 'Retiro en local o envío a domicilio';
}

function buildWhatsAppMessage(opts) {
opts = opts || {};
var items = opts.items || [];
if (!items.length) {
return (cfg.whatsapp && cfg.whatsapp.message) || 'Hola Vera Store, quiero hacer una consulta.';
}
var lines = ['Hola Vera Store, quiero hacer este pedido:'];
for (var i = 0; i < items.length; i++) {
lines.push(lineLabel(items[i]));
}
if (opts.total != null) {
lines.push('Total: ' + formatPrice(opts.total));
}
lines.push('Entrega: ' + entregaLabel(opts.entrega));
if (opts.nombre) { lines.push('Nombre: ' + opts.nombre); }
if (opts.telefono) { lines.push('Teléfono: ' + opts.telefono); }
return lines.join('\n');
}

function whatsappUrl(message) {
return WA_BASE + '?text=' + encodeURIComponent(message);
}

function cartItemKey(id, variant) {
var v = variant || {};
return id + '::' + (v.talle || '') + '::' + (v.color || '');
}

function priceBand(price) {
if (price <= 1000) { return 'hasta1000'; }
if (price <= 1500) { return '1000a1500'; }
if (price <= 2500) { return '1500a2500'; }
return 'mas2500';
}
function priceBandLabel(key) {
return {
hasta1000: 'Hasta $1.000',
'1000a1500': '$1.000–$1.500',
'1500a2500': '$1.500–$2.500',
mas2500: 'Más de $2.500'
}[key] || key;
}
function priceBandOrder() { return ['hasta1000', '1000a1500', '1500a2500', 'mas2500']; }

var LOGIC = {
formatPrice: formatPrice,
variantLabel: variantLabel,
lineLabel: lineLabel,
cartTotals: cartTotals,
variantAvailable: variantAvailable,
variantUnavailableMessage: variantUnavailableMessage,
clampQty: clampQty,
productSoldOut: productSoldOut,
canAdd: canAdd,
matchVariantOf: matchVariantOf,
findProduct: findProduct,
entregaLabel: entregaLabel,
deliveryLabel: deliveryLabel,
buildWhatsAppMessage: buildWhatsAppMessage,
whatsappUrl: whatsappUrl,
cartItemKey: cartItemKey,
priceBand: priceBand,
priceBandLabel: priceBandLabel
};

var SHOP = { config: cfg, logic: LOGIC, catalog: CATALOG, keys: { cart: CART_KEY, orders: ORDERS_KEY } };
root.SHOP = SHOP;

if (typeof document === 'undefined') { return; }

// Base de rutas relativas de la página actual (PRD §8.1.1).
var BASE = (document.documentElement.getAttribute('data-site-base') || '');

var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

function esc(str) {
return String(str == null ? '' : str)
.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function rootImg(src) {
return String(src || '').replace(/^(?:\.\.\/)+/, '');
}

function safeStorage() {
try {
var t = '__vs_test__'; root.localStorage.setItem(t, '1'); root.localStorage.removeItem(t);
return root.localStorage;
} catch (e) { return null; }
}
var store = safeStorage();

function readJSON(key, fallback) {
if (!store) { return fallback; }
try {
var raw = store.getItem(key);
return raw ? JSON.parse(raw) : fallback;
} catch (e) { return fallback; }
}
function writeJSON(key, value) {
if (!store) { return; }
try { store.setItem(key, JSON.stringify(value)); } catch (e) {
}
}

var state = {
cart: readJSON(CART_KEY, []),
filter: 'Todos', // categoría activa
price: 'Todos', // banda de precio activa
current: null, // producto abierto en el modal o ficha estática
sel: { talle: null, color: null, qty: 1 }
};
if (!Array.isArray(state.cart)) { state.cart = []; }

function productCardHTML(product) {
var out = productSoldOut(product);
var img = rootImg(product.img || '');
var url = BASE + 'producto/' + esc(product.id) + '/';
return '' +
'<article class="product-card' + (out ? ' is-agotado' : '') + '" data-card data-id="' + esc(product.id) + '">' +
(out ? '<span class="badge-agotado">Agotado</span>' : '') +
'<a class="product-card__media" href="' + url + '" aria-label="' + (out ? 'Producto agotado: ' : 'Ver ficha de ') + esc(product.name) + '">' +
'<img src="' + BASE + esc(img) + '" alt="' + esc(product.name) + ' — ' + esc(product.category) + '" loading="lazy" decoding="async">' +
'</a>' +
'<div class="product-card__body">' +
'<span class="product-card__cat">' + esc(product.category) + '</span>' +
'<h3 class="product-card__name"><a href="' + url + '">' + esc(product.name) + '</a></h3>' +
'<span class="product-card__price">' + formatPrice(product.price) + '</span>' +
(out
? '<span class="btn btn--ghost btn--block product-card__cta" aria-disabled="true">Agotado</span>'
: '<a class="btn btn--outline btn--block product-card__cta" href="' + url + '">Ver producto</a>') +
'</div>' +
'</article>';
}

function renderFeatured() {
var grid = $('#featured-grid');
if (!grid) { return; }
var ids = ['camisola-nube', 'bolso-tote', 'aros-sol', 'vela-ambar'];
var picks = [];
ids.forEach(function (id) { var p = findProduct(id); if (p) { picks.push(p); } });
if (picks.length < 4) {
CATALOG.forEach(function (p) { if (picks.length < 4 && picks.indexOf(p) === -1) { picks.push(p); } });
}
grid.innerHTML = picks.map(function (p) { return productCardHTML(p); }).join('');
var first = grid.querySelector('[data-card]');
if (first) { first.id = 'product-card'; }
}

function matchesFilters(p) {
var okCat = state.filter === 'Todos' || p.category === state.filter;
var okPrice = state.price === 'Todos' || priceBand(p.price) === state.price;
return okCat && okPrice;
}

function renderCatalog() {
var grid = $('#product-grid');
if (!grid) { return; }
var list = CATALOG.filter(matchesFilters);
if (!list.length) {
grid.innerHTML = '<div class="empty-state">' +
'<p>No encontramos productos con esos filtros.</p>' +
'<button type="button" class="btn btn--ghost" data-reset-filters>Ver todo</button>' +
'</div>';
return;
}
grid.innerHTML = list.map(function (p) { return productCardHTML(p); }).join('');
// Primer card del grid con id estable para el gate E2E.
var first = grid.querySelector('[data-card]');
if (first) { first.id = 'product-card'; }
}

function chipEl(kind, label, count, value, active) {
return '<button type="button" class="chip" data-filter-kind="' + kind + '" data-filter-value="' + esc(value) + '" aria-pressed="' + active + '">' +
esc(label) + '<span class="chip__count">' + count + '</span></button>';
}

function renderFilters() {
var box = $('#cat-filter');
if (!box) { return; }
var cats = ['Todos'];
CATALOG.forEach(function (p) { if (cats.indexOf(p.category) === -1) { cats.push(p.category); } });

var catChips = cats.map(function (cat) {
var count = cat === 'Todos' ? CATALOG.length : CATALOG.filter(function (p) { return p.category === cat; }).length;
return chipEl('cat', cat, count, cat, state.filter === cat);
}).join('');

var priceChips = ['Todos'].concat(priceBandOrder()).map(function (band) {
var count = band === 'Todos'
? CATALOG.length
: CATALOG.filter(function (p) { return priceBand(p.price) === band; }).length;
return chipEl('price', band === 'Todos' ? 'Todos' : priceBandLabel(band), count, band, state.price === band);
}).join('');

box.innerHTML =
'<span class="cat-filter__group-label">Categoría</span><div class="cat-filter__chips">' + catChips + '</div>' +
'<span class="cat-filter__group-label">Precio</span><div class="cat-filter__chips">' + priceChips + '</div>';
}

function resetFilters() {
state.filter = 'Todos';
state.price = 'Todos';
renderFilters();
renderCatalog();
}

function uniqueValues(product, key) {
var vals = [];
(product.variants || []).forEach(function (v) {
if (v[key] && vals.indexOf(v[key]) === -1) { vals.push(v[key]); }
});
return vals;
}

function matchVariant(product) {
if (!product.variants || !product.variants.length) { return null; }
var talles = uniqueValues(product, 'talle');
var colors = uniqueValues(product, 'color');
var selT = talles.length ? state.sel.talle : null;
var selC = colors.length ? state.sel.color : null;
var found = null;
product.variants.forEach(function (v) {
if (found) { return; }
var okT = !talles.length || v.talle === selT;
var okC = !colors.length || v.color === selC;
if (okT && okC) { found = v; }
});
return found;
}

function openModal(id) {
var product = findProduct(id);
if (!product || !$('#product-modal')) { return; }
state.current = product;
state.sel = { talle: null, color: null, qty: 1 };
var talles = uniqueValues(product, 'talle');
var colors = uniqueValues(product, 'color');
if (talles.length === 1) { state.sel.talle = talles[0]; }
if (colors.length === 1) { state.sel.color = colors[0]; }

var dialog = $('#modal-body');
dialog.innerHTML = '' +
'<div class="product-detail">' +
'<div class="product-detail__media"><img src="' + BASE + esc(rootImg(product.img)) + '" alt="' + esc(product.name) + ' — ' + esc(product.category) + '"></div>' +
'<div class="product-detail__info">' +
'<p class="product-detail__cat">' + esc(product.category) + '</p>' +
'<h2 class="product-detail__name" id="modal-product-name">' + esc(product.name) + '</h2>' +
'<p class="product-detail__price">' + formatPrice(product.price) + '</p>' +
'<p class="product-detail__desc">' + esc(product.desc) + '</p>' +
'<div id="modal-options"></div>' +
'<p id="modal-stock" class="stock-note" role="status"></p>' +
'<div class="qty-row">' +
'<span class="option-group__label" style="margin:0">Cantidad</span>' +
'<div class="qty">' +
'<button type="button" data-qty="-1" aria-label="Restar cantidad">−</button>' +
'<span class="qty__value" id="modal-qty">1</span>' +
'<button type="button" data-qty="1" aria-label="Sumar cantidad">+</button>' +
'</div>' +
'</div>' +
'<div class="delivery-info"><strong>Entrega:</strong> ' + esc(deliveryLabel(product)) + '.</div>' +
'<button type="button" class="btn btn--solid btn--block" id="modal-add" disabled>Agregar al carrito</button>' +
'<p class="hint" id="modal-hint" hidden>Elegí una opción disponible para continuar.</p>' +
'</div>' +
'</div>';

renderModalOptions();
updateModalState();
openOverlay('#product-modal');
var closeBtn = $('#product-modal .modal__close');
if (closeBtn) { closeBtn.focus(); }
}

function renderModalOptions() {
var product = state.current;
var box = $('#modal-options');
if (!product || !box) { return; }
var html = '';
var talles = uniqueValues(product, 'talle');
var colors = uniqueValues(product, 'color');
if (talles.length) {
html += '<div class="option-group"><span class="option-group__label">Talle</span><div class="option-values">' +
talles.map(function (t) { return optionHTML('talle', t); }).join('') + '</div></div>';
}
if (colors.length) {
html += '<div class="option-group"><span class="option-group__label">Color</span><div class="option-values">' +
colors.map(function (c) { return optionHTML('color', c); }).join('') + '</div></div>';
}
box.innerHTML = html || '';
updateModalState();
}

function optionHTML(kind, value) {
var product = state.current;
var selected = state.sel[kind] === value;
// Una opción se marca agotada si TODAS las variantes con ese valor están agotadas.
var variants = (product.variants || []).filter(function (v) { return v[kind] === value; });
var agotada = variants.length > 0 && variants.every(function (v) { return !variantAvailable(v); });
return '<button type="button" class="option-pill" data-opt="' + kind + '" data-value="' + esc(value) + '"' +
' aria-pressed="' + selected + '"' + (agotada ? ' disabled' : '') + '>' +
esc(value) + (agotada ? '<span class="option-pill__agotado">Agotado</span>' : '') + '</button>';
}

function updateModalState() {
var product = state.current;
if (!product) { return; }
var talles = uniqueValues(product, 'talle');
var colors = uniqueValues(product, 'color');
var needsTalle = talles.length > 0 && !state.sel.talle;
var needsColor = colors.length > 0 && !state.sel.color;
var variant = matchVariant(product);
var available = canAdd(product, variant);
var addBtn = $('#modal-add');
var hint = $('#modal-hint');
var stockNote = $('#modal-stock');
var qtyEl = $('#modal-qty');

if (qtyEl) { qtyEl.textContent = state.sel.qty; }
if (addBtn) { addBtn.disabled = !available; }
if (hint) { hint.hidden = !(needsTalle || needsColor || !available); }
if (stockNote) {
if (!product.variants || !product.variants.length) {
stockNote.textContent = available ? 'Stock disponible' : 'Sin stock';
stockNote.className = 'stock-note ' + (available ? 'stock-note--ok' : 'stock-note--out');
} else if (needsTalle || needsColor) {
stockNote.textContent = 'Elegí talle y color';
stockNote.className = 'stock-note';
} else if (available) {
stockNote.textContent = 'Stock disponible';
stockNote.className = 'stock-note stock-note--ok';
} else {
stockNote.textContent = variantUnavailableMessage(variant);
stockNote.className = 'stock-note stock-note--out';
}
}
// Refrescar pills (aria-pressed)
$$('#modal-options .option-pill').forEach(function (btn) {
var kind = btn.getAttribute('data-opt');
var val = btn.getAttribute('data-value');
btn.setAttribute('aria-pressed', String(state.sel[kind] === val));
});
}

function addCurrentToCart() {
var product = state.current;
if (!product) { return; }
var variant = matchVariant(product);
if (!canAdd(product, variant)) { return; }
var variantData = variant ? { talle: variant.talle || null, color: variant.color || null } : null;
addToCart(product, variantData, state.sel.qty);
closeOverlay('#product-modal');
openCart();
toast('Agregado al carrito');
}

function addToCart(product, variant, qty) {
qty = clampQty(qty);
var key = cartItemKey(product.id, variant);
var existing = null;
for (var i = 0; i < state.cart.length; i++) {
if (state.cart[i].key === key) { existing = state.cart[i]; break; }
}
if (existing) {
existing.qty = clampQty(existing.qty + qty);
} else {
state.cart.push({
key: key,
id: product.id,
name: product.name,
price: product.price,
img: rootImg(product.img || ''),
variant: variant || null,
qty: qty
});
}
persistCart();
renderCart();
}

function changeQty(key, delta) {
for (var i = 0; i < state.cart.length; i++) {
if (state.cart[i].key === key) {
state.cart[i].qty = clampQty(state.cart[i].qty + delta);
break;
}
}
persistCart();
renderCart();
}

function removeItem(key) {
state.cart = state.cart.filter(function (it) { return it.key !== key; });
persistCart();
renderCart();
}

function clearCart() {
state.cart = [];
persistCart();
renderCart();
}

function persistCart() { writeJSON(CART_KEY, state.cart); }

function renderCart() {
var box = $('#cart-items');
var totals = cartTotals(state.cart);
var checkout = document.querySelector('#pedido-checkout-title');
if (checkout) { checkout.closest('.order-summary').hidden = !state.cart.length; }
if (box) {
if (!state.cart.length) {
box.innerHTML = '<p class="cart-empty">Tu carrito está vacío.<br>Sumá tus favoritos y pedilos por WhatsApp.</p>' +
'<a class="btn btn--solid btn--block cart-empty__cta" href="' + BASE + 'catalogo/">Ver catálogo</a>';
} else {
box.innerHTML = state.cart.map(function (it) {
return '' +
'<div class="cart-item">' +
'<div class="cart-item__media"><img src="' + BASE + esc(it.img) + '" alt="' + esc(it.name) + '"></div>' +
'<div>' +
'<p class="cart-item__name">' + esc(it.name) + '</p>' +
(variantLabel(it.variant) ? '<p class="cart-item__variant">' + esc(variantLabel(it.variant).replace(/[()]/g, '')) + '</p>' : '') +
'<p class="cart-item__sub">' + formatPrice(it.price * it.qty) + '</p>' +
'</div>' +
'<div class="cart-item__side">' +
'<div class="cart-item__qty">' +
'<button type="button" data-cart-qty="-1" data-key="' + esc(it.key) + '" aria-label="Restar ' + esc(it.name) + '">−</button>' +
'<span>' + it.qty + '</span>' +
'<button type="button" data-cart-qty="1" data-key="' + esc(it.key) + '" aria-label="Sumar ' + esc(it.name) + '">+</button>' +
'</div>' +
'<button type="button" class="cart-item__remove" data-cart-remove="' + esc(it.key) + '">Quitar</button>' +
'</div>' +
'</div>';
}).join('');
}
}
var totalEl = $('#cart-total');
if (totalEl) { totalEl.textContent = formatPrice(totals.total); }
updateCartCount(totals.count);
updateWhatsAppLink();
var emptyBtn = $('#cart-clear');
if (emptyBtn) { emptyBtn.disabled = !state.cart.length; }
}

function updateCartCount(count) {
$$('[data-cart-count]').forEach(function (el) { el.textContent = count; });
var link = document.querySelector('.cart-btn--link');
if (link) { link.setAttribute('aria-label', 'Tu pedido (' + count + ' productos)'); }
}

function readCheckoutForm() {
var nombre = $('#checkout-nombre');
var tel = $('#checkout-telefono');
return {
nombre: (nombre && nombre.value.trim()) || 'Cliente Demo',
telefono: (tel && tel.value.trim()) || '099123456',
entrega: state.entrega || 'retiro'
};
}

function currentWhatsAppURL() {
var data = readCheckoutForm();
var totals = cartTotals(state.cart);
var msg = buildWhatsAppMessage({
items: state.cart,
total: totals.total,
entrega: data.entrega,
nombre: data.nombre,
telefono: data.telefono
});
return whatsappUrl(msg);
}

function updateWhatsAppLink() {
var link = $('#whatsapp-order');
if (!link) { return; }
link.href = currentWhatsAppURL();
link.setAttribute('aria-disabled', String(!state.cart.length));
}

function saveOrder() {
if (!state.cart.length) { return null; }
var data = readCheckoutForm();
var totals = cartTotals(state.cart);
var order = {
id: 'PED-' + Date.now().toString().slice(-6),
cliente: data.nombre,
telefono: data.telefono,
items: state.cart.map(function (it) {
return {
id: it.id,
name: it.name,
price: it.price,
qty: it.qty,
variant: it.variant || null,
subtotal: it.price * it.qty
};
}),
total: totals.total,
entrega: data.entrega,
estado: 'pendiente',
fecha: new Date().toISOString()
};
var orders = readJSON(ORDERS_KEY, []);
if (!Array.isArray(orders)) { orders = []; }
orders.unshift(order);
writeJSON(ORDERS_KEY, orders);
writeJSON('verastore_last_order', order);
return order;
}

function openOverlay(sel) {
var el = $(sel);
if (!el) { return; }
if (sel === '#product-modal') {
el.classList.add('is-open');
el.setAttribute('aria-hidden', 'false');
document.body.style.overflow = 'hidden';
}
if (sel === '#cart-drawer') {
document.body.classList.add('cart-open');
el.setAttribute('aria-hidden', 'false');
var close = $('#cart-drawer .cart-drawer__close');
if (close) { close.focus(); }
}
}
function closeOverlay(sel) {
var el = $(sel);
if (!el) { return; }
if (sel === '#product-modal') {
el.classList.remove('is-open');
el.setAttribute('aria-hidden', 'true');
document.body.style.overflow = '';
state.current = null;
}
if (sel === '#cart-drawer') {
document.body.classList.remove('cart-open');
el.setAttribute('aria-hidden', 'true');
}
}
function openCart() { openOverlay('#cart-drawer'); }
function closeCart() { closeOverlay('#cart-drawer'); }

var toastTimer = null;
function toast(msg) {
var el = $('#toast');
if (!el) { return; }
el.textContent = msg;
el.hidden = false;
clearTimeout(toastTimer);
toastTimer = setTimeout(function () { el.hidden = true; }, 2200);
}

function bindEvents() {
// Filtros (categoría + precio combinables)
var filter = $('#cat-filter');
if (filter) {
filter.addEventListener('click', function (e) {
var chip = e.target.closest('[data-filter-kind]');
if (!chip) { return; }
var kind = chip.getAttribute('data-filter-kind');
var value = chip.getAttribute('data-filter-value');
if (kind === 'cat') { state.filter = value; }
if (kind === 'price') { state.price = value; }
renderFilters();
renderCatalog();
});
}
// Reset "Ver todo" desde el empty-state del grid
document.addEventListener('click', function (e) {
if (e.target.closest('[data-reset-filters]')) { resetFilters(); }
});

// Ficha de producto: opciones, cantidad, agregar (modal y página estática)
document.addEventListener('click', function (e) {
if (!state.current) { return; }
var opt = e.target.closest('[data-opt]');
if (opt && !opt.disabled) {
state.sel[opt.getAttribute('data-opt')] = opt.getAttribute('data-value');
updateModalState();
return;
}
var q = e.target.closest('[data-qty]');
if (q) {
state.sel.qty = clampQty(state.sel.qty + Number(q.getAttribute('data-qty')));
updateModalState();
return;
}
if (e.target.closest('#modal-add')) { addCurrentToCart(); }
});

// Modal: cerrar por backdrop o botón
var modal = $('#product-modal');
if (modal) {
modal.addEventListener('click', function (e) {
if (e.target === modal || e.target.closest('[data-modal-close]')) { closeOverlay('#product-modal'); }
});
}

// Carrito (drawer + página pedido)
document.addEventListener('click', function (e) {
var close = e.target.closest('[data-cart-close]');
if (close) { closeCart(); }
var q = e.target.closest('[data-cart-qty]');
if (q) { changeQty(q.getAttribute('data-key'), Number(q.getAttribute('data-cart-qty'))); }
var rm = e.target.closest('[data-cart-remove]');
if (rm) { removeItem(rm.getAttribute('data-cart-remove')); }
if (e.target.closest('#cart-clear')) { clearCart(); }
});

// Entrega toggle (solo pedido/)
var entrega = $('#entrega-toggle');
if (entrega) {
entrega.addEventListener('click', function (e) {
var pill = e.target.closest('[data-entrega]');
if (!pill) { return; }
state.entrega = pill.getAttribute('data-entrega');
$$('#entrega-toggle [data-entrega]').forEach(function (b) {
b.setAttribute('aria-pressed', String(b.getAttribute('data-entrega') === state.entrega));
});
updateWhatsAppLink();
});
}

// Inputs del checkout → refresca el mensaje
['#checkout-nombre', '#checkout-telefono'].forEach(function (sel) {
var el = $(sel);
if (el) { el.addEventListener('input', updateWhatsAppLink); }
});

// WhatsApp: persiste el pedido y va a gracias (solo pedido/)
var wa = $('#whatsapp-order');
if (wa) {
wa.addEventListener('click', function (e) {
if (!state.cart.length) { e.preventDefault(); return; }
saveOrder();
// abre wa.me en nueva pestaña (target=_blank) y luego muestra gracias
setTimeout(function () { root.location.href = BASE + 'gracias.html'; }, 500);
});
}

// Nav drawer
var navToggle = $('[data-nav-toggle]');
if (navToggle) {
navToggle.addEventListener('click', function () {
var open = document.body.classList.toggle('nav-open');
navToggle.setAttribute('aria-expanded', String(open));
});
}
$$('.nav-drawer__link, .nav-drawer__sublink, .nav-drawer__cta, [data-nav-close]').forEach(function (link) {
link.addEventListener('click', function () {
document.body.classList.remove('nav-open');
var t = $('[data-nav-toggle]');
if (t) { t.setAttribute('aria-expanded', 'false'); }
});
});
var scrims = $$('[data-scrim]');
scrims.forEach(function (sc) {
sc.addEventListener('click', function () {
document.body.classList.remove('nav-open');
closeCart();
});
});

// Esc cierra overlays
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape') {
closeOverlay('#product-modal');
closeCart();
document.body.classList.remove('nav-open');
var t = $('[data-nav-toggle]');
if (t) { t.setAttribute('aria-expanded', 'false'); }
}
});

// Header scrolled
var header = $('.site-header');
if (header) {
var onScroll = function () { header.classList.toggle('is-scrolled', root.scrollY > 12); };
root.addEventListener('scroll', onScroll, { passive: true });
onScroll();
}

// Año footer
$$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
}

function injectStructuredData() {
if ($('#ld-json') || $('script.ld-seo')) { return; }
var productPage = $('[data-product]');
if (productPage) { return; }
var origin = root.location.origin + root.location.pathname.replace(/index\.html$/, '');
var addressParts = (tenant.address || '').split(',');
var business = {
'@context': 'https://schema.org',
'@type': 'ClothingStore',
'name': tenant.name || 'Vera Store',
'description': tenant.tagline || '',
'url': origin,
'telephone': tenant.phone || undefined,
'email': tenant.email || undefined,
'priceRange': '$$',
'address': {
'@type': 'PostalAddress',
'streetAddress': (addressParts[0] || '').trim(),
'addressLocality': 'Montevideo',
'addressCountry': 'UY'
},
'sameAs': tenant.instagramUrl ? [tenant.instagramUrl] : undefined
};
var itemList = {
'@context': 'https://schema.org',
'@type': 'ItemList',
'itemListElement': CATALOG.map(function (p, i) {
return {
'@type': 'ListItem',
'position': i + 1,
'item': {
'@type': 'Product',
'name': p.name,
'description': p.desc,
'category': p.category,
'image': origin + p.img,
'url': origin + 'producto/' + p.id + '/',
'offers': {
'@type': 'Offer',
'priceCurrency': tenant.currency || 'UYU',
'price': p.price,
'availability': productSoldOut(p)
? 'https://schema.org/OutOfStock'
: 'https://schema.org/InStock'
}
}
};
})
};
[business, itemList].forEach(function (data, idx) {
var script = document.createElement('script');
script.type = 'application/ld+json';
script.id = idx === 0 ? 'ld-json' : 'ld-json-products';
script.textContent = JSON.stringify(data).replace(/<\//g, '<\\/');
document.head.appendChild(script);
});
}

function initProductDetail(id) {
var product = findProduct(id);
if (!product) { return; }
state.current = product;
state.sel = { talle: null, color: null, qty: 1 };
var talles = uniqueValues(product, 'talle');
var colors = uniqueValues(product, 'color');
if (talles.length === 1) { state.sel.talle = talles[0]; }
if (colors.length === 1) { state.sel.color = colors[0]; }
renderModalOptions();
}

function init() {
// Estado inicial de entrega
state.entrega = 'retiro';
var detailId = $('[data-product]');
if (detailId) {
initProductDetail(detailId.getAttribute('data-product'));
} else {
var pageCat = $('[data-catalog-filter]');
if (pageCat) { state.filter = pageCat.getAttribute('data-catalog-filter'); }
renderFilters();
renderCatalog();
renderFeatured();
}
renderCart();
bindEvents();
injectStructuredData();
}

// Expone API de UI
SHOP.openModal = openModal;
SHOP.openCart = openCart;
SHOP.addToCart = addToCart;
SHOP.saveOrder = saveOrder;
SHOP.renderCatalog = renderCatalog;

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}
})(typeof window !== 'undefined' ? window : this);
