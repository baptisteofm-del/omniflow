// Synthesized (no audio asset to license/ship) — a short two-note chime,
// deliberately soft per spec 47.34 ("motion/glow must reinforce premium,
// not become a demo of effects"). Web Audio API only runs client-side.
export function playNotificationSound() {
  if (typeof window === 'undefined') return
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const now = ctx.currentTime

    const notes: [number, number][] = [
      [880, now], // A5
      [1318.5, now + 0.09], // E6 — perfect fifth above, a clean "ping"
    ]

    for (const [freq, start] of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.12, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.4)
    }

    setTimeout(() => ctx.close(), 600)
  } catch {
    // Autoplay/permission restrictions or no AudioContext support — silently skip.
  }
}
