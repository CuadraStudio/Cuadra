/* Estudio Olmos — "¿Cuál es tu caso?": recomienda por dónde empezar. */
(function () {
  'use strict';

  var CASOS = [
    {
      id: 'cuenta-propia', etiqueta: 'Trabajo por mi cuenta',
      titulo: 'Monotributo y aportes al día',
      puntos: ['Alta, cambios y baja ante los organismos', 'Control de cuotas y aportes con recordatorios', 'Una consulta por mes para dudas'],
      precio: '$U 900', unidad: 'por mes', tema: 'monotributo'
    },
    {
      id: 'pyme', etiqueta: 'Tengo una pyme con empleados',
      titulo: 'Contabilidad mensual y sueldos',
      puntos: ['Liquidación de sueldos y aportes', 'Impuestos mensuales y declaraciones', 'Balance anual y reunión de cierre'],
      precio: '$U 4.800', unidad: 'por mes', tema: 'empresa'
    },
    {
      id: 'abrir', etiqueta: 'Quiero abrir una empresa',
      titulo: 'Puesta en marcha',
      puntos: ['Te ayudamos a elegir la figura que conviene', 'Trámites de inscripción de punta a punta', 'Plan de cuentas y primer mes de seguimiento'],
      precio: '$U 6.500', unidad: 'pago único', tema: 'abrir'
    },
    {
      id: 'irpf', etiqueta: 'Solo necesito el IRPF',
      titulo: 'Declaración de IRPF',
      puntos: ['Revisamos tus ingresos y deducciones', 'Presentamos la declaración por vos', 'Te explicamos cuánto y cuándo pagar'],
      precio: '$U 1.800', unidad: 'por declaración', tema: 'irpf'
    }
  ];

  var lista = document.querySelector('[data-casos]');
  var salida = document.querySelector('[data-resultado]');

  lista.innerHTML = CASOS.map(function (c, i) {
    return '<label class="caso"><input type="radio" name="caso" value="' + c.id + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="caso__cara"><span class="caso__marca" aria-hidden="true"></span>' + c.etiqueta + '</span></label>';
  }).join('');

  function pintar(id) {
    var c = CASOS.filter(function (x) { return x.id === id; })[0];
    salida.innerHTML = '<h3>' + c.titulo + '</h3><ul>' + c.puntos.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
      '<div class="resultado__pie"><p class="precio">Desde ' + c.precio + ' <small>' + c.unidad + '</small></p>' +
      '<a class="btn" href="consulta/?tema=' + c.tema + '">Pedir consulta</a></div>';
  }

  lista.addEventListener('change', function (e) { pintar(e.target.value); });
  pintar(CASOS[0].id);
})();
