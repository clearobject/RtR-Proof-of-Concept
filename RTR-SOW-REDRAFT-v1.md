# RENT THE RUNWAY
## STATEMENT OF WORK: AI-ENABLED DIGITAL THREAD | IOT PLATFORM
### REDRAFT v1 — Proposed Suggested Edits for RTR Review

**Prepared by:** ClearObject, Inc. | 11634 Maple Street, Suite 200, Fishers, IN 46038
**Date:** February 2026
**Document Status:** Complete redraft of the original SOW dated February 26, 2026.

> **HOW TO READ THIS DOCUMENT**
> Suggested edits are marked throughout as `[EDIT: ...]` callouts explaining what was changed and why. The full text below represents the proposed replacement language. This version supersedes all prior drafts in their entirety.

---

**Summary of Key Changes**

| Item | Prior Draft | This Draft |
|------|-------------|------------|
| Engagement Value | $101,600 (T&M capped) | $379,000 (Fixed-Price) |
| Duration | 12 weeks | 16 weeks |
| Scope | Dryer Intelligence + iConnect + Looker | 7 Production Deliverables — Full Digital Thread Platform |
| IoT Hardware Markup | Cost + 20% | Cost + 18% |
| Post-Engagement Support | "Negotiable" | 30-Day Hypercare (no cost) + MSA referral |
| Application Delivery | Not addressed | POC-to-Production Migration |
| Maintenance System | Built-in ticketing | MaintainX API integration |
| System Integrations | iConnect only | Girbau Sapphire + iConnect + Brightwell + MaintainX |
| Facility Scope | EWR + general language | EWR (Newark) — Primary |

---

## SECTION 1: PROJECT OVERVIEW

### 1.1 Background

This Statement of Work ("SOW") is effective on the date of last signature below ("Effective Date") by and between **ClearObject, Inc.** with an address at 11634 Maple Street, Suite 200, Fishers, IN, 46038 (referred to as "ClearObject"), and **Rent the Runway** with an address at 10 Jay St., New York, NY 11202 (referred to as "Customer" or "Rent the Runway" or "RTR").

`[EDIT: Removed "hereinto referred to as" in favor of standard "referred to as" per legal review.]`

This SOW and the pricing incorporated within the Fees for the proposed Services and Deliverables will be valid for thirty (30) days, or until **03/31/2026** ("Valid Proposal Period"). After the expiration of the Valid Proposal Period, this SOW will not be exercisable and a new SOW proposal will need to be created if the Customer intends to pursue these Services and Deliverables.

---

### 1.2 Executive Summary

`[EDIT: Complete replacement. Prior version described a $101,600 / 12-week scope limited to Dryer Intelligence, iConnect Integration, and a Looker dashboard. This revision reflects the full AI-Enabled Digital Thread platform engagement at $379,000 / 16 weeks, encompassing all in-scope deliverables from the Target Features & Delivery Roadmap.]`

ClearObject and Rent the Runway share a vision for a data-driven, AI-enabled operations platform that unifies machine intelligence, asset management, and operational analytics into a single system of record for RTR's Newark, NJ (EWR) fulfillment facility. This engagement formalizes that shared vision into a structured, production-grade delivery.

**Foundation of This Engagement — The Proof-of-Concept Application**

Prior to the execution of this SOW, and at ClearObject's own initiative and expense, ClearObject designed and built a fully functional proof-of-concept (POC) web application to give Rent the Runway's leadership a tangible, interactive representation of what the Digital Thread platform would look like in production. This POC — including working implementations of the Plant Floor Digital Twin, Capital Asset Management, Conversational AI, Maintenance Management, and User Access Control modules — was not contracted under any prior engagement and represents a strategic investment by ClearObject to communicate and demonstrate the platform vision to RTR.

**This engagement will progress the POC to a production-grade enterprise application, migrate it to RTR's approved production infrastructure on Google Cloud Platform (GCP), and deliver all in-scope features against enterprise standards for security, scalability, reliability, and integration.**

**Engagement Overview**

This SOW defines a **fixed-price, 16-week engagement** valued at **$379,000**, delivered by ClearObject to Rent the Runway. The engagement encompasses seven (7) primary deliverables:

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | **Production Application Platform Migration** | Harden the POC application to enterprise production standards and migrate to RTR's GCP production infrastructure |
| 2 | **Dryer Intelligence IoT Solution (EWR)** | Design, procure, configure, and integrate IoT sensor packages on EWR industrial dryers (15-dryer MVP) with a validated SOP/blueprint for scaling |
| 3 | **Enterprise System Integrations** | Automated data pipelines to Girbau Sapphire (washers), iConnect (dry cleaners), Brightwell (soap dosing), and MaintainX (CMMS) |
| 4 | **Plant Floor Digital Twin** | Interactive, real-time digital representation of the EWR factory floor with colorized machine-status tiles, zone KPIs, alerts, and drill-down |
| 5 | **Capital Asset Management & Capex Planning** | System of record for all EWR capital assets with TCO calculations, replacement priority scoring, and capex planning dashboard |
| 6 | **Holistic Maintenance Management (MaintainX Integration)** | Maintenance visibility layer integrating with MaintainX CMMS for alert-to-ticket automation and maintenance analytics |
| 7 | **Conversational AI Performance Interrogator** | Natural-language AI assistant embedded in the platform for plain-English interrogation of plant performance, sensor trends, and operational KPIs |

**Platform Infrastructure**

The production platform will be built on **Google Cloud Platform (GCP)** with a cloud-native architecture. The web application is a Next.js (TypeScript) full-stack application backed by a managed PostgreSQL database, with role-based access control (RBAC), Supabase Auth / SSO integration for identity management, and OpenAI GPT integration for AI features. All IoT telemetry will flow through a secure MQTT broker into GCP Pub/Sub, then to BigQuery for time-series analytics.

**Primary Facility Scope**

All deliverables in this SOW are scoped to RTR's **EWR (Newark, NJ)** fulfillment facility. Future expansion to DFW or other RTR facilities is not included in this SOW and will be addressed via separate agreement.

---

### 1.3 Project Assumptions & Dependencies

`[EDIT: Updated to reflect the 16-week scope, production infrastructure context, and multi-system integration dependencies. Added MaintainX, Sapphire, and Brightwell access as explicit dependencies. Added union labor and physical installation clarifications per original SOW comments.]`

Successful 16-week delivery is contingent on the following assumptions:

1. **Facility Access:** ClearObject is granted all necessary access (facility, VPN, OT network segments, relevant systems) within 5 business days of request.

2. **RTR Resource Availability:** Designated RTR Subject Matter Experts (SMEs) — including Operations, IT, Facilities, and Maintenance leads — are available for a minimum of 4 hours/week for validation, decision-making, and sprint reviews.

3. **Appendix C Questionnaire:** Complete responses provided within 10 business days of SOW execution. Delays may affect scope feasibility and timeline.

4. **Network & Security Approvals:** RTR IT completes required configurations (VLAN segmentation, firewall rules, SSO/SAML integration, API whitelisting) per ClearObject's project plan. ClearObject will provide detailed specifications at Project Kickoff.

5. **Third-Party System Access:** RTR will facilitate access to Girbau technical support (Sapphire API), Union technical support (iConnect), Brightwell (dosing pump integration API), and MaintainX (CMMS API credentials) within the first two (2) weeks of the engagement. Restricted or unavailable API access may affect the scope or approach for affected integrations and will be addressed through a Week 4 scope gate.

6. **MaintainX as CMMS of Record:** RTR has confirmed MaintainX as the maintenance management platform of record. ClearObject's maintenance features will integrate with MaintainX's API rather than replace it. MaintainX remains the system of record for work orders; the Digital Thread application provides alert-to-ticket automation and maintenance visibility.

7. **Hardware Procurement Timeline:** ClearObject will procure IoT hardware on RTR's behalf per Section 5.2. Hardware must clear RTR receiving at EWR per the project timeline. Vendor-caused delays are considered Force Majeure and may extend the hardware integration timeline.

