'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FactoryLayout,
  STATUS_COLORS,
  type FactoryLayoutMachine,
  type FactoryLayoutSvgMeta,
} from '@/components/digital-twin/factory-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Machine, Alert } from '@/lib/types'
import { machines as allMachines } from '@/data/machines'
import { createClient } from '@/lib/supabase/browser'

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const STATUS_ORDER: Machine['status'][] = [
  'operational',
  'warning',
  'critical',
  'maintenance',
  'offline',
]

const STATUS_LABELS: Record<Machine['status'], string> = {
  operational: 'Operational',
  warning: 'Warning',
  critical: 'Critical',
  maintenance: 'Maintenance',
  offline: 'Offline',
}
const STATUS_FILTER_OPTIONS = STATUS_ORDER.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
  color: STATUS_COLORS[status],
}))

const severityOrder: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const severityToStatus: Record<string, Machine['status']> = {
  critical: 'critical',
  high: 'warning',
  medium: 'maintenance',
  low: 'operational',
}

type DisplayMachine = Machine & {
  alertSeverity?: string | null
}

const friendlyZone = (zoneId?: string | null) => {
  if (!zoneId) return 'Unassigned'
  const cleaned = zoneId.replace(/^ZONE[-\s]?/i, '').replace(/[-_]/g, ' ')
  return cleaned.replace(/\b(\w)/g, (l) => l.toUpperCase())
}

const friendlyType = (type: string) =>
  type
    .replace(/[_.-]/g, ' ')
    .replace(/\b(\w)/g, (l) => l.toUpperCase())

const resolveMachineZone = (
  machine: Machine,
  layoutMap: Map<string, string>,
  layoutEntries: FactoryLayoutMachine[]
) => {
  const reference = machine.asset_alias ?? machine.id
  const directZone = machine.zone?.trim()
  if (directZone) return friendlyZone(directZone)

  const layoutZone = layoutMap.get(reference)
  if (layoutZone) return layoutZone

  const entry = layoutEntries.find((item) => item.id === reference)
  if (entry?.zone) return friendlyZone(entry.zone)

  return 'Unassigned'
}

