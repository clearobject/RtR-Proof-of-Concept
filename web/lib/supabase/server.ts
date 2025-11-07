// Supabase server client for server components and route handlers
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // In production, throw a more descriptive error that can be caught
    const error = new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
    // Add a code to help identify this specific error
    ;(error as any).code = 'MISSING_ENV_VARS'
    throw error
  }

  try {
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll()
          } catch (err: any) {
            console.error('[Supabase Client] Error getting cookies:', err?.message)
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (err: any) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn('[Supabase Client] Could not set cookies (expected in some contexts):', err?.message)
          }
        },
      },
    })
  } catch (error: any) {
    // If cookies() fails (e.g., called in wrong context), provide helpful error
    console.error('[Supabase Client] Failed to create client:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    const cookiesError = new Error(
      'Failed to create Supabase client: cookies() unavailable. This may occur if called in an unsupported context.'
    )
    ;(cookiesError as any).code = 'COOKIES_ERROR'
    ;(cookiesError as any).originalError = error
    throw cookiesError
  }
}


