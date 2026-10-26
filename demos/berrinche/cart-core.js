(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.BerrincheCart=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  let PHONE='59898427816';
  let pickupAddress='Av. Mariscal Francisco Solano López 1652, Montevideo';
  const operations=typeof module==='object'&&module.exports?require('./operations.js'):globalThis.BerrincheOperations;
  let settings={};
  const MAX_QUANTITY=99;
  let products=Object.freeze([
    {id:'clasica',name:'Clásica',category:'pizzas',vegetarian:true,price:610,description:'Marinara, tres quesos y chimi pizzero.'},
    {id:'pepperoni',name:'Pepperoni',category:'pizzas',vegetarian:false,price:700,description:'Pepperoni y quesos. Miel cítrica especiada aparte.'},
    {id:'panceta',name:'Panceta y cebolla caramelizada',category:'pizzas',vegetarian:false,price:700,description:'Panceta ahumada, cebolla caramelizada, quesos y ciboulette.'},
    {id:'mortadella',name:'Mortadella',category:'pizzas',vegetarian:false,price:700,description:'Mortadella, pesto, ricota, cajú y quesos.'},
    {id:'capresse',name:'Capresse',category:'pizzas',vegetarian:true,price:700,description:'Tomates secos, pesto, ricotta batida y quesos.'},
    {id:'bondiola',name:'Bondiola',category:'pizzas',vegetarian:false,price:700,description:'Bondiola, rúcula, Dijon y quesos.'},
    {id:'aceitunas',name:'Aceitunas',category:'pizzas',vegetarian:true,price:700,description:'Olivas verdes y negras, especias cítricas y quesos.'},
    {id:'fugazzeta',name:'Fugazzeta rellena',category:'pizzas',vegetarian:true,price:920,description:'Mix de quesos, cebolla blanca y colorada.'},
    {id:'faina',name:'Fainá',category:'acompanar',vegetarian:true,price:190,description:'Clásico, sin vueltas.'},
    {id:'agua',name:'Agua',category:'bebidas',price:100,description:''},
    {id:'guarana',name:'Guaraná Antártica Zero',category:'bebidas',price:120,description:''},
    {id:'cerveza',name:'Estrella Galicia',category:'bebidas',price:160,description:'Cerveza en lata, 355 ml.'},
    {id:'sprite',name:'Sprite',category:'bebidas',price:130,description:''}
  ].map(Object.freeze));
  let byId=new Map(products.map(p=>[p.id,p]));
  function setRestaurant(data){
    if(!data||!Array.isArray(data.products)||!data.settings)throw new Error('Carta inválida.');
    const next=data.products.filter(p=>p.active!==false).map(p=>({...p}));
    if(new Set(next.map(p=>p.id)).size!==next.length||next.some(p=>typeof p.id!=='string'||typeof p.name!=='string'||!Number.isSafeInteger(p.price)||p.price<1))throw new Error('Carta inválida.');
    products=Object.freeze(next.map(Object.freeze));byId=new Map(products.map(p=>[p.id,p]));
    if(/^\d{8,15}$/.test(data.settings.phone))PHONE=data.settings.phone;
    settings=data.settings;
    pickupAddress=data.settings.address+', '+data.settings.city;
  }
  function normalizeCart(raw){
    if(!Array.isArray(raw))return [];
    const quantities=new Map();
    for(const item of raw){
      if(!item||!byId.has(item.id)||!Number.isSafeInteger(item.quantity)||item.quantity<1)continue;
      quantities.set(item.id,Math.min(MAX_QUANTITY,(quantities.get(item.id)||0)+Math.min(item.quantity,MAX_QUANTITY)));
    }
    return [...quantities].map(([id,quantity])=>({id,quantity}));
  }
  function readSavedCart(serialized){
    try{const saved=JSON.parse(serialized);return saved&&saved.version===1?normalizeCart(saved.items):[]}catch{return []}
  }
  function setQuantity(cart,id,quantity){
    const clean=normalizeCart(cart);
    if(!byId.has(id)||!Number.isSafeInteger(quantity)||quantity<0||quantity>MAX_QUANTITY)return clean;
    const existing=clean.find(item=>item.id===id);
    if(quantity>(existing?.quantity||0)&&(operations.soldOut(byId.get(id))||operations.status(settings).paused))return clean;
    if(!quantity)return clean.filter(item=>item.id!==id);
    if(existing)existing.quantity=quantity;
    else clean.push({id,quantity});
    return clean;
  }
  function totals(cart){
    const lines=normalizeCart(cart).map(item=>({...byId.get(item.id),quantity:item.quantity,lineTotal:byId.get(item.id).price*item.quantity}));
    return {lines,count:lines.reduce((n,p)=>n+p.quantity,0),subtotal:lines.reduce((n,p)=>n+p.lineTotal,0)};
  }
  function orderProblem(cart,fulfillment){
    if(operations.status(settings).paused)return operations.status(settings).message;
    if(totals(cart).lines.some(p=>operations.soldOut(p)))return 'Hay productos agotados en tu pedido. Quitalos para continuar.';
    if(fulfillment==='delivery'){
      if(settings.delivery?.enabled===false)return 'El delivery está deshabilitado. Elegí retiro.';
      if(totals(cart).subtotal<(settings.delivery?.minimum||0))return 'El mínimo para delivery es '+money(settings.delivery.minimum)+'.';
    }
    return '';
  }
  function money(value){return '$U '+new Intl.NumberFormat('es-UY',{maximumFractionDigits:0}).format(value)}
  function orderMessage(cart,details){
    const total=totals(cart);
    if(!total.count)throw new Error('Agregá algún producto antes de continuar.');
    const problem=orderProblem(cart,details.fulfillment);if(problem)throw new Error(problem);
    const name=String(details.name||'').trim();
    const address=String(details.address||'').trim();
    const notes=String(details.notes||'').trim();
    if(name.length<2||name.length>80)throw new Error('Completá tu nombre (entre 2 y 80 caracteres).');
    if(!['pickup','delivery'].includes(details.fulfillment))throw new Error('Elegí retiro o delivery.');
    if(details.fulfillment==='delivery'&&(address.length<5||address.length>180))throw new Error('Completá la dirección de entrega.');
    if(notes.length>400)throw new Error('Las observaciones pueden tener hasta 400 caracteres.');
    const lines=['¡Hola, Berrinche! 🍕','Quiero hacer este pedido:','',...total.lines.map(p=>`${p.quantity} × ${p.name} — ${money(p.lineTotal)}`),'',`Subtotal de productos: ${money(total.subtotal)}`,'',`Nombre: ${name}`,`Modalidad: ${details.fulfillment==='delivery'?'Delivery':'Retiro en el local'}`];
    if(details.fulfillment==='delivery')lines.push(`Dirección: ${address}`);
    else lines.push('Retiro en '+pickupAddress+'.');
    if(details.fulfillment==='delivery'&&Number.isSafeInteger(settings.delivery?.fee))lines.push('Envío: '+money(settings.delivery.fee),'Total estimado con envío: '+money(total.subtotal+settings.delivery.fee));
    if(notes)lines.push(`Observaciones: ${notes}`);
    lines.push('',details.fulfillment==='delivery'?'Envío y disponibilidad a confirmar.':'Disponibilidad a confirmar.','¿Me confirman el total y el tiempo estimado?');
    return lines.join('\n');
  }
  function whatsappUrl(cart,details){return 'https://wa.me/'+PHONE+'?text='+encodeURIComponent(orderMessage(cart,details))}
  return Object.freeze({get products(){return products},setRestaurant,orderProblem,isSoldOut:operations.soldOut,MAX_QUANTITY,normalizeCart,readSavedCart,setQuantity,totals,money,orderMessage,whatsappUrl});
});
