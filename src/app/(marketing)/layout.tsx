import { Navbar } from '@/components/marketing/navbar/Navbar'
import { Footer } from '@/components/marketing/footer/Footer'
import { AuthRedirect } from '@/components/shared/AuthRedirect'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthRedirect />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
