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

export const STATUS_COLORS: Record<Machine['status'] | 'unknown', string> = {
  operational: '#10b981',
  warning: '#f97316',
  critical: '#ef4444',
  maintenance: '#fbbf24',
  offline: '#9ca3af',
  unknown: '#6b7280',
}

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace('#', '')
  const bigint = parseInt(sanitized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
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

      if (!svg.getAttribute('viewBox')) {
        const widthAttr = svg.getAttribute('width')
        const heightAttr = svg.getAttribute('height')
        if (widthAttr && heightAttr) {
          const widthValue = parseFloat(widthAttr)
          const heightValue = parseFloat(heightAttr)
          if (!Number.isNaN(widthValue) && !Number.isNaN(heightValue)) {
            svg.setAttribute('viewBox', `0 0 ${widthValue} ${heightValue}`)
          }
        }
      }

      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      svg.style.width = '100%'
      svg.style.height = 'auto'
      svg.style.display = 'block'

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

        const left = (layout.bbox.x / svgMeta.width) * 100
        const top = (layout.bbox.y / svgMeta.height) * 100
        const width = (layout.bbox.width / svgMeta.width) * 100
        const height = (layout.bbox.height / svgMeta.height) * 100

        return {
          layout,
          machine,
          style: {
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
          },
        }
      })
      .filter(Boolean) as {
      layout: LayoutMachine
      machine: Machine
      style: { left: string; top: string; width: string; height: string }
    }[]
  }, [layoutMachines, machineLookup, svgMeta])

  return (
    <div className="relative w-full rounded-xl border border-rtr-border bg-white">
      <div className="relative">
        <div
          ref={containerRef}
          className="relative max-w-full"
          dangerouslySetInnerHTML={svgMarkup ? { __html: svgMarkup } : undefined}
        />

        {svgMarkup && svgMeta && (
          <div className="pointer-events-none absolute inset-0">
            {overlays.map(({ layout, machine, style }) => {
              const statusColor = STATUS_COLORS[machine.status] ?? STATUS_COLORS.unknown
              const isHovered = hoveredId === layout.id
              const backgroundColor = hexToRgba(statusColor, isHovered ? 0.4 : 0.22)
              const borderColor = hexToRgba(statusColor, 0.7)
              return (
                <div
                  key={layout.id}
                  style={style}
                  className="pointer-events-none absolute"
                >
                  <button
                    className="pointer-events-auto h-full w-full rounded-md border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rtr-wine focus-visible:ring-offset-1"
                    onClick={() => {
                      onMachineClick?.(machine)
                      router.push(`/machines/${machine.id}`)
                    }}
                    onMouseEnter={() => setHoveredId(layout.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-label={`${machine.name} status ${machine.status}`}
                    style={{
                      backgroundColor,
                      borderColor,
                      boxShadow: isHovered ? `0 8px 16px ${hexToRgba(statusColor, 0.25)}` : undefined,
                    }}
                  >
                    <span className="sr-only">{machine.name}</span>
                  </button>

                  {isHovered && (
                    <div className="pointer-events-none absolute left-1/2 top-0 z-10 w-56 -translate-x-1/2 -translate-y-full rounded-lg border border-rtr-border bg-white p-3 text-xs text-rtr-ink shadow-lg">
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
