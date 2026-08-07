import { Navbar } from '@/components/marketing/navbar/Navbar'
import { Footer } from '@/components/marketing/footer/Footer'
import { AuthRedirect } from '@/components/shared/AuthRedirect'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OmniFlow',
    applicationCategory: 'BusinessApplication',
    description:
      "OmniFlow est une plateforme d'IA de chatting pour agences de créateurs : mémoire des fans, scripts de vente, tarification maîtrisée, en mode Copilot ou Full AI.",
    url: 'https://omniflowapp.ai',
    offers: [
      {
        '@type': 'Offer',
        name: 'Copilot',
        price: '99',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        name: 'Full AI',
        price: '199',
        priceCurrency: 'EUR',
      },
    ],
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
