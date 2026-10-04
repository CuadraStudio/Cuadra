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

    // Al enviar bien: se oculta el formulario y queda solo el mensaje de "enviado".
    function showSent(email) {
      form.reset();
      form.classList.add('is-sent');
      formStatus.innerHTML = '<div class="form-success" role="status"><strong>Mensaje enviado.</strong> ' +
        'Te respondemos a <strong>' + escapeHtml(email) + '</strong>. <span data-copy-note></span>' +
        '<button type="button" class="btn btn--secondary" data-send-another>Enviar otro mensaje</button></div>';
      formStatus.setAttribute('tabindex', '-1');
      formStatus.focus({ preventScroll: true });
      formStatus.scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      formStatus.querySelector('[data-send-another]').addEventListener('click', function () {
        form.classList.remove('is-sent');
        formStatus.innerHTML = '';
        formStatus.removeAttribute('tabindex');
        nombreInput.focus();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      if (!validate()) return;

      var honeypot = form.querySelector('[name="_honey"]');
      var fields = {
        'Nombre': nombreInput.value.trim(),
        'Email': emailInput.value.trim(),
        'Mensaje': mensajeInput.value.trim()
      };
      var subject = 'Consulta desde la web: ' + fields['Nombre'];

      // Campo trampa para bots: si esta completo, se simula el exito sin enviar nada.
      if (honeypot && honeypot.value) {
        showSent(fields['Email']);
        return;
      }

      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      sendToOwner(fields, subject).then(function () {
        showSent(fields['Email']);
        sendCopyToClient('contact', fields).then(function (sent) {
          var note = formStatus.querySelector('[data-copy-note]');
          if (sent && note) note.innerHTML = copyNote(fields['Email']);
        });
      }).catch(function () {
        formStatus.innerHTML = failureBox(fields, subject);
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
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

  // ---- Configurador de planes: a la carte (linea -> plan y extras con precio propio -> resumen por email) ----
  function initPlanConfigurator() {
    var root = document.querySelector('[data-configurator]');
    if (!root) return;

    var LINE_NAMES = { landing: 'CUADRA Landing', institucional: 'CUADRA Institucional', agenda: 'CUADRA Agenda', tienda: 'CUADRA Tienda', resto: 'CUADRA Restó', consulta: 'CUADRA Consulta' };

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
    var summaryBreakdown = root.querySelector('[data-summary-breakdown]');
    
    var resultLinePlan = root.querySelector('[data-result-line-plan]');
    var resultExtras = root.querySelector('[data-result-extras]');
    var resultImpl = root.querySelector('[data-result-impl]');
    var resultMensual = root.querySelector('[data-result-mensual]');
    var planForm = root.querySelector('[data-plan-form]');
    var openPlanFormBtn = root.querySelector('[data-open-plan-form]');
    var resultActions = root.querySelector('[data-result-actions]');
    var planFormStatus = root.querySelector('[data-plan-form-status]');
    var lastTotals = null;

    var state = { line: null };

    function fmt(n) {
      return Number(n).toLocaleString('es-UY');
    }

    var progressLogo = root.querySelector('[data-progress-logo]');

    function goToStep(n, skipScroll) {
      if (progressLogo) progressLogo.setAttribute('data-progress', String(n));
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
      var baseImpl = Number(linePanel.getAttribute('data-base-impl'));
      var baseMensual = Number(linePanel.getAttribute('data-base-mensual'));
      var impl = baseImpl;
      var mensual = baseMensual;
      var extras = [];
      linePanel.querySelectorAll('[data-feature]:checked').forEach(function (input) {
        var unitPrice = Number(input.getAttribute('data-price'));
        var type = input.getAttribute('data-type');
        var nameEl = input.closest('.extra-toggle').querySelector('.extra-toggle__name');
        var name = nameEl ? nameEl.textContent.trim() : '';
        // Extras por unidad adicional (profesionales, sedes): precio x cantidad.
        var unit = input.getAttribute('data-unit');
        var qtyEl = unit ? input.closest('.extra-toggle').querySelector('[data-qty]') : null;
        var qty = qtyEl ? Math.min(20, Math.max(1, Math.floor(Number(qtyEl.value)) || 1)) : 1;
        var price = unitPrice * qty;
        if (type === 'mensual') {
          mensual += price;
        } else {
          impl += price;
        }
        extras.push({
          name: name, type: type, price: price, unitPrice: unitPrice, qty: qty,
          perUnit: !!unit, unit: unit ? (qty === 1 ? unit : input.getAttribute('data-unit-plural')) : ''
        });
      });
      return { impl: impl, mensual: mensual, baseImpl: baseImpl, baseMensual: baseMensual, extras: extras };
    }

    function usd(n) { return 'USD ' + fmt(n); }

    // "USD 25" o, si se cobra por unidad, "5 × USD 15 = USD 75" (con "/mes" si es mensual).
    function extraAmount(x) {
      var per = x.type === 'mensual' ? '/mes' : '';
      if (x.perUnit) return x.qty + ' × ' + usd(x.unitPrice) + per + ' = ' + usd(x.price) + per;
      return usd(x.price) + per;
    }

    function extraLabel(x) {
      return x.perUnit ? x.name + ' — ' + x.qty + ' ' + x.unit : x.name;
    }

    // Desglose: cada cosa que se suma, agrupada en implementación y mantenimiento/soporte.
    function renderBreakdown(ul, totals) {
      if (!ul || !totals) return;
      var rows = [{ head: 'Implementación' }, { label: 'Base ' + LINE_NAMES[state.line], amount: usd(totals.baseImpl) }];
      totals.extras.filter(function (x) { return x.type !== 'mensual'; }).forEach(function (x) {
        rows.push({ label: extraLabel(x), amount: extraAmount(x) });
      });
      rows.push({ head: 'Mantenimiento y soporte (por mes)' });
      rows.push({ label: 'Hosting, mantenimiento y soporte', amount: usd(totals.baseMensual) + '/mes' });
      totals.extras.filter(function (x) { return x.type === 'mensual'; }).forEach(function (x) {
        rows.push({ label: extraLabel(x), amount: extraAmount(x) });
      });
      ul.innerHTML = '';
      rows.forEach(function (row) {
        var li = document.createElement('li');
        if (row.head) {
          li.className = 'breakdown__head';
          li.textContent = row.head;
        } else {
          li.className = 'breakdown__row';
          var l = document.createElement('span');
          l.textContent = row.label;
          var m = document.createElement('span');
          m.textContent = row.amount;
          li.appendChild(l);
          li.appendChild(m);
        }
        ul.appendChild(li);
      });
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
      renderBreakdown(summaryBreakdown, totals);
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

      renderBreakdown(resultExtras, totals);

      lastTotals = totals;
      resetPlanForm();
    }

    function resetAll(skipScroll) {
      state = { line: null };
      lineChoices.forEach(function (btn) { btn.setAttribute('aria-pressed', 'false'); });
      linePanels.forEach(function (panel) {
        panel.hidden = true;
        panel.querySelectorAll('[data-feature]').forEach(function (input) { input.checked = false; });
        panel.querySelectorAll('[data-qty]').forEach(function (input) { input.value = 1; });
      });
      summaryEmpty.hidden = false;
      summaryContent.hidden = true;
      resetPlanForm();
      var step1Next = root.querySelector('[data-step="1"] [data-next]');
      if (step1Next) step1Next.disabled = true;
      goToStep(1, skipScroll);
    }

    // ---- Eventos ----
    lineChoices.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Al elegir una linea se avanza solo al paso 2 (sin boton "Continuar").
        selectLine(btn.getAttribute('data-choose-line'), true);
      });
    });

    root.addEventListener('change', function (e) {
      if (e.target.matches('[data-feature]')) {
        updateSummary();
      }
    });

    // Cantidad de un extra por unidad: tocarla tilda el extra y recalcula.
    root.addEventListener('input', function (e) {
      if (!e.target.matches('[data-qty]')) return;
      var box = e.target.closest('.extra-toggle').querySelector('[data-feature]');
      if (box) box.checked = true;
      updateSummary();
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

    // ---- Formulario de datos del plan (paso 3): campos segun la linea elegida ----
    function syncPlanForm() {
      if (!planForm) return;
      planForm.querySelectorAll('[data-lines]').forEach(function (group) {
        var on = group.getAttribute('data-lines').split(' ').indexOf(state.line) !== -1;
        group.hidden = !on;
        group.querySelectorAll('input, select, textarea').forEach(function (field) {
          field.disabled = !on;
        });
      });
    }

    function resetPlanForm() {
      if (!planForm) return;
      planForm.hidden = true;
      if (resultActions) resultActions.hidden = false;
      if (planFormStatus) planFormStatus.innerHTML = '';
    }

    function collectPlanFields() {
      var fields = { 'Plan': LINE_NAMES[state.line] };
      if (lastTotals) {
        fields['Extras elegidos'] = lastTotals.extras.length
          ? lastTotals.extras.map(function (x) {
              return extraLabel(x) + ' (' + extraAmount(x) + ')';
            }).join('; ')
          : 'Solo la base';
        fields['Implementación'] = 'USD ' + fmt(lastTotals.impl);
        fields['Mantenimiento y soporte'] = 'USD ' + fmt(lastTotals.mensual) + '/mes';
      }
      planForm.querySelectorAll('input, select, textarea').forEach(function (field) {
        if (field.disabled || field.name === '_honey') return;
        var value = field.value.trim();
        if (!value) return;
        fields[field.getAttribute('data-label') || field.name] = value;
      });
      return fields;
    }

    if (openPlanFormBtn && planForm) {
      openPlanFormBtn.addEventListener('click', function () {
        syncPlanForm();
        planForm.hidden = false;
        if (resultActions) resultActions.hidden = true;
        var first = planForm.querySelector('input:not([disabled]), select:not([disabled])');
        planForm.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        if (first) first.focus({ preventScroll: true });
      });

      planForm.querySelectorAll('[data-plan-form-back]').forEach(function (btn) {
        btn.addEventListener('click', resetPlanForm);
      });

      planForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (planFormStatus) planFormStatus.innerHTML = '';
        if (!planForm.checkValidity()) {
          planForm.reportValidity();
          return;
        }
        var honeypot = planForm.querySelector('[name="_honey"]');
        var fields = collectPlanFields();
        var business = fields['Nombre del negocio'] || fields['Nombre y apellido'] || '';
        var subject = 'Plan CUADRA: ' + LINE_NAMES[state.line] + (business ? ' — ' + business : '');
        var submitBtn = planForm.querySelector('[type="submit"]');

        function showSuccess(isBot) {
          planForm.hidden = true;
          if (planFormStatus) {
            planFormStatus.innerHTML = '<div class="form-success" role="status"><strong>¡Recibimos tu plan!</strong> ' +
              'Te respondemos a <strong>' + escapeHtml(fields['Email'] || '') + '</strong> para confirmar contenido, alcance y precio final. ' +
              '<span data-copy-note></span> ' +
              '<button type="button" class="btn btn--secondary" data-restart>Armar otro plan</button></div>';
            if (isBot === true) return;
            sendCopyToClient('plan', fields).then(function (sent) {
              var note = planFormStatus.querySelector('[data-copy-note]');
              if (sent && note) note.innerHTML = copyNote(fields['Email'] || '');
            });
          }
        }

        if (honeypot && honeypot.value) {
          showSuccess(true);
          return;
        }

        var originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';

        sendToOwner(fields, subject).then(function () { showSuccess(false); }).catch(function () {
          if (planFormStatus) planFormStatus.innerHTML = failureBox(fields, subject);
        }).then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
      });
    }

    // "Armar otro plan" aparece dinamicamente: se usa delegacion de eventos.
    root.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-restart]')) resetAll();
    });

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

  // ---- Logo fijo: el color del trazo sigue la superficie que tiene detras ----
  // El logo (.plano-hero__mark) queda fijo en pantalla (CSS). Con cada scroll se mira
  // que fondo hay bajo su centro y se elige una tinta de la paleta con buen contraste:
  // sobre oscuro, sage; sobre sage, negro; sobre claro (mist / warm white), verde.
  function initLogoInk() {
    var mark = document.querySelector('.plano-hero__mark');
    if (!mark || window.getComputedStyle(mark).display === 'none') return;
    var root = document.documentElement;
    var last = '';
    var queued = false;

    function luminance(rgb) {
      var c = rgb.map(function (v) {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }

    function surfaceAt(x, y) {
      var el = document.elementFromPoint(x, y);
      while (el) {
        var m = window.getComputedStyle(el).backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (m && (m[4] === undefined || parseFloat(m[4]) > 0.5)) return [+m[1], +m[2], +m[3]];
        el = el.parentElement;
      }
      return [15, 17, 17];
    }

    function update() {
      queued = false;
      var r = mark.getBoundingClientRect();
      var l = luminance(surfaceAt(r.left + r.width / 2, r.top + r.height / 2));
      var ink = l < 0.3 ? '#AFC8C2' : (l < 0.65 ? '#0F1111' : '#3E6B62');
      if (ink !== last) {
        last = ink;
        root.style.setProperty('--logo-ink', ink);
      }
    }

    function schedule() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
  }

  function init() {
    initPageScroll();
    initNav();
    initActiveNav();
    initScrollReveal();
    initForm();
    initContactDialog();
    initPlanConfigurator();
    initSmoothScroll();
    initLogoInk();
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