export function FactoryMap() {
  const [layoutMachines, setLayoutMachines] = useState<FactoryLayoutMachine[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<Machine['status'][]>(STATUS_ORDER)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [machines, setMachines] = useState<Machine[]>(allMachines)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loadingSupabase, setLoadingSupabase] = useState(false)

  const handleLayoutMachinesChange = useCallback(
    (layout: FactoryLayoutMachine[], _meta: FactoryLayoutSvgMeta) => {
      setLayoutMachines(layout)
    },
    []
  )

  const layoutZoneMap = useMemo(() => {
    const map = new Map<string, string>()
    layoutMachines.forEach((entry) => {
      if (entry.zone) {
        map.set(entry.id, friendlyZone(entry.zone))
      }
    })
    return map
  }, [layoutMachines])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setLoadingSupabase(true)
        const supabase = createClient()

        const [{ data: machineData }, { data: alertData }] = await Promise.all([
          supabase.from('machines').select('*').order('name'),
          supabase.from('alerts').select('*').eq('acknowledged', false),
        ])

        if (machineData && machineData.length > 0 && isMounted) {
          setMachines(machineData as Machine[])
        }

        if (alertData && isMounted) {
          setAlerts(alertData as Alert[])
        }
      } catch (error) {
        console.error('[FactoryMap] Failed to load Supabase data', error)
      } finally {
        if (isMounted) {
          setLoadingSupabase(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const alertSeverityMap = useMemo(() => {
    const map = new Map<string, string>()
    alerts.forEach((alert) => {
      if (!alert.machine_id) return
      const current = map.get(alert.machine_id)
      if (!current || severityOrder[alert.severity] > severityOrder[current]) {
        map.set(alert.machine_id, alert.severity)
      }
    })
    return map
  }, [alerts])

  const displayMachines = useMemo<DisplayMachine[]>(() => {
    return machines.map((machine) => {
      const severity = alertSeverityMap.get(machine.id)
      const derivedStatus =
        machine.status === 'offline' || machine.status === 'critical'
          ? machine.status
          : severity
            ? severityToStatus[severity] ?? machine.status
            : machine.status

      const zoneName = resolveMachineZone(machine, layoutZoneMap, layoutMachines)

      return {
        ...machine,
        zone: zoneName,
        status: derivedStatus,
        alertSeverity: severity,
      }
    })
  }, [alertSeverityMap, layoutMachines, layoutZoneMap, machines])

  const typeOptions = useMemo(() => {
    return Array.from(new Set(displayMachines.map((machine) => friendlyType(machine.type)))).sort()
  }, [displayMachines])

  useEffect(() => {
    setSelectedTypes(typeOptions)
  }, [typeOptions])

  const filteredMachines = useMemo(() => {
    return displayMachines.filter((machine) => {
      const readableType = friendlyType(machine.type)

      return selectedStatuses.includes(machine.status) && selectedTypes.includes(readableType)
    })
  }, [displayMachines, selectedStatuses, selectedTypes])

  const toggleValue = (value: string, list: string[], updater: (values: string[]) => void) => {
    if (list.includes(value)) {
      updater(list.filter((item) => item !== value))
    } else {
      updater([...list, value])
    }
  }

  const renderTypeFilterGroup = () => {
    return (
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rtr-slate">Machine Type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {typeOptions.map((option) => {
            const isActive = selectedTypes.includes(option)
            return (
              <button
                key={option}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-rtr-ink bg-rtr-ink text-white shadow-sm'
                    : 'border-rtr-border bg-white text-rtr-ink hover:border-rtr-ink/60 hover:text-rtr-ink'
                }`}
                type="button"
                onClick={() => toggleValue(option, selectedTypes, setSelectedTypes)}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderStatusFilterGroup = () => {
    return (
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rtr-slate">Alert Status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_FILTER_OPTIONS.map((option) => {
            const isActive = selectedStatuses.includes(option.value)
            const baseColor = STATUS_COLORS[option.value] ?? STATUS_COLORS.unknown
            const backgroundColor = isActive ? hexToRgba(baseColor, 0.25) : hexToRgba(baseColor, 0.08)
            const borderColor = isActive ? hexToRgba(baseColor, 0.6) : 'transparent'
            return (
              <button
                key={option.value}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-rtr-ink transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rtr-wine focus-visible:ring-offset-1 ${
                  isActive ? 'shadow-sm' : 'hover:shadow-sm'
                }`}
                type="button"
                style={{ backgroundColor, borderColor }}
                onClick={() => handleStatusToggle(option.label)}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-white/60 shadow-sm"
                  style={{ backgroundColor: baseColor }}
                  aria-hidden
                />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const handleStatusToggle = (label: string) => {
    const statusKey = STATUS_ORDER.find((status) => STATUS_LABELS[status] === label)
    if (!statusKey) return
    toggleValue(
      statusKey,
      selectedStatuses,
      (values) => setSelectedStatuses(values as Machine['status'][]),
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-rtr-ink">
          Factory Floor Layout
        </CardTitle>
        <p className="text-sm text-rtr-slate">
          Last updated 10 minutes ago · Sourced from `machine_status_view`
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-rtr-border bg-rtr-cream p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
            {renderStatusFilterGroup()}
            <div className="h-px bg-rtr-border/60 lg:h-auto lg:w-px" />
            {renderTypeFilterGroup()}
          </div>
        </div>

        <div className="relative rounded-2xl border border-rtr-border bg-white p-2 shadow-sm">
          <FactoryLayout machines={filteredMachines} onLayoutMachinesChange={handleLayoutMachinesChange} />
          {loadingSupabase && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 text-sm font-medium text-rtr-slate">
              Syncing live floor data…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


