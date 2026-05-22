'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Loader, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface FanNote {
  id: string
  fanProfileId: string
  note: string
  category: 'general' | 'preferences' | 'spending' | 'avoid' | 'custom'
  createdAt: string
}

interface FanNotesPanelProps {
  fanProfileId: string
  fanName: string
  onClose?: () => void
}

const CATEGORIES = [
  { value: 'general', label: 'Général', color: 'bg-gray-500/20 border-gray-500/30' },
  { value: 'preferences', label: 'Préférences', color: 'bg-blue-500/20 border-blue-500/30' },
  { value: 'spending', label: 'Dépenses', color: 'bg-green-500/20 border-green-500/30' },
  { value: 'avoid', label: 'À Éviter', color: 'bg-red-500/20 border-red-500/30' },
  { value: 'custom', label: 'Personnalisé', color: 'bg-purple-500/20 border-purple-500/30' },
]

export function FanNotesPanel({ fanProfileId, fanName, onClose }: FanNotesPanelProps) {
  const [notes, setNotes] = useState<FanNote[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    note: '',
    category: 'general' as const,
  })

  useEffect(() => {
    loadNotes()
  }, [fanProfileId])

  const loadNotes = async () => {
    try {
      const res = await fetch(`/api/chatting/fan-notes?fanProfileId=${fanProfileId}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
      toast.error('Impossible de charger les notes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.note.trim()) {
      toast.error('Veuillez entrer une note')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/chatting/fan-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fanProfileId,
          note: form.note,
          category: form.category,
        }),
      })

      if (res.ok) {
        const newNote = await res.json()
        setNotes([newNote, ...notes])
        setForm({ note: '', category: 'general' })
        setShowForm(false)
        toast.success('Note créée ✓')
      } else {
        toast.error('Erreur lors de la création')
      }
    } catch (error) {
      console.error('Create error:', error)
      toast.error('Erreur réseau')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    setDeleting(noteId)
    try {
      const res = await fetch(`/api/chatting/fan-notes?noteId=${noteId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId))
        toast.success('Note supprimée ✓')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur réseau')
    } finally {
      setDeleting(null)
    }
  }

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category)
    return cat?.color || 'bg-gray-500/20 border-gray-500/30'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Notes sur {fanName}</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 rounded-lg border border-violet-500/20 bg-violet-500/5 space-y-3">
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Exemple: 'Aime les vidéos de danse', 'Budget limité', 'Aime les messages longs', etc."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:border-violet-500 focus:outline-none placeholder-gray-600"
          />

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:border-violet-500 focus:outline-none text-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex-1 px-3 py-2 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {creating ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Créer la note
                </>
              )}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={14} />
          Ajouter une note
        </button>
      )}

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-gray-400" size={24} />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Aucune note pour ce fan</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notes.map(note => {
            const category = CATEGORIES.find(c => c.value === note.category)
            return (
              <div
                key={note.id}
                className={`p-3 rounded-lg border ${getCategoryColor(note.category)} space-y-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white flex-1">{note.note}</p>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deleting === note.id}
                    className="text-gray-500 hover:text-red-400 disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {deleting === note.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-400">
                    {category?.label || note.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
