(function(){
  'use strict';
  const endpoint='';
  const initial=window.BERRINCHE_INITIAL;
  const previewMode=false;
  const state=window.BerrincheData={current:initial,synced:false,endpoint,ready:null,previewMode};
  const days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  function hours(s){
    const open=s.schedule.filter(d=>!d.closed).sort((a,b)=>a.day-b.day);
    if(!open.length)return 'Sin atención esta semana';
    const common=open.every(d=>d.open===open[0].open&&d.close===open[0].close);
    if(open.map(d=>d.day).join(',')==='0,3,4,5,6'&&common)return `Miércoles a domingo · ${open[0].open} a ${open[0].close}`;
    return open.map(d=>`${days[d.day]} ${d.open}–${d.close}`).join(' · ');
  }
  function apply(data){
    const s=data.settings;state.current=data;
    const operation=window.BerrincheOperations.status(s);
    const operationNote=document.querySelector('#operation-status');if(operationNote){operationNote.replaceChildren();const led=document.createElement('span');led.className='status-led';led.setAttribute('aria-hidden','true');const label=document.createElement('strong');label.textContent=operation.open?'Abierto':'Cerrado';operationNote.append(led,label);if(operation.paused){const detail=document.createElement('span');detail.textContent=operation.message;operationNote.append(detail)}operationNote.classList.toggle('is-open',operation.open);operationNote.classList.toggle('paused',operation.paused)}
    window.BerrincheCart?.setRestaurant(data);
    document.querySelectorAll('[data-local-city]').forEach(el=>{el.textContent=s.city+', Uruguay.'});
    document.querySelectorAll('[data-local-address]').forEach(el=>{el.textContent=s.address+', '+s.city+', Uruguay.'});
    document.querySelectorAll('[data-local-street]').forEach(el=>{el.textContent=s.address});
    document.querySelectorAll('[data-local-hours]').forEach(el=>{el.textContent=hours(s)});
    document.querySelectorAll('[data-local-servings]').forEach(el=>{el.textContent=s.servings});
    document.querySelectorAll('[data-local-box]').forEach(el=>{el.textContent=s.boxSize});
    document.querySelectorAll('a[href*="wa.me/"]').forEach(el=>{const url=new URL(el.href);url.pathname='/'+s.phone;el.href=url.href;if(/^\d[\d\s]+ ↗$/.test(el.textContent.trim()))el.textContent='+'+s.phone+' ↗'});
    document.querySelectorAll('a[href*="instagram.com/"]').forEach(el=>{el.href=s.instagram});
    const description=document.querySelector('meta[name=description]');if(description)description.content=`Pizza al molde estilo Detroit. ${s.name}, ${s.address}, ${s.city}. Retiro y delivery. ${hours(s)}.`;
    const maps='https://maps.app.goo.gl/kuNvscByMGkuN7sY7';
    document.querySelectorAll('a[href*="google.com/maps/"],a[href*="maps.app.goo.gl/"]').forEach(el=>{el.href=maps});
    const frame=document.querySelector('.local-map');
    if(frame){const next=`https://maps.google.com/maps?q=${encodeURIComponent('Pizzeria Berrinche '+s.address+' '+s.city)}&z=16&output=embed`;if(frame.getAttribute('src')!==next)frame.src=next;frame.title='Ubicación de '+s.name+': '+s.address}
    const schema=document.querySelector('script[type="application/ld+json"]');
    if(schema){try{const doc=JSON.parse(schema.textContent);if(doc['@type']==='Restaurant'){doc.name=s.name;doc.telephone='+'+s.phone;doc.address={...doc.address,streetAddress:s.address,addressLocality:s.city,postalCode:s.postalCode};doc.geo={"@type":"GeoCoordinates",latitude:s.latitude,longitude:s.longitude};doc.openingHoursSpecification=s.schedule.filter(d=>!d.closed).map(d=>({'@type':'OpeningHoursSpecification',dayOfWeek:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.day],opens:d.open,closes:d.close}));doc.hasMap=maps;schema.textContent=JSON.stringify(doc)}}catch{}}
    document.dispatchEvent(new CustomEvent('restaurant:updated'));
  }
  apply(initial);
  state.synced=true;
  state.refresh=async()=>state.current;
  state.ready=Promise.resolve(state.current);
  const note=document.querySelector('#live-catalog-notice');
  if(note)note.textContent='DEMO · Carta de ejemplo. No se consulta disponibilidad ni se envían pedidos.';
})();
