
#Executive Summary
This document presents a set of high-impact initiatives developed by ClearObject following an initial engagement focused on computer vision and IoT systems. The opportunities span operational excellence, customer experience, asset performance, and a customer sentiment analysis. The initiatives were identified through deploying deep expertise and a thorough process involving on-site observations, interviews, and workflow reviews.
The core objective of this document is to draft a set of requirements for the architecture of a new web application to streamline Rent the Runway’s operations and deliver an unprecedented level of operational insights into processes and customer experience.
The core features of this application include:
- Operational Excellence
  - Custom Application for Lean Decision-Making & Operational Insights (Digital Twin):  A factory-floor Digital Twin application that unifies sensor data, machine HMI, and operational status into a single, interactive, colorized layout for faster problem detection and decision-making.
  - Capital Asset Management & Maintenance System:  A system of record to unify asset registry, condition, maintenance, and cost data, enabling proactive preventative maintenance, degradation forecasts, and optimizing end-of-life decisions.
  - Bin / Washer Weight Optimization System:  Connecting load cells to garment bins to precisely measure weight and communicating the load status to operators to optimize washer capacity and prevent variable quality from over/under-loading.
  - Machine Intelligence:  There are >100 machines at Rent the Runway’s New Jersey facility which span industrial washing machines, dryers, and dry cleaning machines.  Some of these machines contain data feeds out of the machine, but may be difficult to tap into.  Some machines do not have any instrumentation, so the intent is to install an array of IoT sensors to these machines to build a complete understanding of machine characteristics.
- Customer Experience
  - System for Sustainable Brand “Voice” — Social Pulse:  A cross-platform social intelligence tool that aggregates and applies AI-driven sentiment modeling to customer conversations for real-time brand health monitoring (NPS) and operational action.

# Prototype Scope and Deliverables
The prototype will include:
- A web dashboard for viewing factory layout and equipment health.
- CRUD operations for assets, maintenance tickets, and sensor records.
- Sample data ingestion from mock IoT endpoints.
- Integration stubs (not live connections) for social sentiment APIs.

Out of scope:
- Production-level authentication and data security hardening.
- Real-time streaming ingestion.
- Deployment to multiple sites.

# Application Tech Stack (Prototype)
This document will outline the specifications for a prototype proof of concept application.  This proof of concept will serve as a launching point for rapid prototyping and iteration to prove out concepts and user stories without incurring the larger cost of formal app development. 
Note: the below tech stack is configured for rapid prototyping and iterative development.  The system is not configured for a production application and the production environment will be carefully engineered and integrated into Rent the Runway’s IT infrastructure requirements.

The core systems powering this application will be,
- Code Development:  Code development will be generated through meticulous prompts and requirements specifications through a custom configured artificial intelligence coding platform, Cursor AI.
- Code Repository: All files will be stored in GitHub
- Infrastructure:  Hosting, compute, and build will be powered by Vercel
- Authentication and Database:  All authentication and data will be encrypted and stored within a private Supabase postgres database
- Frontend: Next.js 14 (App Router) hosted on Vercel.
- Backend: Supabase (PostgreSQL + Edge Functions) for database, authentication, and storage.
- Integration Layer: Simulated IoT API endpoints returning JSON payloads for machine telemetry.
- AI Layer: Placeholder routes to OpenAI endpoints for anomaly detection and sentiment analysis.
- Data Flow:
  - IoT JSON data → Supabase “sensor_data” table.
  - Cursor AI backend → processes data → populates dashboard via React hooks.
  - User interactions (tickets, maintenance logs) → Supabase “work_orders” table.

# Proposed Frontend Routes
/login – Auth screen
/dashboard – Digital Twin overview (DT-01..DT-05, DT-13)
/machines/[id] – Machine detail (DT-03, DT-05, DT-11)
/maintenance – Tickets & workflows (DT-09, DT-10)
/assets – CAM asset registry & KPIs (CAM-01..CAM-05, CAM-22)
/assets/[id] – Asset detail & lifecycle (CAM-02, CAM-07..CAM-15)
/capex – Replacement roadmap & capex planning (CAM-16..CAM-18)
/sentiment – Social Pulse feed & dashboards (SP-01..SP-08)

