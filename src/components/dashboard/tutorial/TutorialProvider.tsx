'use client'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export interface TutorialStep {
  id: string
  target: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'none'
  /** URL Loom optionnelle — s'affiche comme bouton "Voir la démo" dans le tooltip */
  videoUrl?: string
}

export interface Tutorial {
  id: string
  name: string
  page?: string
  steps: TutorialStep[]
}

interface TutorialContextType {
  tutorials: Tutorial[]
  activeTutorial: Tutorial | null
  currentStep: number
  isRunning: boolean
  startTutorial: (tutorialId: string) => void
  nextStep: () => void
  prevStep: () => void
  skipTutorial: () => void
  completedTutorials: string[]
  markTutorialComplete: (tutorialId: string) => Promise<void>
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

const LS_KEY = 'omniflow_completed_tutorials'

const readLS = (): string[] => {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
const writeLS = (ids: string[]) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(ids)) } catch {}
}

export const tutorials: Tutorial[] = [
  // ── Onboarding principal
  // 📹 URLs Loom : remplace les videoUrl par tes vrais liens Loom après enregistrement
  {
    id: 'getting-started',
    name: 'Premiers pas',
    steps: [
      { id: 'gs-1', target: '[data-tutorial="sidebar"]', title: 'Bienvenue sur OmniFlow', content: 'Ce menu latéral vous donne accès à toutes les fonctionnalités. Survolez-le pour le dérouler.', position: 'right', action: 'none' },
      { id: 'gs-2', target: '[data-tutorial="accounts"]', title: 'Créez vos modèles', content: 'Commencez par ajouter vos profils de modèles avec leurs intégrations OnlyFans ou MYM.', position: 'right', action: 'none', videoUrl: 'https://www.loom.com/share/REMPLACER_PAR_URL_MODELES' },
      { id: 'gs-3', target: '[data-tutorial="dashboard"]', title: 'Votre centre de contrôle', content: 'Le dashboard centralise vos revenus, économies réalisées et outils actifs en temps réel.', position: 'right', action: 'none' },
      { id: 'gs-4', target: '[data-tutorial="posting"]', title: 'Automatisez vos posts', content: 'Auto Posting planifie et publie automatiquement votre contenu sur tous vos comptes.', position: 'right', action: 'none', videoUrl: 'https://www.loom.com/share/REMPLACER_PAR_URL_POSTING' },
    ],
  },

  // ── Dashboard
  {
    id: 'dashboard',
    name: 'Dashboard',
    page: '/dashboard',
    steps: [
      { id: 'd-1', target: '[data-tutorial="dashboard"]', title: 'Centre de contrôle', content: 'Le dashboard affiche vos KPIs en temps réel : revenus, économies réalisées et outils actifs.', position: 'bottom', action: 'none' },
      { id: 'd-2', target: '.glass', title: 'KPI Cards', content: 'Chaque carte est cliquable et redirige vers le module concerné. Les chiffres se mettent à jour automatiquement.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Modèles
  {
    id: 'models',
    name: 'Gestion des modèles',
    page: '/accounts',
    steps: [
      { id: 'm-1', target: '[data-tutorial="accounts"]', title: 'Profils de modèles', content: 'Chaque modèle représente un compte géré. Associez-y vos intégrations (OnlyFans, MYM, AdsPower, GeeLark).', position: 'bottom', action: 'none' },
      { id: 'm-2', target: '.group', title: 'Connexions rapides', content: 'Depuis chaque carte, connectez directement les outils. Les boutons redirigent vers la page Intégrations avec le modèle pré-sélectionné.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Finance
  {
    id: 'finance',
    name: 'Finance',
    page: '/finance',
    steps: [
      { id: 'f-1', target: 'h1', title: 'Centre financier', content: 'Suivez vos revenus OF/MYM, dépenses et marges. Connectez OnlyFans ou MYM pour une synchronisation automatique.', position: 'bottom', action: 'none' },
      { id: 'f-2', target: '.glass', title: 'Filtres et périodes', content: 'Filtrez par plateforme (OnlyFans / MYM), par modèle ou par période personnalisée avec le sélecteur de dates.', position: 'bottom', action: 'none' },
      { id: 'f-3', target: '.glass', title: 'Ajout de dépenses', content: 'Cliquez sur "Ajouter" pour saisir vos dépenses (salaires, logiciels, etc.) et calculer automatiquement votre marge nette.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Chatting IA
  {
    id: 'chatting-ai',
    name: 'Chatting IA',
    page: '/chatting/ai',
    steps: [
      { id: 'ca-1', target: '[data-tutorial="chatting-page"]', title: 'Chatting automatisé', content: 'Bienvenue dans votre centre de chatting IA. Connectez OF/MYM pour analyser et automatiser vos réponses fans.', position: 'bottom', action: 'none' },
      { id: 'ca-2', target: '[data-tutorial="chatting-configure"]', title: 'Personnalité IA', content: 'Configurez le style et la personnalité de votre IA pour chaque modèle. Plus les exemples sont précis, plus les réponses sont naturelles.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Rapports Chatting
  {
    id: 'chatting-reports',
    name: 'Rapports Chatting',
    page: '/chatting',
    steps: [
      { id: 'cr-1', target: 'h1', title: 'Analytics chatting', content: 'Analysez les performances de votre chatting : taux de conversion, fans à risque, opportunités manquées.', position: 'bottom', action: 'none' },
      { id: 'cr-2', target: '.glass', title: 'Alertes intelligentes', content: 'Configurez des alertes en temps réel pour être notifié des fans mécontents et des opportunités de vente.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Veille Instagram
  {
    id: 'veille',
    name: 'Veille Instagram',
    page: '/content/veille',
    steps: [
      { id: 'v-1', target: '[data-tutorial="trends-refresh"]', title: 'Générer des trends', content: 'Choisissez la plateforme (TikTok, Instagram, Reddit), le volume (1-10) puis cliquez Générer pour scraper les dernières tendances.', position: 'bottom', action: 'none' },
      { id: 'v-2', target: '[data-tutorial="trends-filters"]', title: 'Filtres avancés', content: 'Filtrez par catégorie (fitness, glamour, lifestyle...) pour trouver les trends pertinents pour vos modèles.', position: 'right', action: 'none' },
      { id: 'v-3', target: '[data-tutorial="trend-ai-generate"]', title: 'Générer avec l\'IA', content: 'Cliquez sur "Générer" dans une carte de trend pour créer automatiquement du contenu vidéo inspiré par cette tendance.', position: 'top', action: 'none' },
    ],
  },

  // ── Édition & Spoof
  {
    id: 'editor',
    name: 'Édition & Spoof',
    page: '/content/editor',
    steps: [
      { id: 'e-1', target: 'h1', title: 'Éditeur universel', content: 'Importez une image ou vidéo puis choisissez entre le mode Éditer (canvas interactif) ou Spoof (variations anti-détection).', position: 'bottom', action: 'none' },
      { id: 'e-2', target: '.glass', title: 'Mode Spoof', content: 'Le spoof génère jusqu\'à 100 variations uniques en modifiant les métadonnées, le réencodage et les transformations selon l\'intensité choisie.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Génération IA
  {
    id: 'ai-generation',
    name: 'Génération IA',
    page: '/content/ai-generation',
    steps: [
      { id: 'ag-1', target: 'h1', title: 'Créateur de vidéos IA', content: 'Décrivez votre contenu, choisissez le style et générez des vidéos professionnelles avec Kling AI en quelques secondes.', position: 'bottom', action: 'none' },
      { id: 'ag-2', target: '.glass', title: 'Paramètres avancés', content: 'Ajustez le ratio (9:16 pour TikTok/Reels, 16:9 pour YouTube), la durée et le style visuel pour un résultat optimal.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Auto Posting
  {
    id: 'posting',
    name: 'Auto Posting',
    page: '/posting',
    steps: [
      { id: 'p-1', target: '[data-tutorial="posting"]', title: 'Automatisation multi-comptes', content: 'Créez des campagnes pour publier automatiquement sur des centaines de comptes via AdsPower ou GeeLark.', position: 'bottom', action: 'none' },
      { id: 'p-2', target: '.glass', title: 'Campagnes intelligentes', content: '3 niveaux d\'automatisation : Manuel, Semi-auto (IA propose), Automatique (publication autonome). Connectez AdsPower/GeeLark d\'abord.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Bot Telegram
  {
    id: 'telegram',
    name: 'Bot Telegram',
    page: '/telegram',
    steps: [
      { id: 't-1', target: 'h1', title: 'Bot Telegram @omniflowapp_bot', content: 'Automatisez vos publications Telegram. Ajoutez @omniflowapp_bot comme admin dans vos canaux puis connectez-les ici.', position: 'bottom', action: 'none' },
      { id: 't-2', target: '.glass', title: 'Planning individuel', content: 'Configurez l\'heure ET le type de contenu (texte, texte+image, texte+vidéo) pour chaque post séparément. Max 10 posts/jour.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Banque de médias
  {
    id: 'media',
    name: 'Banque de médias',
    page: '/media',
    steps: [
      { id: 'bm-1', target: 'h1', title: 'Drive multimédia intelligent', content: 'Stockez et organisez tous vos médias dans des dossiers dédiés (Auto Posting, Instagram, TikTok, Telegram...).', position: 'bottom', action: 'none' },
      { id: 'bm-2', target: '.glass', title: 'Multi-sélection', content: 'Sélectionnez plusieurs fichiers pour les déplacer vers un dossier ou les supprimer en lot. Les médias sont réutilisables dans Auto Posting et Bot Telegram.', position: 'bottom', action: 'none' },
    ],
  },

  // ── Équipe
  {
    id: 'team',
    name: 'Gestion d\'équipe',
    page: '/settings/team',
    steps: [
      { id: 'tm-1', target: 'h1', title: 'Gestion des collaborateurs', content: 'Invitez des membres avec des rôles prédéfinis : Monteur Vidéo, Manager Chatting, Manager Marketing ou Admin.', position: 'bottom', action: 'none' },
      { id: 'tm-2', target: '.glass', title: 'Permissions granulaires', content: 'Cliquez sur "Permissions" pour ajuster page par page les accès de chaque membre. Les rôles appliquent une base modifiable.', position: 'bottom', action: 'none' },
    ],
  },
]

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [activeTutorial, setActiveTutorial]   = useState<Tutorial | null>(null)
  const [currentStep, setCurrentStep]         = useState(0)
  const [completedTutorials, setCompletedTutorials] = useState<string[]>(readLS)
  const [loaded, setLoaded]                   = useState(false)
  const supabase = createClient()

  // ── Sync DB → state on mount ───────────────────────────────
  useEffect(() => {
    const sync = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoaded(true); return }

        const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
        if (!agency) { setLoaded(true); return }

        const { data: progress } = await supabase.from('tutorial_progress').select('tutorial_id').eq('agency_id', agency.id)
        if (progress?.length) {
          const ids = progress.map((p: any) => p.tutorial_id)
          // Merge DB + localStorage
          const merged = [...new Set([...readLS(), ...ids])]
          setCompletedTutorials(merged)
          writeLS(merged)
        }
      } catch { /* silently ignore */ }
      setLoaded(true)
    }
    sync()
  }, [])

  // ── Auto-start getting-started if not completed ────────────
  useEffect(() => {
    if (!loaded) return
    if (completedTutorials.includes('getting-started')) return
    // Petit délai pour laisser la page se charger
    const t = setTimeout(() => {
      startTutorial('getting-started')
    }, 1500)
    return () => clearTimeout(t)
  }, [loaded])

  // ── Persist completion ─────────────────────────────────────
  const persist = useCallback(async (tutorialId: string) => {
    const updated = [...new Set([...completedTutorials, tutorialId])]
    setCompletedTutorials(updated)
    writeLS(updated)

    // DB save (non bloquant)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
      if (agency) {
        await supabase.from('tutorial_progress').upsert(
          { agency_id: agency.id, tutorial_id: tutorialId },
          { onConflict: 'agency_id,tutorial_id', ignoreDuplicates: true }
        )
      }
    } catch { /* non-bloquant */ }
  }, [completedTutorials, supabase])

  const router = useRouter()

  const startTutorial = useCallback((tutorialId: string) => {
    const t = tutorials.find(x => x.id === tutorialId)
    if (!t) return
    // Navigate to the tutorial page first if specified
    if (t.page && typeof window !== 'undefined' && window.location.pathname !== t.page) {
      router.push(t.page)
      // Wait for navigation before starting tutorial
      setTimeout(() => {
        setActiveTutorial(t)
        setCurrentStep(0)
      }, 800)
    } else {
      setActiveTutorial(t)
      setCurrentStep(0)
    }
  }, [router])

  const nextStep = useCallback(() => {
    if (!activeTutorial) return
    if (currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      skipTutorial()
    }
  }, [activeTutorial, currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }, [currentStep])

  const skipTutorial = useCallback(async () => {
    if (!activeTutorial) return
    await persist(activeTutorial.id)
    setActiveTutorial(null)
    setCurrentStep(0)
  }, [activeTutorial, persist])

  const markTutorialComplete = useCallback(async (tutorialId: string) => {
    await persist(tutorialId)
  }, [persist])

  return (
    <TutorialContext.Provider value={{
      tutorials, activeTutorial, currentStep,
      isRunning: activeTutorial !== null,
      startTutorial, nextStep, prevStep, skipTutorial,
      completedTutorials, markTutorialComplete,
    }}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const ctx = useContext(TutorialContext)
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider')
  return ctx
}
