/* Cebador — fragmentos de interfaz compartidos (tarjeta de producto). */
(function () {
  'use strict';

  var C = window.Cebador;

  function puntos(p) {
    var op = p.opciones.filter(function (o) { return o.rol && o.valores[0].c; })[0];
    if (!op || op.valores.length < 2) return '';
    return '<span class="puntos" aria-hidden="true">' + op.valores.map(function (v) {
      return '<span class="punto" style="background:' + v.c + '"></span>';
    }).join('') + '</span>';
  }

  function variaPrecio(p) {
    return p.opciones.some(function (o) { return o.valores.some(function (v) { return v.extra; }); });
  }

  // base: '' desde la portada, '../' desde las subpáginas.
  function tarjeta(p, base) {
    var sel = C.seleccionInicial(p);
    var total = C.stockTotal(p);
    var etiqueta = total === 0 ? 'Agotado' : (total <= 8 ? 'Quedan pocos' : '');
    return '<a class="tarjeta' + (total === 0 ? ' tarjeta--agotado' : '') + '" href="' + base + 'producto/?id=' + p.id + '">' +
      '<div class="tarjeta__arte f-' + p.fondo + '">' + (etiqueta ? '<span class="etiqueta">' + etiqueta + '</span>' : '') +
      window.Arte.svg(p.arte, C.roles(p, sel), p.nombre) + '</div>' +
      '<div class="tarjeta__texto"><h3 class="tarjeta__nombre">' + p.nombre + puntos(p) + '</h3>' +
      '<p class="tarjeta__corto">' + p.corto + '</p>' +
      '<p class="tarjeta__precio">' + (variaPrecio(p) ? 'Desde ' : '') + C.formato(C.desde(p)) + '</p></div></a>';
  }

  window.Vista = { tarjeta: tarjeta };
})();
