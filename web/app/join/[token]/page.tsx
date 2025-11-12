'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { JoinLink } from '@/lib/types'
import { useParams, useRouter } from 'next/navigation'

export default function JoinRequestPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [joinLink, setJoinLink] = useState<JoinLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/join-links/${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Join link unavailable')
        }

        setJoinLink(data.joinLink)
      } catch (err: any) {
        setError(err.message || 'Failed to load join link')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      load()
    }
  }, [token])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!email) {
      setError('Email is required')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          joinToken: token,
          email,
          fullName,
          notes,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Unable to submit request right now')
    } finally {
      setSubmitting(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="text-center text-gray-600">Validating join link...</div>
        </div>
      )
    }

    if (error && !joinLink) {
      return (
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="text-center text-2xl font-semibold text-gray-900">Join Link Unavailable</h2>
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          <Button className="mt-6 w-full" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      )
    }

    if (submitted) {
      return (
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900">Request Received</h2>
          <p className="mt-4 text-sm text-gray-600">
            Thanks for your interest! Our team will review your request and follow up via email at{' '}
            <span className="font-semibold text-gray-800">{email}</span>. You can close this page
            once you&apos;re ready.
          </p>
          <Button className="mt-6" onClick={() => router.push('/login')}>
            Return to Login
          </Button>
        </div>
      )
    }

    return (
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Request Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill out this short form and an administrator will review your request.
          </p>
          {joinLink?.name && (
            <p className="mt-1 text-xs text-gray-500">Join link: {joinLink.name}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jane.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">How will you use Rent the Runway Ops?</Label>
              <textarea
                id="notes"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rtr-wine focus:outline-none focus:ring-1 focus:ring-rtr-wine"
                rows={4}
                placeholder="Share any relevant context or teams you support."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting request...' : 'Submit access request'}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {renderContent()}
    </div>
  )
}



