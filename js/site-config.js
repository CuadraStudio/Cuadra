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
    // usando Resend. Ver Webs/docs/sitio-cuadra/workers/confirm-email/README.md. Mientras este vacio no se
    // envia ninguna copia y la web funciona igual.
    confirmEndpoint: '',

    // WhatsApp de CUADRA: solo digitos con codigo de pais (ej. 59899123456).
    // Vacio = no se muestra ningun boton ni enlace de WhatsApp (no hay numero confirmado).
    whatsapp: '',

    // Precios en USD, sin IVA. Fuente de verdad: Webs/docs/negocio/modelo-visual-productos.md.
    // main.js los vuelca en los elementos [data-price="producto.campo"]; el HTML trae el mismo
    // numero como texto por defecto (sin JS). Al cambiar un precio, cambiarlo aca y en el HTML.
    // launchSlots: clientes por tipo de producto con precio de lanzamiento (con permiso para mostrar el proyecto).
    launchSlots: 3,
    prices: {
      landing: { list: 249, launch: 179, monthly: 29 },
      web: { list: 399, launch: 319, monthly: 39 },
      refresh: { landingList: 199, landingLaunch: 149, webList: 319, webLaunch: 249 },
      tienda: { list: 449, launch: 359, monthly: 39 },
      extraPage: 50
    },

    // true = el sitio completo es accesible pero avisa que esta en construccion
    // (lo cambia Webs/docs/sitio-cuadra/scripts/site-mode.py: preview = true, live/hidden = false).
    construction: false
  };
  window.CUADRA_SITE = SITE;

  var root = document.documentElement;

  // Aviso discreto de "en construccion" (modo preview).
  function showConstructionNote() {
    if (!SITE.construction || document.querySelector('.teaser-logo')) return;
    var n = document.createElement('p');
    n.setAttribute('role', 'note');
    n.textContent = 'Sitio en construcción: algunas secciones pueden cambiar.';
    n.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:60;max-width:calc(100vw - 96px);margin:0;padding:8px 12px;' +
      'background:#EDEBE5;color:#0F1111;font:600 12px/1.35 system-ui,sans-serif;border-radius:2px;box-shadow:0 2px 10px rgba(0,0,0,.35)';
    document.body.appendChild(n);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showConstructionNote);
  else showConstructionNote();

  // Logo animado: la secuencia completa (escuadra, luego las dos barras) se ve una
  // vez por sesion (home y sitio en construccion). En repeticiones de la home y en
  // las paginas interiores se dibuja con un trazo corto (CSS); el teaser queda dibujado.
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