# Custom Application for Lean Decision-Making & Operational Insights (Digital Twin)
## Problem
Operators and leaders lack a single source of truth for plant health; status lives in equipment HMIs, spreadsheets, and tribal knowledge.  Early warnings are missed or are non-existent leading to multi-week delays in detecting quality issues, and machine preventative maintenance is impeded.  

## Opportunity / Solution Concept
A factory-floor Digital Twin: an interactive layout of each zone (Inbound, Tagging, Wet Cleaning, Dry Clean & Spotting, QC, Pressing, Bagging, etc.). The layout on the application would be a digital representation of the factory floor (specific to each plant location) with colorized status indicators for each machine.
Every machine is a sensor-backed “tile” that ingests data from IOT sensors and machine HMI to deliver concise views into holistic plant operations.  Filters applied to the diagram enable the user to toggle between machine/operation types to observe operational specifics for each operation category.  Initial proposed filter types include,
- View All
- Dryers
- Dry Cleaners
- Washing Machines
- Soaping Pumps
- Line/Conveyor Operations

A necessary predecessor to implementing such a system is to instrument equipment with IOT sensors and to establish a pipeline of data from each piece of equipment to aggregate within the application.  This opportunity to showcase a longer term vision for enhanced and intelligent plant operations.  The below image represents the factory floor layout of the New Jersey Facility.  The image contains boxes representing the equipment installed in the facility and the colors represent machine health status.  Machine health status is captured through a system of API integrations and installed IOT sensors.  

## Value Levers
- Faster problem detection drives decreased downtime, lower scaled impact of defects, and higher throughput.
- Shorter decision latency from floor to leadership.  IF a problem exists, we reduce the decision cycle time for return-to-service from weeks to hours.
- Institutionalizes lean behaviors (visual management, standard work, andon).

## Application Success Metrics
- Load time < 2s
- Successful CRUD ops for all tables
- Sentiment dashboard updates within 10s of refresh
- Simulated anomaly detection accuracy ±10%

## Key Application User Stories
- Web Application interface
- Orchestration of IoT sensors and data from enterprise data systems to provide real-time operational insights on the health and operations of the factory floor.
- Maintenance management system:
  - Real-time ticketing and workflow management
  - Operational data tied to maintenance demands
- Workflow automation and resolution
  - Automated ticketing, action tracking, work requests, and communication
  - Enable corrective and preventive action workflows
- Digital Twin of Customer Experience
  - Web scraping of data from social media platforms (Instagram, TikTok, Reddit, Facebook, and X).  Data to be analyzed, customer sentiment extracted, and generation of an NPS to evaluate overall brand and reputation health.
  - Customer sentiment and social media posts, primarily negative posts, to be associated to process metrics and correlated to operational quality (most nearly based on time, customer, and garment details).
- Soap Delivery System
  - Soap delivery sensor selection to be determined at a later date based upon commercial negotiations between solvent vendors.  For the purpose of this prototype app, the soap delivery service to align orchestration with commercial strategies and provide reliability and health insights from the dosing pumps to validate solvent was delivered to the machine and in the correct amount.
- AI/ML anomaly detection
  - Data captured from machines to be classified into categories of machine and load type, then a trend profile to be understood of how a healthy machine of that type operates, and compare to current operating parameters.  This to provide a detailed understanding of the equipment health and alert for maintenance requirements
- Dryers
  - IoT sensors installed to dryer to evaluate performance and operating characteristics to ensure no over-drying of the garments occurs.  A target humidity level will be specified, and the machine to operate until the threshold is met.
  - Monitors and screens to be installed in the dryer area to deliver metrics and machine status directly to the operators to take action.  This effort is to remove manual intervention and subjective decision making.
  - Deliver programmatic dryer temperature and time profiles based upon garment load characteristics

