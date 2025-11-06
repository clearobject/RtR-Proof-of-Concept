'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Machine } from '@/lib/types'

interface FactoryLayoutProps {
  machines: Machine[]
  onMachineClick?: (machine: Machine) => void
}

export function FactoryLayout({ machines, onMachineClick }: FactoryLayoutProps) {
  const router = useRouter()
  const [hoveredMachine, setHoveredMachine] = useState<string | null>(null)

  // Define zones layout (simplified grid layout)
  const zones = [
    { name: 'Inbound', x: 0, y: 0, width: 200, height: 150 },
    { name: 'Tagging', x: 220, y: 0, width: 200, height: 150 },
    { name: 'Wet Cleaning', x: 0, y: 170, width: 300, height: 200 },
    { name: 'Dry Clean & Spotting', x: 320, y: 170, width: 300, height: 200 },
    { name: 'QC', x: 640, y: 0, width: 150, height: 150 },
    { name: 'Pressing', x: 640, y: 170, width: 200, height: 200 },
    { name: 'Bagging', x: 860, y: 0, width: 150, height: 370 },
  ]

  const getStatusColorClass = (status: Machine['status']) => {
    const colors = {
      operational: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500',
      maintenance: 'bg-blue-500',
      offline: 'bg-gray-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-auto">
      <svg
        viewBox="0 0 1020 400"
        className="w-full h-full min-h-[400px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Zone backgrounds */}
        {zones.map((zone) => (
          <g key={zone.name}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="2"
              rx="4"
            />
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + 20}
              textAnchor="middle"
              className="text-xs font-semibold fill-gray-700"
            >
              {zone.name}
            </text>
          </g>
        ))}

        {/* Machine tiles */}
        {machines.map((machine) => {
          if (!machine.coordinates) return null
          const { x, y } = machine.coordinates as { x: number; y: number }
          const isHovered = hoveredMachine === machine.id

          return (
            <g
              key={machine.id}
              className="cursor-pointer"
              onClick={() => {
                onMachineClick?.(machine)
                router.push(`/machines/${machine.id}`)
              }}
              onMouseEnter={() => setHoveredMachine(machine.id)}
              onMouseLeave={() => setHoveredMachine(null)}
            >
              {/* Machine tile */}
              <rect
                x={x - 20}
                y={y - 15}
                width="40"
                height="30"
                fill={getStatusColorClass(machine.status)}
                stroke={isHovered ? '#000' : '#fff'}
                strokeWidth={isHovered ? 2 : 1}
                rx="4"
                opacity={isHovered ? 1 : 0.9}
              />
              {/* Machine label */}
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                className="text-xs font-medium fill-white pointer-events-none"
              >
                {machine.name.split('-')[1] || machine.name}
              </text>
              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={x + 25}
                    y={y - 30}
                    width="120"
                    height="60"
                    fill="white"
                    stroke="#000"
                    strokeWidth="1"
                    rx="4"
                    opacity="0.95"
                  />
                  <text
                    x={x + 30}
                    y={y - 10}
                    className="text-xs font-semibold fill-gray-900"
                  >
                    {machine.name}
                  </text>
                  <text
                    x={x + 30}
                    y={y + 5}
                    className="text-xs fill-gray-600"
                  >
                    Status: {machine.status}
                  </text>
                  <text
                    x={x + 30}
                    y={y + 20}
                    className="text-xs fill-gray-600"
                  >
                    Zone: {machine.zone}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

