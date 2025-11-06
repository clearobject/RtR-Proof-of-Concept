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
  const [loading, setLoading] = useState(true)
  const [showCostForm, setShowCostForm] = useState(false)
  const [showDowntimeForm, setShowDowntimeForm] = useState(false)
  const [showPMForm, setShowPMForm] = useState(false)
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

  useEffect(() => {
    if (assetId) {
      loadAssetData()
    }
  }, [assetId])

  const loadAssetData = async () => {
    try {
      const supabase = createClient()

      const [
        assetResult,
        costsResult,
        downtimeResult,
        ticketsResult,
        pmTasksResult,
        pmTemplatesResult,
      ] = await Promise.all([
        supabase.from('assets').select('*').eq('id', assetId).single(),
        supabase
          .from('asset_costs')
          .select('*')
          .eq('asset_id', assetId)
          .order('date', { ascending: false }),
        supabase
          .from('downtime_events')
          .select('*')
          .eq('asset_id', assetId)
          .order('start_time', { ascending: false }),
        supabase
          .from('maintenance_tickets')
          .select('*')
          .eq('asset_id', assetId)
          .order('created_at', { ascending: false }),
        supabase
          .from('pm_tasks')
          .select('*')
          .eq('asset_id', assetId)
          .order('scheduled_date', { ascending: false }),
        supabase.from('pm_templates').select('*').order('name'),
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button
          variant="outline"
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
                asset.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : asset.status === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {asset.status}
            </span>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                asset.criticality === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : asset.criticality === 'high'
                  ? 'bg-orange-100 text-orange-800'
                  : asset.criticality === 'medium'
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

      {/* Cost Breakdown Chart */}
      {costChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cost Breakdown by Type
          </h2>
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
        </div>
      )}

      {/* Maintenance History */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Maintenance History
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCostForm(!showCostForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Cost
            </Button>
            <Link href="/maintenance">
              <Button size="sm" variant="outline">
                <Wrench className="w-4 h-4 mr-2" />
                View Tickets
              </Button>
            </Link>
          </div>
        </div>

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
                  variant="outline"
                  onClick={() => setShowCostForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
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
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Preventive Maintenance
          </h2>
          <Button
            size="sm"
            variant="outline"
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
                  variant="outline"
                  onClick={() => setShowPMForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {pmTasks.length > 0 ? (
          <div className="space-y-3">
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

      {/* Downtime Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Downtime Events</h2>
          <Button
            size="sm"
            variant="outline"
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
                  variant="outline"
                  onClick={() => setShowDowntimeForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {downtimeEvents.length > 0 ? (
          <div className="space-y-3">
            {downtimeEvents.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.type === 'planned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {event.type}
                      </span>
                      {event.duration_minutes && (
                        <span className="text-sm text-gray-600">
                          {Math.round(event.duration_minutes / 60 * 10) / 10} hours
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(event.start_time)}
                      {event.end_time && ` - ${formatDateTime(event.end_time)}`}
                    </p>
                    {event.cause && (
                      <p className="text-sm text-gray-600 mt-1">
                        Cause: {event.cause}
                      </p>
                    )}
                    {event.impact && (
                      <p className="text-sm text-gray-600 mt-1">
                        Impact: {event.impact}
                      </p>
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
  )
}

