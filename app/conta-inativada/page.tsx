import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Lock } from "lucide-react"
import { brand } from "@/lib/config/brand"
import { routes } from "@/lib/config/routes"

export default function ContaInativadaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-6 max-w-lg text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-2">
            <Lock className="h-12 w-12 text-upe-red" />
          </div>
          <h1 className="text-4xl font-bold text-upe-blue">Conta inativada</h1>
          <p className="text-lg text-muted-foreground">
            Sua conta foi inativada por um administrador e não é possível acessar o sistema.<br />
            {brand.supportEmail ? (
              <>Se você acredita que houve um engano, <a href={`mailto:${brand.supportEmail}`} className="text-upe-blue underline">fale com o suporte</a>.</>
            ) : 'Se você acredita que houve um engano, fale com o administrador da plataforma.'}
          </p>
          <Link href={routes.auth.login}>
            <Button className="bg-upe-blue hover:bg-upe-darkblue text-white px-8 py-2 mt-2">
              Voltar para o login
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
