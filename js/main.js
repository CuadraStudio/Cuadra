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

  // ---- Configurador de planes: paso a paso, estilo cotizador (linea -> plan -> extras -> resumen) ----
  function initPlanConfigurator() {
    var root = document.querySelector('[data-configurator]');
    if (!root) return;

    var LINE_NAMES = { agenda: 'CUADRA Agenda', tienda: 'CUADRA Tienda', resto: 'CUADRA Restó', consulta: 'CUADRA Consulta' };
    var LINE_FROM = { agenda: 25000, tienda: 32000, resto: 28000, consulta: 18000 };
    var WA_NUMBER = '59899331909';

    var panels = root.querySelectorAll('.configurator__panel');
    var stepIndicators = root.querySelectorAll('[data-step-indicator]');
    var lineChoices = root.querySelectorAll('[data-choose-line]');
    var linePanels = root.querySelectorAll('[data-line-panel]');
    var comboToggle = root.querySelector('[data-combo-toggle]');
    var comboChoicesWrap = root.querySelector('[data-combo-choices]');
    var comboChoices = root.querySelectorAll('[data-choose-combo]');
    var selectedLineName = root.querySelector('[data-selected-line-name]');

    var summaryEmpty = root.querySelector('[data-summary-empty]');
    var summaryContent = root.querySelector('[data-summary-content]');
    var summaryLine = root.querySelector('[data-summary-line-name]');
    var summaryPlan = root.querySelector('[data-summary-plan-name]');
    var summaryImpl = root.querySelector('[data-summary-impl]');
    var summaryMensual = root.querySelector('[data-summary-mensual]');
    var summaryCombo = root.querySelector('[data-summary-combo]');

    var resultLinePlan = root.querySelector('[data-result-line-plan]');
    var resultImpl = root.querySelector('[data-result-impl]');
    var resultMensual = root.querySelector('[data-result-mensual]');
    var resultCombo = root.querySelector('[data-result-combo]');
    var waResultLink = root.querySelector('[data-whatsapp-result]');

    var state = { line: null, plan: null, combo: false, comboLine: null };

    function fmt(n) {
      return Number(n).toLocaleString('es-UY');
    }

    function goToStep(n) {
      panels.forEach(function (p) {
        p.hidden = Number(p.getAttribute('data-step')) !== n;
      });
      stepIndicators.forEach(function (s) {
        var num = Number(s.getAttribute('data-step-indicator'));
        s.classList.toggle('is-active', num === n);
        s.classList.toggle('is-done', num < n);
      });
      root.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }

    function updateSummaryPreview() {
      if (!state.line) return;
      summaryEmpty.hidden = true;
      summaryContent.hidden = false;
      summaryLine.textContent = LINE_NAMES[state.line];
      summaryPlan.textContent = 'Elegí tu plan para ver el total';
      summaryImpl.textContent = 'desde $U ' + fmt(LINE_FROM[state.line]);
      summaryMensual.textContent = 'desde $U 990/mes';
      summaryCombo.hidden = true;
    }

    function parsePlanCard(card) {
      var label = card.querySelector('.pricing-card__label');
      var price = card.querySelector('.pricing-card__price');
      var setup = card.querySelector('.pricing-card__setup');
      var mensualMatch = price && price.textContent.match(/([\d.]+)/);
      var implMatch = setup && setup.textContent.match(/\$U\s*([\d.]+)\s*único\s*\(~USD\s*([\d.]+)\)/);
      return {
        planName: label ? label.textContent.trim() : '',
        mensual: mensualMatch ? Number(mensualMatch[1].replace(/\./g, '')) : null,
        impl: implMatch ? Number(implMatch[1].replace(/\./g, '')) : null,
        usdImpl: implMatch ? Number(implMatch[2].replace(/\./g, '')) : null
      };
    }

    function updateSummaryFinal() {
      if (!state.line || !state.plan) return;
      summaryEmpty.hidden = true;
      summaryContent.hidden = false;
      summaryLine.textContent = LINE_NAMES[state.line];
      summaryPlan.textContent = 'Plan ' + state.plan.planName;
      summaryImpl.textContent = '$U ' + fmt(state.plan.impl) + ' (~USD ' + fmt(state.plan.usdImpl) + ')';
      summaryMensual.textContent = '$U ' + fmt(state.plan.mensual) + '/mes';
      if (state.combo && state.comboLine) {
        summaryCombo.hidden = false;
        summaryCombo.textContent = '+ Combo con ' + LINE_NAMES[state.comboLine] + ' (10% off en la 2da línea)';
      } else {
        summaryCombo.hidden = true;
      }
    }

    function selectLine(line, focusPanel) {
      state.line = line;
      state.plan = null;
      lineChoices.forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-choose-line') === line ? 'true' : 'false');
      });
      linePanels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-line-panel') !== line;
      });
      linePanels.forEach(function (panel) {
        panel.querySelectorAll('.pricing-card.is-selected').forEach(function (c) {
          c.classList.remove('is-selected');
        });
      });
      if (selectedLineName) selectedLineName.textContent = LINE_NAMES[line];
      var step1Next = root.querySelector('[data-step="1"] [data-next]');
      if (step1Next) step1Next.disabled = false;

      // La linea principal no puede combinarse consigo misma: se oculta esa opcion del paso 3.
      comboChoices.forEach(function (btn) {
        var isPrimary = btn.getAttribute('data-choose-combo') === line;
        btn.hidden = isPrimary;
        if (isPrimary && state.comboLine === line) {
          state.comboLine = null;
          btn.setAttribute('aria-pressed', 'false');
        }
      });

      updateSummaryPreview();
      if (focusPanel) goToStep(2);
    }

    function selectPlan(card) {
      var panel = card.closest('[data-line-panel]');
      if (panel) {
        panel.querySelectorAll('.pricing-card').forEach(function (c) {
          c.classList.remove('is-selected');
        });
      }
      card.classList.add('is-selected');
      state.plan = parsePlanCard(card);
      updateSummaryFinal();
      goToStep(3);
    }

    function selectCombo(line) {
      state.comboLine = line;
      comboChoices.forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-choose-combo') === line ? 'true' : 'false');
      });
      updateSummaryFinal();
    }

    function renderResult() {
      if (!state.line || !state.plan) return;
      resultLinePlan.textContent = LINE_NAMES[state.line] + ' — Plan ' + state.plan.planName;
      resultImpl.textContent = '$U ' + fmt(state.plan.impl) + ' (~USD ' + fmt(state.plan.usdImpl) + ')';
      resultMensual.textContent = '$U ' + fmt(state.plan.mensual) + '/mes (~USD ' + fmt(Math.round(state.plan.mensual / 40)) + ')';

      var lines = [
        'Hola CUADRA! Armé mi plan en la web:',
        LINE_NAMES[state.line] + ' — Plan ' + state.plan.planName,
        'Implementación: $U ' + fmt(state.plan.impl) + ' único',
        'Mensual: $U ' + fmt(state.plan.mensual) + '/mes'
      ];
      if (state.combo && state.comboLine) {
        resultCombo.hidden = false;
        resultCombo.textContent = 'También me interesa combinar con ' + LINE_NAMES[state.comboLine] + ' — se cotiza con 10% de descuento sobre la segunda línea, a confirmar por WhatsApp.';
        lines.push('También quiero cotizar un combo con ' + LINE_NAMES[state.comboLine] + '.');
      } else {
        resultCombo.hidden = true;
      }
      lines.push('¿Seguimos?');
      if (waResultLink) {
        waResultLink.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      }
    }

    function resetAll() {
      state = { line: null, plan: null, combo: false, comboLine: null };
      lineChoices.forEach(function (btn) { btn.setAttribute('aria-pressed', 'false'); });
      comboChoices.forEach(function (btn) { btn.setAttribute('aria-pressed', 'false'); });
      linePanels.forEach(function (panel) {
        panel.hidden = true;
        panel.querySelectorAll('.pricing-card.is-selected').forEach(function (c) { c.classList.remove('is-selected'); });
      });
      if (comboToggle) comboToggle.checked = false;
      if (comboChoicesWrap) comboChoicesWrap.hidden = true;
      summaryEmpty.hidden = false;
      summaryContent.hidden = true;
      var step1Next = root.querySelector('[data-step="1"] [data-next]');
      if (step1Next) step1Next.disabled = true;
      goToStep(1);
    }

    // ---- Eventos ----
    lineChoices.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectLine(btn.getAttribute('data-choose-line'), false);
      });
    });

    root.querySelectorAll('[data-select-plan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectPlan(btn.closest('.pricing-card'));
      });
    });

    if (comboToggle) {
      comboToggle.addEventListener('change', function () {
        state.combo = comboToggle.checked;
        if (comboChoicesWrap) comboChoicesWrap.hidden = !comboToggle.checked;
        if (!comboToggle.checked) {
          state.comboLine = null;
          comboChoices.forEach(function (btn) { btn.setAttribute('aria-pressed', 'false'); });
        }
        updateSummaryFinal();
      });
    }

    comboChoices.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectCombo(btn.getAttribute('data-choose-combo'));
      });
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
        goToStep(4);
      });
    }

    var restartBtn = root.querySelector('[data-restart]');
    if (restartBtn) restartBtn.addEventListener('click', resetAll);

    // Deep-link: index-web.html y otras paginas enlazan a productos.html#planes-tienda, etc.
    // Progressive enhancement: sin JS, panels y pasos quedan visibles (fallback de contenido completo).
    resetAll();
    var hashId = window.location.hash.replace('#', '');
    var hashMatch = hashId.match(/^planes-(agenda|tienda|resto|consulta)$/);
    if (hashMatch) {
      selectLine(hashMatch[1], true);
      history.replaceState(null, '', '#' + hashId);
    }
  }

  // ---- Init all ----
  function init() {
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
