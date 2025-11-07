import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Check if Supabase is configured before trying to use it
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only check auth if Supabase is configured
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      // If there's an auth error, log it but continue to show login
      if (authError) {
        console.error('Auth error:', authError.message)
      }

      // If authenticated, redirect to dashboard
      if (user) {
        redirect('/dashboard')
      }
    } catch (error: any) {
      // If there's an error checking auth, log it and show login page
      // This could be a network error, invalid URL, etc.
      console.error('Error creating Supabase client:', error?.message || 'Unknown error')
      // Continue to show login form even if there's an error
    }
  }

  // If not authenticated or Supabase not configured, show login form
  return <LoginForm />
}
