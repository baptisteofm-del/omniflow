import { encrypt, decrypt, isEncrypted } from './encrypt'

// Champs sensibles par intégration
const SENSITIVE_FIELDS: Record<string, string[]> = {
  onlyfans: ['password', 'authId', 'sess', 'bcTokens'],
  mym: ['password'],
  binance: ['secret_key', 'api_key'],
  coinbase: ['api_key'],
  stripe: ['api_key'],
  geelark: ['api_key'],
  adspower: ['api_key'],
}

export function encryptIntegrationData(tool: string, data: Record<string, any>): Record<string, any> {
  const fields = SENSITIVE_FIELDS[tool] || []
  const result = { ...data }
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string' && !isEncrypted(result[field])) {
      result[field] = encrypt(result[field])
    }
  }
  return result
}

export function decryptIntegrationData(tool: string, data: Record<string, any>): Record<string, any> {
  const fields = SENSITIVE_FIELDS[tool] || []
  const result = { ...data }
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string' && isEncrypted(result[field])) {
      result[field] = decrypt(result[field])
    }
  }
  return result
}
