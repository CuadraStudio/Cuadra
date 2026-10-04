/* Barbería Hierro — datos y utilidades compartidas: servicios, barberos,
   hora de Montevideo y disponibilidad simulada. Vanilla JS, sin dependencias. */
(function () {
  'use strict';

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DIAS_C = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MANANA = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
  var TARDE = ['14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
  var HORAS = MANANA.concat(TARDE);

  var SERVICIOS = [
    { id: 'corte', nombre: 'Corte clásico', detalle: 'Tijera y máquina, lavado y peinado.', min: 30, precio: 450 },
    { id: 'barba', nombre: 'Barba y toalla caliente', detalle: 'Perfilado con navaja y toalla caliente.', min: 30, precio: 380 },
    { id: 'combo', nombre: 'Corte y barba', detalle: 'El corte clásico más la barba completa.', min: 60, precio: 750 },
    { id: 'ninos', nombre: 'Corte niños', detalle: 'Hasta 12 años. Paciencia incluida.', min: 30, precio: 380 },
    { id: 'perfilado', nombre: 'Perfilado y cejas', detalle: 'Retoque rápido entre cortes.', min: 30, precio: 200 }
  ];

  var BARBEROS = [
    { id: 'tomas', nombre: 'Tomás', rol: 'Cortes clásicos y degradados' },
    { id: 'nacho', nombre: 'Nacho', rol: 'Barba y navaja' },
    { id: 'lu', nombre: 'Lu', rol: 'Tijera y cortes largos' }
  ];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function minutos(h) { var p = h.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function porId(lista, id) { for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i]; return null; }

  function partesIso(iso) { var p = iso.split('-'); return [+p[0], +p[1], +p[2]]; }
  function dowDe(iso) { var p = partesIso(iso); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }
  function sumarDias(iso, n) {
    var p = partesIso(iso);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
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

  function fechaLarga(iso) { var p = partesIso(iso); return DIAS[dowDe(iso)] + ' ' + p[2] + ' de ' + MESES[p[1] - 1]; }
  function abierto(iso) { var d = dowDe(iso); return d >= 2 && d <= 6; } // martes a sábado

  function hash(t) {
    var h = 2166136261;
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Un horario de un barbero está libre según una regla simulada y estable.
  function libre(barbero, iso, hora) { return hash('hierro' + barbero + iso + hora) % 100 < 58; }

  function pasado(iso, hora, now) {
    return iso < now.iso || (iso === now.iso && minutos(hora) <= now.min + 20);
  }

  // Un turno de 60 minutos necesita el horario siguiente también libre y en la misma franja.
  function reservable(barbero, iso, hora, duracion, now) {
    if (!abierto(iso) || pasado(iso, hora, now) || !libre(barbero, iso, hora)) return false;
    if (duracion > 30) {
      var lista = MANANA.indexOf(hora) !== -1 ? MANANA : TARDE;
      var sig = lista[lista.indexOf(hora) + 1];
      if (!sig || !libre(barbero, iso, sig)) return false;
    }
    return true;
  }

  function estado(now) {
    var cierre = 20 * 60, apertura = 10 * 60;
    if (!abierto(now.iso)) return { abierto: false, texto: 'Hoy cerrado. Abrimos de martes a sábado, de 10 a 20.' };
    if (now.min < apertura) return { abierto: false, texto: 'Abrimos hoy a las 10:00.' };
    if (now.min < cierre) return { abierto: true, texto: 'Abierto ahora, hasta las 20:00.' };
    return { abierto: false, texto: 'Ya cerramos por hoy.' };
  }

  // Próximos días con atención, empezando por hoy si todavía hay horarios posibles.
  function proximosDias(n, now) {
    var res = [], iso = now.iso;
    for (var i = 0; i < 40 && res.length < n; i++) {
      if (abierto(iso)) res.push(iso);
      iso = sumarDias(iso, 1);
    }
    return res;
  }

  function dinero(n) { return '$U ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  window.Hierro = {
    DIAS: DIAS, DIAS_C: DIAS_C, MESES: MESES, MANANA: MANANA, TARDE: TARDE, HORAS: HORAS,
    SERVICIOS: SERVICIOS, BARBEROS: BARBEROS,
    ahora: ahora, fechaLarga: fechaLarga, cap: cap, pad: pad, partesIso: partesIso, dowDe: dowDe,
    sumarDias: sumarDias, abierto: abierto, reservable: reservable, estado: estado,
    proximosDias: proximosDias, porId: porId, dinero: dinero
  };

  var el = document.querySelector('[data-estado]');
  if (el) {
    var e = estado(ahora());
    el.setAttribute('data-abierto', e.abierto ? 'si' : 'no');
    var t = el.querySelector('[data-estado-texto]');
    if (t) t.textContent = e.texto;
  }
})();
