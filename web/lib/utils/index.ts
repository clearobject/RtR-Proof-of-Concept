// Utility functions

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase()
  const colors: Record<string, string> = {
    operational: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    maintenance: 'bg-blue-500',
    offline: 'bg-gray-500',
    open: 'bg-red-500',
    'in_progress': 'bg-yellow-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500',
    active: 'bg-green-500',
    retired: 'bg-gray-500',
  }
  return colors[normalizedStatus] || 'bg-gray-500'
}

export function formatStatus(status: string): string {
  // Handle underscores in status values
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getSeverityColor(severity: string): string {
  const normalizedSeverity = severity.toLowerCase()
  const colors: Record<string, string> = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  }
  return colors[normalizedSeverity] || 'bg-gray-500'
}

export function formatCriticality(criticality: string): string {
  return criticality.charAt(0).toUpperCase() + criticality.slice(1).toLowerCase()
}

export function getSentimentColor(score: number): string {
  if (score >= 8) return 'text-green-600'
  if (score >= 6) return 'text-yellow-600'
  if (score >= 4) return 'text-orange-600'
  return 'text-red-600'
}

export function calculateAge(inServiceDate: string, expectedLifeYears?: number): {
  years: number
  percentage: number
} {
  const now = new Date()
  const start = new Date(inServiceDate)
  const years = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365)
  
  let percentage = 0
  if (expectedLifeYears) {
    percentage = Math.min((years / expectedLifeYears) * 100, 100)
  }
  
  return { years: Math.round(years * 10) / 10, percentage }
}

// Re-export CAM utilities
export * from './cam'

