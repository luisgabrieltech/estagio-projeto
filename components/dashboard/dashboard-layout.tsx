"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { ProductBrand } from "@/components/common/product-brand"
import { usePathname } from "next/navigation"
import { Bell, FileText, Home, Settings, Menu, X, ShieldCheck, Users, ClipboardList, BarChart3, Award, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSession, signOut } from "next-auth/react"
import { routes } from "@/lib/config/routes"
import { apiRequest } from "@/lib/utils/api-utils"
import { UserAvatar } from "@/components/common/UserAvatar"
import type { FormListItem } from "@/types/api/forms"
import type { UserProfileResponse } from "@/types/api/users"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  disabled?: boolean
}

interface AdminNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: routes.dashboard.home, icon: Home },
  { label: "Avaliações", href: routes.dashboard.evaluations.home, icon: FileText, badge: "2" },
  { label: "Certificados", href: routes.dashboard.certificates.home, icon: Award },
  { label: "Votações", href: `${routes.dashboard.home}/votacoes`, icon: FileText, disabled: true },
  { label: "Configurações", href: routes.dashboard.settings, icon: Settings },
]

const hasAdminAccess = (role: string): boolean => ["ADMIN", "CSA"].includes(role)
const hasFullAdminAccess = (role: string): boolean => role === "ADMIN"
const hasFormManagementAccess = (role: string): boolean => ["ADMIN", "CSA"].includes(role)

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState<number>(0)

  const userName = useMemo(() => session?.user?.name || 'Usuário', [session?.user?.name])
  const userEmail = useMemo(() => session?.user?.email || '', [session?.user?.email])
  const userRole = useMemo(() => session?.user?.role || '', [session?.user?.role])

  const isAdmin = useMemo(() => hasAdminAccess(userRole), [userRole])
  const isFullAdmin = useMemo(() => hasFullAdminAccess(userRole), [userRole])
  const hasFormManagement = useMemo(() => hasFormManagementAccess(userRole), [userRole])

  const adminItems = useMemo((): AdminNavItem[] => {
    const items: AdminNavItem[] = []
    
    if (isFullAdmin) {
      items.push({ label: "Painel Administrativo", href: routes.dashboard.admin.home, icon: BarChart3 })
    }
    
    if (hasFormManagement) {
      items.push({ label: "Gestão de Formulários", href: routes.dashboard.admin.forms.home, icon: ClipboardList })
      items.push({ label: "Gestão de Respostas", href: routes.dashboard.admin.responses.home, icon: MessageSquare })
    }
    
    if (isFullAdmin) {
      items.push({ label: "Gestão de Usuários", href: routes.dashboard.admin.users.home, icon: Users })
    }
    
    return items
  }, [isFullAdmin, hasFormManagement])

  const isMenuItemActive = useCallback((href: string): boolean => {
    if (href === routes.dashboard.home) {
      return pathname === routes.dashboard.home
    }
    return pathname === href || (pathname.startsWith(href + "/") && pathname !== routes.dashboard.home)
  }, [pathname])

  const isAdminItemActive = useCallback((href: string): boolean => {
    if (href === routes.dashboard.admin.home) {
      return pathname === routes.dashboard.admin.home
    }
    if (href === routes.dashboard.admin.forms.home) {
      return pathname === routes.dashboard.admin.forms.home || pathname.startsWith(routes.dashboard.admin.forms.home + "/")
    }
    if (href === routes.dashboard.admin.users.home) {
      return pathname === routes.dashboard.admin.users.home || pathname.startsWith(routes.dashboard.admin.users.home + "/")
    }
    if (href === routes.dashboard.admin.reports.home) {
      return pathname === routes.dashboard.admin.reports.home || pathname.startsWith(routes.dashboard.admin.reports.home + "/")
    }
    if (href === routes.dashboard.admin.responses.home) {
      return pathname === routes.dashboard.admin.responses.home || pathname.startsWith(routes.dashboard.admin.responses.home + "/")
    }
    return false
  }, [pathname])

  const fetchPendingForms = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      const [formsData, respData] = await Promise.all([
        apiRequest<FormListItem[]>('forms'),
        apiRequest<{ formId: string }[]>('responses?user=me')
      ])
      
      const respondedFormIds = new Set(respData.map((r) => r.formId))
      const pending = (Array.isArray(formsData) ? formsData : []).filter(
        (f) => f.externalStatus === 'AVAILABLE' && !respondedFormIds.has(f.id)
      )
      setPendingCount(pending.length)
    } catch (error) {
      console.error('Error fetching pending forms:', error)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchPendingForms()
  }, [fetchPendingForms])

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!userEmail) return
      try {
        const data = await apiRequest<UserProfileResponse>('user/profile')
        if (data.extraData?.avatar) {
          setUserAvatar(data.extraData.avatar)
        }
      } catch (error) {
        console.error("Erro ao buscar avatar do usuário:", error)
      }
    }
    fetchUserAvatar()

    const handleAvatarUpdate = (event: CustomEvent<{ avatar: string }>) => {
      setUserAvatar(event.detail.avatar)
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener)
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener)
    }
  }, [userEmail])

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:block">
        <div className="fixed h-screen w-64 flex flex-col border-r bg-white overflow-hidden">
          <div className="flex h-16 items-center border-b px-4 flex-shrink-0 justify-center">
            <Link href={routes.dashboard.home} className="flex items-center gap-8">
              <ProductBrand />
            </Link>
          </div>

          <div className="flex flex-col overflow-y-auto flex-1">
            <div className="p-4 text-sm font-medium">Menu</div>
            <nav className="px-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isMenuItemActive(item.href)
                      ? "bg-upe-blue text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-upe-blue"
                  } ${item.disabled ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.label === "Avaliações" && pendingCount > 0 && (
                    <Badge className="ml-auto bg-upe-red text-white">{pendingCount}</Badge>
                  )}
                </Link>
              ))}
            </nav>

            {isAdmin && (
              <>
                <Separator className="my-2" />
                <div className="p-4 text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-upe-blue" />
                  <span>Administração</span>
                </div>
                <nav className="px-2">
                  {adminItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isAdminItemActive(item.href)
                          ? "bg-upe-blue text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-upe-blue"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </div>

          <div className="border-t p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <UserAvatar avatar={userAvatar} name={userName} size="md" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">{userName}</span>
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={routes.dashboard.settings} className="w-full">Ver perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={() => signOut({ callbackUrl: routes.home })}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-64 flex-shrink-0"></div>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b bg-white px-4 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-4">
                <Link href={routes.dashboard.home} className="flex items-center gap-2">
                  <ProductBrand />
                </Link>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 text-sm font-medium">Menu</div>
              <nav className="px-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isMenuItemActive(item.href)
                        ? "bg-upe-blue text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-upe-blue"
                    } ${item.disabled ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={handleCloseMobileMenu}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.label === "Avaliações" && pendingCount > 0 && (
                      <Badge className="ml-auto bg-upe-red text-white">{pendingCount}</Badge>
                    )}
                  </Link>
                ))}
              </nav>

              {isAdmin && (
                <>
                  <Separator className="my-2" />
                  <div className="p-4 text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-upe-blue" />
                    <span>Administração</span>
                  </div>
                  <nav className="px-2">
                    {adminItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isAdminItemActive(item.href)
                            ? "bg-upe-blue text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-upe-blue"
                        }`}
                        onClick={handleCloseMobileMenu}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </>
              )}

              <div className="absolute bottom-4 left-4 right-4 border-t pt-4">
                <div className="flex items-center gap-3">
                  <UserAvatar avatar={userAvatar} name={userName} size="md" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{userName}</span>
                    <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 ml-4">
            <ProductBrand />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-upe-red text-[10px] font-medium text-white">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-medium">Notificações</div>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto p-2">
                  <p className="text-sm text-muted-foreground">Você tem 3 notificações não lidas</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <UserAvatar avatar={userAvatar} name={userName} size="md" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={routes.dashboard.settings} className="w-full">Ver perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => signOut({ callbackUrl: routes.home })}
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 w-full overflow-auto">{children}</main>
      </div>
    </div>
  )
}