8. **Production Infrastructure:** RTR will designate an approved GCP project or provide access to an existing RTR GCP environment for production deployment. ClearObject will provide infrastructure-as-code and full deployment documentation.

9. **Physical Installation Labor:** Physical sensor mounting, cabling, and on-site installation labor will be performed by RTR's facilities team or RTR-contracted labor. ClearObject provides installation plans, sensor placement specifications, and on-site/remote supervisory support.

10. **Union Labor Constraints:** If EWR operates under union agreements restricting third-party technician installation work, RTR will coordinate the appropriate union labor. ClearObject will provide detailed installation specifications and technical supervision.

11. **Impact of Delays:** RTR delays totaling >10 business days may extend the timeline or require scope reduction. Delays >15 business days may lead to engagement pause, requiring 2 weeks' written notice and mutual agreement to restart.

---

## SECTION 2: SCOPE OF WORK

`[EDIT: Complete replacement of prior Scope of Work section. Prior version described three deliverables (Dryer Intelligence, iConnect Integration, Looker Dashboard). This section describes seven production-grade deliverables aligned to the Target Features & Delivery Roadmap and RTR Application Requirements Specification.]`

---

### Deliverable 1: Production Application Platform — POC-to-Production Migration

**Objective:** Transition the ClearObject-developed Digital Thread proof-of-concept application from a demonstration-grade prototype to a production-ready enterprise application deployed on RTR's approved GCP production infrastructure.

**Background:**
ClearObject developed a fully functional POC application at its own expense to visualize the Digital Thread platform vision for RTR leadership. The application includes working implementations of the Plant Floor Digital Twin, Capital Asset Management, AI Insight Assistant, maintenance management, social pulse module, and user access management. The POC was built on a rapid-development stack (Next.js / Supabase / Vercel) optimized for speed of iteration rather than enterprise operability. This deliverable formalizes the production-grade path forward from that foundation.

**Infrastructure & Deployment:**
- Migration from the current Vercel/Supabase prototype hosting to RTR's GCP-approved production environment: Cloud Run or GKE for application compute, Cloud SQL or Supabase-hosted PostgreSQL for database, GCP Secret Manager for credential and API key management
- Infrastructure-as-Code (IaC) delivery using Terraform or GCP Deployment Manager for repeatable, auditable environment provisioning
- CI/CD pipeline configuration (GitHub Actions or Cloud Build) for automated build, test, and deployment workflows
- Three-environment separation: Development, Staging, and Production, with appropriate access controls and promotion gates
- Automated database migration tooling (Supabase CLI or Flyway) for schema version control and idempotent migration execution

**Security Hardening:**
- Supabase JWT and Row-Level Security (RLS) policies reviewed and hardened for production access patterns across all four RBAC roles
- All secrets and API keys migrated to GCP Secret Manager; eliminated from environment variable files
- HTTPS enforcement, CORS policies, secure HTTP headers (CSP, HSTS, X-Frame-Options) configured
- SSO/SAML integration with RTR's corporate Identity Provider (Okta, Azure AD, or Google Workspace) for employee single sign-on
- Four-tier Role-Based Access Control: Operator, Maintenance Technician, Manager/Supervisor, and System Administrator — enforced at both the API and database (RLS) layers
- Security review documentation (ClearObject will document findings; remediation of critical and high-severity findings is in scope)

**Performance & Scalability:**
- Database query optimization with proper indexing supporting 200+ machine records and 10,000+ daily sensor readings without degradation
- Application performance profiling targeting <2-second dashboard load time and <5-second real-time data refresh intervals
- Pagination and lazy loading for data-intensive views (Asset Registry, Maintenance Tickets)
- GCP auto-scaling configuration for variable concurrent user load

**Department-Specific Views:**
`[EDIT: Added in response to William Ensuncho Jr. comment requesting department-specific views, and per product requirements.]`
- Configurable role- and department-specific dashboard views delivering tailored experiences for Operations, Maintenance, Engineering, and Leadership personas
- Configurable KPI widget arrangement per role, ensuring users see operationally relevant information on login
- Initial view configurations to be defined collaboratively with RTR stakeholders during Phase 1

**Documentation & Training:**
- Technical architecture documentation: system diagram, data flow diagram, API endpoint reference
- Administrator runbook: deployment procedures, backup/restore, user management, integration configuration
- End-user quick-start guide per role tier
- System administrator training session (remote or on-site) on platform management, user provisioning, and integration configuration

`[EDIT: Training added per Jonathan Kopf comment #13: "Training will be needed if support is not available after 12 weeks."]`

**Acceptance Criteria:**
- Application successfully deployed to RTR GCP environment with verified uptime ≥99% over 5 business days
- All security configurations validated against RTR IT requirements; SSO authentication operational
- Dashboard load time <2 seconds under expected concurrent user load
- RBAC permissions verified end-to-end per role matrix
- Technical documentation and runbooks delivered and accepted by RTR

---

### Deliverable 2: Dryer Intelligence IoT Solution (EWR)

**Objective:** Deploy an IoT-based monitoring system on industrial dryers at RTR's EWR facility to provide real-time operational visibility, dryness analytics, automated alerting, and a replicable deployment blueprint for scaling to remaining dryer inventory.

`[EDIT: Updated from 15-dryer deployment to 15-dryer MVP with SOP for scaling to remaining dryers per Lisa Drew comment #1: "provide this solution on 15 machines and provide Technical SOP/Blueprint to scale internally." Also adds Dry Cleaning Intelligence roadmap per Lisa Drew comment #15: "Include a roadmap to implementing drying intelligence across dry cleaning. The priority is wet wash."]`

**Phase 1: Hardware Selection & Architecture (Weeks 1–3)**

ClearObject will research, evaluate, and present three (3) alternative IoT sensor architecture options to RTR within the first two weeks of engagement. The comparison document will evaluate each option across:

- Sensor accuracy and reliability for temperature, humidity, vibration, and airflow measurement
- Hazardous location compliance (Class I, Division 2 / ATEX, as applicable per Appendix C facility assessment)
- IIoT gateway suitability: the preferred architecture is an industrial IIoT gateway with modular sensor configuration to maximize flexibility and minimize custom hardware
- Total hardware cost per dryer kit (sensor package + gateway allocation)
- Vendor lead times and commercial availability
- Configuration complexity and long-term maintenance requirements

By **Week 3**, RTR will select the preferred architecture and approve the hardware procurement budget in writing (email acceptable). ClearObject will initiate procurement immediately upon written approval.

**Phase 2: MVP Deployment — 15 Dryers (Weeks 3–12)**

*Hardware Scope (Cost + 18% — see Section 5.2):*
- Procurement and configuration of sensor kits for fifteen (15) EWR industrial dryers (Miele PT 8807D, PDR944SI; Continental CG115-125)
- Each sensor kit will include, at minimum:
  - **Temperature/Humidity Probe:** Installed in dryer exhaust vent discharge to measure garment dryness level and cycle completion timing
  - **Vibration/Accelerometer Sensor:** Mounted on dryer housing to characterize micro-vibration, detect cycle start/completion, and identify mechanical anomalies
  - **Airflow/Flow Meter:** Installed in dryer discharge duct to establish a "clean machine" airflow baseline for filter blockage and downstream restriction detection
- Industrial IIoT gateway (1 gateway per 4–6 dryer cluster, or per selected architecture): Edge aggregation, local processing, and secure cloud connectivity
- All hardware bench-tested and pre-configured by ClearObject prior to shipment to EWR

*Data Pipeline & Cloud Integration:*
- Secure MQTT-based communication from IoT sensors/gateway to GCP
- GCP Pub/Sub topic configuration for dryer telemetry streams
- Cloud Functions or Dataflow pipeline for real-time processing and normalization
- BigQuery schema design and table provisioning for dryer telemetry (temperature, humidity, vibration, airflow, asset IDs, timestamps)
- Historical data retention policy per RTR data governance requirements

