"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WordCloudData } from "@/types/entities/response"

interface WordCloudProps {
  data: WordCloudData[]
  title: string
  description?: string
  height?: number
  maxWords?: number
}

// Componente simples de nuvem de palavras sem dependências externas
export function SimpleWordCloud({ 
  data, 
  title, 
  description, 
  height = 300, 
  maxWords = 50 
}: WordCloudProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhuma palavra encontrada
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pegar apenas as palavras mais frequentes
  const topWords = data.slice(0, maxWords)
  
  // Definir tamanhos baseados na frequência
  const maxSize = Math.max(...topWords.map(w => w.size))
  const minSize = Math.min(...topWords.map(w => w.size))
  
  const getWordStyle = (word: WordCloudData) => {
    // Normalizar tamanho entre 12px e 48px
    const normalizedSize = minSize === maxSize 
      ? 24 
      : 12 + ((word.size - minSize) / (maxSize - minSize)) * 36
    
    // Cores baseadas na frequência
    const opacity = 0.5 + (word.size / maxSize) * 0.5
    
    return {
      fontSize: `${normalizedSize}px`,
      color: word.color || `rgba(0, 136, 254, ${opacity})`,
      fontWeight: word.size > maxSize * 0.7 ? 'bold' : 'normal',
      margin: '4px 8px',
      display: 'inline-block',
      cursor: 'default',
      transition: 'all 0.2s ease',
      padding: '2px 4px',
      borderRadius: '4px'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div 
          className="flex flex-wrap justify-center items-center p-4 bg-gray-50 rounded-lg"
          style={{ height: `${height}px`, overflow: 'hidden' }}
        >
          {topWords.map((word, index) => (
            <span
              key={index}
              style={getWordStyle(word)}
              className="hover:bg-gray-200 hover:scale-110"
              title={`"${word.text}" aparece ${word.size} ${word.size === 1 ? 'vez' : 'vezes'}`}
            >
              {word.text}
            </span>
          ))}
        </div>
        
        {/* Legenda */}
        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>Palavras mais frequentes nas respostas de texto</p>
          <p>Tamanho indica frequência • Passe o mouse para ver detalhes</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente mais elaborado com distribuição em grade
export function GridWordCloud({ 
  data, 
  title, 
  description, 
  height = 300, 
  maxWords = 30 
}: WordCloudProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhuma palavra encontrada
          </div>
        </CardContent>
      </Card>
    )
  }

  const topWords = data.slice(0, maxWords)
  const maxSize = Math.max(...topWords.map(w => w.size))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" style={{ height: `${height}px`, overflow: 'auto' }}>
          {topWords.map((word, index) => {
            const percentage = (word.size / maxSize) * 100
            return (
              <div
                key={index}
                className="flex flex-col items-center p-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-default"
                title={`"${word.text}" aparece ${word.size} ${word.size === 1 ? 'vez' : 'vezes'}`}
              >
                <span 
                  className="font-medium text-center break-words"
                  style={{ 
                    color: word.color || '#0088FE',
                    fontSize: percentage > 70 ? '16px' : percentage > 40 ? '14px' : '12px'
                  }}
                >
                  {word.text}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {word.size}x
                </span>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Export padrão para uso geral
export { SimpleWordCloud as WordCloud }
