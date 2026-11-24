"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LazyChartWrapperProps {
  children: ReactNode
  title?: string
  description?: string
  height?: number
  fallback?: ReactNode
  threshold?: number
}

export function LazyChartWrapper({
  children,
  title,
  description,
  height = 300,
  fallback,
  threshold = 0.1
}: LazyChartWrapperProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true)
            setHasLoaded(true)
          }
        })
      },
      {
        threshold,
        rootMargin: "50px"
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [hasLoaded, threshold])

  const defaultFallback = (
    <div 
      className="flex items-center justify-center bg-gray-50 rounded-lg"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Carregando gráfico...
        </p>
      </div>
    </div>
  )

  const content = (
    <div ref={containerRef}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  )

  if (title || description) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    )
  }

  return content
}
