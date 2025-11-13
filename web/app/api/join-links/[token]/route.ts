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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_join_link_by_token', {
      p_token: token,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Join link not found or expired' }, { status: 404 })
    }

    return NextResponse.json({ joinLink: data })
  } catch (err: any) {
    console.error('[JoinLinksToken][GET] Unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { error, supabase } = await requireAdminContext()
    if (error || !supabase) return error!

    const body = await request.json()
    const {
      name,
      description,
      status,
      expiresAt,
      maxRequests,
    }: {
      name?: string | null
      description?: string | null
      status?: 'active' | 'revoked'
      expiresAt?: string | null
      maxRequests?: number | null
    } = body ?? {}

    if (maxRequests !== undefined && maxRequests !== null && maxRequests < 0) {
      return NextResponse.json(
        { error: 'maxRequests must be zero or greater when provided' },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, any> = {
      ...(name !== undefined ? { name: name?.trim() || null } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(status ? { status } : {}),
      ...(expiresAt !== undefined ? { expires_at: expiresAt || null } : {}),
      ...(maxRequests !== undefined ? { max_requests: maxRequests } : {}),
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data: joinLink, error: updateError } = await supabase
      .from('join_links')
      .update(updatePayload)
      .eq('token', token)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ joinLink })
  } catch (err: any) {
    console.error('[JoinLinksToken][PATCH] Unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}




