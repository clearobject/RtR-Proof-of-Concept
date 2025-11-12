// Capital Asset Management utility functions

import { Asset, AssetCost, DowntimeEvent, MaintenanceTicket } from '@/lib/types'

export interface TCOData {
  purchaseCost: number
  maintenanceCost: number
  downtimeCost: number
  energyCost: number
  total: number
}

export interface ReplacementPriorityScore {
  assetId: string
  score: number
  factors: {
    age: number
    cost: number
    downtime: number
    criticality: number
  }
}

/**
 * Calculate Total Cost of Ownership for an asset
 */
export function calculateTCO(
  asset: Asset,
  costs: AssetCost[],
  downtimeEvents: DowntimeEvent[],
  estimatedHourlyDowntimeCost: number = 100
): TCOData {
  // Get acquisition cost from asset record (if available)
  const purchaseCost = (asset as any).acquisition_cost || 0
  const maintenanceCost = costs.reduce((sum, cost) => sum + Number(cost.amount), 0)
  
  // Calculate downtime cost (estimated)
  const totalDowntimeMinutes = downtimeEvents
    .filter((d) => d.duration_minutes)
    .reduce((sum, d) => sum + (d.duration_minutes || 0), 0)
  const downtimeCost = (totalDowntimeMinutes / 60) * estimatedHourlyDowntimeCost
  
  // Energy cost from costs table
  const energyCost = costs
    .filter((c) => c.type === 'energy')
    .reduce((sum, c) => sum + Number(c.amount), 0)
  
  const total = purchaseCost + maintenanceCost + downtimeCost + energyCost
  
  return {
    purchaseCost,
    maintenanceCost,
    downtimeCost,
    energyCost,
    total,
  }
}

/**
 * Calculate Replacement Priority Index
 * Higher score = higher priority for replacement
 */
export function calculateReplacementPriority(
  asset: Asset,
  costs: AssetCost[],
  downtimeEvents: DowntimeEvent[],
  tickets: MaintenanceTicket[]
): ReplacementPriorityScore {
  const age = calculateAssetAge(asset.in_service_date, asset.expected_life_years)
  
  // Age factor (0-40 points): older assets score higher
  const ageFactor = Math.min(age.percentage / 100 * 40, 40)
  
  // Cost factor (0-30 points): higher maintenance costs score higher
  const totalMaintenanceCost = costs.reduce((sum, c) => sum + Number(c.amount), 0)
  const costFactor = Math.min(totalMaintenanceCost / 10000 * 30, 30) // Normalize to $10k
  
  // Downtime factor (0-20 points): more downtime events score higher
  const unplannedDowntime = downtimeEvents.filter((d) => 
    d.type === 'Unplanned'
  ).length
  const downtimeFactor = Math.min(unplannedDowntime / 10 * 20, 20)
  
  // Criticality factor (0-10 points)
  const criticalityMap: Record<string, number> = {
    Critical: 10,
    High: 7,
    Medium: 4,
    Low: 1,
    // Support lowercase for backward compatibility
    critical: 10,
    high: 7,
    medium: 4,
    low: 1,
  }
  const criticalityFactor = criticalityMap[asset.criticality] || 0
  
  const totalScore = ageFactor + costFactor + downtimeFactor + criticalityFactor
  
  return {
    assetId: asset.id,
    score: Math.round(totalScore * 10) / 10, // Round to 1 decimal
    factors: {
      age: Math.round(ageFactor * 10) / 10,
      cost: Math.round(costFactor * 10) / 10,
      downtime: Math.round(downtimeFactor * 10) / 10,
      criticality: criticalityFactor,
    },
  }
}

/**
 * Calculate asset age and remaining life percentage
 */
export function calculateAssetAge(
  inServiceDate: string,
  expectedLifeYears?: number
): {
  years: number
  months: number
  percentage: number
  remainingYears?: number
} {
  const now = new Date()
  const start = new Date(inServiceDate)
  const diffMs = now.getTime() - start.getTime()
  const years = diffMs / (1000 * 60 * 60 * 24 * 365)
  const months = (years % 1) * 12
  
  let percentage = 0
  let remainingYears: number | undefined
  
  if (expectedLifeYears) {
    percentage = Math.min((years / expectedLifeYears) * 100, 100)
    remainingYears = Math.max(expectedLifeYears - years, 0)
  }
  
  return {
    years: Math.round(years * 10) / 10,
    months: Math.round(months),
    percentage: Math.round(percentage * 10) / 10,
    remainingYears: remainingYears ? Math.round(remainingYears * 10) / 10 : undefined,
  }
}

/**
 * Calculate MTBF (Mean Time Between Failures) and MTTR (Mean Time To Repair)
 */
export function calculateMTBFMTTR(
  downtimeEvents: DowntimeEvent[]
): {
  mtbf: number | null // hours
  mttr: number | null // hours
  totalDowntimeHours: number
  failureCount: number
} {
  const unplannedEvents = downtimeEvents.filter((d) => d.type === 'Unplanned' && d.duration_minutes)
  
  if (unplannedEvents.length === 0) {
    return {
      mtbf: null,
      mttr: null,
      totalDowntimeHours: 0,
      failureCount: 0,
    }
  }
  
  const totalDowntimeMinutes = unplannedEvents.reduce(
    (sum, d) => sum + (d.duration_minutes || 0),
    0
  )
  const totalDowntimeHours = totalDowntimeMinutes / 60
  const mttr = totalDowntimeHours / unplannedEvents.length
  
  // For MTBF, we'd need operational hours between failures
  // This is a simplified calculation
  const mtbf = null // Would require operational time tracking
  
  return {
    mtbf,
    mttr: Math.round(mttr * 10) / 10,
    totalDowntimeHours: Math.round(totalDowntimeHours * 10) / 10,
    failureCount: unplannedEvents.length,
  }
}

/**
 * Calculate PM vs Reactive Maintenance Ratio
 */
export function calculatePMMRatio(
  tickets: MaintenanceTicket[],
  pmTaskCount: number
): {
  pmCount: number
  reactiveCount: number
  ratio: number
  percentage: number
} {
  const reactiveCount = tickets.length
  const pmCount = pmTaskCount
  
  const total = pmCount + reactiveCount
  const ratio = total > 0 ? pmCount / reactiveCount : 0
  const percentage = total > 0 ? (pmCount / total) * 100 : 0
  
  return {
    pmCount,
    reactiveCount,
    ratio: Math.round(ratio * 100) / 100,
    percentage: Math.round(percentage * 10) / 10,
  }
}

