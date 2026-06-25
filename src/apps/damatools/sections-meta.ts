export type SectionMeta = {
  num: string;
  title: string;
  icon: string;
  desc: string;
};

export const SECTIONS_DATA: SectionMeta[] = [
  {
    num: "1",
    title: "Contexto e visão geral",
    icon: "briefcase",
    desc: "Sobre a Arphia, o DamaTools, roadmap modular e princípios norteadores",
  },
  {
    num: "2",
    title: "Equipe e responsabilidades",
    icon: "users",
    desc: "Papéis do sócio, tech lead e desenvolvedor, com matriz RACI completa",
  },
  {
    num: "3",
    title: "Plano de formação do desenvolvedor",
    icon: "graduation",
    desc: "Fases de integração, critérios de progressão e indicadores de maturidade",
  },
  {
    num: "4",
    title: "Sistema de Tiers de tarefas",
    icon: "layers",
    desc: "Classificação por risco: Tier 1 (crítico), Tier 2 (padrão) e Tier 3 (baixo risco)",
  },
  {
    num: "5",
    title: "Stack tecnológica",
    icon: "code",
    desc: "TypeScript, Next.js, PostgreSQL, Prisma, Tailwind e justificativas",
  },
  {
    num: "6",
    title: "Arquitetura modular",
    icon: "grid",
    desc: "Monolito modular: código, banco, comunicação entre módulos e infraestrutura",
  },
  {
    num: "7",
    title: "Plataformas e custos",
    icon: "wallet",
    desc: "GitHub Team, Slack, Cursor, Claude Pro e consolidado mensal",
  },
  {
    num: "8",
    title: "Ambientes",
    icon: "server",
    desc: "Local, staging e produção: URLs, bancos e separação de dados",
  },
  {
    num: "9",
    title: "Git flow e versionamento",
    icon: "git",
    desc: "Branches, Conventional Commits, templates de PR e branch protection",
  },
  {
    num: "10",
    title: "CI/CD",
    icon: "rocket",
    desc: "Pipelines de integração contínua e deploy automatizado via GitHub Actions",
  },
  {
    num: "11",
    title: "Processo de trabalho",
    icon: "chart",
    desc: "Scrumban adaptado: ciclo semanal, board, WIP limits e cerimônias",
  },
  {
    num: "12",
    title: "Comunicação",
    icon: "chat",
    desc: "Canais no Slack, integrações automáticas e regras de uso",
  },
  {
    num: "13",
    title: "Uso da Inteligência Artificial",
    icon: "ai",
    desc: "CLAUDE.md, Cursor, guardrails e ferramentas por papel",
  },
  {
    num: "14",
    title: "Spec Driven Development (SDD)",
    icon: "check",
    desc: "Especificação técnica antes do código: ciclo, templates de prompt e versionamento",
  },
  {
    num: "15",
    title: "Segurança da aplicação",
    icon: "shield",
    desc: "LGPD, autenticação, OWASP Top 10, auditoria e resposta a incidentes",
  },
  {
    num: "16",
    title: "Code Review e qualidade",
    icon: "layers",
    desc: "Checklists por Tier, testes obrigatórios e monitoramento em produção",
  },
  {
    num: "17",
    title: "Monitoramento e observabilidade",
    icon: "monitor",
    desc: "Sentry, UptimeRobot, logs estruturados, alertas e resposta a incidentes",
  },
  {
    num: "18",
    title: "Roadmap de implantação",
    icon: "calendar",
    desc: "Meses 1 a 7+: cronograma realista por papel e marcos de validação",
  },
  {
    num: "19",
    title: "Indicadores de saúde do processo",
    icon: "bar",
    desc: "Métricas de qualidade, velocidade e saúde da equipe",
  },
  {
    num: "20",
    title: "Gestão de dependências",
    icon: "code",
    desc: "Categorias, versionamento semver, Dependabot, npm audit e Prisma",
  },
  {
    num: "21",
    title: "Apêndices",
    icon: "file",
    desc: "Templates, checklists e referências complementares",
  },
];
