import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// FORCE BUILD - DO NOT CACHE - NEW VERSION DEPLOYED
// Timestamp: 2026-07-31T16:45:00Z

export const metadata: Metadata = {
  title: 'OmniFlow',
  description: 'Platform pour agences OnlyFans - Chatting IA uniquement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
// Clean deploy 1785512259
