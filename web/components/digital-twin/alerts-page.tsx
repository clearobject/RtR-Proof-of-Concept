'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Alert, Machine } from '@/lib/types'
import { formatDateTime, getSeverityColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Check, X, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<(Alert & { machine: Machine | null })[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    severity?: string
    acknowledged?: string
    search?: string
  }>({})

  useEffect(() => {
    loadAlerts()
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
        const alertsWithMachines = data.map((alert: any) => ({
          ...alert,
          machine: alert.machines,
        }))
        setAlerts(alertsWithMachines)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
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

  const handleCreateTicket = async (alert: Alert) => {
    if (!alert.machine) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('maintenance_tickets').insert({
        machine_id: alert.machine.id,
        title: `Maintenance Request: ${alert.machine.name}`,
        description: alert.message,
        status: 'open',
        priority:
          alert.severity === 'critical'
            ? 'urgent'
            : alert.severity === 'high'
              ? 'high'
              : 'medium',
        created_by: user.id,
      })

      if (!error) {
        router.push('/maintenance')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
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
  }

  const filteredAlerts = filter.search
    ? alerts.filter(
        (alert) =>
          alert.message.toLowerCase().includes(filter.search!.toLowerCase()) ||
          alert.machine?.name.toLowerCase().includes(filter.search!.toLowerCase())
      )
    : alerts

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage machine alerts and notifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Critical</h3>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">High</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
        </div>
      </div>

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
          {(filter.severity || filter.acknowledged || filter.search) && (
            <Button
              variant="outline"
              onClick={() => setFilter({})}
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
                          {alert.machine && (
                            <Button
                              size="sm"
                              onClick={() => handleCreateTicket(alert)}
                            >
                              Create Ticket
                            </Button>
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
    </div>
  )
}

