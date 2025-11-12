#!/usr/bin/env node

import process from 'node:process'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const ALERT_DEFINITIONS = [
  {
    assetAlias: 'EWR.IB.WC.CT.55.03',
    severity: 'critical',
    message: 'Washer CT.55.03 over-temperature detected (92°C vs 75°C threshold).',
  },
  {
    assetAlias: 'EWR.IB.WC.CT.90.05',
    severity: 'high',
    message: 'Washer CT.90.05 vibration trending high. Bearings require inspection.',
  },
  {
    assetAlias: 'EWR.IB.WC.CT.90.12',
    severity: 'medium',
    message: 'Wash cycle duration exceeding SLA on CT.90.12.',
  },
  {
    assetAlias: 'EWR.IB.DRY.WETA.02',
    severity: 'high',
    message: 'Dryer WETA.02 exhaust temperature above safe range.',
  },
  {
    assetAlias: 'EWR.IB.DRY.WETA.08',
    severity: 'low',
    message: 'Dryer WETA.08 lint drawer full – scheduled cleaning required.',
  },
  {
    assetAlias: 'EWR.IB.DRY.REU.04',
    severity: 'medium',
    message: 'Reuse unit REU.04 reporting inconsistent flow rate.',
  },
  {
    assetAlias: 'EWR.IB.DRY.REU.09',
    severity: 'high',
    message: 'Reuse unit REU.09 solvent pressure drop detected.',
  },
  {
    assetAlias: 'EWR.IB.DC.CO.07.WH.02',
    severity: 'critical',
    message: 'Dry cleaning carousel CO.07.WH.02 halted – motor overload.',
  },
  {
    assetAlias: 'EWR.IB.DC.IP.03',
    severity: 'medium',
    message: 'Ipura IP.03 solvent filter approaching capacity.',
  },
  {
    assetAlias: 'EWR.IB.DC.UN.02.WH.02',
    severity: 'high',
    message: 'Union WH.02 solvent leak detected at pump manifold.',
  },
  {
    assetAlias: 'EWR.IB.DC.IP.09',
    severity: 'low',
    message: 'Ipura IP.09 preventive maintenance window approaching.',
  },
  {
    assetAlias: 'EWR.IB.DRY.WETB.05',
    severity: 'medium',
    message: 'WetB.05 dryer throughput down 18% vs baseline.',
  },
  {
    assetAlias: 'EWR.IB.DRY.WETB.10',
    severity: 'high',
    message: 'WetB.10 dryer burner auto-ignition failed twice.',
  },
  {
    assetAlias: 'EWR.IB.DRY.WETB.12',
    severity: 'critical',
    message: 'WetB.12 dryer reports drum imbalance – auto shutdown engaged.',
  },
  {
    assetAlias: 'EWR.Clean.05',
    severity: 'medium',
    message: 'Quality station Clean.05 scanner misread rate at 2.7%.',
  },
]

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const run = async () => {
  const { data: machineData, error: machineError } = await client
    .from('machines')
    .select('id, asset_alias')
    .in(
      'asset_alias',
      ALERT_DEFINITIONS.map((entry) => entry.assetAlias)
    )

  if (machineError) {
    console.error('Failed to load machines:', machineError.message)
    process.exit(1)
  }

  const machineMap = new Map()
  machineData?.forEach((machine) => {
    if (machine.asset_alias) {
      machineMap.set(machine.asset_alias, machine.id)
    }
  })

  const payload = ALERT_DEFINITIONS.map((entry) => {
    const machineId = machineMap.get(entry.assetAlias)
    if (!machineId) {
      console.warn(`Skipping alert for ${entry.assetAlias}: machine not found`)
      return null
    }

    return {
      id: randomUUID(),
      machine_id: machineId,
      severity: entry.severity,
      message: entry.message,
      acknowledged: false,
      created_at: new Date().toISOString(),
    }
  }).filter(Boolean)

  if (payload.length === 0) {
    console.error('No alerts generated. Aborting.')
    process.exit(1)
  }

  if (dryRun) {
    console.log(`Prepared ${payload.length} alerts (dry run). Example:`)
    console.log(JSON.stringify(payload.slice(0, 3), null, 2))
    return
  }

  const machineIds = payload.map((entry) => entry.machine_id)
  await client.from('alerts').delete().in('machine_id', machineIds)

  const { error: upsertError } = await client.from('alerts').insert(payload)

  if (upsertError) {
    console.error('Failed to insert alerts:', upsertError.message)
    process.exit(1)
  }

  console.log(`Inserted ${payload.length} alerts linked to EWR asset layout.`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})


