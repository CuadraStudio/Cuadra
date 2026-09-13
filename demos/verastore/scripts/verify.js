// Verificación final integral del demo Vera Store (dev-time).
const fs = require('fs');
const path = require('path');

const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

const htmls = walk('.').filter(f => f.endsWith('.html'));
const all = htmls.map(f => [f, fs.readFileSync(f, 'utf8')]);
const D = (s) => s.replace(/\\/g, '/');

console.log('== 1. Archivos ==');
console.log('HTML:', htmls.length);

console.log('== 2. Rutas internas absolutas ==');
let abs = 0;
for (const [f, s] of all) for (const m of s.matchAll(/(?:href|src)="\/(?!\/)/g)) { abs++; }
console.log('absolutas internas:', abs);

console.log('== 3. Aviso demo (por UTF-8) ==');
const notice = 'Sitio de demostraci\u00f3n. Todos los nombres, productos y datos son ficticios.';
const miss = all.filter(([f, s]) => !s.includes(notice)).map(([f]) => f);
console.log('sin aviso:', miss.length, miss.slice(0, 4));

console.log('== 4. Titulos unicos ==');
const titles = all.map(([f, s]) => (s.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
const dups = titles.filter((t, i) => titles.indexOf(t) !== i);
console.log('titulos:', titles.length, '| duplicados:', dups.length, dups.slice(0, 3));

console.log('== 5. h1 por pagina ==');
const h1bad = all.filter(([f, s]) => (s.match(/<h1/g) || []).length !== 1).map(([f, s]) => f + '=' + (s.match(/<h1/g) || []).length);
console.log('paginas con h1 != 1:', h1bad.length, h1bad.slice(0, 4));

console.log('== 6. ld-seo por pagina ==');
const ld = all.map(([f, s]) => [f, (s.match(/application\/ld\+json/g) || []).length]).filter(([f, n]) => n > 0);
console.log(ld.map(([f, n]) => D(f) + ':' + n).join(' | '));

console.log('== 7. Inventario de rutas ==');
const routes = [];
const want = ['index.html','catalogo/index.html','catalogo/accesorios/index.html','catalogo/indumentaria/index.html','catalogo/bolsos-y-mochilas/index.html','catalogo/cuidado-y-hogar/index.html',
  'pedido/index.html','envios/index.html','cambios/index.html','talles/index.html','nosotros/index.html','preguntas/index.html','contacto/index.html',
  'gracias.html','404.html','privacy.html','admin.html','sitemap.xml','robots.txt'];
for (const f of walk('producto').filter(f => f.endsWith('index.html'))) want.push(D(f));
const missing = want.filter(f => !fs.existsSync(f));
console.log('rutas esperadas:', want.length, '| faltan:', missing.length, missing.slice(0, 4));

console.log('== 8. Sitemap -> archivos ==');
const sm = fs.readFileSync('sitemap.xml', 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const bad = locs.filter(l => {
  const rel = l.replace('https://cuadrastudio.uy/demos/verastore/', '');
  if (!rel) return !fs.existsSync('index.html'); // home -> raíz con index.html
  return !fs.existsSync(rel);
});
console.log('locs:', locs.length, '| rotos:', bad.length, (bad[0] || ''));

console.log('== 9. Tipografia y detalles ==');
let ty = 0;
for (const [f, s] of all) if (/pregantes|diaspositivo|envios disponiblos/.test(s)) ty++;
console.log('typos conocidos:', ty);
const modal = all.filter(([f, s]) => s.includes('id="product-modal"' )).map(([f]) => f);
console.log('id=product-modal restante:', modal.length, modal.slice(0, 3));
const ogSvg = all.filter(([f, s]) => /og:image" content="[^"]*\.svg/.test(s)).map(([f]) => f);
console.log('og:image .svg restante:', ogSvg.length, ogSvg.slice(0, 3));
const products = all.map(([f, s]) => (s.match(/data-product="([^"]+)"/) || [])[1]).filter(Boolean);
console.log('fichas data-product:', products.length, '| unicos:', new Set(products).size);

console.log('== 10. Peso DoD-10 ==');
const pages27 = ['index.html','catalogo/index.html','catalogo/accesorios/index.html','catalogo/indumentaria/index.html','catalogo/bolsos-y-mochilas/index.html','catalogo/cuidado-y-hogar/index.html',
  'producto/aros-sol/index.html','producto/collar-luna/index.html','producto/gorra-lino/index.html','producto/bufanda-ambar/index.html','producto/camisola-nube/index.html','producto/remera-basica/index.html','producto/camisa-lino/index.html','producto/sweater-crudo/index.html','producto/bolso-tote/index.html','producto/mochila-lona/index.html','producto/rinonera-siena/index.html','producto/vela-ambar/index.html','producto/jabon-avena/index.html','producto/difusor-savia/index.html',
  'pedido/index.html','envios/index.html','cambios/index.html','talles/index.html','nosotros/index.html','preguntas/index.html','contacto/index.html'];
const sum = pages27.reduce((a, f) => a + fs.statSync(f).size, 0) + fs.statSync('css/styles.css').size + fs.statSync('js/config.js').size + fs.statSync('js/shop.js').size;
console.log('27 HTML + styles.css + config.js + shop.js =', sum, 'B =', (sum / 1024).toFixed(2), 'KiB | <400KiB:', sum < 400 * 1024);