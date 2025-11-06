'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Asset, AssetCost, DowntimeEvent, MaintenanceTicket } from '@/lib/types'
import { formatDate, calculateAge } from '@/lib/utils'
import {
  calculateReplacementPriority,
  calculateAssetAge,
  calculateTCO,
} from '@/lib/utils/cam'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface AssetWithPriority extends Asset {
  priorityScore: number
  priorityFactors: {
    age: number
    cost: number
    downtime: number
    criticality: number
  }
  tco: number
  age: {
    years: number
    percentage: number
    remainingYears?: number
  }
}

export default function CapexPage() {
  const [assets, setAssets] = useState<AssetWithPriority[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'priority' | 'tco' | 'age'>('priority')
  const [filterCriticality, setFilterCriticality] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Load all assets
      const assetsResult = await supabase
        .from('assets')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (!assetsResult.data) return

      // Load related data for each asset
      const assetsWithPriority: AssetWithPriority[] = await Promise.all(
        assetsResult.data.map(async (asset) => {
          const [costsResult, downtimeResult, ticketsResult] = await Promise.all([
            supabase
              .from('asset_costs')
              .select('*')
              .eq('asset_id', asset.id),
            supabase
              .from('downtime_events')
              .select('*')
              .eq('asset_id', asset.id),
            supabase
              .from('maintenance_tickets')
              .select('*')
              .eq('asset_id', asset.id),
          ])

          const costs = (costsResult.data || []) as AssetCost[]
          const downtimeEvents = (downtimeResult.data || []) as DowntimeEvent[]
          const tickets = (ticketsResult.data || []) as MaintenanceTicket[]

          const priority = calculateReplacementPriority(
            asset as Asset,
            costs,
            downtimeEvents,
            tickets
          )
          const tco = calculateTCO(asset as Asset, costs, downtimeEvents)
          const age = calculateAssetAge(
            asset.in_service_date,
            asset.expected_life_years
          )

          return {
            ...(asset as Asset),
            priorityScore: priority.score,
            priorityFactors: priority.factors,
            tco: tco.total,
            age,
          }
        })
      )

      // Sort by priority score (highest first)
      assetsWithPriority.sort((a, b) => b.priorityScore - a.priorityScore)

      setAssets(assetsWithPriority)
    } catch (error) {
      console.error('Error loading capex data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const csvData = assets
      .filter((a) => !filterCriticality || a.criticality === filterCriticality)
      .map((asset) => ({
        Name: asset.name,
        Type: asset.type,
        Priority: asset.priorityScore,
        'TCO ($)': asset.tco,
        Age: asset.age.years,
        'Remaining Life': asset.age.remainingYears || 'N/A',
        Criticality: asset.criticality,
        Status: asset.status,
      }))

    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `capex-planning-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading capex data...</div>
        </div>
      </div>
    )
  }

  const filteredAssets = filterCriticality
    ? assets.filter((a) => a.criticality === filterCriticality)
    : assets

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === 'priority') return b.priorityScore - a.priorityScore
    if (sortBy === 'tco') return b.tco - a.tco
    return b.age.years - a.age.years
  })

  // Top 10 for replacement
  const topReplacements = sortedAssets.slice(0, 10)

  // Chart data
  const priorityChartData = topReplacements.map((asset) => ({
    name: asset.name.length > 15 ? asset.name.substring(0, 15) + '...' : asset.name,
    priority: asset.priorityScore,
    tco: Math.round(asset.tco / 1000), // In thousands
  }))

  // Timeline data (next 5 years)
  const timelineData = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() + i
    const assetsInYear = sortedAssets.filter((asset) => {
      if (!asset.age.remainingYears) return false
      const replacementYear =
        new Date(asset.in_service_date).getFullYear() +
        (asset.expected_life_years || 0)
      return replacementYear === year
    })
    return {
      year: year.toString(),
      count: assetsInYear.length,
      estimatedCost: assetsInYear.reduce((sum, a) => sum + a.tco, 0),
    }
  })

  const totalEstimatedCost = sortedAssets.reduce((sum, a) => sum + a.tco, 0)
  const highPriorityCount = sortedAssets.filter((a) => a.priorityScore >= 70).length
  const nearEOLCount = sortedAssets.filter(
    (a) => a.age.percentage >= 80
  ).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Capex Planning</h1>
            <p className="text-gray-600 mt-2">
              Replacement roadmap and capital expenditure planning
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                High Priority Assets
              </h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
            <p className="text-xs text-gray-500 mt-1">Score ≥ 70</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                Near End of Life
              </h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{nearEOLCount}</p>
            <p className="text-xs text-gray-500 mt-1">≥ 80% of expected life</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                Total Estimated Cost
              </h3>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(totalEstimatedCost / 1000)}k
            </p>
            <p className="text-xs text-gray-500 mt-1">All active assets</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{sortedAssets.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active assets</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top 10 Replacement Priorities
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="priority" fill="#ef4444" name="Priority Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              5-Year Replacement Timeline
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'estimatedCost') {
                      return `$${Math.round(value / 1000)}k`
                    }
                    return value
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  fill="#3b82f6"
                  name="Asset Count"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="estimatedCost"
                  stroke="#ef4444"
                  name="Estimated Cost ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'priority' | 'tco' | 'age')
                }
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="priority">Priority Score</option>
                <option value="tco">Total Cost</option>
                <option value="age">Age</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Criticality
              </label>
              <select
                value={filterCriticality}
                onChange={(e) => setFilterCriticality(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            {filterCriticality && (
              <Button
                variant="outline"
                onClick={() => setFilterCriticality('')}
                className="h-10"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>

        {/* Replacement Priority List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Replacement Priority Ranking
            </h2>
            {sortedAssets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TCO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criticality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAssets.map((asset, index) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {asset.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  asset.priorityScore >= 70
                                    ? 'bg-red-600'
                                    : asset.priorityScore >= 50
                                    ? 'bg-orange-600'
                                    : 'bg-yellow-600'
                                }`}
                                style={{ width: `${asset.priorityScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {asset.priorityScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${Math.round(asset.tco).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {asset.age.years} years
                          </div>
                          {asset.age.remainingYears !== undefined && (
                            <div className="text-xs text-gray-500">
                              {asset.age.remainingYears} remaining
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              asset.criticality === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : asset.criticality === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : asset.criticality === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {asset.criticality}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/assets/${asset.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No assets found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
