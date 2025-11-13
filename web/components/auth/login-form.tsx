'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState<'signin' | 'reset' | 'magic' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading('signin')
    setError(null)
    setStatus(null)

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
      setLoading(null)
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Configuration error: Please check Supabase environment variables'
      )
    } finally {
      setLoading(null)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address to receive reset instructions.')
      setStatus(null)
      return
    }

    setLoading('reset')
    setError(null)
    setStatus(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
      setLoading(null)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) {
        setError(error.message)
      } else {
        setStatus('Password reset email sent. Please check your inbox.')
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Configuration error: Please check Supabase environment variables'
      )
    } finally {
      setLoading(null)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address to receive a magic link.')
      setStatus(null)
      return
    }

    setLoading('magic')
    setError(null)
    setStatus(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
      setLoading(null)
      return
    }

    try {
      const supabase = createClient()
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard`
          : undefined

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setStatus('Magic link sent! Check your email to sign in.')
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Configuration error: Please check Supabase environment variables'
      )
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Operations Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {status && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{status}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={loading !== null}>
              {loading === 'signin' ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center text-rtr-wine hover:text-rtr-wine-light"
              disabled={loading !== null}
              onClick={handleResetPassword}
            >
              {loading === 'reset' ? 'Sending reset email...' : 'Reset Password'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center text-rtr-wine hover:text-rtr-wine-light"
              disabled={loading !== null}
              onClick={handleMagicLink}
            >
              {loading === 'magic' ? 'Sending magic link...' : 'Sign In with Magic Link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

