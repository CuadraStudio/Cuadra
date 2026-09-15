/**
 * Runtime del sitio generado. Vanilla JS, sin dependencias.
 *
 * Se copia tal cual a js/site.js. Lee window.SITE_CONFIG (emitido por el
 * generator en js/config.js) y resuelve:
 *   · menú mobile          · filtros de catálogo y galería
 *   · carrito de pedido    · horarios disponibles en los flujos
 *   · envío de formularios por WhatsApp
 *
 * Cuando el tenant tiene API habilitada, los horarios se piden al backend;
 * si no, se derivan de los horarios del config. El marcado es el mismo en
 * los dos casos.
 */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  /* Subruta de deploy: "/demo/estudioarroyo" cuando el sitio vive dentro de
     otro dominio. Vacío en sitios standalone. Se usa para las URLs internas
     que el runtime arma (el redirect a /gracias/, por ejemplo). */
  var base = String(CFG.base || '').replace(/\/+$/, '');
  var money = function (n) {
    var value = Number(n) || 0;
    return '$ ' + value.toLocaleString('es-UY', { maximumFractionDigits: 0 });
  };
  var qs = function (sel, root) { return (root || document).querySelector(sel); };
  var qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var params = new URLSearchParams(window.location.search);

  /* ── Menú mobile ────────────────────────────────────────────────────── */

  (function nav() {
    var toggle = qs('.nav__toggle');
    var wrap = qs('.nav');
    if (!toggle || !wrap) return;
    toggle.addEventListener('click', function () {
      var open = wrap.getAttribute('data-open') === 'true';
      wrap.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
    qsa('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        wrap.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }());

  /* ── Filtros (catálogo, galería) ────────────────────────────────────── */

  (function filters() {
    qsa('[data-filter-group]').forEach(function (group) {
      var target = qs('[data-filterable]');
      if (!target) return;
      group.addEventListener('click', function (ev) {
        var chip = ev.target.closest('[data-filter]');
        if (!chip) return;
        var value = chip.getAttribute('data-filter');
        qsa('[data-filter]', group).forEach(function (c) { c.classList.toggle('is-active', c === chip); });
        qsa('[data-category]', target).forEach(function (item) {
          item.hidden = !(value === '*' || item.getAttribute('data-category') === value);
        });
      });
    });
  }());

  /* ── Carrito ────────────────────────────────────────────────────────── */

  var Cart = {
    key: (CFG.tenant && CFG.tenant.slug ? CFG.tenant.slug : 'cuadra') + '_cart',
    read: function () {
      try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { return []; }
    },
    write: function (items) {
      try { localStorage.setItem(this.key, JSON.stringify(items)); } catch (e) { /* modo privado */ }
      this.paint();
    },
    add: function (entry) {
      var items = this.read();
      var found = items.filter(function (i) { return i.slug === entry.slug && i.variant === entry.variant; })[0];
      if (found) found.qty += entry.qty;
      else items.push(entry);
      this.write(items);
    },
    count: function () {
      return this.read().reduce(function (a, i) { return a + i.qty; }, 0);
    },
    total: function () {
      return this.read().reduce(function (a, i) { return a + (i.price * i.qty); }, 0);
    },
    /** Repinta el contador del header y el detalle del carrito si está en pantalla. */
    paint: function () {
      var n = this.count();
      qsa('.site-header__cta, .sticky-cta .btn').forEach(function (btn) {
        var label = btn.getAttribute('data-label') || btn.textContent.replace(/\s*\(\d+\)$/, '');
        btn.setAttribute('data-label', label);
        btn.textContent = n > 0 ? label + ' (' + n + ')' : label;
      });
      var box = qs('[data-cart]');
      if (!box) return;
      var items = this.read();
      if (!items.length) {
        if (!qs('.cart__empty', box)) box.innerHTML = '<p class="cart__empty">Tu pedido está vacío.</p>';
        return;
      }
      var self = this;
      box.innerHTML = items.map(function (i, idx) {
        return '<div class="cart__row">'
          + '<span class="cart__name">' + escapeHtml(i.name)
          + (i.variant ? '<span class="cart__variant">' + escapeHtml(i.variant) + '</span>' : '')
          + '</span>'
          + '<span class="cart__qty">'
          + '<button type="button" data-qty="-1" data-idx="' + idx + '" aria-label="Quitar uno">−</button>'
          + '<span>' + i.qty + '</span>'
          + '<button type="button" data-qty="1" data-idx="' + idx + '" aria-label="Agregar uno">+</button>'
          + '</span>'
          + '<span class="cart__price">' + money(i.price * i.qty) + '</span>'
          + '<button type="button" class="cart__remove" data-remove="' + idx + '" aria-label="Quitar ' + escapeHtml(i.name) + '">×</button>'
          + '</div>';
      }).join('') + '<div class="cart__total"><span>Total</span><span>' + money(self.total()) + '</span></div>';
    }
  };

  (function cartUi() {
    document.addEventListener('click', function (ev) {
      var add = ev.target.closest('[data-add-to-cart]');
      if (add) {
        var slug = add.getAttribute('data-add-to-cart');
        var item = findCatalogItem(slug);
        if (!item) return;
        /* Un pedido sin talle o color obliga a ir y venir por WhatsApp:
           no se agrega hasta que estén elegidos todos los ejes. */
        var faltan = missingAxes();
        if (faltan.length) {
          warnVariant('Elegí ' + faltan.join(' y ') + ' antes de agregar.');
          return;
        }
        Cart.add({
          slug: slug,
          name: item.name,
          price: Number(item.price) || 0,
          variant: selectedVariant(),
          qty: 1
        });
        add.textContent = 'Agregado ✓';
        setTimeout(function () { add.textContent = 'Agregar al pedido'; }, 1600);
        return;
      }
      var qty = ev.target.closest('[data-qty]');
      if (qty) {
        var items = Cart.read();
        var idx = Number(qty.getAttribute('data-idx'));
        items[idx].qty += Number(qty.getAttribute('data-qty'));
        if (items[idx].qty < 1) items.splice(idx, 1);
        Cart.write(items);
        return;
      }
      var rm = ev.target.closest('[data-remove]');
      if (rm) {
        var list = Cart.read();
        list.splice(Number(rm.getAttribute('data-remove')), 1);
        Cart.write(list);
      }
    });
    /* Al elegir una opción se limpia el aviso: no queda un error viejo en pantalla. */
    document.addEventListener('change', function (ev) {
      if (!ev.target.closest || !ev.target.closest('.variants')) return;
      var note = qs('.variants__warn');
      if (note && !missingAxes().length) note.remove();
    });
    Cart.paint();
  }());

  function selectedVariant() {
    var picked = qsa('.variants input:checked').map(function (i) { return i.value; });
    return picked.join(' / ');
  }

  /** Ejes de variante (talle, color) que el producto ofrece y nadie eligió. */
  function missingAxes() {
    return qsa('.variants .variant').filter(function (fs) {
      return !qs('input:checked', fs);
    }).map(function (fs) {
      return fs.getAttribute('data-axis') || 'una opción';
    });
  }

  function warnVariant(msg) {
    var box = qs('.variants');
    if (!box) return;
    var note = qs('.variants__warn', box);
    if (!note) {
      note = document.createElement('p');
      note.className = 'variants__warn';
      note.setAttribute('role', 'alert');
      box.appendChild(note);
    }
    note.textContent = msg;
    var first = qs('.variant input:not([disabled])', box);
    if (first) first.focus();
  }

  function findCatalogItem(slug) {
    var list = (CFG.catalog || []).concat(CFG.menuItems || []);
    return list.filter(function (i) { return i.slug === slug; })[0];
  }

  /* ── Horarios disponibles ───────────────────────────────────────────── */

  (function slots() {
    var box = qs('[data-slots]');
    if (!box) return;
    var form = box.closest('form');
    if (!form) return;
    /* Fecha mínima seleccionable: hoy (local). Bloquea el pasado en el picker. */
    var fechaEl = form.querySelector('[name="fecha"]');
    if (fechaEl) fechaEl.min = localYmd(new Date());

    var refresh = function () {
      var date = (form.querySelector('[name="fecha"]') || {}).value;
      if (!date) return;
      box.innerHTML = '<p class="slots__empty">Buscando horarios…</p>';
      fetchSlots(date, form).then(function (list) {
        if (!list.length) {
          box.innerHTML = '<p class="slots__empty">No quedan horarios para ese día. Probá con otra fecha.</p>';
          return;
        }
        box.innerHTML = list.map(function (t) {
          return '<button type="button" class="slot" data-slot="' + t + '">' + t + '</button>';
        }).join('');
      });
    };

    form.addEventListener('change', function (ev) {
      if (['fecha', 'servicio', 'profesional', 'sucursal', 'franja'].indexOf(ev.target.name) > -1) refresh();
    });

    box.addEventListener('click', function (ev) {
      var slot = ev.target.closest('[data-slot]');
      if (!slot) return;
      qsa('.slot', box).forEach(function (s) { s.classList.toggle('is-active', s === slot); });
      box.setAttribute('data-value', slot.getAttribute('data-slot'));
    });
  }());

  /** Fecha local en YYYY-MM-DD. Nunca toISOString(): al pasar a UTC el "hoy"
   * depende de la zona horaria (en UY es -03:00) y a la noche ya es mañana. */
  function localYmd(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  /**
   * Horarios: los pide a la API si el tenant la tiene habilitada; si no, los
   * deriva de los horarios publicados en el config. Nunca inventa un horario
   * fuera de la grilla del negocio.
   */
  function fetchSlots(date, form) {
    var api = CFG.api || {};
    if (api.enabled && api.base) {
      var body = {
        date: date,
        service: value(form, 'servicio'),
        provider: value(form, 'profesional'),
        location: value(form, 'sucursal')
      };
      return fetch(api.base + '/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) { return data.slots || []; })
        .catch(function () { return localSlots(date, form); });
    }
    return Promise.resolve(localSlots(date, form));
  }

  function localSlots(date, form) {
    var booking = CFG.booking || {};
    var step = booking.slotStepMin || 30;
    var day = new Date(date + 'T12:00:00').getDay();
    var ranges = [];
    var franja = value(form, 'franja');

    (booking.hours || []).forEach(function (h) {
      if (h.dayIndexes && h.dayIndexes.indexOf(day) === -1) return;
      if (franja && h.seating && h.seating !== franja) return;
      if (h.open && h.close) ranges.push([h.open, h.close]);
    });

    var out = [];
    ranges.forEach(function (r) {
      for (var t = toMin(r[0]); t + step <= toMin(r[1]); t += step) out.push(toHHMM(t));
    });
    /* Fecha en el pasado: sin horarios (cubre el input tipeado o salteado). */
    var now = new Date();
    if (date < localYmd(now)) return [];
    /* Horarios ya pasados si la fecha es hoy. Comparación LOCAL: toISOString()
       convierte a UTC y a la noche (p. ej. UY, UTC-3) "hoy" ya es mañana. */
    if (date === localYmd(now)) {
      var limit = now.getHours() * 60 + now.getMinutes() + (booking.minAdvanceMin || 60);
      out = out.filter(function (t) { return toMin(t) > limit; });
    }
    return out;
  }

  function toMin(hhmm) {
    var p = String(hhmm).split(':');
    return (Number(p[0]) * 60) + Number(p[1] || 0);
  }
  function toHHMM(min) {
    return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
  }
  function value(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value : '';
  }

  /* ── Preselección desde la querystring ──────────────────────────────── */

  (function preselect() {
    ['servicio', 'profesional', 'sucursal'].forEach(function (name) {
      var v = params.get(name);
      if (!v) return;
      var el = document.querySelector('[name="' + name + '"]');
      if (el) el.value = v;
    });
    var mesa = params.get('mesa');
    var mesaEl = qs('[data-mesa]');
    if (mesa && mesaEl) {
      mesaEl.textContent = 'Mesa ' + mesa;
      mesaEl.hidden = false;
    }
  }());

  /* ── Campos condicionales ───────────────────────────────────────────── */

  (function conditionals() {
    var fields = qsa('[data-when]');
    if (!fields.length) return;

    var apply = function () {
      fields.forEach(function (field) {
        var parts = field.getAttribute('data-when').split('=');
        var source = document.querySelector('[name="' + parts[0] + '"]');
        field.hidden = !(source && source.value === parts[1]);
      });
    };

    document.addEventListener('change', function (ev) {
      if (ev.target.name) apply();
    });
    apply();
  }());

  /* ── Envío de formularios ───────────────────────────────────────────── */

  (function forms() {
    qsa('form.form').forEach(function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var status = qs('.form__status', form);
        /* Un campo oculto por condición no se exige ni se manda. */
        var missing = qsa('[required]', form).filter(function (el) {
          return !el.value.trim() && !isHidden(el);
        });
        var slotBox = qs('[data-slots]', form);
        if (slotBox && !slotBox.getAttribute('data-value')) {
          setStatus(status, 'Elegí un horario para continuar.', 'error');
          return;
        }
        if (missing.length) {
          setStatus(status, 'Faltan datos: completá los campos marcados.', 'error');
          missing[0].focus();
          return;
        }
        saveDemoCita(form, slotBox);
        var url = whatsappUrl(form, slotBox);
        setStatus(status, 'Abriendo WhatsApp…', '');
        window.open(url, '_blank', 'noopener');
        window.setTimeout(function () { window.location.href = base + '/gracias/'; }, 600);
      });
    });
  }());

  function setStatus(el, msg, tone) {
    if (!el) return;
    el.textContent = msg;
    if (tone) el.setAttribute('data-tone', tone); else el.removeAttribute('data-tone');
  }

  /**
   * Modo demo: guarda la consulta/cita en localStorage para que el panel
   * (/admin.html) la liste. Solo corre cuando el config habilita `demo`.
   * El sitio no tiene backend en la demo: sin esto el admin no tendría nada
   * que mostrar y el flujo no dejaría rastro de que funciona.
   */
  function saveDemoCita(form, slotBox) {
    var demo = CFG.demo || {};
    if (!demo.enabled) return;
    var key = demo.citasKey || ((CFG.tenant && CFG.tenant.slug) || 'cuadra') + '_demo_citas';
    var record = {
      id: 'C-' + Date.now().toString(36).toUpperCase(),
      created: new Date().toISOString(),
      estado: 'Nueva'
    };
    qsa('input, select, textarea', form).forEach(function (el) {
      if (!el.name || !el.value || el.type === 'radio' || isHidden(el)) return;
      record[el.name] = el.value;
    });
    if (slotBox && slotBox.getAttribute('data-value')) record.hora = slotBox.getAttribute('data-value');
    var list = [];
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (e) { list = []; }
    list.unshift(record);
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* modo privado */ }
  }

  /** Arma el mensaje formateado que recibe el negocio. */
  function whatsappUrl(form, slotBox) {
    var wa = (CFG.whatsapp && CFG.whatsapp.number) || '';
    var lines = [];
    var title = (form.id || '').replace('form-', '');
    lines.push('Hola ' + ((CFG.tenant && CFG.tenant.name) || '') + ', ' + intro(title));

    var cart = Cart.read();
    if (cart.length) {
      lines.push('');
      lines.push('Pedido:');
      cart.forEach(function (i) {
        lines.push('• ' + i.qty + 'x ' + i.name + (i.variant ? ' (' + i.variant + ')' : '') + ' — ' + money(i.price * i.qty));
      });
      lines.push('Total: ' + money(Cart.total()));
    }

    lines.push('');
    qsa('input, select, textarea', form).forEach(function (el) {
      if (!el.name || !el.value || el.type === 'radio' || isHidden(el)) return;
      lines.push(labelFor(el) + ': ' + el.value);
    });
    if (slotBox && slotBox.getAttribute('data-value')) {
      lines.push('Hora: ' + slotBox.getAttribute('data-value'));
    }
    return 'https://wa.me/' + wa + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function intro(kind) {
    var map = {
      reserva: 'quiero reservar un turno.',
      mesa: 'quiero reservar una mesa.',
      pedido: 'quiero hacer un pedido.',
      carrito: 'quiero hacer este pedido.',
      consulta: 'quiero agendar una consulta.',
      contacto: 'te escribo por una consulta.',
      evento: 'quiero consultar por un evento.'
    };
    return map[kind] || 'te escribo desde la web.';
  }

  function isHidden(el) {
    var field = el.closest('.field');
    return !!(field && field.hidden);
  }

  function labelFor(el) {
    var lab = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
    return lab ? lab.textContent.replace('*', '').trim() : el.name;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
}());
