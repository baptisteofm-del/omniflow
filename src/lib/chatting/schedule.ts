export interface ScheduleSlot {
  day: number   // 0=dimanche, 1=lundi, ..., 6=samedi
  from: string  // "09:00"
  to: string    // "23:00"
}

export interface Schedule {
  timezone: string
  slots: ScheduleSlot[]
}

/**
 * Vérifie si l'IA est active à l'heure actuelle selon le planning
 * @param schedule Le planning configuré (null = toujours actif)
 * @param scheduleEnabled Si le planning est activé
 * @returns true si l'IA peut générer une réponse, false sinon
 */
export function isAIActiveNow(schedule: Schedule | null, scheduleEnabled: boolean): boolean {
  // Si le planning n'est pas activé, l'IA est toujours active
  if (!scheduleEnabled || !schedule) return true
  
  const now = new Date()
  const tz = schedule.timezone || 'Europe/Paris'
  
  try {
    // Convertir l'heure actuelle en heure locale du timezone configuré
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: tz,
      weekday: 'narrow',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    
    const parts = formatter.formatToParts(now)
    const dayStr = parts.find(p => p.type === 'weekday')?.value
    const hourStr = parts.find(p => p.type === 'hour')?.value
    const minStr = parts.find(p => p.type === 'minute')?.value
    
    // Convertir jour en index (dim=0, lun=1, mar=2, etc.)
    // Intl.DateTimeFormat retourne: 'dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'
    const dayMap: Record<string, number> = {
      'dim': 0,
      'lun': 1,
      'mar': 2,
      'mer': 3,
      'jeu': 4,
      'ven': 5,
      'sam': 6,
    }
    const currentDay = dayMap[dayStr?.toLowerCase() || ''] ?? new Date().getDay()
    const currentTime = `${hourStr}:${minStr}`
    
    // Vérifier si l'heure actuelle correspond à un slot actif
    return schedule.slots.some(slot => {
      if (slot.day !== currentDay) return false
      return currentTime >= slot.from && currentTime <= slot.to
    })
  } catch (error) {
    console.error('Error checking AI schedule:', error)
    // En cas d'erreur, on laisse l'IA active (par défaut)
    return true
  }
}

/**
 * Formate le planning pour l'affichage
 */
export function formatScheduleForDisplay(schedule: Schedule | null): string {
  if (!schedule || schedule.slots.length === 0) {
    return 'Aucun planning (toujours actif)'
  }
  
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const sortedSlots = [...schedule.slots].sort((a, b) => a.day - b.day)
  
  return sortedSlots.map(slot => `${dayNames[slot.day]}: ${slot.from}-${slot.to}`).join(' • ')
}

/**
 * Obtient l'horaire du jour actuel
 */
export function getTodaySchedule(schedule: Schedule | null): ScheduleSlot | null {
  if (!schedule) return null
  
  const today = new Date().getDay()
  return schedule.slots.find(slot => slot.day === today) || null
}
