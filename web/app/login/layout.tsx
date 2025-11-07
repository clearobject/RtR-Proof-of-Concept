import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if Supabase is configured before trying to use it
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only check auth if Supabase is configured
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // If user is already logged in, redirect to dashboard
      if (user) {
        redirect('/dashboard')
      }
    } catch (error) {
      // If there's an error checking auth, just show login page
      // This allows the app to work even if Supabase has issues
    }
  }

  return <>{children}</>
}


