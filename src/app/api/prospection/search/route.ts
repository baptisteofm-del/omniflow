import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Realistic names database
const firstNames = [
  'Sophie', 'Emma', 'Clara', 'Lea', 'Maya', 'Eva', 'Nina', 'Zoe', 'Luna', 'Amber',
  'Victoria', 'Justine', 'Camille', 'Manon', 'Sarah', 'Jessica', 'Laura', 'Olivia',
  'Nathalie', 'Marine'
]

const lastNames = [
  'Martin', 'Bernard', 'Dubois', 'Laurent', 'Simon', 'Michel', 'Garcia', 'David',
  'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Lefebvre', 'Henry'
]

const niches = [
  'fitness', 'lifestyle', 'glamour', 'beauty', 'health', 'gaming', 'music', 
  'fashion', 'travel', 'food'
]

function generateRealisticProspects(
  count: number,
  platforms: string[],
  niche: string,
  accountSize: string
): any[] {
  const prospects = []
  const accountSizeRanges = {
    micro: { min: 1000, max: 10000 },
    mid: { min: 10000, max: 100000 },
    macro: { min: 100000, max: 1000000 },
  }

  const range = accountSizeRanges[accountSize as keyof typeof accountSizeRanges] || accountSizeRanges.mid

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 999)}`
    const platform = platforms[Math.floor(Math.random() * platforms.length)]
    const followers = Math.floor(Math.random() * (range.max - range.min) + range.min)
    const engagementRate = (Math.random() * 0.08 + 0.02).toFixed(4) // 2-10%
    
    prospects.push({
      username,
      platform,
      followers_estimate: followers,
      engagement_rate: parseFloat(engagementRate as string),
      niche: niche || niches[Math.floor(Math.random() * niches.length)],
      potential_score: Math.floor(Math.random() * 5) + 3, // 3-8 stars
      status: 'discovered',
      notes: '',
    })
  }

  return prospects
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const { platforms, niche, accountSize } = await request.json()

    // Generate mock prospects (in production, this would call an actual AI scraping service)
    const mockProspects = generateRealisticProspects(12, platforms, niche, accountSize)

    // Insert prospects into database
    const prospectRecords = mockProspects.map((p) => ({
      ...p,
      agency_id: agency.id,
    }))

    const { data: insertedProspects, error } = await supabase
      .from('prospects')
      .insert(prospectRecords)
      .select('*')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prospects: insertedProspects,
      message: `${insertedProspects?.length || 0} prospects trouvés`,
    })
  } catch (error) {
    console.error('Error searching prospects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
