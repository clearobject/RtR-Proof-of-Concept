'use client'

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from './KpiCard'

const oeeBreakdown = [
  { name: 'Availability', value: 0.92, color: '#4a0018' },
  { name: 'Performance', value: 0.88, color: '#B68FA2' },
  { name: 'Quality', value: 0.95, color: '#FDECEF' },
]

const plantOee = 0.872
const deltaVsYesterday = 0.012

export function OeePanel() {
  const trendDirection = deltaVsYesterday >= 0 ? 'up' : 'down'
  const trendValue = `${(deltaVsYesterday * 100).toFixed(1)} pts vs. yesterday`
  const oeeChartData = [
    {
      category: 'Plant OEE',
      Availability: oeeBreakdown[0].value * 100,
      Performance: oeeBreakdown[1].value * 100,
      Quality: oeeBreakdown[2].value * 100,
    },
  ]

  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-rtr-ink">Plant OEE</CardTitle>
            <p className="text-sm text-rtr-slate">
              Last updated 15 minutes ago · Calculated from `oee_metrics`
            </p>
          </div>
        </div>
        <KpiCard
          label="Overall Equipment Effectiveness"
          value={`${(plantOee * 100).toFixed(1)}%`}
          helperText="Target: 90%"
          trend={{
            direction: trendDirection === 'up' ? 'up' : 'down',
            value: trendValue,
          }}
          icon={
            trendDirection === 'up' ? (
              <TrendingUp className="h-5 w-5" aria-hidden />
            ) : (
              <TrendingDown className="h-5 w-5" aria-hidden />
            )
          }
          accent="blush"
        />
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={oeeChartData} layout="vertical" barCategoryGap="35%">
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="category" hide />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                borderColor: '#e5e7eb',
                boxShadow: 'var(--shadow-rtr-elevated)',
              }}
            />
            <Legend
              verticalAlign="top"
              align="left"
              iconType="circle"
              wrapperStyle={{ color: '#111827' }}
              formatter={(value) => (
                <span className="text-sm font-medium text-rtr-ink">{value}</span>
              )}
            />
            {oeeBreakdown.map((item) => (
              <Bar
                key={item.name}
                dataKey={item.name}
                stackId="oee"
                fill={item.color}
                radius={[12, 12, 12, 12]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


