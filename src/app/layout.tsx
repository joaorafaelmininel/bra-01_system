import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BRA-01 — Sistema de Gestão INSARAG',
  description: 'BRA-01 Heavy USAR Team',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}