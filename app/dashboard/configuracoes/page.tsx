"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useRef, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { apiRequest } from "@/lib/utils/api-utils"
import { ProfileTab, SecurityTab } from "@/components/settings"
import { PageLoading } from "@/components/common/LoadingState"
import type { UserProfileData, UserDataState, PasswordErrors } from "@/components/settings"

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const hasLoadedData = useRef(false)

  // Profile state
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [userData, setUserData] = useState<UserDataState>({
    name: "",
    email: "",
    functionalRoles: [],
    extraData: {
      course: "",
      campus: "",
      registration: "",
      phone: "",
      avatar: undefined,
    },
  })

  // Security state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (hasLoadedData.current) return
      
      try {
        const data = await apiRequest<UserProfileData>('user/profile')
        setUserData({
          name: data.name || "",
          email: data.email || "",
          functionalRoles: data.functionalRoles || [],
          extraData: {
            course: data.extraData?.course || "",
            campus: data.extraData?.campus || "",
            registration: data.extraData?.registration || "",
            phone: data.extraData?.phone || "",
            avatar: data.extraData?.avatar,
          },
        })
        
        if (data.extraData?.avatar) {
          setAvatarUrl(data.extraData.avatar)
        }
        
        hasLoadedData.current = true
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do perfil",
          variant: "destructive",
        })
      }
    }

    if (session?.user?.email && status === "authenticated") {
      fetchUserData()
    }
  }, [session?.user?.email, status, toast])

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
  }, [])

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userData.extraData.phone && !validatePhone(userData.extraData.phone)) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija o telefone antes de salvar",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    setSaveSuccess(false)

    try {
      await apiRequest('user/profile', {
        method: "PUT",
        body: JSON.stringify({
          name: userData.name,
          extraData: userData.extraData,
        }),
      })

      setSaveSuccess(true)
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      })
      setIsEditing(false)
      
      if (userData.extraData.avatar) {
        window.dispatchEvent(new CustomEvent('avatarUpdated', { 
          detail: { avatar: userData.extraData.avatar } 
        }))
      }
      
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [userData, validatePhone, toast])

  const validatePasswords = useCallback((): boolean => {
    const newErrors: PasswordErrors = {}

    if (!currentPassword) {
      newErrors.currentPassword = "A senha atual é obrigatória"
    }

    if (!newPassword) {
      newErrors.newPassword = "A nova senha é obrigatória"
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "A senha deve ter pelo menos 8 caracteres"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "A confirmação de senha é obrigatória"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [currentPassword, newPassword, confirmPassword])

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(false)
    
    if (!validatePasswords()) {
      return
    }

    setIsChangingPassword(true)

    try {
      await apiRequest('user/password', {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      setPasswordSuccess(true)
      setPasswordErrors({})
      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : ""
      if (errorMessage.includes("Senha atual incorreta")) {
        setPasswordErrors({ currentPassword: "Senha atual incorreta" })
      } else {
        toast({
          title: "Erro",
          description: errorMessage || "Não foi possível atualizar a senha",
          variant: "destructive",
        })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }, [currentPassword, newPassword, validatePasswords, toast])

  if (status === "loading") {
    return <PageLoading message="Carregando configurações..." />
  }

  if (!session?.user) {
    return (
      <DashboardLayout>
        <div className="w-full p-4 md:p-6">
          <div className="text-center">
            <p className="text-red-500">Sessão expirada. Por favor, faça login novamente.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-upe-blue">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profile" className="data-[state=active]:bg-upe-blue data-[state=active]:text-white">
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
              disabled
            >
              Notificações
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-upe-blue data-[state=active]:text-white"
            >
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab
              userData={userData}
              setUserData={setUserData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              isLoading={isLoading}
              saveSuccess={saveSuccess}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              isUploadingAvatar={isUploadingAvatar}
              setIsUploadingAvatar={setIsUploadingAvatar}
              phoneError={phoneError}
              setPhoneError={setPhoneError}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  Funcionalidade em desenvolvimento...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab
              onPasswordChange={handleChangePassword}
              isChangingPassword={isChangingPassword}
              errors={passwordErrors}
              setErrors={setPasswordErrors}
              success={passwordSuccess}
              setSuccess={setPasswordSuccess}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
