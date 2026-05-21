import { Navbar } from '@/components/marketing/navbar/Navbar'
import { Footer } from '@/components/marketing/footer/Footer'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="gradient-bg">{children}</main>
      <Footer />
    </>
  )
}
