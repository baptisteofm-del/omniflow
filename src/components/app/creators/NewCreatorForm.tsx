'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { createCreator } from '@/lib/creators/actions'

const SLIDERS: { key: string; label: string; hint: string }[] = [
  { key: 'warmth', label: 'Chaleur', hint: 'Distant ↔ Très chaleureux' },
  { key: 'flirt_intensity', label: 'Flirt', hint: 'Neutre ↔ Très flirt' },
  { key: 'directness', label: 'Franchise', hint: 'Suggestif ↔ Très direct' },
  { key: 'sales_aggressiveness', label: 'Agressivité commerciale', hint: 'Discret ↔ Très commercial' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="gradient-bg-signature flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Création...' : 'Créer la créatrice'}
    </button>
  )
}

export function NewCreatorForm() {
  const [sliders, setSliders] = useState<Record<string, number>>({
    warmth: 50,
    flirt_intensity: 50,
    directness: 50,
    sales_aggressiveness: 50,
  })

  return (
    <form action={createCreator} className="space-y-8">
      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-sm font-semibold text-[color:var(--foreground-muted)]">Identité</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm">Nom de la créatrice</label>
            <input
              name="display_name"
              required
              placeholder="Emma"
              className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm">Langue principale</label>
            <select
              name="default_language"
              defaultValue="fr"
              className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </select>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-1 text-sm font-semibold text-[color:var(--foreground-muted)]">Model DNA — Mode simple</h2>
        <p className="mb-5 text-xs text-[color:var(--foreground-muted)]">
          Ces réglages définissent la personnalité de l&apos;IA pour cette créatrice. Modifiable à tout moment.
        </p>
        <div className="space-y-5">
          {SLIDERS.map(({ key, label, hint }) => (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span>{label}</span>
                <span className="text-[color:var(--foreground-muted)]">{sliders[key]}</span>
              </div>
              <input
                type="range"
                name={key}
                min={0}
                max={100}
                value={sliders[key]}
                onChange={(e) => setSliders((s) => ({ ...s, [key]: Number(e.target.value) }))}
                className="w-full accent-[color:var(--violet)]"
              />
              <p className="mt-1 text-xs text-[color:var(--foreground-muted)]">{hint}</p>
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm">Longueur des messages</label>
              <select
                name="message_length"
                defaultValue="medium"
                className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
              >
                <option value="very_short">Très courte</option>
                <option value="short">Courte</option>
                <option value="medium">Moyenne</option>
                <option value="long">Longue</option>
                <option value="adaptive">Adaptative</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm">Usage d&apos;emojis</label>
              <select
                name="emoji_style"
                defaultValue="medium"
                className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
              >
                <option value="off">Aucun</option>
                <option value="low">Faible</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-sm font-semibold text-[color:var(--foreground-muted)]">Réglages commerciaux</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm">
            <span>Négociation autorisée</span>
            <input type="checkbox" name="negotiation_enabled" className="h-4 w-4 accent-[color:var(--violet)]" />
          </label>
          <div>
            <label className="mb-1.5 block text-sm">Remise maximum autorisée (%)</label>
            <input
              type="number"
              name="max_discount_percent"
              min={0}
              max={100}
              defaultValue={0}
              className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
            />
          </div>
          <label className="flex items-center justify-between rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm">
            <span>Contenu personnalisé (custom) autorisé</span>
            <input type="checkbox" name="custom_content_enabled" className="h-4 w-4 accent-[color:var(--violet)]" />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm">
            <span>Sessions live autorisées</span>
            <input type="checkbox" name="live_session_enabled" className="h-4 w-4 accent-[color:var(--violet)]" />
          </label>
        </div>
      </section>

      <SubmitButton />
    </form>
  )
}
