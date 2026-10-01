/* ============================================
   site-config.js - Interruptores del sitio
   Se carga en <head> de todas las paginas (antes del primer paint).

   showDemos: false  -> oculta TODO lo relacionado con las demos:
     - links "Demos" del menu, menu movil y footer
     - seccion de demos de la home (y renumera las secciones)
     - links "Ver demo(s)" y frases que las mencionan (se muestran
       textos alternativos marcados con data-demos-off)
     - la pagina proyectos.html (redirige al inicio + noindex)
   Para volver a mostrarlas: cambiar a  showDemos: true  (un solo cambio).

   Nota: las carpetas /demos/* siguen existiendo en el repo; este
   interruptor las deja sin enlaces, pero quien conozca la URL directa
   puede abrirlas. Para quitarlas del todo, excluir /demos del deploy.
   ============================================ */
(function () {
  var SITE = {
    showDemos: false
  };

  var root = document.documentElement;
  root.setAttribute('data-demos', SITE.showDemos ? 'on' : 'off');

  // Logo del hero: la secuencia completa se ve una vez por sesion (en la home);
  // despues queda dibujado. Las paginas interiores siempre lo muestran estatico (CSS).
  var LOGO_KEY = 'cuadra-logo-played';
  try {
    if (window.sessionStorage.getItem(LOGO_KEY)) root.setAttribute('data-logo-seen', '');
  } catch (e) { /* sin sessionStorage: se anima siempre en la home */ }

  function markLogoPlayed() {
    var mark = document.querySelector('.plano-hero:not(.plano-subhero) .plano-hero__mark');
    if (!mark) return;
    try { window.sessionStorage.setItem(LOGO_KEY, '1'); } catch (e) { /* ignorar */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markLogoPlayed);
  } else {
    markLogoPlayed();
  }

  if (SITE.showDemos) return;

  // Pagina de demos: no indexar y volver al inicio.
  function onReady() {
    var body = document.body;
    if (body && body.hasAttribute('data-demos-page')) {
      var meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
      var brand = document.querySelector('.ed-nav__brand');
      window.location.replace(brand ? brand.href : './');
      return;
    }

    // Renumerar los indices "01 —" de las secciones visibles (solo donde se pide).
    var main = document.querySelector('main[data-renumber]');
    if (main) {
      var n = 0;
      main.querySelectorAll('.ed-section').forEach(function (section) {
        if (section.hasAttribute('data-demos-only')) return;
        var idx = section.querySelector('.ed-section__index');
        if (idx && /^\d+\s—$/.test(idx.textContent.trim())) {
          n += 1;
          idx.textContent = (n < 10 ? '0' : '') + n + ' —';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
