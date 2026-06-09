import { NextRequest, NextResponse } from 'next/server'
import { sendOnboardingEmail } from '@/lib/email/resend'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This endpoint is called by Vercel Cron (GET) or externally via POST with Bearer token
export async function GET(request: NextRequest) {
  // Vercel Cron calls via GET — verify via CRON_SECRET header injected by Vercel
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runDrip()
}

export async function POST(request: NextRequest) {
  // Legacy: external call with EMAIL_SCHEDULER_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.EMAIL_SCHEDULER_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runDrip()
}

async function runDrip() {
  try {
    // Get all agencies that were created exactly 1, 3, or 7 days ago
    const daysToSend = [1, 3, 7]
    const now = new Date()

    for (const day of daysToSend) {
      // Calculate the date range for agencies created `day` days ago
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() - day)
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      // Get agencies created on that day
      const { data: agencies, error } = await supabase
        .from('agencies')
        .select('id, email, name')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())

      if (error) {
        console.error(`Error fetching agencies for day ${day}:`, error)
        continue
      }

      // Send email to each agency if not already sent
      for (const agency of agencies || []) {
        // Check if email was already sent
        const { data: existingLog } = await supabase
          .from('email_drip_log')
          .select('*')
          .eq('email', agency.email)
          .eq('day_number', day)
          .single()

        if (existingLog) {
          console.log(`Day ${day} email already sent to ${agency.email}`)
          continue
        }

        try {
          await sendOnboardingEmail(agency.email, agency.name, day)

          // Log the send
          await supabase.from('email_drip_log').insert({
            email: agency.email,
            day_number: day,
          })

          console.log(`Day ${day} email sent to ${agency.email}`)
        } catch (emailError) {
          console.error(`Failed to send day ${day} email to ${agency.email}:`, emailError)
        }
      }
    }

    return NextResponse.json({
      message: 'Scheduled email drip completed',
      processed: true,
    })
  } catch (error) {
    console.error('Email scheduler error:', error)
    return NextResponse.json(
      { error: 'Failed to process email schedule', details: String(error) },
      { status: 500 }
    )
  }
}
