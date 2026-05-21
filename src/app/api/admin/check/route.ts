import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the current user from auth headers or session
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }

    // Use admin client to check if user is in admins table
    // For now, return false - you'll need to implement actual admin check
    // based on your authentication system
    
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  }
}