*Analytics, Alerting & Application Integration:*
- **Cycle Completion Detection:** Rules-based or lightweight ML service to classify in-cycle vs. complete states from vibration and humidity sensor signatures
- **Automated Alerting:** Email, SMS, or in-app push notifications triggered by:
  - Temperature exceeding configurable threshold (overdrying / garment shrinkage risk)
  - Incomplete or anomalous cycle detected
  - Vibration pattern indicating mechanical anomaly
  - Airflow degradation indicating filter blockage or duct restriction
- **Digital Twin integration:** Live dryer telemetry connected to Plant Floor Digital Twin (Deliverable 4) — machine tile status updates, sensor trend charts, alert feed
- **Operator displays:** Looker Studio or embedded Digital Thread application views configured for dryer-area monitors/screens, delivering metrics and machine status directly to dryer operators

*Phase 2 Milestone:* 15 dryers transmitting production-grade telemetry to BigQuery. Automated alerts validated end-to-end. Dryer data live in Digital Twin dashboard.

**Phase 3: Dryer Scale-Out SOP & Blueprint (Weeks 12–14)**

Following successful MVP deployment, ClearObject will deliver a documented SOP and technical blueprint enabling RTR to replicate the dryer sensor deployment to remaining EWR dryers using internal or ClearObject-supported resources. The SOP will include:

- Hardware procurement guide (approved vendors, part numbers, quantities per cluster configuration)
- Step-by-step sensor installation procedure with photographs and placement diagrams
- Gateway configuration and MQTT broker onboarding steps
- BigQuery schema extension instructions for additional asset onboarding
- Alert threshold configuration guide by sensor type
- Testing and validation checklist for each new dryer unit

**Dry Cleaning Intelligence Roadmap (Deliverable Artifact):**

`[EDIT: Added per Lisa Drew comment #15: "Include a roadmap to implementing drying intelligence across dry cleaning."]`

ClearObject will deliver a written Dry Cleaning IoT Intelligence Roadmap document covering the recommended approach for extending IoT sensing to RTR's dry cleaning machines (Columbia TL HCS 800 N2, Union HL880/HL890-K, Ipura 440N). This document will outline:
- Sensing use cases per machine type (temperature, solvent vapor, vibration, electrical)
- Recommended IIoT architecture and hardware options
- Estimated hardware cost ranges (per machine and total EWR fleet)
- Implementation sequencing aligned to existing integration work (iConnect, PLC)
- Prerequisites and risk factors

This roadmap serves as the planning artifact for a future SOW or Change Order to extend the IoT sensing program to dry cleaning.

**Acceptance Criteria:**
- Minimum 15 dryers transmitting validated sensor telemetry to BigQuery
- Cycle completion detection accuracy ≥90% vs. manual observation over 48-hour validation period
- End-to-end alert validated: sensor trigger → GCP → notification delivery
- Live dryer data integrated with Digital Twin dashboard and machine detail view
- Scale-out SOP/blueprint document delivered and accepted by RTR
- Dry Cleaning Intelligence Roadmap document delivered

---

### Deliverable 3: Enterprise System Integrations

**Objective:** Establish automated, production-grade data pipelines between RTR's existing operational systems and the Digital Thread platform, enabling a unified data layer across EWR's key equipment categories, solvent management, and maintenance management systems.

`[EDIT: Complete replacement of prior "iConnect Integration Strategy & Implementation" deliverable. Per William Ensuncho Jr. comments (#2, #9, #10, #14) and Lisa Drew comment (#3): washers are higher priority than iConnect; Sapphire, iConnect, and Brightwell all need to be integrated; and MaintainX API integration is required. The prior deliverable addressed iConnect only.]`

---

#### 3.1 Girbau Sapphire Integration (Continental Washer Data Pipeline)

**Priority: Highest**
`[EDIT: Elevated to highest priority per William Ensuncho Jr. comment #9: "We need washers, as higher priority than iConnect. iConnect is only 1 machine at EWR."]`

**Background:** RTR's Continental commercial washers (EH055I2102111500 series) are monitored by the Girbau Sapphire system, which captures water temperature, bath level (water fill), cycle program, cycle completion, cycle time, and error status/codes. This integration represents the highest-value data pipeline for wet wash operational intelligence and is a critical enabler of the Plant Floor Digital Twin for washing machines.

**Phase 1 — Data Pipeline (Weeks 3–8):**
- **System Discovery:** Assess Girbau Sapphire API capabilities, authentication requirements, and available data endpoints. ClearObject will engage Girbau technical support and sales to negotiate API access if not publicly documented, as Girbau's commercial model may limit data extraction to protect their proprietary analytics.
- **Data Extraction Pipeline:** Automated polling or webhook-based extraction of washer operational data from Sapphire, covering: water temperature, program, bath level, cycle completion status, cycle duration, and error codes
- **Data Normalization:** Map Girbau Sapphire schema to RTR's unified equipment data model in BigQuery
- **Real-Time Visibility:** Machine cycle status, wash program, temperature, and error codes surfaced in the Digital Twin dashboard and machine detail views
- **Historical Backfill:** Ingest available historical Sapphire data for trend analysis and operational baseline characterization

**Scope Note:** If Sapphire API access proves infeasible due to vendor restrictions, ClearObject will present RTR with alternative approaches (local PLC tap, network monitoring bridge, export file processing) at the Week 4 scope gate.

**Phase 2 — Washer IoT Extension (Planning Artifact, Future Engagement):**
- Following Phase 1 integration, ClearObject will document the recommended approach for deploying custom IoT devices to Continental washers for real-time vibration and electrical consumption monitoring — extending the same sensing model applied to dryers. This extends the preventive maintenance and machine intelligence capabilities to RTR's wash fleet. Phase 2 washer IoT deployment is scoped for a future SOW or Change Order.

---

#### 3.2 iConnect Integration (Union Dry Cleaner Data Pipeline)

`[EDIT: Rescoped per William Ensuncho Jr. comment #14 (EWR has only ~2 Columbia dry cleaning machines; iConnect is only 1 machine) and Lisa Drew comment #3 (priority is wet wash connectivity). iConnect integration is retained but scoped appropriately for its limited machine count at EWR.]`

**Background:** RTR's Union dry cleaning machines at EWR use the iConnect monitoring system, which surfaces current operating conditions but does not persistently store historical data. There are approximately two (2) Columbia dry cleaning machines at EWR using this pathway. Given the limited machine count, this integration is prioritized after the Sapphire/washer pipeline but is included to establish a complete Digital Thread data layer.

**Capabilities:**
- **System Discovery:** Assess iConnect architecture, network access pathways (local network, VPN, or REST API polling), and available data fields (cycle state, error codes, runtime, machine status)
- **Connection Strategy:** Determine optimal extraction approach based on discovery findings (REST API polling, DB bridge, local network service)
- **Integration Implementation:** Deploy a network polling service or bridge to extract iConnect machine status and ingest into BigQuery. Includes error handling, retry logic, and pipeline health monitoring.
- **Digital Twin Visibility:** iConnect machine statuses surfaced in Plant Floor Digital Twin and machine detail views

**Columbia TL HCS 800 N2 — PLC Data Integration:**
`[EDIT: Added per Excel features file — "Dry Cleaner: PLC Data Integration (Columbia)" and William Ensuncho Jr. comment #14 noting limited iConnect coverage on Columbia machines.]`
- ClearObject will assess the feasibility of extracting data directly from the Columbia TL HCS 800 N2 onboard PLC. This machine has a documented PLC with potential data outputs; however, connectivity has not been previously validated. ClearObject will coordinate with RTR IT and the machine vendor to determine a viable data extraction strategy. If feasible within the engagement scope, ClearObject will deliver a production integration; if it requires significant additional effort, a scope assessment will be presented to RTR at the Week 6 gate.

