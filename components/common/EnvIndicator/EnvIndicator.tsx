"use client"

/**
 * Posições disponíveis para o EnvIndicator
 */
export type EnvIndicatorPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left"

/**
 * Props para o componente EnvIndicator
 */
export interface EnvIndicatorProps {
  /** Posição do indicador na tela */
  position?: EnvIndicatorPosition
  /** Classe CSS adicional */
  className?: string
}

/**
 * Componente EnvIndicator
 * 
 * Componente de debug que mostra em qual ambiente o app está rodando.
 * Apenas visível em desenvolvimento (NODE_ENV !== 'production').
 * 
 * Exibe:
 * - Modo: LOCAL ou PRODUÇÃO (baseado em NEXT_PUBLIC_BASE_PATH)
 * - Path base da aplicação
 * - Indicador visual animado
 * 
 * @example
 * ```tsx
 * // Posição padrão (bottom-right)
 * <EnvIndicator />
 * 
 * // Posição customizada
 * <EnvIndicator position="top-left" />
 * 
 * // Com classe adicional
 * <EnvIndicator position="bottom-left" className="opacity-75" />
 * ```
 */
export function EnvIndicator({
  position = "bottom-right",
  className = ""
}: EnvIndicatorProps) {
  // Não mostrar em produção
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH
  const mode = basePath ? 'PRODUÇÃO' : 'LOCAL'
  const color = basePath ? 'bg-red-500' : 'bg-green-500'
  const path = basePath || '/'
  
  /**
   * Determina as classes CSS de posicionamento baseado na prop position
   */
  const getPositionClasses = (): string => {
    switch (position) {
      case "bottom-left":
        return "bottom-4 left-4"
      case "top-right":
        return "top-4 right-4"
      case "top-left":
        return "top-4 left-4"
      case "bottom-right":
      default:
        return "bottom-4 right-4"
    }
  }
  
  return (
    <div 
      className={`fixed ${getPositionClasses()} ${color} text-white px-3 py-2 rounded-lg text-xs font-mono z-50 shadow-lg border-2 border-white/20 ${className}`}
      title="Indicador de ambiente (apenas em desenvolvimento)"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <div>
          <div className="font-bold">{mode}</div>
          <div className="text-white/80">{path}</div>
        </div>
      </div>
    </div>
  )
}
