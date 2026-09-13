/**
 * demoAgenda_static_site — Utils (window.CCESCO_UTILS)
 *
 * Helpers puros ES5: formato de precio/hora, builder único de WhatsApp,
 * escape HTML (defensa XSS para strings del catálogo — R9) y delegado
 * global de errores de imagen (fallback tipográfico, architecture §7.2).
 */
(function (root) {
  'use strict';

  function escapeHtml(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /**
   * formatPriceUYU(1250) → "$ 1.250"  ·  formatPriceUYU(0/null) → "—"
   * Solo se muestra precio > 0; nunca "$ 0" (AC-17).
   */
  function formatPriceUYU(value) {
    var n = Math.round(Number(value));
    if (!(n > 0)) { return '\u2014'; } // —
    var s = String(n);
    var out = '';
    var count = 0;
    for (var i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out;
      count++;
      if (count % 3 === 0 && i > 0) { out = '.' + out; }
    }
    return '$ ' + out;
  }

  /**
   * formatHour("09:00") → "9:00" (strip del cero inicial, AC-9).
   * Validación ESTRICTA ^H+:MM: su salida se inyecta vía innerHTML
   * (renderHours), así que un valor malformado de la API devuelve ''
   * en vez de propagar caracteres arbitrarios (R9 — defensa XSS).
   */
  function formatHour(t) {
    var m = String(t === null || t === undefined ? '' : t).match(/^(\d{1,2}):(\d{2})/);
    if (!m) { return ''; }
    return String(parseInt(m[1], 10)) + ':' + m[2];
  }

  /**
   * buildWaUrl() → URL única de conversión con mensaje prellenado.
   * Todos los CTAs [data-wa-cta] comparten este builder (RF-3 / AC-8).
   */
  function buildWaUrl(message) {
    var cfg = root.CCESCO_CONFIG || {};
    var w = cfg.whatsapp || {};
    var base = w.base || 'https://wa.me/59899000000';
    var text = (message !== null && message !== undefined) ? message : (w.message || '');
    return base + '?text=' + encodeURIComponent(text);
  }

  /**
   * Teléfono UY: normaliza a nacional de 9 dígitos ("09X XXX XXX" → 09XXXXXXX).
   * Acepta el formato internacional +598 9X XXX XXX (11 dígitos, prefijo 598).
   */
  function normalizePhoneUY(phone) {
    var d = String(phone === null || phone === undefined ? '' : phone).replace(/\D/g, '');
    if (d.length === 11 && d.indexOf('598') === 0) { d = '0' + d.slice(3); }
    return d;
  }

  /** Validación estricta del formato uruguayo de móvil: ^09[1-9]\d{6}$. */
  function validatePhoneUY(phone) {
    return /^09[1-9]\d{6}$/.test(normalizePhoneUY(phone));
  }

  /**
   * Delegado global de errores de imagen, en captura (cubre imágenes
   * creadas dinámicamente). La foto muerta degrada a un bloque tipográfico
   * de marca (.img-fallback) — nunca a un ícono roto.
   */
  function installImageFallback() {
    root.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG') {
        t.style.display = 'none';
        var fig = t.closest ? (t.closest('figure') || t.closest('.service-row__float') || t.parentElement) : t.parentElement;
        if (fig) { fig.classList.add('img-fallback'); }
      }
    }, true);
  }

  root.CCESCO_UTILS = {
    escapeHtml: escapeHtml,
    formatPriceUYU: formatPriceUYU,
    formatHour: formatHour,
    buildWaUrl: buildWaUrl,
    normalizePhoneUY: normalizePhoneUY,
    validatePhoneUY: validatePhoneUY,
    installImageFallback: installImageFallback
  };

})(typeof window !== 'undefined' ? window : this);