**Scope Note:** iConnect documentation is limited. If discovery reveals excessive integration complexity (proprietary protocols, vendor NDA restrictions, encrypted communications), ClearObject will present RTR with options at the Week 4 gate: simplified scope, deferral to future phase, or a Change Order for additional effort.

---

#### 3.3 Brightwell Solvent Dosing Integration (Soap Dosing Reliability)

**Background:** RTR uses Brightwell dosing controllers for chemical delivery to washing machines. Validating that the correct solvent volume was delivered to each wash cycle is critical for garment quality and wash cycle efficiency. An undetected dosing failure (no delivery or incorrect volume) is a significant source of garment damage and process variability.

**Capabilities:**
- Coordinate with RTR operations and Brightwell to assess available API capabilities, data export formats, or local connectivity options for dosing controller data
- Evaluate IoT-based sensing alternatives (flow sensors, conductivity probes) if native Brightwell API access is insufficient
- Develop and deploy a connection strategy to extract per-cycle dosing delivery data (solvent type, volume delivered, machine, timestamp) into the Digital Thread platform
- Surface dosing reliability data in the Digital Twin: per-machine solvent delivery status, anomaly flagging for no-delivery, under-delivery, and over-delivery events
- Automated alerts for dosing anomalies, enabling immediate corrective action before affected garments proceed through the process

**Scope Note:** Commercially negotiated sensing solutions with RTR's chemical/solvent provider may offer a preferred path for monitoring integration. ClearObject will coordinate with RTR to evaluate and recommend the optimal technical approach. Any IoT hardware required falls under the Cost + 18% procurement model (Section 5.2).

---

#### 3.4 MaintainX CMMS Integration (Maintenance Management)

`[EDIT: Added per William Ensuncho Jr. comment #10: "We need APIs to connect to MaintainX" and Jonathan Kopf comment #11 (and Sapphire). RTR has selected MaintainX as its CMMS; this integration replaces built-in maintenance ticketing with a bidirectional MaintainX sync.]`

**Background:** Rent the Runway has selected MaintainX as its Computerized Maintenance Management System (CMMS) for work order management, parts inventory, and maintenance history. The Digital Thread application will integrate bidirectionally with MaintainX's API, providing seamless alert-to-ticket workflows and unified maintenance visibility without duplicating CMMS functionality.

**Capabilities:**
- **Digital Thread → MaintainX (Outbound):** Automated MaintainX work order creation triggered by equipment alerts or manual "Create Ticket" actions in the Digital Thread application. Created tickets are pre-populated with: asset ID and metadata, alert context and sensor readings at time of trigger, recommended severity and priority.
- **MaintainX → Digital Thread (Inbound):** Pull ticket status, assignment, completion notes, and resolution data from MaintainX for display in Digital Twin asset detail views and maintenance history modules. Refresh interval to be defined based on MaintainX API rate limits.
- **Asset Registry Sync:** Align MaintainX asset identifiers with the Digital Thread asset registry for consistent cross-system asset identity
- **Maintenance History Display:** Surface MaintainX work order history within Digital Thread asset detail pages for consolidated asset health views
- **PM Schedule Visibility:** Pull scheduled preventive maintenance tasks from MaintainX and display upcoming PM obligations on the Digital Thread maintenance and asset dashboards

---

### Deliverable 4: Plant Floor Digital Twin

**Objective:** Deliver a production-grade, interactive digital representation of the EWR factory floor providing real-time machine health visibility, zone-level performance KPIs, alert management, and immediate drill-down capability for rapid problem detection and lean visual management.

**Factory Layout Dashboard (`/dashboard`):**
- Interactive SVG-based web view of the EWR facility showing all operational zones: Inbound, Tagging, Wet Cleaning, Dry Cleaning & Spotting, QC, Pressing, Bagging, and Conveyor/Line Operations
- Accurate visual positioning of all instrumented machines on the facility map (based on the 117 EWR assets identified in the POC database, with layout coordinates mapped to actual facility floor plan)
- Dynamic machine tile colorization based on real-time status: Green (Active/OK), Amber (Warning), Red (Critical/Fault), Gray (Offline/Maintenance)
- Dashboard load time target: <2 seconds

**Real-Time Machine Tile Status:**
- Each machine tile ingests live data from IoT sensor feeds (dryers, washers, dry cleaners as integrations come online) and existing system integration feeds (Sapphire, iConnect, Brightwell)
- Alert threshold parameters configurable per machine type by System Administrator role
- Hover/touch tooltip displaying key metrics: temperature, vibration, last cycle time, open alert count
- Tile click navigates to Machine Detail view
- Dashboard auto-refresh at ≤5-second intervals for instrumented machines

**Machine Detail View (`/machines/[id]` or `/asset/[assetAlias]`):**
- Current sensor readings: temperature, vibration, power consumption, humidity, airflow (where instrumented)
- 24-hour and 7-day trend charts for key metrics using Recharts time-series visualization
- Active and historical alert list for the specific machine
- Linked maintenance ticket history (sourced from MaintainX integration)
- One-click "Create Maintenance Ticket" — generates a MaintainX work order pre-populated with machine context and alert details
- Full asset metadata: manufacturer, model, serial number, in-service date, zone, criticality

**Dashboard Filtering & Search:**
- Filter factory layout view by equipment type: View All, Dryers, Dry Cleaners, Washing Machines, Soaping Pumps, Line/Conveyor Operations
- Filter by operational status: Active, Warning, Critical, Offline, Maintenance
- Filter by factory zone
- Text search by machine name or asset alias
- Filter state persisted per user session

**Zone Summary Cards:**
- Aggregated KPI cards per factory zone displayed on main dashboard
- Zone KPIs: machines Active / Warning / Down count, average uptime %, total open maintenance tickets, zone throughput (where data available)
- Manager/leadership view with full zone KPI roll-up

**Health Trend Charting:**
- Time-series charts embedded in Machine Detail views
- Configurable lookback windows: 1 hour, 24 hours, 7 days, 30 days
- Anomaly event overlays highlighting flagged readings

**Alert Management (`/alerts`):**
- Centralized alert feed with severity classification: Low, Medium, High, Critical
- Alert acknowledgment workflow: acknowledge, assign, resolve, close
- One-click MaintainX ticket creation from any alert record
- Alert history filterable by machine, severity, date range, acknowledgment status

**Anomaly Detection (Rules-Based Prototype):**
- Threshold-comparison engine flagging sensor readings that breach configurable baseline parameters
- Generates alerts automatically when threshold breach detected
- Foundation for future ML-based predictive anomaly detection model (advanced ML is out of scope for this engagement)

**Executive KPI Dashboard:**
- Overall Equipment Effectiveness (OEE) panel
- Garment throughput metrics (processed/hour)
- Alert volume, acknowledgment rate, and mean time to acknowledge (MTTA)
- Maintenance ticket KPIs: open, in-progress, overdue by priority
- Asset status distribution across all instrumented equipment

**Department-Specific Views:**
`[EDIT: Added per William Ensuncho Jr. comment #6: "We need department specific views, requested in the first engagement."]`
- **Operations View:** Factory floor layout, zone KPIs, active alerts, throughput indicators
- **Maintenance View:** Open and overdue tickets, upcoming PM tasks, MTBF/MTTR metrics, maintenance cost summary
- **Leadership/Management View:** OEE, capex planning roll-up, cost-of-quality indicators, brand health snapshot

**Acceptance Criteria:**
- All instrumented machines (minimum 15 dryers at MVP) displaying live data on factory layout
- Machine tile color updates within 5 seconds of sensor state change
- Machine detail view loads within 2 seconds
- Alert-to-ticket creation workflow functional and verified end-to-end with MaintainX
- Zone summary KPIs accurately aggregating machine data
- All filter types functional and performant at 200+ machine record scale

---

### Deliverable 5: Capital Asset Management & Capex Planning System

