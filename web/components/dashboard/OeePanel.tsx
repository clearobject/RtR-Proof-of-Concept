'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

const plantOee = {
  current: 0.872,
  yesterday: 0.86,
  target: 0.9,
  timestamp: '15 minutes ago',
}

const oeeDrivers = [
  {
    name: 'Availability',
    current: 92,
    target: 95,
    delta: -1.3,
    driver: 'AM shift steam valve repair produced 42 min unplanned downtime',
  },
  {
    name: 'Performance',
    current: 88,
    target: 90,
    delta: 0.8,
    driver: 'Automated bagging cell running 3% faster after tuning',
  },
  {
    name: 'Quality',
    current: 95,
    target: 96,
    delta: 0.4,
    driver: 'Spotting line rechecks caught 18 defects before outbound',
  },
]

const chartData = oeeDrivers.map((driver) => ({
  name: driver.name,
  Current: driver.current,
  Target: driver.target,
}))

export function OeePanel() {
  const deltaVsYesterday = (plantOee.current - plantOee.yesterday) * 100
  const trendPositive = deltaVsYesterday >= 0

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-rtr-ink">Plant OEE</CardTitle>
            <p className="text-sm text-rtr-slate">
              Last updated {plantOee.timestamp} · Blended across all EWR assets
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rtr-slate">
              Overall OEE
            </p>
            <p className="mt-1 text-3xl font-semibold text-rtr-ink sm:text-4xl">
              {(plantOee.current * 100).toFixed(1)}%
            </p>
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                trendPositive
                  ? 'bg-rtr-success/10 text-rtr-success'
                  : 'bg-rtr-danger/10 text-rtr-danger'
              )}
            >
              {trendPositive ? (
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDownRight className="h-4 w-4" aria-hidden />
              )}
              {trendPositive ? '+' : ''}
              {deltaVsYesterday.toFixed(1)} pts vs yesterday
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-rtr-blush/40 p-4 text-sm text-rtr-ink">
          Availability remains the primary headwind; maintenance backlog clearance is expected to lift
          OEE above the 90% target within two shifts once the boiler loop stabilizes.
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" barCategoryGap={24}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} />
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
              />
              <Bar dataKey="Current" fill="#29000b" radius={[6, 6, 6, 6]} />
              <Bar dataKey="Target" fill="#e5e7eb" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {oeeDrivers.map((driver) => {
            const deltaPositive = driver.delta >= 0
            return (
              <div
                key={driver.name}
                className="rounded-xl border border-rtr-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-rtr-ink">{driver.name}</p>
                    <p className="text-xs text-rtr-slate">Target {driver.target.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-rtr-ink">
                      {driver.current.toFixed(1)}%
                    </p>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        deltaPositive ? 'text-rtr-success' : 'text-rtr-danger'
                      )}
                    >
                      {deltaPositive ? (
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" aria-hidden />
                      )}
                      {deltaPositive ? '+' : ''}
                      {driver.delta.toFixed(1)} pts
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-rtr-slate">{driver.driver}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


