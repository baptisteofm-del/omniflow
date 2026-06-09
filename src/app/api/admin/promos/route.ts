import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createPromoCode,
  listPromoCodes,
  disablePromoCode,
} from '@/lib/promos'

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return user?.role === 'admin' || user?.role === 'owner'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const activeOnly = request.nextUrl.searchParams.get('active') === 'true'
    const codes = await listPromoCodes(activeOnly)

    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Error listing promo codes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const {
      code,
      discountType,
      discountValue,
      description,
      maxUses,
      maxUsesPerUser,
      applicablePlans,
      applicableTo,
      minAmount,
      expiresAt,
    } = await request.json()

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: 'code, discountType, and discountValue are required' },
        { status: 400 }
      )
    }

    if (!['percent', 'fixed', 'credits'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Invalid discountType' },
        { status: 400 }
      )
    }

    const result = await createPromoCode(
      code,
      discountType,
      discountValue,
      {
        description,
        maxUses,
        maxUsesPerUser,
        applicablePlans,
        applicableTo,
        minAmount,
        expiresAt,
        createdBy: user.email,
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      id: result.id,
    })
  } catch (error) {
    console.error('Error creating promo code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { codeId, isActive } = await request.json()

    if (!codeId) {
      return NextResponse.json(
        { error: 'codeId is required' },
        { status: 400 }
      )
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be boolean' },
        { status: 400 }
      )
    }

    const success = isActive ? true : await disablePromoCode(codeId)

    if (!success && !isActive) {
      return NextResponse.json(
        { error: 'Failed to update promo code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating promo code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { codeId } = await request.json()

    if (!codeId) {
      return NextResponse.json(
        { error: 'codeId is required' },
        { status: 400 }
      )
    }

    const success = await disablePromoCode(codeId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete promo code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promo code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
