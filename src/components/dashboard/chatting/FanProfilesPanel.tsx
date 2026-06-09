'use client'

import { useState } from 'react'
import { Users, Settings, Crown, Star, Award, Medal } from 'lucide-react'

interface FanProfile {
  fanId: string
  fanUsername?: string
  totalSpent: number
  messageCount: number
  lastActive: string
  tags: string[]
  notes: string
  tier: 'bronze' | 'silver' | 'gold' | 'vip'
}

interface FanProfileSettings {
  modelId: string
  autoCreateThreshold: number
  thresholds: {
    bronze: number
    silver: number
    gold: number
    vip: number
  }
}

interface Model {
  id: string
  name: string
}

interface FanProfilesPanelProps {
  models: Model[]
  fanProfiles?: FanProfile[]
}

const TIER_STYLES: Record<FanProfile['tier'], { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  bronze: {
    label: 'Bronze',
    color: 'text-amber-600',
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
    icon: <Medal size={12} />,
  },
  silver: {
    label: 'Silver',
    color: 'text-gray-300',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    icon: <Award size={12} />,
  },
  gold: {
    label: 'Gold',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    icon: <Star size={12} />,
  },
  vip: {
    label: 'VIP',
    color: 'text-purple-300',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    icon: <Crown size={12} />,
  },
}

const DEFAULT_SETTINGS: Omit<FanProfileSettings, 'modelId'> = {
  autoCreateThreshold: 50,
  thresholds: {
    bronze: 100,
    silver: 500,
    gold: 1000,
    vip: 2000,
  },
}

function computeTier(totalSpent: number, thresholds: FanProfileSettings['thresholds']): FanProfile['tier'] {
  if (totalSpent >= thresholds.vip) return 'vip'
  if (totalSpent >= thresholds.gold) return 'gold'
  if (totalSpent >= thresholds.silver) return 'silver'
  return 'bronze'
}

// Mock fan data for display when no real API data is available
const MOCK_FANS: Record<string, FanProfile[]> = {}

function generateMockFans(modelId: string, thresholds: FanProfileSettings['thresholds']): FanProfile[] {
  if (MOCK_FANS[modelId]) return MOCK_FANS[modelId]
  const mockSpends = [2500, 1200, 750, 320, 180, 90, 45]
  const mockNames = ['user_alex92', 'john_d_xx', 'fan_marco', 'pierre_l', 'kevin77', 'tom_fan', 'new_user']
  MOCK_FANS[modelId] = mockSpends.map((spent, i) => ({
    fanId: `mock-${modelId}-${i}`,
    fanUsername: mockNames[i],
    totalSpent: spent,
    messageCount: Math.floor(spent / 8),
    lastActive: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    tags: [],
    notes: '',
    tier: computeTier(spent, thresholds),
  }))
  return MOCK_FANS[modelId]
}

