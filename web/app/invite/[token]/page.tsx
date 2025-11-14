'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { InviteToken } from '@/lib/types'

export default function InviteAcceptancePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [invite, setInvite] = useState<InviteToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    loadInvite()
  }, [token])

  const loadInvite = async () => {
    try {
      const response = await fetch(`/api/invites/${token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid invite token')
        return
      }

      setInvite(data.invite)
      if (data.invite.email) {
        setEmail(data.invite.email)
      }
    } catch (err: any) {
      setError('Failed to load invite')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/invites/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to accept invite' }))
        throw new Error(errorData.error || 'Failed to accept invite')
      }

      const data = await response.json()

      // Sign in the user
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Account created but sign in failed - redirect to login
        router.push('/login?message=Account created. Please sign in.')
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">Loading invite...</div>
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Invalid Invite
            </h2>
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          </div>
          <Button
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Accept Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account to join Rent the Runway Operations
          </p>
          {invite && (
            <p className="mt-1 text-center text-xs text-gray-500">
              Role: <span className="font-medium capitalize">{invite.role}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                disabled={!!invite?.email}
                className="mt-1"
              />
              {invite?.email && (
                <p className="mt-1 text-xs text-gray-500">
                  Email is pre-filled for this invite
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