**Objective:** Deliver a comprehensive system of record for all RTR EWR capital assets, unifying asset data, maintenance cost tracking, downtime history, and lifecycle analytics into actionable capex planning intelligence.

**Asset Registry (`/assets`):**
- Centralized inventory of all capital assets at EWR (leveraging the 117 assets identified in the POC database, expandable to 1,000+ records)
- Asset data fields: name, type, manufacturer, model, serial number, zone, facility, in-service date, expected useful life (years), acquisition cost, salvage value, criticality rating, current status
- Bulk CSV import with data validation, error reporting, and import confirmation workflow
- Advanced filtering and search by type, manufacturer, zone, criticality, status, age
- Asset classification and tagging: machine type, manufacturer, criticality (Low / Medium / High / Critical)

**Asset Detail View (`/assets/[id]`):**
- Full asset profile displaying all registry fields
- Service life indicators: percentage of expected life consumed, color-coded age health status
- Linked IoT sensor data where instrumented: current status, last reading, trend sparklines
- Maintenance ticket history (via MaintainX integration)
- Downtime event log
- Financial summary: parts, labor, energy, other costs — aggregated from maintenance tickets and manual entries

**Downtime Tracking:**
- Module to log and classify all downtime events (planned vs. unplanned, cause category, operational impact)
- MTBF (Mean Time Between Failures) and MTTR (Mean Time to Repair) auto-calculated per asset and asset type
- Downtime trend analytics by zone and machine category

**Preventive Maintenance Plan:**
- Template-based PM scheduling: define PM task templates by asset type with time-based or usage-based recurrence intervals
- Automated PM task generation from templates, with scheduled due dates
- PM calendar view showing scheduled tasks by week and month
- PM completion tracking: task completion logging, labor and parts capture
- PM vs. Reactive Analysis dashboard: ratio of planned to reactive maintenance by asset, asset type, and zone — a key KPI for leadership to measure the shift from reactive to proactive maintenance

**Parts & Repair Cost Tracking:**
- Manual cost entry and MaintainX cost data pull for parts, labor, and other maintenance expenses
- Aggregated cost breakdown per asset by category (parts, labor, energy, other)
- Cost trend charts: quarterly and annual spend per asset and per asset type

**Total Cost of Ownership (TCO) Calculator:**
- Combines acquisition cost (capex), cumulative maintenance spend, downtime cost (estimated based on configurable throughput impact), and energy consumption into a single TCO metric per asset
- TCO expressed as: total-to-date, annualized, and cost-per-cycle / cost-per-unit-throughput where data is available
- TCO comparison view: sort and filter all assets by TCO to identify underperforming and over-costing equipment

**Degradation Forecasting (Scoring Prototype):**
- Rules-based scoring model estimating Remaining Useful Life (RUL) based on: asset age vs. expected life, cumulative downtime frequency, maintenance cost trajectory, and criticality-weighted utilization
- Outputs: estimated years/months of remaining useful life and a percentage health score per asset

**Replacement Priority Index:**
- Composite weighted score ranking all EWR assets for replacement priority
- Scoring inputs: age (% of expected life consumed), total cost of ownership, downtime frequency, criticality rating, and degradation forecast
- Configurable weighting parameters adjustable by System Administrator role
- Ranked list view with four priority tiers: Replace Now, Plan for Replacement, Monitor, Healthy

**Replacement Roadmap View:**
- Timeline visualization of recommended replacements by quarter and calendar year
- Estimated capital requirement per replacement event
- Exportable to CSV for finance and budget planning workflows

**Capex Planning Dashboard (`/capex`):**
- Leadership summary: upcoming capital needs by quarter, estimated spend, priority tier distribution
- Budget planning interface: set annual capex budget target, visualize coverage and gap analysis
- Asset replacement schedule with estimated procurement lead times
- Export to CSV/PDF for financial reporting

**Acceptance Criteria:**
- Asset registry importable via CSV and displaying all 117 EWR assets with correct fields
- TCO calculations accurate and verifiable against manual spot-check calculations
- Replacement Priority Index scores consistently calculated per documented algorithm
- Capex planning dashboard rendering upcoming replacement schedule correctly
- PM template-to-task generation functional and scheduling tasks per configured intervals

---

### Deliverable 6: Holistic Maintenance Management (Application Layer & Training)

**Objective:** Provide a unified maintenance visibility and workflow layer within the Digital Thread application, integrating with RTR's MaintainX CMMS for alert-to-ticket automation, maintenance performance analytics, and operator training.

**Maintenance Dashboard (`/maintenance`):**
- Aggregated view of all open maintenance tickets sourced from MaintainX API integration
- Filter by: asset, zone, priority (Low/Medium/High/Urgent), ticket status, assigned technician, date range
- Ticket lifecycle display: Open → In Progress → Resolved → Closed
- Overdue ticket highlighting and configurable SLA breach indicators
- Quick-view summary: count of open, in-progress, and overdue tickets by priority and zone

**Alert-to-Ticket Automation:**
- Automated MaintainX work order creation triggered by IoT sensor threshold-crossing alerts
- Manual one-click ticket creation from any alert record or machine detail view
- Pre-populated ticket fields: asset ID, alert type, sensor readings at time of alert, severity level, recommended priority

**Maintenance Analytics:**
- Per-asset maintenance history timeline
- MTBF/MTTR trend charts by asset and asset type over selectable time periods
- PM completion rate tracking (PM tasks completed on schedule vs. overdue)
- Maintenance cost aggregation feeding into CAM TCO calculations (Deliverable 5)

**Training Delivery:**
`[EDIT: Added per Jonathan Kopf comment #13: "Training will be needed if support is not available after 12 weeks."]`

ClearObject will deliver structured training for RTR maintenance staff and system administrators, covering:
- Digital Thread maintenance dashboard navigation and workflow
- Alert-to-ticket creation and MaintainX integration workflow
- MaintainX integration configuration, monitoring, and troubleshooting
- Preventive maintenance scheduling and task tracking within the Digital Thread application
- RBAC user provisioning and role management

Training will be delivered during Week 15 as a remote or on-site session, with training materials (recorded session and reference guide) provided as a deliverable.

**Acceptance Criteria:**
- Maintenance dashboard displaying MaintainX tickets with accurate status within configured refresh interval
- Alert-to-ticket automation creating MaintainX work orders with correct asset and alert context, verified via 5 end-to-end test scenarios
- Training session completed; training materials delivered and accepted by RTR

---

### Deliverable 7: Conversational AI Performance Interrogator

**Objective:** Deploy an embedded natural-language AI assistant within the Digital Thread platform enabling RTR operators, managers, and leadership to interrogate plant performance data, sensor trends, maintenance histories, and operational KPIs using plain-English queries, without requiring SQL knowledge or custom report requests.

**RTR Insight AI (`/ai`):**
- Conversational chat interface embedded within the Digital Thread platform
- Powered by OpenAI GPT-4o (or GPT-4o-mini as a cost-optimized configuration), with a structured system prompt grounding all responses in RTR operational context
- **Real-time context assembly:** Each user query automatically assembles and injects current operational data into the AI context window, including:
  - 24-hour sensor telemetry summary (average vibration, maximum temperature, humidity, flow rates by asset group and zone)
  - Active and recently resolved alert inventory (severity, machine, status)
  - Open and urgent maintenance tickets (count, priority distribution, overdue flags)
  - Downtime events (14-day lookback: planned vs. unplanned, MTBF/MTTR)
  - Asset status distribution (Active / Warning / Critical / Offline counts by zone and type)
  - Throughput and OEE metrics where available from connected data sources
- **Representative query capabilities:**
  - "Which dryers are running the hottest right now?"
  - "How many unplanned downtime events occurred in the last two weeks?"
  - "What is the replacement priority for our washing machines?"
  - "Which assets have the highest maintenance cost this quarter?"
  - "Show me all machines with open urgent tickets."
  - "What was the average cycle completion rate for dryers yesterday?"
