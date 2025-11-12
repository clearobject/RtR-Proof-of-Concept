'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import {
  Asset,
  AssetCost,
  DowntimeEvent,
  MaintenanceTicket,
  Facility,
  SensorData,
  Alert,
} from '@/lib/types'
import {
  formatDate,
  formatDateTime,
  getStatusColor,
} from '@/lib/utils'
import {
  calculateTCO,
  calculateReplacementPriority,
  calculateAssetAge,
  calculateMTBFMTTR,
  calculatePMMRatio,
} from '@/lib/utils/cam'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Wrench,
  DollarSign,
  Clock,
  TrendingUp,
  Calendar,
  Plus,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string

  const [asset, setAsset] = useState<Asset | null>(null)
  const [facility, setFacility] = useState<Facility | null>(null)
  const [costs, setCosts] = useState<AssetCost[]>([])
  const [downtimeEvents, setDowntimeEvents] = useState<DowntimeEvent[]>([])
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [pmTasks, setPmTasks] = useState<any[]>([])
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h')
  const [showCostForm, setShowCostForm] = useState(false)
  const [showDowntimeForm, setShowDowntimeForm] = useState(false)
  const [showPMForm, setShowPMForm] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [pmTemplates, setPmTemplates] = useState<any[]>([])

  const [newCost, setNewCost] = useState({
    type: 'parts' as const,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [newDowntime, setNewDowntime] = useState({
    start_time: new Date().toISOString().slice(0, 16),
    end_time: '',
    type: 'unplanned' as const,
    cause: '',
    impact: '',
  })

  const [newPMTask, setNewPMTask] = useState({
    template_id: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assigned_to: '',
  })

  useEffect(() => {
    if (assetId) {
      loadAssetData()
    }
  }, [assetId, timeRange])

  const loadAssetData = async () => {
    try {
      const supabase = createClient()

      // Try to find asset by ID first (UUID), then by alias if ID lookup fails
      // Check if assetId looks like a UUID
      const isUUID = assetId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      
      let assetResult
      if (isUUID) {
        // Try UUID lookup first
        assetResult = await supabase.from('assets').select('*').eq('id', assetId).maybeSingle()
      } else {
        // If not a UUID, try alias lookup directly
        assetResult = await supabase.from('assets').select('*').eq('alias', assetId).maybeSingle()
      }
      
      // If still not found and we tried UUID, try alias as fallback
      if (!assetResult.data && isUUID) {
        assetResult = await supabase.from('assets').select('*').eq('alias', assetId).maybeSingle()
      }

      const resolvedAssetId = assetResult.data?.id || assetId

      const [
        costsResult,
        downtimeResult,
        ticketsResult,
        pmTasksResult,
        pmTemplatesResult,
        sensorResult,
        alertsResult,
      ] = await Promise.all([
        supabase
          .from('asset_costs')
          .select('*')
          .eq('asset_id', resolvedAssetId)
          .order('date', { ascending: false }),
        supabase
          .from('downtime_events')
          .select('*')
          .eq('asset_id', resolvedAssetId)
          .order('start_time', { ascending: false }),
        supabase
          .from('maintenance_tickets')
          .select('*')
          .eq('asset_id', resolvedAssetId)
          .order('created_at', { ascending: false }),
        supabase
          .from('pm_tasks')
          .select('*')
          .eq('asset_id', resolvedAssetId)
          .order('scheduled_date', { ascending: false }),
        supabase.from('pm_templates').select('*').order('name'),
        supabase
          .from('sensor_data')
          .select('*')
          .eq('asset_id', resolvedAssetId)
          .order('timestamp', { ascending: false })
          .limit(timeRange === '24h' ? 24 : 168),
        supabase
          .from('alerts')
          .select('*')
          .eq('asset_id', resolvedAssetId)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      if (assetResult.data) {
        const assetData = assetResult.data as Asset
        setAsset(assetData)

        // Load facility
        if (assetData.facility_id) {
          const facilityResult = await supabase
            .from('facilities')
            .select('*')
            .eq('id', assetData.facility_id)
            .single()
          if (facilityResult.data) {
            setFacility(facilityResult.data as Facility)
          }
        }
      }
      if (costsResult.data) {
        setCosts(costsResult.data as AssetCost[])
      }
      if (downtimeResult.data) {
        setDowntimeEvents(downtimeResult.data as DowntimeEvent[])
      }
      if (ticketsResult.data) {
        setTickets(ticketsResult.data as MaintenanceTicket[])
      }
      if (pmTasksResult.data) {
        setPmTasks(pmTasksResult.data)
      }
      if (pmTemplatesResult.data) {
        setPmTemplates(pmTemplatesResult.data)
      }
      if (sensorResult.data) {
        setSensorData(sensorResult.data as SensorData[])
      }
      if (alertsResult.data) {
        setAlerts(alertsResult.data as Alert[])
      }
    } catch (error) {
      console.error('Error loading asset data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asset) return

    try {
      const supabase = createClient()

      const { error } = await supabase.from('asset_costs').insert({
        asset_id: asset.id,
        type: newCost.type,
        amount: parseFloat(newCost.amount),
        description: newCost.description,
        date: newCost.date,
      })

      if (!error) {
        setShowCostForm(false)
        setNewCost({
          type: 'parts',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        })
        loadAssetData()
      }
    } catch (error) {
      console.error('Error adding cost:', error)
    }
  }

  const handleAddDowntime = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asset) return

    try {
      const supabase = createClient()

      const startTime = new Date(newDowntime.start_time)
      const endTime = newDowntime.end_time
        ? new Date(newDowntime.end_time)
        : null

      const durationMinutes = endTime
        ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
        : null

      const { error } = await supabase.from('downtime_events').insert({
        asset_id: asset.id,
        start_time: newDowntime.start_time,
        end_time: endTime ? newDowntime.end_time : null,
        duration_minutes: durationMinutes,
        type: newDowntime.type,
        cause: newDowntime.cause,
        impact: newDowntime.impact,
      })

      if (!error) {
        setShowDowntimeForm(false)
        setNewDowntime({
          start_time: new Date().toISOString().slice(0, 16),
          end_time: '',
          type: 'unplanned',
          cause: '',
          impact: '',
        })
        loadAssetData()
      }
    } catch (error) {
      console.error('Error adding downtime:', error)
    }
  }

  const handleAddPMTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asset) return

    try {
      const supabase = createClient()

      const { error } = await supabase.from('pm_tasks').insert({
        asset_id: asset.id,
        template_id: newPMTask.template_id || null,
        scheduled_date: newPMTask.scheduled_date,
        notes: newPMTask.notes,
        status: 'scheduled',
      })

      if (!error) {
        setShowPMForm(false)
        setNewPMTask({
          template_id: '',
          scheduled_date: new Date().toISOString().split('T')[0],
          notes: '',
        })
        loadAssetData()
      }
    } catch (error) {
      console.error('Error adding PM task:', error)
    }
  }

  const handleCompletePMTask = async (taskId: string) => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase
        .from('pm_tasks')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
          completed_by: user.id,
        })
        .eq('id', taskId)

      if (!error) {
        loadAssetData()
      }
    } catch (error) {
      console.error('Error completing PM task:', error)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asset) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error('User not authenticated')
        alert('You must be logged in to create a ticket')
        return
      }

      const ticketData: any = {
        asset_id: asset.id,
        title: newTicket.title,
        description: newTicket.description,
        status: 'open',
        priority: newTicket.priority,
        created_by: user.id,
      }

      if (newTicket.assigned_to) {
        ticketData.assigned_to = newTicket.assigned_to
      }

      const { data, error } = await supabase.from('maintenance_tickets').insert(ticketData).select()

      if (error) {
        console.error('Error creating ticket:', error)
        alert('Error creating ticket: ' + error.message)
        return
      }

      // Success - reset form and reload data
      setShowTicketForm(false)
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
      })
      // Reload asset data to refresh tickets list
      await loadAssetData()
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error creating ticket: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading asset...</div>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Asset not found</div>
        </div>
      </div>
    )
  }

  const age = calculateAssetAge(asset.in_service_date, asset.expected_life_years)
  const tco = calculateTCO(asset, costs, downtimeEvents)
  const priority = calculateReplacementPriority(asset, costs, downtimeEvents, tickets)
  const mtbfMttr = calculateMTBFMTTR(downtimeEvents)
  const pmRatio = calculatePMMRatio(tickets, pmTasks.length)

  // Cost breakdown by type
  const costByType = costs.reduce((acc, cost) => {
    const type = cost.type
    acc[type] = (acc[type] || 0) + Number(cost.amount)
    return acc
  }, {} as Record<string, number>)

  const costChartData = Object.entries(costByType).map(([type, amount]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    amount: Math.round(amount),
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  // Prepare chart data for sensor metrics
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

  const latestSensorData = sensorData[0]

  // AI Maintenance Insights (placeholder - would be generated from trends)
  const aiInsights = [
    {
      id: 1,
      type: 'trend',
      message: 'Temperature readings show a 15% increase over the past week, indicating potential bearing wear.',
      priority: 'high',
    },
    {
      id: 2,
      type: 'similar',
      message: 'Similar machines (Washer-02, Washer-03) required bearing replacement after showing this pattern.',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'preventive',
      message: 'Schedule preventive maintenance within 30 days to avoid unplanned downtime.',
      priority: 'medium',
    },
    {
      id: 4,
      type: 'cost',
      message: 'Early intervention could save approximately $2,500 compared to reactive maintenance.',
      priority: 'low',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => router.push('/assets')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assets
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
            <p className="text-gray-600 mt-2">
              {asset.type} • {facility?.name || 'Unknown Facility'}
              {asset.zone && ` • ${asset.zone}`}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                asset.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : asset.status === 'Maintenance'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {asset.status}
            </span>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                asset.criticality === 'Critical'
                  ? 'bg-red-100 text-red-800'
                  : asset.criticality === 'High'
                  ? 'bg-orange-100 text-orange-800'
                  : asset.criticality === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {asset.criticality} criticality
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Age</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{age.years} years</p>
          {age.remainingYears !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              {age.remainingYears} years remaining
            </p>
          )}
          {asset.expected_life_years && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${age.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {age.percentage}% of expected life
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${tco.total.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${tco.maintenanceCost.toLocaleString()} maintenance
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Replacement Priority
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{priority.score}</p>
          <p className="text-xs text-gray-500 mt-1">Out of 100</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">MTTR</h3>
            <Wrench className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {mtbfMttr.mttr ? `${mtbfMttr.mttr}h` : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {mtbfMttr.failureCount} failures
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Asset Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Asset Information
          </h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {asset.manufacturer || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Model</dt>
              <dd className="mt-1 text-sm text-gray-900">{asset.model || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {asset.serial_number || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">In Service Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(asset.in_service_date)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Expected Life
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {asset.expected_life_years
                  ? `${asset.expected_life_years} years`
                  : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Facility</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {facility?.name || '-'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Replacement Priority Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Replacement Priority Factors
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Age Factor</span>
                <span className="font-medium">{priority.factors.age}/40</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(priority.factors.age / 40) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cost Factor</span>
                <span className="font-medium">{priority.factors.cost}/30</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${(priority.factors.cost / 30) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Downtime Factor</span>
                <span className="font-medium">{priority.factors.downtime}/20</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${(priority.factors.downtime / 20) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Criticality Factor</span>
                <span className="font-medium">{priority.factors.criticality}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(priority.factors.criticality / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Current Metrics (left) + Cost Breakdown (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Current Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Metrics</h2>
            <div className="flex gap-2">
              <Button
                variant={timeRange === '24h' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTimeRange('24h')}
              >
                24h
              </Button>
              <Button
                variant={timeRange === '7d' ? 'primary' : 'secondary'}
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

        {/* Cost Breakdown by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cost Breakdown by Type
          </h2>
          {costChartData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) =>
                      `${type} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {costChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">TCO Breakdown</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Purchase Cost</span>
                    <span className="font-medium">${tco.purchaseCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Maintenance Cost</span>
                    <span className="font-medium">
                      ${tco.maintenanceCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Downtime Cost</span>
                    <span className="font-medium">
                      ${tco.downtimeCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Energy Cost</span>
                    <span className="font-medium">${tco.energyCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                    <span className="text-gray-900">Total Cost of Ownership</span>
                    <span className="text-gray-900">${tco.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No cost data available</p>
          )}
        </div>
      </div>

      {/* Row 4: Alert History (left) + Downtime Events (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Alert History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Alerts
          </h2>
          {alerts.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : alert.severity === 'High'
                          ? 'bg-orange-100 text-orange-800'
                          : alert.severity === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
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
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No alerts</p>
          )}
        </div>

        {/* Downtime Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Downtime Events</h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowDowntimeForm(!showDowntimeForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Downtime
            </Button>
          </div>

          {showDowntimeForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-3">Log Downtime Event</h3>
              <form onSubmit={handleAddDowntime} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="downtime-type">Type</Label>
                    <select
                      id="downtime-type"
                      value={newDowntime.type}
                      onChange={(e) =>
                        setNewDowntime({
                          ...newDowntime,
                          type: e.target.value as any,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="planned">Planned</option>
                      <option value="unplanned">Unplanned</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="downtime-start">Start Time</Label>
                    <Input
                      id="downtime-start"
                      type="datetime-local"
                      value={newDowntime.start_time}
                      onChange={(e) =>
                        setNewDowntime({ ...newDowntime, start_time: e.target.value })
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="downtime-end">End Time (optional)</Label>
                    <Input
                      id="downtime-end"
                      type="datetime-local"
                      value={newDowntime.end_time}
                      onChange={(e) =>
                        setNewDowntime({ ...newDowntime, end_time: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="downtime-cause">Cause</Label>
                    <Input
                      id="downtime-cause"
                      value={newDowntime.cause}
                      onChange={(e) =>
                        setNewDowntime({ ...newDowntime, cause: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="downtime-impact">Impact</Label>
                    <Input
                      id="downtime-impact"
                      value={newDowntime.impact}
                      onChange={(e) =>
                        setNewDowntime({ ...newDowntime, impact: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    Log Downtime
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowDowntimeForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {downtimeEvents.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {downtimeEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            event.type === 'Planned'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {event.type}
                        </span>
                        {event.duration_minutes && (
                          <span className="text-sm text-gray-600">
                            {Math.round((event.duration_minutes / 60) * 10) / 10} hours
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">
                        {formatDateTime(event.start_time)}
                        {event.end_time && ` - ${formatDateTime(event.end_time)}`}
                      </p>
                      {event.cause && (
                        <p className="text-sm text-gray-600 mt-1">Cause: {event.cause}</p>
                      )}
                      {event.impact && (
                        <p className="text-sm text-gray-600 mt-1">Impact: {event.impact}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No downtime events</p>
          )}
        </div>
      </div>

      {/* Row 5: AI Insights (left) + Maintenance History (middle) + Preventative Maintenance (right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* AI Maintenance Insights */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Maintenance Insights</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      insight.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : insight.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {insight.type}
                  </span>
                </div>
                <p className="text-sm text-gray-900">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance History */}
        <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Maintenance History
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowTicketForm(!showTicketForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowCostForm(!showCostForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Cost
            </Button>
            <Link href="/maintenance">
              <Button size="sm" variant="secondary">
                <Wrench className="w-4 h-4 mr-2" />
                View Tickets
              </Button>
            </Link>
          </div>
        </div>

        {showTicketForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-900 mb-3">Create Maintenance Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3">
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
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ticket-priority">Priority</Label>
                  <select
                    id="ticket-priority"
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        priority: e.target.value as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="ticket-assigned">Assign To (optional)</Label>
                  <Input
                    id="ticket-assigned"
                    value={newTicket.assigned_to}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, assigned_to: e.target.value })
                    }
                    placeholder="User ID"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Create Ticket
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowTicketForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {showCostForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-900 mb-3">Add Cost Entry</h3>
            <form onSubmit={handleAddCost} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cost-type">Type</Label>
                  <select
                    id="cost-type"
                    value={newCost.type}
                    onChange={(e) =>
                      setNewCost({
                        ...newCost,
                        type: e.target.value as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="parts">Parts</option>
                    <option value="labor">Labor</option>
                    <option value="energy">Energy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="cost-amount">Amount ($)</Label>
                  <Input
                    id="cost-amount"
                    type="number"
                    step="0.01"
                    value={newCost.amount}
                    onChange={(e) =>
                      setNewCost({ ...newCost, amount: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="cost-description">Description</Label>
                  <Input
                    id="cost-description"
                    value={newCost.description}
                    onChange={(e) =>
                      setNewCost({ ...newCost, description: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cost-date">Date</Label>
                  <Input
                    id="cost-date"
                    type="date"
                    value={newCost.date}
                    onChange={(e) =>
                      setNewCost({ ...newCost, date: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Add Cost
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowCostForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {tickets.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(ticket.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No maintenance tickets</p>
        )}
        </div>

        {/* Preventive Maintenance */}
        <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Preventive Maintenance
          </h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowPMForm(!showPMForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule PM Task
          </Button>
        </div>

        {showPMForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-900 mb-3">Schedule PM Task</h3>
            <form onSubmit={handleAddPMTask} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pm-template">Template (optional)</Label>
                  <select
                    id="pm-template"
                    value={newPMTask.template_id}
                    onChange={(e) =>
                      setNewPMTask({ ...newPMTask, template_id: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {pmTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="pm-date">Scheduled Date</Label>
                  <Input
                    id="pm-date"
                    type="date"
                    value={newPMTask.scheduled_date}
                    onChange={(e) =>
                      setNewPMTask({ ...newPMTask, scheduled_date: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="pm-notes">Notes</Label>
                  <Input
                    id="pm-notes"
                    value={newPMTask.notes}
                    onChange={(e) =>
                      setNewPMTask({ ...newPMTask, notes: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Schedule Task
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowPMForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {pmTasks.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {pmTasks.map((task) => {
              const scheduledDate = new Date(task.scheduled_date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const isOverdue = scheduledDate < today && task.status === 'scheduled'

              return (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatDate(task.scheduled_date)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'overdue' || isOverdue
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : task.status}
                        </span>
                      </div>
                      {task.notes && (
                        <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                      )}
                      {task.completed_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Completed: {formatDate(task.completed_date)}
                        </p>
                      )}
                    </div>
                    {task.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompletePMTask(task.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No PM tasks scheduled</p>
        )}
        </div>
      </div>
    </div>
  )
}

