/* ============================================
   main.js - Nav toggle, scroll reveal, form handling, precios y WhatsApp desde site-config.js
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
    window.CUADRA_REVEAL_OK = true;
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

  // ---- Envio de formularios al correo del sitio ----
  // La web es estatica: el envio lo hace un servicio de formularios (formEndpoint en
  // js/site-config.js) que reenvia el mensaje por email a CONTACT_EMAIL. Si falla,
  // se ofrece abrir el correo con los datos como respaldo.
  var CONTACT_EMAIL = 'cuadrastudio.uy@gmail.com';

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function sendToOwner(fields, subject) {
    var endpoint = (window.CUADRA_SITE && window.CUADRA_SITE.formEndpoint) || '';
    if (!endpoint || typeof fetch !== 'function') {
      return Promise.reject(new Error('sin-endpoint'));
    }
    var payload = {};
    Object.keys(fields).forEach(function (key) { payload[key] = fields[key]; });
    payload._subject = subject;
    payload._template = 'table';
    payload._captcha = 'false';
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        var ok = res.ok && data.success !== false && data.success !== 'false';
        if (!ok) throw new Error('envio-fallido');
        return data;
      });
    });
  }

  function mailtoFallback(fields, subject) {
    var lines = Object.keys(fields).map(function (key) { return key + ': ' + fields[key]; });
    return 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
  }

  // Copia para el visitante ("correo enviado"): un Worker con Resend le manda lo que
  // envio. Solo se llama despues de que el aviso a CUADRA salio bien. Es opcional: si
  // confirmEndpoint esta vacio o falla, el envio principal no se ve afectado.
  function sendCopyToClient(kind, fields) {
    var endpoint = (window.CUADRA_SITE && window.CUADRA_SITE.confirmEndpoint) || '';
    if (!endpoint || typeof fetch !== 'function') return Promise.resolve(false);
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: kind, fields: fields })
    }).then(function (res) { return res.ok; }).catch(function () { return false; });
  }

  function copyNote(email) {
    return 'También te enviamos una copia a <strong>' + escapeHtml(email) + '</strong>.';
  }

  function failureBox(fields, subject) {
    return '<div class="form-error-box" role="alert">No pudimos enviar el mensaje. Probá de nuevo en un momento o ' +
      '<a href="' + mailtoFallback(fields, subject) + '">enviá estos datos desde tu app de correo</a> ' +
      '(también podés escribir a <strong>' + CONTACT_EMAIL + '</strong>).</div>';
  }

  // ---- Form handling ----
  // Formulario generico: cada campo con "name" (sin guion bajo inicial) se valida y se envia con su etiqueta.
  // Obligatorios: los que tienen "required". Un campo con data-validate="contact" acepta email o WhatsApp.
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var formStatus = document.getElementById('form-status');
    var submitBtn = document.getElementById('submit-btn');

    // Producto elegido en la web (?producto=landing|web|refresh|tienda): se muestra y viaja con el envio.
    var productNames = { landing: 'Landing', web: 'Web (4 a 8 páginas)', refresh: 'Web Refresh', tienda: 'Tienda online' };
    var productField = form.elements['producto'];
    var productNote = document.querySelector('[data-product-note]');
    if (productField && productNote) {
      var productKey = (new URLSearchParams(window.location.search).get('producto') || '').toLowerCase();
      if (productNames[productKey]) {
        productField.value = productNames[productKey];
        productNote.querySelector('[data-product-name]').textContent = productNames[productKey];
        productNote.hidden = false;
      }
    }

    var controls = Array.prototype.filter.call(form.querySelectorAll('input, textarea, select'), function (el) {
      return el.name && el.name.charAt(0) !== '_' && (el.type !== 'hidden' || el.hasAttribute('data-include')) && el.type !== 'submit';
    });

    function labelOf(el) {
      if (el.type === 'hidden') return el.getAttribute('data-label') || el.name;
      var label = form.querySelector('label[for="' + el.id + '"]');
      return label ? label.textContent.replace(/\s*\(opcional\)\s*$/i, '').trim() : el.name;
    }
    function errorBox(el) { return document.getElementById(el.id + '-error'); }
    function errorClass(el) { return el.tagName === 'TEXTAREA' ? 'form-textarea--error' : 'form-input--error'; }
    function clearError(el) {
      var box = errorBox(el);
      if (box) box.textContent = '';
      el.classList.remove(errorClass(el));
      el.removeAttribute('aria-invalid');
    }
    function setError(el, message) {
      var box = errorBox(el);
      if (box) box.textContent = message;
      el.classList.add(errorClass(el));
      el.setAttribute('aria-invalid', 'true');
    }
    function valueOf(name) {
      var el = form.elements[name];
      return el && el.value ? el.value.trim() : '';
    }
    function isContact(value) {
      return emailRegex.test(value) || value.replace(/\D/g, '').length >= 8;
    }

    function validate() {
      var firstInvalid = null;
      controls.forEach(function (el) {
        clearError(el);
        var value = el.value.trim();
        var message = '';
        if (el.required && !value) {
          message = 'Este campo es obligatorio.';
        } else if (value && el.type === 'email' && !emailRegex.test(value)) {
          message = 'Ingresá un email válido.';
        } else if (value && el.getAttribute('data-validate') === 'contact' && !isContact(value)) {
          message = 'Escribí un email o un número de WhatsApp válido.';
        }
        if (message) {
          setError(el, message);
          if (!firstInvalid) firstInvalid = el;
        }
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    // Al enviar bien: se oculta el formulario y queda solo el mensaje de "enviado".
    function showSent(replyTo) {
      form.reset();
      form.classList.add('is-sent');
      formStatus.innerHTML = '<div class="form-success" role="status"><strong>Mensaje enviado.</strong> ' +
        'Te respondemos a <strong>' + escapeHtml(replyTo) + '</strong>. <span data-copy-note></span>' +
        '<button type="button" class="btn btn--secondary" data-send-another>Enviar otro mensaje</button></div>';
      formStatus.setAttribute('tabindex', '-1');
      formStatus.focus({ preventScroll: true });
      formStatus.scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      formStatus.querySelector('[data-send-another]').addEventListener('click', function () {
        form.classList.remove('is-sent');
        formStatus.innerHTML = '';
        formStatus.removeAttribute('tabindex');
        if (controls[0]) controls[0].focus();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      formStatus.innerHTML = '';
      if (!validate()) return;

      var fields = {};
      controls.forEach(function (el) {
        var value = el.value.trim();
        if (value) fields[labelOf(el)] = value;
      });
      var who = valueOf('negocio') || valueOf('nombre');
      var subject = (form.getAttribute('data-subject') || 'Consulta desde la web') + ': ' + who;
      if (valueOf('producto')) subject += ' · ' + valueOf('producto');
      var replyTo = valueOf('email') || valueOf('contacto');
      var replyEmail = emailRegex.test(valueOf('email')) ? valueOf('email') : (emailRegex.test(valueOf('contacto')) ? valueOf('contacto') : '');

      // Campo trampa para bots: si esta completo, se simula el exito sin enviar nada.
      var honeypot = form.querySelector('[name="_honey"]');
      if (honeypot && honeypot.value) {
        showSent(replyTo);
        return;
      }

      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      sendToOwner(fields, subject).then(function () {
        showSent(replyTo);
        if (replyEmail) {
          sendCopyToClient('contact', fields).then(function (sent) {
            var note = formStatus.querySelector('[data-copy-note]');
            if (sent && note) note.innerHTML = copyNote(replyEmail);
          });
        }
      }).catch(function () {
        formStatus.innerHTML = failureBox(fields, subject);
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
    });

    controls.forEach(function (el) {
      el.addEventListener('input', function () { clearError(el); });
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

  // ---- Dialogo de contacto (sitio en construccion) ----
  function initContactDialog() {
    var dialog = document.getElementById('contact-dialog');
    if (!dialog) return;
    var openers = document.querySelectorAll('[data-open-contact]');

    function open() {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      var first = dialog.querySelector('input:not([type="hidden"]):not(.hp)');
      if (first) first.focus();
    }

    function close() {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }

    openers.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });
    dialog.querySelectorAll('[data-close-contact]').forEach(function (btn) {
      btn.addEventListener('click', close);
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) close();
    });
  }

  // ---- Precios: se vuelcan desde site-config.js (el HTML trae el mismo numero por defecto) ----
  function initPrices() {
    var site = window.CUADRA_SITE || {};
    var prices = site.prices;
    if (!prices) return;
    document.querySelectorAll('[data-price]').forEach(function (el) {
      var value = el.getAttribute('data-price').split('.').reduce(function (obj, key) {
        return obj == null ? undefined : obj[key];
      }, prices);
      if (typeof value === 'number') el.textContent = 'USD ' + value;
    });
    document.querySelectorAll('[data-launch-slots]').forEach(function (el) {
      if (typeof site.launchSlots === 'number') el.textContent = String(site.launchSlots);
    });
  }

  // ---- WhatsApp: solo aparece si site-config.js tiene un numero valido ----
  function initWhatsApp() {
    var number = String((window.CUADRA_SITE && window.CUADRA_SITE.whatsapp) || '').replace(/\D/g, '');
    if (number.length < 8 || number.length > 15) return;
    var text = encodeURIComponent('Hola, quiero solicitar una propuesta para mi negocio.');
    document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
      el.setAttribute('href', 'https://wa.me/' + number + '?text=' + text);
      el.hidden = false;
    });
    document.querySelectorAll('[data-whatsapp-block]').forEach(function (el) { el.hidden = false; });
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

  // ---- Barra de propuesta en celular: aparece solo cuando no hay otro boton de propuesta a la vista ----
  function initCtaBar() {
    var bar = document.querySelector('.contact-fab');
    var anchors = document.querySelectorAll('[data-cta-anchor]');
    if (!bar || !anchors.length || !('IntersectionObserver' in window)) return;
    var visibles = [];
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var i = visibles.indexOf(entry.target);
        if (entry.isIntersecting && i === -1) visibles.push(entry.target);
        if (!entry.isIntersecting && i > -1) visibles.splice(i, 1);
      });
      bar.classList.toggle('is-shown', visibles.length === 0);
    });
    anchors.forEach(function (el) { observer.observe(el); });
  }

  function init() {
    initPageScroll();
    initNav();
    initActiveNav();
    initScrollReveal();
    initForm();
    initContactDialog();
    initPrices();
    initWhatsApp();
    initCtaBar();
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
