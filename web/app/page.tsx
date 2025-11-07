import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Check if user is authenticated
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If authenticated, redirect to dashboard
    if (user) {
      redirect('/dashboard')
    }
  } catch (error) {
    // If there's an error, just show login page
    console.error('Error checking auth:', error)
  }

  // If not authenticated, show login form
  return <LoginForm />
}
