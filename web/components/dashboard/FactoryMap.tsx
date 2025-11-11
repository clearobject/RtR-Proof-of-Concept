'use client'

import { useMemo } from 'react'
import { FactoryLayout } from '@/components/digital-twin/factory-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Machine } from '@/lib/types'

const mockMachines: Machine[] = [
  {
    id: 'washer-01',
    name: 'Washer 01',
    asset_alias: 'W-01',
    type: 'washer',
    zone: 'Wet Cleaning',
    facility_id: 'ewr',
    status: 'operational',
    coordinates: { x: 260, y: 420 },
    manufacturer: 'Miele',
    model: 'ProLine 5000',
    serial_number: 'MIE-PL5-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'washer-02',
    name: 'Washer 02',
    asset_alias: 'W-02',
    type: 'washer',
    zone: 'Wet Cleaning',
    facility_id: 'ewr',
    status: 'warning',
    coordinates: { x: 320, y: 420 },
    manufacturer: 'Miele',
    model: 'ProLine 5000',
    serial_number: 'MIE-PL5-002',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dryer-01',
    name: 'Dryer 01',
    asset_alias: 'D-01',
    type: 'dryer',
    zone: 'Pressing',
    facility_id: 'ewr',
    status: 'operational',
    coordinates: { x: 340, y: 650 },
    manufacturer: 'Electrolux',
    model: 'Line 6000',
    serial_number: 'ELX-L6-301',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'press-01',
    name: 'Press 01',
    asset_alias: 'P-01',
    type: 'press',
    zone: 'Pressing',
    facility_id: 'ewr',
    status: 'critical',
    coordinates: { x: 480, y: 660 },
    manufacturer: 'Trevil',
    model: 'Pantastar',
    serial_number: 'TRV-PS-110',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tagging-01',
    name: 'RFID Tagging Line',
    asset_alias: 'RF-01',
    type: 'tagging',
    zone: 'Tagging',
    facility_id: 'ewr',
    status: 'operational',
    coordinates: { x: 100, y: 380 },
    manufacturer: 'Intel',
    model: 'TagMaster',
    serial_number: 'INT-TM-402',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'qc-01',
    name: 'QC Station 01',
    asset_alias: 'QC-01',
    type: 'inspection',
    zone: 'Quality Control',
    facility_id: 'ewr',
    status: 'maintenance',
    coordinates: { x: 680, y: 540 },
    manufacturer: 'RTR',
    model: 'QC Vision',
    serial_number: 'RTR-QCV-208',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bagging-01',
    name: 'Automated Bagging',
    asset_alias: 'BG-01',
    type: 'bagging',
    zone: 'Bagging',
    facility_id: 'ewr',
    status: 'operational',
    coordinates: { x: 920, y: 400 },
    manufacturer: 'CBW',
    model: 'BagPro X',
    serial_number: 'CBW-BX-702',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function FactoryMap() {
  // Memoize to avoid re-creating dates on every render once Supabase data is connected
  const machines = useMemo(() => mockMachines, [])

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
      <CardContent>
        <div className="rounded-2xl border border-rtr-border bg-white">
          <FactoryLayout machines={machines} />
        </div>
      </CardContent>
    </Card>
  )
}


