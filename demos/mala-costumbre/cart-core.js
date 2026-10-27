(() => {
  const catalog = Object.freeze([
    Object.freeze({id:'negro', name:'Negro', detail:'Tapas de cacao, dulce de leche y baño de chocolate negro', price:130, x:0}),
    Object.freeze({id:'blanco', name:'Blanco', detail:'Tapas de cacao, dulce de leche y baño de chocolate blanco', price:130, x:724}),
    Object.freeze({id:'mani', name:'Maní', detail:'Cobertura blanca con maní', price:160, x:1448})
  ]);
  function normalize(items) {
    if (!Array.isArray(items)) return [];
    const counts = new Map();
    for (const item of items) {
      if (!item || !catalog.some(p => p.id === item.id) || !Number.isSafeInteger(item.quantity) || item.quantity <= 0) continue;
      counts.set(item.id, Math.min(99, (counts.get(item.id) || 0) + item.quantity));
    }
    return catalog.filter(p => counts.has(p.id)).map(p => ({id:p.id, quantity:counts.get(p.id)}));
  }
  function totals(items) {
    const lines = normalize(items).map(item => {
      const product = catalog.find(p => p.id === item.id);
      return {...product, quantity:item.quantity, total:product.price * item.quantity};
    });
    return {lines, count:lines.reduce((sum,p) => sum+p.quantity,0), amount:lines.reduce((sum,p) => sum+p.total,0)};
  }
  function read(raw) {
    try { const saved = JSON.parse(raw); return saved?.version === 1 ? normalize(saved.items) : []; } catch { return []; }
  }
  const money = value => '$' + new Intl.NumberFormat('es-UY', {maximumFractionDigits:0}).format(value);
  globalThis.MalaCartCore = Object.freeze({catalog, normalize, totals, read, money});
})();
