'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Alert, Machine, UserProfile, MaintenanceTicket } from '@/lib/types'
import { formatDateTime, getSeverityColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Check, X, Search, Wrench, Users, TrendingDown, ChevronRight, TrendingUp, Activity, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<(Alert & { machine: Machine | null; asset?: any; ticket?: MaintenanceTicket | null })[]>(
    []
  )
  const [allAlerts, setAllAlerts] = useState<(Alert & { machine: Machine | null; asset?: any; ticket?: MaintenanceTicket | null })[]>(
    []
  )
  const [technicians, setTechnicians] = useState<UserProfile[]>([])
  const [machinesOutOfService, setMachinesOutOfService] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert & { machine: Machine | null; asset?: any } | null>(null)
  const [drillDownSeverity, setDrillDownSeverity] = useState<string | null>(null)
  const [timeWindow, setTimeWindow] = useState<30 | 60 | 90>(30)
  const [filter, setFilter] = useState<{
    severity?: string
    acknowledged?: string
    search?: string
    outOfService?: boolean
  }>({})

  const [newTicket, setNewTicket] = useState<{
    title: string
    description: string
    priority: 'Low' | 'Medium' | 'High' | 'Urgent'
    assigned_to: string
    production_impact: boolean
  }>({
    title: '',
    description: '',
    priority: 'Medium',
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

      // Load all alerts for stats (unfiltered)
      const { data: allAlertsData } = await supabase
        .from('alerts')
        .select('*, assets(*)')
        .order('created_at', { ascending: false })

      if (allAlertsData) {
        const allAlertsWithMachines = await Promise.all(
          allAlertsData.map(async (alert: any) => {
            let ticketData: MaintenanceTicket | null = null

            const { data: ticketFromAlert } = await supabase
              .from('maintenance_tickets')
              .select('*')
              .eq('alert_id', alert.id)
              .in('status', ['Open', 'In_progress'])
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (ticketFromAlert) {
              ticketData = ticketFromAlert as MaintenanceTicket
            } else {
              const assetId = (alert as any).asset_id
              const { data: ticketFromMachine } = await supabase
                .from('maintenance_tickets')
                .select('*')
                .eq('asset_id', assetId)
                .in('status', ['Open', 'In_progress'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

              if (ticketFromMachine) {
                ticketData = ticketFromMachine as MaintenanceTicket
              }
            }

            return {
              ...alert,
              machine: alert.assets || null,
              asset: alert.assets || null,
              ticket: ticketData,
            }
          })
        )
        setAllAlerts(allAlertsWithMachines)
      }

      // Load filtered alerts for display
      let alertsQuery = supabase
        .from('alerts')
        .select('*, assets(*)')
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
            let ticketData: MaintenanceTicket | null = null

            const { data: ticketFromAlert } = await supabase
              .from('maintenance_tickets')
              .select('*')
              .eq('alert_id', alert.id)
              .in('status', ['Open', 'In_progress'])
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (ticketFromAlert) {
              ticketData = ticketFromAlert as MaintenanceTicket
            } else {
              const assetId = (alert as any).asset_id
              const { data: ticketFromMachine } = await supabase
                .from('maintenance_tickets')
                .select('*')
                .eq('asset_id', assetId)
                .in('status', ['Open', 'In_progress'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

              if (ticketFromMachine) {
                ticketData = ticketFromMachine as MaintenanceTicket
              }
            }

            return {
              ...alert,
              machine: alert.assets || null,
              asset: alert.assets || null,
              ticket: ticketData,
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
        .from('assets')
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

  const handleOpenTicketForm = (alert: Alert & { machine: Machine | null; asset?: any }) => {
    setSelectedAlert(alert)
    const asset = alert.asset || alert.machine
    setNewTicket({
      title: `Maintenance Request: ${asset?.name || 'Unknown Asset'}`,
      description: alert.message,
      priority:
        alert.severity === 'Critical'
          ? 'Urgent'
          : alert.severity === 'High'
            ? 'High'
            : 'Medium',
      assigned_to: '',
      production_impact: asset?.status === 'Offline' || asset?.status === 'Critical' || false,
    })
    setShowTicketForm(true)
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlert) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const assetId = (selectedAlert as any).asset_id || selectedAlert.machine?.id || selectedAlert.asset?.id
      if (!assetId) {
        console.error('No asset ID found for alert')
        return
      }
      
      const ticketData: any = {
        asset_id: assetId,
        alert_id: selectedAlert.id,
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
        // If production impact, update asset status
        if (newTicket.production_impact && assetId) {
          await supabase
            .from('assets')
            .update({ status: 'maintenance' })
            .eq('id', assetId)
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

  // Calculate stats from all alerts (not filtered)
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const now = new Date()
  now.setHours(23, 59, 59, 999)

  // Calculate active alerts (unacknowledged or acknowledged after today)
  const activeAlerts = allAlerts.filter((alert) => {
    if (!alert.acknowledged) return true
    if (alert.acknowledged_at) {
      const acknowledged = new Date(alert.acknowledged_at)
      return acknowledged > now
    }
    return false
  })

  const stats = {
    total: activeAlerts.length, // Total active alerts (matches chart)
    unacknowledged: allAlerts.filter((a) => !a.acknowledged).length,
    critical: activeAlerts.filter((a) => a.severity === 'Critical').length,
    high: activeAlerts.filter((a) => a.severity === 'High').length,
    outOfService: machinesOutOfService.length,
    impactingProduction: activeAlerts.filter((a) => {
      const asset = (a as any).asset || a.machine
      return asset && (asset.status === 'Offline' || asset.status === 'Critical' || asset.status === 'Maintenance')
    }).length,
    resolvedLast3Days: allAlerts.filter((a) => {
      if (!a.acknowledged || !a.acknowledged_at) return false
      const acknowledgedDate = new Date(a.acknowledged_at)
      return acknowledgedDate >= threeDaysAgo
    }).length,
    newLast3Days: allAlerts.filter((a) => {
      const createdDate = new Date(a.created_at)
      return createdDate >= threeDaysAgo
    }).length,
  }

  // Pie chart data by status (acknowledged vs unacknowledged)
  const pieData = [
    { name: 'Unacknowledged', value: stats.unacknowledged, color: '#ef4444' },
    { name: 'Acknowledged', value: allAlerts.length - stats.unacknowledged, color: '#10b981' },
  ]

  // Pie chart data by severity (using active alerts)
  const severityPieData = [
    { name: 'Critical', value: stats.critical, color: '#dc2626' },
    { name: 'High', value: stats.high, color: '#ea580c' },
    { name: 'Medium', value: activeAlerts.filter((a) => a.severity === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: activeAlerts.filter((a) => a.severity === 'Low').length, color: '#3b82f6' },
  ]

  // Generate time series data for stacked area chart
  const generateTimeSeriesData = () => {
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeWindow)
    startDate.setHours(0, 0, 0, 0)
    
    // Create array of dates
    const dates: Date[] = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Process each date
    return dates.map((date) => {
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dateEnd = new Date(date)
      dateEnd.setHours(23, 59, 59, 999)
      
      // Count active alerts per severity for this date
      // An alert is active if: created <= dateEnd AND (not acknowledged OR acknowledged_at > dateEnd)
      // This matches the logic used for calculating stats.total
      const activeAlertsForDate = allAlerts.filter((alert) => {
        const created = new Date(alert.created_at)
        if (created > dateEnd) return false
        
        // If not acknowledged, it's active
        if (!alert.acknowledged) return true
        
        // If acknowledged, check if acknowledged_at is after this date
        if (alert.acknowledged_at) {
          const acknowledged = new Date(alert.acknowledged_at)
          return acknowledged > dateEnd
        }
        
        return false
      })
      
      return {
        date: dateStr,
        Critical: activeAlertsForDate.filter((a) => a.severity === 'Critical').length,
        High: activeAlertsForDate.filter((a) => a.severity === 'High').length,
        Medium: activeAlertsForDate.filter((a) => a.severity === 'Medium').length,
        Low: activeAlertsForDate.filter((a) => a.severity === 'Low').length,
      }
    })
  }
  
  const timeSeriesData = generateTimeSeriesData()
  
  // Verify consistency: today's active alerts should match the chart
  const todayData = timeSeriesData[timeSeriesData.length - 1]
  const todayActiveCount = (todayData?.Critical || 0) + (todayData?.High || 0) + (todayData?.Medium || 0) + (todayData?.Low || 0)

  // Generate AI insights
  const generateInsights = () => {
    const insights = []
    
    // Insight 1: Alert volume trend
    const avgAlertsPerDay = allAlerts.length > 0 ? allAlerts.length / 30 : 0 // Assuming 30 days of data
    const recentAlertsPerDay = stats.newLast3Days / 3
    if (avgAlertsPerDay > 0 && recentAlertsPerDay > avgAlertsPerDay * 1.2) {
      insights.push({
        type: 'warning',
        title: 'Alert Volume Increase',
        message: `Alert generation rate has increased ${Math.round((recentAlertsPerDay / avgAlertsPerDay - 1) * 100)}% in the last 3 days compared to the average.`,
      })
    } else if (recentAlertsPerDay < avgAlertsPerDay * 0.8) {
      insights.push({
        type: 'success',
        title: 'Alert Volume Decrease',
        message: `Alert generation rate has decreased ${Math.round((1 - recentAlertsPerDay / avgAlertsPerDay) * 100)}% in the last 3 days, indicating improved system stability.`,
      })
    }

    // Insight 2: Critical alert concentration
    const criticalPercentage = allAlerts.length > 0 ? (stats.critical / allAlerts.length) * 100 : 0
    if (criticalPercentage > 15) {
      insights.push({
        type: 'critical',
        title: 'High Critical Alert Ratio',
        message: `${criticalPercentage.toFixed(1)}% of alerts are critical. Consider reviewing maintenance schedules and preventive measures.`,
      })
    }

    // Insight 3: Response time
    const acknowledgedAlerts = allAlerts.filter((a) => a.acknowledged && a.acknowledged_at)
    if (acknowledgedAlerts.length > 0) {
      const avgResponseTime = acknowledgedAlerts.reduce((sum, a) => {
        const created = new Date(a.created_at)
        const acknowledged = new Date(a.acknowledged_at!)
        return sum + (acknowledged.getTime() - created.getTime()) / (1000 * 60 * 60) // hours
      }, 0) / acknowledgedAlerts.length
      
      if (avgResponseTime > 24) {
        insights.push({
          type: 'warning',
          title: 'Slow Alert Response Time',
          message: `Average alert acknowledgment time is ${avgResponseTime.toFixed(1)} hours. Consider improving response protocols.`,
        })
      }
    }

    // Insight 4: Production impact
    if (stats.impactingProduction > 0) {
      insights.push({
        type: 'critical',
        title: 'Production Impact',
        message: `${stats.impactingProduction} alerts are associated with assets currently impacting production. Immediate attention required.`,
      })
    }

    // Insight 5: Unacknowledged alerts
    const unackPercentage = allAlerts.length > 0 ? (stats.unacknowledged / allAlerts.length) * 100 : 0
    if (unackPercentage > 20) {
      insights.push({
        type: 'warning',
        title: 'High Unacknowledged Alert Rate',
        message: `${unackPercentage.toFixed(1)}% of alerts remain unacknowledged. Review alert management processes.`,
      })
    }

    // Insight 6: Time-based patterns
    const alertsByHour = new Array(24).fill(0)
    allAlerts.forEach((a) => {
      const hour = new Date(a.created_at).getHours()
      alertsByHour[hour]++
    })
    const peakHour = alertsByHour.indexOf(Math.max(...alertsByHour))
    if (alertsByHour[peakHour] > allAlerts.length / 24 * 2) {
      insights.push({
        type: 'info',
        title: 'Peak Alert Time',
        message: `Most alerts occur around ${peakHour}:00. Consider scheduling preventive maintenance during off-peak hours.`,
      })
    }

    // Insight 7: Asset correlation
    const assetAlertCounts = new Map<string, number>()
    allAlerts.forEach((a) => {
      const assetId = (a as any).asset_id || (a as any).machine_id
      if (assetId) {
        assetAlertCounts.set(assetId, (assetAlertCounts.get(assetId) || 0) + 1)
      }
    })
    const maxAlerts = Math.max(...Array.from(assetAlertCounts.values()))
    if (maxAlerts > 5) {
      const problemAsset = Array.from(assetAlertCounts.entries()).find(([_, count]) => count === maxAlerts)
      if (problemAsset) {
        const asset = allAlerts.find((a) => ((a as any).asset_id || (a as any).machine_id) === problemAsset[0])
        insights.push({
          type: 'warning',
          title: 'Frequent Alert Source',
          message: `One asset has generated ${maxAlerts} alerts. Consider detailed inspection or replacement evaluation.`,
        })
      }
    }

    // Insight 8: Resolution rate
    const resolutionRate = (stats.resolvedLast3Days / stats.newLast3Days) * 100
    if (stats.newLast3Days > 0) {
      if (resolutionRate < 50) {
        insights.push({
          type: 'warning',
          title: 'Low Resolution Rate',
          message: `Only ${resolutionRate.toFixed(1)}% of new alerts have been resolved in the last 3 days.`,
        })
      } else if (resolutionRate > 80) {
        insights.push({
          type: 'success',
          title: 'High Resolution Rate',
          message: `${resolutionRate.toFixed(1)}% of new alerts have been resolved, indicating effective alert management.`,
        })
      }
    }

    // Insight 9: Severity distribution
    if (allAlerts.length > 0 && stats.critical + stats.high > allAlerts.length * 0.5) {
      insights.push({
        type: 'critical',
        title: 'High Severity Alert Concentration',
        message: `Over 50% of alerts are Critical or High severity. Review root causes and preventive measures.`,
      })
    }

    // Insight 10: Maintenance correlation
    const alertsWithTickets = allAlerts.filter((a) => a.ticket)
    const ticketRate = allAlerts.length > 0 ? (alertsWithTickets.length / allAlerts.length) * 100 : 0
    if (ticketRate < 30 && stats.unacknowledged > 0) {
      insights.push({
        type: 'info',
        title: 'Low Ticket Creation Rate',
        message: `Only ${ticketRate.toFixed(1)}% of alerts have associated maintenance tickets. Consider creating tickets for unacknowledged alerts.`,
      })
    }

    return insights.slice(0, 10) // Return up to 10 insights
  }

  const aiInsights = generateInsights()

  let filteredAlerts = filter.search
    ? alerts.filter(
        (alert) => {
          const asset = (alert as any).asset || alert.machine
          return (
          alert.message.toLowerCase().includes(filter.search!.toLowerCase()) ||
          asset?.name?.toLowerCase().includes(filter.search!.toLowerCase())
        )}
      )
    : alerts

  // Filter by drill-down severity (handle capitalization)
  if (drillDownSeverity) {
    filteredAlerts = filteredAlerts.filter((a) => a.severity === drillDownSeverity || a.severity.toLowerCase() === drillDownSeverity.toLowerCase())
  }

  // Filter by out of service
  if (filter.outOfService) {
    filteredAlerts = filteredAlerts.filter(
      (alert) => {
        const asset = (alert as any).asset || alert.machine
        return asset &&
        (asset.status === 'offline' ||
          asset.status === 'critical' ||
          asset.status === 'maintenance')
      }
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

      {/* Top Section - 3 columns: 20%, 40%, 40% */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6" style={{ height: '300px', overflow: 'hidden' }}>
        {/* First 20% - High-level Metrics (Tabular Layout) */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <div className="bg-white rounded-lg shadow p-3 h-full flex flex-col overflow-hidden">
            <h3 className="text-xl font-semibold text-gray-900 mb-1.5 flex items-center gap-2 flex-shrink-0">
              <Activity className="w-5 h-5 text-gray-600" />
              Alert Metrics
            </h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-base font-medium text-gray-500">Total Alerts</span>
                    </div>
                  </td>
                  <td className="py-1.5 text-right">
                    <span className="text-base font-bold text-gray-900">{stats.total}</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-base font-medium text-gray-500">Impacting Production</span>
                    </div>
                  </td>
                  <td className="py-1.5 text-right">
                    <span className="text-base font-bold text-red-600">{stats.impactingProduction}</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-base font-medium text-gray-500">Resolved (3 Day)</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-0.5 ml-7">Alerts acknowledged in last 3 days</span>
                    </div>
                  </td>
                  <td className="py-1.5 text-right align-top">
                    <span className="text-base font-bold text-green-600">{stats.resolvedLast3Days}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-base font-medium text-gray-500">New (3 Day)</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-0.5 ml-7">New alerts generated in last 3 days</span>
                    </div>
                  </td>
                  <td className="py-1.5 text-right align-top">
                    <span className="text-base font-bold text-blue-600">{stats.newLast3Days}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Second 40% - Stacked Area Chart by Severity */}
        <div className="lg:col-span-2 h-full overflow-hidden">
          <div className="bg-white rounded-lg shadow p-3 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
                Alert Trends
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setTimeWindow(30)}
                  className={`px-2 py-1 text-xs rounded ${
                    timeWindow === 30
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  30d
                </button>
                <button
                  onClick={() => setTimeWindow(60)}
                  className={`px-2 py-1 text-xs rounded ${
                    timeWindow === 60
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  60d
                </button>
                <button
                  onClick={() => setTimeWindow(90)}
                  className={`px-2 py-1 text-xs rounded ${
                    timeWindow === 90
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  90d
                </button>
              </div>
            </div>
            {allAlerts.length > 0 && timeSeriesData.length > 0 ? (
              <div className="flex-1 min-h-0 w-full" style={{ height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      interval={timeWindow === 30 ? 2 : timeWindow === 60 ? 5 : 7}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Active Alerts', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      iconType="square"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Critical" 
                      stackId="1" 
                      stroke="#dc2626" 
                      fill="url(#colorCritical)" 
                      name="Critical"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="High" 
                      stackId="1" 
                      stroke="#ea580c" 
                      fill="url(#colorHigh)" 
                      name="High"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Medium" 
                      stackId="1" 
                      stroke="#f59e0b" 
                      fill="url(#colorMedium)" 
                      name="Medium"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Low" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="url(#colorLow)" 
                      name="Low"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Last 40% - AI Insights */}
        <div className="md:col-span-2 lg:col-span-2 h-full overflow-hidden">
          <div className="bg-white rounded-lg shadow p-3 h-full flex flex-col overflow-hidden">
            <h3 className="text-xl font-semibold text-gray-900 mb-1.5 flex items-center gap-2 flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              AI Maintenance Insights
            </h3>
            <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100% - 30px)' }}>
              {aiInsights.length > 0 ? (
                <div className="space-y-1">
                  {aiInsights.map((insight, index) => (
                    <div
                      key={index}
                      className={`py-1.5 px-2 rounded border-l-4 ${
                        insight.type === 'critical'
                          ? 'bg-red-50 border-red-500'
                          : insight.type === 'warning'
                            ? 'bg-orange-50 border-orange-500'
                            : insight.type === 'success'
                              ? 'bg-green-50 border-green-500'
                              : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <h4 className="font-semibold text-xs text-gray-900 leading-tight">{insight.title}</h4>
                      <p className="text-xs text-gray-700 mt-0.5 leading-tight">{insight.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-xs">No insights available at this time</p>
                </div>
              )}
            </div>
          </div>
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
                (a) => ((a as any).asset_id || (a as any).machine_id) === machine.id && !a.acknowledged
              )
              return (
                <div
                  key={machine.id}
                  className="bg-white rounded-lg p-3 border border-red-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/assets/${machine.id}`}
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
              variant="secondary"
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
                    alert.severity === 'Critical'
                      ? 'border-red-300 bg-red-50'
                      : alert.severity === 'High'
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            alert.severity === 'Critical'
                              ? 'text-red-600'
                              : alert.severity === 'High'
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
                        {(alert.machine || alert.asset) && (
                          <Link
                            href={`/assets/${(alert.asset || alert.machine)?.id}`}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            {(alert.asset || alert.machine)?.name}
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
                            variant="secondary"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Acknowledge
                          </Button>
                          {(alert.machine || alert.asset) && !alert.ticket && (
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
                              <Button size="sm" variant="secondary">
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
                  variant="secondary"
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
                      selectedAlert.severity === 'Critical'
                        ? 'text-red-600'
                        : selectedAlert.severity === 'High'
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
                  {(selectedAlert as any).asset?.name || selectedAlert.machine?.name || 'Unknown Asset'}
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
                    variant="secondary"
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

