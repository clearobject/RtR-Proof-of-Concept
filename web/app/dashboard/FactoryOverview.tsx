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

  const hoveredMachine = useMemo(
    () => MACHINE_LAYOUT.find((machine) => machine.assetAlias === hoveredAsset),
    [hoveredAsset]
  )

  const tooltipLeftPct = hoveredMachine
    ? hoveredMachine.xPct + hoveredMachine.widthPct / 2
    : 0
  const tooltipTopPct = hoveredMachine ? hoveredMachine.yPct : 0

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ paddingTop: aspectPadding }}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="absolute inset-0 h-full w-full"
        >
          <image
            href="/images/RtR_Factory_Layout.svg"
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
          />

          {MACHINE_LAYOUT.map((machine) => {
            const status = statusMap[machine.assetAlias]
            const color = status
              ? STATUS_COLORS[status.status] ?? FALLBACK_COLOR
              : FALLBACK_COLOR

            const tooltipTitle = status?.name ?? machine.assetAlias

            return (
              <g key={machine.assetAlias}>
                <rect
                  x={machine.x}
                  y={machine.y}
                  width={machine.width}
                  height={machine.height}
                  rx={Math.min(4, machine.width / 4)}
                  fill={color}
                  opacity={hoveredAsset === machine.assetAlias ? 0.9 : 0.8}
                  stroke="#111827"
                  strokeWidth={1.5}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${tooltipTitle}`}
                  onMouseEnter={() => setHoveredAsset(machine.assetAlias)}
                  onMouseLeave={() =>
                    setHoveredAsset((current) =>
                      current === machine.assetAlias ? null : current
                    )
                  }
                  onFocus={() => setHoveredAsset(machine.assetAlias)}
                  onBlur={() =>
                    setHoveredAsset((current) =>
                      current === machine.assetAlias ? null : current
                    )
                  }
                  onClick={() =>
                    router.push(`/machines/${encodeURIComponent(machine.assetAlias)}`)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      router.push(`/machines/${encodeURIComponent(machine.assetAlias)}`)
                    }
                  }}
                  className="cursor-pointer transition-transform duration-150 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                />
              </g>
            )
          })}
        </svg>

        {hoveredMachine && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-black/10"
            style={{
              left: `${tooltipLeftPct}%`,
              top: `${tooltipTopPct}%`,
            }}
          >
            <div className="font-semibold text-gray-900">
              {statusMap[hoveredMachine.assetAlias]?.name ?? hoveredMachine.assetAlias}
            </div>
            <div className="text-gray-600">{hoveredMachine.assetAlias}</div>
            <div className="mt-1 max-w-[16rem] text-gray-700">
              {statusMap[hoveredMachine.assetAlias]?.currentAlertSummary?.trim() ||
                'No active alerts'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

