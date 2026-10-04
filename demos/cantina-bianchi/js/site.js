/* Cantina Bianchi — utilidades compartidas (hora de Montevideo, horarios,
   pizarra del día y disponibilidad simulada). Vanilla JS, sin dependencias. */
(function () {
  'use strict';

  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var CAPACIDAD = 36;
  var ALMUERZO = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
  var CENA = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
  var CERRADO = 1; // lunes

  // Pizarra por día de la semana: [tipo, nombre, precio]
  var PIZARRA = {
    2: [['Para empezar', 'Ensalada rusa', 290], ['Plato principal', 'Tallarines al tuco con estofado', 490], ['Postre', 'Flan casero con dulce de leche', 190]],
    3: [['Para empezar', 'Fainá de la casa', 180], ['Plato principal', 'Canelones de pollo y espinaca', 560], ['Postre', 'Postre Chajá', 220]],
    4: [['Para empezar', 'Provoleta a la plancha', 380], ['Plato principal', 'Lasaña de carne', 620], ['Postre', 'Panqueque de dulce de leche', 200]],
    5: [['Para empezar', 'Rabas con salsa tártara', 690], ['Plato principal', 'Ravioles de ricota y nuez con caruso', 640], ['Postre', 'Mousse de chocolate', 190]],
    6: [['Para empezar', 'Empanadas de carne cortada a cuchillo', 160], ['Plato principal', 'Pollo al horno con papas', 590], ['Postre', 'Flan casero con dulce de leche', 190]],
    0: [['Para empezar', 'Fainá de la casa', 180], ['Plato principal', 'Sorrentinos de jamón y queso', 680], ['Postre', 'Postre Chajá', 220]]
  };

  function pad(n) { return (n < 10 ? '0' : '') + n; }

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
    return { iso: iso, dow: dowDe(iso), dia: +partes.day, min: (+partes.hour) * 60 + (+partes.minute) };
  }

  function minutos(hora) {
    var p = hora.split(':');
    return (+p[0]) * 60 + (+p[1]);
  }

  function fechaLarga(iso) {
    var p = iso.split('-');
    return DIAS[dowDe(iso)] + ' ' + (+p[2]) + ' de ' + MESES[+p[1] - 1];
  }

  function cap(texto) { return texto.charAt(0).toUpperCase() + texto.slice(1); }

  function hash(texto) {
    var h = 2166136261;
    for (var i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Lugares libres simulados: estable para cada día y horario.
  function lugares(iso, hora) {
    var r = (hash(iso + hora) % 1000) / 1000;
    var dow = dowDe(iso);
    var cena = minutos(hora) >= 1200;
    var peso = 0.2 + r * 0.65;
    if (cena && (dow === 5 || dow === 6)) peso += 0.2;
    if (hora === '21:00' || hora === '21:30') peso += 0.1;
    peso = Math.min(peso, 1);
    return Math.max(0, Math.round(CAPACIDAD * (1 - peso)));
  }

  // Un horario se puede reservar si el día está abierto y faltan más de 30 minutos.
  function reservable(iso, hora, now) {
    if (dowDe(iso) === CERRADO) return false;
    if (iso < now.iso) return false;
    if (iso === now.iso && minutos(hora) <= now.min + 30) return false;
    return true;
  }

  function estado(now) {
    if (now.dow === CERRADO) return { abierto: false, texto: 'Cerrado hoy · abrimos el martes a las 12:00' };
    var m = now.min;
    if (m >= 720 && m < 930) return { abierto: true, texto: 'Abierto ahora · cerramos el almuerzo a las 15:30' };
    if (m >= 1200) return { abierto: true, texto: 'Abierto ahora · cerramos a las 24:00' };
    if (m < 720) return { abierto: false, texto: 'Cerrado · abrimos a las 12:00' };
    if (m < 1200) return { abierto: false, texto: 'Cerrado · abrimos a las 20:00' };
    return { abierto: false, texto: 'Cerrado' };
  }

  // Primer horario con mesa para 2: "Esta noche hay mesa desde las 20:00."
  function proximoCupo(now) {
    var servicios = [['al mediodía', ALMUERZO], ['a la noche', CENA]];
    for (var d = 0; d < 8; d++) {
      var iso = sumarDias(now.iso, d);
      for (var s = 0; s < 2; s++) {
        var libre = servicios[s][1].filter(function (h) { return reservable(iso, h, now) && lugares(iso, h) >= 2; })[0];
        if (libre) {
          var cuando = d === 0 ? (s === 0 ? 'Hoy al mediodía' : 'Esta noche') : d === 1 ? 'Mañana ' + servicios[s][0] : cap(DIAS[dowDe(iso)]) + ' ' + servicios[s][0];
          return cuando + ' hay mesa desde las ' + libre + '.';
        }
      }
    }
    return '';
  }

  window.Bianchi = {
    DIAS: DIAS, MESES: MESES, ALMUERZO: ALMUERZO, CENA: CENA, CAPACIDAD: CAPACIDAD, CERRADO: CERRADO,
    ahora: ahora, dowDe: dowDe, sumarDias: sumarDias, fechaLarga: fechaLarga, cap: cap,
    lugares: lugares, reservable: reservable
  };

  function pintarEstado(now) {
    var e = estado(now);
    document.querySelectorAll('[data-estado]').forEach(function (el) {
      el.setAttribute('data-abierto', e.abierto ? 'true' : 'false');
      el.querySelector('[data-estado-texto]').textContent = e.texto;
    });
  }

  function pintarHorarios(now) {
    document.querySelectorAll('.horarios [data-dias]').forEach(function (fila) {
      if (fila.getAttribute('data-dias').split(',').indexOf(String(now.dow)) !== -1) fila.classList.add('hoy');
    });
  }

  function pintarPizarra(now) {
    var lista = document.querySelector('[data-pizarra-lista]');
    if (!lista) return;
    var dow = now.dow === CERRADO ? 2 : now.dow;
    var platos = PIZARRA[dow];
    var fecha = document.querySelector('[data-pizarra-fecha]');
    if (fecha) fecha.textContent = now.dow === CERRADO ? 'Hoy descansamos. El martes abrimos con esta pizarra' : cap(fechaLarga(now.iso));
    lista.innerHTML = platos.map(function (p) {
      return '<li class="plato"><span class="plato__tipo">' + p[0] + '</span>' +
        '<div class="fila"><span class="fila__nombre">' + p[1] + '</span><span class="fila__puntos"></span>' +
        '<span class="fila__precio">$U ' + p[2] + '</span></div></li>';
    }).join('');
    var aviso = document.querySelector('[data-pizarra-aviso]');
    if (aviso && now.dia === 29) {
      aviso.hidden = false;
      aviso.textContent = 'Hoy es 29: ñoquis con un billete debajo del plato, como manda la tradición.';
    }
  }

  function pintarCupos(now) {
    var el = document.querySelector('[data-cupos]');
    if (!el) return;
    var texto = proximoCupo(now);
    if (texto) el.textContent = texto;
  }

  var now = ahora();
  pintarEstado(now);
  pintarHorarios(now);
  pintarPizarra(now);
  pintarCupos(now);
})();
