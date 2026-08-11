import { Lock } from 'lucide-react'

export function AccessRestricted({ feature }: { feature: string }) {
  return (
    <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
        <Lock className="h-6 w-6 text-[color:var(--foreground-muted)]" />
      </div>
      <h2 className="text-base font-semibold">Accès restreint</h2>
      <p className="mt-1 max-w-sm text-sm text-[color:var(--foreground-muted)]">
        Votre rôle ne donne pas accès à {feature}. Un administrateur de l&apos;agence peut ajuster vos permissions dans Équipe.
      </p>
    </div>
  )
}
