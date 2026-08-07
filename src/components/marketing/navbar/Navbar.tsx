'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#product', label: 'Produit' },
  { href: '#how-it-works', label: 'Comment ça marche' },
  { href: '#pricing', label: 'Tarifs' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-[color:var(--background)]/80 backdrop-blur-xl border-b border-[color:var(--border)]' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full" priority />
          <span className="text-lg font-semibold tracking-tight">
            Omni<span className="gradient-text">Flow</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[color:var(--foreground-muted)] transition-colors hover:text-[color:var(--foreground)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-[color:var(--foreground-muted)] transition-colors hover:text-[color:var(--foreground)] sm:block"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="gradient-bg-signature rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Commencer
          </Link>
        </div>
      </nav>
    </header>
  )
}
