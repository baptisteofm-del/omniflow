'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface TutorialStep {
  id: string
  target: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'none'
}

export interface Tutorial {
  id: string
  name: string
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

export const tutorials: Tutorial[] = [
  {
    id: 'getting-started',
    name: 'Premiers pas',
    steps: [
      {
        id: 'gs-1',
        target: '[data-tutorial="sidebar"]',
        title: 'Bienvenue ! 👋',
        content: 'Voici votre dashboard OmniFlow. Naviguez ici pour accéder à toutes les fonctionnalités.',
        position: 'right',
        action: 'none',
      },
      {
        id: 'gs-2',
        target: '[data-tutorial="settings-integrations"]',
        title: 'Connecter vos outils',
        content: 'Commencez par connecter AdsPower ou GeeLark pour automatiser vos publications.',
        position: 'right',
        action: 'none',
      },
      {
        id: 'gs-3',
        target: '[data-tutorial="accounts"]',
        title: 'Ajouter vos modèles',
        content: 'Ici, vous pouvez ajouter et gérer tous vos comptes de modèles.',
        position: 'right',
        action: 'none',
      },
      {
        id: 'gs-4',
        target: '[data-tutorial="posting"]',
        title: 'Programmer des posts',
        content: 'Programmez vos premiers posts automatiques pour une publication sans effort.',
        position: 'right',
        action: 'none',
      },
      {
        id: 'gs-5',
        target: '[data-tutorial="dashboard"]',
        title: 'Suivez vos performances',
        content: 'Votre dashboard centralise tout ce qui compte : revenus, modèles, posts. Vous êtes prêt ! 🎉',
        position: 'bottom',
        action: 'none',
      },
    ],
  },
  {
    id: 'content-monitoring',
    name: 'Veille de contenu',
    steps: [
      {
        id: 'cm-1',
        target: '[data-tutorial="trends-refresh"]',
        title: 'Récupérer les trends',
        content: 'Cliquez ici pour récupérer les derniers trends en temps réel.',
        position: 'bottom',
        action: 'none',
      },
      {
        id: 'cm-2',
        target: '[data-tutorial="trends-filters"]',
        title: 'Filtrer par catégorie',
        content: 'Filtrez par plateforme ou catégorie pour trouver exactement ce qui vous intéresse.',
        position: 'bottom',
        action: 'none',
      },
      {
        id: 'cm-3',
        target: '[data-tutorial="trend-card"]',
        title: 'Voir le détail d\'un trend',
        content: 'Cliquez sur une card pour voir tous les détails et analyser le trend en profondeur.',
        position: 'bottom',
        action: 'none',
      },
      {
        id: 'cm-4',
        target: '[data-tutorial="trend-ai-generate"]',
        title: 'Générer avec l\'IA',
        content: 'Créez une vidéo basée sur ce trend en 1 clic. Notre IA fera le reste. ✨',
        position: 'top',
        action: 'none',
      },
    ],
  },
  {
    id: 'ai-chatting',
    name: 'Chatting IA',
    steps: [
      {
        id: 'ac-1',
        target: '[data-tutorial="chatting-page"]',
        title: 'Centre de chatting automatisé',
        content: 'Bienvenue dans votre centre de chatting IA. Automatisez vos réponses aux fans.',
        position: 'bottom',
        action: 'none',
      },
      {
        id: 'ac-2',
        target: '[data-tutorial="chatting-configure"]',
        title: 'Configurer la personnalité',
        content: 'Cliquez ici pour configurer la personnalité et le style de réponse de votre modèle IA.',
        position: 'bottom',
        action: 'none',
      },
      {
        id: 'ac-3',
        target: '[data-tutorial="chatting-scripts"]',
        title: 'Importer vos scripts',
        content: 'Importez vos scripts existants pour une automatisation plus personnalisée.',
        position: 'bottom',
        action: 'none',
      },
      {
        id: 'ac-4',
        target: '[data-tutorial="chatting-auto-mode"]',
        title: 'Mode automatique',
        content: 'Activez le mode automatique pour répondre aux messages sans intervention manuelle.',
        position: 'bottom',
        action: 'none',
      },
    ],
  },
]

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([])
  const supabase = createClient()

  // Load completed tutorials on mount
  useEffect(() => {
    const loadCompletedTutorials = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: agency } = await supabase
          .from('agencies')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (agency) {
          const { data: progress } = await supabase
            .from('tutorial_progress')
            .select('tutorial_id')
            .eq('agency_id', agency.id)

          if (progress) {
            setCompletedTutorials(progress.map(p => p.tutorial_id))
          }
        }
      } catch (error) {
        console.error('Failed to load tutorial progress:', error)
      }
    }

    loadCompletedTutorials()
  }, [supabase])

  // Auto-start "getting-started" for new agencies
  useEffect(() => {
    const autoStartTutorial = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: agency } = await supabase
          .from('agencies')
          .select('onboarding_completed')
          .eq('owner_id', user.id)
          .single()

        // Start tutorial if onboarding just completed and haven't seen getting-started
        if (agency?.onboarding_completed && !completedTutorials.includes('getting-started')) {
          startTutorial('getting-started')
        }
      } catch (error) {
        console.error('Failed to auto-start tutorial:', error)
      }
    }

    if (completedTutorials.length > 0 || completedTutorials.length === 0) {
      autoStartTutorial()
    }
  }, [supabase, completedTutorials])

  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = tutorials.find(t => t.id === tutorialId)
    if (tutorial) {
      setActiveTutorial(tutorial)
      setCurrentStep(0)
    }
  }, [])

  const nextStep = useCallback(() => {
    if (!activeTutorial) return
    if (currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(step => step + 1)
    } else {
      skipTutorial()
    }
  }, [activeTutorial, currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1)
    }
  }, [currentStep])

  const skipTutorial = useCallback(async () => {
    if (!activeTutorial) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setActiveTutorial(null)
        setCurrentStep(0)
        return
      }

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (agency) {
        await supabase.from('tutorial_progress').insert({
          agency_id: agency.id,
          tutorial_id: activeTutorial.id,
        }).select()

        setCompletedTutorials(prev => [...prev, activeTutorial.id])
      }
    } catch (error) {
      console.error('Failed to mark tutorial as completed:', error)
    }

    setActiveTutorial(null)
    setCurrentStep(0)
  }, [activeTutorial, supabase])

  const markTutorialComplete = useCallback(
    async (tutorialId: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: agency } = await supabase
          .from('agencies')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (agency) {
          await supabase.from('tutorial_progress').insert({
            agency_id: agency.id,
            tutorial_id: tutorialId,
          }).select()

          setCompletedTutorials(prev => 
            prev.includes(tutorialId) ? prev : [...prev, tutorialId]
          )
        }
      } catch (error) {
        console.error('Failed to mark tutorial as completed:', error)
      }
    },
    [supabase]
  )

  const value: TutorialContextType = {
    tutorials,
    activeTutorial,
    currentStep,
    isRunning: activeTutorial !== null,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completedTutorials,
    markTutorialComplete,
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return context
}
