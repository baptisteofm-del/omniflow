import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log the support message (in a real app, you'd store this in a database)
    console.log('New support message:', {
      timestamp: new Date().toISOString(),
      ...data,
    })

    // You could add email notification logic here
    // Example: send email to support@omniflowapp.ai

    return NextResponse.json(
      { success: true, message: 'Support message received' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing support request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
