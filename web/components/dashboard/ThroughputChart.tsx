'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const mockThroughputData = [
  { time: '00:00', garments: 1860 },
  { time: '02:00', garments: 1985 },
  { time: '04:00', garments: 1740 },
  { time: '06:00', garments: 2210 },
  { time: '08:00', garments: 2475 },
  { time: '10:00', garments: 2580 },
  { time: '12:00', garments: 2440 },
  { time: '14:00', garments: 2625 },
  { time: '16:00', garments: 2730 },
  { time: '18:00', garments: 2640 },
  { time: '20:00', garments: 2495 },
  { time: '22:00', garments: 2380 },
]

export function ThroughputChart() {
  return (
    <Card className="h-full">
      <CardHeader className="mb-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-rtr-ink">
              Plant Throughput (Garments / Hour)
            </CardTitle>
            <p className="text-sm text-rtr-slate">
              Last updated 5 minutes ago · Based on `sensor_data`
            </p>
          </div>
          <span className="rounded-xl bg-rtr-wine px-3 py-1 text-xs font-medium text-white shadow-sm">
            Current Rate: 2,350 / hr
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockThroughputData}>
            <defs>
              <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#29000b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#29000b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                borderColor: '#e5e7eb',
                boxShadow: 'var(--shadow-rtr-elevated)',
              }}
            />
            <Area
              type="monotone"
              dataKey="garments"
              stroke="#29000b"
              strokeWidth={2.5}
              fill="url(#throughputGradient)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


