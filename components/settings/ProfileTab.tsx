"use client"

import { useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, School, Building, Upload, CheckCircle2, Briefcase } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getApiUrl } from "@/lib/utils/api-utils"
import { getImageUrl } from "@/lib/utils"
import { UPE_COURSES, UPE_CAMPUSES, getFunctionalRoleLabel } from "./settings.constants"
import type { ProfileTabProps } from "./settings.types"

export function ProfileTab({
  userData,
  setUserData,
  isEditing,
  setIsEditing,
  isLoading,
  saveSuccess,
  avatarUrl,
  setAvatarUrl,
  isUploadingAvatar,
  setIsUploadingAvatar,
  phoneError,
  setPhoneError,
  onSave,
}: ProfileTabProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatPhone = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    
    if (cleaned.length <= 2) {
      return cleaned
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
    } else if (cleaned.length <= 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
    }
    
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
  }, [])

  const validatePhone = useCallback((phone: string): boolean => {
    if (!phone) return true
    
    const cleanPhone = phone.replace(/\D/g, "")
    
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      setPhoneError("Telefone deve ter 10 ou 11 dígitos (com DDD)")
      return false
    }
    
    const phoneRegex = /^(\d{2})9?\d{8}$/
    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError("Formato inválido. Use (XX) XXXXX-XXXX")
      return false
    }
    
    setPhoneError("")
    return true
  }, [setPhoneError])

  const handlePhoneChange = useCallback((value: string) => {
    const formatted = formatPhone(value)
    setUserData({
      ...userData,
      extraData: { ...userData.extraData, phone: formatted },
    })
    
    if (value) {
      validatePhone(formatted)
    } else {
      setPhoneError("")
    }
  }, [userData, setUserData, formatPhone, validatePhone, setPhoneError])

  const handleAvatarClick = useCallback(() => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [isEditing])

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploadingAvatar(true)

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch(getApiUrl('user/avatar'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorJson = await response.json()
        const error = errorJson.data || errorJson || {}
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const json = await response.json()
      const data = json.data || json || {}

      setAvatarUrl(data.avatarUrl)
      setUserData({
        ...userData,
        extraData: {
          ...userData.extraData,
          avatar: data.avatarUrl,
        },
      })

      toast({
        title: "Sucesso",
        description: "Foto carregada! Clique em 'Salvar alterações' para confirmar",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível fazer upload da foto",
        variant: "destructive",
      })
      setAvatarUrl(userData.extraData.avatar || null)
    } finally {
      setIsUploadingAvatar(false)
    }
  }, [userData, setUserData, setAvatarUrl, setIsUploadingAvatar, toast])

  return (
    <>
      {saveSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Perfil atualizado com sucesso!</span>
        </div>
      )}
      
      {userData.functionalRoles && userData.functionalRoles.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Briefcase className="h-5 w-5" />
              Cargos Funcionais
            </CardTitle>
            <CardDescription className="text-blue-700">
              Seus cargos funcionais na instituição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userData.functionalRoles.map((role) => (
                <Badge 
                  key={role} 
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1"
                >
                  {getFunctionalRoleLabel(role)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage 
                    src={avatarUrl ? getImageUrl(avatarUrl) : getImageUrl("/images/placeholders/avatar.png")} 
                    alt="Avatar"
                    onError={(e) => {
                      e.currentTarget.src = getImageUrl("/images/placeholders/avatar.png")
                    }}
                  />
                  <AvatarFallback className="bg-upe-blue text-white text-xl">
                    {userData.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 border-upe-blue text-upe-blue hover:bg-upe-blue/10"
                  disabled={!isEditing || isUploadingAvatar}
                  onClick={handleAvatarClick}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploadingAvatar ? "Carregando..." : "Alterar foto"}
                </Button>
                {isEditing && (
                  <p className="text-xs text-muted-foreground text-center">
                    Máximo 5MB • JPG, PNG ou GIF
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-upe-blue" />
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      value={userData.name || ""}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-upe-blue" />
                      E-mail institucional
                    </Label>
                    <Input id="email" value={userData.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course" className="flex items-center gap-2">
                      <School className="h-4 w-4 text-upe-blue" />
                      Curso
                    </Label>
                    <Select
                      disabled={!isEditing}
                      value={userData.extraData.course || ""}
                      onValueChange={(value) =>
                        setUserData({
                          ...userData,
                          extraData: { ...userData.extraData, course: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu curso" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {UPE_COURSES.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campus" className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-upe-blue" />
                      Campus
                    </Label>
                    <Select
                      disabled={!isEditing}
                      value={userData.extraData.campus || ""}
                      onValueChange={(value) =>
                        setUserData({
                          ...userData,
                          extraData: { ...userData.extraData, campus: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu campus" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {UPE_CAMPUSES.map((campus) => (
                          <SelectItem key={campus} value={campus}>
                            {campus}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-upe-blue" />
                      Matrícula
                    </Label>
                    <Input
                      id="registration"
                      value={userData.extraData.registration || ""}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          extraData: { ...userData.extraData, registration: e.target.value },
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Digite sua matrícula"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-upe-blue" />
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      value={userData.extraData.phone || ""}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      disabled={!isEditing}
                      placeholder="(xx) xxxxx-xxxx"
                      className={phoneError ? "border-red-500" : ""}
                    />
                    {phoneError && (
                      <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-upe-blue text-upe-blue hover:bg-upe-blue/10"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-upe-blue hover:bg-upe-blue/90 text-white"
                >
                  Editar perfil
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
