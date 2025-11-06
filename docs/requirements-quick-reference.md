# Requirements Quick Reference

## Digital Twin Module (DT-01 to DT-20)

### High Priority
- **DT-01**: Factory Layout Dashboard - Interactive SVG/canvas view
- **DT-02**: Machine Tile Status - Color-coded health indicators  
- **DT-03**: Machine Detail Modal - Metrics, trends, maintenance history
- **DT-07**: Alert Notifications - Display and manage alerts
- **DT-08**: Ticket Creation from Alert - One-click maintenance ticket
- **DT-09**: Maintenance Workflow - CRUD for tickets
- **DT-12**: Authentication/Roles - Role-based access control

### Medium Priority
- **DT-04**: Filtering & Search - Filter by type, status, zone
- **DT-05**: Health Trend Charting - 24h/7d trends
- **DT-06**: Anomaly Detection (Prototype) - ML stub
- **DT-13**: Zone Summary Cards - Aggregated KPIs
- **DT-15**: Dryer Humidity Sensor Display
- **DT-18**: Settings / Threshold Config

### Low Priority / Future
- **DT-10**: Preventive Maintenance Schedule
- **DT-11**: Operator Comments / Logs
- **DT-14**: Load / Bin Weight Integration
- **DT-16**: Data Logging & Audit Trail
- **DT-17**: Reporting & Export
- **DT-19**: Multi-Facility Framework
- **DT-20**: System Health Monitor

---

## Capital Asset Management Module (CAM-01 to CAM-26)

### High Priority
- **CAM-01**: Asset Registry - System of record
- **CAM-02**: Asset Detail View - Full profile
- **CAM-03**: Asset Creation & Import - Manual + CSV
- **CAM-05**: Service Life & Age Tracking
- **CAM-07**: Downtime Tracking - MTBF/MTTR
- **CAM-08**: Maintenance Ticket Integration
- **CAM-09**: Preventive Maintenance Plan
- **CAM-11**: Parts & Repair Cost Tracking
- **CAM-13**: Total Cost of Ownership (TCO)
- **CAM-15**: Replacement Priority Index
- **CAM-22**: KPI Overview Cards

### Medium Priority
- **CAM-04**: Asset Classification - Tagging
- **CAM-06**: Utilization Metrics
- **CAM-10**: PM vs Reactive Analysis
- **CAM-14**: Degradation Forecasting
- **CAM-16**: Replacement Roadmap View
- **CAM-18**: Capex Planning Dashboard
- **CAM-19**: Multi-Facility Asset Views
- **CAM-20**: Role-Based Views
- **CAM-21**: Search & Advanced Filters
- **CAM-24**: Audit Trail & Change History
- **CAM-25**: Configurable Parameters

### Low Priority
- **CAM-23**: Download / Export
- **CAM-26**: Integration Hooks

---

## Social Pulse Module (SP-01 to SP-11)

### High Priority
- **SP-01**: Social Feed Ingestion (Mock) - Unified feed
- **SP-02**: Post Detail View - Full post info
- **SP-03**: Filtering & Search - Platform, sentiment, category
- **SP-04**: Sentiment Scoring (Mock) - NPS 1-10
- **SP-05**: Issue Classification - Root cause tags
- **SP-07**: Brand Health Dashboard - Aggregate NPS

### Medium Priority
- **SP-06**: Occasion Detection - Context identification
- **SP-08**: Alerts on Emerging Issues - Spike detection
- **SP-09**: Action & Engagement Stub - Response tracking
- **SP-10**: Post-Resolution Re-Score - Sentiment improvement

### Low Priority
- **SP-11**: Link to Ops / Quality - Cross-reference framework

---

## Routes Structure

```
/login              - Authentication
/dashboard          - Digital Twin overview (DT-01, DT-05, DT-13)
/machines/[id]      - Machine detail (DT-03, DT-05, DT-11)
/maintenance        - Tickets & workflows (DT-09, DT-10)
/assets             - CAM asset registry & KPIs (CAM-01..CAM-05, CAM-22)
/assets/[id]        - Asset detail & lifecycle (CAM-02, CAM-07..CAM-15)
/capex              - Replacement roadmap & capex planning (CAM-16..CAM-18)
/sentiment          - Social Pulse feed & dashboards (SP-01..SP-08)
```

---

## Key Database Tables

### Core Tables
- `users` - User accounts and roles
- `facilities` - Facility locations (EWR, DFW, etc.)
- `machines` - Machine registry
- `assets` - Capital asset registry
- `asset_types` - Asset classification

### Sensor & Monitoring
- `sensor_data` - IoT sensor readings (time series)
- `alerts` - Active alerts and notifications
- `thresholds` - Alert threshold configuration

### Maintenance
- `maintenance_tickets` - Work orders and tickets
- `maintenance_schedule` - Scheduled maintenance
- `pm_templates` - Preventive maintenance templates
- `pm_tasks` - PM task instances

### Asset Management
- `downtime_events` - Downtime tracking
- `asset_costs` - Parts, labor, energy costs
- `cam_config` - CAM configuration and scoring weights

### Social Pulse
- `social_posts` - Social media posts
- `social_actions` - Response/engagement tracking
- `sentiment_aggregates` - Aggregated sentiment metrics

### Audit & Logging
- `audit_log` - User action audit trail

---

## Performance Targets

- Dashboard load: < 2 seconds
- Real-time refresh: ≤ 5 seconds
- Registry load: ≤ 3 seconds for 1000 assets
- Filter operations: < 1 second
- Social feed load: ≤ 2 seconds for 100 posts

---

## Tech Stack Summary

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Date Handling**: date-fns


