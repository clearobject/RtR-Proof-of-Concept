'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Machine } from '@/lib/types'

interface LayoutMachine {
  id: string
  zone?: string | null
  bbox: { x: number; y: number; width: number; height: number }
  cx: number
  cy: number
}

interface SvgMeta {
  width: number
  height: number
}

const SVG_PATH = '/images/EWR-Factory-Floor-Layout.svg'

const STATUS_COLORS: Record<Machine['status'] | 'unknown', string> = {
  operational: '#10b981',
  warning: '#f97316',
  critical: '#ef4444',
  maintenance: '#fbbf24',
  offline: '#9ca3af',
  unknown: '#6b7280',
}

interface FactoryLayoutProps {
  machines: Machine[]
  onMachineClick?: (machine: Machine) => void
  onLayoutMachinesChange?: (machines: LayoutMachine[], meta: SvgMeta) => void
}

export function FactoryLayout({ machines, onMachineClick, onLayoutMachinesChange }: FactoryLayoutProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null)
  const [layoutMachines, setLayoutMachines] = useState<LayoutMachine[]>([])
  const [svgMeta, setSvgMeta] = useState<SvgMeta | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadSvg = async () => {
      try {
        const response = await fetch(SVG_PATH)
        if (!response.ok) throw new Error(`Failed to load SVG: ${response.status}`)
        const text = await response.text()
        if (isMounted) {
          setSvgMarkup(text)
        }
      } catch (error) {
        console.error('[FactoryLayout] Unable to fetch SVG layout', error)
      }
    }

    loadSvg()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!svgMarkup) return
    const container = containerRef.current
    if (!container) return

    const evaluate = () => {
      const svg = container.querySelector('svg')
      if (!svg) return

      const viewBox = svg.viewBox
      const width = viewBox?.baseVal?.width || svg.getBoundingClientRect().width || 1
      const height = viewBox?.baseVal?.height || svg.getBoundingClientRect().height || 1

      const machineNodes = svg.querySelectorAll<SVGGraphicsElement>('[id^="EWR."]')
      const parsedMachines: LayoutMachine[] = Array.from(machineNodes).map((node) => {
        const bbox = node.getBBox()
        const zone = node.closest('g[id^="ZONE-"]')?.id ?? null
        return {
          id: node.id,
          zone,
          bbox: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
          cx: bbox.x + bbox.width / 2,
          cy: bbox.y + bbox.height / 2,
        }
      })

      setSvgMeta({ width, height })
      setLayoutMachines(parsedMachines)
      if (onLayoutMachinesChange) {
        onLayoutMachinesChange(parsedMachines, { width, height })
      }
    }

    // Wait for markup to paint before querying bbox
    const frame = requestAnimationFrame(evaluate)

    return () => cancelAnimationFrame(frame)
  }, [svgMarkup])

  const machineLookup = useMemo(() => {
    const map = new Map<string, Machine>()
    machines.forEach((machine) => {
      if (machine.asset_alias) {
        map.set(machine.asset_alias, machine)
      }
      map.set(machine.id, machine)
    })
    return map
  }, [machines])

  const overlays = useMemo(() => {
    if (!svgMeta) return []
    return layoutMachines
      .map((layout) => {
        const machine =
          machineLookup.get(layout.id) ||
          machineLookup.get(layout.id.replace(/_/g, '-')) ||
          machineLookup.get(layout.id.replace(/^EWR\./, ''))

        if (!machine) return null

        const left = (layout.cx / svgMeta.width) * 100
        const top = (layout.cy / svgMeta.height) * 100

        return {
          layout,
          machine,
          style: {
            left: `${left}%`,
            top: `${top}%`,
          },
        }
      })
      .filter(Boolean) as {
      layout: LayoutMachine
      machine: Machine
      style: { left: string; top: string }
    }[]
  }, [layoutMachines, machineLookup, svgMeta])

  return (
    <div className="relative w-full rounded-xl border border-rtr-border bg-white">
      <div className="relative overflow-hidden">
        <div
          ref={containerRef}
          className="relative"
          dangerouslySetInnerHTML={svgMarkup ? { __html: svgMarkup } : undefined}
        />

        {svgMarkup && svgMeta && (
          <div className="pointer-events-none absolute inset-0">
            {overlays.map(({ layout, machine, style }) => {
              const statusColor = STATUS_COLORS[machine.status] ?? STATUS_COLORS.unknown
              const isHovered = hoveredId === layout.id
              return (
                <div
                  key={layout.id}
                  style={style}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    className={`pointer-events-auto rounded-full border border-white p-[6px] shadow-md transition ${
                      isHovered ? 'scale-110' : 'scale-100'
                    }`}
                    onClick={() => {
                      onMachineClick?.(machine)
                      router.push(`/machines/${machine.id}`)
                    }}
                    onMouseEnter={() => setHoveredId(layout.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-label={`${machine.name} status ${machine.status}`}
                  >
                    <span
                      className="block h-3 w-3 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                  </button>

                  {isHovered && (
                    <div className="pointer-events-none absolute left-4 top-4 w-48 rounded-lg border border-rtr-border bg-white p-3 text-xs text-rtr-ink shadow-lg">
                      <p className="font-medium text-rtr-ink">{machine.name}</p>
                      <p className="mt-1 text-rtr-slate">
                        Status:{' '}
                        <span className="font-medium capitalize text-rtr-ink">{machine.status}</span>
                      </p>
                      {machine.zone && (
                        <p className="text-rtr-slate">
                          Zone: <span className="font-medium text-rtr-ink">{machine.zone}</span>
                        </p>
                      )}
                      <p className="text-rtr-slate">
                        Type:{' '}
                        <span className="font-medium text-rtr-ink">
                          {machine.type.replace(/_/g, ' ')}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export type { LayoutMachine as FactoryLayoutMachine, SvgMeta as FactoryLayoutSvgMeta }
