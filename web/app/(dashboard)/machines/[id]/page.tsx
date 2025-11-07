'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { Machine, SensorData, Alert, MaintenanceTicket } from '@/lib/types'
import { formatDateTime, getStatusColor, getSeverityColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const machineId = params.id as string

  const [machine, setMachine] = useState<Machine | null>(null)
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h')

  useEffect(() => {
    if (machineId) {
      loadMachineData()
    }
  }, [machineId, timeRange])

  const loadMachineData = async () => {
    try {
      const supabase = createClient()

      const [machineResult, sensorResult, alertsResult, ticketsResult] =
        await Promise.all([
          supabase.from('machines').select('*').eq('id', machineId).single(),
          supabase
            .from('sensor_data')
            .select('*')
            .eq('machine_id', machineId)
            .order('timestamp', { ascending: false })
            .limit(timeRange === '24h' ? 24 : 168),
          supabase
            .from('alerts')
            .select('*')
            .eq('machine_id', machineId)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('maintenance_tickets')
            .select('*')
            .eq('machine_id', machineId)
            .order('created_at', { ascending: false })
            .limit(10),
        ])

      if (machineResult.data) {
        setMachine(machineResult.data as Machine)
      }
      if (sensorResult.data) {
        setSensorData(sensorResult.data as SensorData[])
      }
      if (alertsResult.data) {
        setAlerts(alertsResult.data as Alert[])
      }
      if (ticketsResult.data) {
        setTickets(ticketsResult.data as MaintenanceTicket[])
      }
    } catch (error) {
      console.error('Error loading machine data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (alertId: string) => {
    if (!machine) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const alert = alerts.find((a) => a.id === alertId)
      if (!alert) return

      const { error } = await supabase.from('maintenance_tickets').insert({
        machine_id: machine.id,
        title: `Maintenance Request: ${machine.name}`,
        description: alert.message,
        status: 'open',
        priority: alert.severity === 'critical' ? 'urgent' : 'high',
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
          <div className="text-gray-500">Loading machine details...</div>
        </div>
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Machine not found</p>
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData = sensorData
    .slice()
    .reverse()
    .map((data) => ({
      time: new Date(data.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperature: data.temperature,
      vibration: data.vibration,
      power: data.power,
      humidity: data.humidity,
    }))

  const getStatusColorClass = (status: Machine['status']) => {
    const colors = {
      operational: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500',
      maintenance: 'bg-blue-500',
      offline: 'bg-gray-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  const latestSensorData = sensorData[0]

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="secondary" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{machine.name}</h1>
            <p className="text-gray-600 mt-1">
              {machine.zone} • {machine.type.replace('_', ' ')}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg text-white font-medium ${getStatusColorClass(
              machine.status
            )}`}
          >
            {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Metrics */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Current Metrics
            </h2>
            <div className="flex gap-2">
              <Button
                variant={timeRange === '24h' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('24h')}
              >
                24h
              </Button>
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('7d')}
              >
                7d
              </Button>
            </div>
          </div>

          {latestSensorData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {latestSensorData.temperature !== null &&
                latestSensorData.temperature !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Temperature</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {latestSensorData.temperature.toFixed(1)}°C
                    </div>
                  </div>
                )}
              {latestSensorData.vibration !== null &&
                latestSensorData.vibration !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Vibration</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {latestSensorData.vibration.toFixed(2)}
                    </div>
                  </div>
                )}
              {latestSensorData.power !== null &&
                latestSensorData.power !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Power</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {latestSensorData.power.toFixed(1)} kW
                    </div>
                  </div>
                )}
              {latestSensorData.humidity !== null &&
                latestSensorData.humidity !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Humidity</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {latestSensorData.humidity.toFixed(1)}%
                    </div>
                  </div>
                )}
            </div>
          )}

          {chartData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {latestSensorData?.temperature !== null &&
                    latestSensorData?.temperature !== undefined && (
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#ef4444"
                        name="Temperature (°C)"
                      />
                    )}
                  {latestSensorData?.vibration !== null &&
                    latestSensorData?.vibration !== undefined && (
                      <Line
                        type="monotone"
                        dataKey="vibration"
                        stroke="#3b82f6"
                        name="Vibration"
                      />
                    )}
                  {latestSensorData?.power !== null &&
                    latestSensorData?.power !== undefined && (
                      <Line
                        type="monotone"
                        dataKey="power"
                        stroke="#10b981"
                        name="Power (kW)"
                      />
                    )}
                  {latestSensorData?.humidity !== null &&
                    latestSensorData?.humidity !== undefined && (
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#f59e0b"
                        name="Humidity (%)"
                      />
                    )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Machine Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Machine Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
              <dd className="text-sm text-gray-900">
                {machine.manufacturer || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Model</dt>
              <dd className="text-sm text-gray-900">{machine.model || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
              <dd className="text-sm text-gray-900">
                {machine.serial_number || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Zone</dt>
              <dd className="text-sm text-gray-900">{machine.zone}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="text-sm text-gray-900">
                {machine.type.replace('_', ' ')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Alerts
          </h2>
        </div>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="border border-gray-200 rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
                  </div>
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(alert.created_at)}
                  </p>
                </div>
                {!alert.acknowledged && (
                  <Button
                    size="sm"
                    onClick={() => handleCreateTicket(alert.id)}
                    className="ml-4"
                  >
                    <Wrench className="w-4 h-4 mr-1" />
                    Create Ticket
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No alerts</p>
        )}
      </div>

      {/* Maintenance History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Maintenance History
        </h2>
        {tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(ticket.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No maintenance tickets</p>
        )}
      </div>
    </div>
  )
}

