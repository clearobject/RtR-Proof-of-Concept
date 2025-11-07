'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InviteModal } from '@/components/user-management/invite-modal'
import { QRCodeModal } from '@/components/user-management/qr-code-modal'
import { UserPlus, QrCode, Edit, Trash2, Copy, Check } from 'lucide-react'
import type { InviteToken, UserProfile } from '@/lib/types'

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [invites, setInvites] = useState<InviteToken[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; url: string }>({
    isOpen: false,
    url: '',
  })
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Load users
      const usersRes = await fetch('/api/users')
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      // Load invites
      const invitesRes = await fetch('/api/invites')
      if (invitesRes.ok) {
        const invitesData = await invitesRes.json()
        setInvites(invitesData.invites || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
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
      console.error('Failed to copy:', err)
    }
  }

  const handleShowQR = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    setQrModalData({ isOpen: true, url: inviteUrl })
  }

  const handleDeleteInvite = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invite?')) return

    try {
      // Note: You may want to add a DELETE endpoint for invites
      // For now, we'll just reload
      await loadData()
    } catch (error) {
      console.error('Failed to delete invite:', error)
    }
  }

  const handleEditUser = async (user: UserProfile, updates: Partial<UserProfile>) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
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

  const isAdmin = currentUser && users.find(u => u.id === currentUser.id)?.role === 'admin'

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users and invite new team members</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Create Invite
        </Button>
      </div>

      {/* Active Invites Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Invites</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invites.filter(inv => new Date(inv.expires_at) > new Date() && inv.current_uses < inv.max_uses).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No active invites
                  </td>
                </tr>
              ) : (
                invites
                  .filter(inv => new Date(inv.expires_at) > new Date() && inv.current_uses < inv.max_uses)
                  .map((invite) => (
                    <tr key={invite.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invite.email || 'Any email'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invite.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invite.current_uses} / {invite.max_uses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopyInviteLink(invite.token)}
                          >
                            {copiedInviteId === invite.token ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleShowQR(invite.token)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-gray-500">(You)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingUser?.id === user.id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, role: e.target.value as any })
                        }
                        className="border border-gray-300 rounded px-2 py-1"
                        onBlur={() => {
                          if (editingUser.role !== user.role) {
                            handleEditUser(user, { role: editingUser.role })
                          }
                        }}
                      >
                        <option value="operator">Operator</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingUser({ ...user })}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {isAdmin && user.id !== currentUser?.id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteCreated={loadData}
      />

      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ isOpen: false, url: '' })}
        inviteUrl={qrModalData.url}
      />
    </div>
  )
}

