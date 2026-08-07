import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo-mark.png" alt="" width={24} height={24} className="h-6 w-6 rounded-full" />
              <span className="font-semibold">
                Omni<span className="gradient-text">Flow</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-[color:var(--foreground-muted)]">
              L&apos;IA de chatting pour agences de créateurs — Copilot &amp; Full AI.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-[color:var(--foreground)]">Produit</span>
              <a href="#product" className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                Tarifs
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-[color:var(--foreground)]">Compte</span>
              <Link href="/login" className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                Connexion
              </Link>
              <Link href="/register" className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[color:var(--border)] pt-6 text-xs text-[color:var(--foreground-muted)] sm:flex-row">
          <span>© {new Date().getFullYear()} OmniFlow. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  )
}
