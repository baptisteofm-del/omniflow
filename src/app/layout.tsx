import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Omniflow — La plateforme des agences OnlyFans',
  description:
    'Automatisez votre agence OnlyFans : veille contenu, édition vidéo, génération IA, posting multi-comptes, bots Telegram, et dashboard financier. Tout en un.',
  keywords: ['onlyfans agency', 'automatisation agence', 'of management', 'content creator tools'],
  icons: {
    icon: '/logo-icon.svg',
    shortcut: '/logo-icon.svg',
  },
  openGraph: {
    title: 'Omniflow',
    description: 'La plateforme tout-en-un pour les agences OnlyFans',
    url: 'https://omniflowapp.ai',
    siteName: 'Omniflow',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Omniflow - La plateforme #1 des agences OnlyFans' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} bg-[#0a0a0f] text-white antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            },
          }}
        />
      </body>
    </html>
  )
}
