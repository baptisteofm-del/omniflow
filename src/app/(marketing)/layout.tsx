import { Navbar } from '@/components/marketing/navbar/Navbar'
import { Footer } from '@/components/marketing/footer/Footer'
import { AuthRedirect } from '@/components/shared/AuthRedirect'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Omniflow',
    applicationCategory: 'BusinessApplication',
    description:
      'La plateforme d\'automatisation #1 pour les agences OnlyFans. Posting multi-comptes, génération vidéo IA, analyse fans, et bien plus.',
    url: 'https://omniflowapp.ai',
    image: '/og',
    featureList: [
      'Posting automatisé multi-comptes',
      'Génération vidéo IA',
      'Dashboard financier temps réel',
      'Chatting IA pour DMs',
      'Veille contenu intelligente',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Plan Starter',
        price: '49',
        priceCurrency: 'EUR',
        priceValidUntil: '2025-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Plan Pro',
        price: '99',
        priceCurrency: 'EUR',
        priceValidUntil: '2025-12-31',
      },
      {
        '@type': 'Offer',
        name: 'Plan Agency',
        price: '249',
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
    </>
  )
}
