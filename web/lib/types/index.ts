// Type definitions for the application

export type UserRole = 'operator' | 'maintenance' | 'manager' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Facility {
  id: string
  name: string
  code: string // EWR, DFW, etc.
  address?: string
  created_at: string
}

export interface Machine {
  id: string
  name: string
  asset_alias?: string
  type: string // washer, dryer, dry_cleaner, etc.
  zone: string // Inbound, Tagging, Wet Cleaning, etc.
  facility_id: string
  status: 'operational' | 'warning' | 'critical' | 'maintenance' | 'offline'
  coordinates?: { x: number; y: number }
  manufacturer?: string
  model?: string
  serial_number?: string
  created_at: string
  updated_at: string
}

export interface SensorData {
  id: string
  machine_id: string
  timestamp: string
  temperature?: number
  vibration?: number
  power?: number
  humidity?: number
  flow_rate?: number
  created_at: string
}

export interface Alert {
  id: string
  machine_id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  created_at: string
}

export interface MaintenanceTicket {
  id: string
  machine_id?: string
  asset_id?: string
  alert_id?: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  created_by: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface Asset {
  id: string
  alias?: string
  name: string
  type: string
  manufacturer?: string
  model?: string
  serial_number?: string
  facility_id: string
  zone?: string
  in_service_date: string
  expected_life_years?: number
  criticality: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'maintenance' | 'retired'
  created_at: string
  updated_at: string
}

export interface DowntimeEvent {
  id: string
  asset_id: string
  machine_id?: string
  start_time: string
  end_time?: string
  duration_minutes?: number
  type: 'planned' | 'unplanned'
  cause?: string
  impact?: string
  created_at: string
}

export interface SocialPost {
  id: string
  platform: 'instagram' | 'tiktok' | 'reddit' | 'facebook' | 'twitter' | 'trustpilot'
  content: string
  author?: string
  sentiment_score: number // 1-10 NPS-like score
  category?: string // fit, quality, delivery, customer_service, etc.
  occasion?: string // wedding, gala, interview, etc.
  engagement_count?: number
  posted_at: string
  created_at: string
}

export interface AssetCost {
  id: string
  asset_id: string
  maintenance_ticket_id?: string
  type: 'parts' | 'labor' | 'energy' | 'other'
  amount: number
  description?: string
  date: string
  created_at: string
}

export interface InviteToken {
  id: string
  token: string
  created_by: string
  email?: string
  role: UserRole
  facility_id?: string
  expires_at: string
  used_at?: string
  used_by?: string
  max_uses: number
  current_uses: number
  created_at: string
  updated_at: string
}

export interface UserProfile extends User {
  facility_id?: string
  updated_at: string
}


