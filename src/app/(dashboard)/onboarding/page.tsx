'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Check, Zap, Users, Sparkles } from 'lucide-react'

type OnboardingStep = 1 | 2 | 3 | 4

interface OnboardingData {
  step: OnboardingStep
  tools: {
    adsPower: boolean
    geeLark: boolean
  }
  apiKeys: {
    adsPower: string
    geeLark: string
  }
  model: {
    name: string
    platform: 'OnlyFans' | 'Instagram' | 'TikTok'
    profileId: string
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [agencyId, setAgencyId] = useState<string>('')
  
  const [data, setData] = useState<OnboardingData>({
    step: 1,
    tools: {
      adsPower: false,
      geeLark: false,
    },
    apiKeys: {
      adsPower: '',
      geeLark: '',
    },
    model: {
      name: '',
      platform: 'OnlyFans',
      profileId: '',
    },
  })

  // Get current agency on mount
  useEffect(() => {
    const getAgency = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: agency } = await supabase
        .from('agencies')
        .select('id, onboarding_completed')
        .eq('owner_id', user.id)
        .single()

      if (agency) {
        setAgencyId(agency.id)
        if (agency.onboarding_completed) {
          router.push('/dashboard')
        }
      }
    }

    getAgency()
  }, [supabase, router])

  const handleNext = async () => {
    if (step === 4) {
      // Complete onboarding
      setLoading(true)
      try {
        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agencyId }),
        })

        if (response.ok) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error completing onboarding:', error)
      } finally {
        setLoading(false)
      }
    } else {
      setStep((step + 1) as OnboardingStep)
    }
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    try {
      const selectedTools = []
      if (data.tools.adsPower && data.apiKeys.adsPower) {
        selectedTools.push({ tool: 'adsPower', apiKey: data.apiKeys.adsPower })
      }
      if (data.tools.geeLark && data.apiKeys.geeLark) {
        selectedTools.push({ tool: 'geeLark', apiKey: data.apiKeys.geeLark })
      }

      for (const tool of selectedTools) {
        const response = await fetch('/api/integrations/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tool),
        })

        if (!response.ok) {
          alert(`Connection test failed for ${tool.tool}`)
          return
        }
      }
      alert('All connections successful!')
    } catch (error) {
      console.error('Error testing connection:', error)
      alert('Connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const stepsCompleted = [
    step >= 2,
    step >= 3,
    step >= 4,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1625] to-[#0a0a0f] flex items-center justify-center p-4">
      {/* Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a1625]">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="w-full max-w-2xl">
        {/* Step Indicators */}
        <div className="flex justify-between mb-12 px-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <button
                onClick={() => s < step && setStep(s as OnboardingStep)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                  s < step
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                    : s === step
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white ring-2 ring-violet-300'
                    : 'bg-[#1a1625] text-gray-400'
                }`}
              >
                {s < step ? <Check size={20} /> : s}
              </button>
              <span className="text-xs text-gray-500">
                {['Bienvenue', 'Outils', 'Modèle', 'Prêt'][s - 1]}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-[#1a1625] to-[#0f0d14] rounded-2xl backdrop-blur-xl border border-violet-500/20 p-8 md:p-12 shadow-2xl">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 data={data} setData={setData} onTestConnection={handleTestConnection} testingConnection={testingConnection} />}
          {step === 3 && <Step3 data={data} setData={setData} />}
          {step === 4 && <Step4 data={data} />}

          {/* Actions */}
          <div className="flex gap-4 mt-12 pt-8 border-t border-violet-500/10">
            <button
              onClick={() => setStep(Math.max(1, step - 1) as OnboardingStep)}
              disabled={step === 1}
              className="px-6 py-3 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors"
            >
              ← Retour
            </button>
            
            <button
              onClick={() => {
                if (step === 2 && !data.tools.adsPower && !data.tools.geeLark) {
                  // Can skip step 2
                  setStep(3)
                } else {
                  handleNext()
                }
              }}
              disabled={loading || testingConnection}
              className="ml-auto px-8 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {step === 4 ? (
                <>
                  {loading ? 'Finalisation...' : 'Commencer'} <Sparkles size={18} />
                </>
              ) : (
                <>
                  Suivant <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 1: Welcome
function Step1() {
  return (
    <div className="text-center space-y-6">
      <div className="text-5xl md:text-6xl mb-6">👋</div>
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        Bienvenue sur Omniflow
      </h1>
      <p className="text-xl text-gray-400 leading-relaxed">
        Configurons votre agence en 4 étapes rapides pour commencer à gérer vos créatrices comme un pro.
      </p>
      <div className="pt-6 space-y-3 text-left max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <Zap className="text-violet-400 mt-1 flex-shrink-0" size={20} />
          <span className="text-gray-300">Connectez vos outils (AdsPower, GeeLark...)</span>
        </div>
        <div className="flex items-start gap-3">
          <Users className="text-cyan-400 mt-1 flex-shrink-0" size={20} />
          <span className="text-gray-300">Ajoutez vos premiers modèles</span>
        </div>
        <div className="flex items-start gap-3">
          <Sparkles className="text-violet-400 mt-1 flex-shrink-0" size={20} />
          <span className="text-gray-300">Accédez au prospection IA et plus</span>
        </div>
      </div>
    </div>
  )
}

// Step 2: Tools Integration
interface Step2Props {
  data: OnboardingData
  setData: (data: OnboardingData) => void
  onTestConnection: () => Promise<void>
  testingConnection: boolean
}

function Step2({ data, setData, onTestConnection, testingConnection }: Step2Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Connectez vos outils</h2>
        <p className="text-gray-400">Intégrez AdsPower et/ou GeeLark pour synchroniser vos comptes</p>
      </div>

      {/* AdsPower */}
      <div className="space-y-3 p-4 rounded-lg bg-[#0a0a0f] border border-violet-500/10">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.tools.adsPower}
            onChange={(e) =>
              setData({
                ...data,
                tools: { ...data.tools, adsPower: e.target.checked },
              })
            }
            className="w-5 h-5 rounded accent-violet-500"
          />
          <span className="font-semibold text-white">AdsPower</span>
        </label>
        {data.tools.adsPower && (
          <input
            type="password"
            placeholder="Clé API AdsPower"
            value={data.apiKeys.adsPower}
            onChange={(e) =>
              setData({
                ...data,
                apiKeys: { ...data.apiKeys, adsPower: e.target.value },
              })
            }
            className="w-full px-4 py-2 bg-[#1a1625] border border-violet-500/20 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
          />
        )}
      </div>

      {/* GeeLark */}
      <div className="space-y-3 p-4 rounded-lg bg-[#0a0a0f] border border-cyan-500/10">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.tools.geeLark}
            onChange={(e) =>
              setData({
                ...data,
                tools: { ...data.tools, geeLark: e.target.checked },
              })
            }
            className="w-5 h-5 rounded accent-cyan-500"
          />
          <span className="font-semibold text-white">GeeLark</span>
        </label>
        {data.tools.geeLark && (
          <input
            type="password"
            placeholder="Clé API GeeLark"
            value={data.apiKeys.geeLark}
            onChange={(e) =>
              setData({
                ...data,
                apiKeys: { ...data.apiKeys, geeLark: e.target.value },
              })
            }
            className="w-full px-4 py-2 bg-[#1a1625] border border-cyan-500/20 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        )}
      </div>

      {(data.tools.adsPower || data.tools.geeLark) && (
        <button
          onClick={onTestConnection}
          disabled={testingConnection}
          className="w-full px-4 py-2 bg-[#1a1625] border border-violet-500/30 rounded-lg text-white hover:border-violet-500/60 transition-colors disabled:opacity-50"
        >
          {testingConnection ? 'Test en cours...' : 'Tester la connexion'}
        </button>
      )}

      <p className="text-sm text-gray-500 text-center">Vous pouvez passer cette étape si vous préférez ajouter les outils plus tard</p>
    </div>
  )
}

// Step 3: Add First Model
interface Step3Props {
  data: OnboardingData
  setData: (data: OnboardingData) => void
}

function Step3({ data, setData }: Step3Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Ajoutez votre premier modèle</h2>
        <p className="text-gray-400">Créez une fiche pour votre première créatrice</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Nom du modèle</label>
          <input
            type="text"
            placeholder="ex: Sarah Johnson"
            value={data.model.name}
            onChange={(e) =>
              setData({
                ...data,
                model: { ...data.model, name: e.target.value },
              })
            }
            className="w-full px-4 py-3 bg-[#1a1625] border border-violet-500/20 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Plateforme principale</label>
          <select
            value={data.model.platform}
            onChange={(e) =>
              setData({
                ...data,
                model: { ...data.model, platform: e.target.value as 'OnlyFans' | 'Instagram' | 'TikTok' },
              })
            }
            className="w-full px-4 py-3 bg-[#1a1625] border border-violet-500/20 rounded-lg text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="OnlyFans">OnlyFans</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">ID Profil (optionnel)</label>
          <input
            type="text"
            placeholder="ID depuis AdsPower ou GeeLark"
            value={data.model.profileId}
            onChange={(e) =>
              setData({
                ...data,
                model: { ...data.model, profileId: e.target.value },
              })
            }
            className="w-full px-4 py-3 bg-[#1a1625] border border-violet-500/20 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Preview Card */}
      {data.model.name && (
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">{data.model.name}</h3>
              <p className="text-sm text-gray-400">{data.model.platform}</p>
            </div>
            <div className="text-4xl">👤</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Step 4: Ready
interface Step4Props {
  data: OnboardingData
}

function Step4({ data }: Step4Props) {
  return (
    <div className="text-center space-y-8">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold text-white">Prêt !</h2>
      
      <div className="space-y-4 text-left max-w-md mx-auto">
        <div className="p-4 rounded-lg bg-[#0a0a0f] border border-violet-500/20">
          <p className="text-sm text-gray-400">Outils configurés</p>
          <p className="text-white font-semibold">
            {data.tools.adsPower && data.tools.geeLark
              ? 'AdsPower + GeeLark'
              : data.tools.adsPower
              ? 'AdsPower'
              : data.tools.geeLark
              ? 'GeeLark'
              : 'Aucun (vous pouvez ajouter plus tard)'}
          </p>
        </div>

        {data.model.name && (
          <div className="p-4 rounded-lg bg-[#0a0a0f] border border-cyan-500/20">
            <p className="text-sm text-gray-400">Premier modèle</p>
            <p className="text-white font-semibold">{data.model.name} · {data.model.platform}</p>
          </div>
        )}
      </div>

      <p className="text-gray-400">Votre agence est prête. Que voulez-vous faire en premier ?</p>

      <div className="grid grid-cols-2 gap-3 mt-8">
        <button className="p-3 rounded-lg bg-[#1a1625] border border-violet-500/20 text-white hover:border-violet-500/60 transition-colors text-sm font-medium">
          📊 Veille trends
        </button>
        <button className="p-3 rounded-lg bg-[#1a1625] border border-violet-500/20 text-white hover:border-violet-500/60 transition-colors text-sm font-medium">
          📝 Poster contenu
        </button>
        <button className="p-3 rounded-lg bg-[#1a1625] border border-violet-500/20 text-white hover:border-violet-500/60 transition-colors text-sm font-medium">
          ✨ Générer avec l'IA
        </button>
        <button className="p-3 rounded-lg bg-[#1a1625] border border-violet-500/20 text-white hover:border-violet-500/60 transition-colors text-sm font-medium">
          📈 Dashboard
        </button>
      </div>
    </div>
  )
}
