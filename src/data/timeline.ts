export interface TimelineEntry {
  period: string;
  role: string;
  place: string;
  description: string;
}

export const timeline: TimelineEntry[] = [
  {
    period: 'Ago 2025 — Presente',
    role: 'Ingeniero de software',
    place: 'Next Digital',
    description:
      'Diseño y desarrollo de backend en TypeScript/NestJS con arquitecturas orientadas a eventos bajo CQRS y DDD, resolvers GraphQL y foco en escalabilidad.',
  },
  {
    period: 'Dic 2024 — Ago 2025',
    role: 'Full Stack Engineer',
    place: 'Enso',
    description:
      'Backend con NestJS e interfaces con Next.js/TypeScript. Una web generativa con IA que personaliza recomendaciones en tiempo real, con Prisma ORM y analítica vía Mixpanel.',
  },
  {
    period: 'Oct 2024 — Dic 2024',
    role: 'Full Stack Team Leader',
    place: 'DIVAINteam SL',
    description:
      'Liderazgo del equipo de IT: definición de arquitectura, APIs con Node.js y Python, y adopción de Jira/Confluence para ordenar el flujo de trabajo.',
  },
  {
    period: 'Nov 2021 — Oct 2023',
    role: 'Programador Junior',
    place: 'Supply Nexus',
    description:
      'Interfaces con React, APIs y procedimientos con Node.js, C#, SQL y PL/SQL, y documentación técnica del proyecto.',
  },
  {
    period: '2020 — 2024',
    role: 'Ingeniería Informática',
    place: 'Universidad Europea',
    description:
      'El punto de partida de todo esto: de ahí en adelante, construir sistemas dejó de ser un ejercicio académico.',
  },
];
