"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Eye, EyeOff, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { routes } from "@/lib/config/routes"
import { getAuthApiUrl } from "@/lib/utils"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])
  const [passwordMatch, setPasswordMatch] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Password strength validation
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      setPasswordFeedback([])
      return
    }

    const feedback = []
    let strength = 0

    if (password.length >= 8) {
      strength += 25
    } else {
      feedback.push("Pelo menos 8 caracteres")
    }

    if (/[A-Z]/.test(password)) {
      strength += 25
    } else {
      feedback.push("Pelo menos uma letra maiúscula")
    }

    if (/[0-9]/.test(password)) {
      strength += 25
    } else {
      feedback.push("Pelo menos um número")
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25
    } else {
      feedback.push("Pelo menos um caractere especial")
    }

    setPasswordStrength(strength)
    setPasswordFeedback(feedback)
  }, [password])

  // Password match validation
  useEffect(() => {
    setPasswordMatch(password === confirmPassword || confirmPassword === "")
  }, [password, confirmPassword])

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-orange-500"
    if (passwordStrength <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate password strength
    if (passwordStrength < 100) {
      toast({
        title: "Senha fraca",
        description: "A senha não atende aos requisitos mínimos de segurança",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(getAuthApiUrl('reset-password'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: params.token,
          password,
        }),
      })

      const json = await response.json()
      // API may return { data: {...} } format
      const data = json.data || json || {}

      if (!response.ok) {
        throw new Error(data.message || "Erro ao redefinir senha")
      }

      toast({
        title: "Senha redefinida",
        description: "Sua senha foi alterada com sucesso",
      })

      router.push(routes.auth.login)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao redefinir sua senha",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href={routes.auth.login}
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para o login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
      >
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Redefinir senha</h1>
          <p className="text-sm text-muted-foreground">
            Digite sua nova senha abaixo
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Nova senha</CardTitle>
            <CardDescription>Crie uma nova senha segura para sua conta</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                  </Button>
                </div>
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress value={passwordStrength} className={`h-2 ${getStrengthColor()}`} />
                      <span className="text-xs text-muted-foreground w-12">
                        {passwordStrength}%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {passwordFeedback.map((feedback, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <X className="h-3 w-3 text-red-500" />
                          <span className="text-muted-foreground">{feedback}</span>
                        </div>
                      ))}
                      {passwordStrength === 100 && (
                        <div className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">Senha forte</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showConfirmPassword ? "Esconder senha" : "Mostrar senha"}</span>
                  </Button>
                </div>
                {confirmPassword && !passwordMatch && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
                {confirmPassword && passwordMatch && password && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Senhas coincidem
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-upe-blue hover:bg-upe-blue/90"
                disabled={isLoading || passwordStrength < 100 || !passwordMatch}
              >
                {isLoading ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
} 