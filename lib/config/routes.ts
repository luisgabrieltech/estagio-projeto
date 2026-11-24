// Prefixo externo opcional. Quando usado, o proxy encaminha paths sem o prefixo.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const internalPaths = {
  // Rotas públicas
  home: '/',
  
  // Autenticação
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  magicLogin: '/magic-login',
  magicAuth: '/magic-auth',
  accountInactive: '/conta-inativada',
  
  // Dashboard
  dashboard: '/dashboard',
  dashboardAdmin: '/dashboard/admin',
  dashboardAdminForms: '/dashboard/admin/formularios',
  
  // API
  api: '/api',
  apiAuth: '/api/auth',
} as const

/**
 * Helper para criar rotas com base path dinâmico
 * @param path - Caminho da rota (ex: '/dashboard')
 * @returns Rota completa com base path (ex: '/avaliacoes/dashboard' ou '/dashboard')
 */
const route = (path: string): string => {
  const base = basePath
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${cleanPath}` : cleanPath
}

export const routes = {
  // Rotas principais
  home: route('/'),
  about: route('/#about'),
  benefits: route('/#benefits'),
  contact: route('/#contact'),
  alumni: route('/alumni'),

  // Rotas de autenticação
  auth: {
    login: route('/login'),
    register: route('/register'),
    forgotPassword: route('/forgot-password'),
    resetPassword: route('/reset-password'),
    accountInactive: route('/conta-inativada'),
  },
  
  // Rotas do dashboard
  dashboard: {
    home: route('/dashboard'),
    profile: route('/dashboard/perfil'),
    settings: route('/dashboard/configuracoes'),
    
    // Avaliações
    evaluations: {
      home: route('/dashboard/avaliacoes'),
      respond: (id: string) => route(`/dashboard/avaliacoes/responder/${id}`),
      view: (id: string) => route(`/dashboard/avaliacoes/${id}`),
    },
    
    // Certificados
    certificates: {
      home: route('/dashboard/certificados'),
      download: (id: string) => route(`/dashboard/certificados/${id}/download`),
      view: (id: string) => route(`/dashboard/certificados/${id}`),
    },
    
    // Administração
    admin: {
      home: route('/dashboard/admin'),
      
      // Formulários (Admin)
      forms: {
        home: route('/dashboard/admin/formularios'),
        new: route('/dashboard/admin/formularios/novo'),
        edit: (id: string) => route(`/dashboard/admin/formularios/${id}/editar`),
        view: (id: string) => route(`/dashboard/admin/formularios/${id}`),
        responses: (id: string) => route(`/dashboard/admin/formularios/${id}/respostas`),
      },
      
      // Relatórios (Admin)
      reports: {
        home: route('/dashboard/admin/relatorios'),
        view: (id: string) => route(`/dashboard/admin/relatorios/${id}`),
        generate: route('/dashboard/admin/relatorios/gerar'),
      },
      
      // Gestão de Respostas (Admin)
      responses: {
        home: route('/dashboard/admin/respostas'),
        view: (formId: string) => route(`/dashboard/admin/respostas/${formId}`),
        metrics: (formId: string) => route(`/dashboard/admin/respostas/${formId}/metricas`),
        export: (formId: string) => route(`/dashboard/admin/respostas/${formId}/exportar`),
        details: (formId: string) => route(`/dashboard/admin/respostas/${formId}/detalhes`),
      },
      
      // Usuários (Admin)
      users: {
        home: route('/dashboard/admin/usuarios'),
        new: route('/dashboard/admin/usuarios/novo'),
        edit: (id: string) => route(`/dashboard/admin/usuarios/${id}/editar`),
        view: (id: string) => route(`/dashboard/admin/usuarios/${id}`),
      },
      
      // Configurações (Admin)
      settings: {
        home: route('/dashboard/admin/configuracoes'),
        general: route('/dashboard/admin/configuracoes/geral'),
        email: route('/dashboard/admin/configuracoes/email'),
        notifications: route('/dashboard/admin/configuracoes/notificacoes'),
      },
    },
  },
} as const
