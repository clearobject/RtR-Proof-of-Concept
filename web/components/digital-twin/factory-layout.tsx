'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Machine } from '@/lib/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface FactoryLayoutProps {
  machines: Machine[]
  onMachineClick?: (machine: Machine) => void
}

export function FactoryLayout({ machines, onMachineClick }: FactoryLayoutProps) {
  const router = useRouter()
  const [hoveredMachine, setHoveredMachine] = useState<string | null>(null)

  // Define zones based on actual plant layout (scaled to fit SVG viewBox)
  // Layout dimensions: approximately 1400x800 units
  const zones = [
    // Left side - vertical zones
    { name: 'STEP 1 INBOUND', x: 0, y: 0, width: 180, height: 120, fill: '#e5e7eb' },
    { name: 'WET CLEANING', x: 0, y: 130, width: 180, height: 200, fill: '#dbeafe' },
    { name: 'RFID TAGGING', x: 0, y: 340, width: 180, height: 100, fill: '#f3f4f6' },
    { name: 'DRY CLEAN & SPOTTING', x: 0, y: 450, width: 180, height: 200, fill: '#fef3c7' },
    { name: 'QUALITY CONTROL', x: 0, y: 660, width: 180, height: 140, fill: '#d1fae5' },
    
    // Center-left
    { name: 'STAGING AREA', x: 200, y: 0, width: 200, height: 150, fill: '#e0e7ff' },
    { name: 'BOILER ROOM', x: 200, y: 160, width: 200, height: 100, fill: '#f3f4f6' },
    { name: 'SOAP ROOM', x: 200, y: 270, width: 100, height: 80, fill: '#f3f4f6' },
    { name: 'WET CLEANING', x: 200, y: 360, width: 200, height: 250, fill: '#dbeafe' },
    { name: 'PRESSING', x: 200, y: 620, width: 200, height: 180, fill: '#fce7f3' },
    
    // Center-right
    { name: 'AGV', x: 420, y: 0, width: 150, height: 100, fill: '#e0e7ff' },
    { name: 'INWATEC', x: 420, y: 110, width: 200, height: 180, fill: '#e5e7eb' },
    { name: 'INDUSTRIAL WASTE', x: 420, y: 300, width: 150, height: 80, fill: '#e0e7ff' },
    { name: 'FACILITIES', x: 420, y: 390, width: 150, height: 80, fill: '#e0e7ff' },
    { name: 'RFID HANGING', x: 420, y: 480, width: 200, height: 180, fill: '#f3f4f6' },
    { name: 'DRYCLEAN', x: 420, y: 670, width: 200, height: 130, fill: '#fef3c7' },
    
    // Right side
    { name: 'QUALITY CONTROL', x: 640, y: 480, width: 200, height: 180, fill: '#d1fae5' },
    { name: 'QC-ACCS', x: 640, y: 670, width: 200, height: 130, fill: '#d1fae5' },
    { name: 'BAGGING', x: 860, y: 0, width: 120, height: 800, fill: '#fce7f3' },
  ]

  // Status color mapping (matching the legend from the image)
  const getStatusColor = (status: Machine['status']) => {
    const colors = {
      operational: '#10b981', // Green - Running - No Issue
      warning: '#f97316',      // Orange - Warning - Trending Issue
      critical: '#ef4444',     // Red - Critical
      maintenance: '#ffffff',   // White - Not Running
      offline: '#9ca3af',      // Gray - Not Running
    }
    return colors[status] || '#9ca3af'
  }

  const getStatusBorderColor = (status: Machine['status']) => {
    if (status === 'maintenance' || status === 'offline') {
      return '#d1d5db' // Gray border for white/gray items
    }
    return '#ffffff' // White border for colored items
  }

  // Calculate status summary for pie chart
  const statusSummary = useMemo(() => {
    const summary = {
      operational: machines.filter((m) => m.status === 'operational').length,
      warning: machines.filter((m) => m.status === 'warning').length,
      critical: machines.filter((m) => m.status === 'critical').length,
      notRunning: machines.filter((m) => m.status === 'maintenance' || m.status === 'offline').length,
    }
    const total = machines.length || 1
    return [
      { name: 'Running - No Issue', value: summary.operational, color: '#10b981' },
      { name: 'Warning - Trending Issue', value: summary.warning, color: '#f97316' },
      { name: 'Critical', value: summary.critical, color: '#ef4444' },
      { name: 'Not Running', value: summary.notRunning, color: '#ffffff' },
    ].filter((item) => item.value > 0)
  }, [machines])

  // Group machines by zone for better organization
  const machinesByZone = useMemo(() => {
    const grouped: Record<string, Machine[]> = {}
    machines.forEach((machine) => {
      if (!grouped[machine.zone]) {
        grouped[machine.zone] = []
      }
      grouped[machine.zone].push(machine)
    })
    return grouped
  }, [machines])

  return (
    <div className="relative w-full bg-white rounded-lg overflow-hidden">
      <div className="flex">
        {/* Main Layout */}
        <div className="flex-1 relative bg-gray-50 rounded-lg overflow-auto">
          <svg
            viewBox="0 0 1000 800"
            className="w-full h-full min-h-[600px]"
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
                  fill={zone.fill}
                  stroke="#9ca3af"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + 15}
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-gray-700"
                  style={{ fontSize: '10px' }}
                >
                  {zone.name}
                </text>
              </g>
            ))}

            {/* Machine tiles - positioned by coordinates */}
            {machines.map((machine) => {
              if (!machine.coordinates) return null
              const { x, y } = machine.coordinates as { x: number; y: number }
              const isHovered = hoveredMachine === machine.id
              const statusColor = getStatusColor(machine.status)
              const borderColor = getStatusBorderColor(machine.status)

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
                  {/* Machine tile - small rectangle like in the image */}
                  <rect
                    x={x - 12}
                    y={y - 8}
                    width="24"
                    height="16"
                    fill={statusColor}
                    stroke={borderColor}
                    strokeWidth={isHovered ? 2 : 1}
                    rx="2"
                    opacity={isHovered ? 1 : 0.95}
                  />
                  
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x + 15}
                        y={y - 40}
                        width="140"
                        height="70"
                        fill="white"
                        stroke="#000"
                        strokeWidth="1.5"
                        rx="4"
                        opacity="0.98"
                        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={x + 22}
                        y={y - 20}
                        className="text-xs font-semibold fill-gray-900"
                        style={{ fontSize: '11px' }}
                      >
                        {machine.name}
                      </text>
                      <text
                        x={x + 22}
                        y={y - 5}
                        className="text-xs fill-gray-600"
                        style={{ fontSize: '10px' }}
                      >
                        Status: {machine.status}
                      </text>
                      <text
                        x={x + 22}
                        y={y + 10}
                        className="text-xs fill-gray-600"
                        style={{ fontSize: '10px' }}
                      >
                        Zone: {machine.zone}
                      </text>
                      <text
                        x={x + 22}
                        y={y + 25}
                        className="text-xs fill-gray-600"
                        style={{ fontSize: '10px' }}
                      >
                        Type: {machine.type.replace('_', ' ')}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Status Summary Panel (Right Side) */}
        <div className="w-64 bg-white border-l border-gray-200 p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Plant Status Summary
          </h3>
          
          {/* Pie Chart */}
          {statusSummary.length > 0 && (
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusSummary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {statusSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border border-gray-300"></div>
              <span>Running - No Issue</span>
              <span className="ml-auto font-medium">
                {machines.filter((m) => m.status === 'operational').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded border border-gray-300"></div>
              <span>Warning - Trending Issue</span>
              <span className="ml-auto font-medium">
                {machines.filter((m) => m.status === 'warning').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded border border-gray-300"></div>
              <span>Critical</span>
              <span className="ml-auto font-medium">
                {machines.filter((m) => m.status === 'critical').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded border border-gray-300"></div>
              <span>Not Running</span>
              <span className="ml-auto font-medium">
                {machines.filter((m) => m.status === 'maintenance' || m.status === 'offline').length}
              </span>
            </div>
          </div>

          {/* Total Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm">
              <span className="text-gray-600">Total Machines:</span>
              <span className="ml-2 font-bold text-gray-900">{machines.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
