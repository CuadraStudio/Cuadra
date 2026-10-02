/* Barbería Hierro — reserva de turno: servicio, barbero, día, hora y ticket numerado. */
(function () {
  'use strict';
  var H = window.Hierro, now = H.ahora();
  var form = document.querySelector('[data-agenda]');
  if (!form) return;

  var estado = { servicio: 'corte', barbero: 'cualquiera', fecha: '', hora: '' };
  var DIAS = H.proximosDias(10, now);

  var $ = function (s) { return form.querySelector(s); };
  var elServ = $('[data-servicios]'), elBarb = $('[data-barberos]'), elDias = $('[data-dias]'), elHoras = $('[data-horas]');
  var fTodo = form.parentNode;

  function duracion() { return H.porId(H.SERVICIOS, estado.servicio).min; }

  // ---------- Opciones de servicio y barbero ----------
  elServ.innerHTML = H.SERVICIOS.map(function (s) {
    return '<label class="op"><input type="radio" name="servicio" value="' + s.id + '"' + (s.id === estado.servicio ? ' checked' : '') + '>' +
      '<span class="op__cara">' + s.nombre + '<small>' + s.min + ' min · ' + H.dinero(s.precio) + '</small></span></label>';
  }).join('');
  elBarb.innerHTML = '<label class="op"><input type="radio" name="barbero" value="cualquiera" checked><span class="op__cara">El primero libre<small>Más horarios para elegir</small></span></label>' +
    H.BARBEROS.map(function (b) {
      return '<label class="op"><input type="radio" name="barbero" value="' + b.id + '"><span class="op__cara">' + b.nombre + '<small>' + b.rol + '</small></span></label>';
    }).join('');

  // ---------- Disponibilidad ----------
  function quienLibre(iso, hora) {
    var ids = estado.barbero === 'cualquiera' ? H.BARBEROS.map(function (b) { return b.id; }) : [estado.barbero];
    for (var i = 0; i < ids.length; i++) if (H.reservable(ids[i], iso, hora, duracion(), now)) return ids[i];
    return null;
  }
  function diaTieneTurnos(iso) {
    for (var i = 0; i < H.HORAS.length; i++) if (quienLibre(iso, H.HORAS[i])) return true;
    return false;
  }

  function pintarDias() {
    elDias.innerHTML = DIAS.map(function (iso) {
      var p = H.partesIso(iso), hay = diaTieneTurnos(iso);
      return '<label class="dia"><input type="radio" name="fecha" value="' + iso + '"' + (hay ? '' : ' disabled') + (iso === estado.fecha ? ' checked' : '') + '>' +
        '<span class="dia__cara" aria-label="' + H.fechaLarga(iso) + (hay ? '' : ', sin turnos') + '"><span>' + H.DIAS_C[H.dowDe(iso)] + '</span><b>' + p[2] + '</b></span></label>';
    }).join('');
  }

  function pintarHoras() {
    if (!estado.fecha) { elHoras.innerHTML = '<p class="sin-turnos">Elegí un día para ver los horarios.</p>'; return; }
    var grupos = [['Mañana', H.MANANA], ['Tarde', H.TARDE]];
    elHoras.innerHTML = grupos.map(function (g) {
      return '<p class="franja">' + g[0] + '</p><div class="horas">' + g[1].map(function (h) {
        var ok = !!quienLibre(estado.fecha, h);
        return '<label class="hora"><input type="radio" name="hora" value="' + h + '"' + (ok ? '' : ' disabled') + (h === estado.hora ? ' checked' : '') + '>' +
          '<span class="hora__cara">' + h + '</span></label>';
      }).join('') + '</div>';
    }).join('');
  }

  // ---------- Ficha ----------
  function ficha() {
    var s = H.porId(H.SERVICIOS, estado.servicio);
    var b = estado.barbero === 'cualquiera' ? null : H.porId(H.BARBEROS, estado.barbero);
    setF('servicio', s.nombre + ' · ' + s.min + ' min', false);
    setF('barbero', b ? b.nombre : 'El primero libre', false);
    setF('cuando', estado.fecha && estado.hora ? H.cap(H.fechaLarga(estado.fecha)) + ', ' + estado.hora : 'Elegí día y hora', !(estado.fecha && estado.hora));
    setF('precio', H.dinero(s.precio) + ' · se paga en el local', false);
    $('[data-confirmar]').disabled = !(estado.fecha && estado.hora);
  }
  function setF(k, t, vacio) {
    var el = $('[data-f-' + k + ']');
    el.textContent = t;
    if (vacio) el.setAttribute('data-vacio', 'true'); else el.removeAttribute('data-vacio');
  }

  function refrescar() {
    if (estado.fecha && !diaTieneTurnos(estado.fecha)) { estado.fecha = ''; estado.hora = ''; }
    if (estado.hora && !quienLibre(estado.fecha, estado.hora)) estado.hora = '';
    pintarDias(); pintarHoras(); ficha();
  }

  form.addEventListener('change', function (e) {
    var n = e.target.name;
    if (n === 'servicio') estado.servicio = e.target.value;
    else if (n === 'barbero') estado.barbero = e.target.value;
    else if (n === 'fecha') { estado.fecha = e.target.value; estado.hora = ''; }
    else if (n === 'hora') estado.hora = e.target.value;
    else return;
    refrescar();
  });

  // ---------- Preselección desde el tablero (?r= o #) ----------
  (function () {
    var m = /[?&]r=([^&#]+)/.exec(location.search), crudo = m ? decodeURIComponent(m[1]) : decodeURIComponent(location.hash.replace(/^#/, ''));
    var p = crudo.split('|');
    if (p.length !== 3 || !H.porId(H.BARBEROS, p[0]) || DIAS.indexOf(p[1]) === -1) return;
    estado.barbero = p[0]; estado.fecha = p[1];
    if (H.reservable(p[0], p[1], p[2], duracion(), now)) estado.hora = p[2];
    var r = form.querySelector('input[name="barbero"][value="' + p[0] + '"]');
    if (r) r.checked = true;
  })();
  refrescar();

  // ---------- Envío ----------
  function validar() {
    var ok = true, nombre = $('#nombre'), email = $('#email');
    [['nombre', nombre.value.trim().length >= 2, 'Escribí tu nombre.'],
     ['email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), 'Escribí un email válido.']].forEach(function (c) {
      var campo = $('#' + c[0]), msg = $('[data-error="' + c[0] + '"]');
      if (c[1]) { campo.removeAttribute('aria-invalid'); msg.textContent = ''; }
      else { campo.setAttribute('aria-invalid', 'true'); msg.textContent = c[2]; if (ok) campo.focus(); ok = false; }
    });
    return ok;
  }

  function numeroDeTurno() {
    var t = estado.fecha + estado.hora + $('#nombre').value, h = 7;
    for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 97;
    return H.pad(h + 1);
  }

  function ics(b, s) {
    var f = estado.fecha.replace(/-/g, ''), ini = estado.hora.replace(':', '') + '00';
    var fin = (function () { var m = (+estado.hora.slice(0, 2)) * 60 + (+estado.hora.slice(3)) + s.min; return H.pad(Math.floor(m / 60)) + H.pad(m % 60) + '00'; })();
    var txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Barberia Hierro (demo)//ES', 'BEGIN:VEVENT',
      'UID:hierro-' + f + ini + '@demo', 'DTSTAMP:' + f + 'T' + ini,
      'DTSTART;TZID=America/Montevideo:' + f + 'T' + ini, 'DTEND;TZID=America/Montevideo:' + f + 'T' + fin,
      'SUMMARY:' + s.nombre + ' en Barbería Hierro', 'DESCRIPTION:Turno con ' + b.nombre + ' (demo)',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(txt);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!estado.fecha || !estado.hora || !validar()) return;
    var s = H.porId(H.SERVICIOS, estado.servicio);
    var b = H.porId(H.BARBEROS, quienLibre(estado.fecha, estado.hora));
    var nombre = $('#nombre').value.trim(), email = $('#email').value.trim();
    var zona = document.querySelector('[data-ticket]');
    zona.innerHTML =
      '<article class="ticket" tabindex="-1" aria-labelledby="tk-t"><div class="poste"></div><div class="ticket__cuerpo">' +
      '<p class="ticket__rotulo">Turno confirmado · Barbería Hierro</p>' +
      '<p class="ticket__num" aria-label="Número de turno ' + numeroDeTurno() + '"><span>N°</span>' + numeroDeTurno() + '</p>' +
      '<h2 id="tk-t">Listo, ' + nombre.replace(/[<>&"]/g, '') + '.</h2>' +
      '<dl><div><dt>Cuándo</dt><dd>' + H.cap(H.fechaLarga(estado.fecha)) + ', ' + estado.hora + '</dd></div>' +
      '<div><dt>Servicio</dt><dd>' + s.nombre + ' · ' + s.min + ' min</dd></div>' +
      '<div><dt>Con</dt><dd>' + b.nombre + '</dd></div>' +
      '<div><dt>Total</dt><dd>' + H.dinero(s.precio) + ', se paga en el local</dd></div></dl></div>' +
      '<div class="ticket__perf" aria-hidden="true"></div>' +
      '<div class="ticket__pie"><p>Demo: no se guardó ni se envió nada. En una barbería real, la confirmación llegaría a ' + email.replace(/[<>&"]/g, '') + ' y un recordatorio el día anterior.</p>' +
      '<div class="ticket__acciones"><a class="btn" href="' + ics(b, s) + '" download="turno-hierro.ics">Sumar al calendario</a>' +
      '<button class="btn btn--borde" type="button" data-otro>Pedir otro turno</button></div></div></article>';
    fTodo.hidden = true; zona.hidden = false;
    var tk = zona.querySelector('.ticket'); tk.focus({ preventScroll: true });
    window.scrollTo({ top: Math.max(0, zona.getBoundingClientRect().top + window.pageYOffset - 24), behavior: 'auto' });
    zona.querySelector('[data-otro]').addEventListener('click', function () {
      estado.fecha = ''; estado.hora = ''; form.reset();
      estado.servicio = 'corte'; estado.barbero = 'cualquiera';
      zona.hidden = true; zona.innerHTML = ''; fTodo.hidden = false;
      refrescar(); window.scrollTo(0, 0);
    });
  });
})();