# Structured Requirements
## Functional Requirements
| ID    | Feature / Module                | Description / Purpose                                                                | Inputs (Source)                                  | Outputs (UI or Data)                    | Priority | Dependencies / Notes             |
| ----- | ------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ | --------------------------------------- | -------- | -------------------------------- |
| DT-01 | Factory Layout Dashboard        | Interactive SVG/canvas view of the NJ facility showing all zones.                    | `machines` table, `layout_zones.json`            | Web map with colorized tiles            | High     | Requires base layout asset       |
| DT-02 | Machine Tile Status             | Each machine represented as a tile showing current state based on sensor thresholds. | IoT JSON feed, `sensor_data`                     | Real-time color state + tooltip metrics | High     | Thresholds configurable per type |
| DT-03 | Machine Detail Modal            | Click tile → modal with metrics, trends, maintenance history, and last alerts.       | `machines`, `sensor_data`, `maintenance_tickets` | Detail modal / chart component          | High     | Uses `/machines/[id].tsx`        |
| DT-04 | Filtering & Search              | Filter by equipment type, status, zone, or keyword.                                  | Query params / user input                        | Filtered tile set and counts            | Medium   | Reusable filter component        |
| DT-05 | Health Trend Charting           | Display last 24h / 7d trend of key metrics (temp, vibration, power).                 | `sensor_data` (time series)                      | Line chart / sparkline                  | Medium   | Use Recharts or Chart.js         |
| DT-06 | Anomaly Detection (Prototype)   | Classify readings vs. baseline; flag outliers.                                       | Local ML stub `/api/anomaly`                     | Boolean flag + confidence               | Medium   | Placeholder AI route             |
| DT-07 | Alert Notifications             | Display / log active alerts when out of spec; acknowledge/close.                     | `alerts` table                                   | Toast alerts + alert list               | High     | Connects to DT-06                |
| DT-08 | Ticket Creation from Alert      | 1-click “Create Maintenance Ticket” from alert.                                      | `alerts`, `maintenance_tickets`                  | New ticket record + confirmation        | High     | Requires auth/roles              |
| DT-09 | Maintenance Workflow            | CRUD operations for tickets (status, priority, assignee, notes).                     | `maintenance_tickets`                            | Work order list + forms                 | High     | Shared with CAM module           |
| DT-10 | Preventive Maintenance Schedule | Calendar/list of upcoming PM tasks per machine.                                      | `maintenance_schedule`                           | Calendar view                           | Medium   | Phase 2                          |
| DT-11 | Operator Comments / Logs        | Operators can add notes or images for issues.                                        | User input, file upload                          | Log entries linked to machine           | Medium   | Needs Supabase storage           |
| DT-12 | Authentication / Roles          | Secure access via Supabase Auth (operator, maintenance, manager, admin).             | Supabase Auth                                    | Role-based UI access                    | High     | Shared app-wide                  |
| DT-13 | Zone Summary Cards              | Aggregated KPIs per zone (# machines OK, avg uptime, open tickets).                  | Aggregated queries                               | Dashboard cards                         | Medium   | Used on dashboard                |
| DT-14 | Load / Bin Weight Integration   | Simulated endpoint showing garment bin weight vs. target capacity.                   | Mock API `/api/loadcells`                        | Gauge chart / alert badge               | Low      | For later IoT integration        |
| DT-15 | Dryer Humidity Sensor Display   | Display humidity & temp values to prevent over-drying.                               | IoT humidity/temp data                           | Numeric display / indicator             | Medium   | Links to DT-03                   |
| DT-16 | Data Logging & Audit Trail      | Automatic logging of user actions (create/edit/acknowledge).                         | Front-end events                                 | `audit_log` table                       | Medium   | For Lean traceability            |
| DT-17 | Reporting & Export              | Export machine status/tickets to CSV or PDF.                                         | Query results                                    | Download file                           | Low      | Uses Supabase functions          |
| DT-18 | Settings / Threshold Config     | Admins can set alert thresholds per machine type.                                    | `thresholds` table                               | Settings UI + saved values              | Medium   | Requires admin role              |
| DT-19 | Multi-Facility Framework        | Support multiple sites (EWR, DFW, etc.) via facility table.                          | `facilities` table                               | Filtered dashboards by site             | Low      | Future expansion                 |
| DT-20 | System Health Monitor           | Display backend/API status (heartbeat).                                              | Health API / ping                                | Status banner/icon                      | Medium   | Improves demo reliability        |

## Non-Functional/Technical Requirements
| Category        | Requirement                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Performance     | Dashboard load < 2 s; real-time refresh ≤ 5 s.                                                                             |
| Scalability     | ≥ 200 machine records without degradation.                                                                                 |
| Reliability     | Graceful fallback if API offline.                                                                                          |
| Security        | Supabase JWT + RLS enforced per role.                                                                                      |
| Usability       | Touch-friendly layout for tablet.                                                                                          |
| Maintainability | Feature-based folders; migrations via Supabase CLI.                                                                        |
| Integration     | Mock IoT APIs emulate sensors.                                                                                             |
| Data Storage    | Core tables: `machines`, `sensor_data`, `maintenance_tickets`, `alerts`, `users`, `facilities`, `thresholds`, `audit_log`. |


# Equipment Data Integration and requirements
The initial scope of this application is for New Jersey (EWR), however, there are additional facilities located in Dallas Fort Worth and globally that will be integrated in future phases.  There are many machines on site - this section will detail the machine specifications and  details regarding building a connection strategy to capture data on the machine.

## Washing Machines
- Continental Model EH055I2102111500 series commercial washer
  - Measurement System:  Girbau Sapphire:  A 3rd party monitoring system that will need to be integrated with to capture data on the machines.  
  - Parameters measured: Water temperature, program, bath level (water fill), cycle completion, time (cycle completion to door open), error status/code
  - Custom IOT Application:  An appropriate IoT device will be deployed to measure real-time vibration and electrical consumption of the machine.  The profile and trends output from these sensors will generate insights into preventive maintenance and machine health, as well as more granular detail in machine operation.

## Dry Cleaning Machines
- Columbia TL HCS 800 N2 dry cleaning machine
  - Measurement System:  PLC on machines with ability to pull data; we have not tried, don't know what data is provided.
  - Custom IOT Application:  An appropriate IoT device will be deployed to measure real-time vibration and electrical consumption of the machine.  The profile and trends output from these sensors will generate insights into preventive maintenance and machine health, as well as more granular detail in machine operation.
- Union HL880 and HL890-K
  - Measurement System:  Machine data is logged via the iConnect system.  Real time data can be monitored, but cannot pull while the machine is running and is not stored.
  - Custom IOT Application:  An appropriate IoT device will be deployed to measure real-time vibration and electrical consumption of the machine.  The profile and trends output from these sensors will generate insights into preventive maintenance and machine health, as well as more granular detail in machine operation.
- Ipura 440N
  - Measurement System:  Unknown
  - Custom IOT Application:  An appropriate IoT device will be deployed to measure real-time vibration and electrical consumption of the machine.  The profile and trends output from these sensors will generate insights into preventive maintenance and machine health, as well as more granular detail in machine operation.

## Dryers
- Miele PT 8807D and PDR944SI
  - Measurement System:  None
  - Custom IOT Application:  An appropriate IoT device will be deployed to measure
    - Garment dryness level:  Measured by installing a temperature/humidity probe in the dryer vent discharge.  By measuring the temperature and humidity just as it exits the dryer, this will provide a close approximation of conditions inside the dryer.
    - Machine Operation Anomalies: Vibration sensor installed on machine housing, location TBD, to monitor micro-vibration of machine.  Build trend/event profile to characterize machine performance and identify statistical outliers indicating anomaly in machine to investigate.
    - Filter & Blockages:  Install flow meter in dryer discharge to build a profile of a “clean machine” to detect when filters need cleaning or blockage in pipe may exist.
- Continental CG115-125
  - Measurement System:  None
  - Custom IOT Application:  An appropriate IoT device will be deployed to measure
    - Garment dryness level:  Measured by installing a temperature/humidity probe in the dryer vent discharge.  By measuring the temperature and humidity just as it exits the dryer, this will provide a close approximation of conditions inside the dryer.
    - Machine Operation Anomalies: Vibration sensor installed on machine housing, location TBD, to monitor micro-vibration of machine.  Build trend/event profile to characterize machine performance and identify statistical outliers indicating anomaly in machine to investigate.
    - Filter & Blockages:  Install flow meter in dryer discharge to build a profile of a “clean machine” to detect when filters need cleaning or blockage in pipe may exist.

# Capital Asset Management & Maintenance System
## Problem
Rent the Runway operates a very capital intensive operation with 100s of pieces of equipment across multiple global locations.  Challenges exist in effectively managing these assets in terms of optimizing operational intelligence, readily calculating operational efficiencies, and strategically acting on end-of-life decisions.  Many actions today are reactive instead of proactive, and visibility of problems could take 6 to 8 weeks to uncover, thereby leading to increased equipment-caused defects on garments.

## Opportunity / Solution Concept
A system of record that unifies asset registry, condition, maintenance, parts cost, downtime, energy, and residual value. Produces degradation forecasts and a replacement priority index.  An effective asset management system will answer questions such as,
- What is the expected life of a piece of equipment?
- How long has an asset been in service?
- How much longer can it be used?
- How might we aggregate all the data sources around the asset (downtime, operational metric, preventative and reactive maintenance history, work requests) to optimize capital?
- Seeking to build out an optimized preventative maintenance versus reactive.
- What does end-of-life look like for different pieces of equipment?
- How might we calculate the optimal salvage time based upon equipment health to maximize resale value of equipment and develop a replacement schedule.
- This management system would contain a report of all deployed capital assets and maintain intelligence and plan for future capital needs based upon utilization, remaining life, and cash flow restrictions of business.  This system would drive enhanced capex precision and opex avoidance while reducing firefighting and enabling greater planned downtime versus unplanned.

## Functional Requirements for Capital Management System
| ID     | Feature / Module               | Description / Purpose                                           | Inputs (Source)                                | Outputs (UI or Data)       | Priority | Dependencies / Notes    |
| ------ | ------------------------------ | --------------------------------------------------------------- | ---------------------------------------------- | -------------------------- | -------- | ----------------------- |
| CAM-01 | Asset Registry                 | System of record for all capital assets.                        | `assets`, facility metadata                    | Asset list + filters       | High     | Core CAM table          |
| CAM-02 | Asset Detail View              | Full profile of asset: model, serial, utilization, maintenance. | `assets`, `sensor_data`, `maintenance_tickets` | Detail page/modal          | High     | Reuses DT-03 layout     |
| CAM-03 | Asset Creation & Import        | Manual or bulk import via CSV.                                  | CSV upload, user input                         | Asset records + import log | High     | Validate before insert  |
| CAM-04 | Asset Classification           | Tag assets by type, manufacturer, criticality, zone.            | `asset_types`, `assets`                        | Filterable tags/dropdowns  | High     | Enables analytics       |
| CAM-05 | Service Life & Age Tracking    | Track in-service date, expected life, current age.              | `assets`                                       | Age %, color indicator     | High     | Used in lifecycle logic |
| CAM-06 | Utilization Metrics            | Show cycles/day, hours/day by asset type.                       | `sensor_data`, mock usage                      | Utilization KPIs           | Medium   | Simulate if needed      |
| CAM-07 | Downtime Tracking              | Log planned/unplanned downtime, cause, impact.                  | `downtime_events`                              | MTBF/MTTR metrics          | High     | Feeds CAM analytics     |
| CAM-08 | Maintenance Ticket Integration | Link tickets directly to assets.                                | `maintenance_tickets`                          | Embedded list per asset    | High     | Shares DT ticket system |
| CAM-09 | Preventive Maintenance Plan    | Schedule PM tasks (time/usage-based).                           | `pm_templates`, `pm_tasks`                     | PM calendar view           | High     | Core PM module          |
| CAM-10 | PM vs Reactive Analysis        | Ratio of PM vs reactive maintenance.                            | `maintenance_tickets`, `pm_tasks`              | Charts/summary cards       | Medium   | Performance KPI         |
| CAM-11 | Parts & Repair Cost Tracking   | Track parts + labor costs.                                      | `maintenance_tickets`, `asset_costs`           | Cost breakdown             | High     | Needed for TCO          |
| CAM-12 | Energy Consumption Tracking    | Associate energy use for cost efficiency.                       | `energy_readings` or estimates                 | Energy charts              | Medium   | Estimations acceptable  |
| CAM-13 | Total Cost of Ownership        | Combine capex, maintenance, downtime, energy.                   | `assets`, costs tables                         | TCO summary                | High     | Inputs CAM-15 logic     |
| CAM-14 | Degradation Forecasting        | Forecast remaining useful life (simple model).                  | Age, downtime, cost                            | Remaining-life estimate    | Medium   | API route / scoring     |
| CAM-15 | Replacement Priority Index     | Weighted score for replacement ranking.                         | Utilization, cost, age, criticality            | Ranked list                | High     | Core EOL logic          |
| CAM-16 | Replacement Roadmap View       | Timeline of upcoming replacements.                              | CAM-15 output                                  | Timeline view              | Medium   | Visualization layer     |
| CAM-17 | Salvage & Residual Value       | Estimate resale value; sell vs keep suggestion.                 | `assets`, TCO data                             | Value estimate             | Medium   | Rules-based             |
| CAM-18 | Capex Planning Dashboard       | Upcoming capital needs + budgets.                               | Roadmap, TCO, salvage                          | Charts + CSV export        | Medium   | For leadership          |
| CAM-19 | Multi-Facility Asset Views     | Filter by facility and compare KPIs.                            | `facilities`, `assets`                         | Comparison cards           | Medium   | Uses facility table     |
| CAM-20 | Role-Based Views               | Different UIs per role.                                         | Supabase roles                                 | Conditional rendering      | High     | Shared auth model       |
| CAM-21 | Search & Advanced Filters      | Search by name, type, zone, criticality, status.                | Query params                                   | Filtered results           | Medium   | Reuse DT filter UX      |
| CAM-22 | KPI Overview Cards             | Quick metrics: EOL assets, downtime, PM rate.                   | Aggregations                                   | KPI cards                  | High     | Dashboard summary       |
| CAM-23 | Download / Export              | Export registry and capex data.                                 | Query results                                  | CSV/PDF                    | Low      | Similar to DT-17        |
| CAM-24 | Audit Trail & Change History   | Track edits to asset/ticket data.                               | `audit_log`                                    | Audit table                | Medium   | Compliance feature      |
| CAM-25 | Configurable Parameters        | Admin weighting for replacement index.                          | `cam_config`                                   | Updated scores             | Medium   | Admin-only              |
| CAM-26 | Integration Hooks              | Placeholders for ERP/IoT/CMMS IDs.                              | `integrations`                                 | Config stub                | Low      | Future-ready            |

## Non-Functional Requirements
| Category          | Requirement                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Data Model        | Tables: `assets`, `asset_types`, `downtime_events`, `pm_templates`, `pm_tasks`, `asset_costs`, `cam_config`, `facilities`. |
| Performance       | Registry load ≤ 3 s for 1 000 assets; filters < 1 s.                                                                       |
| Security / Access | RLS ensures facility-level visibility; Admin = full.                                                                       |
| Accuracy          | Simple scoring documented in code/admin UI.                                                                                |
| Extensibility     | Scoring logic modular for ML upgrade later.                                                                                |
| Auditability      | All changes logged in `audit_log`.                                                                                         |
| UX                | Desktop optimized; readable on tablets.                                                                                    |

# System for Sustainable Brand “Voice” — Digital Twin of Customer Experience
RTR Social Pulse is a cross-platform social intelligence and action platform purpose-built for Rent the Runway to continuously track, analyze, and act on customer sentiment across Instagram, TikTok, Reddit, Facebook, and review sites. It transforms raw customer conversations into real-time, data-driven insights and operational actions—enabling RTR to close the loop between customer voice, brand experience, and business decisions.
Rent the Runway’s brand thrives on visibility and experience. Yet today, customer feedback is scattered across multiple channels—making it hard to see and respond to trends quickly. The company’s most critical reputation and service issues (late deliveries, garment condition, customer service friction) often surface first on social media before internal systems detect them. Without unified monitoring, RTR risks:
- Delayed response to detractors, amplifying brand damage.
- Missed promoter engagement, limiting positive virality.
- Underutilized insights, where real-world complaints never inform operations or quality control.

RTR Social Pulse eliminates these blind spots by aggregating, analyzing, and enabling action on every relevant post—turning social listening into an operational advantage.
## How the Solution Works
1. Unified Listening
- Continuously collects RTR mentions and hashtags across Instagram, TikTok, Reddit, Trustpilot, BBB, and review platforms (via approved APIs and research integrations).
- Captures post text, engagement, date, language, and media.
- Backfills up to 18 months of historical data for longitudinal insight.
2. Smart Analysis
- Applies AI-driven sentiment modeling to convert each post into a Net Promoter Score (NPS 1–10).
- Auto-classifies posts into root cause categories such as fit, quality, stained, smelly, damaged, delivery, customer service, billing, or availability.
- Detects customer occasion context (e.g., wedding, gala, interview) to weight issue impact by event importance.
- Supports multilingual analysis to reflect RTR’s global audience.
3. Action & Engagement
- Displays all posts in a central, filterable feed with engagement metrics, sentiment, and category tags.
- Enables teams to reply, escalate, or assign actions (e.g., refund, replacement, stylist outreach) directly from the platform.
- Automates alerts for emerging issues (e.g., spikes in “stained” or “late delivery” mentions).
- Tracks resolution outcomes and re-scores post-NPS for measurable brand recovery.
4. Insight Dashboards
- Live brand health dashboard showing NPS by platform, category, and time.
- Trend visualizations of top issues, influencer impact, and resolution performance.
- ROI tracking for saved customers, churn prevention, and sentiment lift after engagement.

## Functional Requirements
| ID    | Feature / Module             | Description / Purpose                                 | Inputs (Source)                        | Outputs (UI or Data)       | Priority | Notes                 |
| ----- | ---------------------------- | ----------------------------------------------------- | -------------------------------------- | -------------------------- | -------- | --------------------- |
| SP-01 | Social Feed Ingestion (Mock) | Unified list of posts from mock API across platforms. | `/api/social/posts`                    | Feed table/card list       | High     | Real APIs later       |
| SP-02 | Post Detail View             | Full post text, engagement, sentiment, tags.          | `social_posts`                         | Detail modal/page          | High     | Reuse detail pattern  |
| SP-03 | Filtering & Search           | Filter by platform, sentiment, category, date.        | Query params                           | Filtered feed + counts     | High     | Similar to DT-04      |
| SP-04 | Sentiment Scoring (Mock)     | Assign NPS-like 1–10 score + label.                   | Mock logic or stored field             | Sentiment band             | High     | Static rules for now  |
| SP-05 | Issue Classification         | Tag each post with root cause (fit, delivery, etc.).  | ML stub / manual tag                   | Category chips             | High     | Manual ok for POC     |
| SP-06 | Occasion Detection           | Identify context (wedding, gala, etc.).               | Keyword rules                          | Occasion tag               | Medium   | Prototype NLP         |
| SP-07 | Brand Health Dashboard       | Aggregate NPS by platform/category/time.              | `social_posts`, `sentiment_aggregates` | Charts + KPI cards         | High     | Chart library reused  |
| SP-08 | Alerts on Emerging Issues    | Detect spikes in certain issue categories.            | Aggregated counts                      | Alert list / badges        | Medium   | Simple threshold      |
| SP-09 | Action & Engagement Stub     | Mark post as responded/refunded/escalated.            | `social_actions`                       | Status chips + history     | Medium   | Internal only         |
| SP-10 | Post-Resolution Re-Score     | Capture post-resolution sentiment/NPS lift.           | `social_actions`, `social_posts`       | Before/after visualization | Medium   | Shows NPS improvement |
| SP-11 | Link to Ops / Quality        | Link post to process or garment ID for correlation.   | `ops_links`                            | Cross-reference links      | Low      | Framework for future  |

## Non-functional requirements
| Category    | Requirement                                   |
| ----------- | --------------------------------------------- |
| Performance | Load 100 posts ≤ 2 s.                         |
| Scalability | Up to 50 000 posts supported.                 |
| Security    | Auth required; actions logged in `audit_log`. |
| Analytics   | Aggregate NPS auto-refresh daily.             |
| Integration | Real APIs replace mock endpoints in Phase 2.  |
| UX          | Consistent card UI with DT/CAM dashboards.    |
