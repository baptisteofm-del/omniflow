import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex')

export function encrypt(text: string): string {
  if (!text) return ''
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Format: iv:authTag:encrypted (tout en hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText
  try {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
    decipher.setAuthTag(authTag)
    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
  } catch {
    return encryptedText // Si déjà déchiffré ou non chiffré
  }
}

export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.split(':').length === 3 && value.split(':')[0].length === 32
}
