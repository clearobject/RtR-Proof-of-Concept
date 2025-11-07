'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TrendingUp, TrendingDown, MessageSquare, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BrandHealthStats {
  overallNPS: number
  totalPosts: number
  byPlatform: Record<string, { count: number; avgNPS: number }>
  byCategory: Record<string, { count: number; avgNPS: number }>
  sentimentDistribution: {
    promoters: number
    passives: number
    detractors: number
  }
  trendData: Array<{
    date: string
    avgNPS: number
    count: number
  }>
}

export function BrandHealthDashboard() {
  const [stats, setStats] = useState<BrandHealthStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/social/stats?days=30')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div>No data available</div>
  }

  // Prepare data for charts
  const platformData = Object.entries(stats.byPlatform).map(([platform, data]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    nps: Math.round(data.avgNPS * 10) / 10,
    posts: data.count,
  }))

  const categoryData = Object.entries(stats.byCategory).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
    nps: Math.round(data.avgNPS * 10) / 10,
    posts: data.count,
  }))

  const sentimentPieData = [
    { name: 'Promoters', value: stats.sentimentDistribution.promoters, color: '#10b981' },
    { name: 'Passives', value: stats.sentimentDistribution.passives, color: '#f59e0b' },
    { name: 'Detractors', value: stats.sentimentDistribution.detractors, color: '#ef4444' },
  ]

  const npsChange = stats.trendData.length >= 2
    ? stats.trendData[stats.trendData.length - 1].avgNPS - stats.trendData[0].avgNPS
    : 0

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall NPS</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.overallNPS.toFixed(1)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {npsChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs ${npsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {npsChange >= 0 ? '+' : ''}{npsChange.toFixed(1)} vs last period
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalPosts.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Promoters</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.sentimentDistribution.promoters}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.totalPosts > 0
                    ? Math.round((stats.sentimentDistribution.promoters / stats.totalPosts) * 100)
                    : 0}% of total
                </p>
              </div>
              <Badge variant="success" className="text-lg px-3 py-1">
                {stats.totalPosts > 0
                  ? Math.round((stats.sentimentDistribution.promoters / stats.totalPosts) * 100)
                  : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Detractors</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.sentimentDistribution.detractors}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.totalPosts > 0
                    ? Math.round((stats.sentimentDistribution.detractors / stats.totalPosts) * 100)
                    : 0}% of total
                </p>
              </div>
              <Badge variant="danger" className="text-lg px-3 py-1">
                {stats.totalPosts > 0
                  ? Math.round((stats.sentimentDistribution.detractors / stats.totalPosts) * 100)
                  : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Trend */}
        <Card>
          <CardHeader>
            <CardTitle>NPS Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgNPS" stroke="#3b82f6" strokeWidth={2} name="Average NPS" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NPS by Platform */}
        <Card>
          <CardHeader>
            <CardTitle>NPS by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="nps" fill="#3b82f6" name="Average NPS" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NPS by Category */}
        <Card>
          <CardHeader>
            <CardTitle>NPS by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="nps" fill="#8b5cf6" name="Average NPS" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

