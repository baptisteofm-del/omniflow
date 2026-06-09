import { PricingSection } from '@/components/marketing/pricing/PricingSection'
import { Navbar } from '@/components/marketing/navbar/Navbar'
import { Footer } from '@/components/marketing/footer/Footer'

export const metadata = {
  title: 'Tarifs — OmniFlow',
  description: 'Choisissez la formule adaptée à votre agence OnlyFans. Starter 99€ • Pro 199€ • Agency 349€',
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
