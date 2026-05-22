'use client'

import { useState } from 'react'
import { Clock, Copy, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Schedule, ScheduleSlot } from '@/lib/chatting/schedule'

interface SchedulePanelProps {
  schedule: Schedule | null
  scheduleEnabled: boolean
  onUpdate: (enabled: boolean, schedule: Schedule) => void
}

const DAYS = [
  { id: 0, label: 'Dimanche', short: 'Dim' },
  { id: 1, label: 'Lundi', short: 'Lun' },
  { id: 2, label: 'Mardi', short: 'Mar' },
  { id: 3, label: 'Mercredi', short: 'Mer' },
  { id: 4, label: 'Jeudi', short: 'Jeu' },
  { id: 5, label: 'Vendredi', short: 'Ven' },
  { id: 6, label: 'Samedi', short: 'Sam' },
]

const TIMEZONES = [
  'Europe/Paris',
  'Europe/London',
  'Europe/Brussels',
  'Africa/Casablanca',
  'America/Toronto',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'UTC',
]

export function SchedulePanel({ schedule, scheduleEnabled, onUpdate }: SchedulePanelProps) {
  const currentSchedule = schedule || { timezone: 'Europe/Paris', slots: [] }
  const [timezone, setTimezone] = useState(currentSchedule.timezone)
  const [slots, setSlots] = useState<ScheduleSlot[]>(currentSchedule.slots || [])
  const [activeDay, setActiveDay] = useState<number | null>(null)

  const handleToggleDay = (dayId: number) => {
    const existingSlot = slots.find(s => s.day === dayId)
    
    if (existingSlot) {
      // Supprimer le slot
      setSlots(slots.filter(s => s.day !== dayId))
      setActiveDay(null)
    } else {
      // Ajouter un slot par défaut (9h-23h)
      const newSlot: ScheduleSlot = { day: dayId, from: '09:00', to: '23:00' }
      setSlots([...slots, newSlot])
      setActiveDay(dayId)
    }
  }

  const handleTimeChange = (dayId: number, type: 'from' | 'to', value: string) => {
    setSlots(slots.map(s =>
      s.day === dayId ? { ...s, [type]: value } : s
    ))
  }

  const handleApplyToAll = () => {
    const activeSlot = slots.find(s => s.day === activeDay)
    if (!activeSlot) {
      toast.error('Sélectionnez d\'abord un jour actif')
      return
    }

    const updatedSlots = slots.map(s => ({
      ...s,
      from: activeSlot.from,
      to: activeSlot.to,
    }))
    setSlots(updatedSlots)
    toast.success('Horaire appliqué à tous les jours actifs')
  }

  const handleSave = () => {
    const updatedSchedule: Schedule = {
      timezone,
      slots,
    }
    onUpdate(true, updatedSchedule)
    toast.success('Planning sauvegardé ✅')
  }

  const handleDisable = () => {
    onUpdate(false, { timezone: 'Europe/Paris', slots: [] })
    toast.success('Planning désactivé')
  }

  if (!scheduleEnabled) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-gray-500" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Planning horaire</p>
              <p className="text-gray-500 text-xs mt-0.5">Aucun planning activé — l'IA répond 24/7</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Timezone */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Fuseau horaire
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
        >
          {TIMEZONES.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      {/* Grille de jours */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Plages de disponibilité
        </label>
        <div className="space-y-3">
          {DAYS.map(day => {
            const slot = slots.find(s => s.day === day.id)
            const isActive = !!slot

            return (
              <div
                key={day.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-violet-500/10 border-violet-500/30'
                    : 'bg-white/3 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleDay(day.id)}
                    className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                      isActive ? 'bg-violet-500 shadow-lg shadow-violet-500/30' : 'bg-gray-700'
                    }`}
                    title={isActive ? 'Désactiver ce jour' : 'Activer ce jour'}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>

                  {/* Jour */}
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{day.label}</p>
                  </div>

                  {/* Status badge */}
                  {isActive && (
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 font-medium">
                      Actif
                    </span>
                  )}
                </div>

                {/* Horaires (visible si le jour est actif) */}
                {isActive && (
                  <div className="flex gap-3 items-center ml-14 mt-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">De</label>
                      <input
                        type="time"
                        value={slot.from}
                        onChange={(e) => handleTimeChange(day.id, 'from', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">À</label>
                      <input
                        type="time"
                        value={slot.to}
                        onChange={(e) => handleTimeChange(day.id, 'to', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                    {activeDay === day.id && (
                      <button
                        onClick={() => setActiveDay(null)}
                        className="mt-6 px-2 py-2 text-gray-500 hover:text-white transition-colors"
                        title="Déselectionner"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {activeDay === null && (
                      <button
                        onClick={() => setActiveDay(day.id)}
                        className="mt-6 px-2 py-2 text-gray-500 hover:text-violet-400 transition-colors"
                        title="Sélectionner ce jour comme modèle"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bouton appliquer à tous */}
      {activeDay !== null && slots.length > 1 && (
        <button
          onClick={handleApplyToAll}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm hover:border-violet-500/40 hover:text-violet-300 transition-all font-medium"
        >
          📋 Appliquer {slots.find(s => s.day === activeDay)?.from}-{slots.find(s => s.day === activeDay)?.to} à tous les jours actifs
        </button>
      )}

      {/* Résumé */}
      {slots.length > 0 && (
        <div className="p-4 rounded-xl bg-white/3 border border-white/10">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Résumé</p>
          <div className="space-y-1 text-sm text-gray-300">
            {DAYS.filter(d => slots.find(s => s.day === d.id)).map(day => {
              const slot = slots.find(s => s.day === day.id)!
              return (
                <div key={day.id} className="flex justify-between">
                  <span className="font-medium">{day.short}</span>
                  <span className="text-gray-500">{slot.from} - {slot.to}</span>
                </div>
              )
            })}
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-600">
              Fuseau: {timezone}
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all"
        >
          ✅ Appliquer le planning
        </button>
        <button
          onClick={handleDisable}
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:border-red-500/40 hover:text-red-300 transition-all"
        >
          ⊘ Désactiver
        </button>
      </div>
    </div>
  )
}
