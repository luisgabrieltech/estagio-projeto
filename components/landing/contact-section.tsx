import Link from 'next/link'
import { AtSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { brand } from '@/lib/config/brand'
import { routes } from '@/lib/config/routes'

export function ContactSection() {
  return (
    <section id="contact" className="container grid gap-10 py-24 sm:py-32 md:grid-cols-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tighter text-upe-blue sm:text-4xl md:text-5xl">
          Entre em contato
        </h2>
        <p className="mt-4 text-muted-foreground md:text-lg">
          Precisa de ajuda para acessar sua conta ou participar de uma avaliação?
        </p>
      </div>
      <div className="flex items-start gap-4 rounded-lg border bg-background p-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-upe-blue/10 text-upe-blue">
          <AtSign aria-hidden="true" className="size-5" />
        </span>
        <div className="space-y-3">
          {brand.supportEmail ? (
            <>
              <h3 className="font-bold">Suporte por e-mail</h3>
              <Button asChild className="bg-upe-red hover:bg-upe-red/90">
                <a href={`mailto:${brand.supportEmail}`}>Escrever para o suporte</a>
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-bold">Ajuda com a conta</h3>
              <p className="text-sm text-muted-foreground">Para outras dúvidas, procure o administrador da sua organização.</p>
              <Link href={routes.auth.forgotPassword} className="text-sm text-upe-blue underline underline-offset-4">
                Recuperar senha
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
