/* Barbería Hierro — portada: tablero de turnos libres y lista de servicios. */
(function () {
  'use strict';
  var H = window.Hierro, now = H.ahora();

  function proximosLibres(barbero, max) {
    var out = [], dias = H.proximosDias(7, now);
    for (var d = 0; d < dias.length && out.length < max; d++) {
      for (var h = 0; h < H.HORAS.length && out.length < max; h++) {
        if (H.reservable(barbero, dias[d], H.HORAS[h], 30, now)) out.push({ iso: dias[d], hora: H.HORAS[h] });
      }
    }
    return out;
  }

  var tablero = document.querySelector('[data-tablero]');
  if (tablero) {
    H.BARBEROS.forEach(function (b, i) {
      var turnos = proximosLibres(b.id, 4);
      var sec = document.createElement('article');
      sec.className = 'silla';
      var html = '<div class="silla__cab"><h3>' + b.nombre + '</h3><span class="silla__num">SILLA ' + (i + 1) + '</span></div>' +
        '<p class="silla__rol">' + b.rol + '</p>';
      if (turnos.length) {
        var primero = turnos[0].iso;
        var rotulo = primero === now.iso ? 'Hoy' : H.cap(H.fechaLarga(primero));
        html += '<p class="silla__hoy">Próximos libres · ' + rotulo + '</p><div class="chips">' +
          turnos.map(function (t) {
            var sufijo = t.iso === primero ? '' : ' ' + H.DIAS_C[H.dowDe(t.iso)];
            var dato = b.id + '|' + t.iso + '|' + t.hora;
            return '<a class="chip" href="turno/index.html?r=' + encodeURIComponent(dato) + '#' + dato + '" aria-label="Reservar ' + H.fechaLarga(t.iso) + ' ' + t.hora + ' con ' + b.nombre + '">' + t.hora + sufijo + '</a>';
          }).join('') + '</div>';
      } else {
        html += '<p class="silla__sin">Sin turnos libres por ahora.</p>';
      }
      sec.innerHTML = html;
      tablero.appendChild(sec);
    });
  }

  var lista = document.querySelector('[data-servicios]');
  if (lista) {
    lista.innerHTML = H.SERVICIOS.map(function (s) {
      return '<li class="item"><h3>' + s.nombre + '</h3><p class="item__det">' + s.detalle + '</p>' +
        '<p class="item__precio">' + H.dinero(s.precio) + '</p><p class="item__dur">' + s.min + ' min</p></li>';
    }).join('');
  }
})();