- Responses include attribution to the underlying data source (sensor reading timestamp, ticket ID, alert ID) for auditability
- Conversation history retained within the active session

**Data Governance & AI Security:**
- All AI queries processed server-side; RTR operational data is transmitted only as encrypted API payloads to OpenAI via RTR-approved cloud channels
- OpenAI configured in zero-data-retention mode: no RTR data is stored or used for model training by OpenAI or any third party
- System prompt templates and query configuration are owned by RTR as part of the Deliverables upon full payment
`[EDIT: Zero-data-retention configuration and the clause below added per Matt Bass/Jonathan Kopf comment #17.]`
- ClearObject shall not use any RTR Confidential Information or other RTR data obtained in the course of performing the Services to train any AI or ML models, or outputs thereof, made available to any third party

**Acceptance Criteria:**
- AI assistant accessible within the Digital Thread application and functional for all four RBAC roles
- Demonstrated accurate responses to a minimum of ten (10) pre-defined test queries against live or validated seed data
- OpenAI zero-data-retention configuration verified and documented
- Response time <10 seconds for standard operational queries under normal load

---

## SECTION 3: OUT OF SCOPE

`[EDIT: Updated out-of-scope list to reflect the new engagement scope. Items from the prior SOW that have been incorporated into this scope (e.g., iConnect, dryer intelligence) are removed from Out of Scope. New exclusions added consistent with the Target Features & Delivery Roadmap and Q&A responses.]`

The following items are explicitly excluded from this SOW and require separate agreements or Change Orders:

1. **Customer Sentiment Digital Twin (Social Pulse):** Aggregation, analysis, and visualization of customer sentiment from social media platforms (Instagram, TikTok, Reddit, Facebook, X, Trustpilot). Classified as Out of Scope in the Target Features & Delivery Roadmap for this engagement.

2. **Quality Inspection Throughput Monitoring:** Capture and analysis of quality inspector performance volume (garments per hour, defect correlation, outlier detection). Classified as Out of Scope in the Target Features & Delivery Roadmap.

3. **Advanced Predictive ML Models:** Production machine learning models for predictive failure scheduling, deep learning anomaly detection, or load optimization beyond the rules-based scoring models defined in this SOW.

4. **Physical Sensor Installation Labor:** All on-site physical sensor mounting, cabling, and network connections at EWR are performed by RTR's facilities team or RTR-contracted labor. ClearObject provides installation plans, specifications, and supervisory support.

5. **Multi-Facility Expansion:** Deployment to DFW, global RTR facilities, or any facility other than EWR is not included in this SOW.

6. **Native Mobile Applications:** Native iOS or Android apps. The Digital Thread platform delivers a mobile-responsive web application (tablet- and smartphone-accessible) via browser.

7. **ERP / WMS Integration:** Integration with SAP, Oracle, WMS, or enterprise systems beyond Girbau Sapphire, iConnect, Brightwell, and MaintainX as defined in Deliverable 3.

8. **Network Infrastructure Upgrades:** Installation of new network drops, managed switches, or facility-wide network equipment beyond device specifications and guidance provided by ClearObject.

9. **Custom Ad-Hoc Reporting:** Reports beyond those described in Sections 2.4, 2.5, and 2.7. Additional custom reporting can be addressed via a Change Order.

10. **Post-Hypercare Managed Services:** Ongoing platform management, monitoring, or support beyond the 30-day Post-Engagement Hypercare Period defined in Section 6. Post-hypercare support is governed by a separate Master Services Agreement (MSA).

---

## SECTION 4: DELIVERY ROADMAP — 16 WEEKS

`[EDIT: Replaced the prior 12-week roadmap with a 16-week delivery roadmap aligned to the full platform scope.]`

The engagement is structured into four phases with parallel work streams to maximize progress independent of hardware procurement lead times.

| Phase | Weeks | Focus |
|-------|-------|-------|
| Phase 1: Foundation & Infrastructure | 1–3 | GCP provisioning, hardware selection, integration access initiation, POC migration start |
| Phase 2: Core Platform & IoT MVP | 4–8 | Production app deployment, security hardening, IoT commissioning, integration pipelines |
| Phase 3: Intelligence & Analytics | 9–13 | Digital Twin live data, CAM system, AI interrogator, scale-out SOP |
| Phase 4: Hardening & Acceptance | 14–16 | UAT, security validation, training, documentation, production go-live |

---

**Phase 1: Foundation & Infrastructure (Weeks 1–3)**

- Week 1: Project Kickoff; GCP project access confirmed; CI/CD pipeline setup initiated; Appendix C questionnaire sent to RTR; Girbau, iConnect, Brightwell, and MaintainX API access requests initiated
- Week 1–2: IoT hardware alternatives researched; three-option comparison document delivered to RTR; POC application codebase migration to GCP staging environment initiated
- Week 2: Network architecture design; SSO/SAML integration discovery with RTR IT; integration discovery calls with third-party vendors
- Week 3: RTR hardware architecture selection and written budget approval; hardware procurement initiated; GCP staging environment operational
- **Milestone:** GCP staging environment live; hardware procurement initiated; API access confirmed for at least two (2) of four (4) target integrations

**Phase 2: Core Platform & IoT MVP (Weeks 4–8)**

- Weeks 4–5: Production application deployment to GCP; RBAC and SSO configuration; database migration; security hardening pass
- Weeks 4–7: Girbau Sapphire data pipeline development; MaintainX API bidirectional integration; iConnect discovery and integration; Brightwell integration development
- Weeks 5–7: IoT hardware received at ClearObject; bench testing and pre-configuration; installation plans delivered to RTR facilities team
- Weeks 7–8: Physical sensor installation at EWR (RTR facilities team with ClearObject remote support); gateway commissioning and MQTT connectivity validation
- **Milestone:** Production application live and accessible in GCP; minimum 15 dryers transmitting telemetry to BigQuery; Sapphire and MaintainX integrations delivering data

**Phase 3: Intelligence & Analytics (Weeks 9–13)**

- Weeks 9–10: Digital Twin connected to live IoT and integration data; machine tile statuses updating from real sensor feeds; automated alerts tuned against live dryer data
- Weeks 10–12: Capital Asset Management system fully configured with live data; TCO calculations validated; Replacement Priority Index operational; Capex Planning dashboard complete
- Weeks 11–13: Conversational AI interrogator deployed; context assembly tuned against live data; department-specific views configured with RTR stakeholder input
- Week 12–13: Dryer scale-out SOP delivered; Dry Cleaning Intelligence Roadmap document delivered
- **Milestone:** All instrumented machines live in Digital Twin; AI interrogator demonstrating accurate responses; CAM system operational with full EWR asset inventory

**Phase 4: Hardening & Acceptance (Weeks 14–16)**

- Week 14: User Acceptance Testing (UAT) with RTR operators, maintenance technicians, and leadership; defect triage and remediation
- Weeks 14–15: Security review and penetration readiness assessment; final security hardening; performance load testing (target: 50 concurrent users, <2-second dashboard load)
- Week 15: System administrator and end-user training sessions delivered; training materials provided
- Weeks 15–16: Technical documentation finalized (architecture, runbooks, user guides); Deliverable Acceptance Form submissions
- Week 16: Final production go-live confirmation; 30-day Hypercare Period initiated
- **Milestone:** All Deliverable Acceptance Forms executed; platform live in production; Hypercare Period active

---

