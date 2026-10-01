/* Cebador — catálogo de demostración (negocio ficticio) y utilidades.
   Productos, variantes (opciones) y stock simulado, todo en este archivo. */
(function () {
  'use strict';

  var CATEGORIAS = [
    { id: 'mates', nombre: 'Mates' },
    { id: 'bombillas', nombre: 'Bombillas' },
    { id: 'termos', nombre: 'Termos' },
    { id: 'yerba', nombre: 'Yerba' },
    { id: 'bolsos', nombre: 'Bolsos' },
    { id: 'accesorios', nombre: 'Accesorios' },
    { id: 'kits', nombre: 'Kits' }
  ];

  function cuerpo(id, nombre, valores) { return { id: id, nombre: nombre, rol: 'cuerpo', valores: valores }; }

  var PRODUCTOS = [
    {
      id: 'mate-calabaza', cat: 'mates', arte: 'mate', fondo: 'sol', precio: 1490,
      nombre: 'Mate de calabaza curado',
      corto: 'Curado a mano, boca ancha.',
      desc: 'Calabaza seleccionada y curada con yerba y agua caliente durante tres días. Boca ancha, buena para cebar sin apuro. Viene con la primera cebada lista.',
      detalles: ['Calabaza natural, altura 9 cm', 'Virola desmontable', 'Se lava solo con agua tibia', 'Cada pieza es única: el color puede variar'],
      opciones: [
        cuerpo('forro', 'Forro', [
          { id: 'natural', label: 'Sin forro', c: '#C9A45C' },
          { id: 'negro', label: 'Cuero negro', c: '#26221F' },
          { id: 'marron', label: 'Cuero marrón', c: '#7B4A2A' }
        ]),
        { id: 'virola', nombre: 'Virola', rol: 'borde', valores: [
          { id: 'alpaca', label: 'Alpaca', c: '#C9CED3' },
          { id: 'bronce', label: 'Bronce', c: '#B98A3E', extra: 150 }
        ] }
      ]
    },
    {
      id: 'mate-camionero', cat: 'mates', arte: 'mate', fondo: 'cobalto', precio: 1290,
      nombre: 'Mate camionero de acero',
      corto: 'Doble pared, no pierde calor.',
      desc: 'Acero inoxidable de doble pared con funda de goma. Aguanta golpes, se lava en el lavaplatos y mantiene el agua caliente más tiempo.',
      detalles: ['Acero inoxidable 304', 'Capacidad 200 ml', 'Base antideslizante', 'Garantía de 12 meses'],
      opciones: [cuerpo('color', 'Color', [
        { id: 'negro', label: 'Negro', c: '#1F2430' },
        { id: 'verde', label: 'Verde', c: '#2F7D4F' },
        { id: 'celeste', label: 'Celeste', c: '#5BA8E0' },
        { id: 'rojo', label: 'Rojo', c: '#D9392B' }
      ])]
    },
    {
      id: 'mate-imperial', cat: 'mates', arte: 'mate', fondo: 'yerba', precio: 1990,
      nombre: 'Mate imperial de madera',
      corto: 'Torneado en una sola pieza.',
      desc: 'Torneado en madera maciza y sellado con cera natural. Boca generosa y pared gruesa para que se mantenga firme en la mano.',
      detalles: ['Madera maciza, altura 10 cm', 'Virola de alpaca o bronce', 'Sellado con cera de abejas', 'Se cura antes del primer uso'],
      opciones: [
        cuerpo('madera', 'Madera', [
          { id: 'algarrobo', label: 'Algarrobo', c: '#A8743A' },
          { id: 'nogal', label: 'Nogal', c: '#5A3A24' }
        ]),
        { id: 'virola', nombre: 'Virola', rol: 'borde', valores: [
          { id: 'alpaca', label: 'Alpaca', c: '#C9CED3' },
          { id: 'bronce', label: 'Bronce', c: '#B98A3E' }
        ] }
      ]
    },
    {
      id: 'bombilla-pico', cat: 'bombillas', arte: 'bombilla', fondo: 'tomate', precio: 890,
      nombre: 'Bombilla pico de loro',
      corto: 'Filtro fino, no se tapa.',
      desc: 'Pico curvo, filtro de malla fina y caño de una sola pieza. Se desarma para limpiarla bien.',
      detalles: ['Caño de 8 mm', 'Filtro desmontable', 'Se limpia con cepillo', 'Apta para lavaplatos'],
      opciones: [
        { id: 'material', nombre: 'Material', rol: 'acero', valores: [
          { id: 'acero', label: 'Acero', c: '#D5DAE0' },
          { id: 'alpaca', label: 'Alpaca', c: '#C9CED3', extra: 300 },
          { id: 'dorado', label: 'Acero dorado', c: '#D6A93C', extra: 200 }
        ] },
        { id: 'largo', nombre: 'Largo', valores: [
          { id: '16', label: '16 cm' },
          { id: '19', label: '19 cm' }
        ] }
      ]
    },
    {
      id: 'bombilla-resorte', cat: 'bombillas', arte: 'bombilla', fondo: 'cobalto', precio: 420,
      nombre: 'Bombilla de resorte',
      corto: 'La de siempre, reforzada.',
      desc: 'Filtro de resorte que no se desarma y se limpia pasándola por agua. Para el mate de todos los días.',
      detalles: ['Acero inoxidable', 'Filtro de resorte fijo', 'Se limpia con agua caliente'],
      opciones: [{ id: 'largo', nombre: 'Largo', valores: [{ id: '16', label: '16 cm' }, { id: '19', label: '19 cm' }] }]
    },
    {
      id: 'termo-acero', cat: 'termos', arte: 'termo', fondo: 'yerba', precio: 2490,
      nombre: 'Termo de acero con pico cebador',
      corto: 'Mantiene el agua 24 horas.',
      desc: 'Doble pared al vacío, pico cebador que no gotea y tapa-vaso. El agua sigue caliente al día siguiente.',
      detalles: ['Acero inoxidable al vacío', 'Pico cebador antigoteo', 'Mantiene caliente 24 h', 'Garantía de 12 meses'],
      opciones: [
        cuerpo('color', 'Color', [
          { id: 'negro', label: 'Negro', c: '#20242C' },
          { id: 'verde', label: 'Verde militar', c: '#4B5A3C' },
          { id: 'celeste', label: 'Celeste', c: '#6BB4E6' },
          { id: 'blanco', label: 'Blanco', c: '#ECEEF0' }
        ]),
        { id: 'capacidad', nombre: 'Capacidad', valores: [
          { id: '1', label: '1 litro' },
          { id: '13', label: '1,3 litros', extra: 500 }
        ] }
      ]
    },
    {
      id: 'yerba-artesanal', cat: 'yerba', arte: 'yerba', fondo: 'sol', precio: 290,
      nombre: 'Yerba artesanal Cebador',
      corto: 'Estacionada 12 meses.',
      desc: 'Yerba canchada y estacionada un año, molida gruesa. Sin polvo de más y con espuma firme.',
      detalles: ['Estacionamiento natural de 12 meses', 'Molienda gruesa', 'Paquete reutilizable con cierre'],
      opciones: [
        cuerpo('tipo', 'Tipo', [
          { id: 'suave', label: 'Suave', c: '#6A9B4D' },
          { id: 'intensa', label: 'Intensa', c: '#2F6B46' },
          { id: 'palo', label: 'Con palo', c: '#A57C2E' }
        ]),
        { id: 'peso', nombre: 'Peso', valores: [
          { id: '500', label: '500 g' },
          { id: '1000', label: '1 kg', extra: 230 }
        ] }
      ]
    },
    {
      id: 'bolso-matero', cat: 'bolsos', arte: 'bolso', fondo: 'tomate', precio: 2290,
      nombre: 'Bolso matero de lona',
      corto: 'Lugar para termo, mate y yerba.',
      desc: 'Lona encerada con base rígida y bolsillo térmico para el termo. Cabe todo lo necesario y una campera.',
      detalles: ['Lona encerada resistente al agua', 'Bolsillo térmico para termo de hasta 1,3 L', 'Correa regulable', 'Base rígida'],
      opciones: [cuerpo('color', 'Color', [
        { id: 'negro', label: 'Negro', c: '#22252B' },
        { id: 'verde', label: 'Verde', c: '#3E6B4A' },
        { id: 'arena', label: 'Arena', c: '#CBB38B' }
      ])]
    },
    {
      id: 'set-yerbera', cat: 'accesorios', arte: 'set', fondo: 'cobalto', precio: 790,
      nombre: 'Set yerbera y azucarera',
      corto: 'Dos frascos con tapa hermética.',
      desc: 'Frascos de cerámica esmaltada con tapa de goma. La yerba y el azúcar quedan secos, y quedan lindos en la mesada.',
      detalles: ['Cerámica esmaltada', 'Tapa de goma hermética', 'Yerbera 600 ml, azucarera 400 ml'],
      opciones: [cuerpo('color', 'Color', [
        { id: 'blanco', label: 'Blanco', c: '#EDEFF2' },
        { id: 'negro', label: 'Negro', c: '#272B33' }
      ])]
    },
    {
      id: 'pava-electrica', cat: 'accesorios', arte: 'pava', fondo: 'sol', precio: 1690,
      nombre: 'Pava eléctrica con corte a 80 °',
      corto: 'Agua a la temperatura justa.',
      desc: 'Calienta hasta 80° y corta sola, para no quemar la yerba. Base giratoria y apagado automático.',
      detalles: ['Capacidad 1 litro', 'Corte a 80 °C', 'Base giratoria 360°', '1500 W'],
      opciones: [cuerpo('color', 'Terminación', [
        { id: 'negro', label: 'Negro', c: '#22262E' },
        { id: 'cobre', label: 'Cobre', c: '#B76E3A' },
        { id: 'acero', label: 'Acero', c: '#C9CED3' }
      ])]
    },
    {
      id: 'funda-mate', cat: 'accesorios', arte: 'funda', fondo: 'yerba', precio: 390,
      nombre: 'Funda de neoprene para mate',
      corto: 'Para llevarlo sin golpes.',
      desc: 'Neoprene de 5 mm con cierre. Protege el mate y la bombilla dentro del bolso.',
      detalles: ['Neoprene de 5 mm', 'Cierre de cordón', 'Entra mate de hasta 10 cm'],
      opciones: [cuerpo('color', 'Color', [
        { id: 'negro', label: 'Negro', c: '#1F2430' },
        { id: 'verde', label: 'Verde', c: '#2F7D4F' },
        { id: 'celeste', label: 'Celeste', c: '#5BA8E0' }
      ])]
    },
    {
      id: 'kit-inicio', cat: 'kits', arte: 'mate', fondo: 'tomate', precio: 2290,
      nombre: 'Kit del cebador novato',
      corto: 'Mate, bombilla y yerba de 500 g.',
      desc: 'Todo para empezar: mate de acero, bombilla de resorte y un paquete de yerba artesanal. Llega en caja, listo para regalar.',
      detalles: ['Mate camionero de acero', 'Bombilla de resorte de 16 cm', 'Yerba artesanal suave de 500 g', 'Caja de regalo'],
      opciones: [cuerpo('color', 'Color del mate', [
        { id: 'negro', label: 'Negro', c: '#1F2430' },
        { id: 'verde', label: 'Verde', c: '#2F7D4F' },
        { id: 'celeste', label: 'Celeste', c: '#5BA8E0' }
      ])]
    }
  ];

  var ENVIOS = [
    { id: 'retiro', nombre: 'Retiro en el local', detalle: 'Cordón, de martes a sábado', precio: 0 },
    { id: 'montevideo', nombre: 'Envío en Montevideo', detalle: 'En 24 a 48 horas', precio: 180 },
    { id: 'interior', nombre: 'Envío al interior', detalle: 'Por correo, en 3 a 5 días', precio: 320 }
  ];

  function hash(texto) {
    var h = 2166136261;
    for (var i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function porId(id) {
    for (var i = 0; i < PRODUCTOS.length; i++) if (PRODUCTOS[i].id === id) return PRODUCTOS[i];
    return null;
  }

  // Selección por defecto: primera variante con stock.
  function combinaciones(p) {
    var out = [[]];
    p.opciones.forEach(function (op) {
      var next = [];
      out.forEach(function (base) { op.valores.forEach(function (v) { next.push(base.concat(v.id)); }); });
      out = next;
    });
    return out;
  }

  function claveDe(p, sel) { return p.opciones.map(function (op) { return sel[op.id]; }).join('|'); }

  // Stock simulado y estable por variante: algunas agotadas, otras con pocas unidades.
  function stock(p, sel) {
    var n = hash(p.id + '#' + claveDe(p, sel)) % 11;
    if (n < 2) return 0;
    if (n < 5) return n - 1;
    return n + 1;
  }

  function seleccionInicial(p) {
    var combos = combinaciones(p);
    for (var i = 0; i < combos.length; i++) {
      var sel = {};
      p.opciones.forEach(function (op, k) { sel[op.id] = combos[i][k]; });
      if (stock(p, sel) > 0) return sel;
    }
    var s0 = {};
    p.opciones.forEach(function (op) { s0[op.id] = op.valores[0].id; });
    return s0;
  }

  function valor(op, id) {
    for (var i = 0; i < op.valores.length; i++) if (op.valores[i].id === id) return op.valores[i];
    return op.valores[0];
  }

  function precioDe(p, sel) {
    var total = p.precio;
    p.opciones.forEach(function (op) { total += valor(op, sel[op.id]).extra || 0; });
    return total;
  }

  function roles(p, sel) {
    var r = {};
    p.opciones.forEach(function (op) { if (op.rol) r[op.rol] = valor(op, sel[op.id]).c; });
    return r;
  }

  function textoSeleccion(p, sel) {
    return p.opciones.map(function (op) { return valor(op, sel[op.id]).label; }).join(' · ');
  }

  function stockTotal(p) {
    return combinaciones(p).reduce(function (suma, combo) {
      var sel = {};
      p.opciones.forEach(function (op, k) { sel[op.id] = combo[k]; });
      return suma + stock(p, sel);
    }, 0);
  }

  function desde(p) {
    var min = Infinity;
    combinaciones(p).forEach(function (combo) {
      var sel = {};
      p.opciones.forEach(function (op, k) { sel[op.id] = combo[k]; });
      min = Math.min(min, precioDe(p, sel));
    });
    return min;
  }

  function formato(n) {
    return '$U ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  window.Cebador = {
    CATEGORIAS: CATEGORIAS, PRODUCTOS: PRODUCTOS, ENVIOS: ENVIOS,
    porId: porId, stock: stock, seleccionInicial: seleccionInicial, valor: valor,
    precioDe: precioDe, roles: roles, textoSeleccion: textoSeleccion, claveDe: claveDe,
    stockTotal: stockTotal, desde: desde, formato: formato
  };
})();
