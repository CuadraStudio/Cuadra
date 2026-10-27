(() => {
  const core = window.MalaCartCore;
  const key = 'cuadra.demo.mala-costumbre.cart.v1';
  const dialog = document.querySelector('#cart-dialog');
  const launcher = document.querySelector('.cart-launch');
  const inlineLauncher = document.querySelector('.gallery-cart');
  const close = document.querySelector('.cart-close');
  const builder = document.querySelector('#cart-builder');
  const receipt = document.querySelector('.cart-receipt');
  const lines = document.querySelector('.cart-lines');
  const submit = document.querySelector('.cart-submit');
  const clear = document.querySelector('.cart-clear');
  const toast = document.querySelector('.cart-toast');
  const feedback = document.querySelector('.cart-feedback');
  let cart = [];
  let opener = launcher;
  let toastTimer;
  try { cart = core.read(localStorage.getItem(key)); } catch {}
  function announce(text) {
    toast.textContent = text;
    toast.classList.add('is-visible');
    feedback.textContent = text;
    feedback.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove('is-visible'); feedback.hidden = true; }, 2600);
  }
  function bumpCounts() {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    document.querySelectorAll('.cart-count').forEach(count => count.animate([
      {transform:'scale(1)'}, {transform:'scale(1.25)',offset:.45}, {transform:'scale(1)'}
    ], {duration:320,easing:'ease-out'}));
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify({version:1, items:cart})); } catch {}
  }
  function productImage(p) {
    return `<svg viewBox="${p.x} 100 724 550" aria-hidden="true"><defs><clipPath id="cart-${p.id}-crop"><rect x="${p.x}" y="100" width="724" height="550"/></clipPath></defs><g clip-path="url(#cart-${p.id}-crop)"><image href="assets/tres-alfajores-frente-v5.webp" width="2172" height="724"/></g></svg>`;
  }
  function render(focusKey) {
    const total = core.totals(cart);
    document.querySelectorAll('.cart-count').forEach(count => { count.textContent = total.count; });
    launcher.setAttribute('aria-label', `Abrir pedido, ${total.count} alfajores`);
    inlineLauncher.setAttribute('aria-label', `Pedir, ${total.count} alfajores`);
    document.querySelector('.cart-amount').textContent = core.money(total.amount);
    document.querySelector('.cart-units').textContent = `${total.count} ${total.count === 1 ? 'alfajor' : 'alfajores'} · UYU`;
    clear.hidden = total.count === 0;
    submit.disabled = total.count === 0;
    lines.innerHTML = core.catalog.map(p => {
      const quantity = cart.find(item => item.id === p.id)?.quantity || 0;
      return `<article class="cart-line${quantity === 0 ? ' is-zero' : ''}"><div class="cart-thumb">${productImage(p)}</div><div class="cart-line-copy"><h3>${p.name}</h3><p>${p.detail}</p><div class="cart-line-bottom"><strong>${core.money(p.price)}</strong><div class="cart-stepper" role="group" aria-label="Cantidad de ${p.name}"><button type="button" data-change="-1" data-id="${p.id}" data-key="minus-${p.id}" aria-label="Quitar una unidad de ${p.name}" ${quantity === 0 ? 'disabled' : ''}>−</button><span aria-label="${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}">${quantity}</span><button type="button" data-change="1" data-id="${p.id}" data-key="plus-${p.id}" aria-label="Sumar una unidad de ${p.name}" ${quantity >= 99 ? 'disabled' : ''}>+</button></div></div></div></article>`;
    }).join('');
    if (focusKey) {
      const next = lines.querySelector(`[data-key="${focusKey}"]`);
      if (next && !next.disabled) next.focus({preventScroll:true});
      else close.focus({preventScroll:true});
    }
  }
  function setQuantity(id, quantity, focusKey) {
    cart = core.normalize([...cart.filter(item => item.id !== id), {id, quantity:Math.max(0, Math.min(99, quantity))}]);
    save();
    render(focusKey);
  }
  function resetReceipt() {
    receipt.hidden = true;
    builder.hidden = false;
    document.querySelector('.cart-bottom').hidden = false;
  }
  function openCart(trigger) {
    if (dialog.open) return;
    opener = trigger || launcher;
    resetReceipt();
    dialog.showModal();
    document.documentElement.classList.add('cart-open');
    launcher.setAttribute('aria-expanded', 'true');
    inlineLauncher.setAttribute('aria-expanded', 'true');
    document.querySelectorAll('[data-open-order]').forEach(trigger => trigger.setAttribute('aria-expanded','true'));
    close.focus();
  }
  launcher.addEventListener('click', () => openCart(launcher));
  inlineLauncher.addEventListener('click', () => openCart(inlineLauncher));
  document.querySelectorAll('[data-open-order]').forEach(trigger => trigger.addEventListener('click', () => openCart(trigger)));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('cart-open');
    launcher.setAttribute('aria-expanded', 'false');
    inlineLauncher.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('[data-open-order]').forEach(trigger => trigger.setAttribute('aria-expanded','false'));
    opener?.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.add;
    const product = core.catalog.find(p => p.id === id);
    const quantity = cart.find(item => item.id === id)?.quantity || 0;
    if (quantity < 99) {
      setQuantity(id, quantity+1);
      announce(`Sumaste 1 ${product.name}`);
      setTimeout(bumpCounts, 180);
    }
    openCart(button);
  }));
  lines.addEventListener('click', event => {
    const change = event.target.closest('[data-change]');
    if (change) {
      const id = change.dataset.id;
      const quantity = cart.find(item => item.id === id)?.quantity || 0;
      setQuantity(id, quantity+Number(change.dataset.change), change.dataset.key);
      announce('Cantidad actualizada.');
    }
  });
  clear.addEventListener('click', () => { cart=[]; save(); render(); close.focus(); announce('Pedido vacío.'); });
  submit.addEventListener('click', () => {
    const total = core.totals(cart);
    if (!total.count) return;
    builder.hidden = true;
    document.querySelector('.cart-bottom').hidden = true;
    receipt.hidden = false;
    receipt.innerHTML = `<p class="eyebrow">Simulación completada</p><h3>Una muy buena<br>mala costumbre.</h3><ul>${total.lines.map(p => `<li><span>${p.quantity} × ${p.name}</span><strong>${core.money(p.total)}</strong></li>`).join('')}</ul><p class="receipt-total">Total <strong>${core.money(total.amount)} UYU</strong></p><p>Esto es una demostración. No se envió ningún pedido ni se realizó un cobro.</p><button type="button" class="receipt-back">Volver a mi pedido</button>`;
    receipt.querySelector('.receipt-back').addEventListener('click', () => { resetReceipt(); close.focus(); });
    receipt.focus();
  });
  window.addEventListener('storage', event => { if (event.key === key) { cart=core.read(event.newValue); resetReceipt(); render(); } });
  render();

  const gallery = document.querySelector('.products');
  const products = [...gallery.querySelectorAll('.product')];
  const tabs = [...document.querySelectorAll('[data-gallery-index]')];
  const mobile = window.matchMedia('(max-width:600px)');
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  let active = 0;
  function markActive(index) {
    active = index;
    tabs.forEach((tab,i) => tab.setAttribute('aria-pressed', String(i === index)));
    products.forEach((product,i) => product.classList.toggle('is-active', i === index));
    document.querySelector('[data-gallery-step="-1"]').disabled = index === 0;
    document.querySelector('[data-gallery-step="1"]').disabled = index === products.length-1;
  }
  function move(index) {
    index = Math.max(0, Math.min(products.length-1, index));
    const bounds = gallery.getBoundingClientRect();
    const target = products[index].getBoundingClientRect();
    gallery.scrollTo({left:gallery.scrollLeft+target.left-bounds.left-(gallery.clientWidth-target.width)/2, behavior:reduced.matches?'instant':'smooth'});
    markActive(index);
  }
  tabs.forEach(tab => tab.addEventListener('click', () => move(Number(tab.dataset.galleryIndex))));
  document.querySelectorAll('[data-gallery-step]').forEach(button => button.addEventListener('click', () => move(active+Number(button.dataset.galleryStep))));
  let frame;
  gallery.addEventListener('scroll', () => {
    if (!mobile.matches || frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      const bounds = gallery.getBoundingClientRect();
      const center = bounds.left+gallery.clientWidth/2;
      const distances = products.map(product => {const b=product.getBoundingClientRect();return Math.abs(b.left+b.width/2-center);});
      markActive(distances.indexOf(Math.min(...distances)));
    });
  }, {passive:true});
  gallery.addEventListener('keydown', event => {
    if (!mobile.matches || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); move(active+(event.key==='ArrowRight'?1:-1));
  });
  mobile.addEventListener('change', () => { gallery.scrollLeft=0; markActive(0); });
  markActive(0);
  const heroObserver = new IntersectionObserver(entries => {
    document.body.classList.toggle('hero-visible', entries[0].isIntersecting);
  });
  heroObserver.observe(document.querySelector('.hero'));
})();