**Risk Management**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| IoT Hardware Lead Times (>6 Weeks) | Delays Phase 2 sensor integration | Medium-High | Prioritize lead time (30% weight) in hardware selection; immediate procurement at Week 3 approval; expedited shipping option pre-identified |
| Girbau Sapphire API Access Restricted | Sapphire integration delayed or scope-reduced | Medium | Initiate Girbau engagement in Week 1; prepare fallback architectures; Week 4 scope gate decision |
| iConnect Complexity | High effort for limited EWR machine count | Medium | Discovery-first gate at Week 4; de-risk with simplified-scope option if protocol complexity is excessive |
| RTR IT / SSO Configuration Delays | Production deployment delayed | Low-Medium | Identify IT stakeholders at kickoff; schedule configurations as critical-path items in Week 1 |
| MaintainX API Limitations | Bidirectional sync constrained | Low | Review MaintainX API documentation in Week 1; identify capability gaps before integration sprint |
| RTR Decision Delays | Timeline extension | Low-Medium | Identify decision-makers at kickoff; bi-weekly review cadence; delays >10 business days extend timeline day-for-day |
| Union Labor Constraints at EWR | Installation delayed | Low-Medium | Confirm labor constraints via Appendix C in Week 1; pre-coordinate with RTR facilities team |

---

## SECTION 5: FEES AND EXPENSES

### 5.1 Fixed-Price Engagement Fee

`[EDIT: Complete replacement of prior fee structure. Prior SOW described a Time & Materials engagement capped at $101,600 over 12 weeks. This engagement is a Fixed-Price delivery at $379,000 over 16 weeks. No reference to the prior $101,600 figure shall remain in this document.]`

This engagement is structured as a **Fixed-Price engagement totaling $379,000** for the sixteen (16) week delivery period. The fixed-price structure provides RTR with cost certainty across the full scope defined in Section 2.

**Engagement Team:**

| Role | Primary Responsibility |
|------|------------------------|
| Principal / Engagement Lead | Delivery accountability, executive relationship, strategic guidance |
| Technical Project Manager | Sprint planning, delivery tracking, risk management, RTR coordination |
| Solutions Architect / Senior Engineer | Platform architecture, infrastructure, security design, integration architecture |
| Full-Stack Developer(s) | Application feature development (Digital Twin, CAM, AI, integrations) |
| Backend / Data Engineer | GCP data pipelines, BigQuery, MQTT/Pub/Sub, integration services |
| IoT Engineer | Hardware selection, IoT configuration, sensor commissioning, pipeline integration |
| SME / Operations Engineer | Manufacturing process expertise, Digital Twin requirements, operational analytics |

**Payment Schedule:**

| Invoice | Timing | Amount | Period Covered |
|---------|--------|--------|----------------|
| Invoice 1 | Week 1 | $94,750 | Weeks 1–4 |
| Invoice 2 | Week 5 | $94,750 | Weeks 5–8 |
| Invoice 3 | Week 9 | $94,750 | Weeks 9–12 |
| Invoice 4 | Week 13 | $94,750 | Weeks 13–16 |
| **Total** | | **$379,000** | |

**Payment Terms:** Net 30 days from invoice date.

**Change Control:** This is a fixed-price engagement. All deliverables defined in Section 2 are included within the $379,000 fee. Scope additions or material requirement changes require a Project Change Request (PCR) per the Change Control Procedure in Appendix A.

---

### 5.2 IoT Hardware Procurement (Pass-Through Costs)

`[EDIT: Markup changed from Cost + 20% to Cost + 18%. Language simplified to high-level per Q&A direction. Hardware costs remain excluded from the $379,000 engagement fee.]`

All IoT hardware, sensors, gateways, cabling, mounting equipment, and related materials required for sensor deployments defined in this SOW are **excluded from the $379,000 engagement fee** and will be handled as follows:

**Procurement Process:**
- ClearObject procures IoT hardware on RTR's behalf following RTR's written approval of the selected hardware specifications and cost estimate
- RTR will be invoiced at **actual vendor cost + 18%** to cover ClearObject's procurement administration, vendor coordination, device configuration, firmware setup, bench testing, and pre-shipment validation
- Hardware invoices are issued separately from the engagement fee, upon delivery to the RTR EWR facility
- **Payment terms:** Net 30 days from invoice date

**Hardware Budget:**
A detailed hardware cost estimate will be provided to RTR following the Week 3 hardware selection decision. RTR must provide written approval (email acceptable) of the hardware specifications and cost estimate before ClearObject initiates procurement. Budgetary ranges will be included in the three-option comparison document delivered in Week 2.

---

## SECTION 6: POST-ENGAGEMENT SUPPORT

`[EDIT: New section added in full. Prior SOW referenced "post-project support negotiable" with no defined structure. This section addresses Jonathan Kopf comment #12 (support agreement and SLAs) and the Q&A direction for a 30-day hypercare period at no cost with referral to a separate MSA.]`

### 6.1 Thirty-Day Hypercare / Warranty Period

Immediately following execution of the final Deliverable Acceptance Form (or the conclusion of Week 16, whichever is earlier), a **30-day Hypercare Period** commences at **no additional cost to RTR**. During the Hypercare Period, ClearObject will:

- Monitor the production platform for critical defects and data pipeline failures
- **Priority Response (within 1 business day):** Platform unavailability, data pipeline failures, security vulnerabilities, data integrity issues
- **Standard Response (within 3 business days):** UI defects, calculation discrepancies, integration anomalies, configuration errors
- Provide up to five (5) hours of complimentary configuration or tuning support (e.g., alert threshold adjustments, dashboard layout changes, user provisioning, integration parameter updates)
- Conduct a Day 15 check-in call with RTR stakeholders to review platform health and open items

**Hypercare Exclusions:** New features or scope additions; issues caused by RTR platform modifications or infrastructure changes; changes to RTR's network or security environment not disclosed to ClearObject; GCP or third-party service outages (Girbau, MaintainX, OpenAI, Brightwell, iConnect).

### 6.2 Post-Hypercare Support

Following the 30-day Hypercare Period, ongoing platform support, managed services, SLA-backed monitoring, and platform evolution will be governed by a separate **Master Services Agreement (MSA)** to be negotiated between ClearObject and RTR. ClearObject will provide a proposed MSA scope and pricing to RTR no later than **Week 14** of this engagement to allow sufficient review time prior to Hypercare commencement.

---

## SECTION 7: INTELLECTUAL PROPERTY

### 7.1 Background Intellectual Property

ClearObject possesses and may utilize certain pre-existing intellectual property, including but not limited to its proprietary methodologies, analytical frameworks, software tools, algorithms, data processing techniques, and general know-how related to data analytics, AI/ML model development, process optimization, and manufacturing intelligence, developed or acquired by ClearObject independently of this SOW (collectively, "Background IP"). All rights, title, and interest in and to such Background IP shall remain solely with ClearObject.

To the extent that ClearObject's Background IP is incorporated into or is necessary for RTR's use of the Deliverables provided under this SOW, ClearObject grants RTR a non-exclusive, non-transferable, royalty-free, perpetual license to use such Background IP solely as an integral part of, and for the purpose of utilizing, such Deliverables for RTR's internal business purposes. RTR shall not reverse engineer, decompile, or disassemble any Background IP of ClearObject.

### 7.2 Ownership of Deliverables

"Deliverables" shall mean all custom-developed software, application components, AI/ML model configurations, data pipeline code, integration services, database schemas, documentation, and related work product developed by ClearObject specifically for RTR and delivered pursuant to this SOW. Subject to RTR's full payment of all fees due under this SOW and ClearObject's rights in its Background IP, RTR shall own all rights, title, and interest in and to the Deliverables.

ClearObject shall retain ownership of its Background IP and the right to use its general skills, know-how, and non-customer-specific techniques developed during the engagement, provided that ClearObject does not use or disclose any RTR Confidential Information in doing so.

### 7.3 Confidentiality and Trade Secrets

**(a) Definition:** "Confidential Information" means any information disclosed by one party to the other, in writing, orally, or by inspection of tangible objects, which is designated "Confidential," "Proprietary," or a similar designation, or which should reasonably be understood to be confidential given the nature of the information and circumstances of disclosure. If designated as Confidential Information orally, the Disclosing Party must confirm such designation in writing within thirty (30) days.

