'use client'
import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useTutorial } from './TutorialProvider'

export function TutorialTooltip() {
  const { activeTutorial, currentStep, nextStep, prevStep, skipTutorial } = useTutorial()
  const [pos, setPos]           = useState({ top: 0, left: 0 })
  const [rect, setRect]         = useState<DOMRect | null>(null)
  const [mounted, setMounted]   = useState(false)
  const rafRef = useRef<number>(0)

  // Portal mount guard (SSR safety)
  useEffect(() => { setMounted(true) }, [])

  const step = activeTutorial?.steps[currentStep]

  useEffect(() => {
    if (!step) { setRect(null); return }

    const compute = () => {
      const el = document.querySelector(step.target)
      if (!el) {
        // Fallback: centre de l'écran si élément non trouvé
        setRect(null)
        setPos({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 160,
        })
        return
      }

      const r = el.getBoundingClientRect()
      setRect(r)

      const PAD = 16
      const TW = 320 // tooltip width
      const TH = 260 // tooltip height (approx)
      let top = 0, left = 0

      switch (step.position) {
        case 'top':
          top  = r.top - TH - PAD
          left = r.left + r.width / 2 - TW / 2
          break
        case 'bottom':
          top  = r.bottom + PAD
          left = r.left + r.width / 2 - TW / 2
          break
        case 'left':
          top  = r.top + r.height / 2 - TH / 2
          left = r.left - TW - PAD
          break
        case 'right':
        default:
          top  = r.top + r.height / 2 - TH / 2
          left = r.right + PAD
          break
      }

      // Clamp within viewport
      left = Math.max(8, Math.min(left, window.innerWidth  - TW - 8))
      top  = Math.max(8, Math.min(top,  window.innerHeight - TH - 8))

      setPos({ top, left })
    }

    compute()

    const onResize = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(compute) }
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('scroll', onResize, { passive: true })
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [step])

  if (!activeTutorial || !step || !mounted) return null

  const total = activeTutorial.steps.length
  const isFirst = currentStep === 0
  const isLast  = currentStep === total - 1

  const content = (
    <div style={{ isolation: 'isolate' }}>
      {/* ── OVERLAY — z-index 9990 ── */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          zIndex: 9990,
          pointerEvents: 'auto',
        }}
        onClick={skipTutorial}
        aria-hidden="true"
      />

      {/* ── SPOTLIGHT sur l'élément cible ── */}
      {rect && (
        <>
          {/* Cutout effect — 4 rectangles autour de l'élément */}
          {[
            // top
            { top: 0,              left: 0,              width: '100%',                   height: rect.top - 8 },
            // bottom
            { top: rect.bottom + 8, left: 0,             width: '100%',                   height: `calc(100% - ${rect.bottom + 8}px)` },
            // left
            { top: rect.top - 8,   left: 0,              width: rect.left - 8,             height: rect.height + 16 },
            // right
            { top: rect.top - 8,   left: rect.right + 8, width: `calc(100% - ${rect.right + 8}px)`, height: rect.height + 16 },
          ].map((s, i) => (
            <div key={i} style={{ position: 'fixed', background: 'rgba(0,0,0,0.75)', zIndex: 9991, pointerEvents: 'none', ...s }} />
          ))}

          {/* Bordure spotlight */}
          <div style={{
            position: 'fixed',
            top:    rect.top    - 6,
            left:   rect.left   - 6,
            width:  rect.width  + 12,
            height: rect.height + 12,
            border: '2px solid rgba(168,85,247,0.7)',
            borderRadius: 10,
            boxShadow: '0 0 20px rgba(168,85,247,0.4)',
            zIndex: 9992,
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* ── TOOLTIP — z-index 9999 ── */}
      <div
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: 320,
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <div style={{
          background: '#12111a',
          border: '1px solid rgba(168,85,247,0.35)',
          borderRadius: 16,
          padding: '20px 20px 16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(168,85,247,0.15)',
          backdropFilter: 'blur(20px)',
          animation: 'tutFadeIn 0.25s ease-out',
        }}>
          {/* Close */}
          <button
            onClick={skipTutorial}
            style={{ position: 'absolute', top: 12, right: 12, padding: 6, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
            aria-label="Fermer"
          >
            <X size={14} />
          </button>

          {/* Step label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7' }} />
            <span style={{ fontSize: 10, color: '#a855f7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {activeTutorial.name} · étape {currentStep + 1}/{total}
            </span>
          </div>

          {/* Content */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 8px', paddingRight: 20, lineHeight: 1.3 }}>
            {step.title}
          </h3>
          <p style={{ fontSize: 13, color: '#d1d5db', margin: '0 0 16px', lineHeight: 1.6 }}>
            {step.content}
          </p>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{
                height: 3, borderRadius: 2,
                width: i <= currentStep ? 12 : 8,
                background: i <= currentStep ? '#a855f7' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.2s',
              }} />
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={prevStep}
              disabled={isFirst}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '7px 12px', borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.07)', color: isFirst ? '#4b5563' : '#d1d5db',
                cursor: isFirst ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500,
              }}
            >
              <ChevronLeft size={14} />Précédent
            </button>
            <button
              onClick={skipTutorial}
              style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#6b7280', cursor: 'pointer', fontSize: 12 }}
            >
              Passer
            </button>
            <button
              onClick={nextStep}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '7px 14px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #0891b2)',
                color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                marginLeft: 'auto',
              }}
            >
              {isLast ? 'Terminer' : 'Suivant'}
              {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tutFadeIn {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  )

  // Portal vers document.body pour éviter tout stacking context
  return createPortal(content, document.body)
}
