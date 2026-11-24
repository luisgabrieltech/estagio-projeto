'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductBrand } from '@/components/common/product-brand'
import { routes } from '@/lib/config/routes'

const navItems = [
  { label: 'Início', href: routes.home },
  { label: 'Sobre', href: routes.about },
  { label: 'Benefícios', href: routes.benefits },
  { label: 'Contato', href: routes.contact },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href={routes.home} className="min-w-0"><ProductBrand /></Link>
        <nav aria-label="Navegação principal" className="hidden gap-6 md:flex">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium hover:text-upe-blue">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden gap-4 md:flex">
          <Button asChild variant="outline" size="sm" className="border-upe-blue text-upe-blue">
            <Link href={routes.auth.login}>Entrar</Link>
          </Button>
          <Button asChild size="sm" className="bg-upe-red hover:bg-upe-red/90">
            <Link href={routes.auth.register}>Criar conta</Link>
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="landing-menu"
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>
      </div>
      <nav id="landing-menu" aria-label="Navegação móvel" hidden={!menuOpen} className="container pb-6 md:hidden">
        <div className="flex flex-col gap-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium" onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
          <Link href={routes.auth.login} className="text-sm font-medium" onClick={closeMenu}>Entrar</Link>
          <Link href={routes.auth.register} className="text-sm font-medium" onClick={closeMenu}>Criar conta</Link>
        </div>
      </nav>
    </header>
  )
}
