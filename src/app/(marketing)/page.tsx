import { Hero } from '@/components/marketing/hero/Hero'
import { Features } from '@/components/marketing/features/Features'
import { DemosSection } from '@/components/marketing/demos/DemosSection'
import { Testimonials } from '@/components/marketing/testimonials/Testimonials'
import { PricingSection } from '@/components/marketing/pricing/PricingSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <DemosSection />
      <Testimonials />
      <PricingSection />
    </>
  )
}
