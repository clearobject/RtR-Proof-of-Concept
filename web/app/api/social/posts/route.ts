import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/social/posts - Get social posts with filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform')
    const category = searchParams.get('category')
    const minSentiment = searchParams.get('min_sentiment')
    const maxSentiment = searchParams.get('max_sentiment')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('social_posts')
      .select('*')
      .order('posted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (platform) {
      query = query.eq('platform', platform)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (minSentiment) {
      query = query.gte('sentiment_score', parseInt(minSentiment))
    }
    if (maxSentiment) {
      query = query.lte('sentiment_score', parseInt(maxSentiment))
    }
    if (startDate) {
      query = query.gte('posted_at', startDate)
    }
    if (endDate) {
      query = query.lte('posted_at', endDate)
    }
    if (search) {
      query = query.ilike('content', `%${search}%`)
    }

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('social_posts')
      .select('*', { count: 'exact', head: true })

    if (platform) {
      countQuery = countQuery.eq('platform', platform)
    }
    if (category) {
      countQuery = countQuery.eq('category', category)
    }
    if (minSentiment) {
      countQuery = countQuery.gte('sentiment_score', parseInt(minSentiment))
    }
    if (maxSentiment) {
      countQuery = countQuery.lte('sentiment_score', parseInt(maxSentiment))
    }
    if (startDate) {
      countQuery = countQuery.gte('posted_at', startDate)
    }
    if (endDate) {
      countQuery = countQuery.lte('posted_at', endDate)
    }
    if (search) {
      countQuery = countQuery.ilike('content', `%${search}%`)
    }

    const { count } = await countQuery

    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