export function FanProfilesPanel({ models, fanProfiles }: FanProfilesPanelProps) {
  const [activeModelId, setActiveModelId] = useState<string>(models[0]?.id ?? '')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Record<string, FanProfileSettings>>(
    Object.fromEntries(models.map((m) => [m.id, { modelId: m.id, ...DEFAULT_SETTINGS }]))
  )
  const [editSettings, setEditSettings] = useState<FanProfileSettings>(
    settings[models[0]?.id] ?? { modelId: '', ...DEFAULT_SETTINGS }
  )

  const currentSettings = settings[activeModelId] ?? { modelId: activeModelId, ...DEFAULT_SETTINGS }

  const allFans = fanProfiles && fanProfiles.length > 0
    ? fanProfiles
    : generateMockFans(activeModelId, currentSettings.thresholds)

  // Group fans by tier
  const tierGroups: Record<FanProfile['tier'], FanProfile[]> = { vip: [], gold: [], silver: [], bronze: [] }
  for (const fan of allFans) {
    const tier = computeTier(fan.totalSpent, currentSettings.thresholds)
    tierGroups[tier].push({ ...fan, tier })
  }
  const orderedTiers: FanProfile['tier'][] = ['vip', 'gold', 'silver', 'bronze']

  const openSettings = () => {
    setEditSettings({ ...settings[activeModelId] ?? { modelId: activeModelId, ...DEFAULT_SETTINGS } })
    setShowSettings(true)
  }

  const saveSettings = () => {
    setSettings((prev) => ({ ...prev, [activeModelId]: { ...editSettings, modelId: activeModelId } }))
    setShowSettings(false)
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Users size={40} className="mx-auto mb-3 opacity-20" />
        <p>Aucun modèle configuré</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Model Tabs */}
      {models.length > 1 && (
        <div className="flex gap-2 border-b border-white/10 pb-0 overflow-x-auto">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setActiveModelId(model.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                activeModelId === model.id
                  ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>
      )}

      {/* Header with settings toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {models.find((m) => m.id === activeModelId)?.name ?? 'Modèle'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {allFans.length} profil{allFans.length !== 1 ? 's' : ''} fan
            {fanProfiles && fanProfiles.length === 0 ? ' (données de démonstration)' : ''}
          </p>
        </div>
        <button
          onClick={openSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-xs"
        >
          <Settings size={13} />
          Seuils
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-4">
          <h4 className="text-sm font-semibold text-white">Seuils de tier — {models.find((m) => m.id === activeModelId)?.name}</h4>

          <div className="grid grid-cols-2 gap-3">
            {(['bronze', 'silver', 'gold', 'vip'] as const).map((tier) => {
              const style = TIER_STYLES[tier]
              return (
                <div key={tier} className={`p-3 rounded-lg border ${style.border} ${style.bg}`}>
                  <label className={`flex items-center gap-1.5 text-xs font-medium mb-2 ${style.color}`}>
                    {style.icon}
                    {style.label}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-xs">Dépensé &gt;</span>
                    <input
                      type="number"
                      value={editSettings.thresholds[tier]}
                      onChange={(e) =>
                        setEditSettings((prev) => ({
                          ...prev,
                          thresholds: { ...prev.thresholds, [tier]: parseInt(e.target.value) || 0 },
                        }))
                      }
                      min="0"
                      className="w-20 px-2 py-1 rounded border border-white/10 bg-white/5 text-white text-xs focus:border-violet-500 focus:outline-none"
                    />
                    <span className="text-gray-500 text-xs">€</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Seuil de création automatique de profil (€)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editSettings.autoCreateThreshold}
                onChange={(e) =>
                  setEditSettings((prev) => ({ ...prev, autoCreateThreshold: parseInt(e.target.value) || 0 }))
                }
                min="0"
                className="w-28 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:border-violet-500 focus:outline-none"
              />
              <span className="text-gray-500 text-xs">€ de dépense minimum pour créer un profil</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveSettings}
              className="flex-1 px-3 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-all"
            >
              Enregistrer
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Tier Groups */}
      <div className="space-y-4">
        {orderedTiers.map((tier) => {
          const fans = tierGroups[tier]
          if (fans.length === 0) return null
          const style = TIER_STYLES[tier]
          return (
            <div key={tier}>
              <div className={`flex items-center gap-1.5 mb-2 text-xs font-semibold ${style.color}`}>
                {style.icon}
                <span>{style.label}</span>
                <span className="text-gray-600 font-normal">({fans.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fans.map((fan) => {
                  const ts = TIER_STYLES[fan.tier]
                  return (
                    <div
                      key={fan.fanId}
                      className={`p-3 rounded-xl border ${ts.border} ${ts.bg} hover:brightness-110 transition-all`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white text-sm truncate">
                          {fan.fanUsername ?? fan.fanId}
                        </span>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${ts.border} ${ts.bg} ${ts.color}`}>
                          {ts.icon}
                          {ts.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-white text-sm font-bold">{fan.totalSpent.toFixed(0)}€</p>
                          <p className="text-gray-600 text-[10px]">Total dépensé</p>
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">{fan.messageCount}</p>
                          <p className="text-gray-600 text-[10px]">Messages</p>
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">
                            {new Date(fan.lastActive).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </p>
                          <p className="text-gray-600 text-[10px]">Dernière activité</p>
                        </div>
                      </div>
                      {fan.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {fan.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
