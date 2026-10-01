/* Cebador — portada: bloques de color y los productos más pedidos. */
(function () {
  'use strict';

  var C = window.Cebador;
  var DESTACADOS = ['mate-calabaza', 'termo-acero', 'bombilla-pico', 'yerba-artesanal'];
  var MAS_PEDIDOS = ['mate-camionero', 'termo-acero', 'yerba-artesanal', 'bolso-matero', 'bombilla-pico', 'kit-inicio', 'mate-calabaza', 'pava-electrica'];

  var bloques = document.querySelector('[data-bloques]');
  bloques.innerHTML = DESTACADOS.map(function (id, i) {
    var p = C.porId(id);
    return '<a class="bloque f-' + p.fondo + '" style="--i:' + i + '" href="producto/?id=' + p.id + '" aria-label="' + p.nombre + '">' +
      window.Arte.svg(p.arte, C.roles(p, C.seleccionInicial(p)), '') + '</a>';
  }).join('');

  document.querySelector('[data-mas-pedidos]').innerHTML = MAS_PEDIDOS.map(function (id) {
    return window.Vista.tarjeta(C.porId(id), '');
  }).join('');
})();
