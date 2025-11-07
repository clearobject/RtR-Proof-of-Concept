// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { FactoryDashboard } from '@/components/digital-twin/factory-dashboard'

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-rtr-ink">Digital Twin</h1>
        <p className="text-rtr-slate mt-2">
          Factory floor overview and operational insights
        </p>
      </div>

      <FactoryDashboard />
    </div>
  )
}


