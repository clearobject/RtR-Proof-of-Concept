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
  Active: '#10b981',
  Warning: '#f97316',
  Critical: '#ef4444',
  Maintenance: '#fbbf24',
  Offline: '#9ca3af',
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
    transformX?: string
    transformY?: string
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

      // First pass: Apply colors to all nodes and hide filtered-out machines
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
          node.style.opacity = '1'
          node.style.visibility = 'visible'
        } else {
          // Hide machines that are not in the filtered list
          node.style.opacity = '0.2'
          node.style.visibility = 'visible'
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
          node.style.pointerEvents = 'none'
          node.style.opacity = '0.2'
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
          
          // Get the parent container (the div with relative positioning that contains the tooltip)
          const parentContainer = container.parentElement
          if (!parentContainer) return
          const parentRect = parentContainer.getBoundingClientRect()
          
          // Calculate SVG container bounds relative to parent (for constraint checking)
          const svgLeftInParent = svgRect.left - parentRect.left
          const svgTopInParent = svgRect.top - parentRect.top
          const svgRightInParent = svgLeftInParent + svgRect.width
          const svgBottomInParent = svgTopInParent + svgRect.height
          
          // Position tooltip at center of box (or mouse position if within bounds)
          // Calculate relative to parent container (tooltip's positioning context)
          const mouseX = event.clientX - parentRect.left
          const mouseY = event.clientY - parentRect.top
          const nodeLeft = nodeRect.left - parentRect.left
          const nodeTop = nodeRect.top - parentRect.top
          const centerX = nodeLeft + nodeRect.width / 2
          const centerY = nodeTop + nodeRect.height / 2
          
          // Use mouse position if it's within the node, otherwise use center
          const isMouseInNode = 
            mouseX >= nodeLeft && 
            mouseX <= nodeLeft + nodeRect.width &&
            mouseY >= nodeTop && 
            mouseY <= nodeTop + nodeRect.height
          
          const anchorX = isMouseInNode ? mouseX : centerX
          const anchorY = isMouseInNode ? mouseY : centerY

          // Tooltip dimensions (approximate)
          const tooltipWidth = 224 // w-56 = 14rem = 224px
          const tooltipHeight = 200 // approximate height
          const padding = 16 // minimum padding from container edge

          // Check available space relative to SVG container bounds (the visible area)
          // Constrain to SVG container, not the full parent div
          const containerSpaceRight = svgRightInParent - anchorX - padding
          const containerSpaceLeft = anchorX - svgLeftInParent - padding
          const containerSpaceBottom = svgBottomInParent - anchorY - padding
          const containerSpaceTop = anchorY - svgTopInParent - padding

          // Determine best position: try each corner and pick the one that fits best
          // Priority: top-right > top-left > bottom-right > bottom-left
          let x = anchorX
          let y = anchorY
          let transformX = '-100%' // top-right: tooltip's right edge at anchor
          let transformY = '0' // top-right: tooltip's top edge at anchor

          // Check if top-right fits within container
          if (containerSpaceRight >= tooltipWidth && containerSpaceTop >= tooltipHeight) {
            // Top-right fits perfectly
            transformX = '-100%'
            transformY = '0'
          }
          // Check if top-left fits within container
          else if (containerSpaceLeft >= tooltipWidth && containerSpaceTop >= tooltipHeight) {
            // Top-left fits
            transformX = '0'
            transformY = '0'
          }
          // Check if bottom-right fits within container
          else if (containerSpaceRight >= tooltipWidth && containerSpaceBottom >= tooltipHeight) {
            // Bottom-right fits
            transformX = '-100%'
            transformY = '-100%'
          }
          // Check if bottom-left fits within container
          else if (containerSpaceLeft >= tooltipWidth && containerSpaceBottom >= tooltipHeight) {
            // Bottom-left fits
            transformX = '0'
            transformY = '-100%'
          }
          // None fit perfectly, choose the position with the most available space
          else {
            const positions = [
              { name: 'top-right', transformX: '-100%', transformY: '0', score: Math.min(containerSpaceRight, containerSpaceTop) },
              { name: 'top-left', transformX: '0', transformY: '0', score: Math.min(containerSpaceLeft, containerSpaceTop) },
              { name: 'bottom-right', transformX: '-100%', transformY: '-100%', score: Math.min(containerSpaceRight, containerSpaceBottom) },
              { name: 'bottom-left', transformX: '0', transformY: '-100%', score: Math.min(containerSpaceLeft, containerSpaceBottom) },
            ]
            
            // Sort by score (highest first) and pick the best
            positions.sort((a, b) => b.score - a.score)
            const bestPosition = positions[0]
            transformX = bestPosition.transformX
            transformY = bestPosition.transformY
            
            // Adjust position to keep tooltip within SVG container bounds
            if (transformX === '-100%' && containerSpaceRight < tooltipWidth) {
              // Tooltip extends beyond right edge, shift left
              const neededSpace = tooltipWidth - containerSpaceRight
              x = Math.max(svgLeftInParent + padding, anchorX - neededSpace)
            } else if (transformX === '0' && containerSpaceLeft < tooltipWidth) {
              // Tooltip extends beyond left edge, shift right
              const neededSpace = tooltipWidth - containerSpaceLeft
              x = Math.min(svgRightInParent - tooltipWidth - padding, anchorX + neededSpace)
            }
            
            if (transformY === '0' && containerSpaceTop < tooltipHeight) {
              // Tooltip extends beyond top edge, shift down
              const neededSpace = tooltipHeight - containerSpaceTop
              y = Math.max(svgTopInParent + padding, anchorY + neededSpace)
            } else if (transformY === '-100%' && containerSpaceBottom < tooltipHeight) {
              // Tooltip extends beyond bottom edge, shift up
              const neededSpace = tooltipHeight - containerSpaceBottom
              y = Math.max(svgTopInParent + padding, anchorY - neededSpace)
            }
          }
          
          // Final clamp to ensure tooltip stays within SVG container bounds
          // Account for transform offset - calculate actual tooltip bounds
          const minX = svgLeftInParent + padding
          const maxX = svgRightInParent - padding
          const minY = svgTopInParent + padding
          const maxY = svgBottomInParent - padding
          
          // Calculate where tooltip edges actually are based on transform
          let tooltipActualLeft = x
          let tooltipActualRight = x
          let tooltipActualTop = y
          let tooltipActualBottom = y
          
          if (transformX === '-100%') {
            tooltipActualLeft = x - tooltipWidth
            tooltipActualRight = x
          } else {
            tooltipActualLeft = x
            tooltipActualRight = x + tooltipWidth
          }
          
          if (transformY === '-100%') {
            tooltipActualTop = y - tooltipHeight
            tooltipActualBottom = y
          } else {
            tooltipActualTop = y
            tooltipActualBottom = y + tooltipHeight
          }
          
          // Adjust x to keep tooltip within bounds
          if (tooltipActualLeft < minX) {
            const offset = minX - tooltipActualLeft
            x += offset
          } else if (tooltipActualRight > maxX) {
            const offset = tooltipActualRight - maxX
            x -= offset
          }
          
          // Adjust y to keep tooltip within bounds
          if (tooltipActualTop < minY) {
            const offset = minY - tooltipActualTop
            y += offset
          } else if (tooltipActualBottom > maxY) {
            const offset = tooltipActualBottom - maxY
            y -= offset
          }
          
          // Final safety clamp on anchor point itself
          if (transformX === '-100%') {
            x = Math.max(minX + tooltipWidth, Math.min(x, maxX))
          } else {
            x = Math.max(minX, Math.min(x, maxX - tooltipWidth))
          }
          
          if (transformY === '-100%') {
            y = Math.max(minY + tooltipHeight, Math.min(y, maxY))
          } else {
            y = Math.max(minY, Math.min(y, maxY - tooltipHeight))
          }

          // Only modify the hovered node
          node.setAttribute('stroke-width', '4')
          node.setAttribute('fill', hexToRgba(statusColor, 0.5))

          setTooltip({
            machine,
            x,
            y,
            color: statusColor,
            transformX,
            transformY,
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
          
          // Get the parent container (the div with relative positioning that contains the tooltip)
          const parentContainer = container.parentElement
          if (!parentContainer) return
          const parentRect = parentContainer.getBoundingClientRect()
          
          // Calculate SVG container bounds relative to parent (for constraint checking)
          const svgLeftInParent = svgRect.left - parentRect.left
          const svgTopInParent = svgRect.top - parentRect.top
          const svgRightInParent = svgLeftInParent + svgRect.width
          const svgBottomInParent = svgTopInParent + svgRect.height
          
          // Calculate relative to parent container (tooltip's positioning context)
          const nodeLeft = nodeRect.left - parentRect.left
          const nodeTop = nodeRect.top - parentRect.top
          const centerX = nodeLeft + nodeRect.width / 2
          const centerY = nodeTop + nodeRect.height / 2

          // Tooltip dimensions (approximate)
          const tooltipWidth = 224 // w-56 = 14rem = 224px
          const tooltipHeight = 200 // approximate height
          const padding = 16 // minimum padding from container edge

          // Check available space relative to SVG container bounds (the visible area)
          // Constrain to SVG container, not the full parent div
          const containerSpaceRight = svgRightInParent - centerX - padding
          const containerSpaceLeft = centerX - svgLeftInParent - padding
          const containerSpaceBottom = svgBottomInParent - centerY - padding
          const containerSpaceTop = centerY - svgTopInParent - padding

          // Determine best position: try each corner and pick the one that fits best
          let x = centerX
          let y = centerY
          let transformX = '-100%' // top-right: tooltip's right edge at anchor
          let transformY = '0' // top-right: tooltip's top edge at anchor

          // Check if top-right fits within container
          if (containerSpaceRight >= tooltipWidth && containerSpaceTop >= tooltipHeight) {
            // Top-right fits perfectly
            transformX = '-100%'
            transformY = '0'
          }
          // Check if top-left fits within container
          else if (containerSpaceLeft >= tooltipWidth && containerSpaceTop >= tooltipHeight) {
            // Top-left fits
            transformX = '0'
            transformY = '0'
          }
          // Check if bottom-right fits within container
          else if (containerSpaceRight >= tooltipWidth && containerSpaceBottom >= tooltipHeight) {
            // Bottom-right fits
            transformX = '-100%'
            transformY = '-100%'
          }
          // Check if bottom-left fits within container
          else if (containerSpaceLeft >= tooltipWidth && containerSpaceBottom >= tooltipHeight) {
            // Bottom-left fits
            transformX = '0'
            transformY = '-100%'
          }
          // None fit perfectly, choose the position with the most available space
          else {
            const positions = [
              { name: 'top-right', transformX: '-100%', transformY: '0', score: Math.min(containerSpaceRight, containerSpaceTop) },
              { name: 'top-left', transformX: '0', transformY: '0', score: Math.min(containerSpaceLeft, containerSpaceTop) },
              { name: 'bottom-right', transformX: '-100%', transformY: '-100%', score: Math.min(containerSpaceRight, containerSpaceBottom) },
              { name: 'bottom-left', transformX: '0', transformY: '-100%', score: Math.min(containerSpaceLeft, containerSpaceBottom) },
            ]
            
            // Sort by score (highest first) and pick the best
            positions.sort((a, b) => b.score - a.score)
            const bestPosition = positions[0]
            transformX = bestPosition.transformX
            transformY = bestPosition.transformY
            
            // Adjust position to keep tooltip within SVG container bounds
            if (transformX === '-100%' && containerSpaceRight < tooltipWidth) {
              // Tooltip extends beyond right edge, shift left
              const neededSpace = tooltipWidth - containerSpaceRight
              x = Math.max(svgLeftInParent + padding, centerX - neededSpace)
            } else if (transformX === '0' && containerSpaceLeft < tooltipWidth) {
              // Tooltip extends beyond left edge, shift right
              const neededSpace = tooltipWidth - containerSpaceLeft
              x = Math.min(svgRightInParent - tooltipWidth - padding, centerX + neededSpace)
            }
            
            if (transformY === '0' && containerSpaceTop < tooltipHeight) {
              // Tooltip extends beyond top edge, shift down
              const neededSpace = tooltipHeight - containerSpaceTop
              y = Math.max(svgTopInParent + padding, centerY + neededSpace)
            } else if (transformY === '-100%' && containerSpaceBottom < tooltipHeight) {
              // Tooltip extends beyond bottom edge, shift up
              const neededSpace = tooltipHeight - containerSpaceBottom
              y = Math.max(svgTopInParent + padding, centerY - neededSpace)
            }
          }
          
          // Final clamp to ensure tooltip stays within SVG container bounds
          // Account for transform offset - calculate actual tooltip bounds
          const minX = svgLeftInParent + padding
          const maxX = svgRightInParent - padding
          const minY = svgTopInParent + padding
          const maxY = svgBottomInParent - padding
          
          // Calculate where tooltip edges actually are based on transform
          let tooltipActualLeft = x
          let tooltipActualRight = x
          let tooltipActualTop = y
          let tooltipActualBottom = y
          
          if (transformX === '-100%') {
            tooltipActualLeft = x - tooltipWidth
            tooltipActualRight = x
          } else {
            tooltipActualLeft = x
            tooltipActualRight = x + tooltipWidth
          }
          
          if (transformY === '-100%') {
            tooltipActualTop = y - tooltipHeight
            tooltipActualBottom = y
          } else {
            tooltipActualTop = y
            tooltipActualBottom = y + tooltipHeight
          }
          
          // Adjust x to keep tooltip within bounds
          if (tooltipActualLeft < minX) {
            const offset = minX - tooltipActualLeft
            x += offset
          } else if (tooltipActualRight > maxX) {
            const offset = tooltipActualRight - maxX
            x -= offset
          }
          
          // Adjust y to keep tooltip within bounds
          if (tooltipActualTop < minY) {
            const offset = minY - tooltipActualTop
            y += offset
          } else if (tooltipActualBottom > maxY) {
            const offset = tooltipActualBottom - maxY
            y -= offset
          }
          
          // Final safety clamp on anchor point itself
          if (transformX === '-100%') {
            x = Math.max(minX + tooltipWidth, Math.min(x, maxX))
          } else {
            x = Math.max(minX, Math.min(x, maxX - tooltipWidth))
          }
          
          if (transformY === '-100%') {
            y = Math.max(minY + tooltipHeight, Math.min(y, maxY))
          } else {
            y = Math.max(minY, Math.min(y, maxY - tooltipHeight))
          }

          // Only modify the hovered node
          node.setAttribute('stroke-width', '4')
          node.setAttribute('fill', hexToRgba(statusColor, 0.5))

          setTooltip({
            machine,
            x,
            y,
            color: statusColor,
            transformX,
            transformY,
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
          // Route to assets page using asset_alias or id
          const assetAlias = machine.asset_alias || machine.id
          router.push(`/assets/${assetAlias}`)
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
            className="absolute z-10 w-56 rounded-lg border border-rtr-border bg-white p-3 text-xs text-rtr-ink shadow-lg pointer-events-auto"
            style={{
              left: `${tooltip.x}px`,
              top: `${Math.max(tooltip.y, 16)}px`,
              opacity: 0.9,
              transform: `translate(${tooltip.transformX || '-100%'}, ${tooltip.transformY || '0'})`,
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
              onClick={() => {
                const assetAlias = tooltip.machine.asset_alias || tooltip.machine.id
                router.push(`/assets/${assetAlias}`)
              }}
            >
              View asset details
            </button>
            </div>
          )}
      </div>
    </div>
  )
}

export type { LayoutMachine as FactoryLayoutMachine, SvgMeta as FactoryLayoutSvgMeta }
