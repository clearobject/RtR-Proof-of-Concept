#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const inputPath = args.find((arg) => !arg.startsWith('--'))
const dryRun = args.includes('--dry-run')

if (!inputPath) {
  console.error('Usage: node scripts/import-machines-from-csv.mjs <path-to-csv> [--dry-run]')
  process.exit(1)
}

const FACILITY_CODE_TO_ID = {
  EWR: '550e8400-e29b-41d4-a716-446655440000',
  DFW: '550e8400-e29b-41d4-a716-446655440001',
}

const humanize = (value) =>
  value
    .toLowerCase()
    .split(/[\s_/.-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const mapStatus = (status, outOfService) => {
  const base = (status || '').trim().toLowerCase()
  const oos = (outOfService || '').trim().toLowerCase()
  if (oos === 'yes') return 'offline'
  if (base === 'active') return 'operational'
  if (base === 'inactive') return 'maintenance'
  if (base === 'maintenance') return 'maintenance'
  return 'maintenance'
}

const TYPE_LOOKUP = {
  wheel: 'dry_cleaner',
  dryer: 'dryer',
  washmach: 'washer',
  washer: 'washer',
  sorter: 'sorter',
  press: 'press',
  tunnel: 'steam_tunnel',
  qc: 'quality_scanner',
  rfid: 'rfid_reader',
}

const normalizeType = (rawClass, description) => {
  const classSlug = (rawClass || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
  if (classSlug && TYPE_LOOKUP[classSlug]) return TYPE_LOOKUP[classSlug]

  const desc = (description || '').toLowerCase()
  if (desc.includes('dry clean')) return 'dry_cleaner'
  if (desc.includes('dryer')) return 'dryer'
  if (desc.includes('wet')) return 'washer'
  if (desc.includes('press')) return 'press'
  if (desc.includes('steam')) return 'steam_tunnel'
  if (desc.includes('sort')) return 'sorter'
  if (desc.includes('scan')) return 'quality_scanner'

  return classSlug || 'equipment'
}

const parseCsv = (csvString) => {
  const lines = csvString
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  const headerLine = lines.shift()
  if (!headerLine) return []

  const headers = headerLine.split(',').map((header) => header.trim())

  return lines.map((line) => {
    const values = line.split(',').map((value) => value.trim())
    const entry = {}
    headers.forEach((header, index) => {
      entry[header] = values[index] ?? ''
    })
    return entry
  })
}

const normalizeMachineRecord = (row) => {
  const assetAlias = (row['Asset'] || '').trim()
  if (!assetAlias) return null

  const organization = (row['Organization'] || 'EWR').trim()
  const facilityId = FACILITY_CODE_TO_ID[organization]
  if (!facilityId) {
    console.warn(`Skipping ${assetAlias}: unknown facility code "${organization}"`)
    return null
  }

  const zone = humanize(row['Department'] || 'Unassigned') || 'Unassigned'
  const alias = (row['Alias'] || '').trim()
  const description = (row['Description'] || '').trim()
  const modelName = (row['Model Name'] || '').trim()
  const model = (row['Model'] || '').trim()

  const name = alias || description || modelName || model || assetAlias

  return {
    asset_alias: assetAlias,
    name,
    type: normalizeType(row['Class'], description),
    zone,
    facility_id: facilityId,
    status: mapStatus(row['Status'], row['Out of Service']),
    manufacturer: (row['OEM'] || model || null) || null,
    model: modelName || model || null,
    serial_number: (row['Serial Number'] || null) || null,
  }
}

const run = async () => {
  const resolvedPath = path.resolve(process.cwd(), inputPath)
  const csvRaw = await readFile(resolvedPath, 'utf-8')
  const parsed = parseCsv(csvRaw)
  const machines = parsed
    .map(normalizeMachineRecord)
    .filter((machine) => machine !== null)

  if (machines.length === 0) {
    console.error('No machine records were generated from the CSV.')
    process.exit(1)
  }

  if (dryRun) {
    console.log(`Parsed ${machines.length} machines (dry run). Sample:`)
    console.log(JSON.stringify(machines.slice(0, 5), null, 2))
    return
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
    process.exit(1)
  }

  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const { error } = await client
    .from('machines')
    .upsert(machines, { onConflict: 'facility_id,asset_alias' })

  if (error) {
    console.error('Failed to upsert machines:', error.message)
    process.exit(1)
  }

  console.log(`Successfully upserted ${machines.length} machine records.`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

