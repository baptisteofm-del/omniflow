/**
 * GET /api/admin/kling-balance-check
 * 
 * Vérifie le solde de crédits Kling et envoie un email d'alerte
 * si le solde descend sous le seuil configuré.
 * 
 * À appeler via un cron Vercel (vercel.json) ou n8n toutes les heures.
 * Sécurisé par CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const ALERT_THRESHOLD = Number(process.env.KLING_BALANCE_ALERT_THRESHOLD ?? 50)  // crédits restants
const ADMIN_EMAIL     = process.env.ADMIN_ALERT_EMAIL ?? 'baptiste.ofm@gmail.com'

export const dynamic = 'force-dynamic'

// ── Auth cron ────────────────────────────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // pas de secret configuré → on laisse passer (dev)
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

// ── Récupère le solde Kling via leur API ─────────────────────────────────────
async function getKlingBalance(): Promise<number | null> {
  try {
    const accessKey = process.env.KLING_ACCESS_KEY!
    const secretKey = process.env.KLING_SECRET_KEY!
    const crypto = await import('crypto')

    // Générer JWT
    const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const now     = Math.floor(Date.now() / 1000)
    const payload = Buffer.from(JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 })).toString('base64url')
    const sig     = crypto.createHmac('sha256', secretKey).update(`${header}.${payload}`).digest('base64url')
    const token   = `${header}.${payload}.${sig}`

    const res = await fetch('https://api.klingai.com/account/costs', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) return null
    const data = await res.json()
    // L'API Kling retourne le solde dans data.data.resource_package_balance ou similar
    return data?.data?.balance ?? data?.balance ?? null
  } catch {
    return null
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const balance = await getKlingBalance()

  if (balance === null) {
    return NextResponse.json({
      ok: false,
      message: 'Impossible de récupérer le solde Kling (vérifier KLING_ACCESS_KEY/KLING_SECRET_KEY)',
    })
  }

  const isLow = balance <= ALERT_THRESHOLD

  if (isLow) {
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'OmniFlow Alertes <alerts@omniflowapp.ai>',
      to:   ADMIN_EMAIL,
      subject: `🚨 Kling AI — Solde bas : ${balance} crédits restants`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;">
          <h2 style="color:#e53e3e;">⚠️ Solde Kling AI bas</h2>
          <p>Ton solde Kling AI est descendu à <strong>${balance} crédits</strong>.</p>
          <p>Seuil d'alerte configuré : <strong>${ALERT_THRESHOLD} crédits</strong></p>
          <p style="margin-top:24px;">
            <a href="https://klingai.com" 
               style="background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Recharger sur Kling AI →
            </a>
          </p>
          <p style="color:#888;font-size:12px;margin-top:32px;">
            Alerte automatique Omniflow · Modifie le seuil via KLING_BALANCE_ALERT_THRESHOLD dans tes variables d'env Vercel
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true, balance, alert: true, message: `Alerte envoyée à ${ADMIN_EMAIL}` })
  }

  return NextResponse.json({ ok: true, balance, alert: false, message: 'Solde OK' })
}
