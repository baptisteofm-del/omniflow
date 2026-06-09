'use client'

import { useState, useEffect } from 'react'
import { Save, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface ModelAIConfig {
  id?: string
  platform: 'onlyfans' | 'mym'
  // Personnalité
  personality: string
  personalityCustom?: string
  // Instructions personnalisées
  customInstructions: string
  // Intensité commerciale
  salesIntensity: 'low' | 'moderate' | 'high'
  // Mode relationnel
  relationshipMode: string
}

const PERSONALITIES = [
  'GFE',
  'MILF',
  'Influenceuse',
  'Girl Next Door',
  'Dominante',
  'Douce',
  'Coquine',
  'Autre',
]

const SALES_INTENSITY = [
  { id: 'low',      label: 'Faible',   desc: 'Vente rare, relationnel prioritaire' },
  { id: 'moderate', label: 'Modérée',  desc: 'Équilibre entre relation et vente' },
  { id: 'high',     label: 'Élevée',   desc: 'Monétisation fréquente et active' },
] as const

const RELATIONSHIP_MODES = ['Distant', 'Amical', 'Intime', 'Exclusif']

const DEFAULT_CONFIG = (platform: 'onlyfans' | 'mym'): ModelAIConfig => ({
  platform,
  personality: 'GFE',
  personalityCustom: '',
  customInstructions: '',
  salesIntensity: 'moderate',
  relationshipMode: 'Amical',
})

export function ListConfigPanel() {
  const [configs, setConfigs] = useState<Record<'onlyfans' | 'mym', ModelAIConfig | null>>({
    onlyfans: null,
    mym: null,
  })
  const [activeTab, setActiveTab] = useState<'onlyfans' | 'mym'>('onlyfans')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [form, setForm] = useState<ModelAIConfig>(DEFAULT_CONFIG('onlyfans'))

  useEffect(() => {
    loadConfigs()
  }, [])

  useEffect(() => {
    if (configs[activeTab]) {
      setForm(configs[activeTab]!)
    } else {
      setForm(DEFAULT_CONFIG(activeTab))
    }
  }, [activeTab, configs])

  const loadConfigs = async () => {
    try {
      const res = await fetch('/api/chatting/config')
      if (res.ok) {
        const data = await res.json()
        setConfigs({
          onlyfans: data.onlyfans ?? null,
          mym: data.mym ?? null,
        })
        if (data.onlyfans) {
          setForm(data.onlyfans)
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      toast.error('Impossible de charger la configuration')
    } finally {
      setLoaded(true)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, platform: activeTab }
      const res = await fetch('/api/chatting/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const saved = await res.json()
        setConfigs(prev => ({ ...prev, [activeTab]: saved }))
        toast.success('Configuration enregistrée ✓')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="animate-spin text-gray-400" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Platform / Model Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(['onlyfans', 'mym'] as const).map(platform => (
          <button
            key={platform}
            onClick={() => setActiveTab(platform)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === platform
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {platform === 'onlyfans' ? 'OnlyFans' : 'MYM'}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-6">

        {/* ── Section 1 : Personnalité ── */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Personnalité
          </h3>
          <div className="flex flex-wrap gap-2">
            {PERSONALITIES.map(p => (
              <button
                key={p}
                onClick={() => setForm({ ...form, personality: p })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  form.personality === p
                    ? 'border-violet-500 bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white shadow-sm shadow-violet-500/20'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {form.personality === 'Autre' && (
            <input
              type="text"
              value={form.personalityCustom ?? ''}
              onChange={(e) => setForm({ ...form, personalityCustom: e.target.value })}
              placeholder="Décrivez la personnalité..."
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm mt-2"
            />
          )}
        </div>

        {/* ── Section 2 : Instructions personnalisées ── */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Instructions personnalisées
          </h3>
          <textarea
            value={form.customInstructions}
            onChange={(e) => setForm({ ...form, customInstructions: e.target.value })}
            placeholder="Instructions spécifiques pour ce modèle... Ex: 'Toujours finir par une question', 'Ne jamais utiliser d'emojis', 'Utiliser des abréviations SMS'..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm resize-none"
          />
        </div>

        {/* ── Section 3 : Intensité commerciale ── */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Intensité commerciale
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {SALES_INTENSITY.map(option => (
              <label
                key={option.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  form.salesIntensity === option.id
                    ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-violet-500/5 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="salesIntensity"
                  value={option.id}
                  checked={form.salesIntensity === option.id}
                  onChange={() => setForm({ ...form, salesIntensity: option.id })}
                  className="mt-0.5 accent-cyan-500"
                />
                <div>
                  <div className={`text-sm font-medium ${form.salesIntensity === option.id ? 'text-white' : 'text-gray-300'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Section 4 : Mode relationnel ── */}
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
            Mode relationnel
          </h3>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_MODES.map(mode => (
              <button
                key={mode}
                onClick={() => setForm({ ...form, relationshipMode: mode })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.relationshipMode === mode
                    ? 'border-violet-500 bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white shadow-sm shadow-violet-500/20'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Définit la distance émotionnelle et le niveau d'intimité dans les échanges avec les fans.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
      >
        {saving ? (
          <>
            <Loader size={16} className="animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save size={16} />
            Enregistrer Configuration
          </>
        )}
      </button>
    </div>
  )
}
