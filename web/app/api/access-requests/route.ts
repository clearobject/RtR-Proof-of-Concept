import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

function isAuthorizedRole(role?: string | null) {
  return role === 'admin' || role === 'manager'
}

async function requireAdminContext() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !isAuthorizedRole(profile?.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, user, role: profile?.role }
}

export async function GET(request: NextRequest) {
  try {
    const { error, supabase } = await requireAdminContext()
    if (error || !supabase) return error!

    const statusFilter = request.nextUrl.searchParams.get('status')

    const query = supabase
      .from('access_requests')
      .select('*, join_links (token, name)')
      .order('created_at', { ascending: false })

    if (statusFilter) {
      query.eq('status', statusFilter)
    }

    const { data: requests, error: requestsError } = await query

    if (requestsError) {
      return NextResponse.json({ error: requestsError.message }, { status: 500 })
    }

    return NextResponse.json({ requests: requests ?? [] })
  } catch (err: any) {
    console.error('[AccessRequests][GET] Unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      joinToken,
      email,
      fullName,
      notes,
    }: { joinToken?: string; email?: string; fullName?: string; notes?: string } = body ?? {}

    if (!joinToken || typeof joinToken !== 'string') {
      return NextResponse.json({ error: 'joinToken is required' }, { status: 400 })
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('create_access_request', {
      p_token: joinToken,
      p_email: trimmedEmail,
      p_full_name: fullName?.trim() || null,
      p_notes: notes?.trim() || null,
    })

    if (error) {
      const message =
        error.message?.includes('Invalid or expired join link') ||
        error.message?.includes('raise exception')
          ? 'Join link is no longer valid'
          : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ request: data })
  } catch (err: any) {
    console.error('[AccessRequests][POST] Unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}






