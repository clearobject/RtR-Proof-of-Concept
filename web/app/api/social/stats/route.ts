import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/social/stats - Get aggregated sentiment statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range from query params (default to last 30 days)
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all posts in date range
    const { data: posts, error } = await supabase
      .from('social_posts')
      .select('platform, sentiment_score, category, posted_at')
      .gte('posted_at', startDate.toISOString())
      .order('posted_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        overallNPS: 0,
        totalPosts: 0,
        byPlatform: {},
        byCategory: {},
        sentimentDistribution: { promoters: 0, passives: 0, detractors: 0 },
        trendData: [],
      })
    }

    // Calculate overall NPS (average sentiment score)
    const overallNPS = posts.reduce((sum, p) => sum + p.sentiment_score, 0) / posts.length

    // Group by platform
    const byPlatform: Record<string, { count: number; avgNPS: number }> = {}
    posts.forEach(post => {
      if (!byPlatform[post.platform]) {
        byPlatform[post.platform] = { count: 0, avgNPS: 0 }
      }
      byPlatform[post.platform].count++
      byPlatform[post.platform].avgNPS += post.sentiment_score
    })
    Object.keys(byPlatform).forEach(platform => {
      byPlatform[platform].avgNPS = byPlatform[platform].avgNPS / byPlatform[platform].count
    })

    // Group by category
    const byCategory: Record<string, { count: number; avgNPS: number }> = {}
    posts.forEach(post => {
      const category = post.category || 'uncategorized'
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, avgNPS: 0 }
      }
      byCategory[category].count++
      byCategory[category].avgNPS += post.sentiment_score
    })
    Object.keys(byCategory).forEach(category => {
      byCategory[category].avgNPS = byCategory[category].avgNPS / byCategory[category].count
    })

    // Sentiment distribution (NPS-style: 9-10 promoters, 7-8 passives, 1-6 detractors)
    const sentimentDistribution = {
      promoters: posts.filter(p => p.sentiment_score >= 9).length,
      passives: posts.filter(p => p.sentiment_score >= 7 && p.sentiment_score < 9).length,
      detractors: posts.filter(p => p.sentiment_score < 7).length,
    }

    // Trend data (daily averages)
    const trendMap = new Map<string, { count: number; sum: number }>()
    posts.forEach(post => {
      const date = new Date(post.posted_at).toISOString().split('T')[0]
      if (!trendMap.has(date)) {
        trendMap.set(date, { count: 0, sum: 0 })
      }
      const entry = trendMap.get(date)!
      entry.count++
      entry.sum += post.sentiment_score
    })

    const trendData = Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        avgNPS: data.sum / data.count,
        count: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      overallNPS: Math.round(overallNPS * 10) / 10,
      totalPosts: posts.length,
      byPlatform,
      byCategory,
      sentimentDistribution,
      trendData,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

