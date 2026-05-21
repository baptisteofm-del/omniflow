import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendOnboardingEmail } from '@/lib/email/resend'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, agencyName, day } = await request.json()

    if (!email || !agencyName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, agencyName' },
        { status: 400 }
      )
    }

    // Check if email was already sent for this day (prevent duplicates)
    if (day) {
      const { data: existing } = await supabase
        .from('email_drip_log')
        .select('*')
        .eq('email', email)
        .eq('day_number', day)
        .single()

      if (existing) {
        return NextResponse.json(
          { message: 'Email already sent for this day', sent: false },
          { status: 200 }
        )
      }
    }

    // Send the appropriate email
    if (day === 0 || !day) {
      await sendWelcomeEmail(email, agencyName)
    } else {
      await sendOnboardingEmail(email, agencyName, day)
    }

    // Log the email send
    await supabase.from('email_drip_log').insert({
      email,
      day_number: day || 0,
    })

    return NextResponse.json(
      { message: 'Email sent successfully', sent: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email drip error:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    )
  }
}
