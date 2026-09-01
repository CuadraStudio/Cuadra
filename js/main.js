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

      // Focus first link in menu
      var firstLink = mobileMenu.querySelector('.nav__mobile-link');
      if (firstLink) {
        firstLink.focus();
      }
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

      // Simulate form submission (no backend)
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
        formStatus.innerHTML = '<div class="form-success">Mensaje enviado correctamente. Te voy a responder pronto.</div>';
        form.reset();
      }, 1200);
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
        }
      });
    });
  }

  // ---- Init all ----
  function init() {
    initNav();
    initActiveNav();
    initScrollReveal();
    initForm();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
