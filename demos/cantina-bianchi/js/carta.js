/* Cantina Bianchi — filtros de la carta (vegetariano / sin gluten). */
(function () {
  'use strict';

  var checks = { V: document.getElementById('f-V'), SG: document.getElementById('f-SG') };
  var items = Array.prototype.slice.call(document.querySelectorAll('.item'));
  var secciones = Array.prototype.slice.call(document.querySelectorAll('.seccion'));
  var cuenta = document.querySelector('[data-cuenta]');
  var vacio = document.querySelector('[data-vacio]');

  function aplicar() {
    var activos = Object.keys(checks).filter(function (k) { return checks[k].checked; });
    var visibles = 0;

    items.forEach(function (item) {
      var tags = (item.getAttribute('data-tags') || '').split(' ');
      var ok = activos.every(function (k) { return tags.indexOf(k) !== -1; });
      item.hidden = !ok;
      if (ok) visibles += 1;
    });

    secciones.forEach(function (sec) {
      sec.hidden = sec.querySelectorAll('.item:not([hidden])').length === 0;
    });

    vacio.hidden = visibles !== 0;
    cuenta.textContent = activos.length ? 'Mostrando ' + visibles + (visibles === 1 ? ' plato' : ' platos') : '';
  }

  Object.keys(checks).forEach(function (k) { checks[k].addEventListener('change', aplicar); });
  aplicar();
})();
