import type { Metadata } from 'next'
import { brand } from '@/lib/config/brand'
import './globals.css'
import { Providers } from "./providers"
import { EnvIndicator } from "@/components/common"

export const metadata: Metadata = {
  title: brand.name,
  description: brand.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="pt-BR" />
      </head>
      <body>
        <Providers>
          {children}
          <EnvIndicator />
        </Providers>
      </body>
    </html>
  )
}
