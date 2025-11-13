import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/invites - List all invites (admin/manager only)
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or manager
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all invites
    const { data: invites, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invites })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/invites - Create a new invite
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or manager
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role = 'operator', facility_id, expires_in_days = 7, max_uses = 1 } = body

    // Generate token using database function
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_invite_token')

    if (tokenError || !tokenData) {
      // Fallback: generate token in application if RPC fails
      const crypto = await import('crypto')
      const randomBytes = crypto.randomBytes(32)
      const fallbackToken = randomBytes.toString('base64url').replace(/[+/=]/g, '')
      const token = fallbackToken
      
      // Calculate expiration date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expires_in_days)

      // Use service role client to bypass RLS for this insert
      // We've already verified the user is admin/manager above
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }

      const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data: invite, error } = await serviceClient
        .from('invite_tokens')
        .insert({
          token,
          created_by: user.id,
          email: email || null,
          role,
          facility_id: facility_id || null,
          expires_at: expiresAt.toISOString(),
          max_uses,
          current_uses: 0,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ invite })
    }

    const token = tokenData as string

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expires_in_days)

    // Use service role client to bypass RLS for this insert
    // We've already verified the user is admin/manager above
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: invite, error } = await serviceClient
      .from('invite_tokens')
      .insert({
        token,
        created_by: user.id,
        email: email || null,
        role,
        facility_id: facility_id || null,
        expires_at: expiresAt.toISOString(),
        max_uses,
        current_uses: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invite })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

