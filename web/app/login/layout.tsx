import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    // If Supabase is not configured or there's an error, just show login page
    // This allows the build to succeed even without env vars
  }

  return <>{children}</>
}


