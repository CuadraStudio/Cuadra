const iconPaths={bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/>',pizza:'<path d="M3 20 8 3c6 1 11 6 13 12L3 20Z"/><path d="M8 3 7 6c5 1 9 5 11 10l3-1"/><circle cx="9" cy="12" r="1.5"/><circle cx="13" cy="16" r="1"/>',scooter:'<circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M5 18h9l4-11h-4m3-4h3l1 12M4 9h7l2 6H5"/>',heart:'<path d="M12 21S2 15 2 8c0-6 8-7 10-1 2-6 10-5 10 1 0 7-10 13-10 13Z"/>',pin:'<path d="M12 22s8-10 8-15a8 8 0 0 0-16 0c0 5 8 15 8 15Z"/><circle cx="12" cy="8" r="2.5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v7h5"/>',instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7"/>',whatsapp:'<path d="M4 19 2 22l5-1a10 10 0 1 0-3-2Z"/><path d="m8 6-1 3c1 4 4 7 8 8l3-2-3-2-2 1-3-3 1-2-3-3Z"/>'};
document.querySelectorAll('[data-icon]').forEach(el=>{el.setAttribute('aria-hidden','true');el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconPaths[el.dataset.icon]||''}</svg>`});
const toggle=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú')}
toggle.addEventListener('click',()=>{const open=navigation.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú')});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.classList.contains('open')){closeMenu();toggle.focus()}});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu()});
const desktop=window.matchMedia('(min-width:701px)');
desktop.addEventListener('change',e=>{if(e.matches)closeMenu()});
