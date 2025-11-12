'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface JoinLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function JoinLinkModal({ isOpen, onClose, onCreated }: JoinLinkModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [expiresInDays, setExpiresInDays] = useState<number | ''>(14)
  const [maxRequests, setMaxRequests] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/join-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          description: description.trim() || undefined,
          expiresInDays: expiresInDays === '' ? undefined : expiresInDays,
          maxRequests: maxRequests === '' ? undefined : maxRequests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create join link')
      }

      setName('')
      setDescription('')
      setExpiresInDays(14)
      setMaxRequests('')
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Create Join Link</h2>
            <p className="text-sm text-gray-500">
              Share this link so teammates can request access to the platform.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 transition hover:text-gray-700"
            aria-label="Close join link modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="join-link-name">Name</Label>
            <Input
              id="join-link-name"
              placeholder="Example: RTR Ops Access"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. Helps you remember why this join link exists.
            </p>
          </div>

          <div>
            <Label htmlFor="join-link-description">Description</Label>
            <textarea
              id="join-link-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about who should use this link."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-rtr-wine focus:outline-none focus:ring-1 focus:ring-rtr-wine"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="join-link-expires">Expires in (days)</Label>
              <Input
                id="join-link-expires"
                type="number"
                min="1"
                value={expiresInDays}
                onChange={(e) => {
                  const value = e.target.value
                  setExpiresInDays(value === '' ? '' : Math.max(1, Number(value)))
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to create a link without an expiration.
              </p>
            </div>

            <div>
              <Label htmlFor="join-link-max-requests">Max Requests</Label>
              <Input
                id="join-link-max-requests"
                type="number"
                min="1"
                value={maxRequests}
                onChange={(e) => {
                  const value = e.target.value
                  setMaxRequests(value === '' ? '' : Math.max(1, Number(value)))
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank for unlimited requests.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


