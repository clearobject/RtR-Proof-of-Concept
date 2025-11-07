// Force dynamic rendering
export const dynamic = 'force-dynamic'

import FactoryOverview from '@/app/dashboard/FactoryOverview'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Digital Twin</h1>
        <p className="text-gray-600 mt-2">
          Factory floor overview and operational insights
        </p>
      </div>

      <FactoryOverview />
    </div>
  )
}


