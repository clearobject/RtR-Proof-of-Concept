# Rent the Runway Operations Prototype - Development Plan

## Executive Summary

This document outlines a phased development plan for building a professional proof-of-concept application showcasing three core modules:
1. **Digital Twin** - Factory floor visualization and machine health monitoring
2. **Capital Asset Management** - Asset lifecycle and maintenance tracking
3. **Social Pulse** - Customer sentiment analysis and brand health monitoring

## Project Overview

**Tech Stack:**
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + RLS)
- Hosting: Vercel
- Charts: Recharts or Chart.js
- State Management: React hooks + Server Components

**Target Timeline:** Professional POC ready for demonstration

## Development Phases

### Phase 1: Foundation & Infrastructure (Week 1)
**Goal:** Set up core infrastructure, database schema, and authentication

#### Tasks:
1. **Supabase Setup**
   - Create Supabase project
   - Configure authentication (email/password, role-based access)
   - Set up Row Level Security (RLS) policies
   - Create database schema migrations

2. **Database Schema Design**
   - Core tables: `users`, `facilities`, `machines`, `assets`
   - Sensor data: `sensor_data`, `alerts`
   - Maintenance: `maintenance_tickets`, `maintenance_schedule`, `pm_templates`
   - Asset management: `asset_types`, `downtime_events`, `asset_costs`, `cam_config`
   - Social: `social_posts`, `social_actions`, `sentiment_aggregates`
   - Audit: `audit_log`
   - Create migration files in `supabase/migrations/`

3. **Project Structure**
   - Set up feature-based folder structure
   - Create shared components library
   - Set up API routes structure
   - Configure environment variables

4. **Authentication System**
   - Implement Supabase Auth integration
   - Create login/logout pages
   - Role-based access control (operator, maintenance, manager, admin)
   - Protected route middleware

5. **UI Foundation**
   - Design system / component library
   - Navigation structure
   - Layout components (header, sidebar, footer)
   - Responsive design framework

**Deliverables:**
- ✅ Working authentication system
- ✅ Complete database schema
- ✅ Basic navigation and layout
- ✅ Environment configuration

---

### Phase 2: Digital Twin Module (Week 2-3)
**Goal:** Build interactive factory floor visualization with machine health monitoring

#### Priority Features (High Priority):
- **DT-01:** Factory Layout Dashboard - Interactive SVG/canvas view
- **DT-02:** Machine Tile Status - Color-coded health indicators
- **DT-03:** Machine Detail Modal - Metrics, trends, maintenance history
- **DT-07:** Alert Notifications - Display and manage alerts
- **DT-08:** Ticket Creation from Alert - One-click maintenance ticket creation
- **DT-09:** Maintenance Workflow - CRUD for tickets
- **DT-12:** Authentication/Roles - Already in Phase 1

#### Secondary Features (Medium Priority):
- **DT-04:** Filtering & Search - Filter by equipment type, status, zone
- **DT-05:** Health Trend Charting - 24h/7d trend visualization
- **DT-13:** Zone Summary Cards - Aggregated KPIs per zone
- **DT-06:** Anomaly Detection (Prototype) - Basic ML stub

#### Implementation Steps:
1. **Factory Layout Component**
   - Create SVG-based factory floor layout (New Jersey facility)
   - Define zones (Inbound, Tagging, Wet Cleaning, Dry Clean, QC, Pressing, Bagging)
   - Make layout interactive and responsive

2. **Machine Tile System**
   - Create machine tile component with health status colors
   - Implement real-time status updates
   - Add tooltips with key metrics
   - Connect to sensor data

3. **Machine Detail View**
   - Build detail modal/page (`/machines/[id]`)
   - Display current metrics (temp, vibration, power, humidity)
   - Show maintenance history
   - Display recent alerts
   - Add trend charts (Recharts)

4. **Alert System**
   - Create alerts table and API
   - Alert notification UI (toast notifications)
   - Alert list view
   - Acknowledge/close functionality

5. **Maintenance Ticket System**
   - Ticket CRUD operations
   - Ticket list view with filters
   - Ticket detail view
   - Status workflow (open, in-progress, resolved, closed)
   - Link tickets to machines/assets

6. **Mock IoT Integration**
   - Create mock API endpoints for sensor data
   - Simulate real-time data updates
   - Generate sample sensor readings

**Deliverables:**
- ✅ Interactive factory floor dashboard (`/dashboard`)
- ✅ Machine detail pages (`/machines/[id]`)
- ✅ Maintenance ticket system (`/maintenance`)
- ✅ Alert notification system
- ✅ Mock IoT data endpoints

---

### Phase 3: Capital Asset Management Module (Week 4-5)
**Goal:** Build comprehensive asset registry and lifecycle management system

