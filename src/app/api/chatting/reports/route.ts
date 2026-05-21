import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Get today's report
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const { data: todayReport } = await supabase
      .from('chatting_reports')
      .select('*')
      .eq('agency_id', profile.agency_id)
      .eq('date', todayStr)
      .single()

    // Get yesterday's report for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const { data: yesterdayReport } = await supabase
      .from('chatting_reports')
      .select('*')
      .eq('agency_id', profile.agency_id)
      .eq('date', yesterdayStr)
      .single()

    return NextResponse.json({
      today: todayReport || {
        messages_sent: 0,
        revenue: 0,
        conversion_rate: 0,
        at_risk_count: 0,
      },
      yesterday: yesterdayReport || {
        messages_sent: 0,
        revenue: 0,
        conversion_rate: 0,
        at_risk_count: 0,
      },
    })
  } catch (error) {
    console.error('Reports fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    const body = await request.json()
    const { date, messages_sent, revenue, conversion_rate, at_risk_count } = body

    if (!date || messages_sent === undefined || revenue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: report, error } = await supabase
      .from('chatting_reports')
      .upsert({
        agency_id: profile.agency_id,
        date,
        messages_sent,
        revenue,
        conversion_rate: conversion_rate || 0,
        at_risk_count: at_risk_count || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error('Report create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create report' },
      { status: 500 }
    )
  }
}
