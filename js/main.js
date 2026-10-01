/* ============================================
   main.js - Nav toggle, scroll reveal, form handling
   ============================================ */

(function () {
  'use strict';

  // ---- Reduced motion preference ----
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Nav toggle ----
  function initNav() {
    var hamburger = document.querySelector('.nav__hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    function getFocusableElements() {
      return mobileMenu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    }

    function openMenu() {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-label', 'Cerrar menu de navegacion');

      // Focus the first menu item only once the opening transition has run.
      // Focusing synchronously fails silently: the menu is still
      // `visibility: hidden` mid-transition, so Tab would fall into the
      // background content (WCAG 2.4.3 / APG modal pattern). Prefer
      // `transitionend` with a timeout fallback matching --duration-normal
      // (300ms, css/tokens.css) in case the transition never fires
      // (e.g. prefers-reduced-motion kills it via base.css).
      var firstLink = mobileMenu.querySelector('.nav__mobile-link');
      if (!firstLink) return;

      var didFocus = false;
      function focusFirstLink() {
        if (didFocus) return;
        didFocus = true;
        mobileMenu.removeEventListener('transitionend', onMenuTransitionEnd);
        clearTimeout(focusFallbackTimer);
        firstLink.focus();
      }
      function onMenuTransitionEnd(e) {
        // Only the menu's own transition — ignore bubbled link hover events.
        if (e.target === mobileMenu) focusFirstLink();
      }
      var focusFallbackTimer = setTimeout(focusFirstLink, 320);

      mobileMenu.addEventListener('transitionend', onMenuTransitionEnd);
    }

    function closeMenu() {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-label', 'Abrir menu de navegacion');
      hamburger.focus();
    }

    function toggleMenu() {
      var expanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    hamburger.addEventListener('click', toggleMenu);

    // Focus trap
    mobileMenu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;

      var focusable = getFocusableElements();
      if (focusable.length === 0) return;

      var firstElement = focusable[0];
      var lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });

    // Close menu on link click
    var mobileLinks = mobileMenu.querySelectorAll('.nav__mobile-link');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close menu on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });

    // Close menu on tap/click outside the links (the overlay's own background)
    mobileMenu.addEventListener('click', function (e) {
      if (e.target === mobileMenu) closeMenu();
    });
  }

  // ---- Active nav link ----
  function initActiveNav() {
    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav__link, .nav__mobile-link');

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // Normalize paths
      var linkPath = href.replace(/\.html$/, '');

      // For index: match "/" exactly
      if (href === '/') {
        if (currentPath === '/' || currentPath === '/index.html' || currentPath === '') {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      } else {
        // For other pages, check if current path contains the link path
        if (currentPath.indexOf(linkPath) !== -1) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    });
  }

  // ---- Scroll reveal ----
  function initScrollReveal() {
    if (prefersReducedMotion) {
      // Show all reveal elements immediately
      var revealElements = document.querySelectorAll('.reveal');
      revealElements.forEach(function (el) {
        el.classList.add('reveal--visible');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements
      var fallbackElements = document.querySelectorAll('.reveal');
      fallbackElements.forEach(function (el) {
        el.classList.add('reveal--visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    var revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(function (el) {
      // Add stagger class for elements with --reveal-index
      if (el.style.getPropertyValue('--reveal-index')) {
        el.classList.add('reveal--stagger');
      }
      observer.observe(el);
    });
  }

  // ---- Form handling ----
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var nombreInput = document.getElementById('nombre');
    var emailInput = document.getElementById('email');
    var mensajeInput = document.getElementById('mensaje');
    var nombreError = document.getElementById('nombre-error');
    var emailError = document.getElementById('email-error');
    var mensajeError = document.getElementById('mensaje-error');
    var formStatus = document.getElementById('form-status');
    var submitBtn = document.getElementById('submit-btn');

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function clearErrors() {
      nombreError.textContent = '';
      emailError.textContent = '';
      mensajeError.textContent = '';
      nombreInput.classList.remove('form-input--error');
      emailInput.classList.remove('form-input--error');
      mensajeInput.classList.remove('form-textarea--error');
      formStatus.innerHTML = '';
    }

    function validate() {
      var valid = true;

      // Nombre
      if (!nombreInput.value.trim()) {
        nombreError.textContent = 'El nombre es obligatorio.';
        nombreInput.classList.add('form-input--error');
        valid = false;
      }

      // Email
      if (!emailInput.value.trim()) {
        emailError.textContent = 'El email es obligatorio.';
        emailInput.classList.add('form-input--error');
        valid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Ingresá un email válido.';
        emailInput.classList.add('form-input--error');
        valid = false;
      }

      // Mensaje
      if (!mensajeInput.value.trim()) {
        mensajeError.textContent = 'El mensaje es obligatorio.';
        mensajeInput.classList.add('form-textarea--error');
        valid = false;
      }

      return valid;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      if (!validate()) return;

      // Build WhatsApp message
      var nombre = nombreInput.value.trim();
      var email = emailInput.value.trim();
      var mensaje = mensajeInput.value.trim();

      var text = 'Hola! Quiero un sitio web.\n\n'
        + '*Nombre:* ' + nombre + '\n'
        + '*Email:* ' + email + '\n'
        + '*Mensaje:* ' + mensaje;

      var url = 'https://wa.me/59899331909?text=' + encodeURIComponent(text);
      window.open(url, '_blank');

      // Show success
      submitBtn.disabled = false;
      formStatus.innerHTML = '<div class="form-success">Abriendo WhatsApp... Si no se abre, <a href="' + url + '" target="_blank" rel="noopener noreferrer">hacé clic acá</a>.</div>';
      form.reset();
    });

    // Clear error on input
    nombreInput.addEventListener('input', function () {
      nombreError.textContent = '';
      nombreInput.classList.remove('form-input--error');
    });

    emailInput.addEventListener('input', function () {
      emailError.textContent = '';
      emailInput.classList.remove('form-input--error');
    });

    mensajeInput.addEventListener('input', function () {
      mensajeError.textContent = '';
      mensajeInput.classList.remove('form-textarea--error');
    });
  }

  // ---- Smooth scroll for internal links ----
  function initSmoothScroll() {
    var internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });

          // WCAG 2.4.1 (Bypass Blocks): the skip link must MOVE focus to the
          // main content, not just scroll to it. #contenido already carries
          // tabindex="-1"; add it defensively for any other target first, so
          // the next Tab starts inside the content instead of the nav.
          if (link.classList.contains('skip-link')) {
            if (!target.hasAttribute('tabindex')) {
              target.setAttribute('tabindex', '-1');
            }
            target.focus({ preventScroll: true });
          }
        }
      });
    });
  }

  // ---- Configurador de planes: a la carte (linea -> plan y extras con precio propio -> resumen por email) ----
  function initPlanConfigurator() {
    var root = document.querySelector('[data-configurator]');
    if (!root) return;

    var LINE_NAMES = { landing: 'CUADRA Landing', institucional: 'CUADRA Institucional', agenda: 'CUADRA Agenda', tienda: 'CUADRA Tienda', resto: 'CUADRA Restó', consulta: 'CUADRA Consulta' };
    var CONTACT_EMAIL = 'cuadrastudio.uy@gmail.com';

    var panels = root.querySelectorAll('.configurator__panel');
    var stepIndicators = root.querySelectorAll('[data-step-indicator]');
    var lineChoices = root.querySelectorAll('[data-choose-line]');
    var linePanels = root.querySelectorAll('[data-line-panel]');
    var selectedLineName = root.querySelector('[data-selected-line-name]');

    var summaryEmpty = root.querySelector('[data-summary-empty]');
    var summaryContent = root.querySelector('[data-summary-content]');
    var summaryLine = root.querySelector('[data-summary-line-name]');
    var summaryPlan = root.querySelector('[data-summary-plan-name]');
    var summaryImpl = root.querySelector('[data-summary-impl]');
    var summaryMensual = root.querySelector('[data-summary-mensual]');
    
    var resultLinePlan = root.querySelector('[data-result-line-plan]');
    var resultExtras = root.querySelector('[data-result-extras]');
    var resultImpl = root.querySelector('[data-result-impl]');
    var resultMensual = root.querySelector('[data-result-mensual]');
    var emailResultLink = root.querySelector('[data-email-result]');
    var copyResultBtn = root.querySelector('[data-copy-result]');
    var copyStatus = root.querySelector('[data-copy-status]');
    var lastSummary = '';

    var state = { line: null };

    function fmt(n) {
      return Number(n).toLocaleString('es-UY');
    }

    function goToStep(n, skipScroll) {
      panels.forEach(function (p) {
        p.hidden = Number(p.getAttribute('data-step')) !== n;
      });
      stepIndicators.forEach(function (s) {
        var num = Number(s.getAttribute('data-step-indicator'));
        s.classList.toggle('is-active', num === n);
        s.classList.toggle('is-done', num < n);
      });
      if (!skipScroll) {
        root.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }

    // Lee la base fija del panel de la linea + suma cada [data-feature] tildado dentro de ese panel.
    function computeTotals(linePanel) {
      if (!linePanel) return null;
      var impl = Number(linePanel.getAttribute('data-base-impl'));
      var mensual = Number(linePanel.getAttribute('data-base-mensual'));
      var extras = [];
      linePanel.querySelectorAll('[data-feature]:checked').forEach(function (input) {
        var price = Number(input.getAttribute('data-price'));
        var type = input.getAttribute('data-type');
        var nameEl = input.closest('.extra-toggle').querySelector('.extra-toggle__name');
        var name = nameEl ? nameEl.textContent.trim() : '';
        if (type === 'mensual') {
          mensual += price;
        } else {
          impl += price;
        }
        extras.push({ name: name, type: type, price: price });
      });
      return { impl: impl, mensual: mensual, extras: extras };
    }

    function activeLinePanel() {
      if (!state.line) return null;
      return root.querySelector('[data-line-panel="' + state.line + '"]');
    }

    function updateSummary() {
      if (!state.line) {
        summaryEmpty.hidden = false;
        summaryContent.hidden = true;
        return;
      }
      var totals = computeTotals(activeLinePanel());
      summaryEmpty.hidden = true;
      summaryContent.hidden = false;
      summaryLine.textContent = LINE_NAMES[state.line];
      summaryPlan.textContent = totals.extras.length
        ? totals.extras.length + ' extra' + (totals.extras.length === 1 ? '' : 's') + ' seleccionado' + (totals.extras.length === 1 ? '' : 's')
        : 'Solo la base — sumá extras si querés';
      summaryImpl.textContent = 'USD ' + fmt(totals.impl);
      summaryMensual.textContent = 'USD ' + fmt(totals.mensual) + '/mes';
    }

    function selectLine(line, jumpToStep2) {
      state.line = line;
      lineChoices.forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-choose-line') === line ? 'true' : 'false');
      });
      linePanels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-line-panel') !== line;
      });
      if (selectedLineName) selectedLineName.textContent = LINE_NAMES[line];
      var step1Next = root.querySelector('[data-step="1"] [data-next]');
      if (step1Next) step1Next.disabled = false;


      updateSummary();
      if (jumpToStep2) goToStep(2);
    }

    function renderResult() {
      var linePanel = activeLinePanel();
      if (!linePanel) return;
      var totals = computeTotals(linePanel);

      resultLinePlan.textContent = LINE_NAMES[state.line];
      resultImpl.textContent = 'USD ' + fmt(totals.impl);
      resultMensual.textContent = 'USD ' + fmt(totals.mensual) + '/mes';

      resultExtras.innerHTML = '';
      totals.extras.forEach(function (extra) {
        var li = document.createElement('li');
        li.textContent = extra.name + ' — +USD ' + fmt(extra.price) + (extra.type === 'mensual' ? '/mes' : ' único');
        resultExtras.appendChild(li);
      });

      var lines = [
        'Hola CUADRA! Armé mi plan en la web:',
        '',
        'Línea: ' + LINE_NAMES[state.line]
      ];
      if (totals.extras.length) {
        lines.push('Extras:');
        totals.extras.forEach(function (extra) {
          lines.push('- ' + extra.name + ' (+USD ' + fmt(extra.price) + (extra.type === 'mensual' ? '/mes' : ' único') + ')');
        });
      }
      lines.push('');
      lines.push('Implementación: USD ' + fmt(totals.impl) + ' único');
      lines.push('Mensualidad: USD ' + fmt(totals.mensual) + '/mes');
      lines.push('');
      lines.push('Mis datos:');
      lines.push('Nombre:');
      lines.push('Negocio:');
      lines.push('Teléfono (opcional):');
      lastSummary = lines.join('\n');
      if (emailResultLink) {
        emailResultLink.href = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent('Plan armado: ' + LINE_NAMES[state.line]) +
          '&body=' + encodeURIComponent(lastSummary.replace(/\n/g, '\r\n'));
      }
    }

    function resetAll(skipScroll) {
      state = { line: null };
      lineChoices.forEach(function (btn) { btn.setAttribute('aria-pressed', 'false'); });
      linePanels.forEach(function (panel) {
        panel.hidden = true;
        panel.querySelectorAll('[data-feature]').forEach(function (input) { input.checked = false; });
      });
      summaryEmpty.hidden = false;
      summaryContent.hidden = true;
      var step1Next = root.querySelector('[data-step="1"] [data-next]');
      if (step1Next) step1Next.disabled = true;
      goToStep(1, skipScroll);
    }

    // ---- Eventos ----
    lineChoices.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectLine(btn.getAttribute('data-choose-line'), false);
      });
    });

    root.addEventListener('change', function (e) {
      if (e.target.matches('[data-feature]')) {
        updateSummary();
      }
    });


    root.querySelector('[data-step="1"] [data-next]').addEventListener('click', function () {
      if (state.line) goToStep(2);
    });

    root.querySelectorAll('[data-back]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goToStep(Number(btn.getAttribute('data-back')));
      });
    });

    var nextToResult = root.querySelector('[data-next-to-result]');
    if (nextToResult) {
      nextToResult.addEventListener('click', function () {
        renderResult();
        goToStep(3);
      });
    }

    if (copyResultBtn) {
      copyResultBtn.addEventListener('click', function () {
        var done = function (ok) {
          if (copyStatus) copyStatus.textContent = ok
            ? 'Resumen copiado. Pegalo en un email a ' + CONTACT_EMAIL + '.'
            : 'No pudimos copiarlo automáticamente: seleccioná el resumen y escribinos a ' + CONTACT_EMAIL + '.';
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(lastSummary).then(function () { done(true); }, function () { done(false); });
        } else {
          done(false);
        }
      });
    }

    var restartBtn = root.querySelector('[data-restart]');
    if (restartBtn) restartBtn.addEventListener('click', function () { resetAll(); });

    // Links dentro de la misma pagina (ej. las tarjetas de "Soluciones") a #planes-tienda, etc.
    // Un <a href="#planes-tienda"> normal solo mueve el hash: no dispara el deep-link de abajo
    // (eso corre una sola vez al cargar la pagina), asi que preseleccionamos la linea a mano.
    document.querySelectorAll('a[href^="#planes-"]').forEach(function (link) {
      var m = link.getAttribute('href').match(/^#planes-(agenda|tienda|resto|consulta|landing|institucional)$/);
      if (!m) return;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        selectLine(m[1], true);
        history.replaceState(null, '', '#planes-' + m[1]);
      });
    });

    // Deep-link: index-web.html y otras paginas enlazan a productos.html#planes-tienda, etc.
    // Progressive enhancement: sin JS, todos los pasos y checkboxes quedan visibles (fallback de contenido completo).
    // skipScroll=true: al cargar la pagina sin hash no hay que mover el scroll (goToStep hace
    // scrollIntoView por defecto, y eso arrastraba la pagina entera hasta el configurador apenas
    // cargaba, ya que ahora el configurador esta mas abajo en la pagina). Si hay hash, selectLine()
    // de abajo si hace scroll a proposito, porque ese es un deep-link real.
    resetAll(true);
    // Preseleccion desde otras paginas: ?linea=agenda o enlaces con data-preselect-line.
    function preselect(line) {
      if (!LINE_NAMES[line]) return;
      selectLine(line, true);
    }

    document.querySelectorAll('[data-preselect-line]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        preselect(a.getAttribute('data-preselect-line'));
      });
    });

    try {
      var qLine = new URLSearchParams(window.location.search).get('linea');
      if (qLine) preselect(qLine);
    } catch (err) { /* sin URLSearchParams: se ignora */ }

    var hashId = window.location.hash.replace('#', '');
    var hashMatch = hashId.match(/^planes-(agenda|tienda|resto|consulta|landing|institucional)$/);
    if (hashMatch) {
      selectLine(hashMatch[1], true);
      history.replaceState(null, '', '#' + hashId);
    }
  }


  // ---- Init all ----
  // ---- Posicion de scroll al cambiar de pagina ----
  // Sin hash: siempre arriba (el navegador a veces restaura una posicion de la
  // pagina anterior). Con hash: salto inmediato al ancla, descontando la nav fija
  // (scroll-padding-top en base.css/plano.css).
  function initPageScroll() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    var root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    var id = decodeURIComponent(window.location.hash.replace('#', ''));
    var target = id ? document.getElementById(id) : null;
    if (target) {
      target.scrollIntoView();
    } else if (!id) {
      window.scrollTo(0, 0);
    }
    window.requestAnimationFrame(function () {
      root.style.scrollBehavior = '';
    });
  }

  function init() {
    initPageScroll();
    initNav();
    initActiveNav();
    initScrollReveal();
    initForm();
    initPlanConfigurator();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* Rotador de propuestas de valor (solo pagina de construccion) */
(function () {
  const rotator = document.querySelector('.hero--construction .hero__rotator');
  if (!rotator) return;
  const lines = Array.from(rotator.querySelectorAll('.hero__rotator-line'));
  if (lines.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  window.setInterval(function () {
    lines[i].classList.remove('is-active');
    i = (i + 1) % lines.length;
    lines[i].classList.add('is-active');
  }, 3200);
})();
