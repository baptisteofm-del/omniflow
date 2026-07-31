import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OmniFlow - Plateforme pour agences OnlyFans',
  description: 'Automatisez votre agence OnlyFans avec OmniFlow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-[#0a0a0f] text-white">{children}</body>
    </html>
  )
}
