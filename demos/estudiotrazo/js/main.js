/**
 * demoAgenda_static_site — Orquestador (IIFE autoejecutable, sin global)
 *
 * Flujo (architecture.md §3.1):
 *   initStatic()   → CTAs WhatsApp, año footer, fallback de imágenes, nav activa
 *   loadData()     → CCESCO_DB.* en paralelo; solo reemplaza el DOM cuando la
 *                    API confirma datos reales (los placeholders estáticos son
 *                    la primera pintura y el fallback permanente)
 *   initAnimations() → GSAP/ScrollTrigger gated triple
 *                      (js-enabled + anim-ready + sin motion-reduce)
 *
 * Regla absoluta: el visitante nunca ve un error crudo (RF-2 / AC-11).
 */
(function (root) {
  'use strict';

  var cfg = root.CCESCO_CONFIG || {};
  var db = root.CCESCO_DB || null;
  var u = root.CCESCO_UTILS || {};
  var doc = document;

  function motionReduce() {
    return doc.documentElement.className.indexOf('motion-reduce') !== -1;
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  var ARROW_SVG =
    '<svg viewBox="0 0 16 16" width="16" height="16" focusable="false">' +
    '<path d="M3 13 13 3M5 3h8v8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

  // =========================================================================
  // Init estático (funciona sin API y sin GSAP)
  // =========================================================================

  function initStatic() {
    // CTAs WhatsApp: builder único (RF-3 / AC-8). El href estático ya es
    // funcional; aquí se normaliza contra config por si cambia el mensaje.
    var ctas = doc.querySelectorAll('[data-wa-cta]');
    for (var i = 0; i < ctas.length; i++) {
      ctas[i].setAttribute('href', u.buildWaUrl());
    }

    // Año dinámico del footer (el valor hardcodeado es fallback sin-JS).
    var year = doc.getElementById('footer-year');
    if (year) { year.textContent = String(new Date().getFullYear()); }

    // Delegado global onerror para imágenes (bloque tipográfico de marca).
    if (typeof u.installImageFallback === 'function') { u.installImageFallback(); }

    initActiveNav();
    initFloatFollow();
    initHeaderScroll();
  }

  /** Indicador de sección activa (mejora progresiva, architecture §1.3). */
  function initActiveNav() {
    if (typeof root.IntersectionObserver !== 'function') { return; }
    var links = {};
    var anchors = doc.querySelectorAll('.site-header__link[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
      links[anchors[i].getAttribute('href').slice(1)] = anchors[i];
    }
    var sections = [];
    for (var id in links) {
      if (Object.prototype.hasOwnProperty.call(links, id)) {
        var sec = doc.getElementById(id);
        if (sec) { sections.push(sec); }
      }
    }
    if (!sections.length) { return; }

    var observer = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        var entry = entries[j];
        var link = links[entry.target.id];
        if (!link) { continue; }
        if (entry.isIntersecting) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    }, { rootMargin: '-40% 0px -55% 0px' });

    for (var k = 0; k < sections.length; k++) { observer.observe(sections[k]); }
  }

  /**
   * Seguimiento vertical sutil de la imagen flotante (design.md §5):
   * acotado a ±24px (--sp-md), transform only, SOLO con puntero fino y
   * sin reduced-motion. En touch/reduce no se instala nada.
   */
  function initFloatFollow() {
    if (motionReduce()) { return; }
    if (!(root.matchMedia && root.matchMedia('(hover: hover) and (pointer: fine)').matches)) { return; }
    var list = doc.getElementById('services-list');
    if (!list) { return; }

    list.addEventListener('mousemove', function (e) {
      var row = e.target && e.target.closest ? e.target.closest('.service-row') : null;
      if (!row) { return; }
      var floatImg = row.querySelector('.service-row__float img');
      if (!floatImg) { return; }
      var rect = row.getBoundingClientRect();
      if (!rect.height) { return; }
      var rel = (e.clientY - rect.top) / rect.height - 0.5; /* -0.5 … 0.5 */
      var max = 24; /* ± --sp-md */
      floatImg.style.transform = 'translateY(' + Math.round(rel * 2 * max) + 'px)';
    }, { passive: true });
  }

  /**
   * Header transparente sobre el hero, fondo sólido al hacer scroll.
   * Clase .scrolled en .site-header cuando el hero ya no
   * es visible. Sin IntersectionObserver: scroll listener liviano con
   * requestAnimationFrame throttle.
   */
  function initHeaderScroll() {
    var header = doc.querySelector('.site-header');
    if (!header) { return; }

    var hero = doc.querySelector('.hero');
    var ticking = false;

    function onScroll() {
      if (ticking) { return; }
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var pastHero = hero
          ? (hero.getBoundingClientRect().bottom <= header.offsetHeight)
          : (root.scrollY > 10);
        header.classList.toggle('scrolled', pastHero);
      });
    }

    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial state
  }

  // =========================================================================
  // Renderers — solo corren con datos API confirmados (length > 0).
  // Estado vacío o error ⇒ no tocar el DOM: placeholders intactos (AC-4/6/11).
  // =========================================================================

  function formatDuration(min) {
    var n = Math.round(Number(min));
    return n > 0 ? n + ' min' : '\u2014';
  }

  function renderServices(items) {
    var list = doc.getElementById('services-list');
    if (!list || !items || !items.length) { return; }

    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      /* Regla de Vega (design-gate punto 1) para la imagen flotante:
         si el servicio API trae image_url se usa esa; si no, se asigna
         del pool curado por índice (módulo). Nunca se inventan imágenes. */
      var pool = cfg.FLOATING_IMAGE_POOL || [];
      var img = it.imageUrl || (pool.length ? pool[i % pool.length] : '');

      html += '<li class="service-row">'
        + '<span class="service-row__index meta-num" aria-hidden="true">' + pad2(i + 1) + '</span>'
        + '<h3 class="service-row__name heading-row">' + u.escapeHtml(it.name) + '</h3>'
        + '<p class="service-row__meta meta-num">'
        + '<span class="service-row__price">' + u.formatPriceUYU(it.price) + '</span>'
        + '<span class="service-row__dur">' + formatDuration(it.durationMin) + '</span></p>'
        + '<span class="service-row__arrow" aria-hidden="true">' + ARROW_SVG + '</span>'
        + '<span class="service-row__float" aria-hidden="true">'
        + '<img src="' + u.escapeHtml(img) + '" alt="" width="800" height="1067" loading="lazy" decoding="async">'
        + '</span>'
        + '</li>';
    }

    list.innerHTML = html;
    list.removeAttribute('data-placeholder');

    // La nota "Carta completa y precios por WhatsApp" desaparece sola (AC-5).
    var note = doc.querySelector('.services__note[data-placeholder]');
    if (note && note.parentNode) { note.parentNode.removeChild(note); }

    // Marquee dinámico con nombres reales de la carta (mismo patrón que booking.js).
    paintMarquee(items);
  }

  /**
   * paintMarquee(services): reemplaza el contenido estático del marquee
   * con los nombres de servicio reales del tenant. Fallback: si no hay
   * track o no hay servicios, el markup estático queda intacto.
   */
  function paintMarquee(services) {
    var track = doc.getElementById('index-marquee');
    if (!track || !services || !services.length) { return; }

    var items = ['ESTUDIO TRAZO'];
    for (var i = 0; i < services.length; i++) {
      if (services[i].name) { items.push(services[i].name.toUpperCase()); }
    }
    items.push('MONTEVIDEO');

    var groupHtml = '';
    for (var j = 0; j < items.length; j++) {
      groupHtml += '<span class="marquee__item">' + u.escapeHtml(items[j]) + '</span>'
        + '<span class="marquee__sep">·</span>';
    }

    track.innerHTML =
      '<div class="marquee__group">' + groupHtml + '</div>'
      + '<div class="marquee__group" aria-hidden="true">' + groupHtml + '</div>';
  }

  function renderTeam(barbers) {
    var body = doc.getElementById('team-body');
    if (!body || !barbers || !barbers.length) { return; }

    // Nombres reales como filas heading-row con hairlines (design.md §6).
    // Sin bio, sin especialidades y fotos solo si la API las trae: jamás
    // se inventan datos (AC-6).
    var html = '<ul class="team__names" role="list">';
    for (var i = 0; i < barbers.length; i++) {
      html += '<li><h3 class="heading-row">' + u.escapeHtml(barbers[i].name) + '</h3></li>';
    }
    html += '</ul>';

    body.innerHTML = html;
    body.removeAttribute('data-placeholder');
  }

  function renderHours(plan) {
    var table = doc.getElementById('hours-table');
    if (!table || !plan || !plan.length) { return; }

    // Agrupación architecture §3.5: dow 1–5 → "Lunes a viernes", 6 → "Sábado",
    // 0 → "Domingo". Día sin fila o inactive ⇒ "Cerrado". formatHour stripa
    // el cero inicial para coincidir carácter por carácter con §0 (AC-9).
    var groups = [
      { label: 'Lunes a viernes', dows: [1, 2, 3, 4, 5] },
      { label: 'Sábado', dows: [6] },
      { label: 'Domingo', dows: [0] }
    ];

    function rowFor(dow) {
      for (var i = 0; i < plan.length; i++) {
        if (Number(plan[i].dow) === dow) { return plan[i]; }
      }
      return null;
    }

    var tbody = table.tBodies[0] || table;
    var html = '';
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      var found = null;
      for (var d = 0; d < grp.dows.length; d++) {
        var r = rowFor(grp.dows[d]);
        if (r && r.active !== false && r.start && r.end) { found = r; break; }
      }
      // R9: formatHour valida estrictamente (^H:MM); un horario malformado
      // de la API degrada a "Cerrado", jamás se inyecta el string crudo.
      var startH = found ? u.formatHour(found.start) : '';
      var endH = found ? u.formatHour(found.end) : '';
      if (!startH || !endH) { found = null; }
      var closedClass = found ? '' : ' hours__row--closed';
      var timeLabel = found ? startH + '\u2013' + endH : 'Cerrado';
      html += '<tr class="hours__row' + closedClass + '">'
        + '<th scope="row">' + grp.label + '</th>'
        + '<td>' + timeLabel + '</td></tr>';
    }

    tbody.innerHTML = html;
  }

  // Registro de renderers (extensión: agregar entradas, no tocar el loop).
  var RENDERERS = db ? [
    { load: db.getServices, render: renderServices },
    { load: db.getBarbers, render: renderTeam },
    { load: db.getWorkingPlan, render: renderHours }
  ] : [];

  function loadData() {
    for (var i = 0; i < RENDERERS.length; i++) {
      (function (entry) {
        Promise.resolve()
          .then(entry.load)
          .then(function (items) {
            // ok && data.length > 0 ⇒ render catálogo real.
            // ok && vacío, error o timeout ⇒ [] ⇒ no tocar DOM.
            if (items && items.length) { entry.render(items); }
          })
          .catch(function (err) {
            if (root.console && typeof root.console.warn === 'function') {
              root.console.warn('[demoagenda] loader', err && (err.code || err.message));
            }
          });
      })(RENDERERS[i]);
    }
  }

  // =========================================================================
  // Animaciones GSAP/ScrollTrigger — gating triple (architecture §5)
  // Sin JS, sin GSAP o con reduced-motion: contenido visible estático.
  // =========================================================================

  var ANIMATIONS = [
    { id: 'hero', selector: '.hero', scoped: true },
    { id: 'about', selector: '.about', scoped: true },
    { id: 'services', selector: '.service-row', scoped: false },
    { id: 'team', selector: '.team', scoped: true },
    { id: 'gallery', selector: '.gallery__item', scoped: false },
    { id: 'booking', selector: '.booking-cta', scoped: true },
    { id: 'contact', selector: '.contact', scoped: true }
  ];

  function initAnimations() {
    if (!root.gsap || !root.ScrollTrigger) { return; }   // CDN caído ⇒ visible
    if (motionReduce()) { return; }                       // reduce ⇒ visible
    if (doc.documentElement.className.indexOf('js-enabled') === -1) { return; }

    root.gsap.registerPlugin(root.ScrollTrigger);
    doc.documentElement.classList.add('anim-ready');

    var gsap = root.gsap;
    var ScrollTrigger = root.ScrollTrigger;

    function revealUp(targets, trigger) {
      gsap.set(targets, { opacity: 0, y: 24 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power2.out',
        stagger: 0.12,               // stagger máximo 0.12s (DESIGN.md)
        scrollTrigger: { trigger: trigger, start: 'top 80%' }
      });
    }

    for (var i = 0; i < ANIMATIONS.length; i++) {
      (function (anim) {
        var targets = doc.querySelectorAll(anim.selector);
        if (!targets.length) { return; }
        if (anim.scoped) {
          // data-reveal dentro de la sección (CSS los oculta vía anim-ready)
          var inner = anim.selector + ' [data-reveal]';
          var els = doc.querySelectorAll(inner);
          if (els.length) { revealUp(els, doc.querySelector(anim.selector)); }
        } else {
          // batch directo sobre filas/figuras (sin data-reveal)
          gsap.set(targets, { opacity: 0, y: 24 });
          ScrollTrigger.batch(targets, {
            start: 'top 85%',
            onEnter: function (batch) {
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.65,
                ease: 'power2.out',
                stagger: 0.12
              });
            }
          });
        }
      })(ANIMATIONS[i]);
    }
  }

  // =========================================================================
  // Boot
  // =========================================================================

  function init() {
    initStatic();
    loadData();
    initAnimations();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);
