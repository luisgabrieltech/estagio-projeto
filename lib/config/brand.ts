export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || 'Avalia',
  logoPath: process.env.NEXT_PUBLIC_BRAND_LOGO_PATH?.trim(),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim(),
  description: 'Plataforma para criar avaliações, coletar respostas e acompanhar resultados.',
} as const
