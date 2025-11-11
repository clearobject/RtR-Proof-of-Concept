// Force dynamic rendering
export const dynamic = 'force-dynamic'

import {
  Activity,
  AlertTriangle,
  Factory,
  Gauge,
} from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ThroughputChart } from '@/components/dashboard/ThroughputChart'
import { AlertsOverview } from '@/components/dashboard/AlertsOverview'
import { OeePanel } from '@/components/dashboard/OeePanel'
import { FactoryMap } from '@/components/dashboard/FactoryMap'

const executiveKpis = [
  {
    label: 'Garments Processed (24h)',
    value: '54,720',
    helperText: 'Pulled from `sensor_data`',
    icon: <Factory className="h-5 w-5" aria-hidden />,
  },
  {
    label: 'Current Throughput',
    value: '2,350 / hr',
    helperText: 'Past 15-minute average',
    icon: <Activity className="h-5 w-5" aria-hidden />,
  },
  {
    label: 'Active Machine Alerts',
    value: '32',
    helperText: 'Across 18 assets',
    icon: <AlertTriangle className="h-5 w-5" aria-hidden />,
    accent: 'wine' as const,
    href: '/dashboard/alerts',
  },
  {
    label: 'Plant OEE',
    value: '87.2%',
    helperText: 'Target 90%',
    icon: <Gauge className="h-5 w-5" aria-hidden />,
    accent: 'blush' as const,
  },
]

export default function DashboardPage() {
  return (
    <div className="bg-rtr-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rtr-slate">
            RTR Operations
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-rtr-ink sm:text-4xl">
            Executive Operational Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-base text-rtr-slate">
            Real-time performance, capacity and alerting to help RTR leadership
            steer the EWR facility with confidence.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {executiveKpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ThroughputChart />
          <AlertsOverview />
        </section>

        <section className="mt-8">
          <FactoryMap />
        </section>

        <section className="mt-8">
          <OeePanel />
        </section>
      </div>
    </div>
  )
}
