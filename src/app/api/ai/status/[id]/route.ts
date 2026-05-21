import { NextRequest, NextResponse } from 'next/server'
import { getGenerationStatus } from '@/lib/kling/client'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const status = await getGenerationStatus(id)
    return NextResponse.json(status)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
