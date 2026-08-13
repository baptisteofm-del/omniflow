// Synthesized (no audio asset to license/ship) — deliberately soft per spec
// 47.34 ("motion/glow must reinforce premium, not become a demo of
// effects"). Web Audio API only runs client-side.

// Design handoff: "Tous les sons doivent être activables, réglables ou
// coupables par catégorie" — a single global mute wasn't enough, each
// category of sound-triggering event needs its own on/off.
export type SoundCategory = 'message' | 'sale'

const MUTE_KEY_PREFIX = 'omniflow_sound_muted_'

export function isCategoryMuted(category: SoundCategory): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MUTE_KEY_PREFIX + category) === '1'
}

export function setCategoryMuted(category: SoundCategory, muted: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(MUTE_KEY_PREFIX + category, muted ? '1' : '0')
}

function playNotes(category: SoundCategory, notes: [number, number, number][]) {
  if (typeof window === 'undefined' || isCategoryMuted(category)) return
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const now = ctx.currentTime

    for (const [freq, offset, peakGain] of notes) {
      const start = now + offset
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(peakGain, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.4)
    }

    setTimeout(() => ctx.close(), 900)
  } catch {
    // Autoplay/permission restrictions or no AudioContext support — silently skip.
  }
}

// A new inbound message — a short two-note "ping" (perfect fifth up).
export function playNotificationSound() {
  playNotes('message', [
    [880, 0, 0.12], // A5
    [1318.5, 0.09, 0.12], // E6
  ])
}

// A sale — distinct from the message ping (brief: "Sale → feedback visuel +
// son optionnel", explicitly separate from "New message → badge/état").
// Three-note ascending major triad, brighter/longer than the message ping
// so a sale is unmistakably a bigger event without becoming a slot-machine
// jingle.
export function playSaleSound() {
  playNotes('sale', [
    [659.25, 0, 0.11], // E5
    [830.61, 0.1, 0.12], // G#5
    [1108.73, 0.2, 0.14], // C#6
  ])
}