`[EDIT: Added the written-confirmation requirement per Jonathan Kopf / Matt Bass comment #18.]`

**(b) Obligations:** The Receiving Party agrees to: (i) use Confidential Information solely for performing obligations under this SOW; (ii) not disclose Confidential Information to any third party without prior written consent; and (iii) protect Confidential Information with the same care as its own confidential information of like nature, but in no event less than a reasonable standard of care.

**(c) Exclusions:** Confidential Information does not include information that: (i) is or becomes publicly known through no wrongful act of the Receiving Party; (ii) was lawfully in the Receiving Party's possession prior to disclosure without confidentiality obligation; (iii) is independently developed by the Receiving Party without reference to the Disclosing Party's Confidential Information; or (iv) is rightfully received from a third party without restriction.

**(d) Required Disclosure:** If compelled by law to disclose Confidential Information, the Receiving Party will provide prompt written notice to the Disclosing Party (to the extent legally permitted) to enable the Disclosing Party to seek a protective order.

**(e) Independent Development:** Nothing in this SOW will prohibit a Receiving Party from developing products, concepts, systems, or techniques that are similar to or compete with any such concepts, systems, or techniques described in Confidential Information, provided that the Receiving Party does not violate any of its obligations under this SOW in connection with such development.

`[EDIT: Added per Jonathan Kopf / Matt Bass comment #19.]`

**(f) AI and ML Restrictions:** Neither ClearObject nor any third party engaged by ClearObject shall use any RTR Confidential Information or other RTR data obtained in the course of performing the Services to train any AI or ML models, or outputs thereof, made available to any third party.

`[EDIT: Added per Jonathan Kopf / Matt Bass comment #17.]`

### 7.4 Unauthorized Use

Each party agrees that any unauthorized use, reproduction, distribution, modification, creation of derivative works, or disclosure of the other party's Intellectual Property constitutes a violation of the other party's intellectual property rights. Each party reserves all available legal remedies to protect its rights.

---

## SECTION 8: WARRANTIES AND LIMITATIONS OF LIABILITY

### 8.1 Limited Warranty

ClearObject warrants that: (a) Services will be performed in a professional and workmanlike manner consistent with industry standards; (b) ClearObject has the right to enter into and perform this SOW without violating any third-party rights; (c) the Deliverables will substantially conform to the Acceptance Criteria defined in Section 2 for thirty (30) days after acceptance, aligned with the Hypercare Period defined in Section 6.1.

ClearObject's sole obligation for breach of this warranty is to re-perform non-conforming work at no additional charge.

**Warranty Exclusions:** This warranty excludes: (i) defects caused by RTR modifications to the platform or infrastructure; (ii) third-party hardware failures beyond ClearObject's control; (iii) GCP or third-party API service outages; (iv) changes to RTR's network or security environment not disclosed to ClearObject.

### 8.2 Disclaimer

EXCEPT AS EXPRESSLY SET FORTH IN SECTION 8.1, CLEAROBJECT MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

### 8.3 Limitation of Liability

`[EDIT: Changed "ClearObject's total liability" to "each party's total liability" per Jonathan Kopf / Matt Bass comment #16.]`

TO THE MAXIMUM EXTENT PERMITTED BY LAW, **EACH PARTY'S** TOTAL LIABILITY ARISING OUT OF OR RELATED TO THIS SOW SHALL NOT EXCEED THE TOTAL FEES PAID BY RTR UNDER THIS SOW IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, OR BUSINESS INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

**Exceptions:** The limitations in this Section 8.3 do not apply to: (i) RTR's payment obligations; (ii) either party's indemnification obligations; or (iii) damages caused by either party's gross negligence or willful misconduct.

---

## SECTION 9: ENTIRE AGREEMENT

As it relates to this Statement of Work and the governing Agreement, this SOW contains the entire agreement of the parties regarding the subject herein and supersedes all prior or contemporaneous negotiations, discussions, understandings, or agreements between the parties relating thereto. Any amendment to this SOW must be in writing and signed by the authorized representatives of both parties to be effective. This SOW may be executed in counterparts, each of which is an original.

By the signature of each party's authorized representative below, the parties execute this SOW:

| | |
|---|---|
| **Agreed to: Rent the Runway** | **Agreed to: ClearObject, Inc.** |
| 10 Jay St., New York, NY 11202 | 11634 Maple Street, Suite 200, Fishers, IN 46038 |
| By: _________________________ | By: _________________________ |
| Name: _______________________ | Name: _______________________ |
| Title: ________________________ | Title: ________________________ |
| Date: ________________________ | Date: ________________________ |

---

## APPENDICES

### Appendix A: Change Control Procedure

The following process will be followed if a change to this SOW is required:

ClearObject and Customer may determine it is necessary to modify scope, deliverables, or timeline as defined in this SOW. In such event, Customer may authorize changes through the written request of its SOW signatory referencing this SOW. All material changes will be executed via a **Project Change Request (PCR)**. A PCR must describe the change, the rationale, and the effect on the project (scope, timeline, fees). A PCR must be signed by authorized representatives of both parties. Until a change is agreed to in writing, both parties will continue to act in accordance with the latest agreed version of the SOW.

### Appendix B: Project Deliverable Acceptance Procedure

A **Project Deliverable Acceptance Form (PDAF)** will be used to communicate completion of deliverables. The PDAF must name the deliverable, the delivery date, and any relevant notes. ClearObject will provide written notice upon completion of each Deliverable. RTR shall complete acceptance testing within **fifteen (15) business days** and either: (i) provide written acceptance; or (ii) provide written notice of nonconformities. In the event of nonconformities, ClearObject will promptly remedy the Deliverable to conform to Acceptance Criteria.

Acceptance shall be deemed to occur upon the earlier of: RTR's first use of the Deliverable in production; RTR's written acceptance; or fifteen (15) business days after ClearObject's completion notice if RTR provides no written nonconformance notice.

### Appendix C: Project Discovery Questionnaire

`[EDIT: Updated from prior version to add Girbau Sapphire, MaintainX, and Brightwell system access questions alongside the existing dryer IoT, iConnect, and facility infrastructure questions. Full updated questionnaire to be delivered as a separate document at Project Kickoff.]`

**Required Response Deadline:** Within ten (10) business days of SOW execution.

*Section 1: Facility & Operations*
- Confirm EWR facility address and primary operations contact
- Union labor agreements at EWR: any restrictions on third-party technician installation?
- Scheduled installation windows for sensor deployment (active shift vs. planned downtime)?
- Hazardous location zones: are any dryer areas Class I Division 2 rated?
- Maximum ambient temperatures near dryer exhaust vents

*Section 2: Network & IT Infrastructure*
- GCP project: existing RTR GCP organization/project or new project required?
- Network segmentation: IoT VLAN requirements; process for whitelisting outbound MQTT/HTTPS traffic?
- Identity Provider for SSO: Okta, Azure AD, or Google Workspace?
- Data residency requirements (US-only GCP regions)?

*Section 3: System Integration Access*
- Girbau Sapphire: account credentials, API documentation (if available), data fields accessible
- iConnect (Union): network access pathway, VPN requirements, available data endpoints
- Brightwell: platform credentials, API key or data export capabilities
- MaintainX: API credentials, work order data fields needed, asset ID reference list

*Section 4: IoT & Hardware*
- Dryer inventory at EWR: make/model/count per type (Miele PT 8807D, PDR944SI; Continental CG115-125)
- Existing network infrastructure near dryer area: available conduit, power drop proximity
- Spare parts strategy: on-hand crash kit preferred?
- Compliance/certification requirements beyond FCC/CE for hardware attached to dryers?

---

*Document: Rent the Runway Statement of Work — AI-Enabled Digital Thread | IoT Platform*
*Version: REDRAFT v1 — Proposed Suggested Edits for RTR Review*
*Prepared by: ClearObject, Inc.*
*Date: February 2026*
