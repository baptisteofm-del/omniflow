import { PricingSection } from '@/components/marketing/pricing/PricingSection'
import { Navbar } from '@/components/marketing/navbar/Navbar'
import { Footer } from '@/components/marketing/footer/Footer'

export const metadata = {
  title: 'Tarifs — OmniFlow',
  description: 'Choisissez la formule adaptée à votre agence OnlyFans. 7 jours d\'essai gratuit.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <PricingSection />
      </main>
      <Footer />
    </>
  )
}
