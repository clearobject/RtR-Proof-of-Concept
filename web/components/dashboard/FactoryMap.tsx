'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FactoryLayout,
  type FactoryLayoutMachine,
  type FactoryLayoutSvgMeta,
} from '@/components/digital-twin/factory-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Machine } from '@/lib/types'
import { machines as allMachines } from '@/data/machines'

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
const STATUS_FILTER_OPTIONS = STATUS_ORDER.map((status) => STATUS_LABELS[status])

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
  const [selectedZones, setSelectedZones] = useState<string[]>([])

  const handleLayoutMachinesChange = useCallback(
    (layout: FactoryLayoutMachine[], _meta: FactoryLayoutSvgMeta) => {
      setLayoutMachines(layout)
    },
    []
  )

  const machines = useMemo<Machine[]>(() => allMachines, [])

  const layoutZoneMap = useMemo(() => {
    const map = new Map<string, string>()
    layoutMachines.forEach((entry) => {
      if (entry.zone) {
        map.set(entry.id, friendlyZone(entry.zone))
      }
    })
    return map
  }, [layoutMachines])

  const typeOptions = useMemo(() => {
    return Array.from(new Set(machines.map((machine) => friendlyType(machine.type)))).sort()
  }, [machines])

  const zoneOptions = useMemo(() => {
    const zones = machines.map((machine) => resolveMachineZone(machine, layoutZoneMap, layoutMachines))
    return Array.from(new Set(zones)).sort()
  }, [machines, layoutMachines, layoutZoneMap])

  useEffect(() => {
    setSelectedTypes(typeOptions)
  }, [typeOptions])

  useEffect(() => {
    setSelectedZones(zoneOptions)
  }, [zoneOptions])

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const zoneName = resolveMachineZone(machine, layoutZoneMap, layoutMachines)
      const readableType = friendlyType(machine.type)

      return (
        selectedStatuses.includes(machine.status) &&
        selectedTypes.includes(readableType) &&
        selectedZones.includes(zoneName)
      )
    })
  }, [
    machines,
    layoutMachines,
    layoutZoneMap,
    selectedStatuses,
    selectedTypes,
    selectedZones,
  ])

  const toggleValue = (value: string, list: string[], updater: (values: string[]) => void) => {
    if (list.includes(value)) {
      updater(list.filter((item) => item !== value))
    } else {
      updater([...list, value])
    }
  }

  const renderFilterGroup = (
    title: string,
    options: string[],
    selected: string[],
    onToggle: (value: string) => void
  ) => {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rtr-slate">{title}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = selected.includes(option)
            return (
              <button
                key={option}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-rtr-wine bg-rtr-wine text-white shadow-sm'
                    : 'border-rtr-border bg-white text-rtr-ink hover:border-rtr-wine/60 hover:text-rtr-wine'
                }`}
                type="button"
                onClick={() => onToggle(option)}
              >
                {option}
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
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-rtr-border bg-rtr-cream p-4">
          {renderFilterGroup(
            'Alert Status',
            STATUS_FILTER_OPTIONS,
            selectedStatuses.map((status) => STATUS_LABELS[status]),
            handleStatusToggle,
          )}
          {renderFilterGroup('Machine Type', typeOptions, selectedTypes, (value) =>
            toggleValue(value, selectedTypes, setSelectedTypes),
          )}
          {renderFilterGroup('Zone', zoneOptions, selectedZones, (value) =>
            toggleValue(value, selectedZones, setSelectedZones),
          )}
        </div>

        <div className="rounded-2xl border border-rtr-border bg-white p-2">
          <FactoryLayout
            machines={filteredMachines}
            onLayoutMachinesChange={handleLayoutMachinesChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}


