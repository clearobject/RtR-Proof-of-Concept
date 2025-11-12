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

export async function GET() {
  try {
    const { error, supabase } = await requireAdminContext()
    if (error || !supabase) return error!

    const { data: joinLinks, error: joinLinksError } = await supabase
      .from('join_links')
      .select('*')
      .order('created_at', { ascending: false })

    if (joinLinksError) {
      return NextResponse.json({ error: joinLinksError.message }, { status: 500 })
    }

    return NextResponse.json({ joinLinks: joinLinks ?? [] })
  } catch (err: any) {
    console.error('[JoinLinks][GET] Unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, supabase, user } = await requireAdminContext()
    if (error || !supabase || !user) return error!

    const body = await request.json()
    const {
      name,
      description,
      expiresInDays,
      maxRequests,
    }: {
      name?: string
      description?: string
      expiresInDays?: number
      maxRequests?: number | null
    } = body ?? {}

    if (maxRequests !== undefined && maxRequests !== null && maxRequests < 0) {
      return NextResponse.json(
        { error: 'maxRequests must be zero or greater when provided' },
        { status: 400 }
      )
    }

    let expiresAt: string | null = null
    if (typeof expiresInDays === 'number' && Number.isFinite(expiresInDays)) {
      const expiresDate = new Date()
      expiresDate.setDate(expiresDate.getDate() + Math.max(0, Math.trunc(expiresInDays)))
      expiresAt = expiresDate.toISOString()
    }

    let generatedToken: string | null = null
    const { data: rpcToken, error: rpcError } = await supabase.rpc('generate_invite_token')
    if (!rpcError && rpcToken) {
      generatedToken = rpcToken as string
    } else {
      const crypto = await import('crypto')
      generatedToken = crypto.randomBytes(24).toString('base64url').replace(/[+/=]/g, '')
    }

    const { data: joinLink, error: insertError } = await supabase
      .from('join_links')
      .insert({
        token: generatedToken,
        name: name?.trim() || null,
        description: description?.trim() || null,
        created_by: user.id,
        expires_at: expiresAt,
        max_requests: maxRequests ?? null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ joinLink })
  } catch (err: any) {
    console.error('[JoinLinks][POST] Unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}


