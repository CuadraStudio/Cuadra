/* Cebador — carrito y pedido (demostración: no guarda ni envía nada). */
(function () {
  'use strict';

  var C = window.Cebador;
  var K = window.Carro;
  var raiz = document.querySelector('[data-carrito]');
  var lineasEl = raiz.querySelector('[data-lineas]');
  var vacioEl = document.querySelector('[data-vacio-carro]');
  var flujo = raiz.querySelector('.car__flujo');
  var enviosEl = raiz.querySelector('[data-envios]');
  var form = raiz.querySelector('[data-pedido]');
  var campoDir = raiz.querySelector('[data-campo-dir]');
  var ticket = raiz.querySelector('[data-confirmado]');
  var envio = C.ENVIOS[0];

  enviosEl.innerHTML = C.ENVIOS.map(function (e, i) {
    return '<label class="envio"><input type="radio" name="envio" value="' + e.id + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="envio__cara"><span><strong>' + e.nombre + '</strong><small>' + e.detalle + '</small></span><span>' +
      (e.precio ? C.formato(e.precio) : 'Gratis') + '</span></span></label>';
  }).join('');

  function pintar() {
    var lista = K.items();
    var hay = lista.length > 0;
    flujo.hidden = !hay;
    vacioEl.hidden = hay;
    if (!hay) return;

    lineasEl.innerHTML = lista.map(function (it, i) {
      var p = C.porId(it.id);
      var tope = C.stock(p, it.sel);
      return '<li class="linea">' +
        '<div class="linea__arte f-' + p.fondo + '">' + window.Arte.svg(p.arte, C.roles(p, it.sel), '') + '</div>' +
        '<div><h3 class="linea__nombre"><a href="../producto/?id=' + p.id + '">' + p.nombre + '</a></h3><p class="linea__var">' + C.textoSeleccion(p, it.sel) + '</p></div>' +
        '<div class="linea__pie"><div class="cantidad"><button type="button" data-menos="' + i + '" aria-label="Una unidad menos de ' + p.nombre + '"' + (it.cant <= 1 ? ' disabled' : '') + '>−</button>' +
        '<output aria-live="polite">' + it.cant + '</output>' +
        '<button type="button" data-mas="' + i + '" aria-label="Una unidad más de ' + p.nombre + '"' + (it.cant >= tope ? ' disabled' : '') + '>+</button></div>' +
        '<span class="linea__precio">' + C.formato(C.precioDe(p, it.sel) * it.cant) + '</span>' +
        '<button type="button" class="linea__quitar" data-quitar="' + i + '">Quitar</button></div>' +
        (it.cant >= tope ? '<p class="linea__tope">Es el máximo disponible de esta variante.</p>' : '') + '</li>';
    }).join('');

    var sub = K.subtotal();
    raiz.querySelector('[data-sub]').textContent = C.formato(sub);
    raiz.querySelector('[data-envio-precio]').textContent = envio.precio ? C.formato(envio.precio) : 'Gratis';
    raiz.querySelector('[data-total]').textContent = C.formato(sub + envio.precio);
    campoDir.hidden = envio.id === 'retiro';
  }

  raiz.addEventListener('click', function (e) {
    var t = e.target.closest('[data-menos],[data-mas],[data-quitar]');
    if (!t) return;
    var lista = K.items();
    if (t.hasAttribute('data-quitar')) { K.quitar(+t.getAttribute('data-quitar')); }
    if (t.hasAttribute('data-menos')) { var i = +t.getAttribute('data-menos'); K.cambiar(i, lista[i].cant - 1); }
    if (t.hasAttribute('data-mas')) { var j = +t.getAttribute('data-mas'); K.cambiar(j, lista[j].cant + 1); }
  });

  document.addEventListener('carro:cambio', pintar);

  enviosEl.addEventListener('change', function (e) {
    envio = C.ENVIOS.filter(function (x) { return x.id === e.target.value; })[0];
    pintar();
  });

  function error(id, mensaje) {
    var campo = document.getElementById(id);
    raiz.querySelector('[data-error="' + id + '"]').textContent = mensaje;
    if (mensaje) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid');
    return !mensaje;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = document.getElementById('nombre').value.trim();
    var email = document.getElementById('email').value.trim();
    var dir = document.getElementById('dir').value.trim();
    var ok = true;
    ok = error('nombre', nombre ? '' : 'Escribí tu nombre.') && ok;
    ok = error('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Escribí un email válido, por ejemplo nombre@correo.com.') && ok;
    ok = error('dir', envio.id === 'retiro' || dir ? '' : 'Escribí la dirección de entrega.') && ok;
    if (!ok) { var primero = raiz.querySelector('[aria-invalid="true"]'); if (primero) primero.focus(); return; }

    var lista = K.items();
    var sub = K.subtotal();
    var alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var codigo = 'CEB-';
    for (var i = 0; i < 4; i++) codigo += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));

    ticket.querySelector('[data-t-codigo]').textContent = codigo;
    ticket.querySelector('[data-t-nombre]').textContent = nombre;
    ticket.querySelector('[data-t-email]').textContent = email;
    ticket.querySelector('[data-t-envio]').textContent = envio.nombre;
    ticket.querySelector('[data-t-items]').textContent = lista.reduce(function (n, it) { return n + it.cant; }, 0) + ' productos';
    ticket.querySelector('[data-t-total]').textContent = C.formato(sub + envio.precio);
    K.vaciar();
    raiz.classList.add('hecho');
    ticket.classList.add('on');
    var titulo = ticket.querySelector('h2');
    titulo.focus();
    ticket.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  pintar();
})();
