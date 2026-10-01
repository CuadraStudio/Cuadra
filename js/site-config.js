/* ============================================
   site-config.js - Configuracion del sitio
   Se carga en <head> de todas las paginas (antes del primer paint).

   formEndpoint: servicio que recibe los formularios y los reenvia por
   email a cuadrastudio.uy@gmail.com. FormSubmit: la primera vez que
   llegue un mensaje, envia un correo de activacion a esa direccion; hay
   que confirmarlo una vez. Para cambiar de proveedor (por ejemplo una
   funcion propia con Resend), cambiar solo esta URL.
   ============================================ */
(function () {
  var SITE = {
    formEndpoint: 'https://formsubmit.co/ajax/cuadrastudio.uy@gmail.com',

    // Worker que manda al visitante una copia de lo que envio ("correo enviado")
    // usando Resend. Ver workers/confirm-email/README.md. Mientras este vacio no se
    // envia ninguna copia y la web funciona igual.
    confirmEndpoint: ''
  };
  window.CUADRA_SITE = SITE;

  var root = document.documentElement;

  // Logo animado: la secuencia completa se ve una vez por sesion (home y sitio
  // en construccion); despues queda dibujado. Las paginas interiores siempre
  // lo muestran estatico (CSS).
  var LOGO_KEY = 'cuadra-logo-played';
  try {
    if (window.sessionStorage.getItem(LOGO_KEY)) root.setAttribute('data-logo-seen', '');
  } catch (e) { /* sin sessionStorage: se anima siempre */ }

  function markLogoPlayed() {
    var mark = document.querySelector('.plano-hero:not(.plano-subhero) .plano-hero__mark, .teaser-logo');
    if (!mark) return;
    try { window.sessionStorage.setItem(LOGO_KEY, '1'); } catch (e) { /* ignorar */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markLogoPlayed);
  } else {
    markLogoPlayed();
  }
})();
