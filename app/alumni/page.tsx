import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/landing/navbar'
import { Button } from '@/components/ui/button'
import { routes } from '@/lib/config/routes'

export const metadata: Metadata = {
  title: 'Avaliações de egressos',
  description: 'Acesse as avaliações destinadas a egressos.',
}

export default function AlumniPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-16 md:py-24">
        <h1 className="text-4xl font-semibold tracking-tight">Avaliações de egressos</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Entre na sua conta para consultar as avaliações disponíveis para o seu perfil.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild><Link href={routes.auth.login}>Entrar</Link></Button>
          <Button asChild variant="outline"><Link href={routes.auth.register}>Criar conta</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
