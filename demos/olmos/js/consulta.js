/* Estudio Olmos — pedido de consulta (demostración: no guarda ni envía nada). */
(function () {
  'use strict';

  var O = window.Olmos;
  var TEMAS = {
    monotributo: 'Monotributo y aportes',
    literal: 'Literal E y unipersonales',
    empresa: 'Pyme: contabilidad y sueldos',
    irpf: 'Declaración de IRPF',
    abrir: 'Abrir una empresa',
    otro: 'Otro tema'
  };
  // Acepta ?tema=... y, como respaldo, #tema (por si el entorno no entrega la consulta).
  function temaDeUrl() {
    return new URLSearchParams(window.location.search).get('tema') || window.location.hash.replace('#', '');
  }

  var state = { tema: null, modalidad: 'presencial', minutos: 20, fecha: null, hora: null };
  var now = O.ahora();

  var form = document.getElementById('consulta');
  var raiz = document.querySelector('[data-agenda]');
  var diasEl = form.querySelector('[data-dias]');
  var horasEl = form.querySelector('[data-horas]');
  var btn = form.querySelector('[data-confirmar]');
  var constancia = document.getElementById('constancia');
  var f = {
    tema: form.querySelector('[data-f-tema]'), modalidad: form.querySelector('[data-f-modalidad]'),
    cuando: form.querySelector('[data-f-cuando]'), duracion: form.querySelector('[data-f-duracion]')
  };

  var MODALIDADES = { presencial: 'Presencial en Pocitos', video: 'Videollamada', telefono: 'Teléfono' };

  function setVacio(el, texto, vacio) {
    el.textContent = texto;
    if (vacio) el.setAttribute('data-vacio', 'true'); else el.removeAttribute('data-vacio');
  }

  function diasHabiles() {
    var out = [];
    var i = 0;
    while (out.length < 10 && i < 30) {
      var iso = O.sumarDias(now.iso, i);
      if (O.esHabil(iso)) out.push(iso);
      i += 1;
    }
    return out;
  }

  function pintarDias() {
    diasEl.innerHTML = diasHabiles().map(function (iso) {
      var p = iso.split('-');
      var dia = O.DIAS[new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay()].slice(0, 3);
      var hay = O.MANANA.concat(O.TARDE).some(function (h) { return O.reservable(iso, h, state.minutos, now); });
      return '<label class="op"><input type="radio" name="dia" value="' + iso + '"' + (hay ? '' : ' disabled') + (state.fecha === iso ? ' checked' : '') + '>' +
        '<span class="op__cara"><strong>' + O.cap(dia) + '</strong><small>' + (+p[2]) + ' ' + O.MESES[+p[1] - 1].slice(0, 3) + '</small></span></label>';
    }).join('');
  }

  function celda(hora) {
    var ok = O.reservable(state.fecha, hora, state.minutos, now);
    return '<label class="op"><input type="radio" name="hora" value="' + hora + '"' + (ok ? '' : ' disabled') + (state.hora === hora ? ' checked' : '') + '>' +
      '<span class="op__cara">' + hora + '</span></label>';
  }

  function pintarHoras() {
    if (!state.fecha) { horasEl.innerHTML = '<p class="nota">Elegí un día para ver los horarios.</p>'; return; }
    horasEl.innerHTML = '<div class="horas">' + O.MANANA.concat(O.TARDE).map(celda).join('') + '</div>' +
      '<p class="nota">Atendemos de 9 a 13 y de 14 a 18. Los horarios tachados ya están ocupados.</p>';
  }

  function actualizar() {
    if (state.fecha && state.hora && !O.reservable(state.fecha, state.hora, state.minutos, now)) state.hora = null;
    pintarDias();
    pintarHoras();
    setVacio(f.tema, state.tema ? TEMAS[state.tema] : 'Elegí un tema', !state.tema);
    setVacio(f.modalidad, MODALIDADES[state.modalidad], false);
    setVacio(f.duracion, state.minutos === 20 ? '20 minutos, sin costo' : '60 minutos, $U 1.500', false);
    setVacio(f.cuando, state.fecha && state.hora ? O.cap(O.fechaLarga(state.fecha)) + ', ' + state.hora : (state.fecha ? O.cap(O.fechaLarga(state.fecha)) + ' · elegí una hora' : 'Elegí día y hora'), !(state.fecha && state.hora));
    btn.disabled = !(state.tema && state.fecha && state.hora);
  }

  form.addEventListener('change', function (e) {
    var n = e.target.name;
    if (n === 'tema') state.tema = e.target.value;
    if (n === 'modalidad') state.modalidad = e.target.value;
    if (n === 'duracion') { state.minutos = +e.target.value; state.hora = null; }
    if (n === 'dia') { state.fecha = e.target.value; state.hora = null; }
    if (n === 'hora') state.hora = e.target.value;
    actualizar();
  });

  function error(id, mensaje) {
    var campo = document.getElementById(id);
    form.querySelector('[data-error="' + id + '"]').textContent = mensaje;
    if (mensaje) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid');
    return !mensaje;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = document.getElementById('nombre').value.trim();
    var email = document.getElementById('email').value.trim();
    var ok = true;
    ok = error('nombre', nombre ? '' : 'Escribí tu nombre.') && ok;
    ok = error('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Escribí un email válido, por ejemplo nombre@correo.com.') && ok;
    if (!ok) { var primero = form.querySelector('[aria-invalid="true"]'); if (primero) primero.focus(); return; }
    if (!(state.tema && state.fecha && state.hora)) return;

    constancia.querySelector('[data-c-nombre]').textContent = nombre;
    constancia.querySelector('[data-c-tema]').textContent = TEMAS[state.tema];
    constancia.querySelector('[data-c-cuando]').textContent = O.cap(O.fechaLarga(state.fecha)) + ', ' + state.hora;
    constancia.querySelector('[data-c-modalidad]').textContent = MODALIDADES[state.modalidad];
    constancia.querySelector('[data-c-duracion]').textContent = state.minutos === 20 ? '20 minutos, sin costo' : '60 minutos, $U 1.500';
    constancia.querySelector('[data-c-email]').textContent = email;
    raiz.classList.add('hecha');
    constancia.classList.add('on');
    var titulo = constancia.querySelector('h2');
    titulo.focus();
    constancia.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  constancia.querySelector('[data-otra]').addEventListener('click', function () {
    form.reset();
    state.fecha = null; state.hora = null; state.minutos = 20; state.modalidad = 'presencial';
    var tema = temaDeUrl();
    state.tema = TEMAS[tema] ? tema : null;
    raiz.classList.remove('hecha');
    constancia.classList.remove('on');
    var radio = state.tema && form.querySelector('input[name="tema"][value="' + state.tema + '"]');
    if (radio) radio.checked = true;
    actualizar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Tema preseleccionado desde la portada o desde servicios (?tema=irpf).
  var t = temaDeUrl();
  if (t && TEMAS[t]) {
    state.tema = t;
    var r = form.querySelector('input[name="tema"][value="' + t + '"]');
    if (r) r.checked = true;
  }
  // Primer día con horarios libres.
  var primero = diasHabiles().filter(function (iso) { return O.MANANA.concat(O.TARDE).some(function (h) { return O.reservable(iso, h, 20, now); }); })[0];
  if (primero) state.fecha = primero;
  actualizar();
})();
