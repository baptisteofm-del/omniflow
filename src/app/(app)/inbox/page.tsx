import { MessageSquare } from 'lucide-react'

// Shown in the layout's detail pane when no conversation is selected yet —
// the list itself now lives in layout.tsx (see InboxSidebar), always
// visible on the left regardless of which conversation (if any) is open.
export default function InboxEmptyState() {
  return (
    <div className="glass gradient-ambient flex h-full flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <div className="glow-sm mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
        <MessageSquare className="h-6 w-6 text-[color:var(--cyan)]" />
      </div>
      <h2 className="gradient-text text-lg font-semibold">Sélectionnez une conversation</h2>
      <p className="mt-1.5 max-w-sm text-sm text-[color:var(--foreground-muted)]">
        Choisissez une conversation à gauche, ou démarrez-en une nouvelle avec le bouton + en haut de la liste.
      </p>
    </div>
  )
}
