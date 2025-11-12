#!/usr/bin/env node

/**
 * Comprehensive Data Seeding Script
 * 
 * This script seeds the database with realistic data for:
 * - Sensor data (24h and 7d)
 * - Alerts
 * - Downtime events
 * - Maintenance tickets and costs
 * - Acquisition costs for assets
 * - Preventive maintenance tasks
 * - MTTR values
 * - Salvage values
 * - OEE-related performance data
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const envPath = join(__dirname, '..', '.env.local')
let envVars = {}
try {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
    }
  })
} catch (error) {
  console.log('Could not read .env.local, using process.env')
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Equipment type pricing (based on real-world estimates)
const EQUIPMENT_PRICING = {
  'Washer': { min: 45000, max: 85000, salvagePercent: 0.15 },
  'Dryer': { min: 35000, max: 65000, salvagePercent: 0.12 },
  'Dry Cleaner': { min: 120000, max: 200000, salvagePercent: 0.10 },
  'Steam Tunnel': { min: 80000, max: 150000, salvagePercent: 0.08 },
  'Press': { min: 25000, max: 45000, salvagePercent: 0.15 },
  'Automated Sorter': { min: 200000, max: 350000, salvagePercent: 0.05 },
  'Quality Scanner': { min: 15000, max: 30000, salvagePercent: 0.20 },
  'Packing Line': { min: 100000, max: 180000, salvagePercent: 0.10 },
}

// Helper functions
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

async function seedSensorData() {
  console.log('📊 Seeding sensor data...')
  
  const { data: assets } = await supabase
    .from('assets')
    .select('id, type, status')
    .in('status', ['active', 'operational', 'warning', 'critical'])
  
  if (!assets || assets.length === 0) {
    console.log('⚠️  No active assets found, skipping sensor data')
    return
  }

  const now = new Date()
  const sevenDaysAgo = addDays(now, -7)
  const oneDayAgo = addDays(now, -1)
  
  const sensorData = []
  
  for (const asset of assets) {
    // Generate hourly data for last 7 days
    let currentDate = new Date(sevenDaysAgo)
    
    while (currentDate <= now) {
      // Skip if asset is offline/maintenance during this time (10% chance)
      const isOffline = Math.random() < 0.1 && asset.status === 'maintenance'
      
      if (!isOffline) {
        // Base values vary by equipment type
        const baseTemp = asset.type?.toLowerCase().includes('dryer') ? 65 : 25
        const baseVibration = asset.type?.toLowerCase().includes('sorter') ? 0.8 : 0.3
        const basePower = asset.type?.toLowerCase().includes('dryer') ? 8.5 : 5.0
        
        // Add some variation and trends
        const hourOfDay = currentDate.getHours()
        const dayOfWeek = currentDate.getDay()
        
        // Higher power during business hours (6 AM - 10 PM)
        const isBusinessHours = hourOfDay >= 6 && hourOfDay < 22
        const powerMultiplier = isBusinessHours ? 1.2 : 0.3
        
        // Temperature varies by time of day
        const tempVariation = Math.sin((hourOfDay / 24) * Math.PI * 2) * 5
        
        // Vibration increases if status is warning/critical
        const vibrationMultiplier = asset.status === 'critical' ? 1.5 : asset.status === 'warning' ? 1.2 : 1.0
        
        sensorData.push({
          asset_id: asset.id,
          timestamp: currentDate.toISOString(),
          temperature: Math.max(15, baseTemp + tempVariation + randomFloat(-2, 2)),
          vibration: Math.max(0, baseVibration * vibrationMultiplier + randomFloat(-0.1, 0.1)),
          power: Math.max(0, basePower * powerMultiplier + randomFloat(-0.5, 0.5)),
          humidity: Math.max(20, 45 + randomFloat(-5, 5)),
        })
      }
      
      // Move to next hour
      currentDate = addHours(currentDate, 1)
    }
  }
  
  // Insert in batches of 1000
  for (let i = 0; i < sensorData.length; i += 1000) {
    const batch = sensorData.slice(i, i + 1000)
    const { error } = await supabase.from('sensor_data').insert(batch)
    if (error) {
      console.error(`Error inserting sensor data batch ${i / 1000 + 1}:`, error)
    } else {
      console.log(`  ✓ Inserted sensor data batch ${i / 1000 + 1} (${batch.length} records)`)
    }
  }
  
  console.log(`✅ Seeded ${sensorData.length} sensor data records`)
}

async function seedAlerts() {
  console.log('🚨 Seeding alerts...')
  
  const { data: assets } = await supabase
    .from('assets')
    .select('id, name, type, status')
    .in('status', ['active', 'operational', 'warning', 'critical', 'maintenance'])
  
  if (!assets || assets.length === 0) {
    console.log('⚠️  No assets found, skipping alerts')
    return
  }

  const alertMessages = {
    critical: [
      'High temperature detected - immediate attention required',
      'Excessive vibration - potential bearing failure',
      'Power consumption spike - electrical fault suspected',
      'Critical component failure detected',
      'Emergency shutdown required',
      'Overheating - thermal protection activated',
    ],
    high: [
      'Elevated temperature reading',
      'Increased vibration levels detected',
      'Performance degradation observed',
      'Component wear detected',
      'Maintenance due soon',
      'Anomalous power consumption',
    ],
    medium: [
      'Slight temperature increase',
      'Minor vibration detected',
      'Routine maintenance recommended',
      'Performance slightly below optimal',
      'Filter replacement due',
    ],
    low: [
      'Routine check recommended',
      'Minor performance variation',
      'Scheduled maintenance approaching',
    ],
  }

  const alerts = []
  const now = new Date()
  const ninetyDaysAgo = addDays(now, -90)
  
  // Generate alerts for assets with warning/critical status
  for (const asset of assets) {
    // More alerts for critical/warning status
    const alertProbability = 
      asset.status === 'critical' ? 0.8 :
      asset.status === 'warning' ? 0.5 :
      asset.status === 'maintenance' ? 0.3 :
      0.1
    
    // Generate alerts based on status - more for critical/warning assets
    // For 90 days: critical assets get 8-15 alerts, warning get 5-10, others get 2-6
    const numAlerts = asset.status === 'critical' 
      ? randomBetween(8, 15)
      : asset.status === 'warning'
      ? randomBetween(5, 10)
      : Math.random() < alertProbability ? randomBetween(2, 6) : randomBetween(0, 3)
    
    for (let i = 0; i < numAlerts; i++) {
      const severity = asset.status === 'critical' 
        ? randomChoice(['critical', 'high'])
        : asset.status === 'warning'
        ? randomChoice(['high', 'medium'])
        : randomChoice(['medium', 'low'])
      
      // Distribute alerts across the 90-day period
      // More recent alerts are more likely to be unacknowledged
      const createdAt = randomDate(ninetyDaysAgo, now)
      const daysAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      
      // Recent alerts (last 7 days): 70% unacknowledged
      // Older alerts (7-30 days): 50% unacknowledged
      // Very old alerts (30+ days): 30% unacknowledged
      const acknowledgeProbability = daysAgo < 7 ? 0.3 : daysAgo < 30 ? 0.5 : 0.7
      const acknowledged = Math.random() < acknowledgeProbability
      
      // If acknowledged, acknowledge within 1-48 hours for recent, or within days for older
      let acknowledgedAt = null
      if (acknowledged) {
        if (daysAgo < 7) {
          acknowledgedAt = addHours(createdAt, randomBetween(1, 48))
        } else if (daysAgo < 30) {
          acknowledgedAt = addHours(createdAt, randomBetween(2, 72))
        } else {
          // For old alerts, acknowledge shortly after creation or much later
          acknowledgedAt = Math.random() < 0.5 
            ? addHours(createdAt, randomBetween(1, 24))
            : addDays(createdAt, randomBetween(1, Math.floor(daysAgo - 5)))
        }
        // Ensure acknowledged_at is not in the future
        if (acknowledgedAt > now) {
          acknowledgedAt = now
        }
      }
      
      alerts.push({
        asset_id: asset.id,
        severity,
        message: `${asset.name}: ${randomChoice(alertMessages[severity])}`,
        acknowledged,
        acknowledged_by: acknowledged ? null : null, // Would be user ID in real scenario
        acknowledged_at: acknowledgedAt ? acknowledgedAt.toISOString() : null,
        created_at: createdAt.toISOString(),
      })
    }
  }
  
  // Insert alerts
  const { error } = await supabase.from('alerts').insert(alerts)
  if (error) {
    console.error('Error inserting alerts:', error)
  } else {
    console.log(`✅ Seeded ${alerts.length} alerts`)
  }
}

async function seedDowntimeEvents() {
  console.log('⏸️  Seeding downtime events...')
  
  const { data: assets } = await supabase
    .from('assets')
    .select('id, name, type, status')
  
  if (!assets || assets.length === 0) {
    console.log('⚠️  No assets found, skipping downtime events')
    return
  }

  const downtimeCauses = {
    unplanned: [
      'Component failure',
      'Electrical fault',
      'Mechanical breakdown',
      'Sensor malfunction',
      'Software error',
      'Overheating',
      'Bearing failure',
      'Belt breakage',
      'Motor failure',
    ],
    planned: [
      'Scheduled maintenance',
      'Preventive maintenance',
      'Equipment upgrade',
      'Routine inspection',
      'Parts replacement',
      'Calibration',
    ],
  }

  const downtimeEvents = []
  const now = new Date()
  const sixMonthsAgo = addDays(now, -180)
  
  for (const asset of assets) {
    // Generate 2-8 downtime events per asset over 6 months
    const numEvents = randomBetween(2, 8)
    
    for (let i = 0; i < numEvents; i++) {
      const isPlanned = Math.random() < 0.3 // 30% planned
      const type = isPlanned ? 'planned' : 'unplanned'
      
      const startTime = randomDate(sixMonthsAgo, now)
      // Duration: planned (2-8 hours), unplanned (1-24 hours)
      const durationHours = isPlanned 
        ? randomBetween(2, 8)
        : randomBetween(1, 24)
      const endTime = addHours(startTime, durationHours)
      
      // Only create events that ended before now
      if (endTime <= now) {
        downtimeEvents.push({
          asset_id: asset.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: durationHours * 60,
          type,
          cause: randomChoice(downtimeCauses[type]),
          impact: isPlanned 
            ? 'Minimal - scheduled maintenance'
            : randomChoice(['Production delay', 'Quality impact', 'Customer order delay', 'Line shutdown']),
        })
      }
    }
  }
  
  // Insert in batches
  for (let i = 0; i < downtimeEvents.length; i += 500) {
    const batch = downtimeEvents.slice(i, i + 500)
    const { error } = await supabase.from('downtime_events').insert(batch)
    if (error) {
      console.error(`Error inserting downtime batch ${i / 500 + 1}:`, error)
    } else {
      console.log(`  ✓ Inserted downtime batch ${i / 500 + 1} (${batch.length} records)`)
    }
  }
  
  console.log(`✅ Seeded ${downtimeEvents.length} downtime events`)
}

async function seedMaintenanceTicketsAndCosts() {
  console.log('🔧 Seeding maintenance tickets and costs...')
  
  const { data: assets } = await supabase
    .from('assets')
    .select('id, name, type')
  
  const { data: alerts } = await supabase
    .from('alerts')
    .select('id, asset_id, severity')
    .eq('acknowledged', false)
  
  if (!assets || assets.length === 0) {
    console.log('⚠️  No assets found, skipping maintenance tickets')
    return
  }

  const { data: users } = await supabase
    .from('user_profiles')
    .select('id')
    .in('role', ['maintenance', 'manager', 'admin'])
    .limit(5)

  const userIds = users?.map(u => u.id) || []
  if (userIds.length === 0) {
    console.log('⚠️  No maintenance users found, creating tickets without assigned users')
  }

  const ticketTitles = [
    'Routine maintenance check',
    'Component replacement',
    'Performance optimization',
    'Repair electrical issue',
    'Lubrication service',
    'Filter replacement',
    'Calibration required',
    'Software update',
    'Belt adjustment',
    'Sensor replacement',
  ]

  const tickets = []
  const costs = []
  const now = new Date()
  const oneYearAgo = addDays(now, -365)
  
  // Create tickets from unacknowledged alerts
  if (alerts && alerts.length > 0) {
    for (const alert of alerts.slice(0, Math.min(20, alerts.length))) {
      const asset = assets.find(a => a.id === alert.asset_id)
      if (!asset) continue
      
      const priority = alert.severity === 'critical' ? 'urgent' :
                      alert.severity === 'high' ? 'high' :
                      alert.severity === 'medium' ? 'medium' : 'low'
      
      const createdAt = randomDate(addDays(now, -30), now)
      const status = Math.random() < 0.3 ? 'resolved' : 
                     Math.random() < 0.5 ? 'in_progress' : 'open'
      
      const ticket = {
        asset_id: asset.id,
        alert_id: alert.id,
        title: `${asset.name}: ${randomChoice(ticketTitles)}`,
        description: `Maintenance required due to alert: ${alert.severity} severity`,
        status,
        priority,
        assigned_to: userIds.length > 0 ? randomChoice(userIds) : null,
        created_by: userIds.length > 0 ? randomChoice(userIds) : userIds[0] || null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
        resolved_at: status === 'resolved' ? addHours(createdAt, randomBetween(2, 48)).toISOString() : null,
      }
      
      tickets.push(ticket)
      
      // Add costs for resolved tickets
      if (status === 'resolved') {
        const numCosts = randomBetween(1, 3)
        for (let j = 0; j < numCosts; j++) {
          const costType = randomChoice(['parts', 'labor', 'energy', 'other'])
          const amount = costType === 'labor' 
            ? randomBetween(200, 1500)
            : costType === 'parts'
            ? randomBetween(50, 800)
            : costType === 'energy'
            ? randomBetween(20, 200)
            : randomBetween(30, 300)
          
          costs.push({
            asset_id: asset.id,
            maintenance_ticket_id: null, // Will update after ticket insert
            type: costType,
            amount,
            description: `${costType === 'parts' ? 'Replacement parts' : costType === 'labor' ? 'Technician labor' : costType === 'energy' ? 'Energy consumption' : 'Miscellaneous costs'}`,
            date: createdAt.toISOString().split('T')[0],
          })
        }
      }
    }
  }
  
  // Create additional historical tickets
  for (const asset of assets.slice(0, Math.min(assets.length, 30))) {
    const numTickets = randomBetween(3, 8)
    
    for (let i = 0; i < numTickets; i++) {
      const createdAt = randomDate(oneYearAgo, now)
      const status = createdAt < addDays(now, -30) ? 'resolved' :
                     Math.random() < 0.3 ? 'closed' :
                     Math.random() < 0.2 ? 'in_progress' : 'open'
      
      const ticket = {
        asset_id: asset.id,
        alert_id: null,
        title: `${asset.name}: ${randomChoice(ticketTitles)}`,
        description: `Maintenance work performed on ${asset.type}`,
        status,
        priority: randomChoice(['low', 'medium', 'high', 'urgent']),
        assigned_to: userIds.length > 0 ? randomChoice(userIds) : null,
        created_by: userIds.length > 0 ? randomChoice(userIds) : userIds[0] || null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
        resolved_at: status === 'resolved' || status === 'closed' 
          ? addHours(createdAt, randomBetween(4, 72)).toISOString() 
          : null,
      }
      
      tickets.push(ticket)
      
      // Add costs for resolved/closed tickets
      if (status === 'resolved' || status === 'closed') {
        const numCosts = randomBetween(1, 4)
        for (let j = 0; j < numCosts; j++) {
          const costType = randomChoice(['parts', 'labor', 'energy', 'other'])
          const amount = costType === 'labor' 
            ? randomBetween(150, 2000)
            : costType === 'parts'
            ? randomBetween(40, 1000)
            : costType === 'energy'
            ? randomBetween(15, 250)
            : randomBetween(25, 400)
          
          costs.push({
            asset_id: asset.id,
            maintenance_ticket_id: null,
            type: costType,
            amount,
            description: `${costType === 'parts' ? 'Replacement parts' : costType === 'labor' ? 'Technician labor' : costType === 'energy' ? 'Energy consumption' : 'Miscellaneous costs'}`,
            date: createdAt.toISOString().split('T')[0],
          })
        }
      }
    }
  }
  
  // Insert tickets first
  const { data: insertedTickets, error: ticketsError } = await supabase
    .from('maintenance_tickets')
    .insert(tickets)
    .select('id, asset_id')
  
  if (ticketsError) {
    console.error('Error inserting tickets:', ticketsError)
    return
  }
  
  console.log(`✅ Seeded ${tickets.length} maintenance tickets`)
  
  // Update costs with ticket IDs where applicable
  if (insertedTickets && insertedTickets.length > 0) {
    const ticketMap = new Map()
    insertedTickets.forEach(t => {
      if (!ticketMap.has(t.asset_id)) {
        ticketMap.set(t.asset_id, [])
      }
      ticketMap.get(t.asset_id).push(t.id)
    })
    
    // Assign ticket IDs to costs
    let ticketIndex = 0
    for (const cost of costs) {
      const assetTickets = ticketMap.get(cost.asset_id) || []
      if (assetTickets.length > 0 && ticketIndex < insertedTickets.length) {
        cost.maintenance_ticket_id = assetTickets[ticketIndex % assetTickets.length]
        ticketIndex++
      }
    }
  }
  
  // Insert costs
  const { error: costsError } = await supabase.from('asset_costs').insert(costs)
  if (costsError) {
    console.error('Error inserting costs:', costsError)
  } else {
    console.log(`✅ Seeded ${costs.length} cost records`)
  }
}

async function seedAcquisitionCostsAndSalvage() {
  console.log('💰 Seeding acquisition costs and salvage values...')
  
  // Check if columns exist by trying to query them
  const { error: testError } = await supabase
    .from('assets')
    .select('id, acquisition_cost, salvage_value')
    .limit(1)
  
  if (testError && (testError.message.includes('acquisition_cost') || testError.message.includes('salvage_value'))) {
    console.log('⚠️  Migration 008_add_asset_financial_fields.sql has not been run yet.')
    console.log('⚠️  Please run the migration first, then re-run this script.')
    console.log('⚠️  Skipping acquisition costs and salvage values...')
    return
  }
  
  const { data: assets } = await supabase
    .from('assets')
    .select('id, type, name, in_service_date, expected_life_years')
  
  if (!assets || assets.length === 0) {
    console.log('⚠️  No assets found, skipping acquisition costs')
    return
  }

  const updates = []
  
  for (const asset of assets) {
    const equipmentType = asset.type || 'Washer'
    const pricing = EQUIPMENT_PRICING[equipmentType] || EQUIPMENT_PRICING['Washer']
    
    // Generate acquisition cost
    const acquisitionCost = randomBetween(pricing.min, pricing.max)
    
    // Calculate salvage value (decreases with age)
    const inServiceDate = new Date(asset.in_service_date)
    const ageYears = (new Date().getTime() - inServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    const expectedLife = asset.expected_life_years || 10
    const agePercent = Math.min(ageYears / expectedLife, 1)
    
    // Salvage value decreases with age (new = 15%, end of life = 5%)
    const salvagePercent = pricing.salvagePercent * (1 - agePercent * 0.5)
    const salvageValue = Math.round(acquisitionCost * salvagePercent)
    
    updates.push({
      id: asset.id,
      acquisition_cost: acquisitionCost,
      salvage_value: salvageValue,
    })
  }
  
  // Update in batches
  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50)
    for (const update of batch) {
      const { error } = await supabase
        .from('assets')
        .update({
          acquisition_cost: update.acquisition_cost,
          salvage_value: update.salvage_value,
        })
        .eq('id', update.id)
      
      if (error) {
        console.error(`Error updating asset ${update.id}:`, error)
      }
    }
    console.log(`  ✓ Updated ${Math.min(i + 50, updates.length)}/${updates.length} assets`)
  }
  
  console.log(`✅ Updated acquisition costs and salvage values for ${updates.length} assets`)
}

async function seedPMTasks() {
  console.log('📅 Seeding preventive maintenance tasks...')
  
  const { data: assets } = await supabase
    .from('assets')
    .select('id, type, name')
    .in('status', ['active', 'operational'])
  
  const { data: templates } = await supabase
    .from('pm_templates')
    .select('id, name, frequency_days')
  
  if (!assets || assets.length === 0) {
    console.log('⚠️  No active assets found, skipping PM tasks')
    return
  }

  const pmTasks = []
  const now = new Date()
  
  for (const asset of assets) {
    // Generate PM tasks for next 6 months
    const numTasks = randomBetween(2, 6)
    
    for (let i = 0; i < numTasks; i++) {
      const daysFromNow = randomBetween(7, 180)
      const scheduledDate = addDays(now, daysFromNow)
      
      // Some tasks are overdue
      const isOverdue = Math.random() < 0.15 && daysFromNow < 0
      const status = isOverdue ? 'overdue' :
                     Math.random() < 0.2 ? 'completed' : 'scheduled'
      
      const template = templates && templates.length > 0 
        ? randomChoice(templates)
        : null
      
      pmTasks.push({
        template_id: template?.id || null,
        asset_id: asset.id,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        completed_date: status === 'completed' 
          ? addDays(scheduledDate, randomBetween(-5, 5)).toISOString().split('T')[0]
          : null,
        completed_by: status === 'completed' ? null : null, // Would be user ID
        status,
        notes: status === 'completed' 
          ? 'PM task completed successfully'
          : `Scheduled PM for ${asset.name}`,
      })
    }
  }
  
  const { error } = await supabase.from('pm_tasks').insert(pmTasks)
  if (error) {
    console.error('Error inserting PM tasks:', error)
  } else {
    console.log(`✅ Seeded ${pmTasks.length} PM tasks`)
  }
}

async function calculateAndUpdateMTTR() {
  console.log('⏱️  Calculating and updating MTTR values...')
  
  // Check if mttr_hours column exists
  const { error: testError } = await supabase
    .from('assets')
    .select('id, mttr_hours')
    .limit(1)
  
  if (testError && testError.message.includes('mttr_hours')) {
    console.log('⚠️  Migration 008_add_asset_financial_fields.sql has not been run yet.')
    console.log('⚠️  Please run the migration first, then re-run this script.')
    console.log('⚠️  Skipping MTTR calculation...')
    return
  }
  
  const { data: assets } = await supabase
    .from('assets')
    .select('id')
  
  if (!assets || assets.length === 0) {
    console.log('⚠️  No assets found, skipping MTTR calculation')
    return
  }

  for (const asset of assets) {
    const { data: downtimeEvents } = await supabase
      .from('downtime_events')
      .select('duration_minutes, type')
      .eq('asset_id', asset.id)
      .eq('type', 'unplanned')
      .not('duration_minutes', 'is', null)
    
    if (downtimeEvents && downtimeEvents.length > 0) {
      const totalMinutes = downtimeEvents.reduce((sum, d) => sum + (d.duration_minutes || 0), 0)
      const mttrHours = (totalMinutes / downtimeEvents.length) / 60
      
      const { error } = await supabase
        .from('assets')
        .update({ mttr_hours: Math.round(mttrHours * 10) / 10 })
        .eq('id', asset.id)
      
      if (error) {
        console.error(`Error updating MTTR for asset ${asset.id}:`, error)
      }
    }
  }
  
  console.log('✅ Updated MTTR values for all assets')
}

async function updateTCOCalculation() {
  console.log('📊 Updating TCO calculation utility...')
  // This is handled in the code, just a note
  console.log('✅ TCO calculation will use acquisition_cost from assets table')
}

// Main execution
async function main() {
  console.log('🌱 Starting comprehensive data seeding...\n')
  
  try {
    await seedSensorData()
    await seedAlerts()
    await seedDowntimeEvents()
    await seedMaintenanceTicketsAndCosts()
    await seedAcquisitionCostsAndSalvage()
    await seedPMTasks()
    await calculateAndUpdateMTTR()
    await updateTCOCalculation()
    
    console.log('\n✅ All seeding completed successfully!')
  } catch (error) {
    console.error('\n❌ Error during seeding:', error)
    process.exit(1)
  }
}

main()

