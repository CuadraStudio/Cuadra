/* Estudio Olmos — utilidades compartidas: hora de Montevideo, horario de atención
   y disponibilidad simulada de consultas. Vanilla JS, sin dependencias. */
(function () {
  'use strict';

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MANANA = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
  var TARDE = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function minutos(h) { var p = h.split(':'); return (+p[0]) * 60 + (+p[1]); }

  function dowDe(iso) {
    var p = iso.split('-');
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
  }

  function sumarDias(iso, n) {
    var p = iso.split('-');
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  }

  function ahora() {
    var partes = {};
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Montevideo', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (x) { partes[x.type] = x.value; });
    var iso = partes.year + '-' + partes.month + '-' + partes.day;
    return { iso: iso, dow: dowDe(iso), min: (+partes.hour) * 60 + (+partes.minute) };
  }

  function fechaLarga(iso) {
    var p = iso.split('-');
    return DIAS[dowDe(iso)] + ' ' + (+p[2]) + ' de ' + MESES[+p[1] - 1];
  }

  function esHabil(iso) { var d = dowDe(iso); return d >= 1 && d <= 5; }

  function hash(t) {
    var h = 2166136261;
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Un horario está libre según una regla simulada y estable.
  function libre(iso, hora) { return hash('olmos' + iso + hora) % 100 < 62; }

  // La consulta de 60 minutos necesita el horario siguiente también libre y de la misma franja.
  function reservable(iso, hora, minutosConsulta, now) {
    if (!esHabil(iso)) return false;
    if (iso < now.iso) return false;
    if (iso === now.iso && minutos(hora) <= now.min + 60) return false;
    if (!libre(iso, hora)) return false;
    if (minutosConsulta > 30) {
      var lista = MANANA.indexOf(hora) !== -1 ? MANANA : TARDE;
      var sig = lista[lista.indexOf(hora) + 1];
      if (!sig || !libre(iso, sig)) return false;
    }
    return true;
  }

  function estado(now) {
    if (!esHabil(now.iso)) return 'Atendemos de lunes a viernes, de 9 a 18.';
    if (now.min < 540) return 'Hoy atendemos desde las 9:00.';
    if (now.min < 1080) return 'Hoy atendemos hasta las 18:00.';
    return 'Ya cerramos por hoy. Mañana atendemos desde las 9:00.';
  }

  window.Olmos = {
    DIAS: DIAS, MESES: MESES, MANANA: MANANA, TARDE: TARDE,
    ahora: ahora, fechaLarga: fechaLarga, cap: cap, sumarDias: sumarDias, esHabil: esHabil,
    reservable: reservable
  };

  var el = document.querySelector('[data-estado]');
  if (el) el.textContent = estado(ahora());
})();
