'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Machine, Alert } from '@/lib/types'
import { FactoryLayout } from './factory-layout'
import { Button } from '@/components/ui/button'
import { Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function FactoryDashboard() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    type?: string
    status?: string
    zone?: string
    search?: string
  }>({})
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Build query
      let machinesQuery = supabase
        .from('machines')
        .select('*')
        .order('name')

      // Apply filters
      if (filter.type) {
        machinesQuery = machinesQuery.eq('type', filter.type)
      }
      if (filter.status) {
        machinesQuery = machinesQuery.eq('status', filter.status)
      }
      if (filter.zone) {
        machinesQuery = machinesQuery.eq('zone', filter.zone)
      }
      if (filter.search) {
        machinesQuery = machinesQuery.ilike('name', `%${filter.search}%`)
      }

      const [machinesResult, alertsResult] = await Promise.all([
        machinesQuery,
        supabase
          .from('alerts')
          .select('*')
          .eq('acknowledged', false)
          .order('created_at', { ascending: false }),
      ])

      if (machinesResult.data) {
        setMachines(machinesResult.data as Machine[])
      }
      if (alertsResult.data) {
        setAlerts(alertsResult.data as Alert[])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const machineTypes = ['washer', 'dryer', 'dry_cleaner']
  const statuses: Machine['status'][] = [
    'operational',
    'warning',
    'critical',
    'maintenance',
    'offline',
  ]
  const zones = [
    'Inbound',
    'Tagging',
    'Wet Cleaning',
    'Dry Clean & Spotting',
    'QC',
    'Pressing',
    'Bagging',
  ]

  const stats = {
    total: machines.length,
    operational: machines.filter((m) => m.status === 'operational').length,
    warning: machines.filter((m) => m.status === 'warning').length,
    critical: machines.filter((m) => m.status === 'critical').length,
    alerts: alerts.length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading factory layout...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Total</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Operational</h3>
          <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Warning</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Critical</h3>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Active Alerts</h3>
          <p className="text-2xl font-bold text-red-600">{stats.alerts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search machines..."
                value={filter.search || ''}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value || undefined })
                }
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filter.type || ''}
              onChange={(e) =>
                setFilter({ ...filter, type: e.target.value || undefined })
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="" className="text-gray-600">All Types</option>
              {machineTypes.map((type) => (
                <option key={type} value={type} className="text-gray-900">
                  {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.status || ''}
              onChange={(e) =>
                setFilter({ ...filter, status: e.target.value || undefined })
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="" className="text-gray-600">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status} className="text-gray-900">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone
            </label>
            <select
              value={filter.zone || ''}
              onChange={(e) =>
                setFilter({ ...filter, zone: e.target.value || undefined })
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
            >
              <option value="" className="text-gray-600">All Zones</option>
              {zones.map((zone) => (
                <option key={zone} value={zone} className="text-gray-900">
                  {zone}
                </option>
              ))}
            </select>
          </div>
          {(filter.type || filter.status || filter.zone || filter.search) && (
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

      {/* Factory Layout */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Factory Layout - New Jersey Facility
        </h2>
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
          <FactoryLayout
            machines={machines}
            onMachineClick={(machine) => {
              setSelectedMachine(machine)
            }}
          />
        </div>
      </div>
    </div>
  )
}

