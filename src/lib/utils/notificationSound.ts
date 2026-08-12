// Synthesized (no audio asset to license/ship) — deliberately soft per spec
// 47.34 ("motion/glow must reinforce premium, not become a demo of
// effects"). Web Audio API only runs client-side.

const MUTE_KEY = 'omniflow_sound_muted'

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MUTE_KEY) === '1'
}

export function setSoundMuted(muted: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
}

function playNotes(notes: [number, number, number][]) {
  if (typeof window === 'undefined' || isSoundMuted()) return
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
  playNotes([
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
  playNotes([
    [659.25, 0, 0.11], // E5
    [830.61, 0.1, 0.12], // G#5
    [1108.73, 0.2, 0.14], // C#6
  ])
}
