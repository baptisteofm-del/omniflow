export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on server startup
    const { checkEnvVars } = require('./lib/security/env-check')
    checkEnvVars()
  }
}
