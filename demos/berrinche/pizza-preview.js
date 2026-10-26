(function(){
  'use strict';
  let products=window.BerrincheCart.products.filter(p=>p.category==='pizzas');
  const catalog=document.querySelector('#catalog-products');
  const poster=document.querySelector('.flavor-poster');
  const photo=document.querySelector('#flavor-photo');
  const mobile=matchMedia('(max-width:1050px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const animations=new WeakMap();
  const loaded=new Map();
  let selected='clasica',request=0;
  function imageSource(id){return products.find(p=>p.id===id)?.image||'assets/pizza-otras-hd.webp'}
  function load(id){
    const key=imageSource(id);
    if(!loaded.has(key))loaded.set(key,new Promise((resolve,reject)=>{
      const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{loaded.delete(key);reject(new Error('image'))};img.src=key;
    }));
    return loaded.get(key);
  }
  function slide(container,opening){
    animations.get(container)?.cancel();
    if(reduced.matches){if(!opening)container.remove();return}
    const height=container.getBoundingClientRect().height;
    container.style.overflow='hidden';
    const style=getComputedStyle(container);
    const expanded={height:height+'px',opacity:1,transform:'translateY(0)',paddingTop:style.paddingTop,paddingBottom:style.paddingBottom,borderTopWidth:style.borderTopWidth,borderBottomWidth:style.borderBottomWidth,marginTop:style.marginTop};
    const collapsed={height:'0px',opacity:0,transform:'translateY(-8px)',paddingTop:'0px',paddingBottom:'0px',borderTopWidth:'0px',borderBottomWidth:'0px',marginTop:'0px'};
    const animation=container.animate(opening?[collapsed,expanded]:[expanded,collapsed],
      {duration:340,easing:'cubic-bezier(.22,.61,.36,1)',fill:'none'});
    animations.set(container,animation);
    animation.finished.then(()=>{if(!opening)container.remove();else container.style.overflow='';animations.delete(container)}).catch(()=>{});
  }
  function sync(animate=false){
    const rows=[...catalog.querySelectorAll('[data-product-row]')];
    const visible=rows.map(row=>row.dataset.productRow);
    poster.hidden=!visible.some(id=>products.some(p=>p.id===id));
    if(!poster.hidden&&!visible.includes(selected)){show(visible[0]);return}
    rows.forEach(row=>{
      const active=row.dataset.productRow===selected;
      row.classList.toggle('preview-active',active);
      row.querySelector('[data-preview]')?.setAttribute('aria-pressed',String(active));
      const existing=row.querySelector('.product-preview-inline');
      if(existing&&(!active||!mobile.matches)){
        existing.setAttribute('aria-hidden','true');
        if(animate&&mobile.matches)slide(existing,false);else existing.remove();
      }
      if(active&&mobile.matches&&existing){
        animations.get(existing)?.cancel();animations.delete(existing);
        existing.removeAttribute('aria-hidden');existing.style.overflow='';
      }
      if(active&&mobile.matches&&!existing&&products.some(p=>p.id===selected)){
        const container=document.createElement('div');container.className='product-preview-inline';
        const img=document.createElement('img');img.src=imageSource(selected);img.alt=`Pizza ${products.find(p=>p.id===selected).name}`;img.width=1254;img.height=1254;
        const note=document.createElement('small');note.textContent='Imagen ilustrativa basada en nuestro catálogo.';
        container.append(img,note);row.append(container);
        if(animate)slide(container,true);
      }
    });
  }
  async function show(id){
    const product=products.find(p=>p.id===id);if(!product)return;
    if(selected!==id){selected=id;sync(true)}
    const ticket=++request;
    try{
      const img=await load(id);if(ticket!==request)return;
      await img.decode().catch(()=>{});if(ticket!==request)return;
      const changing=photo.src!==img.src;
      if(changing&&!mobile.matches&&!reduced.matches){
        photo.parentElement.querySelectorAll('.flavor-outgoing').forEach(el=>el.remove());
        photo.getAnimations().forEach(animation=>animation.cancel());
        const previous=photo.cloneNode();previous.removeAttribute('id');previous.alt='';previous.setAttribute('aria-hidden','true');previous.classList.add('flavor-outgoing');photo.after(previous);
        previous.animate([{opacity:1},{opacity:0}],{duration:240,easing:'ease-out'}).finished.then(()=>previous.remove()).catch(()=>previous.remove());
        photo.animate([{opacity:0},{opacity:1}],{duration:240,easing:'ease-out'});
      }
      photo.src=img.src;photo.alt=`Pizza ${product.name}`;
      document.querySelector('#flavor-name').textContent=product.name;
      document.querySelector('#flavor-description').textContent=product.description;
    }catch{/* Keep the last successfully loaded photograph. */}
  }
  catalog.addEventListener('pointerover',event=>{
    if(event.pointerType==='touch'||mobile.matches)return;
    const row=event.target.closest('[data-product-row]');
    if(row&&!row.contains(event.relatedTarget)&&row.dataset.productRow!==selected)show(row.dataset.productRow);
  });
  catalog.addEventListener('focusin',event=>{if(mobile.matches&&!event.target.closest('[data-preview]'))return;const row=event.target.closest('[data-product-row]');if(row&&row.dataset.productRow!==selected)show(row.dataset.productRow)});
  catalog.addEventListener('click',event=>{const button=event.target.closest('[data-preview]');if(button)show(button.dataset.preview)});
  document.addEventListener('catalog:render',()=>{products=window.BerrincheCart.products.filter(p=>p.category==='pizzas');sync();if(products.some(p=>p.id===selected))show(selected)});
  mobile.addEventListener('change',()=>sync());
  sync();
  // Variants load on selection; do not download the entire menu on entry.
})();
