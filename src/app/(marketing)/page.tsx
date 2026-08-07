import { Hero } from '@/components/marketing/hero/Hero'
import { ProductValue } from '@/components/marketing/value/ProductValue'
import { ModesComparison } from '@/components/marketing/modes/ModesComparison'
import { PricingSection } from '@/components/marketing/pricing/PricingSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductValue />
      <ModesComparison />
      <PricingSection />
    </>
  )
}
