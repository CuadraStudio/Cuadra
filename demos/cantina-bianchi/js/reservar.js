/* Cantina Bianchi — reserva de mesa (demostración: no guarda ni envía nada). */
(function () {
  'use strict';

  var B = window.Bianchi;
  var MAX = 10;
  var state = { personas: 2, fecha: null, hora: null };

  var form = document.getElementById('reserva');
  var diasEl = form.querySelector('[data-dias]');
  var franjasEl = form.querySelector('[data-franjas]');
  var outPersonas = form.querySelector('[data-personas]');
  var btnMenos = form.querySelector('[data-menos]');
  var btnMas = form.querySelector('[data-mas]');
  var btnConfirmar = form.querySelector('[data-confirmar]');
  var rPersonas = form.querySelector('[data-r-personas]');
  var rDia = form.querySelector('[data-r-dia]');
  var rHora = form.querySelector('[data-r-hora]');
  var ticket = document.getElementById('ticket');
  var now = B.ahora();

  function pluralPersonas(n) { return n + (n === 1 ? ' persona' : ' personas'); }

  function diasDisponibles() {
    var out = [];
    for (var i = 0; i < 8; i++) {
      var iso = B.sumarDias(now.iso, i);
      var dow = B.dowDe(iso);
      var cerrado = dow === B.CERRADO;
      var corto = B.DIAS[dow].slice(0, 3);
      var p = iso.split('-');
      out.push({
        iso: iso,
        cerrado: cerrado,
        titulo: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : B.cap(corto),
        detalle: (+p[2]) + ' ' + B.MESES[+p[1] - 1].slice(0, 3),
        cerradoTexto: cerrado ? 'Cerrado' : ''
      });
    }
    return out;
  }

  function pintarDias() {
    var lista = diasDisponibles();
    diasEl.innerHTML = lista.map(function (d) {
      return '<label class="opcion"><input type="radio" name="dia" value="' + d.iso + '"' +
        (d.cerrado ? ' disabled' : '') + (state.fecha === d.iso ? ' checked' : '') + '>' +
        '<span class="opcion__cara"><strong>' + d.titulo + '</strong><small>' + (d.cerrado ? 'Cerrado' : d.detalle) + '</small></span></label>';
    }).join('');
  }

  function celdaFranja(hora) {
    var libres = B.lugares(state.fecha, hora);
    var pasada = !B.reservable(state.fecha, hora, now);
    var sinLugar = libres < state.personas;
    var disabled = pasada || sinLugar;
    var texto = pasada ? 'Ya pasó' : (libres === 0 ? 'Completo' : (sinLugar ? 'Quedan ' + libres : 'Quedan ' + libres));
    var llenas = Math.max(libres === 0 ? 0 : 1, Math.ceil((libres / B.CAPACIDAD) * 6));
    var cupos = '';
    for (var i = 0; i < 6; i++) cupos += '<i' + (!pasada && i < llenas ? ' class="on"' : '') + '></i>';
    return '<label class="opcion"><input type="radio" name="hora" value="' + hora + '"' +
      (disabled ? ' disabled' : '') + (state.hora === hora ? ' checked' : '') + '>' +
      '<span class="opcion__cara"><span class="franja__hora">' + hora + '</span><span class="cupos" aria-hidden="true">' + cupos + '</span><small>' + texto + '</small></span></label>';
  }

  function pintarFranjas() {
    if (!state.fecha) {
      franjasEl.innerHTML = '<p class="aviso-grupo">Elegí un día para ver los horarios.</p>';
      return;
    }
    franjasEl.innerHTML =
      '<div class="franjas-grupo"><h3>Almuerzo</h3><div class="franjas">' + B.ALMUERZO.map(celdaFranja).join('') + '</div></div>' +
      '<div class="franjas-grupo"><h3>Cena</h3><div class="franjas">' + B.CENA.map(celdaFranja).join('') + '</div></div>';
  }

  function validarHora() {
    if (!state.fecha || !state.hora) return;
    var libres = B.lugares(state.fecha, state.hora);
    if (!B.reservable(state.fecha, state.hora, now) || libres < state.personas) state.hora = null;
  }

  function pintarResumen() {
    rPersonas.textContent = state.personas;
    if (state.fecha) {
      rDia.textContent = B.cap(B.fechaLarga(state.fecha));
      rDia.removeAttribute('data-vacio');
    } else {
      rDia.textContent = 'Elegí un día';
      rDia.setAttribute('data-vacio', 'true');
    }
    if (state.hora) {
      rHora.textContent = state.hora;
      rHora.removeAttribute('data-vacio');
    } else {
      rHora.textContent = 'Elegí una hora';
      rHora.setAttribute('data-vacio', 'true');
    }
    btnConfirmar.disabled = !(state.fecha && state.hora);
    outPersonas.textContent = pluralPersonas(state.personas);
    btnMenos.disabled = state.personas <= 1;
    btnMas.disabled = state.personas >= MAX;
  }

  function actualizar() {
    validarHora();
    pintarFranjas();
    pintarResumen();
  }

  btnMenos.addEventListener('click', function () { if (state.personas > 1) { state.personas -= 1; actualizar(); } });
  btnMas.addEventListener('click', function () { if (state.personas < MAX) { state.personas += 1; actualizar(); } });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'dia') { state.fecha = e.target.value; state.hora = null; actualizar(); }
    if (e.target.name === 'hora') { state.hora = e.target.value; pintarResumen(); }
  });

  function error(nombre, mensaje) {
    var campo = document.getElementById(nombre);
    form.querySelector('[data-error="' + nombre + '"]').textContent = mensaje;
    if (mensaje) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = document.getElementById('nombre').value.trim();
    var email = document.getElementById('email').value.trim();
    var ok = true;
    error('nombre', nombre ? '' : 'Escribí tu nombre.');
    if (!nombre) ok = false;
    var mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    error('email', mailOk ? '' : 'Escribí un email válido, por ejemplo nombre@correo.com.');
    if (!mailOk) ok = false;
    if (!state.fecha || !state.hora) ok = false;
    if (!ok) {
      var primero = form.querySelector('[aria-invalid="true"]');
      if (primero) primero.focus();
      return;
    }

    var alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var codigo = 'BNC-';
    for (var i = 0; i < 4; i++) codigo += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));

    ticket.querySelector('[data-t-codigo]').textContent = codigo;
    ticket.querySelector('[data-t-nombre]').textContent = nombre;
    ticket.querySelector('[data-t-personas]').textContent = pluralPersonas(state.personas);
    ticket.querySelector('[data-t-dia]').textContent = B.cap(B.fechaLarga(state.fecha));
    ticket.querySelector('[data-t-hora]').textContent = state.hora;
    form.classList.add('confirmada');
    ticket.classList.add('on');
    var titulo = ticket.querySelector('h2');
    titulo.focus();
    ticket.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  ticket.querySelector('[data-otra]').addEventListener('click', function () {
    form.reset();
    state.hora = null;
    form.classList.remove('confirmada');
    ticket.classList.remove('on');
    pintarDias();
    actualizar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Primer día con lugar disponible.
  var dias = diasDisponibles();
  for (var d = 0; d < dias.length; d++) {
    if (dias[d].cerrado) continue;
    var hayLugar = B.ALMUERZO.concat(B.CENA).some(function (h) {
      return B.reservable(dias[d].iso, h, now) && B.lugares(dias[d].iso, h) >= state.personas;
    });
    if (hayLugar) { state.fecha = dias[d].iso; break; }
  }
  pintarDias();
  actualizar();
})();
