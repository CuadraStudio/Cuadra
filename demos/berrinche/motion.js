(function(){
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const active=new Set();
  function move(element,frames,options={}){
    if(!element||reduced.matches)return;
    const animation=element.animate(frames,{duration:520,easing:'cubic-bezier(.22,.61,.36,1)',...options});
    active.add(animation);animation.finished.then(()=>active.delete(animation)).catch(()=>active.delete(animation));
    return animation;
  }
  document.querySelectorAll('.hero-line').forEach((line,i)=>move(line,[{opacity:0,translate:'0 22px'},{opacity:1,translate:'0 0'}],{delay:i*90,duration:600,fill:'backwards'}));
  move(document.querySelector('.hero-pizza'),[{opacity:0,translate:'28px 20px',rotate:'7deg'},{opacity:1,translate:'0 0',rotate:'0deg'}],{delay:120,duration:800,fill:'backwards'});
  move(document.querySelector('.hero-actions'),[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}],{delay:280,duration:500,fill:'backwards'});
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    observer.unobserve(entry.target);
    move(entry.target,[{opacity:0,translate:'0 20px'},{opacity:1,translate:'0 0'}],{duration:650});
  }),{threshold:.12});
  document.querySelectorAll('.menu-invitation-copy,.invitation-art,.section-heading,.order-grid article,.local-photo,.neighborhood-copy,.location-grid>div,.questions>div,.final-call h2,.menu-page-intro').forEach(el=>observer.observe(el));
  document.querySelectorAll('.hero-dog,.brand-note img,.order-character img').forEach(el=>{
    let running=false;
    function hop(){
      if(running||reduced.matches)return;running=true;
      const animation=move(el,[{translate:'0 0',rotate:'0deg'},{translate:'0 -8px',rotate:'-4deg',offset:.42},{translate:'0 0',rotate:'0deg'}],{duration:480});
      animation?.finished.finally(()=>{running=false}).catch(()=>{});
    }
    el.addEventListener('pointerenter',hop);
    el.addEventListener('click',hop);
  });
  document.addEventListener('cart:added',event=>{
    const id=event.detail.id;
    const button=[...document.querySelectorAll('[data-focus]')].find(el=>el.dataset.focus===`menu:plus:${id}`);
    if(button&&!reduced.matches){
      button.textContent='✓';
      move(button,[{scale:'.85'},{scale:'1.12',offset:.55},{scale:'1'}],{duration:330});
      setTimeout(()=>{if(button.isConnected)button.textContent='+'},650);
    }
    document.querySelectorAll('[data-cart-count]').forEach(el=>move(el,[{scale:'1'},{scale:'1.25',offset:.45},{scale:'1'}],{duration:380}));
  });
  const heroStage=document.querySelector('.hero-stage');
  if(heroStage){
    const mobile=matchMedia('(max-width:700px)');let queued=false;
    function frameOnScroll(){
      queued=false;
      if(!mobile.matches||reduced.matches){heroStage.style.removeProperty('clip-path');return}
      const progress=Math.max(0,Math.min(1,(220-heroStage.getBoundingClientRect().top)/220));
      heroStage.style.clipPath=`inset(${-20+30*progress}% ${-12+17*progress}% ${-8+8*progress}% ${-12+26*progress}% round ${85*progress}px ${6*progress}px ${6*progress}px ${6*progress}px)`;
    }
    function scheduleFrame(){if(!queued){queued=true;requestAnimationFrame(frameOnScroll)}}
    addEventListener('scroll',scheduleFrame,{passive:true});addEventListener('resize',scheduleFrame);mobile.addEventListener('change',scheduleFrame);reduced.addEventListener('change',scheduleFrame);frameOnScroll();
  }
  reduced.addEventListener('change',()=>{if(reduced.matches)for(const animation of active)animation.finish()});
})();
