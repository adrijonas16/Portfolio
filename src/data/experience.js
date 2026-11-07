/**
 * Work history, newest first, drawn as a git log: every job is a branch with the commits
 * that summarise what I did there. `lane` is the column of the branch in the graph;
 * the detail of each job lives in partials/experience/<id>.html.
 */
export const JOBS = [
  {
    id: 'imb',
    company: 'IMB Institute',
    branch: 'imb-institute',
    role: 'Analista desarrolladora',
    period: '2025 – hoy',
    lane: 1,
    current: true,
    commits: [
      ['feat', 'CRM comercial desde cero en N capas'],
      ['feat', 'cobranza, planes de pago y venta cruzada'],
      ['refactor', 'migración de SQL Server a PostgreSQL'],
      ['ci', 'publicación con Docker y Nginx en DigitalOcean'],
      ['test', 'QA, code review y pruebas con Playwright'],
    ],
  },
  {
    id: 'coopac-kori',
    company: 'COOPAC KORI',
    branch: 'coopac-kori',
    role: 'Analista desarrolladora',
    period: '2024 – 2026',
    lane: 2,
    commits: [
      ['feat', 'procesos separados en microservicios'],
      ['feat', 'app de movilidades con los pagos del banco'],
      ['feat', 'apps multiplataforma con .NET MAUI'],
      ['chore', 'reportes operativos y servicios en producción'],
    ],
  },
  {
    id: 'isp-corp',
    company: 'ISP Corp',
    branch: 'isp-corp',
    role: 'Desarrolladora full stack',
    period: '2024, marzo – junio',
    lane: 1,
    commits: [
      ['feat', 'chatbot de WhatsApp en PHP puro'],
      ['feat', 'menús de soporte, pagos y planes'],
      ['test', 'pruebas funcionales de cada flujo'],
    ],
  },
  {
    id: 'bsg',
    company: 'BSG Institute',
    branch: 'bsg-institute',
    role: 'Desarrolladora full stack',
    period: '2022 – 2024',
    lane: 2,
    commits: [
      ['feat', 'envíos masivos por correo, WhatsApp y SMS'],
      ['feat', 'integración con Facebook y Google Ads'],
      ['feat', 'webhooks de entregas y respuestas'],
    ],
  },
  {
    id: 'zanahoria',
    company: 'Zanahoria S.A.C.',
    branch: 'zanahoria',
    role: 'Desarrolladora full stack',
    period: '2022, febrero – agosto',
    lane: 1,
    commits: [['feat', 'gestión para una cadena de veterinarias']],
  },
  {
    id: 'todos',
    company: 'Todos.com',
    branch: 'todos-com',
    role: 'Desarrolladora front-end',
    period: '2021 – 2022',
    lane: 2,
    commits: [['feat', 'sitios web empresariales con WordPress']],
  },
];
