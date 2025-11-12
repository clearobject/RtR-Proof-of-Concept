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

const cssEscape = (value: string) => {
  if (typeof window !== 'undefined' && window.CSS?.escape) {
    return window.CSS.escape(value)
  }

  return value.replace(/([^\w-])/g, '\\$1')
}

export interface MachineWithAlert extends Machine {
  alertSeverity?: string | null
}

interface FactoryLayoutProps {
  machines: MachineWithAlert[]
  onMachineClick?: (machine: MachineWithAlert) => void
  onLayoutMachinesChange?: (machines: LayoutMachine[], meta: SvgMeta) => void
}

export function FactoryLayout({ machines, onMachineClick, onLayoutMachinesChange }: FactoryLayoutProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null)
  const [layoutMachines, setLayoutMachines] = useState<LayoutMachine[]>([])
  const [svgMeta, setSvgMeta] = useState<SvgMeta | null>(null)
  const [tooltip, setTooltip] = useState<{
    machine: MachineWithAlert
    x: number
    y: number
    color: string
  } | null>(null)
  const interactionCleanups = useRef<(() => void)[]>([])

  useEffect(() => {
    let isMounted = true

    const loadSvg = async () => {
      try {
        const response = await fetch(SVG_PATH)
        if (!response.ok) throw new Error(`Failed to load SVG: ${response.status}`)
        const raw = await response.text()
        const sanitized = raw.replace(/<svg([\s\S]*?)>/, (match, attrs) => {
          const withoutDimensions = attrs.replace(/\s(width|height)="[^"]*"/g, '')
          return `<svg${withoutDimensions}>`
        })
        if (isMounted) {
          setSvgMarkup(sanitized)
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
          const numericMatch = /^\d+/.exec(widthAttr)
          const widthValue = numericMatch ? parseFloat(numericMatch[0]) : NaN
          const heightMatch = /^\d+/.exec(heightAttr)
          const heightValue = heightMatch ? parseFloat(heightMatch[0]) : NaN
          if (!Number.isNaN(widthValue) && !Number.isNaN(heightValue)) {
            svg.setAttribute('viewBox', `0 0 ${widthValue} ${heightValue}`)
          }
        }
      }

      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      svg.setAttribute('width', '100%')
      svg.setAttribute('height', 'auto')
      svg.style.width = '100%'
      svg.style.height = 'auto'
      svg.style.maxWidth = '100%'
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
    const map = new Map<string, MachineWithAlert>()
    machines.forEach((machine) => {
      if (machine.asset_alias) {
        map.set(machine.asset_alias, machine)
      }
      map.set(machine.id, machine)
    })
    return map
  }, [machines])

  useEffect(() => {
    const cleanupInteractions = () => {
      interactionCleanups.current.forEach((cleanup) => cleanup())
      interactionCleanups.current = []
      setTooltip(null)
    }

    const applyInteractivity = () => {
      const container = containerRef.current
      if (!container) return
      const svg = container.querySelector('svg')
      if (!svg) return

      cleanupInteractions()

      layoutMachines.forEach((layout) => {
        const selector = `#${cssEscape(layout.id)}`
        const node = svg.querySelector<SVGGraphicsElement>(selector)
        if (!node) return

        const machine =
          machineLookup.get(layout.id) ||
          machineLookup.get(layout.id.replace(/_/g, '-')) ||
          machineLookup.get(layout.id.replace(/^EWR\./, ''))

        const originalFillAttr = node.getAttribute('data-original-fill')
        const originalStrokeAttr = node.getAttribute('data-original-stroke')
        if (!originalFillAttr) {
          node.setAttribute('data-original-fill', node.getAttribute('fill') ?? '')
        }
        if (!originalStrokeAttr) {
          node.setAttribute('data-original-stroke', node.getAttribute('stroke') ?? '')
        }

        if (!machine) {
          const originalFill = node.getAttribute('data-original-fill')
          const originalStroke = node.getAttribute('data-original-stroke')
          if (originalFill !== null) {
            if (originalFill === '') node.removeAttribute('fill')
            else node.setAttribute('fill', originalFill)
          }
          if (originalStroke !== null) {
            if (originalStroke === '') node.removeAttribute('stroke')
            else node.setAttribute('stroke', originalStroke)
          }
          node.removeAttribute('stroke-width')
          node.style.cursor = ''
          node.removeAttribute('tabindex')
          return
        }

        const statusColor = STATUS_COLORS[machine.status] ?? STATUS_COLORS.unknown
        node.setAttribute('fill', hexToRgba(statusColor, 0.32))
        node.setAttribute('stroke', statusColor)
        node.setAttribute('stroke-width', '3')
        node.style.cursor = 'pointer'
        node.style.pointerEvents = 'auto'
        node.setAttribute('tabindex', '0')

        const handleMouseEnter = () => {
          const svgRect = container.getBoundingClientRect()
          const nodeRect = node.getBoundingClientRect()
          const x = nodeRect.left - svgRect.left + nodeRect.width / 2
          const y = nodeRect.top - svgRect.top - 8

          node.setAttribute('stroke-width', '4')
          node.setAttribute('fill', hexToRgba(statusColor, 0.45))

          setTooltip({
            machine,
            x,
            y,
            color: statusColor,
          })
        }

        const handleMouseLeave = () => {
          node.setAttribute('stroke-width', '3')
          node.setAttribute('fill', hexToRgba(statusColor, 0.32))
          setTooltip(null)
        }

        const handleClick = () => {
          onMachineClick?.(machine)
          router.push(`/machines/${machine.id}`)
        }

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
          }
        }

        node.addEventListener('mouseenter', handleMouseEnter)
        node.addEventListener('mouseleave', handleMouseLeave)
        node.addEventListener('focus', handleMouseEnter)
        node.addEventListener('blur', handleMouseLeave)
        node.addEventListener('click', handleClick)
        node.addEventListener('keydown', handleKeyDown)

        interactionCleanups.current.push(() => {
          node.removeEventListener('mouseenter', handleMouseEnter)
          node.removeEventListener('mouseleave', handleMouseLeave)
          node.removeEventListener('focus', handleMouseEnter)
          node.removeEventListener('blur', handleMouseLeave)
          node.removeEventListener('click', handleClick)
          node.removeEventListener('keydown', handleKeyDown)
          const originalFill = node.getAttribute('data-original-fill')
          const originalStroke = node.getAttribute('data-original-stroke')
          if (originalFill !== null) {
            if (originalFill === '') node.removeAttribute('fill')
            else node.setAttribute('fill', originalFill)
          }
          if (originalStroke !== null) {
            if (originalStroke === '') node.removeAttribute('stroke')
            else node.setAttribute('stroke', originalStroke)
          }
          node.removeAttribute('stroke-width')
          node.style.cursor = ''
          node.removeAttribute('tabindex')
        })
      })
    }

    applyInteractivity()

    return () => {
      cleanupInteractions()
    }
  }, [layoutMachines, machineLookup, onMachineClick, router, svgMarkup])

  return (
    <div className="relative w-full rounded-xl border border-rtr-border bg-white">
      <div className="relative">
        <div
          ref={containerRef}
          className="relative max-w-full overflow-hidden"
          dangerouslySetInnerHTML={svgMarkup ? { __html: svgMarkup } : undefined}
        />
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-3 rounded-lg border border-rtr-border bg-white p-3 text-xs text-rtr-ink shadow-lg"
            style={{
              left: `${tooltip.x}px`,
              top: `${Math.max(tooltip.y, 16)}px`,
            }}
          >
            <p className="font-medium text-rtr-ink">{tooltip.machine.name}</p>
            <p className="mt-1 text-rtr-slate">
              Status:{' '}
              <span className="font-medium capitalize text-rtr-ink">{tooltip.machine.status}</span>
            </p>
            {tooltip.machine.zone && (
              <p className="text-rtr-slate">
                Zone: <span className="font-medium text-rtr-ink">{tooltip.machine.zone}</span>
              </p>
            )}
            <p className="text-rtr-slate">
              Type:{' '}
              <span className="font-medium text-rtr-ink">
                {tooltip.machine.type.replace(/_/g, ' ')}
              </span>
            </p>
            {tooltip.machine.alertSeverity && (
              <p className="mt-1 text-rtr-slate">
                Active Alert:{' '}
                <span className="font-semibold uppercase" style={{ color: tooltip.color }}>
                  {tooltip.machine.alertSeverity}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export type { LayoutMachine as FactoryLayoutMachine, SvgMeta as FactoryLayoutSvgMeta }
