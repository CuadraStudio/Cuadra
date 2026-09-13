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

  // ---- Plans tabs: filtra #planes por linea (evita el muro de 12 cards en mobile) ----
  function initPlansTabs() {
    var tabs = document.querySelectorAll('.plans-nav__link');
    var panels = document.querySelectorAll('.plans-block');
    if (!tabs.length || !panels.length) return;

    function activate(targetId, scroll) {
      panels.forEach(function (panel) {
        panel.hidden = panel.id !== targetId;
      });
      tabs.forEach(function (tab) {
        var isMatch = tab.getAttribute('href') === '#' + targetId;
        tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
      if (scroll) {
        var panel = document.getElementById(targetId);
        if (panel) {
          panel.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
      }
    }

    // Progressive enhancement: sin JS quedan las 12 cards visibles (fallback actual).
    // Con JS, arranca mostrando solo la primera linea (Agenda).
    activate(panels[0].id, false);

    document.querySelectorAll('a[href^="#planes-"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href').slice(1);
        if (!document.getElementById(targetId)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        activate(targetId, true);
        history.replaceState(null, '', '#' + targetId);
      });
    });
  }

  // ---- Init all ----
  function init() {
    initNav();
    initActiveNav();
    initScrollReveal();
    initForm();
    initPlansTabs();
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
