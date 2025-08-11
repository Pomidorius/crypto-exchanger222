// src/app/layout.tsx
import './globals.css'
import type { ReactNode } from 'react'
import { Providers } from './components/Providers'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>CryptoExchanger</title>
        <meta name="description" content="Мгновенный обмен криптовалют" />
      </head>
      <body className="layout-body">
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
