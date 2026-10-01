/* Cebador — ilustraciones de producto en SVG plano. Cada pieza recibe los colores
   de la variante elegida, así que al cambiar de color cambia el dibujo. */
(function () {
  'use strict';

  var TINTA = '#0E1726';
  var ACERO = '#DDE2E8';

  function sombra(rx) {
    return '<ellipse cx="100" cy="178" rx="' + rx + '" ry="6" fill="rgba(14,23,38,0.22)"/>';
  }

  var PIEZAS = {
    mate: function (r) {
      var cuerpo = r.cuerpo || '#C9A45C', borde = r.borde || '#C9CED3';
      return sombra(44) +
        '<path d="M50 84C36 126 54 170 100 172C146 170 164 126 150 84Z" fill="' + cuerpo + '"/>' +
        '<path d="M64 102C58 128 66 152 86 162" stroke="rgba(255,255,255,0.3)" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<rect x="76" y="166" width="48" height="9" rx="3" fill="' + borde + '"/>' +
        '<ellipse cx="100" cy="84" rx="52" ry="13" fill="' + borde + '"/>' +
        '<ellipse cx="100" cy="84" rx="43" ry="9" fill="' + TINTA + '"/>' +
        '<ellipse cx="100" cy="82.5" rx="36" ry="6" fill="#4D8F3A"/>' +
        '<path d="M108 82L136 22" stroke="' + ACERO + '" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="137" cy="20" r="6.5" fill="' + ACERO + '"/>';
    },
    termo: function (r) {
      var cuerpo = r.cuerpo || '#20242C', tapa = '#0E1726';
      if (cuerpo.toLowerCase() === '#20242c') tapa = '#3C434F';
      return sombra(40) +
        '<rect x="68" y="46" width="64" height="130" rx="16" fill="' + cuerpo + '"/>' +
        '<rect x="68" y="98" width="64" height="16" fill="rgba(255,255,255,0.2)"/>' +
        '<path d="M78 58V160" stroke="rgba(255,255,255,0.22)" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="62" y="28" width="76" height="24" rx="10" fill="' + tapa + '"/>' +
        '<rect x="84" y="12" width="32" height="20" rx="7" fill="' + tapa + '"/>' +
        '<path d="M132 80C160 80 160 142 132 142" stroke="' + tapa + '" stroke-width="8" fill="none" stroke-linecap="round"/>';
    },
    bombilla: function (r) {
      var acero = r.acero || ACERO;
      return sombra(30) +
        '<g transform="rotate(28 100 100)">' +
        '<rect x="97" y="14" width="6" height="124" rx="3" fill="' + acero + '"/>' +
        '<path d="M91 14H109L104 32H96Z" fill="' + acero + '"/>' +
        '<path d="M86 132Q100 182 114 132Z" fill="' + acero + '"/>' +
        '<circle cx="100" cy="146" r="2.6" fill="' + TINTA + '"/><circle cx="94" cy="140" r="2.2" fill="' + TINTA + '"/><circle cx="106" cy="140" r="2.2" fill="' + TINTA + '"/><circle cx="100" cy="158" r="2.2" fill="' + TINTA + '"/>' +
        '</g>';
    },
    yerba: function (r) {
      var cuerpo = r.cuerpo || '#6A9B4D';
      return sombra(46) +
        '<path d="M56 54H144L150 170H50Z" fill="' + cuerpo + '"/>' +
        '<path d="M52 40H148L144 58H56Z" fill="rgba(14,23,38,0.35)"/>' +
        '<path d="M60 46L68 52L76 46L84 52L92 46L100 52L108 46L116 52L124 46L132 52L140 46" stroke="rgba(255,255,255,0.5)" stroke-width="2" fill="none"/>' +
        '<rect x="66" y="86" width="68" height="64" rx="8" fill="#F6F5F0"/>' +
        '<path d="M100 138C84 124 88 102 112 98C116 118 112 132 100 138Z" fill="' + cuerpo + '"/>' +
        '<path d="M100 138L106 108" stroke="#F6F5F0" stroke-width="2.4" stroke-linecap="round"/>';
    },
    bolso: function (r) {
      var cuerpo = r.cuerpo || '#22252B';
      return sombra(52) +
        '<path d="M62 80C62 22 138 22 138 80" stroke="' + cuerpo + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
        '<path d="M44 78H156L166 164Q166 174 156 174H44Q34 174 34 164Z" fill="' + cuerpo + '"/>' +
        '<path d="M44 78H156L152 108Q100 128 48 108Z" fill="rgba(14,23,38,0.22)"/>' +
        '<rect x="90" y="112" width="20" height="17" rx="3" fill="#D6A93C"/>' +
        '<rect x="96" y="118" width="8" height="5" rx="1.5" fill="' + TINTA + '"/>';
    },
    pava: function (r) {
      var cuerpo = r.cuerpo || '#22262E', tapa = '#0E1726';
      if (cuerpo.toLowerCase() === '#22262e') tapa = '#454C59';
      return sombra(50) +
        '<path d="M142 112Q182 98 174 58" stroke="' + cuerpo + '" stroke-width="11" fill="none" stroke-linecap="round"/>' +
        '<path d="M54 92Q54 172 100 174Q146 172 146 92Z" fill="' + cuerpo + '"/>' +
        '<path d="M68 112C66 136 72 154 88 164" stroke="rgba(255,255,255,0.3)" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="100" cy="92" rx="46" ry="10" fill="' + tapa + '"/>' +
        '<circle cx="100" cy="80" r="7" fill="' + tapa + '"/>' +
        '<path d="M58 100C24 100 24 154 58 154" stroke="' + tapa + '" stroke-width="8" fill="none" stroke-linecap="round"/>';
    },
    funda: function (r) {
      var cuerpo = r.cuerpo || '#1F2430';
      return sombra(46) +
        '<path d="M58 70Q58 56 72 56H128Q142 56 142 70L148 166Q148 176 138 176H62Q52 176 52 166Z" fill="' + cuerpo + '"/>' +
        '<path d="M60 86H140" stroke="rgba(255,255,255,0.35)" stroke-width="3" stroke-dasharray="5 5"/>' +
        '<path d="M76 56C78 36 122 36 124 56" stroke="' + cuerpo + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<circle cx="124" cy="56" r="6" fill="#F6F5F0"/>' +
        '<rect x="84" y="118" width="32" height="22" rx="4" fill="#F6F5F0"/>';
    },
    set: function (r) {
      var cuerpo = r.cuerpo || '#EDEFF2';
      var oscuro = cuerpo.toLowerCase() === '#272b33';
      var tapa = oscuro ? '#454C59' : '#0E1726';
      var etiqueta = oscuro ? '#EDEFF2' : '#0E1726';
      return sombra(60) +
        '<rect x="34" y="72" width="62" height="102" rx="12" fill="' + cuerpo + '"/>' +
        '<rect x="30" y="56" width="70" height="22" rx="9" fill="' + tapa + '"/>' +
        '<circle cx="65" cy="124" r="14" fill="' + etiqueta + '"/>' +
        '<rect x="112" y="96" width="54" height="78" rx="11" fill="' + cuerpo + '"/>' +
        '<rect x="108" y="82" width="62" height="20" rx="8" fill="' + tapa + '"/>' +
        '<rect x="131" y="132" width="16" height="16" rx="3" fill="' + etiqueta + '"/>';
    }
  };

  window.Arte = {
    // Devuelve un <svg> completo. "nombre" es la descripción accesible.
    svg: function (tipo, roles, nombre) {
      var pieza = PIEZAS[tipo] || PIEZAS.mate;
      return '<svg viewBox="16 6 168 176" role="img" aria-label="' + (nombre || '').replace(/"/g, '&quot;') + '" focusable="false">' +
        pieza(roles || {}) + '</svg>';
    }
  };
})();
