"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"

/**
 * Props for the UserAvatar component
 */
export interface UserAvatarProps {
  /** Avatar URL or path */
  avatar?: string | null
  /** User name for fallback initials */
  name: string
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl"
  /** Additional CSS classes */
  className?: string
}

/**
 * Size configurations for avatar
 */
const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-16 w-16 text-2xl"
} as const

/**
 * UserAvatar Component
 * 
 * Reusable avatar component that handles image URL resolution
 * and fallback initials generation.
 * 
 * @example
 * ```tsx
 * <UserAvatar 
 *   avatar={user.avatar} 
 *   name={user.name} 
 *   size="md" 
 * />
 * ```
 */
export function UserAvatar({ 
  avatar, 
  name, 
  size = "md", 
  className 
}: UserAvatarProps) {
  const avatarSrc = avatar 
    ? getImageUrl(avatar) 
    : getImageUrl("/images/placeholders/avatar.png")

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatarSrc} alt={`Avatar de ${name}`} />
      <AvatarFallback className="bg-upe-blue text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
