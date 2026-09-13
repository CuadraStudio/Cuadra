// Minificado único de páginas escritas a mano + utilidades (dev-time).
// Aplica el MISMO criterio que scripts/generate-pages.js#minifyHTML para que
// todo el sitio quede consistente:
//   - elimina comentarios HTML
//   - colapsa espacio en blanco ENTRE etiquetas (>  <  -> ><)
//   - quita indentación de línea y líneas en blanco repetidas
// Además retira el <noscript> de fuentes y los <link rel="preconnect">
// (redundantes: la fuente carga igual vía el link principal).
var fs = require('fs');
var path = require('path');

var DEMO_DIR = path.join(__dirname, '..');

var FILES = [
  'index.html',
  'pedido/index.html',
  'envios/index.html',
  'cambios/index.html',
  'talles/index.html',
  'nosotros/index.html',
  'preguntas/index.html',
  'contacto/index.html',
  'gracias.html',
  '404.html',
  'privacy.html',
  'admin.html'
];

function minifyHTML(html) {
  return html
    .replace(/\n\s*<!--[\s\S]*?-->\s*\n/g, '\n')
    .replace(/>\s+</g, '><')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s*<noscript><link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^<]*<\/link>?<\/noscript>\s*/g, '')
    .replace(/\n\s*<link rel="preconnect" href="https:\/\/fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '\n')
    .trim() + '\n';
}

FILES.forEach(function (rel) {
  var file = path.join(DEMO_DIR, rel);
  var orig = fs.readFileSync(file, 'utf8');
  var out = minifyHTML(orig);
  fs.writeFileSync(file, out, 'utf8');
  console.log('minified: ' + rel + ' (' + orig.length + ' -> ' + out.length + ' B)');
});
console.log('OK — hand pages minified.');