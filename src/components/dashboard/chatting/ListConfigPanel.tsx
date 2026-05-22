'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface ListConfig {
  id?: string
  platform: 'onlyfans' | 'mym'
  personalityType: string
  ppvFrequency: 'never' | 'low' | 'moderate' | 'high' | 'always'
  ppvPriceMin: number
  ppvPriceMax: number
  relationalMode: boolean
  toneNotes: string
  responseDelaySeconds: number
}

const PPV_FREQUENCY_OPTIONS = [
  { value: 'never', label: 'Jamais', desc: 'Pas de push PPV automatique' },
  { value: 'low', label: 'Faible (1/10 msgs)', desc: '1 PPV pour 10 messages' },
  { value: 'moderate', label: 'Modérée (1/5 msgs)', desc: '1 PPV pour 5 messages' },
  { value: 'high', label: 'Élevée (1/3 msgs)', desc: '1 PPV pour 3 messages' },
  { value: 'always', label: 'Maximum', desc: 'Pousser le PPV dès que possible' },
]

const PERSONALITY_TYPES = [
  'gfe', 'milf', 'fitness', 'baddie', 'shy', 'influencer', 'gothic'
]

export function ListConfigPanel() {
  const [configs, setConfigs] = useState<Record<'onlyfans' | 'mym', ListConfig | null>>({
    onlyfans: null,
    mym: null,
  })
  const [activeTab, setActiveTab] = useState<'onlyfans' | 'mym'>('onlyfans')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Form state
  const [form, setForm] = useState<ListConfig>({
    platform: 'onlyfans',
    personalityType: 'gfe',
    ppvFrequency: 'moderate',
    ppvPriceMin: 5,
    ppvPriceMax: 30,
    relationalMode: true,
    toneNotes: '',
    responseDelaySeconds: 60,
  })

  useEffect(() => {
    loadConfigs()
  }, [])

  useEffect(() => {
    if (configs[activeTab]) {
      setForm(configs[activeTab]!)
    }
  }, [activeTab, configs])

  const loadConfigs = async () => {
    try {
      const res = await fetch('/api/chatting/config')
      if (res.ok) {
        const data = await res.json()
        setConfigs({
          onlyfans: data.onlyfans,
          mym: data.mym,
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
      const res = await fetch('/api/chatting/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const saved = await res.json()
        setConfigs(prev => ({
          ...prev,
          [activeTab]: saved,
        }))
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
      {/* Platform Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(['onlyfans', 'mym'] as const).map(platform => (
          <button
            key={platform}
            onClick={() => {
              setActiveTab(platform)
              setForm(configs[platform] || {
                platform,
                personalityType: 'gfe',
                ppvFrequency: 'moderate',
                ppvPriceMin: 5,
                ppvPriceMax: 30,
                relationalMode: true,
                toneNotes: '',
                responseDelaySeconds: 60,
              })
            }}
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
      <div className="space-y-5">
        {/* Personality Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profil de Personnalité
          </label>
          <select
            value={form.personalityType}
            onChange={(e) => setForm({ ...form, personalityType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:border-violet-500 focus:outline-none"
          >
            {PERSONALITY_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* PPV Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Fréquence de Push PPV
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PPV_FREQUENCY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setForm({ ...form, ppvFrequency: option.value as typeof form.ppvFrequency })}
                className={`p-3 rounded-lg border transition-all text-left text-sm ${
                  form.ppvFrequency === option.value
                    ? 'border-violet-500 bg-violet-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="font-medium text-white">{option.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* PPV Price Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prix PPV Min (€)
            </label>
            <input
              type="number"
              value={form.ppvPriceMin}
              onChange={(e) => setForm({ ...form, ppvPriceMin: parseInt(e.target.value) })}
              min="1"
              max="100"
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prix PPV Max (€)
            </label>
            <input
              type="number"
              value={form.ppvPriceMax}
              onChange={(e) => setForm({ ...form, ppvPriceMax: parseInt(e.target.value) })}
              min="1"
              max="100"
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Response Delay */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Délai de Réponse (secondes)
          </label>
          <input
            type="number"
            value={form.responseDelaySeconds}
            onChange={(e) => setForm({ ...form, responseDelaySeconds: parseInt(e.target.value) })}
            min="0"
            max="300"
            step="10"
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:border-violet-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Délai avant d'envoyer la réponse IA (crée une impression plus naturelle)
          </p>
        </div>

        {/* Relational Mode */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.relationalMode}
              onChange={(e) => setForm({ ...form, relationalMode: e.target.checked })}
              className="mt-1 w-4 h-4"
            />
            <div>
              <div className="font-medium text-white">Mode Relationnel</div>
              <p className="text-xs text-gray-500 mt-1">
                Si activé, l'IA détecte les moments émotionnels (fan parle de sa vie perso, tristesse, solitude) 
                et prioritise la création de lien plutôt que de pousser du contenu payant. Le PPV viendra plus tard.
              </p>
            </div>
          </label>
        </div>

        {/* Tone Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Instructions Libres pour l'IA
          </label>
          <textarea
            value={form.toneNotes}
            onChange={(e) => setForm({ ...form, toneNotes: e.target.value })}
            placeholder="Ex: 'Toujours finir par une question', 'Ne jamais utiliser d'emojis', 'Utiliser des abréviations SMS', etc."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:border-violet-500 focus:outline-none placeholder-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ajouter des instructions spécifiques que l'IA doit suivre pour cette liste
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-3 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
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
