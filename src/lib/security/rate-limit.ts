// Simple in-memory rate limiter (fonctionne par instance Vercel)
const attempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = attempts.get(key)
  
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true // OK
  }
  
  if (record.count >= maxAttempts) {
    return false // Bloqué
  }
  
  record.count++
  return true // OK
}
