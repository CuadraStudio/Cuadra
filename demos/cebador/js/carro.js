/* Cebador — carrito (localStorage, con respaldo en memoria) y contador del encabezado. */
(function () {
  'use strict';

  var C = window.Cebador;
  var KEY = 'cebador-carrito-demo';
  var memoria = [];

  function leer() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return memoria;
    }
  }

  function guardar(items) {
    memoria = items;
    try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* sin almacenamiento */ }
    pintar();
    document.dispatchEvent(new CustomEvent('carro:cambio'));
  }

  // Descarta productos que ya no existen y ajusta cantidades al stock disponible.
  function items() {
    return leer().filter(function (it) {
      return it && C.porId(it.id) && it.sel && it.cant > 0;
    }).map(function (it) {
      var p = C.porId(it.id);
      var tope = C.stock(p, it.sel);
      return { id: it.id, sel: it.sel, cant: Math.min(it.cant, Math.max(tope, 0)) };
    }).filter(function (it) { return it.cant > 0; });
  }

  function mismaLinea(a, b) {
    return a.id === b.id && JSON.stringify(a.sel) === JSON.stringify(b.sel);
  }

  // Agrega unidades sin pasar el stock. Devuelve { agregadas, tope }.
  function agregar(id, sel, cant) {
    var p = C.porId(id);
    var tope = C.stock(p, sel);
    var lista = items();
    var linea = lista.filter(function (it) { return mismaLinea(it, { id: id, sel: sel }); })[0];
    var actual = linea ? linea.cant : 0;
    var nuevas = Math.max(0, Math.min(cant, tope - actual));
    if (nuevas > 0) {
      if (linea) linea.cant += nuevas; else lista.push({ id: id, sel: sel, cant: nuevas });
      guardar(lista);
    }
    return { agregadas: nuevas, tope: tope, enCarrito: actual + nuevas };
  }

  function cambiar(indice, cant) {
    var lista = items();
    if (!lista[indice]) return;
    var p = C.porId(lista[indice].id);
    var tope = C.stock(p, lista[indice].sel);
    lista[indice].cant = Math.max(1, Math.min(cant, tope));
    guardar(lista);
  }

  function quitar(indice) {
    var lista = items();
    lista.splice(indice, 1);
    guardar(lista);
  }

  function vaciar() { guardar([]); }

  function cantidad() {
    return items().reduce(function (n, it) { return n + it.cant; }, 0);
  }

  function subtotal() {
    return items().reduce(function (s, it) {
      var p = C.porId(it.id);
      return s + C.precioDe(p, it.sel) * it.cant;
    }, 0);
  }

  function pintar() {
    var n = cantidad();
    document.querySelectorAll('[data-carrito-cant]').forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
    document.querySelectorAll('[data-carrito-enlace]').forEach(function (a) {
      a.setAttribute('aria-label', 'Carrito, ' + n + (n === 1 ? ' producto' : ' productos'));
    });
  }

  window.Carro = { items: items, agregar: agregar, cambiar: cambiar, quitar: quitar, vaciar: vaciar, cantidad: cantidad, subtotal: subtotal };
  pintar();
})();
