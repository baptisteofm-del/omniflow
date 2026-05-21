import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { PWARegister } from '@/components/shared/PWARegister'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'OmniFlow — La plateforme #1 des agences OnlyFans',
    template: '%s | OmniFlow',
  },
  description:
    'Automatisez votre agence OnlyFans : posting multi-comptes, génération vidéo IA, analyse fans, dashboard financier. Économisez sur les VAs, scalez plus vite.',
  keywords: [
    'onlyfans agency management',
    'automatisation agence onlyfans',
    'of management software',
    'geelark posting',
    'adspower onlyfans',
    'chatting ia onlyfans',
    'mym agency',
  ],
  authors: [{ name: 'OmniFlow' }],
  creator: 'OmniFlow',
  metadataBase: new URL('https://omniflowapp.ai'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo-icon.svg',
    shortcut: '/logo-icon.svg',
  },
  openGraph: {
    title: 'OmniFlow — La plateforme #1 des agences OnlyFans',
    description:
      'Automatisez votre agence OnlyFans : posting multi-comptes, génération vidéo IA, analyse fans, dashboard financier. Économisez sur les VAs, scalez plus vite.',
    url: 'https://omniflowapp.ai',
    siteName: 'OmniFlow',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'OmniFlow - La plateforme #1 des agences OnlyFans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniFlow',
    description:
      'La plateforme d\'automatisation #1 pour les agences OnlyFans',
    images: ['/og'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OmniFlow" />
        <link rel="apple-touch-icon" href="/logo-icon.svg" />
      </head>
      <body className={`${inter.className} bg-[#0a0a0f] text-white antialiased`}>
        {children}
        <PWARegister />
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
