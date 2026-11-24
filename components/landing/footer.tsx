import Link from 'next/link'
import { ProductBrand } from '@/components/common/product-brand'
import { brand } from '@/lib/config/brand'
import { basePath, routes } from '@/lib/config/routes'

const sections = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Sobre', href: routes.about },
      { label: 'Benefícios', href: routes.benefits },
    ],
  },
  {
    title: 'Conta',
    links: [
      { label: 'Entrar', href: routes.auth.login },
      { label: 'Criar conta', href: routes.auth.register },
    ],
  },
  {
    title: 'Ajuda',
    links: [
      { label: 'Contato', href: routes.contact },
      { label: 'Validar certificado', href: `${basePath}/validar` },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-upe-blue text-white">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <Link href={routes.home}><ProductBrand /></Link>
            <p className="text-sm text-white/90">{brand.description}</p>
          </div>
          {sections.map(section => (
            <nav key={section.title} aria-label={section.title} className="space-y-4">
              <h2 className="text-sm font-semibold">{section.title}</h2>
              <ul className="space-y-2 text-sm">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/90 hover:underline">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  )
}
