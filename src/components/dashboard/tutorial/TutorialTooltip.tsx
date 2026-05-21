'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useTutorial } from './TutorialProvider'

export function TutorialTooltip() {
  const { activeTutorial, currentStep, nextStep, prevStep, skipTutorial } = useTutorial()
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [elementRect, setElementRect] = useState<DOMRect | null>(null)

  const currentTutorial = activeTutorial
  const currentTutorialStep = currentTutorial?.steps[currentStep]

  useEffect(() => {
    if (!currentTutorialStep) return

    const updatePosition = () => {
      const element = document.querySelector(currentTutorialStep.target)
      if (!element) return

      const rect = element.getBoundingClientRect()
      setElementRect(rect)

      const padding = 16
      let top = 0
      let left = 0

      switch (currentTutorialStep.position) {
        case 'top':
          top = rect.top - 320 // Assume tooltip height ~300px
          left = rect.left + rect.width / 2 - 150 // Tooltip width ~300px
          break
        case 'bottom':
          top = rect.bottom + padding
          left = rect.left + rect.width / 2 - 150
          break
        case 'left':
          top = rect.top + rect.height / 2 - 150
          left = rect.left - 320 - padding
          break
        case 'right':
          top = rect.top + rect.height / 2 - 150
          left = rect.right + padding
          break
      }

      // Clamp to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - 308))
      top = Math.max(8, Math.min(top, window.innerHeight - 308))

      setTooltipPosition({ top, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [currentTutorialStep])

  if (!currentTutorial || !currentTutorialStep) return null

  const totalSteps = currentTutorial.steps.length
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-40 pointer-events-none"
        style={{
          ...(elementRect && {
            clipPath: `
              polygon(
                0 0, 0 100%, 100% 100%, 100% 0, 0 0,
                ${elementRect.left - 8}px ${elementRect.top - 8}px,
                ${elementRect.left - 8}px ${elementRect.bottom + 8}px,
                ${elementRect.right + 8}px ${elementRect.bottom + 8}px,
                ${elementRect.right + 8}px ${elementRect.top - 8}px,
                ${elementRect.left - 8}px ${elementRect.top - 8}px
              )
            `,
          }),
        }}
      />

      {/* Spotlight on target element */}
      {elementRect && (
        <div
          className="fixed border-2 border-purple-500/50 rounded-lg pointer-events-none z-40 shadow-lg shadow-purple-500/30"
          style={{
            top: elementRect.top - 8,
            left: elementRect.left - 8,
            width: elementRect.width + 16,
            height: elementRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 w-80 bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-6 shadow-2xl shadow-purple-500/20 backdrop-blur-sm animate-fadeIn"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        {/* Close button */}
        <button
          onClick={skipTutorial}
          className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X size={16} className="text-gray-400" />
        </button>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2 text-white">{currentTutorialStep.title}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{currentTutorialStep.content}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i <= currentStep ? 'bg-purple-500 w-3' : 'bg-white/20 w-2'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Précédent
          </button>
          <button
            onClick={skipTutorial}
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-gray-300"
          >
            Passer
          </button>
          <button
            onClick={nextStep}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-600/60 hover:bg-purple-600 transition-colors text-sm font-medium ml-auto"
          >
            {isLastStep ? 'Terminer' : 'Suivant'}
            {!isLastStep && <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
