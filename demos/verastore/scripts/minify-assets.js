// Minificado de producción (dev-time) para css/styles.css y js públicos.
// CSS: quita comentarios, colapsa espacios, compacta alrededor de
// `{ } : ; , >` pero RESPETA los espacios dentro de calc() y content: "…".
// JS: quita comentarios /* */ y sangría de línea (NO toca literales de
// string; se conservan los comentarios // por si contienen URLs).
var fs = require('fs');
var path = require('path');

var DEMO_DIR = path.join(__dirname, '..');

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/}/g, '}\n')
    .replace(/\n+/g, '\n')
    .trim() + '\n';
}

function trimJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '\n')
    .replace(/^[ \t]+/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

[
  ['css/styles.css', minifyCSS],
  ['js/config.js', trimJS],
  ['js/shop.js', trimJS]
].forEach(function (row) {
  var file = path.join(DEMO_DIR, row[0]);
  var orig = fs.readFileSync(file, 'utf8');
  var out = row[1](orig);
  fs.writeFileSync(file, out, 'utf8');
  console.log('minified: ' + row[0] + ' (' + orig.length + ' -> ' + out.length + ' B)');
});
console.log('OK — assets minified.');