(function(){
 'use strict';
 const bar=document.createElement('aside');bar.className='cuadra-demo-bar';bar.setAttribute('aria-label','Demostración de Cuadra');
 const label=document.createElement('span');label.textContent='DEMO DE CUADRA · Sin pedidos ni pagos reales';
 const link=document.createElement('a');link.href='/contacto.html';link.textContent='Quiero una web para mi negocio ↗';bar.append(label,link);document.body.prepend(bar);
 const size=()=>document.documentElement.style.setProperty('--demo-bar-height',bar.offsetHeight+'px');size();if(window.ResizeObserver)new ResizeObserver(size).observe(bar);
 function notice(){let n=document.querySelector('#cuadra-demo-notice');if(!n){n=document.createElement('p');n.id='cuadra-demo-notice';n.setAttribute('role','status');bar.append(n)}n.textContent='Es una demostración. No se envió ningún pedido ni mensaje.'}
 document.addEventListener('click',function(e){const a=e.target.closest('a');if(a&&/wa\.me|api\.whatsapp|admin(?:\.html)?|seguimiento(?:\.html)?/.test(a.getAttribute('href')||'')){e.preventDefault();e.stopImmediatePropagation();notice()}},true);
 document.addEventListener('submit',function(e){if(e.target.id!=='order-form'){e.preventDefault();e.stopImmediatePropagation();notice()}},true);
 window.BerrincheCheckout={submit:async function(){const n=document.querySelector('#order-quote');if(n){n.textContent='Simulación completada. El carrito funciona, pero no se enviaron datos al local ni se realizó un cobro.';n.setAttribute('role','status')}notice()}};
 const form=document.querySelector('#order-form');
 const legal=document.querySelector('#order-legal');if(legal){legal.required=false;legal.closest('label').hidden=true}
 document.querySelector('.coupon-entry')?.setAttribute('hidden','');
 if(form){const samples={'order-name':'Cliente de demostración','order-phone':'099000000','order-address':'Dirección de ejemplo 123','order-notes':'Pedido de demostración'};for(const [id,value]of Object.entries(samples)){const el=document.getElementById(id);if(el){el.value=value;el.readOnly=true}}}
 for(const id of ['gps-use','gps-remove','apply-coupon']){const b=document.getElementById(id);if(b){b.disabled=true;b.title='No disponible en esta demostración'}}
 const button=document.querySelector('#checkout-label');if(button)button.textContent='Simular pedido';
 document.querySelectorAll('.cart-checkout small').forEach(el=>{el.textContent='Demostración local: no se envían datos ni se crea un pedido real.'});
})();
