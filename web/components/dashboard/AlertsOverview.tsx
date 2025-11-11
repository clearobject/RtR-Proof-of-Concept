'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from './KpiCard'

const severityDistribution = [
  { severity: 'Critical', value: 4 },
  { severity: 'High', value: 7 },
  { severity: 'Medium', value: 12 },
  { severity: 'Low', value: 9 },
]

export function AlertsOverview() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-rtr-ink">
              Active Alerts & Downtime Progress
            </CardTitle>
            <p className="text-sm text-rtr-slate">
              Last updated 12 minutes ago · Pulling from `machine_status_view`
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard
            label="Active Machine Alerts"
            value="32"
            helperText="Across 18 machines"
            trend={{ direction: 'up', value: '+6 vs. yesterday' }}
            icon={<AlertTriangle className="h-5 w-5" aria-hidden />}
            accent="wine"
          />
          <KpiCard
            label="Downtime Resolved (Today)"
            value="14"
            helperText="78% of open tickets"
            trend={{ direction: 'up', value: '+12 pts vs. target' }}
            icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
            accent="success"
          />
        </div>
      </CardHeader>
      <CardContent className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={severityDistribution} barSize={28}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="severity"
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              allowDecimals={false}
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <Tooltip
              cursor={{ fill: 'rgba(41, 0, 11, 0.05)' }}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                borderColor: '#e5e7eb',
                boxShadow: 'var(--shadow-rtr-elevated)',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} fill="#29000b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


