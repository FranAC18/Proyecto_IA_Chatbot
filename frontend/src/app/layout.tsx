import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Book AI Assistant - Chatbot Académico',
  description: 'Chatbot conversacional para buscar información en el libro de Inteligencia Artificial',
  keywords: ['IA', 'Chatbot', 'Inteligencia Artificial', 'PDF', 'Búsqueda semántica', 'Windows'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}