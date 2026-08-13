'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Video, Paperclip, X, ArrowLeft, Loader2, Send } from 'lucide-react'
import { sendMediaOffer } from '@/lib/inbox/actions'

export interface SellableMedia {
  id: string
  title: string
  mediaType: string
  targetPrice: number | null
  minimumPrice: number
  currency: string
  signedUrl: string | null
}

// Inbox V2 spec §13-14: media/PPV must be reachable from the composer
// without leaving the Inbox — SELECT MEDIA → SET PRICE → OPTIONAL MESSAGE →
// PREVIEW → SEND, price always re-validated server-side (sendMediaOffer)
// against the same Pricing Validator the Script Engine uses, never trusted
// from this form alone.
export function MediaPickerDrawer({ conversationId, media }: { conversationId: string; media: SellableMedia[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<SellableMedia | null>(null)
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const close = () => {
    setIsOpen(false)
    setSelected(null)
    setPrice('')
    setNote('')
    setError(null)
  }

  const selectMedia = (m: SellableMedia) => {
    setSelected(m)
    setPrice(String(m.targetPrice ?? m.minimumPrice))
    setError(null)
  }

  const send = () => {
    if (!selected) return
    const priceNumber = Number(price)
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError('Prix invalide')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await sendMediaOffer(conversationId, selected.id, priceNumber, note)
        router.refresh()
        close()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de l'envoi")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Envoyer un média payant"
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[color:var(--cyan)]/30 px-3 text-xs font-medium text-[color:var(--cyan)] transition-colors hover:border-[color:var(--cyan)]/60 hover:bg-[color:var(--cyan)]/10"
      >
        <Paperclip className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Médias</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={close}>
          <div
            className="glass max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {selected && (
                  <button onClick={() => setSelected(null)} className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                {selected ? 'Envoyer ce média' : 'Choisir un média'}
              </div>
              <button onClick={close} className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!selected ? (
              <div className="max-h-[60vh] overflow-y-auto p-5">
                {media.length === 0 ? (
                  <p className="text-center text-sm text-[color:var(--foreground-muted)]">
                    Aucun média vendable pour cette créatrice — ajoutez-en un dans la Bibliothèque.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {media.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => selectMedia(m)}
                        className="group flex flex-col overflow-hidden rounded-xl border border-[color:var(--border)] text-left transition-colors hover:border-[color:var(--border-strong)]"
                      >
                        <div className="flex aspect-square items-center justify-center bg-[color:var(--surface-elevated)]">
                          {m.signedUrl && m.mediaType === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.signedUrl} alt={m.title} className="h-full w-full object-cover" />
                          ) : m.mediaType === 'video' ? (
                            <Video className="h-6 w-6 text-[color:var(--foreground-muted)]" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-[color:var(--foreground-muted)]" />
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate text-[11px] font-medium">{m.title}</p>
                          <p className="text-[10px] text-[color:var(--foreground-muted)]">
                            dès {m.targetPrice ?? m.minimumPrice}€
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[color:var(--surface-elevated)]">
                    {selected.signedUrl && selected.mediaType === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selected.signedUrl} alt={selected.title} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-[color:var(--foreground-muted)]" />
                    )}
                  </div>
                  <p className="text-sm font-medium">{selected.title}</p>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">
                    Prix (minimum {selected.minimumPrice}€)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={selected.minimumPrice}
                    className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Message (optionnel)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder={`${selected.title} — ${price || selected.minimumPrice}€`}
                    className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
                  />
                </div>

                {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}

                <button
                  onClick={send}
                  disabled={isPending}
                  className="gradient-bg-signature flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Envoyer le PPV
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
