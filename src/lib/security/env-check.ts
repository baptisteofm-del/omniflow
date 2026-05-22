const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'ENCRYPTION_KEY',
  'RESEND_API_KEY',
]

export function checkEnvVars() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v])
  if (missing.length > 0) {
    console.error('⚠️ Variables manquantes:', missing.join(', '))
  }
}
