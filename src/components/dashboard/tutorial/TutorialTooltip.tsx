'use client'
import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react'
import { useTutorial } from './TutorialProvider'

// Z-index supérieur à tout le layout (sidebar z-40, header, modals z-50)
const Z_OVERLAY = 2147483640  // max safe int - 7
const Z_TOOLTIP = 2147483647  // max safe int

export function TutorialTooltip() {
  const { activeTutorial, currentStep, nextStep, prevStep, skipTutorial } = useTutorial()
  const [pos, setPos]       = useState({ top: 100, left: 100 })
  const [rect, setRect]     = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const rafRef = useRef<number>(0)
  // ⚠️ MUST be at top level — hooks cannot be after conditional returns
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Portal container — created once, never destroyed
  useEffect(() => {
    let el = document.getElementById('__omniflow_tutorial_portal__')
    if (!el) {
      el = document.createElement('div')
      el.id = '__omniflow_tutorial_portal__'
      el.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;pointer-events:none;'
      document.body.appendChild(el)
    }
    setPortalEl(el)
  }, [])

  const step = activeTutorial?.steps[currentStep]

  useEffect(() => {
    if (!step) { setRect(null); return }

    const compute = () => {
      const el = document.querySelector(step.target)

      if (!el) {
        setRect(null)
        setPos({ top: window.innerHeight / 2 - 140, left: window.innerWidth / 2 - 160 })
        return
      }

      const r = el.getBoundingClientRect()
      setRect(r)

      const PAD = 14
      const TW = 320
      const TH = 240
      let top = 0, left = 0

      switch (step.position) {
        case 'top':
          top = r.top - TH - PAD
          left = r.left + r.width / 2 - TW / 2
          break
        case 'left':
          top = r.top + r.height / 2 - TH / 2
          left = r.left - TW - PAD
          break
        case 'right':
          top = r.top + r.height / 2 - TH / 2
          left = r.right + PAD
          break
        case 'bottom':
        default:
          top = r.bottom + PAD
          left = r.left + r.width / 2 - TW / 2
          break
      }

      left = Math.max(8, Math.min(left, window.innerWidth - TW - 8))
      top  = Math.max(8, Math.min(top,  window.innerHeight - TH - 8))
      setPos({ top, left })
    }

    compute()

    const onUpdate = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(compute)
    }

    window.addEventListener('resize', onUpdate, { passive: true })
    window.addEventListener('scroll', onUpdate, { passive: true })
    return () => {
      window.removeEventListener('resize', onUpdate)
      window.removeEventListener('scroll', onUpdate)
      cancelAnimationFrame(rafRef.current)
    }
  }, [step])

  if (!activeTutorial || !step || !mounted || !portalEl) return null

  const total = activeTutorial.steps.length
  const isFirst = currentStep === 0
  const isLast  = currentStep === total - 1

  // Pas de wrapper — fragment direct dans le portal pour éviter tout stacking context
  const overlay = (
    <>
      {/* ── OVERLAY — couvre TOUT, cliquable pour fermer ── */}
      <div
        onClick={skipTutorial}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: Z_OVERLAY,
          pointerEvents: 'auto',
        }}
      />

      {/* ── SPOTLIGHT — découpe un trou autour de l'élément cible ── */}
      {rect && (
        <>
          {/* top */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: Math.max(0, rect.top - 6), backgroundColor: 'rgba(0,0,0,0.8)', zIndex: Z_OVERLAY }} />
          {/* bottom */}
          <div style={{ position: 'fixed', top: rect.bottom + 6, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: Z_OVERLAY }} />
          {/* left */}
          <div style={{ position: 'fixed', top: rect.top - 6, left: 0, width: Math.max(0, rect.left - 6), height: rect.height + 12, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: Z_OVERLAY }} />
          {/* right */}
          <div style={{ position: 'fixed', top: rect.top - 6, left: rect.right + 6, right: 0, height: rect.height + 12, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: Z_OVERLAY }} />
          {/* Bordure lumineuse */}
          <div style={{
            position: 'fixed',
            top: rect.top - 5, left: rect.left - 5,
            width: rect.width + 10, height: rect.height + 10,
            border: '2px solid rgba(168, 85, 247, 0.8)',
            borderRadius: 8,
            boxShadow: '0 0 0 3px rgba(168,85,247,0.2), 0 0 20px rgba(168,85,247,0.3)',
            zIndex: Z_OVERLAY + 1,
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* ── TOOLTIP — couche absolument au-dessus de tout ── */}
      <div
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: 320,
          zIndex: Z_TOOLTIP,
          pointerEvents: 'auto',
        }}
      >
        {/* Card */}
        <div style={{
          backgroundColor: '#12111a',
          border: '1px solid rgba(168,85,247,0.4)',
          borderRadius: 14,
          padding: '18px 18px 14px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(168,85,247,0.12)',
        }}>
          {/* Close */}
          <button
            onClick={skipTutorial}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 26, height: 26, borderRadius: 6,
              background: 'rgba(255,255,255,0.06)', border: 'none',
              cursor: 'pointer', color: '#9ca3af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={13} />
          </button>

          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a855f7', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#a855f7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {activeTutorial.name} · {currentStep + 1}/{total}
            </span>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb', margin: '0 0 7px', paddingRight: 22, lineHeight: 1.35 }}>
            {step.title}
          </h3>

          {/* Content */}
          <p style={{ fontSize: 12.5, color: '#d1d5db', margin: '0 0 10px', lineHeight: 1.6 }}>
            {step.content}
          </p>

          {/* Bouton vidéo Loom (optionnel) */}
          {step.videoUrl && (
            <a
              href={step.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 12, padding: '6px 10px',
                borderRadius: 8, textDecoration: 'none',
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.3)',
                color: '#c084fc', fontSize: 12, fontWeight: 500,
                transition: 'background 0.15s',
              }}
            >
              <Play size={11} style={{ fill: '#c084fc', flexShrink: 0 }} />
              Voir la démo vidéo
            </a>
          )}

          {/* Progress */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{
                height: 3, borderRadius: 2, transition: 'all 0.2s',
                width: i <= currentStep ? 12 : 7,
                background: i <= currentStep ? '#a855f7' : 'rgba(255,255,255,0.12)',
              }} />
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 5 }}>
            <button
              onClick={prevStep}
              disabled={isFirst}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '6px 11px', borderRadius: 7, border: 'none', cursor: isFirst ? 'not-allowed' : 'pointer',
                background: 'rgba(255,255,255,0.06)', color: isFirst ? '#4b5563' : '#d1d5db', fontSize: 12,
              }}
            >
              <ChevronLeft size={13} />Préc.
            </button>
            <button
              onClick={skipTutorial}
              style={{ padding: '6px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: '#6b7280', fontSize: 12 }}
            >
              Passer
            </button>
            <button
              onClick={nextStep}
              style={{
                display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto',
                padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7c3aed, #0891b2)', color: 'white', fontSize: 12, fontWeight: 600,
              }}
            >
              {isLast ? 'Terminer' : 'Suivant'}{!isLast && <ChevronRight size={13} />}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(overlay, portalEl)
}
