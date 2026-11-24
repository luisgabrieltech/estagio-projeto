"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { getAuthApiUrl } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(getAuthApiUrl('forgot-password'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const json = await response.json()
      const data = json.data || json || {}

      if (!response.ok) {
        throw new Error(data.message || "Erro ao enviar e-mail de recuperação")
      }

      setIsSubmitted(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar o e-mail",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setIsSubmitted(false)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para o login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]"
      >
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Esqueceu sua senha?</h1>
          <p className="text-sm text-muted-foreground">
            {isSubmitted 
              ? "Verifique sua caixa de entrada" 
              : "Digite seu e-mail e enviaremos um link para redefinir sua senha"
            }
          </p>
        </div>

        {isSubmitted ? (
          <Card>
            <CardContent className="pt-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">E-mail enviado!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Se o e-mail <strong>{email}</strong> estiver cadastrado em nosso sistema, 
                  você receberá um link para redefinir sua senha.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-medium mb-2">Não recebeu o e-mail?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Verifique sua pasta de spam ou lixo eletrônico</li>
                    <li>• Confirme se digitou o e-mail corretamente</li>
                    <li>• Aguarde alguns minutos e tente novamente</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Tentar com outro e-mail
                  </Button>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full">
                      Voltar para o login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recuperar senha</CardTitle>
              <CardDescription>Informe seu e-mail institucional</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@exemplo.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-upe-blue hover:bg-upe-darkblue"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
