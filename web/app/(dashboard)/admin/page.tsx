'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/browser'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InviteModal } from '@/components/user-management/invite-modal'
import { JoinLinkModal } from '@/components/user-management/join-link-modal'
import { QRCodeModal } from '@/components/user-management/qr-code-modal'
import type { AccessRequest, InviteToken, JoinLink, UserProfile, UserRole } from '@/lib/types'
import {
  Check,
  CheckCircle,
  Copy,
  Edit,
  Link as LinkIcon,
  QrCode,
  Trash2,
  UserCheck,
  UserPlus,
  XCircle,
} from 'lucide-react'

type AccessRequestWithLink = AccessRequest & {
  join_links?: {
    token: string
    name?: string | null
  }
}

const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Operator', value: 'operator' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Manager', value: 'manager' },
  { label: 'Admin', value: 'admin' },
]

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [invites, setInvites] = useState<InviteToken[]>([])
  const [joinLinks, setJoinLinks] = useState<JoinLink[]>([])
  const [requests, setRequests] = useState<AccessRequestWithLink[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isJoinLinkModalOpen, setIsJoinLinkModalOpen] = useState(false)
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; url: string }>({
    isOpen: false,
    url: '',
  })
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)
  const [copiedJoinToken, setCopiedJoinToken] = useState<string | null>(null)
  const [requestRoles, setRequestRoles] = useState<Record<string, UserRole>>({})
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null)
  const [requestFeedback, setRequestFeedback] = useState<Record<string, { inviteUrl?: string }>>({})

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)

      const [usersRes, invitesRes, joinLinksRes, requestsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/invites'),
        fetch('/api/join-links'),
        fetch('/api/access-requests'),
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json()
        setInvites(invitesData.invites || [])
      }

      if (joinLinksRes.ok) {
        const joinLinksData = await joinLinksRes.json()
        setJoinLinks(joinLinksData.joinLinks || [])
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setRequests(requestsData.requests || [])
      }
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedInviteId(token)
      setTimeout(() => setCopiedInviteId(null), 2000)
    } catch (err) {
      console.error('Failed to copy invite link:', err)
    }
  }

  const handleCopyJoinLink = async (token: string) => {
    const joinUrl = `${window.location.origin}/join/${token}`
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopiedJoinToken(token)
      setTimeout(() => setCopiedJoinToken(null), 2000)
    } catch (err) {
      console.error('Failed to copy join link:', err)
    }
  }

  const handleShowQR = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    setQrModalData({ isOpen: true, url: inviteUrl })
  }

  const handleEditUser = async (userProfile: UserProfile, updates: Partial<UserProfile>) => {
    try {
      const response = await fetch(`/api/users/${userProfile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user')
      }

      await loadData()
      setEditingUser(null)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      await loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleRevokeJoinLink = async (token: string) => {
    if (
      !confirm(
        'Revoke this join link? New access requests will be blocked but existing requests remain.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/join-links/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'revoked' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to revoke join link')
      }

      await loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    const role = requestRoles[requestId] || 'operator'
    setRequestActionLoading(requestId)
    try {
      const response = await fetch(`/api/access-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', inviteRole: role }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request')
      }

      setRequestFeedback((prev) => ({
        ...prev,
        [requestId]: { inviteUrl: data.inviteUrl },
      }))

      await loadData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setRequestActionLoading(null)
    }
  }

  const handleDenyRequest = async (requestId: string) => {
    const notes = window.prompt('Optional: add a note to explain the denial?', '') || undefined
    setRequestActionLoading(requestId)
    try {
      const response = await fetch(`/api/access-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deny', notes }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to deny request')
      }

      await loadData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setRequestActionLoading(null)
    }
  }

  const isAdmin = currentUser && users.find((u) => u.id === currentUser.id)?.role === 'admin'

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Loading admin data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="mt-1 text-gray-600">
            Manage team members, invitations, and access requests in a single place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsJoinLinkModalOpen(true)} variant="secondary">
            <LinkIcon className="mr-2 h-4 w-4" />
            Create Join Link
          </Button>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create Invite
          </Button>
        </div>
      </div>

      {/* Access Requests */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Access Requests</h2>
            <p className="text-sm text-gray-500">
              Review join link submissions and approve or deny access.
            </p>
          </div>
          <Badge variant="neutral">
            Pending:{' '}
            {requests.filter((request) => request.status === 'pending').length.toString()}
          </Badge>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Join Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                    No access requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const pending = request.status === 'pending'
                  const feedback = requestFeedback[request.id]
                  return (
                    <tr key={request.id} className="align-top">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{request.full_name || 'Unknown user'}</div>
                        <div className="text-xs text-gray-500">{request.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="font-medium">
                          {request.join_links?.name || request.join_token}
                        </div>
                        <div className="text-xs text-gray-400">{request.join_token}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {request.notes ? request.notes : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {request.status === 'pending' && (
                          <Badge variant="warning">Pending</Badge>
                        )}
                        {request.status === 'approved' && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                        {request.status === 'denied' && (
                          <Badge variant="danger" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Denied
                          </Badge>
                        )}
                        {request.resolution_notes && (
                          <div className="mt-1 text-xs text-gray-400">
                            {request.resolution_notes}
                          </div>
                        )}
                        {feedback?.inviteUrl && (
                          <div className="mt-2 text-xs text-emerald-600">
                            Invite ready:{' '}
                            <button
                              onClick={() => navigator.clipboard.writeText(feedback.inviteUrl!)}
                              className="underline"
                            >
                              Copy invite link
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {pending ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-500">Assign role:</label>
                              <select
                                value={requestRoles[request.id] || 'operator'}
                                onChange={(e) =>
                                  setRequestRoles((prev) => ({
                                    ...prev,
                                    [request.id]: e.target.value as UserRole,
                                  }))
                                }
                                className="rounded border border-gray-300 px-2 py-1 text-xs"
                              >
                                {roleOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                                disabled={requestActionLoading === request.id}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleDenyRequest(request.id)}
                                disabled={requestActionLoading === request.id}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Deny
                              </Button>
                            </div>
                          </div>
                        ) : request.invite_token ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyInviteLink(request.invite_token!)}
                          >
                            <Copy className="mr-1 h-4 w-4" />
                            Copy Invite
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">No actions</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Join Links */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Join Links</h2>
            <p className="text-sm text-gray-500">
              Shareable links for requesting access. Monitor usage and revoke when necessary.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {joinLinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                    No join links yet. Create one to start collecting access requests.
                  </td>
                </tr>
              ) : (
                joinLinks.map((joinLink) => {
                  const isActive =
                    joinLink.status === 'active' &&
                    (!joinLink.expires_at || new Date(joinLink.expires_at) > new Date())
                  const requestsLimit =
                    joinLink.max_requests !== null && joinLink.max_requests !== undefined
                      ? `${joinLink.current_requests}/${joinLink.max_requests}`
                      : `${joinLink.current_requests}`

                  return (
                    <tr key={joinLink.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{joinLink.name || 'Untitled join link'}</div>
                        {joinLink.description && (
                          <div className="text-xs text-gray-500">{joinLink.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{joinLink.token}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {joinLink.expires_at
                          ? new Date(joinLink.expires_at).toLocaleDateString()
                          : 'No expiration'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{requestsLimit}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {joinLink.status === 'revoked' || !isActive ? (
                          <Badge variant="danger">Inactive</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopyJoinLink(joinLink.token)}
                            disabled={!isActive}
                          >
                            {copiedJoinToken === joinLink.token ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRevokeJoinLink(joinLink.token)}
                            disabled={joinLink.status === 'revoked'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Active Invites */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Active Invites</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Uses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invites.filter((inv) => new Date(inv.expires_at) > new Date()).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No active invites
                  </td>
                </tr>
              ) : (
                invites
                  .filter(
                    (inv) =>
                      new Date(inv.expires_at) > new Date() && inv.current_uses < inv.max_uses
                  )
                  .map((invite) => (
                    <tr key={invite.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invite.email || 'Any email'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{invite.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {invite.current_uses} / {invite.max_uses}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopyInviteLink(invite.token)}
                          >
                            {copiedInviteId === invite.token ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleShowQR(invite.token)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Users</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.email}
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-gray-500">(You)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {editingUser?.id === user.id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                        }
                        className="rounded border border-gray-300 px-2 py-1"
                        onBlur={() => {
                          if (editingUser.role !== user.role) {
                            handleEditUser(user, { role: editingUser.role })
                          } else {
                            setEditingUser(null)
                          }
                        }}
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{user.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setEditingUser({ ...user })}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {isAdmin && user.id !== currentUser?.id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteCreated={loadData}
      />

      <JoinLinkModal
        isOpen={isJoinLinkModalOpen}
        onClose={() => setIsJoinLinkModalOpen(false)}
        onCreated={loadData}
      />

      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ isOpen: false, url: '' })}
        inviteUrl={qrModalData.url}
      />
    </div>
  )
}




