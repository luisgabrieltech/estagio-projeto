"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, EyeOff } from "lucide-react"
import type { SecurityTabProps } from "./settings.types"

export function SecurityTab({
  onPasswordChange,
  isChangingPassword,
  errors,
  setErrors,
  success,
  setSuccess,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
}: SecurityTabProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleCurrentPasswordChange = useCallback((value: string) => {
    setCurrentPassword(value)
    setErrors({ ...errors, currentPassword: undefined })
    setSuccess(false)
  }, [errors, setCurrentPassword, setErrors, setSuccess])

  const handleNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value)
    setErrors({ ...errors, newPassword: undefined, confirmPassword: undefined })
    setSuccess(false)
  }, [errors, setNewPassword, setErrors, setSuccess])

  const handleConfirmPasswordChange = useCallback((value: string) => {
    setConfirmPassword(value)
    setErrors({ ...errors, confirmPassword: undefined })
    setSuccess(false)
  }, [errors, setConfirmPassword, setErrors, setSuccess])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Segurança da Conta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Alterar Senha</h3>
            <p className="text-sm text-muted-foreground">
              Altere sua senha para manter sua conta segura
            </p>
          </div>

          <Separator />

          <form onSubmit={onPasswordChange} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className={errors.currentPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className={errors.newPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-2 rounded-md text-sm">
                Senha alterada com sucesso!
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit"
                className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
