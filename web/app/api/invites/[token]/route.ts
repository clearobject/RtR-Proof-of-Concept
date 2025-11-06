import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/invites/[token] - Get invite details (for validation)
// This endpoint allows unauthenticated access for invite validation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Use anon client for unauthenticated access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const { createClient: createAnonClient } = await import('@supabase/supabase-js')
    const supabase = createAnonClient(supabaseUrl, supabaseAnonKey)
    
    const { token } = await params

    const { data: invite, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !invite) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite token has expired' }, { status: 400 })
    }

    // Check if max uses reached
    if (invite.current_uses >= invite.max_uses) {
      return NextResponse.json({ error: 'Invite token has been used' }, { status: 400 })
    }

    return NextResponse.json({ invite })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/invites/[token]/accept - Accept an invite and create user
// This endpoint allows unauthenticated access for invite acceptance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const { createClient: createAnonClient } = await import('@supabase/supabase-js')
    const supabase = createAnonClient(supabaseUrl, supabaseAnonKey)
    
    const { token } = await params

    // Get invite details
    const { data: invite, error: inviteError } = await supabase
      .from('invite_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite token has expired' }, { status: 400 })
    }

    // Check if max uses reached
    if (invite.current_uses >= invite.max_uses) {
      return NextResponse.json({ error: 'Invite token has been used' }, { status: 400 })
    }

    const body = await request.json()
    const { email, password } = body

    // Validate email matches if specified
    if (invite.email && invite.email !== email) {
      return NextResponse.json({ error: 'Email does not match invite' }, { status: 400 })
    }

    // Create user account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create user profile using the session from signup
    // Create a new client with the session to insert the profile
    if (authData.session) {
      const { createClient: createClientWithSession } = await import('@supabase/supabase-js')
      const authenticatedSupabase = createClientWithSession(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${authData.session.access_token}`,
          },
        },
      })

      const { error: profileError } = await authenticatedSupabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email,
          role: invite.role,
          facility_id: invite.facility_id || null,
        })

      if (profileError) {
        console.error('Failed to create user profile:', profileError)
        return NextResponse.json({ 
          error: 'Failed to create user profile. Please contact support.' 
        }, { status: 500 })
      }
    } else {
      // If no session (email confirmation required), we'll need to handle this differently
      // For now, return an error suggesting they check their email
      return NextResponse.json({ 
        error: 'Please check your email to confirm your account before continuing.' 
      }, { status: 400 })
    }

    // Mark invite as used (using anon client with the token check)
    await supabase
      .from('invite_tokens')
      .update({
        used_at: new Date().toISOString(),
        used_by: authData.user.id,
        current_uses: invite.current_uses + 1,
      })
      .eq('id', invite.id)

    return NextResponse.json({ 
      success: true, 
      user: authData.user 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