#### Priority Features (High Priority):
- **CAM-01:** Asset Registry - System of record for all assets
- **CAM-02:** Asset Detail View - Full asset profile
- **CAM-03:** Asset Creation & Import - Manual and CSV import
- **CAM-05:** Service Life & Age Tracking - Age calculation and indicators
- **CAM-07:** Downtime Tracking - Log downtime events
- **CAM-08:** Maintenance Ticket Integration - Link tickets to assets
- **CAM-09:** Preventive Maintenance Plan - PM scheduling
- **CAM-11:** Parts & Repair Cost Tracking - Cost tracking
- **CAM-13:** Total Cost of Ownership - TCO calculation
- **CAM-15:** Replacement Priority Index - Scoring algorithm
- **CAM-22:** KPI Overview Cards - Dashboard summary

#### Secondary Features (Medium Priority):
- **CAM-04:** Asset Classification - Tagging system
- **CAM-06:** Utilization Metrics - Usage tracking
- **CAM-10:** PM vs Reactive Analysis - Maintenance ratio analysis
- **CAM-14:** Degradation Forecasting - Remaining life estimation
- **CAM-16:** Replacement Roadmap View - Timeline visualization
- **CAM-18:** Capex Planning Dashboard - Capital planning views

#### Implementation Steps:
1. **Asset Registry**
   - Asset list view (`/assets`)
   - Asset filters and search
   - Asset cards/table display
   - Asset creation form

2. **Asset Detail Page**
   - Comprehensive asset profile (`/assets/[id]`)
   - Asset metadata display
   - Maintenance history
   - Cost breakdown
   - Utilization metrics
   - Age and lifecycle indicators

3. **Asset Import System**
   - CSV upload functionality
   - Data validation
   - Import preview and confirmation
   - Error handling

4. **Downtime Tracking**
   - Downtime event logging
   - Planned vs unplanned categorization
   - MTBF/MTTR calculations
   - Downtime history view

5. **Preventive Maintenance**
   - PM template creation
   - PM task scheduling
   - PM calendar view
   - PM completion tracking

6. **Cost Tracking**
   - Parts cost entry
   - Labor cost tracking
   - Energy consumption (estimated)
   - Cost aggregation and reporting

7. **TCO & Replacement Priority**
   - TCO calculation algorithm
   - Replacement priority scoring
   - Priority ranking view
   - Replacement roadmap timeline

8. **Capex Dashboard**
   - Upcoming replacements view (`/capex`)
   - Budget planning interface
   - Export functionality (CSV)

**Deliverables:**
- ✅ Asset registry (`/assets`)
- ✅ Asset detail pages (`/assets/[id]`)
- ✅ Maintenance integration
- ✅ Replacement priority system
- ✅ Capex planning dashboard (`/capex`)

---

### Phase 4: Social Pulse Module (Week 6)
**Goal:** Build social media sentiment monitoring and brand health dashboard

#### Priority Features (High Priority):
- **SP-01:** Social Feed Ingestion (Mock) - Unified post feed
- **SP-02:** Post Detail View - Full post information
- **SP-03:** Filtering & Search - Filter by platform, sentiment, category
- **SP-04:** Sentiment Scoring (Mock) - NPS-like scoring (1-10)
- **SP-05:** Issue Classification - Root cause categorization
- **SP-07:** Brand Health Dashboard - Aggregate NPS and trends

#### Secondary Features (Medium Priority):
- **SP-06:** Occasion Detection - Context identification
- **SP-08:** Alerts on Emerging Issues - Spike detection
- **SP-09:** Action & Engagement Stub - Response tracking
- **SP-10:** Post-Resolution Re-Score - Sentiment improvement tracking

#### Implementation Steps:
1. **Social Feed**
   - Mock social posts API endpoint
   - Post feed component (`/sentiment`)
   - Post card display
   - Infinite scroll or pagination

2. **Post Detail View**
   - Post detail modal/page
   - Full post content
   - Engagement metrics
   - Sentiment score display
   - Category tags

3. **Filtering System**
   - Filter by platform (Instagram, TikTok, Reddit, Facebook, X)
   - Filter by sentiment range
   - Filter by category (fit, quality, delivery, etc.)
   - Date range filtering
   - Search functionality

4. **Sentiment Analysis**
   - Mock sentiment scoring algorithm
   - NPS calculation (1-10 scale)
   - Sentiment visualization (color coding)
   - Sentiment distribution charts

5. **Issue Classification**
   - Category tagging system
   - Category chips/badges
   - Category-based filtering
   - Category statistics

6. **Brand Health Dashboard**
   - NPS by platform chart
   - NPS by category chart
   - Trend visualization over time
   - KPI cards (overall NPS, post volume, sentiment distribution)

7. **Mock Data Generation**
   - Generate realistic mock social posts
   - Include various platforms, sentiments, categories
   - Historical data simulation

**Deliverables:**
- ✅ Social feed page (`/sentiment`)
- ✅ Post detail views
- ✅ Sentiment scoring and visualization
- ✅ Brand health dashboard
- ✅ Mock social data API

