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
  const svgInitializedRef = useRef(false)
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
  const tooltipHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    if (!svgMarkup || svgInitializedRef.current) return
    const container = containerRef.current
    if (!container) return

    // Set innerHTML only once
    container.innerHTML = svgMarkup
    svgInitializedRef.current = true

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
  }, [svgMarkup, onLayoutMachinesChange])

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
      if (tooltipHideTimeout.current) {
        clearTimeout(tooltipHideTimeout.current)
        tooltipHideTimeout.current = null
      }
    }

    const applyInteractivity = () => {
      const container = containerRef.current
      if (!container) return
      const svg = container.querySelector('svg')
      if (!svg) return

      cleanupInteractions()

      // First pass: Apply colors to all nodes
      layoutMachines.forEach((layout) => {
        const selector = `#${cssEscape(layout.id)}`
        const node = svg.querySelector<SVGGraphicsElement>(selector)
        if (!node) return

        const resolveMachine = () =>
          machineLookup.get(layout.id) ||
          machineLookup.get(layout.id.replace(/_/g, '-')) ||
          machineLookup.get(layout.id.replace(/^EWR\./, ''))

        const machine = resolveMachine()
        if (machine) {
          const statusColor = STATUS_COLORS[machine.status ?? 'unknown'] ?? STATUS_COLORS.unknown
          node.setAttribute('fill', hexToRgba(statusColor, 0.32))
          node.setAttribute('stroke', statusColor)
          node.setAttribute('stroke-width', '3')
        }
      })

      // Second pass: Attach event listeners
      layoutMachines.forEach((layout) => {
        const selector = `#${cssEscape(layout.id)}`
        const node = svg.querySelector<SVGGraphicsElement>(selector)
        if (!node) return

        const resolveMachine = () =>
          machineLookup.get(layout.id) ||
          machineLookup.get(layout.id.replace(/_/g, '-')) ||
          machineLookup.get(layout.id.replace(/^EWR\./, ''))

        const machine = resolveMachine()
        if (!machine) {
          node.style.cursor = ''
          node.removeAttribute('tabindex')
          node.style.pointerEvents = ''
          return
        }

        const statusColor = STATUS_COLORS[machine.status ?? 'unknown'] ?? STATUS_COLORS.unknown

        node.style.cursor = 'pointer'
        node.style.pointerEvents = 'auto'
        node.setAttribute('tabindex', '0')

        const restoreNodeColors = () => {
          node.setAttribute('fill', hexToRgba(statusColor, 0.32))
          node.setAttribute('stroke', statusColor)
          node.setAttribute('stroke-width', '3')
        }

        const handleMouseEnter = (event: MouseEvent) => {
          // Cancel any pending hide timeout immediately
          if (tooltipHideTimeout.current) {
            clearTimeout(tooltipHideTimeout.current)
            tooltipHideTimeout.current = null
          }

          const svgRect = container.getBoundingClientRect()
          const nodeRect = node.getBoundingClientRect()
          
          // Position tooltip at center of box (or mouse position if within bounds)
          const mouseX = event.clientX - svgRect.left
          const mouseY = event.clientY - svgRect.top
          const nodeLeft = nodeRect.left - svgRect.left
          const nodeTop = nodeRect.top - svgRect.top
          const centerX = nodeLeft + nodeRect.width / 2
          const centerY = nodeTop + nodeRect.height / 2
          
          // Use mouse position if it's within the node, otherwise use center
          const isMouseInNode = 
            mouseX >= nodeLeft && 
            mouseX <= nodeLeft + nodeRect.width &&
            mouseY >= nodeTop && 
            mouseY <= nodeTop + nodeRect.height
          
          const x = isMouseInNode ? mouseX : centerX
          const y = isMouseInNode ? mouseY : centerY

          // Only modify the hovered node
          node.setAttribute('stroke-width', '4')
          node.setAttribute('fill', hexToRgba(statusColor, 0.5))

          setTooltip({
            machine,
            x,
            y,
            color: statusColor,
          })
        }

        const handleMouseLeave = (event: MouseEvent) => {
          // Restore the hovered node's colors
          restoreNodeColors()

          // Check if we're moving to the tooltip by checking relatedTarget
          const relatedTarget = event.relatedTarget as Element | null
          if (relatedTarget) {
            const tooltipElement = relatedTarget.closest('[data-tooltip]')
            if (tooltipElement) {
              // Moving to tooltip, don't hide - tooltip will handle its own mouseleave
              return
            }
          }

          // Clear any pending timeout
          if (tooltipHideTimeout.current) {
            clearTimeout(tooltipHideTimeout.current)
            tooltipHideTimeout.current = null
          }

          // Hide tooltip after a short delay to allow moving to tooltip
          tooltipHideTimeout.current = setTimeout(() => {
            setTooltip((current) => {
              // Only hide if it's still for this machine
              if (current && current.machine.id === machine.id) {
                return null
              }
              return current
            })
            tooltipHideTimeout.current = null
          }, 200)
        }

        const handleFocus = () => {
          // Cancel any pending hide timeout immediately
          if (tooltipHideTimeout.current) {
            clearTimeout(tooltipHideTimeout.current)
            tooltipHideTimeout.current = null
          }

          const svgRect = container.getBoundingClientRect()
          const nodeRect = node.getBoundingClientRect()
          const nodeLeft = nodeRect.left - svgRect.left
          const nodeTop = nodeRect.top - svgRect.top
          const centerX = nodeLeft + nodeRect.width / 2
          const centerY = nodeTop + nodeRect.height / 2

          // Only modify the hovered node
          node.setAttribute('stroke-width', '4')
          node.setAttribute('fill', hexToRgba(statusColor, 0.5))

          setTooltip({
            machine,
            x: centerX,
            y: centerY,
            color: statusColor,
          })
        }

        const handleBlur = () => {
          // Restore the hovered node's colors
          restoreNodeColors()

          // Clear any pending timeout
          if (tooltipHideTimeout.current) {
            clearTimeout(tooltipHideTimeout.current)
            tooltipHideTimeout.current = null
          }

          // Hide tooltip immediately on blur
          setTooltip((current) => {
            if (current && current.machine.id === machine.id) {
              return null
            }
            return current
          })
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
        node.addEventListener('focus', handleFocus)
        node.addEventListener('blur', handleBlur)
        node.addEventListener('click', handleClick)
        node.addEventListener('keydown', handleKeyDown)

        interactionCleanups.current.push(() => {
          node.removeEventListener('mouseenter', handleMouseEnter)
          node.removeEventListener('mouseleave', handleMouseLeave)
          node.removeEventListener('focus', handleFocus)
          node.removeEventListener('blur', handleBlur)
          node.removeEventListener('click', handleClick)
          node.removeEventListener('keydown', handleKeyDown)
          // Restore colors on cleanup
          restoreNodeColors()
        })
      })
    }

    applyInteractivity()

    return () => {
      cleanupInteractions()
    }
  }, [layoutMachines, machineLookup, onMachineClick, router])

  return (
    <div className="relative w-full rounded-xl border border-rtr-border bg-white">
      <div className="relative">
        <div
          ref={containerRef}
          className="relative max-w-full overflow-hidden"
        />
        {tooltip && (
          <div
            data-tooltip
            className="absolute z-10 w-56 -translate-x-full rounded-lg border border-rtr-border bg-white p-3 text-xs text-rtr-ink shadow-lg pointer-events-auto"
            style={{
              left: `${tooltip.x}px`,
              top: `${Math.max(tooltip.y, 16)}px`,
              opacity: 0.9,
            }}
            onMouseEnter={() => {
              // Cancel any pending hide timeout
              if (tooltipHideTimeout.current) {
                clearTimeout(tooltipHideTimeout.current)
                tooltipHideTimeout.current = null
              }
            }}
            onMouseLeave={() => {
              // Hide tooltip when leaving it
              if (tooltipHideTimeout.current) {
                clearTimeout(tooltipHideTimeout.current)
              }
              setTooltip(null)
              tooltipHideTimeout.current = null
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
            <button
              type="button"
              className="mt-3 w-full rounded-md bg-rtr-wine px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rtr-wine/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rtr-wine/70"
              onClick={() => router.push(`/machines/${tooltip.machine.id}`)}
            >
              View machine details
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export type { LayoutMachine as FactoryLayoutMachine, SvgMeta as FactoryLayoutSvgMeta }
