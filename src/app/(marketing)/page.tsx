import { Hero } from '@/components/marketing/hero/Hero'
import { AnimatedBanner } from '@/components/marketing/banner/AnimatedBanner'
import { AISalesEngine } from '@/components/marketing/banner/AISalesEngine'
import { ComparisonSection } from '@/components/marketing/comparison/ComparisonSection'
import { ModesComparison } from '@/components/marketing/modes/ModesComparison'
import { EconomicCalculator } from '@/components/marketing/calculator/EconomicCalculator'
import { PricingSection } from '@/components/marketing/pricing/PricingSection'
import { FaqSection } from '@/components/marketing/faq/FaqSection'
import { FinalCta } from '@/components/marketing/cta/FinalCta'

export default function HomePage() {
  return (
    <>
      <Hero />
      <AnimatedBanner />
      <AISalesEngine />
      <ComparisonSection />
      <ModesComparison />
      <EconomicCalculator />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  )
}
