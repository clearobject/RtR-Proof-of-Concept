# Cursor Brief – Rent the Runway Operations Prototype

This project is a prototype web application for Rent the Runway.

**Objective**

Build a proof-of-concept app with three main modules:

1. **Digital Twin (DT-01..DT-20)**  
   - Interactive factory layout for the New Jersey facility.
   - Machine tiles with health status, alerts, and basic anomaly detection.
   - Ties into maintenance tickets.

2. **Capital Asset Management (CAM-01..CAM-26)**  
   - System of record for all assets.
   - Tracks age, utilization, downtime, maintenance costs, and total cost of ownership.
   - Produces a replacement priority index and capex planning views.

3. **Social Pulse (SP-xx)**  
   - Unified social feed (mock data for now).
   - Sentiment scoring (NPS-like), issue categorization, and trend dashboards.

**Tech Stack (Prototype)**

- Frontend: Next.js 14 (App Router, TypeScript)
- Backend: Supabase (Postgres + Auth, RLS)
- Hosting: Vercel connected to this GitHub repo
- AI: Cursor AI will be used to generate and refactor code
- Data: Mix of real DB schema and mock APIs for IoT and social data

**Documentation**

- `docs/requirements-overview.md` contains the full functional and non-functional requirements,
  with IDs like DT-01, CAM-01, and SP-01.
- `supabase/001_init_schema.sql` (to be created) will define the database schema.

When implementing features, always refer back to the requirement IDs and the docs.
