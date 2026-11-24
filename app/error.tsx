"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { AlertTriangle } from "lucide-react"
import { routes } from "@/lib/config/routes"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (error) {
      console.error('Application error:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        digest: error?.digest,
        timestamp: new Date().toISOString(),
      })
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-6 max-w-lg text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-upe-red/10 mb-2">
            <AlertTriangle className="h-12 w-12 text-upe-red" />
          </div>
          <h1 className="text-4xl font-bold text-upe-blue">Ops! Algo deu errado...</h1>
          <p className="text-lg text-muted-foreground">
            Ocorreu um erro inesperado ao processar sua solicitação.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left w-full">
              <p className="text-sm font-mono text-red-800 break-all">
                {error?.message || 'Erro desconhecido'}
              </p>
              {error?.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-4 mt-2">
            <Button 
              onClick={reset}
              className="bg-upe-blue hover:bg-upe-darkblue text-white px-8 py-2"
            >
              Tentar novamente
            </Button>
            <Link href={routes.home}>
              <Button 
                variant="outline"
                className="px-8 py-2"
              >
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 