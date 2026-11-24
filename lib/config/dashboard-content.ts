/**
 * Dashboard content configuration
 * Centralized content for dashboard messages and calendar events
 * 
 * This allows easy updates without modifying component code
 * and enables future migration to CMS or API-based content
 */

/**
 * Dashboard message interface
 */
export interface DashboardMessage {
  /** Message title */
  title: string
  /** Message content */
  content: string
  /** Display date or period */
  date: string
  /** Optional link */
  link?: {
    text: string
    url: string
  }
}

/**
 * Calendar event interface
 */
export interface CalendarEvent {
  /** Event title */
  title: string
  /** Event date or period */
  date: string
  /** Event description */
  description: string
}

/**
 * Messages for the dashboard
 * These can be updated by administrators or fetched from an API in the future
 */
export const DASHBOARD_MESSAGES: DashboardMessage[] = [
  {
    title: "Bem-vindo à plataforma de avaliações",
    content:
      "Consulte as avaliações abertas no painel e acompanhe as que você já concluiu.",
    date: "2025",
    link: {
      text: "Saiba mais",
      url: "#",
    },
  },
  {
    title: "Próximo Ciclo de Avaliação",
    content: "Fique atento! Em breve iniciaremos um novo ciclo de avaliação institucional.",
    date: "2025",
    link: {
      text: "Ver calendário",
      url: "#",
    },
  },
  {
    title: "Importância da sua Participação",
    content:
      "Sua opinião é fundamental para a melhoria contínua da organização. Participe quando as avaliações estiverem disponíveis.",
    date: "2025",
  },
]

/**
 * Calendar events for the dashboard
 * These can be updated by administrators or fetched from an API in the future
 */
export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    title: "Preparação do Ciclo Avaliativo",
    date: "2025",
    description: "Período de organização e planejamento das avaliações do próximo ciclo.",
  },
  {
    title: "Próximo Período de Avaliação",
    date: "A definir",
    description: "As datas do próximo ciclo de avaliação serão divulgadas em breve.",
  },
  {
    title: "Divulgação dos Resultados",
    date: "Após conclusão do ciclo",
    description: "Os resultados serão publicados após a finalização do período avaliativo.",
  },
]
