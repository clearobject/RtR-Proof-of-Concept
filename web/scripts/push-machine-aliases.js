const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Support both direct env vars and Next.js-style prefixed vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  console.error('Found SUPABASE_URL:', SUPABASE_URL ? 'yes' : 'no')
  console.error('Found SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'yes' : 'no')
  process.exit(1)
}

const FACILITY_CODE_TO_ID = {
  EWR: '550e8400-e29b-41d4-a716-446655440000',
  DFW: '550e8400-e29b-41d4-a716-446655440001',
}

const CSV_PATH = path.resolve(__dirname, '../../data/RtR Assets.csv')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
})

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim()
  const lines = raw.split(/\r?\n/)
  const headers = lines[0].split(',').map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const cols = line.split(',')
    const record = {}
    headers.forEach((header, idx) => {
      record[header] = (cols[idx] ?? '').trim()
    })
    return record
  })
}

function parseDate(input) {
  if (!input) {
    return null
  }

  const parts = input.split(/[/-]/)
  if (parts.length !== 3) {
    return null
  }

  const [month, day, year] = parts
  const iso = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  return iso
}

function deriveZone(alias) {
  if (!alias) {
    return 'Unknown'
  }
  const parts = alias.split('.')
  if (parts.length >= 3) {
    return `${parts[1]}.${parts[2]}`
  }
  return 'Unknown'
}

function deriveMachineType(description, alias) {
  if (description) {
    return description.toLowerCase().replace(/\s+/g, '_')
  }

  if (alias) {
    const parts = alias.split('.')
    if (parts[2]) {
      return parts[2].toLowerCase()
    }
  }

  return 'unknown'
}

function deriveStatus(outOfService) {
  if (!outOfService) {
    return 'operational'
  }
  return outOfService.toLowerCase() === 'yes' ? 'maintenance' : 'operational'
}

function normalizeAsset(record) {
  // CSV uses 'Asset' column, not 'gitet'
  const alias = record.Asset || record.gitet
  if (!alias) {
    return null
  }

  const facilityCode = record.Organization
  const facilityId = FACILITY_CODE_TO_ID[facilityCode]

  if (!facilityId) {
    console.warn(`Skipping alias ${alias} - unknown facility code: ${facilityCode}`)
    return null
  }

  const inServiceDate = parseDate(record['Commission Date']) || '2020-01-01'
  const status = record['Out of Service'] && record['Out of Service'].toLowerCase() === 'yes' ? 'maintenance' : 'active'

  return {
    alias,
    name: record.Alias || alias,
    type: record.Description || 'Unknown',
    manufacturer: record['Model Name'] || record.OEM || null,
    model: record.Model || null,
    serial_number: record['Serial Number'] || null,
    facility_id: facilityId,
    zone: deriveZone(alias),
    in_service_date: inServiceDate,
    expected_life_years: null,
    criticality: 'medium',
    status,
  }
}

function normalizeMachine(record) {
  // CSV uses 'Asset' column, not 'gitet'
  const alias = record.Asset || record.gitet
  if (!alias) {
    return null
  }

  const facilityCode = record.Organization
  const facilityId = FACILITY_CODE_TO_ID[facilityCode]

  if (!facilityId) {
    return null
  }

  return {
    asset_alias: alias,
    name: record.Alias || alias,
    type: deriveMachineType(record.Description, alias),
    zone: deriveZone(alias),
    facility_id: facilityId,
    status: deriveStatus(record['Out of Service']),
    manufacturer: record['Model Name'] || record.OEM || null,
    model: record.Model || null,
    serial_number: record['Serial Number'] || null,
  }
}

async function chunkedUpsert(table, rows, conflictColumn) {
  const chunkSize = 100
  
  // Get all conflict values
  const conflictValues = rows
    .map(row => row[conflictColumn])
    .filter(Boolean)
  
  if (conflictValues.length === 0) {
    console.warn(`No valid ${conflictColumn} values found`)
    return
  }

  // Batch fetch existing records
  const { data: existingRecords, error: selectError } = await supabase
    .from(table)
    .select(`id, ${conflictColumn}`)
    .in(conflictColumn, conflictValues)

  if (selectError) {
    throw selectError
  }

  const existingMap = new Map(
    (existingRecords || []).map(record => [record[conflictColumn], record.id])
  )

  const toInsert = []
  const toUpdate = []

  for (const row of rows) {
    const conflictValue = row[conflictColumn]
    if (!conflictValue) {
      continue
    }

    if (existingMap.has(conflictValue)) {
      toUpdate.push({ ...row, id: existingMap.get(conflictValue) })
    } else {
      toInsert.push(row)
    }
  }

  // Batch insert new records
  if (toInsert.length > 0) {
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize)
      const { error: insertError } = await supabase.from(table).insert(chunk)
      if (insertError) {
        throw insertError
      }
      console.log(`Inserted ${Math.min(i + chunkSize, toInsert.length)}/${toInsert.length} new records`)
    }
  }

  // Batch update existing records
  if (toUpdate.length > 0) {
    for (let i = 0; i < toUpdate.length; i += chunkSize) {
      const chunk = toUpdate.slice(i, i + chunkSize)
      // Update each record individually (Supabase doesn't support batch update by different IDs easily)
      for (const row of chunk) {
        const { id, ...updateData } = row
        const { error: updateError } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id)
        if (updateError) {
          throw updateError
        }
      }
      console.log(`Updated ${Math.min(i + chunkSize, toUpdate.length)}/${toUpdate.length} existing records`)
    }
  }

  console.log(`Upsert complete: ${toInsert.length} inserted, ${toUpdate.length} updated`)
}

async function main() {
  console.log(`Reading CSV from: ${CSV_PATH}`)
  const records = parseCsv(CSV_PATH)
  console.log(`Parsed ${records.length} CSV records`)

  if (records.length === 0) {
    console.error('No records found in CSV file')
    process.exit(1)
  }

  // Debug: show first record structure
  console.log('First record keys:', Object.keys(records[0]))
  console.log('First record sample:', JSON.stringify(records[0], null, 2))

  const assetPayload = []
  const machinePayload = []
  let skippedAssets = 0
  let skippedMachines = 0

  records.forEach((record, idx) => {
    const asset = normalizeAsset(record)
    if (asset) {
      assetPayload.push(asset)
    } else {
      skippedAssets++
      if (idx < 3) {
        console.warn(`Skipped asset at row ${idx + 2}:`, {
          Asset: record.Asset,
          Organization: record.Organization,
        })
      }
    }

    const machine = normalizeMachine(record)
    if (machine) {
      machinePayload.push(machine)
    } else {
      skippedMachines++
    }
  })

  console.log(`Generated ${assetPayload.length} assets (skipped ${skippedAssets})`)
  console.log(`Generated ${machinePayload.length} machines (skipped ${skippedMachines})`)

  if (assetPayload.length === 0 || machinePayload.length === 0) {
    console.error('No asset or machine records were generated. Aborting.')
    process.exit(1)
  }

  console.log(`Upserting ${assetPayload.length} assets...`)
  await chunkedUpsert('assets', assetPayload, 'alias')
  console.log('Asset upsert complete.')

  console.log(`Upserting ${machinePayload.length} machines...`)
  await chunkedUpsert('machines', machinePayload, 'asset_alias')
  console.log('Machine upsert complete.')
}

main().catch((error) => {
  console.error('Failed to push asset aliases:', error)
  process.exit(1)
})


