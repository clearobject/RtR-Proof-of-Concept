const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
})

async function verifyDatabase() {
  console.log('🔍 Verifying database schema and data...\n')

  const checks = {
    tables: [],
    data: [],
    columns: [],
    functions: [],
    policies: [],
  }

  // Check required tables exist
  const requiredTables = [
    'facilities',
    'assets',
    'machines',
    'alerts',
    'maintenance_tickets',
    'user_profiles',
    'sensor_data',
    'invite_tokens',
    'asset_types',
  ]

  console.log('📋 Checking required tables...')
  for (const table of requiredTables) {
    const { data, error } = await supabase.from(table).select('id').limit(1)
    if (error && error.code === '42P01') {
      checks.tables.push({ table, status: '❌ MISSING', error: error.message })
    } else if (error) {
      checks.tables.push({ table, status: '⚠️ ERROR', error: error.message })
    } else {
      checks.tables.push({ table, status: '✅ EXISTS' })
    }
  }

  // Check data counts
  console.log('\n📊 Checking data counts...')
  const tablesToCount = ['facilities', 'assets', 'machines', 'alerts', 'maintenance_tickets', 'user_profiles']
  for (const table of tablesToCount) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) {
      checks.data.push({ table, status: 'ERROR', error: error.message })
    } else {
      checks.data.push({ table, count: count || 0 })
    }
  }

  // Check critical columns by attempting to query them
  console.log('\n🔑 Checking critical columns...')
  
  // Assets table - check for alias column
  const { data: assetData, error: assetError } = await supabase.from('assets').select('alias').limit(1)
  checks.columns.push({
    table: 'assets',
    column: 'alias',
    status: assetError && (assetError.message.includes('alias') || assetError.message.includes('column')) ? '❌ MISSING' : '✅ EXISTS',
  })

  // Machines table - check for asset_alias column
  const { data: machineData, error: machineError } = await supabase.from('machines').select('asset_alias').limit(1)
  checks.columns.push({
    table: 'machines',
    column: 'asset_alias',
    status: machineError && (machineError.message.includes('asset_alias') || machineError.message.includes('column')) ? '❌ MISSING' : '✅ EXISTS',
  })

  // Maintenance tickets - check for alert_id column
  const { data: ticketData, error: ticketError } = await supabase.from('maintenance_tickets').select('alert_id').limit(1)
  checks.columns.push({
    table: 'maintenance_tickets',
    column: 'alert_id',
    status: ticketError && (ticketError.message.includes('alert_id') || ticketError.message.includes('column')) ? '❌ MISSING' : '✅ EXISTS',
  })

  // Check alias data is populated
  console.log('\n📝 Checking alias data population...')
  const { count: assetsWithAlias } = await supabase
    .from('assets')
    .select('alias', { count: 'exact', head: true })
    .not('alias', 'is', null)
  const { count: totalAssets } = await supabase.from('assets').select('*', { count: 'exact', head: true })

  const { count: machinesWithAlias } = await supabase
    .from('machines')
    .select('asset_alias', { count: 'exact', head: true })
    .not('asset_alias', 'is', null)
  const { count: totalMachines } = await supabase.from('machines').select('*', { count: 'exact', head: true })

  // Print results
  console.log('\n' + '='.repeat(60))
  console.log('VERIFICATION RESULTS')
  console.log('='.repeat(60))

  console.log('\n📋 Tables:')
  checks.tables.forEach((check) => {
    console.log(`  ${check.status} ${check.table}`)
    if (check.error) {
      console.log(`     Error: ${check.error}`)
    }
  })

  console.log('\n📊 Data Counts:')
  checks.data.forEach((check) => {
    if (check.count !== undefined) {
      console.log(`  ${check.table}: ${check.count} records`)
    } else {
      console.log(`  ${check.table}: ${check.status} - ${check.error}`)
    }
  })

  console.log('\n🔑 Critical Columns:')
  checks.columns.forEach((check) => {
    console.log(`  ${check.status} ${check.table}.${check.column}`)
  })

  console.log('\n📝 Alias Data:')
  console.log(`  Assets: ${assetsWithAlias || 0}/${totalAssets || 0} have aliases`)
  console.log(`  Machines: ${machinesWithAlias || 0}/${totalMachines || 0} have asset_aliases`)

  // Summary
  console.log('\n' + '='.repeat(60))
  const missingTables = checks.tables.filter((t) => t.status.includes('MISSING')).length
  const missingColumns = checks.columns.filter((c) => c.status.includes('MISSING')).length

  if (missingTables === 0 && missingColumns === 0 && (assetsWithAlias || 0) > 0 && (machinesWithAlias || 0) > 0) {
    console.log('✅ DATABASE IS FULLY CONFIGURED!')
  } else {
    console.log('⚠️  ISSUES FOUND:')
    if (missingTables > 0) {
      console.log(`  - ${missingTables} missing table(s)`)
    }
    if (missingColumns > 0) {
      console.log(`  - ${missingColumns} missing column(s)`)
    }
    if ((assetsWithAlias || 0) === 0) {
      console.log('  - No assets have aliases populated')
    }
    if ((machinesWithAlias || 0) === 0) {
      console.log('  - No machines have asset_aliases populated')
    }
  }
  console.log('='.repeat(60))
}

verifyDatabase().catch((error) => {
  console.error('❌ Verification failed:', error)
  process.exit(1)
})

