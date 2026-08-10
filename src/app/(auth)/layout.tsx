import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gradient-ambient flex min-h-screen flex-col items-center justify-center bg-[color:var(--background)] px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-semibold">
        <Image src="/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" priority />
        <span>
          Omni<span className="gradient-text">Flow</span>
        </span>
      </Link>
      {children}
    </div>
  )
}
