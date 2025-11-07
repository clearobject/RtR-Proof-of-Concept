import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

type MachinesRow = {
  id: string
  name: string
  status: string
  type: string
  zone: string
  asset_alias?: string | null
  current_alert_summary?: string | null
}

type AlertRow = {
  id: string
  severity: string
  message: string
  acknowledged: boolean
  created_at: string
}

type MaintenanceTicketRow = {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
}

type SensorDataRow = {
  id: string
  timestamp: string
  temperature: number | null
  vibration: number | null
  power: number | null
  humidity: number | null
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const formatStatus = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export default async function MachinePage({
  params,
}: {
  params: { assetAlias: string }
}) {
  const assetAlias = decodeURIComponent(params.assetAlias)

  // Check if Supabase is configured before trying to use it
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Configuration error: Supabase is not configured.</p>
          <p className="text-sm text-gray-400">Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  const {
    data: machine,
    error: machineError,
  } = await supabase
    .from('machines')
    .select('*')
    .eq('asset_alias', assetAlias)
    .maybeSingle<MachinesRow>()

  if (machineError) {
    console.error('Failed to load machine', machineError)
  }

  if (!machine) {
    notFound()
  }

  const [{ data: alerts }, { data: tickets }, { data: sensorData }] = await Promise.all([
    supabase
      .from('alerts')
      .select('id,severity,message,acknowledged,created_at')
      .eq('machine_id', machine.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<AlertRow[]>(),
    supabase
      .from('maintenance_tickets')
      .select('id,title,status,priority,created_at')
      .eq('machine_id', machine.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<MaintenanceTicketRow[]>(),
    supabase
      .from('sensor_data')
      .select('id,timestamp,temperature,vibration,power,humidity')
      .eq('machine_id', machine.id)
      .order('timestamp', { ascending: false })
      .limit(10)
      .returns<SensorDataRow[]>(),
  ])

  const activeAlerts = alerts?.filter((alert) => !alert.acknowledged) ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-sm text-gray-500">Asset Alias</p>
        <h1 className="text-3xl font-bold text-gray-900">{machine.name}</h1>
        <p className="text-gray-600">
          {assetAlias} • {formatStatus(machine.status)} • {formatStatus(machine.type)} •{' '}
          {machine.zone}
        </p>
        {machine.current_alert_summary && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {machine.current_alert_summary}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
          <p className="mt-2 text-sm text-gray-600">
            Real-time metrics will be displayed here. For now, this section serves as a placeholder
            for telemetry charts and KPIs.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Latest Temperature</p>
              <p className="text-xl font-semibold text-gray-900">
                {sensorData?.at(-1)?.temperature ?? '—'}
                {sensorData?.at(-1)?.temperature != null && <span className="text-sm text-gray-500"> °C</span>}
              </p>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Latest Vibration</p>
              <p className="text-xl font-semibold text-gray-900">
                {sensorData?.at(-1)?.vibration ?? '—'}
                {sensorData?.at(-1)?.vibration != null && <span className="text-sm text-gray-500"> mm/s</span>}
              </p>
            </div>
            <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Latest Power</p>
              <p className="text-xl font-semibold text-gray-900">
                {sensorData?.at(-1)?.power ?? '—'}
                {sensorData?.at(-1)?.power != null && <span className="text-sm text-gray-500"> kW</span>}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
          {activeAlerts.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No active alerts for this machine.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activeAlerts.map((alert) => (
                <li key={alert.id} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                  <p className="font-medium text-amber-900">{formatStatus(alert.severity)}</p>
                  <p className="text-amber-800">{alert.message}</p>
                  <p className="mt-1 text-xs text-amber-700">{formatDateTime(alert.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
          {alerts && alerts.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <li key={alert.id} className="rounded-md border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{formatStatus(alert.severity)}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(alert.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{alert.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No recent alerts logged.</p>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recent Maintenance Tickets</h2>
          {tickets && tickets.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="rounded-md border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{ticket.title}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(ticket.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Status: {formatStatus(ticket.status)} • Priority: {formatStatus(ticket.priority)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-600">No recent maintenance tickets.</p>
          )}
        </section>
      </div>
    </div>
  )
}

