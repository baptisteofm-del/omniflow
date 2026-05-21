import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Omniflow — La plateforme #1 des agences OnlyFans',
    template: '%s | Omniflow',
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
  authors: [{ name: 'Omniflow' }],
  creator: 'Omniflow',
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
    title: 'Omniflow — La plateforme #1 des agences OnlyFans',
    description:
      'Automatisez votre agence OnlyFans : posting multi-comptes, génération vidéo IA, analyse fans, dashboard financier. Économisez sur les VAs, scalez plus vite.',
    url: 'https://omniflowapp.ai',
    siteName: 'Omniflow',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Omniflow - La plateforme #1 des agences OnlyFans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omniflow',
    description:
      'La plateforme d\'automatisation #1 pour les agences OnlyFans',
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
