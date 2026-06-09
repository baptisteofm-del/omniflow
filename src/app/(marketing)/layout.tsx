import { Navbar } from '@/components/marketing/navbar/Navbar'
import { Footer } from '@/components/marketing/footer/Footer'
import { AuthRedirect } from '@/components/shared/AuthRedirect'
import { SupportChat } from '@/components/shared/SupportChat'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OmniFlow',
    applicationCategory: 'BusinessApplication',
    description:
      'La plateforme d\'automatisation #1 pour les agences OnlyFans. Autoposting, génération vidéo IA, Chatting IA, Veille Trends, et prospection automatisée.',
    url: 'https://omniflowapp.ai',
    image: '/og',
    featureList: [
      'Autoposting multi-comptes',
      'Génération vidéo IA (Kling)',
      'Chatting IA pour maximiser la conversion',
      'Veille Trends Instagram',
      'Prospection de modèles automatisée',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Plan Starter',
        price: '99',
        priceCurrency: 'EUR',
        priceValidUntil: '2025-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Plan Pro',
        price: '199',
        priceCurrency: 'EUR',
        priceValidUntil: '2025-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Plan Agency',
        price: '349',
        priceCurrency: 'EUR',
        priceValidUntil: '2025-12-31',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuthRedirect />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <SupportChat />
    </>
  )
}
