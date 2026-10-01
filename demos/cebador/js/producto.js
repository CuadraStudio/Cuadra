/* Cebador — ficha de producto: variantes, stock por variante y agregar al carrito. */
(function () {
  'use strict';

  var C = window.Cebador;
  // Acepta ?id=... y, como respaldo, #id (por si el entorno no entrega la consulta).
  var id = new URLSearchParams(window.location.search).get('id') || window.location.hash.replace('#', '');
  var p = C.porId(id);
  var raiz = document.querySelector('[data-producto]');

  if (!p) {
    raiz.innerHTML = '<div class="vacio-carro"><p>No encontramos ese producto.</p><a class="btn" href="../catalogo/">Ver el catálogo</a></div>';
    return;
  }

  document.title = p.nombre + ' | Cebador';
  var sel = C.seleccionInicial(p);
  var cant = 1;

  var arteEl = raiz.querySelector('[data-arte]');
  var nombreEl = raiz.querySelector('[data-nombre]');
  var precioEl = raiz.querySelector('[data-precio]');
  var descEl = raiz.querySelector('[data-desc]');
  var opcionesEl = raiz.querySelector('[data-opciones]');
  var stockEl = raiz.querySelector('[data-stock]');
  var cantEl = raiz.querySelector('[data-cant]');
  var menos = raiz.querySelector('[data-menos]');
  var mas = raiz.querySelector('[data-mas]');
  var agregar = raiz.querySelector('[data-agregar]');
  var avisoEl = raiz.querySelector('[data-aviso]');
  var detallesEl = raiz.querySelector('[data-detalles]');
  var migasEl = raiz.querySelector('[data-migas]');

  var cat = C.CATEGORIAS.filter(function (c) { return c.id === p.cat; })[0];
  migasEl.innerHTML = '<a href="../catalogo/">Catálogo</a> / <a href="../catalogo/?cat=' + p.cat + '">' + cat.nombre + '</a>';
  arteEl.className = 'prod__arte f-' + p.fondo;
  nombreEl.textContent = p.nombre;
  descEl.textContent = p.desc;
  detallesEl.innerHTML = p.detalles.map(function (d) { return '<li>' + d + '</li>'; }).join('');

  // Grupos de opciones (radios con aspecto de chip o de muestra de color).
  opcionesEl.innerHTML = p.opciones.map(function (op) {
    var valores = op.valores.map(function (v) {
      var muestra = v.c ? '<span class="opcion__color" style="background:' + v.c + '" aria-hidden="true"></span>' : '';
      return '<label class="opcion" data-valor="' + op.id + ':' + v.id + '"><input type="radio" name="' + op.id + '" value="' + v.id + '"' +
        (sel[op.id] === v.id ? ' checked' : '') + '><span class="opcion__cara">' + muestra + v.label + '</span></label>';
    }).join('');
    return '<fieldset class="grupo"><legend>' + op.nombre + ' <span data-leyenda="' + op.id + '"></span></legend><div class="opciones">' + valores + '</div></fieldset>';
  }).join('');

  function conValor(op, valId) {
    var copia = {};
    Object.keys(sel).forEach(function (k) { copia[k] = sel[k]; });
    copia[op.id] = valId;
    return copia;
  }

  function actualizar() {
    var disponible = C.stock(p, sel);
    cant = Math.max(1, Math.min(cant, Math.max(disponible, 1)));

    arteEl.innerHTML = window.Arte.svg(p.arte, C.roles(p, sel), p.nombre + ', ' + C.textoSeleccion(p, sel));
    precioEl.textContent = C.formato(C.precioDe(p, sel));

    p.opciones.forEach(function (op) {
      raiz.querySelector('[data-leyenda="' + op.id + '"]').textContent = C.valor(op, sel[op.id]).label;
      op.valores.forEach(function (v) {
        var etiqueta = raiz.querySelector('[data-valor="' + op.id + ':' + v.id + '"]');
        etiqueta.classList.toggle('opcion--sin', C.stock(p, conValor(op, v.id)) === 0);
      });
    });

    if (disponible === 0) {
      stockEl.textContent = 'Sin stock en esta combinación';
      stockEl.setAttribute('data-nivel', 'nada');
    } else if (disponible <= 5) {
      stockEl.textContent = disponible === 1 ? 'Queda 1 unidad' : 'Quedan ' + disponible + ' unidades';
      stockEl.setAttribute('data-nivel', 'poco');
    } else {
      stockEl.textContent = 'En stock';
      stockEl.setAttribute('data-nivel', 'ok');
    }

    cantEl.textContent = cant;
    menos.disabled = cant <= 1 || disponible === 0;
    mas.disabled = cant >= disponible;
    agregar.disabled = disponible === 0;
    agregar.textContent = disponible === 0 ? 'Sin stock' : 'Agregar al carrito';
  }

  opcionesEl.addEventListener('change', function (e) {
    sel[e.target.name] = e.target.value;
    avisoEl.textContent = '';
    actualizar();
  });

  menos.addEventListener('click', function () { if (cant > 1) { cant -= 1; actualizar(); } });
  mas.addEventListener('click', function () { cant += 1; actualizar(); });

  agregar.addEventListener('click', function () {
    var r = window.Carro.agregar(p.id, sel, cant);
    if (r.agregadas > 0) {
      var cuantas = r.agregadas === 1 ? '1 unidad' : r.agregadas + ' unidades';
      avisoEl.innerHTML = 'Agregaste ' + cuantas + ' al carrito. <a href="../carrito/">Ver carrito</a>';
      var badge = document.querySelector('[data-carrito-cant]');
      if (badge) { badge.classList.remove('salta'); void badge.offsetWidth; badge.classList.add('salta'); }
    } else {
      avisoEl.innerHTML = 'Ya tenés todas las unidades disponibles en el carrito. <a href="../carrito/">Ver carrito</a>';
    }
  });

  actualizar();
})();
