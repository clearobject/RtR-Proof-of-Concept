'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Alert, Machine, UserProfile, MaintenanceTicket } from '@/lib/types'
import { formatDateTime, getSeverityColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Check, X, Search, Wrench, Users, TrendingDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<(Alert & { machine: Machine | null; ticket?: MaintenanceTicket | null })[]>(
    []
  )
  const [technicians, setTechnicians] = useState<UserProfile[]>([])
  const [machinesOutOfService, setMachinesOutOfService] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert & { machine: Machine | null } | null>(null)
  const [drillDownSeverity, setDrillDownSeverity] = useState<string | null>(null)
  const [filter, setFilter] = useState<{
    severity?: string
    acknowledged?: string
    search?: string
    outOfService?: boolean
  }>({})

  const [newTicket, setNewTicket] = useState<{
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assigned_to: string
    production_impact: boolean
  }>({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    production_impact: false,
  })

  useEffect(() => {
    loadAlerts()
    loadTechnicians()
    loadMachinesOutOfService()
  }, [filter])

  const loadAlerts = async () => {
    try {
      const supabase = createClient()

      let alertsQuery = supabase
        .from('alerts')
        .select('*, machines(*)')
        .order('created_at', { ascending: false })

      if (filter.severity) {
        alertsQuery = alertsQuery.eq('severity', filter.severity)
      }
      if (filter.acknowledged !== undefined) {
        alertsQuery = alertsQuery.eq(
          'acknowledged',
          filter.acknowledged === 'true'
        )
      }

      const { data, error } = await alertsQuery

      if (data) {
        // Load tickets for each alert to check if ticket exists
        const alertsWithMachines = await Promise.all(
          data.map(async (alert: any) => {
            // Check if there's an open ticket for this alert's machine
            const { data: ticketData } = await supabase
              .from('maintenance_tickets')
              .select('*')
              .eq('machine_id', alert.machine_id)
              .in('status', ['open', 'in_progress'])
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            return {
              ...alert,
              machine: alert.machines,
              ticket: ticketData || null,
            }
          })
        )
        setAlerts(alertsWithMachines)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTechnicians = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['maintenance', 'manager', 'admin'])
        .order('email')

      if (data) {
        setTechnicians(data as UserProfile[])
      }
    } catch (error) {
      console.error('Error loading technicians:', error)
    }
  }

  const loadMachinesOutOfService = async () => {
    try {
      const supabase = createClient()
      // Get machines that are offline, critical, or maintenance status
      // AND have open/in_progress tickets
      const { data: machinesData } = await supabase
        .from('machines')
        .select('*, maintenance_tickets!inner(*)')
        .in('status', ['offline', 'critical', 'maintenance'])
        .in('maintenance_tickets.status', ['open', 'in_progress'])

      if (machinesData) {
        // Deduplicate machines
        const uniqueMachines = machinesData.reduce((acc: Machine[], machine: any) => {
          if (!acc.find((m) => m.id === machine.id)) {
            acc.push(machine as Machine)
          }
          return acc
        }, [])
        setMachinesOutOfService(uniqueMachines)
      }
    } catch (error) {
      console.error('Error loading machines out of service:', error)
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('alerts')
        .update({
          acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId)

      if (!error) {
        loadAlerts()
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const handleOpenTicketForm = (alert: Alert & { machine: Machine | null }) => {
    setSelectedAlert(alert)
    setNewTicket({
      title: `Maintenance Request: ${alert.machine?.name || 'Unknown Machine'}`,
      description: alert.message,
      priority:
        alert.severity === 'critical'
          ? 'urgent'
          : alert.severity === 'high'
            ? 'high'
            : 'medium',
      assigned_to: '',
      production_impact: alert.machine?.status === 'offline' || alert.machine?.status === 'critical' || false,
    })
    setShowTicketForm(true)
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlert?.machine) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const ticketData: any = {
        machine_id: selectedAlert.machine.id,
        title: newTicket.title,
        description: newTicket.description,
        status: 'open',
        priority: newTicket.priority,
        created_by: user.id,
      }

      if (newTicket.assigned_to) {
        ticketData.assigned_to = newTicket.assigned_to
      }

      const { error } = await supabase.from('maintenance_tickets').insert(ticketData)

      if (!error) {
        // If production impact, update machine status
        if (newTicket.production_impact && selectedAlert.machine) {
          await supabase
            .from('machines')
            .update({ status: 'maintenance' })
            .eq('id', selectedAlert.machine.id)
        }

        // Acknowledge the alert
        await supabase
          .from('alerts')
          .update({
            acknowledged: true,
            acknowledged_by: user.id,
            acknowledged_at: new Date().toISOString(),
          })
          .eq('id', selectedAlert.id)

        setShowTicketForm(false)
        setSelectedAlert(null)
        loadAlerts()
        loadMachinesOutOfService()
        
        // Optionally navigate to maintenance page
        // router.push('/maintenance')
      } else {
        console.error('Error creating ticket:', error)
        alert('Error creating ticket: ' + error.message)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading alerts...</div>
        </div>
      </div>
    )
  }

  const stats = {
    total: alerts.length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    outOfService: machinesOutOfService.length,
  }

  let filteredAlerts = filter.search
    ? alerts.filter(
        (alert) =>
          alert.message.toLowerCase().includes(filter.search!.toLowerCase()) ||
          alert.machine?.name.toLowerCase().includes(filter.search!.toLowerCase())
      )
    : alerts

  // Filter by drill-down severity
  if (drillDownSeverity) {
    filteredAlerts = filteredAlerts.filter((a) => a.severity === drillDownSeverity)
  }

  // Filter by out of service
  if (filter.outOfService) {
    filteredAlerts = filteredAlerts.filter(
      (alert) =>
        alert.machine &&
        (alert.machine.status === 'offline' ||
          alert.machine.status === 'critical' ||
          alert.machine.status === 'maintenance')
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage machine alerts and notifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Unacknowledged
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {stats.unacknowledged}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50" onClick={() => setDrillDownSeverity(drillDownSeverity === 'critical' ? null : 'critical')}>
          <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
            Critical
            {drillDownSeverity === 'critical' && <ChevronRight className="w-4 h-4" />}
          </h3>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50" onClick={() => setDrillDownSeverity(drillDownSeverity === 'high' ? null : 'high')}>
          <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
            High
            {drillDownSeverity === 'high' && <ChevronRight className="w-4 h-4" />}
          </h3>
          <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-2 border-red-300">
          <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            Out of Service
          </h3>
          <p className="text-2xl font-bold text-red-600">{stats.outOfService}</p>
          <p className="text-xs text-gray-500 mt-1">Impacting Production</p>
        </div>
      </div>

      {/* Machines Out of Service */}
      {machinesOutOfService.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Machines Out of Service - Impacting Production
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {machinesOutOfService.map((machine) => {
              const machineAlerts = alerts.filter(
                (a) => a.machine_id === machine.id && !a.acknowledged
              )
              return (
                <div
                  key={machine.id}
                  className="bg-white rounded-lg p-3 border border-red-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/machines/${machine.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {machine.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {machine.zone} • {machine.type}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {machineAlerts.length} active alert{machineAlerts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                      {machine.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
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
                placeholder="Search alerts..."
                value={filter.search || ''}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value || undefined })
                }
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label>Severity</Label>
            <select
              value={filter.severity || ''}
              onChange={(e) =>
                setFilter({ ...filter, severity: e.target.value || undefined })
              }
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={filter.acknowledged || ''}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  acknowledged: e.target.value || undefined,
                })
              }
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="false">Unacknowledged</option>
              <option value="true">Acknowledged</option>
            </select>
          </div>
          <div>
            <Label>
              <input
                type="checkbox"
                checked={filter.outOfService || false}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    outOfService: e.target.checked || undefined,
                  })
                }
                className="mr-2"
              />
              Out of Service Only
            </Label>
          </div>
          {(filter.severity || filter.acknowledged || filter.search || filter.outOfService || drillDownSeverity) && (
            <Button
              variant="outline"
              onClick={() => {
                setFilter({})
                setDrillDownSeverity(null)
              }}
              className="h-10"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Active Alerts
          </h2>
          {filteredAlerts.length > 0 ? (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.severity === 'critical'
                      ? 'border-red-300 bg-red-50'
                      : alert.severity === 'high'
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            alert.severity === 'critical'
                              ? 'text-red-600'
                              : alert.severity === 'high'
                                ? 'text-orange-600'
                                : 'text-yellow-600'
                          }`}
                        />
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                            alert.severity
                          )}`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        {!alert.acknowledged && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            Unacknowledged
                          </span>
                        )}
                        {alert.machine && (
                          <Link
                            href={`/machines/${alert.machine.id}`}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            {alert.machine.name}
                          </Link>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 mb-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(alert.created_at)}
                        {alert.acknowledged_at &&
                          ` • Acknowledged ${formatDateTime(alert.acknowledged_at)}`}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {!alert.acknowledged && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Acknowledge
                          </Button>
                          {alert.machine && !alert.ticket && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenTicketForm(alert)}
                            >
                              <Wrench className="w-4 h-4 mr-1" />
                              Create Ticket
                            </Button>
                          )}
                          {alert.ticket && (
                            <Link href="/maintenance">
                              <Button size="sm" variant="outline">
                                View Ticket
                              </Button>
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No alerts found</p>
          )}
        </div>
      </div>

      {/* Ticket Creation Modal */}
      {showTicketForm && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Maintenance Ticket
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTicketForm(false)
                    setSelectedAlert(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Alert Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      selectedAlert.severity === 'critical'
                        ? 'text-red-600'
                        : selectedAlert.severity === 'high'
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                    }`}
                  />
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                      selectedAlert.severity
                    )}`}
                  >
                    {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-900 font-medium mb-1">
                  {selectedAlert.machine?.name}
                </p>
                <p className="text-sm text-gray-600">{selectedAlert.message}</p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <Label htmlFor="ticket-title">Title *</Label>
                  <Input
                    id="ticket-title"
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ticket-description">Description *</Label>
                  <textarea
                    id="ticket-description"
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, description: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticket-priority">Priority *</Label>
                    <select
                      id="ticket-priority"
                      value={newTicket.priority}
                      onChange={(e) =>
                        setNewTicket({
                          ...newTicket,
                          priority: e.target.value as any,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="ticket-assignee">Assign to Technician</Label>
                    <select
                      id="ticket-assignee"
                      value={newTicket.assigned_to}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, assigned_to: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.email} ({tech.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="production-impact"
                    checked={newTicket.production_impact}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        production_impact: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="production-impact" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="font-medium">Machine Out of Service - Impacting Production</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Checking this will mark the machine as "maintenance" status
                    </p>
                  </Label>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button type="submit" className="flex-1">
                    <Wrench className="w-4 h-4 mr-2" />
                    Create Ticket
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowTicketForm(false)
                      setSelectedAlert(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

