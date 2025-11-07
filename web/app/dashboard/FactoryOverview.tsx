'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { MACHINE_LAYOUT } from './machineLayout'
import { createClient } from '@/lib/supabase/browser'

type SupabaseMachineStatus = {
  name: string | null
  status: MachineHealthStatus
  currentAlertSummary: string | null
}

type MachineHealthStatus = 'running' | 'warning' | 'critical' | 'not_running'

const STATUS_COLORS: Record<MachineHealthStatus, string> = {
  running: '#10b981', // rtr-success
  warning: '#f59e0b', // rtr-warning
  critical: '#ef4444', // rtr-danger
  not_running: '#d1d5db', // neutral gray
}

const FALLBACK_COLOR = '#d1d5db'

const SVG_WIDTH = 2261
const SVG_HEIGHT = 1345

export default function FactoryOverview() {
  const router = useRouter()
  const [statusMap, setStatusMap] = useState<Record<string, SupabaseMachineStatus>>({})
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    let isMounted = true

    const fetchStatuses = async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('asset_alias,name,status,current_alert_summary')

      if (error) {
        console.error('Failed to fetch machine status from Supabase', error)
        return
      }

      if (!isMounted || !data) return

      const normalized: Record<string, SupabaseMachineStatus> = {}

      data.forEach((row) => {
        const status = (row.status ?? 'not_running') as MachineHealthStatus
        normalized[row.asset_alias] = {
          name: row.name ?? null,
          status,
          currentAlertSummary: row.current_alert_summary ?? null,
        }
      })

      setStatusMap(normalized)
    }

    fetchStatuses()

    return () => {
      isMounted = false
    }
  }, [])

  const aspectPadding = useMemo(
    () => `${(SVG_HEIGHT / SVG_WIDTH) * 100}%`,
    []
  )

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ paddingTop: aspectPadding }}>
        <img
          src="/images/RtR_Factory_Layout.svg"
          alt="Rent the Runway factory layout"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {MACHINE_LAYOUT.map((machine) => {
          const status = statusMap[machine.assetAlias]
          const color = status
            ? STATUS_COLORS[status.status] ?? FALLBACK_COLOR
            : FALLBACK_COLOR

          const tooltipTitle = status?.name ?? machine.assetAlias
          const tooltipSummary =
            status?.currentAlertSummary?.trim() || 'No active alerts'

          return (
            <div
              key={machine.assetAlias}
              className="absolute"
              style={{
                left: `${machine.xPct}%`,
                top: `${machine.yPct}%`,
                width: `${machine.widthPct}%`,
                height: `${machine.heightPct}%`,
              }}
            >
              <button
                type="button"
                onMouseEnter={() => setHoveredAsset(machine.assetAlias)}
                onMouseLeave={() => setHoveredAsset((current) =>
                  current === machine.assetAlias ? null : current
                )}
                onFocus={() => setHoveredAsset(machine.assetAlias)}
                onBlur={() => setHoveredAsset((current) =>
                  current === machine.assetAlias ? null : current
                )}
                onClick={() =>
                  router.push(`/asset/${encodeURIComponent(machine.assetAlias)}`)
                }
                className="h-full w-full rounded-sm border border-black/20 shadow-sm outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                style={{
                  backgroundColor: color,
                }}
                aria-label={`View details for ${tooltipTitle}`}
              />

              {hoveredAsset === machine.assetAlias && (
                <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-black/10">
                  <div className="font-semibold text-gray-900">{tooltipTitle}</div>
                  <div className="text-gray-600">{machine.assetAlias}</div>
                  <div className="mt-1 max-w-[16rem] text-gray-700">
                    {tooltipSummary}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

