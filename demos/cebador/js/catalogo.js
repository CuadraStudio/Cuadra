/* Cebador — catálogo: filtro por categoría, solo con stock y orden por precio. */
(function () {
  'use strict';

  var C = window.Cebador;
  var chips = document.querySelector('[data-chips]');
  var grilla = document.querySelector('[data-grilla]');
  var cuenta = document.querySelector('[data-cuenta]');
  var vacio = document.querySelector('[data-vacio]');
  var soloStock = document.getElementById('solo-stock');
  var orden = document.getElementById('orden');

  var params = new URLSearchParams(window.location.search);
  var categoria = C.CATEGORIAS.some(function (c) { return c.id === params.get('cat'); }) ? params.get('cat') : 'todo';

  function contar(id) {
    return C.PRODUCTOS.filter(function (p) { return id === 'todo' || p.cat === id; }).length;
  }

  chips.innerHTML = [{ id: 'todo', nombre: 'Todo' }].concat(C.CATEGORIAS).map(function (c) {
    return '<label class="chip"><input type="radio" name="cat" value="' + c.id + '"' + (c.id === categoria ? ' checked' : '') + '>' +
      '<span>' + c.nombre + ' <small>' + contar(c.id) + '</small></span></label>';
  }).join('');

  function pintar() {
    var lista = C.PRODUCTOS.filter(function (p) {
      if (categoria !== 'todo' && p.cat !== categoria) return false;
      if (soloStock.checked && C.stockTotal(p) === 0) return false;
      return true;
    });
    if (orden.value === 'menor') lista.sort(function (a, b) { return C.desde(a) - C.desde(b); });
    if (orden.value === 'mayor') lista.sort(function (a, b) { return C.desde(b) - C.desde(a); });

    grilla.innerHTML = lista.map(function (p) { return window.Vista.tarjeta(p, '../'); }).join('');
    cuenta.textContent = lista.length + (lista.length === 1 ? ' producto' : ' productos');
    vacio.hidden = lista.length !== 0;
  }

  chips.addEventListener('change', function (e) {
    if (e.target.name === 'cat') {
      categoria = e.target.value;
      var url = categoria === 'todo' ? window.location.pathname : window.location.pathname + '?cat=' + categoria;
      try { window.history.replaceState(null, '', url); } catch (err) { /* ignorar */ }
      pintar();
    }
  });
  soloStock.addEventListener('change', pintar);
  orden.addEventListener('change', pintar);
  pintar();
})();
