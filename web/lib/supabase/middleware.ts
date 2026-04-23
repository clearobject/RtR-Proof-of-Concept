import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // If env vars are missing, allow access to login page only
    if (!request.nextUrl.pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname
  const isInviteRoute = pathname.startsWith('/invite')
  const isJoinRoute = pathname.startsWith('/join')
  const isApiRoute = pathname.startsWith('/api')
  const isAuthRoute = pathname.startsWith('/auth')

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasProfile = false

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    hasProfile = Boolean(profile)

    if (!hasProfile && !isInviteRoute && !isJoinRoute && !isApiRoute && !isAuthRoute && pathname !== '/login') {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('message', 'Access requires administrator approval.')
      return NextResponse.redirect(url)
    }
  }

  // Protect routes - redirect to login if not authenticated
  // But allow invite routes and API routes
  if (!user && !pathname.startsWith('/login') && !isInviteRoute && !isJoinRoute && !isApiRoute && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login page and root
  if (user && hasProfile && (pathname === '/login' || pathname === '/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Allow unauthenticated access to root and login
  if (!user && (pathname === '/' || pathname === '/login' || isJoinRoute || isAuthRoute)) {
    return response
  }

  return response
}


