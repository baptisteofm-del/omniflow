'use client'

import { X } from 'lucide-react'
import { NewMockConversationForm } from '@/components/app/inbox/NewMockConversationForm'

export function NewConversationModal({
  creators,
  onClose,
}: {
  creators: { id: string; display_name: string }[]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass w-full max-w-sm rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Nouvelle conversation de test</h2>
          <button onClick={onClose} className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <NewMockConversationForm creators={creators} />
      </div>
    </div>
  )
}
