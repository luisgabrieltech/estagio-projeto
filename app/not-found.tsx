import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { FileQuestion } from "lucide-react"
import { routes } from "@/lib/config/routes"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-6 max-w-lg text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-upe-blue/10 mb-2">
            <FileQuestion className="h-12 w-12 text-upe-blue" />
          </div>
          <h1 className="text-4xl font-bold text-upe-blue">Página não encontrada</h1>
          <p className="text-lg text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
            Verifique o endereço digitado ou volte para a página inicial.
          </p>
          <div className="flex gap-4 mt-2">
            <Link href={routes.home}>
              <Button className="bg-upe-blue hover:bg-upe-darkblue text-white px-8 py-2">
                Voltar para o início
              </Button>
            </Link>
            <Link href={routes.dashboard.home}>
              <Button variant="outline" className="px-8 py-2">
                Ir para o Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
