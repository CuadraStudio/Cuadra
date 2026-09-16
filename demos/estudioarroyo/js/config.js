/* Config del tenant — generado. Editar el JSON de origen, no este archivo. */
window.SITE_CONFIG = {
  "tenant": {
    "slug": "estudioarroyo",
    "name": "Estudio Arroyo",
    "vertical": "consulta",
    "plan": "premium",
    "currency": "UYU"
  },
  "api": {
    "enabled": false,
    "base": "https://cuadra-api-t7rg.onrender.com/api/democonsulta",
    "timeoutMs": 8000
  },
  "whatsapp": {
    "number": "59899000000",
    "message": "Hola Estudio Arroyo, quiero hacer una consulta."
  },
  "booking": {
    "slotStepMin": 45,
    "minAdvanceMin": 120,
    "maxGuests": 8,
    "hours": [
      {
        "days": "Lunes a viernes",
        "open": "09:00",
        "close": "18:00",
        "dayIndexes": [
          1,
          2,
          3,
          4,
          5
        ]
      },
      {
        "days": "Sábados",
        "dayIndexes": [
          6
        ]
      }
    ]
  },
  "catalog": [],
  "menuItems": [],
  "base": "/demos/estudioarroyo",
  "demo": {
    "enabled": true
  },
  "admin": {
    "pin": "0000",
    "services": [
      {
        "slug": "despidos-y-ceses",
        "name": "Despidos y ceses",
        "category": "Laboral",
        "featured": true,
        "short": "Cálculo de lo que te corresponde, reclamo y negociación con la empresa.",
        "long": [
          "Si te despidieron, lo primero es saber cuánto te corresponde y en qué plazo podés reclamarlo. Eso lo resolvemos en la primera consulta, con tus recibos a la vista.",
          "Después viene la parte de negociación. La mayoría de los casos se cierran con un acuerdo antes de llegar a juicio, y suele convenir: cobrás antes y con menos desgaste. Cuando no hay acuerdo razonable, vamos a juicio.",
          "Trabajamos con honorarios por resultado en los reclamos laborales: si no cobrás, no cobramos."
        ],
        "includes": [
          "Cálculo de despido, licencia, salario vacacional y aguinaldo",
          "Intimación y negociación con la empresa",
          "Representación en el Ministerio de Trabajo",
          "Juicio laboral si no hay acuerdo"
        ],
        "faq": [
          {
            "q": "¿Cuánto tiempo tengo para reclamar?",
            "a": "Un año desde el cese para los créditos laborales, con algunas excepciones. Si pasó más tiempo, igual consultá: hay situaciones que interrumpen el plazo."
          },
          {
            "q": "¿Cuánto sale?",
            "a": "En reclamos laborales trabajamos a porcentaje sobre lo que se cobra. Si no cobrás, no hay honorarios. El porcentaje lo acordamos por escrito antes de empezar."
          },
          {
            "q": "¿Tengo que ir al estudio?",
            "a": "No necesariamente. La primera consulta puede ser por videollamada y los documentos se envían por mail."
          }
        ]
      },
      {
        "slug": "reclamos-laborales",
        "name": "Reclamos de salarios y licencias",
        "category": "Laboral",
        "short": "Horas extra, licencias no pagas, diferencias de categoría y salarios adeudados.",
        "long": [
          "No hace falta que te hayan despedido para reclamar. Si te deben horas extra, licencias, aguinaldo o te tienen mal categorizado, se puede reclamar estando en el trabajo.",
          "Empezamos revisando tus recibos de los últimos años y calculando la diferencia real. Muchas veces el monto sorprende."
        ],
        "includes": [
          "Revisión de recibos y liquidaciones",
          "Cálculo de diferencias",
          "Reclamo ante el Ministerio de Trabajo",
          "Acción judicial si corresponde"
        ]
      },
      {
        "slug": "accidentes-laborales",
        "name": "Accidentes laborales",
        "category": "Laboral",
        "short": "Gestión ante el Banco de Seguros y reclamo por daños cuando hubo negligencia.",
        "long": [
          "Un accidente de trabajo tiene dos caminos posibles: la cobertura del Banco de Seguros del Estado, que corresponde siempre, y el reclamo por daño cuando hubo negligencia del empleador.",
          "Acompañamos las dos gestiones y te explicamos cuál corresponde en tu caso."
        ]
      },
      {
        "slug": "divorcios",
        "name": "Divorcios",
        "category": "Familia",
        "featured": true,
        "short": "Por acuerdo o contencioso, con foco en cerrar bien y rápido.",
        "long": [
          "Un divorcio por acuerdo se resuelve en pocos meses y cuesta bastante menos que uno peleado. Siempre que se pueda, vamos por ahí.",
          "Cuando no hay acuerdo posible, litigamos. Pero incluso en esos casos trabajamos para acotar el conflicto: cuanto menos se pelea, menos se gasta y menos daño queda.",
          "Si hay hijos menores, el acuerdo de tenencia, visitas y pensión se resuelve en el mismo trámite."
        ],
        "includes": [
          "Divorcio por mutuo acuerdo",
          "Divorcio contencioso",
          "Convenio regulador",
          "Liquidación de la sociedad conyugal"
        ],
        "faq": [
          {
            "q": "¿Cuánto demora un divorcio por acuerdo?",
            "a": "Entre tres y seis meses, según el juzgado. El contencioso puede llevar más de un año."
          },
          {
            "q": "¿Necesitamos un abogado cada uno?",
            "a": "En el divorcio por mutuo acuerdo pueden compartir abogado. Si hay conflicto, conviene que cada parte tenga el suyo."
          }
        ]
      },
      {
        "slug": "pension-alimenticia",
        "name": "Pensión alimenticia",
        "category": "Familia",
        "short": "Fijación, aumento, reducción y cobro de pensiones atrasadas.",
        "long": [
          "La pensión se fija según las necesidades del niño y la capacidad económica de quien la paga. Ninguna de las dos cosas es fija en el tiempo: por eso se puede pedir aumento o reducción cuando cambian.",
          "También gestionamos el cobro de pensiones atrasadas, incluida la retención sobre el sueldo."
        ],
        "includes": [
          "Fijación inicial",
          "Pedido de aumento o reducción",
          "Cobro de atrasos",
          "Retención sobre haberes"
        ]
      },
      {
        "slug": "tenencia-y-visitas",
        "name": "Tenencia y visitas",
        "category": "Familia",
        "short": "Acuerdos de convivencia, régimen de visitas y modificaciones.",
        "long": [
          "Lo que se decide acá afecta la vida cotidiana de los chicos, así que priorizamos acuerdos que se puedan sostener en el tiempo por sobre victorias de papel.",
          "Cuando hay que ir a juicio, vamos. Pero siempre intentamos primero la vía del acuerdo homologado."
        ]
      }
    ],
    "hoursPlan": [
      {
        "dow": 0,
        "active": false,
        "start_time": "09:00",
        "end_time": "19:00"
      },
      {
        "dow": 1,
        "active": true,
        "start_time": "09:00",
        "end_time": "18:00"
      },
      {
        "dow": 2,
        "active": true,
        "start_time": "09:00",
        "end_time": "18:00"
      },
      {
        "dow": 3,
        "active": true,
        "start_time": "09:00",
        "end_time": "18:00"
      },
      {
        "dow": 4,
        "active": true,
        "start_time": "09:00",
        "end_time": "18:00"
      },
      {
        "dow": 5,
        "active": true,
        "start_time": "09:00",
        "end_time": "18:00"
      },
      {
        "dow": 6,
        "active": false,
        "start_time": "09:00",
        "end_time": "19:00"
      }
    ]
  }
};
