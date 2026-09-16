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
    "message": "Hi Estudio Arroyo, I'd like to make an inquiry."
  },
  "booking": {
    "slotStepMin": 45,
    "minAdvanceMin": 120,
    "maxGuests": 8,
    "hours": [
      {
        "days": "Monday to Friday",
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
        "days": "Saturdays",
        "dayIndexes": [
          6
        ]
      }
    ]
  },
  "catalog": [],
  "menuItems": [],
  "base": "/demos/estudioarroyo/en",
  "lang": "en",
  "demo": {
    "enabled": true
  },
  "admin": {
    "pin": "0000",
    "services": [
      {
        "slug": "despidos-y-ceses",
        "name": "Layoffs and terminations",
        "category": "Laboral",
        "featured": true,
        "short": "Calculating what you're owed, formal claims, and negotiating with the employer.",
        "long": [
          "If you were let go, the first thing is to know how much you're owed and the deadline to claim it. We sort that out in the first consultation, with your pay stubs in hand.",
          "Next comes negotiation. Most cases settle before reaching trial, and it's usually worth it: you get paid sooner and with less wear and tear. When there's no reasonable agreement, we go to trial.",
          "We work on a contingency basis for labor claims: if you don't collect, we don't charge."
        ],
        "includes": [
          "Calculation of severance, accrued leave, vacation pay and year-end bonus",
          "Formal demand and negotiation with the employer",
          "Representation before the Ministry of Labor",
          "Labor litigation if no agreement is reached"
        ],
        "faq": [
          {
            "q": "How long do I have to file a claim?",
            "a": "One year from termination for labor claims, with some exceptions. If more time has passed, ask anyway — some situations toll the deadline."
          },
          {
            "q": "How much does it cost?",
            "a": "On labor claims we work on a percentage of what's collected. If you don't collect, there's no fee. We agree on the percentage in writing before starting."
          },
          {
            "q": "Do I have to come to the office?",
            "a": "Not necessarily. The first consultation can be by video call and documents are sent by email."
          }
        ]
      },
      {
        "slug": "reclamos-laborales",
        "name": "Unpaid wages and leave claims",
        "category": "Laboral",
        "short": "Overtime, unpaid leave, category differences and unpaid wages.",
        "long": [
          "You don't need to have been let go to file a claim. If you're owed overtime, leave, a year-end bonus, or you're misclassified, you can claim it while still employed.",
          "We start by reviewing your pay stubs from the last few years and calculating the real difference. The amount often comes as a surprise."
        ],
        "includes": [
          "Review of pay stubs and settlements",
          "Calculation of differences owed",
          "Claim before the Ministry of Labor",
          "Legal action if warranted"
        ]
      },
      {
        "slug": "accidentes-laborales",
        "name": "Workplace accidents",
        "category": "Laboral",
        "short": "Handling claims with the State Insurance Bank and damage claims when there was negligence.",
        "long": [
          "A workplace accident has two possible paths: coverage from the State Insurance Bank, which always applies, and a damages claim when the employer was negligent.",
          "We handle both processes and explain which one applies to your case."
        ]
      },
      {
        "slug": "divorcios",
        "name": "Divorce",
        "category": "Familia",
        "featured": true,
        "short": "By mutual agreement or contested, with a focus on closing it well and fast.",
        "long": [
          "An uncontested divorce is resolved in a few months and costs considerably less than a contested one. Whenever possible, that's the route we take.",
          "When no agreement is possible, we litigate. But even then we work to limit the conflict: the less you fight, the less you spend and the less damage is left behind.",
          "If there are minor children, the custody, visitation, and child support arrangement is resolved in the same proceeding."
        ],
        "includes": [
          "Divorce by mutual agreement",
          "Contested divorce",
          "Settlement agreement",
          "Division of marital property"
        ],
        "faq": [
          {
            "q": "How long does an uncontested divorce take?",
            "a": "Between three and six months, depending on the court. A contested one can take over a year."
          },
          {
            "q": "Do we each need our own lawyer?",
            "a": "In a mutual-agreement divorce, you can share a lawyer. If there's conflict, it's best for each side to have their own."
          }
        ]
      },
      {
        "slug": "pension-alimenticia",
        "name": "Child support",
        "category": "Familia",
        "short": "Setting, increasing, reducing, and collecting overdue child support.",
        "long": [
          "Support is set according to the child's needs and the paying party's financial capacity. Neither of those is fixed over time, so an increase or reduction can be requested when they change.",
          "We also handle collection of overdue support, including wage garnishment."
        ],
        "includes": [
          "Initial support order",
          "Request for increase or reduction",
          "Collection of arrears",
          "Wage garnishment"
        ]
      },
      {
        "slug": "tenencia-y-visitas",
        "name": "Custody and visitation",
        "category": "Familia",
        "short": "Living arrangements, visitation schedules, and modifications.",
        "long": [
          "What's decided here affects the children's day-to-day life, so we prioritize agreements that can hold up over time rather than paper victories.",
          "When it has to go to trial, we go. But we always try the court-approved agreement route first."
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
