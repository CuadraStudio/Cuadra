(function(){
  'use strict';
  const core=window.BerrincheCart;
  const STORAGE_KEY='cuadra.demo.berrinche.cart.v1';
  const dialog=document.querySelector('#cart-dialog');
  const catalog=document.querySelector('#catalog-products');
  const linesContainer=document.querySelector('#cart-lines');
  const form=document.querySelector('#order-form');
  const nameField=document.querySelector('#order-name');
  const addressField=document.querySelector('#order-address');
  const notesField=document.querySelector('#order-notes');
  const error=document.querySelector('#checkout-error');
  let cart=[];
  let category='pizzas';
  let toastTimer;
  let checkingOut=false;
  if(!window.BerrincheData?.previewMode){try{cart=core.readSavedCart(localStorage.getItem(STORAGE_KEY))}catch{}}
  const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const quantity=id=>cart.find(p=>p.id===id)?.quantity||0;
  function controls(p,place){
    const count=quantity(p.id);
    if(core.isSoldOut(p)&&place==='menu')return '<span class="sold-out-label">Agotado por hoy</span>';
    const paused=window.BerrincheOperations.status(window.BerrincheData.current.settings).paused;
    if(!count&&(place==='menu'||place==='suggestion'))return `<button type="button" class="add-product" data-cart-action="plus" data-product="${p.id}" data-focus="${place}:plus:${p.id}" aria-label="Agregar ${escape(p.name)} al carrito" ${paused?'disabled':''}>Agregar <span aria-hidden="true">+</span></button>`;
    return `<div class="quantity-control" role="group" aria-label="Cantidad de ${escape(p.name)}"><button type="button" data-cart-action="minus" data-product="${p.id}" data-focus="${place}:minus:${p.id}" aria-label="Quitar una unidad de ${escape(p.name)}">−</button><span aria-label="${count} unidades">${count}</span><button type="button" data-cart-action="plus" data-product="${p.id}" data-focus="${place}:plus:${p.id}" aria-label="Sumar una unidad de ${escape(p.name)}" ${count>=core.MAX_QUANTITY||core.isSoldOut(p)||paused?'disabled':''}>+</button></div>`;
  }
  function renderCatalog(){
    document.querySelector('[data-pizza-count]').textContent=core.products.filter(p=>p.category==='pizzas').length;
    const onlyVeggie=document.querySelector('#only-veggie').checked;
    const shown=core.products.filter(p=>p.category===category&&(!(category==='pizzas'&&onlyVeggie)||p.vegetarian));
    catalog.innerHTML=shown.map(p=>`<article class="menu-item product-row" data-product-row="${p.id}"><div class="product-copy">${p.category==='pizzas'?`<span class="item-tag">${p.vegetarian?'Sin carne':'Pizza al molde'}</span>`:''}<h3>${p.category==='pizzas'?`<button class="preview-flavor" type="button" data-preview="${p.id}" aria-pressed="false">${escape(p.name)}<span class="preview-label">Ver pizza ↗</span></button>`:escape(p.name)}</h3>${p.description?`<p>${escape(p.description)}</p>`:''}</div><div class="product-buy"><strong>${core.money(p.price)}</strong>${controls(p,'menu')}</div></article>`).join('');
    document.dispatchEvent(new CustomEvent('catalog:render'));
    document.querySelector('#catalog-status').textContent=`${shown.length} productos en esta selección.`;
  }
  function fulfillment(){return form.elements.fulfillment.value}
  function updateShipping(){
    const config=window.BerrincheData.current.settings.delivery||{};
    const deliveryRadio=form.querySelector('[value=delivery]');deliveryRadio.disabled=config.enabled===false;
    if(deliveryRadio.disabled&&deliveryRadio.checked)form.querySelector('[value=pickup]').checked=true;
    const delivery=fulfillment()==='delivery';
    document.querySelector('#address-field').hidden=!delivery;
    addressField.required=delivery;
    addressField.minLength=delivery?5:0;
    if(!delivery)addressField.setCustomValidity('');
    document.querySelector('#shipping-note').textContent=delivery?(Number.isSafeInteger(config.fee)?'Envío: '+core.money(config.fee)+'. Total estimado: '+core.money(core.totals(cart).subtotal+config.fee)+'.':'Costo del envío a confirmar.')+(config.zones?' Zonas: '+config.zones+'.':'')+(config.minimum?' Mínimo para delivery: '+core.money(config.minimum)+'.':''):'Retiro en '+window.BerrincheData.current.settings.address+'. Disponibilidad a confirmar.';
  }
  function renderCart(){
    const total=core.totals(cart);
    document.querySelector('#cart-empty').hidden=total.count>0;
    document.querySelector('#cart-filled').hidden=!total.count;
    document.querySelector('#cart-checkout').hidden=!total.count;
    document.querySelector('#checkout-submit').disabled=!total.count||!window.BerrincheData?.synced||!!core.orderProblem(cart,fulfillment())||checkingOut;
    linesContainer.innerHTML=total.lines.map(p=>`<article class="cart-line"><div class="cart-line-title"><h3>${escape(p.name)}</h3><strong>${core.money(p.lineTotal)}</strong></div><p class="unit-price">${core.money(p.price)} por unidad</p><div class="cart-line-actions">${controls(p,'cart')}<button type="button" class="remove-product" data-cart-action="remove" data-product="${p.id}" data-focus="cart:remove:${p.id}" aria-label="Eliminar ${escape(p.name)} del carrito">Eliminar</button></div></article>`).join('');
    document.querySelector('#cart-subtotal').textContent=core.money(total.subtotal);
    document.querySelector('.floating-cart').hidden=!total.count;
    document.querySelectorAll('[data-cart-count]').forEach(el=>{el.textContent=total.count;el.hidden=total.count===0});
    document.querySelectorAll('[data-cart-total]').forEach(el=>{el.textContent=total.count?core.money(total.subtotal):'';el.hidden=!total.count});
    document.querySelectorAll('.cart-open-button').forEach(el=>{el.setAttribute('aria-haspopup','dialog');el.setAttribute('aria-controls','cart-dialog');el.setAttribute('aria-expanded',String(dialog.open));if(el.classList.contains('header-order'))el.setAttribute('aria-label',`Abrir carrito, ${total.count} productos`)});
    const suggestions=[];
    if(total.lines.some(p=>p.category==='pizzas')){
      if(!total.lines.some(p=>p.category==='acompanar')){const p=core.products.find(p=>p.category==='acompanar'&&!core.isSoldOut(p));if(p)suggestions.push(p)}
      if(!total.lines.some(p=>p.category==='bebidas')){const p=core.products.find(p=>p.category==='bebidas'&&!core.isSoldOut(p));if(p)suggestions.push(p)}
    }
    document.querySelector('#cart-suggestions').innerHTML=suggestions.length?`<h3>¿Le sumamos algo?</h3>${suggestions.map(p=>`<div class="suggestion"><span>${escape(p.name)}<small>${core.money(p.price)}</small></span>${controls(p,'suggestion')}</div>`).join('')}`:'';
    updateShipping();
    document.dispatchEvent(new CustomEvent('cart:changed'));
    const problem=core.orderProblem(cart,fulfillment());
    document.querySelector('#checkout-submit').disabled=!total.count||!window.BerrincheData?.synced||!!problem;
    if(problem)document.querySelector('#shipping-note').textContent=problem;
  }
  function toast(message){
    const element=document.querySelector('#cart-toast');
    clearTimeout(toastTimer);element.textContent=message;element.hidden=false;
    toastTimer=setTimeout(()=>{element.hidden=true},2400);
  }
  function updateCart(next,announcement){
    const focusKey=document.activeElement?.dataset.focus;
    cart=core.normalizeCart(next);
    if(!cart.length){form.reset();nameField.setCustomValidity('');addressField.setCustomValidity('')}
    if(!window.BerrincheData?.previewMode){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,items:cart}))}catch{}}
    renderCatalog();renderCart();
    if(focusKey){const target=[...document.querySelectorAll('[data-focus]')].find(el=>el.dataset.focus===focusKey);if(target&&!target.disabled)target.focus({preventScroll:true});else if(dialog.open)document.querySelector('.cart-close').focus({preventScroll:true})}
    error.hidden=true;
    document.querySelector('#whatsapp-retry')?.remove();
    if(announcement)toast(announcement);
  }
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-cart-action]');
    if(action){
      if(checkingOut)return;
      const id=action.dataset.product;
      const p=core.products.find(p=>p.id===id);
      if(!p)return;
      if(action.dataset.cartAction==='plus'&&(core.isSoldOut(p)||window.BerrincheOperations.status(window.BerrincheData.current.settings).paused))return;
      const current=quantity(id);
      const next=action.dataset.cartAction==='remove'?0:current+(action.dataset.cartAction==='plus'?1:-1);
      updateCart(core.setQuantity(cart,id,next),action.dataset.cartAction==='plus'?`${p.name} en tu pedido · ${core.money(core.totals(core.setQuantity(cart,id,next)).subtotal)}`:next===0?`${p.name}: eliminado del pedido.`:'Cantidad actualizada.');
      if(action.dataset.cartAction==='plus'&&next<=core.MAX_QUANTITY)document.dispatchEvent(new CustomEvent('cart:added',{detail:{id}}));
    }
    if(event.target.closest('.cart-open-button')){
      if(!dialog.open){dialog.showModal();document.body.classList.add('cart-is-open');renderCart()}
    }
  });
  document.querySelector('.cart-close').addEventListener('click',()=>dialog.close());
  document.querySelector('.cart-browse').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.classList.remove('cart-is-open');document.querySelectorAll('.cart-open-button').forEach(b=>b.setAttribute('aria-expanded','false'))});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()});
  document.querySelector('#cart-clear').addEventListener('click',()=>{updateCart([],'Carrito vacío.');document.querySelector('.cart-close').focus()});
  document.querySelectorAll('.category-tab').forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.category;
    document.querySelectorAll('.category-tab').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
    document.querySelector('.diet-filter').hidden=category!=='pizzas';
    renderCatalog();
  }));
  document.querySelector('#only-veggie').addEventListener('change',renderCatalog);
  form.addEventListener('change',()=>{updateShipping();const problem=core.orderProblem(cart,fulfillment());document.querySelector('#checkout-submit').disabled=!core.totals(cart).count||!window.BerrincheData?.synced||!!problem;if(problem)document.querySelector('#shipping-note').textContent=problem;document.querySelector('#whatsapp-retry')?.remove()});
  form.addEventListener('input',()=>{nameField.setCustomValidity('');addressField.setCustomValidity('');error.hidden=true;document.querySelector('#whatsapp-retry')?.remove()});
  form.addEventListener('submit',async event=>{
    event.preventDefault();error.hidden=true;
    if(!window.BerrincheData?.synced){error.textContent='Esperá a que se actualicen los precios antes de enviar el pedido.';error.hidden=false;return}
    if(checkingOut)return;checkingOut=true;
    const previous=JSON.stringify(core.totals(cart).lines.map(p=>[p.id,p.quantity,p.price]));
    document.querySelector('#checkout-submit').setAttribute('aria-busy','true');
    try{
      error.textContent='Verificando precios y disponibilidad…';error.hidden=false;
      await window.BerrincheData.refresh();
      if(!window.BerrincheData.synced)throw new Error('No pudimos verificar el pedido. Reintentá en unos segundos.');
      if(previous!==JSON.stringify(core.totals(cart).lines.map(p=>[p.id,p.quantity,p.price])))throw new Error('La carta cambió. Revisá los productos y el subtotal antes de continuar.');
      error.hidden=true;
      await window.BerrincheCheckout.submit({items:cart.map(p=>({...p})),name:nameField.value,fulfillment:fulfillment(),address:addressField.value,notes:notesField.value});
    }catch(e){
      error.textContent=e.message;error.hidden=false;
      if(nameField.value.trim().length<2){nameField.setCustomValidity('Completá tu nombre.');nameField.reportValidity()}
      else if(addressField.required&&fulfillment()==='delivery'&&addressField.value.trim().length<5){addressField.setCustomValidity('Completá la dirección de entrega.');addressField.reportValidity()}
    }finally{checkingOut=false;document.querySelector('#checkout-submit').removeAttribute('aria-busy');renderCart()}
  });
  window.addEventListener('storage',event=>{if(!window.BerrincheData?.previewMode&&event.key===STORAGE_KEY){cart=core.readSavedCart(event.newValue);renderCatalog();renderCart()}});
  document.addEventListener('restaurant:updated',()=>{
    cart=core.normalizeCart(cart);
    renderCatalog();renderCart();
    if(!window.BerrincheData?.previewMode){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,items:cart}))}catch{}}
  });
  window.BerrincheCartUI={snapshot:()=>({items:cart.map(p=>({...p})),fulfillment:fulfillment()})};
  document.addEventListener('order:created',()=>{updateCart([]);form.reset()});
  renderCatalog();renderCart();
})();
