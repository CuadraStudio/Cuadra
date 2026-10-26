(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BerrincheOperations=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function local(now=new Date()){
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Montevideo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
    const date=`${parts.year}-${parts.month}-${parts.day}`;const utc=new Date(date+'T12:00:00Z');
    return {date,day:utc.getUTCDay(),minutes:Number(parts.hour)*60+Number(parts.minute)};
  }
  function previous(date){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10)}
  function serviceDate(now){const value=local(now);return value.minutes<360?previous(value.date):value.date}
  function soldOut(product,now){return !!product.soldOutDate&&product.soldOutDate===serviceDate(now)}
  const minute=time=>Number(time.slice(0,2))*60+Number(time.slice(3));
  function status(settings,now){
    const value=local(now);const special=(settings.specialHours||[]).find(d=>d.date===value.date);
    const today=special||(settings.schedule||[]).find(d=>d.day===value.day)||{closed:true};
    const yesterday=(settings.specialHours||[]).find(d=>d.date===previous(value.date))||(settings.schedule||[]).find(d=>d.day===(value.day+6)%7)||{closed:true};
    const tail=!yesterday.closed&&minute(yesterday.close)<minute(yesterday.open)&&value.minutes<minute(yesterday.close);
    const open=!today.closed&&(minute(today.close)>minute(today.open)?value.minutes>=minute(today.open)&&value.minutes<minute(today.close):value.minutes>=minute(today.open));
    const paused=!!settings.ordersPaused||!!(special&&special.closed);
    const message=settings.ordersPaused?(settings.pauseMessage||'Pedidos pausados por el momento.'):(special&&special.closed)?(special.note||'Hoy el local permanece cerrado.'):(tail||open)?'Estamos abiertos.':today.closed?'Hoy no abrimos.':'Hoy abrimos de '+today.open+' a '+today.close+'.';
    return {paused,open:!paused&&(tail||open),message,today:special?'Horario especial: '+(today.closed?'cerrado':today.open+' a '+today.close):today.closed?'Hoy cerrado':'Hoy: '+today.open+' a '+today.close};
  }
  return {local,previous,serviceDate,soldOut,status};
});
