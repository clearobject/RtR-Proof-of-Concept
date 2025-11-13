import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createClient as createServerClient } from '@/lib/supabase/server'

type AccessRequestAction = 'approve' | 'deny'

function isAuthorizedRole(role?: string | null) {
  return role === 'admin' || role === 'manager'
}

async function requireAdminContext() {
  const supabase = await createServerClient()

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

async function generateInviteToken(supabase: SupabaseClient<any>) {
  const { data: rpcToken, error: rpcError } = await supabase.rpc('generate_invite_token')
  if (rpcError || !rpcToken) {
    const crypto = await import('crypto')
    return crypto.randomBytes(32).toString('base64url').replace(/[+/=]/g, '')
  }
  return rpcToken as string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error, supabase, user, role: currentRole } = await requireAdminContext()
    if (error || !supabase || !user) return error!

    const body = await request.json()
    const {
      action,
      notes,
      inviteRole,
      inviteExpiresInDays,
    }: {
      action?: AccessRequestAction
      notes?: string
      inviteRole?: string
      inviteExpiresInDays?: number
    } = body ?? {}

    if (!action || !['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const { data: accessRequest, error: fetchError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!accessRequest) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
    }

    if (accessRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot ${action} a request that is already ${accessRequest.status}` },
        { status: 400 }
      )
    }

    if (action === 'deny') {
      const { data: updatedRequest, error: updateError } = await supabase
        .from('access_requests')
        .update({
          status: 'denied',
          resolution_notes: notes?.trim() || null,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', id)
        .select('*, join_links (token, name)')
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ request: updatedRequest })
    }

    const requestedRole =
      inviteRole === 'admin' ? (currentRole === 'admin' ? 'admin' : 'operator') : inviteRole
    const allowedRoles = ['operator', 'maintenance', 'manager', 'admin']
    const invitedRole = requestedRole && allowedRoles.includes(requestedRole)
      ? requestedRole
      : 'operator'

    const inviteToken = await generateInviteToken(supabase)

    const expiresIn = typeof inviteExpiresInDays === 'number' ? inviteExpiresInDays : 7
    const expiresDate = new Date()
    expiresDate.setDate(expiresDate.getDate() + Math.max(1, Math.trunc(expiresIn)))

    // Use service role client to bypass RLS for this insert
    // We've already verified the user is admin/manager above
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: invite, error: inviteError } = await serviceClient
      .from('invite_tokens')
      .insert({
        token: inviteToken,
        created_by: user.id,
        email: accessRequest.email,
        role: invitedRole,
        facility_id: null,
        expires_at: expiresDate.toISOString(),
        max_uses: 1,
        current_uses: 0,
      })
      .select()
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: inviteError?.message || 'Failed to create invite' }, { status: 500 })
    }

    const { data: updatedRequest, error: updateRequestError } = await supabase
      .from('access_requests')
      .update({
        status: 'approved',
        resolution_notes: notes?.trim() || null,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        invite_token_id: invite.id,
        invite_token: invite.token,
      })
      .eq('id', id)
      .select('*, join_links (token, name)')
      .single()

    if (updateRequestError) {
      return NextResponse.json({ error: updateRequestError.message }, { status: 500 })
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const inviteUrl = `${origin}/invite/${invite.token}`

    return NextResponse.json({
      request: updatedRequest,
      invite,
      inviteUrl,
    })
  } catch (err: any) {
    console.error('[AccessRequestsId][PATCH] Unexpected error:', err)
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 })
  }
}


