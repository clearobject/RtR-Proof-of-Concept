import { NextRequest, NextResponse } from 'next/server'

import { getAllowedEmailDomain, isAllowedCorporateEmail } from '@/lib/auth/email-domain'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl
  const code = requestUrl.searchParams.get('code')
  const nextPath = requestUrl.searchParams.get('next') || '/dashboard'
  const safeNextPath = nextPath.startsWith('/') ? nextPath : '/dashboard'

  const loginUrl = new URL('/login', request.url)

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      loginUrl.searchParams.set('message', 'Google sign-in failed. Please try again.')
      return NextResponse.redirect(loginUrl)
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    loginUrl.searchParams.set('message', 'Could not validate your sign-in session.')
    return NextResponse.redirect(loginUrl)
  }

  if (!isAllowedCorporateEmail(user.email)) {
    await supabase.auth.signOut()
    loginUrl.searchParams.set(
      'message',
      `Only @${getAllowedEmailDomain()} accounts can sign in with Google.`
    )
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    await supabase.auth.signOut()
    loginUrl.searchParams.set('message', 'Unable to verify account access. Please try again.')
    return NextResponse.redirect(loginUrl)
  }

  if (!profile) {
    const { error: createProfileError } = await supabase.from('user_profiles').insert({
      id: user.id,
      email: user.email,
      role: 'operator',
      facility_id: null,
    })

    if (createProfileError) {
      await supabase.auth.signOut()
      loginUrl.searchParams.set('message', 'Unable to provision your account. Please contact support.')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.redirect(new URL(safeNextPath, request.url))
}
