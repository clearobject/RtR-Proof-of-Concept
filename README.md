# Rent the Runway – Operations Prototype

This repository contains a proof-of-concept web application for Rent the Runway,
focused on:

1. A factory-floor Digital Twin for real-time visibility into machine and process health.
2. A Capital Asset Management & Maintenance system.
3. A Social Pulse module to monitor and act on customer sentiment.

Tech stack (prototype):

- Next.js 14 (App Router)
- Supabase (Postgres + Auth)
- Vercel (hosting)
- Cursor AI for code generation and assisted development

See `docs/requirements-overview.md` for detailed functional requirements.

## Admin & Access Management

The prototype now includes an `Admin` area (available to managers and admins) that supports:

- Creating single-use invites or QR codes to onboard teammates.
- Generating shareable join links so partners can request access without an account.
- Reviewing, approving, or denying incoming access requests with automatic invite generation.
- Removing existing users when access is no longer required.

Public join links surface a lightweight request form at `/join/[token]`, ensuring that new users can be reviewed before they receive an invite.