---

### Phase 5: Polish & Integration (Week 7)
**Goal:** Integrate modules, add polish, and prepare for demonstration

#### Tasks:
1. **Cross-Module Integration**
   - Link social posts to operational issues (framework)
   - Connect machine alerts to asset records
   - Unified navigation between modules
   - Consistent UI/UX across modules

2. **Data Seeding**
   - Generate comprehensive mock data
   - Seed database with realistic scenarios
   - Create demo-ready data sets

3. **Performance Optimization**
   - Optimize database queries
   - Implement caching where appropriate
   - Optimize bundle size
   - Ensure < 2s load times

4. **UI/UX Polish**
   - Consistent design system
   - Responsive design testing
   - Loading states
   - Error handling
   - Empty states
   - Accessibility improvements

5. **Documentation**
   - API documentation
   - Component documentation
   - User guide (basic)
   - Deployment guide

6. **Testing & Bug Fixes**
   - End-to-end testing
   - Bug fixes
   - Edge case handling
   - Browser compatibility

7. **Deployment Preparation**
   - Vercel deployment configuration
   - Environment variables setup
   - Supabase production configuration
   - Domain configuration (if needed)

**Deliverables:**
- ✅ Fully integrated application
- ✅ Polished UI/UX
- ✅ Comprehensive mock data
- ✅ Production-ready deployment
- ✅ Documentation

---

## Technical Architecture

### Folder Structure
```
web/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── dashboard/          # Digital Twin
│   │   ├── machines/[id]/
│   │   ├── maintenance/
│   │   ├── assets/             # CAM Module
│   │   ├── assets/[id]/
│   │   ├── capex/
│   │   └── sentiment/         # Social Pulse
│   ├── api/
│   │   ├── sensors/           # Mock IoT endpoints
│   │   ├── social/            # Mock social endpoints
│   │   └── anomaly/           # ML stub
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # Shared UI components
│   ├── digital-twin/          # DT-specific components
│   ├── cam/                   # CAM-specific components
│   └── social-pulse/          # SP-specific components
├── lib/
│   ├── supabase/             # Supabase client & utilities
│   ├── utils/                # Helper functions
│   └── types/                # TypeScript types
├── supabase/
│   └── migrations/           # Database migrations
└── public/
    └── layouts/              # Factory layout SVGs
```

### Key Dependencies to Add
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "recharts": "^2.x",
    "date-fns": "^3.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "lucide-react": "^0.x"
  }
}
```

### Database Schema Highlights
- **machines**: id, name, type, zone, facility_id, status, coordinates
- **sensor_data**: id, machine_id, timestamp, temperature, vibration, power, humidity
- **assets**: id, name, type, manufacturer, serial, in_service_date, expected_life
- **maintenance_tickets**: id, asset_id, machine_id, status, priority, created_at
- **social_posts**: id, platform, content, sentiment_score, category, posted_at
- **alerts**: id, machine_id, severity, message, acknowledged_at

---

## Success Criteria

### Functional Requirements
- ✅ All high-priority features from DT, CAM, and SP modules implemented
- ✅ Authentication and role-based access working
- ✅ CRUD operations functional for all core entities
- ✅ Mock data integration working
- ✅ Cross-module navigation seamless

### Performance Requirements
- ✅ Dashboard load time < 2 seconds
- ✅ Real-time refresh ≤ 5 seconds
- ✅ Supports 200+ machine records without degradation
- ✅ Handles 100+ social posts efficiently

### Quality Requirements
- ✅ Professional UI/UX design
- ✅ Responsive design (desktop + tablet)
- ✅ Error handling and graceful fallbacks
- ✅ Code quality and maintainability
- ✅ TypeScript type safety

---

## Risk Mitigation

1. **Supabase Setup Complexity**
   - Start early with Supabase configuration
   - Test RLS policies thoroughly
   - Document authentication flow

2. **Mock Data Realism**
   - Create comprehensive mock data generators
   - Ensure data relationships are realistic
   - Test edge cases

3. **Performance with Large Datasets**
   - Implement pagination early
   - Use database indexes
   - Optimize queries

4. **UI/UX Consistency**
   - Establish design system early
   - Create reusable components
   - Regular design reviews

---

## Next Steps

1. **Immediate Actions:**
   - Set up Supabase project
   - Create database schema migrations
   - Install required dependencies
   - Set up project folder structure

2. **Week 1 Focus:**
   - Complete Phase 1 (Foundation)
   - Begin Phase 2 (Digital Twin basics)

3. **Iterative Development:**
   - Build features incrementally
   - Test as you go
   - Gather feedback early

---

## Notes

- This plan prioritizes high-impact features for a professional POC
- Lower-priority features can be added post-POC if time permits
- Mock data will be used throughout for IoT and social feeds
- Real integrations can be added in future phases
- Focus on demonstrating value and capabilities, not production-hardening


