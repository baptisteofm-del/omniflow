'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, FileText } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScriptStep {
  id: string
  order: number
  text: string
  mediaUrls?: string[]
  price: number
  priceLabel?: string
}

export interface Script {
  id: string
  name: string
  steps: ScriptStep[]
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'omniflow_scripts_v2'

function loadScripts(): Script[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveScripts(scripts: Script[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts))
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function emptyStep(order: number): ScriptStep {
  return { id: uid(), order, text: '', price: 0 }
}

// ─── Step Editor ──────────────────────────────────────────────────────────────

interface StepEditorProps {
  step: ScriptStep
  index: number
  total: number
  onChange: (updated: ScriptStep) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function StepEditor({ step, index, total, onChange, onDelete, onMoveUp, onMoveDown }: StepEditorProps) {
  return (
    <div className="p-3 bg-white/3 border border-white/8 rounded-xl space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-16 flex-shrink-0">Étape {index + 1}</span>
        <input
          type="number"
          value={step.price}
          onChange={(e) => onChange({ ...step, price: Math.max(0, parseInt(e.target.value) || 0) })}
          placeholder="Prix (€)"
          min="0"
          className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-violet-500 focus:outline-none"
        />
        {step.price === 0 ? (
          <span className="text-xs text-green-400 font-medium">Gratuit</span>
        ) : (
          <span className="text-xs text-amber-400 font-medium">{step.price}€</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors"
            title="Monter"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded text-gray-600 hover:text-gray-300 disabled:opacity-20 transition-colors"
            title="Descendre"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <textarea
        value={step.text}
        onChange={(e) => onChange({ ...step, text: e.target.value })}
        placeholder="Texte de cette étape..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white resize-none focus:border-violet-500 focus:outline-none placeholder-gray-600"
        rows={3}
      />
    </div>
  )
}

// ─── Script Editor Modal ───────────────────────────────────────────────────────

interface ScriptEditorProps {
  initial?: Script
  onSave: (script: Script) => void
  onClose: () => void
}

function ScriptEditor({ initial, onSave, onClose }: ScriptEditorProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [steps, setSteps] = useState<ScriptStep[]>(
    initial?.steps?.length ? initial.steps : [emptyStep(0)]
  )

  const addStep = () => {
    setSteps((prev) => [...prev, emptyStep(prev.length)])
  }

  const updateStep = (idx: number, updated: ScriptStep) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? updated : s)))
  }

  const deleteStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })))
  }

  const moveStep = (idx: number, dir: 'up' | 'down') => {
    setSteps((prev) => {
      const arr = [...prev]
      const target = dir === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= arr.length) return arr
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return arr.map((s, i) => ({ ...s, order: i }))
    })
  }

  const handleSave = () => {
    if (!name.trim()) return
    const script: Script = {
      id: initial?.id ?? uid(),
      name: name.trim(),
      steps: steps.map((s, i) => ({ ...s, order: i })),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    }
    onSave(script)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12111a] border border-white/10 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {initial ? 'Modifier le script' : 'Nouveau script'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          {/* Script name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Nom du script
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Douche Level 1, GFE Premium..."
              className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Étapes ({steps.length})
            </label>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <StepEditor
                  key={step.id}
                  step={step}
                  index={idx}
                  total={steps.length}
                  onChange={(updated) => updateStep(idx, updated)}
                  onDelete={() => deleteStep(idx)}
                  onMoveUp={() => moveStep(idx, 'up')}
                  onMoveDown={() => moveStep(idx, 'down')}
                />
              ))}
            </div>
            <button
              onClick={addStep}
              className="mt-3 w-full py-2 rounded-xl border border-dashed border-white/20 text-gray-500 text-xs hover:border-violet-500/50 hover:text-violet-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Ajouter une étape
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ScriptsManager (main export) ─────────────────────────────────────────────

export function ScriptsManager() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [editing, setEditing] = useState<Script | null | 'new'>(null)

  useEffect(() => {
    setScripts(loadScripts())
  }, [])

  const persist = (updated: Script[]) => {
    setScripts(updated)
    saveScripts(updated)
  }

  const handleSave = (script: Script) => {
    persist(
      scripts.some((s) => s.id === script.id)
        ? scripts.map((s) => (s.id === script.id ? script : s))
        : [script, ...scripts]
    )
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    persist(scripts.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{scripts.length} script(s)</p>
        <button
          onClick={() => setEditing('new')}
          className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Nouveau script
        </button>
      </div>

      {/* Empty state */}
      {scripts.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <FileText size={40} className="mx-auto mb-3 opacity-20" />
          <p>Aucun script</p>
          <p className="text-sm mt-1">
            Un script = un scénario de vente complet avec des étapes texte + prix
          </p>
        </div>
      )}

      {/* Scripts list */}
      {scripts.length > 0 && (
        <div className="space-y-3">
          {scripts.map((script) => {
            const paidSteps = script.steps.filter((s) => s.price > 0)
            const freeSteps = script.steps.filter((s) => s.price === 0)
            return (
              <div
                key={script.id}
                className="p-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">{script.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {script.steps.length} étape{script.steps.length !== 1 ? 's' : ''}
                      </span>
                      {freeSteps.length > 0 && (
                        <span className="text-xs text-green-400">
                          {freeSteps.length} gratuit{freeSteps.length !== 1 ? 'es' : 'e'}
                        </span>
                      )}
                      {paidSteps.length > 0 && (
                        <span className="text-xs text-amber-400">
                          {paidSteps.length} payant{paidSteps.length !== 1 ? 'es' : 'e'}
                          {' · '}
                          {paidSteps.map((s) => `${s.price}€`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditing(script)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:border-violet-500/40 hover:text-violet-300 transition-all"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(script.id)}
                      className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Step preview */}
                {script.steps.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {script.steps.slice(0, 2).map((step, i) => (
                      <div key={step.id} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="flex-shrink-0 mt-0.5">
                          {step.price === 0
                            ? <span className="text-green-500">●</span>
                            : <span className="text-amber-500">●</span>}
                        </span>
                        <span className="line-clamp-1">
                          {step.text || <em className="text-gray-700">Étape {i + 1} (vide)</em>}
                        </span>
                        {step.price > 0 && (
                          <span className="ml-auto flex-shrink-0 text-amber-500">{step.price}€</span>
                        )}
                      </div>
                    ))}
                    {script.steps.length > 2 && (
                      <p className="text-xs text-gray-700 pl-4">
                        +{script.steps.length - 2} étape{script.steps.length - 2 !== 1 ? 's' : ''}…
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Editor modal */}
      {editing !== null && (
        <ScriptEditor
          initial={editing === 'new' ? undefined : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
