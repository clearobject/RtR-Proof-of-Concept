'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { MaintenanceTicket, Machine, Alert } from '@/lib/types'
import { formatDateTime, getStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, Filter, Calendar, CheckCircle, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<
    (MaintenanceTicket & {
      machine?: Machine | null
      assigned_user?: { email: string; role: string } | null
      alert?: Alert | null
    })[]
  >([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<{
    status?: string
    priority?: string
    search?: string
  }>({})

  const [newTicket, setNewTicket] = useState({
    machine_id: '',
    title: '',
    description: '',
    priority: 'medium' as const,
  })

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Build query with joins to avoid N+1 queries
      let ticketsQuery = supabase
        .from('maintenance_tickets')
        .select(`
          *,
          assets (*),
          alerts (*)
        `)
        .order('created_at', { ascending: false })

      if (filter.status) {
        ticketsQuery = ticketsQuery.eq('status', filter.status)
      }
      if (filter.priority) {
        ticketsQuery = ticketsQuery.eq('priority', filter.priority)
      }
      if (filter.search) {
        ticketsQuery = ticketsQuery.ilike('title', `%${filter.search}%`)
      }

      const [ticketsResult, assetsResult] = await Promise.all([
        ticketsQuery,
        supabase.from('assets').select('id, name').order('name'),
      ])

      if (ticketsResult.data) {
        // Collect all unique assigned_to user IDs
        const assignedUserIds = [
          ...new Set(
            ticketsResult.data
              .map((t: any) => t.assigned_to)
              .filter((id: string | null) => id !== null)
          ),
        ] as string[]

        // Batch fetch all user profiles in one query
        let userProfilesMap = new Map<string, { email: string; role: string }>()
        if (assignedUserIds.length > 0) {
          const { data: userProfiles } = await supabase
            .from('user_profiles')
            .select('id, email, role')
            .in('id', assignedUserIds)

          if (userProfiles) {
            userProfiles.forEach((profile) => {
              userProfilesMap.set(profile.id, {
                email: profile.email,
                role: profile.role,
              })
            })
          }
        }

        // Transform the data to match the expected structure
        const ticketsWithDetails = ticketsResult.data.map((ticket: any) => ({
          ...ticket,
          machine: ticket.assets || null,
          assigned_user: ticket.assigned_to
            ? userProfilesMap.get(ticket.assigned_to) || null
            : null,
          alert: ticket.alerts || null,
        }))
        setTickets(ticketsWithDetails)
      }
      if (assetsResult.data) {
        setMachines(assetsResult.data as Machine[])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in to create a ticket')
        return
      }

      const { data, error } = await supabase.from('maintenance_tickets').insert({
        asset_id: newTicket.machine_id, // Note: machine_id is actually asset_id in the form
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        status: 'Open',
        created_by: user.id,
      }).select()

      if (error) {
        console.error('Error creating ticket:', error)
        alert('Error creating ticket: ' + error.message)
        return
      }

      // Success - reset form and reload data
      setShowCreateForm(false)
      setNewTicket({
        machine_id: '',
        title: '',
        description: '',
        priority: 'medium',
      })
      await loadData()
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleUpdateStatus = async (
    ticketId: string,
    newStatus: MaintenanceTicket['status']
  ) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('maintenance_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)

      if (!error) {
        loadData()
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading tickets...</div>
        </div>
      </div>
    )
  }

  const stats = {
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In_progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
    total: tickets.length,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
            <p className="text-gray-600 mt-2">
              Manage maintenance tickets and work orders
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Open</h3>
            <p className="text-2xl font-bold text-red-600">{stats.open}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              In Progress
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Resolved</h3>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create Maintenance Ticket
            </h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <Label htmlFor="machine">Machine</Label>
                <select
                  id="machine"
                  value={newTicket.machine_id}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, machine_id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                  required
                >
                  <option value="">Select a machine</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTicket.title}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, title: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      priority: e.target.value as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Ticket</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={filter.search || ''}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value || undefined })
                  }
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={filter.status || ''}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value || undefined })
                }
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <Label>Priority</Label>
              <select
                value={filter.priority || ''}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    priority: e.target.value || undefined,
                  })
                }
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            {(filter.status || filter.priority || filter.search) && (
              <Button
                variant="secondary"
                onClick={() => setFilter({})}
                className="h-10"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Maintenance Tickets
            </h2>
            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {ticket.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span>
                            Created: {formatDateTime(ticket.created_at)}
                          </span>
                          {ticket.assigned_user && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Assigned to: {ticket.assigned_user.email} ({ticket.assigned_user.role})
                            </span>
                          )}
                      {ticket.alert && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="w-3 h-3" />
                          Alert severity: {ticket.alert.severity}
                          <Link
                            href="/dashboard/alerts"
                            className="text-blue-600 hover:underline"
                            title={ticket.alert.message}
                          >
                            View alert
                          </Link>
                        </span>
                      )}
                          {ticket.machine && (
                            <>
                              <Link
                                href={`/assets/${ticket.machine.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                View Machine
                              </Link>
                              {(ticket.machine.status === 'Offline' || ticket.machine.status === 'Critical' || ticket.machine.status === 'Maintenance') && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                  Out of Service
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {ticket.status === 'Open' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(ticket.id, 'In_progress')
                            }
                          >
                            Start Work
                          </Button>
                        )}
                        {ticket.status === 'In_progress' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(ticket.id, 'Resolved')
                            }
                          >
                            Mark Resolved
                          </Button>
                        )}
                        {ticket.status === 'Resolved' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleUpdateStatus(ticket.id, 'Closed')
                            }
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No maintenance tickets found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
