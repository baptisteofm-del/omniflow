'use client'

import { useRef, useState, useEffect } from 'react'
import { HelpCircle, ChevronRight } from 'lucide-react'
import { useTutorial } from './TutorialProvider'

export function TutorialButton() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { tutorials, completedTutorials, startTutorial, isRunning } = useTutorial()

  const incompleteCount = tutorials.filter(t => !completedTutorials.includes(t.id)).length

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleStartTutorial = (tutorialId: string) => {
    startTutorial(tutorialId)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isRunning}
        className="relative w-10 h-10 rounded-full bg-purple-600/20 hover:bg-purple-600/30 transition-colors flex items-center justify-center text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Tutoriels"
        title="Tutoriels d'aide"
      >
        <HelpCircle size={20} />
        
        {/* Badge */}
        {incompleteCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {incompleteCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-[#1a1a2e] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden z-[9999] animate-slideDown">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 bg-white/5">
            <h3 className="text-sm font-semibold text-white">Tutoriels disponibles</h3>
            <p className="text-xs text-gray-400 mt-1">
              {incompleteCount === 0 ? 'Tous les tutoriels complétés ✨' : `${incompleteCount} tutoriel${incompleteCount > 1 ? 's' : ''} à découvrir`}
            </p>
          </div>

          {/* Tutorial list */}
          <div className="max-h-80 overflow-y-auto">
            {tutorials.map(tutorial => {
              const isCompleted = completedTutorials.includes(tutorial.id)
              
              return (
                <button
                  key={tutorial.id}
                  onClick={() => handleStartTutorial(tutorial.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all border-b border-white/5 last:border-0 ${
                    isCompleted
                      ? 'opacity-60 hover:opacity-80 bg-white/2'
                      : 'hover:bg-purple-500/10'
                  }`}
                >
                  {/* Status icon */}
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isCompleted ? 'bg-green-500' : 'bg-purple-500'
                  }`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
                      {tutorial.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tutorial.steps.length} étape{tutorial.steps.length > 1 ? 's' : ''} {isCompleted && '✓'}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
