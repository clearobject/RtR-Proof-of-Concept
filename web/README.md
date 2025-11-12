This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Inter](https://rsms.me/inter/) and Geist Mono fonts.

## Design System

This project uses a custom design system inspired by Rent the Runway's brand identity. See [`docs/design-system.md`](../docs/design-system.md) for complete documentation on:

- Color palette and usage
- Typography guidelines
- Component library (Button, Card, Badge)
- Design principles and best practices

## AI Insights Assistant

The `/ai` route exposes a conversational assistant that summarizes plant performance, risks, and opportunities.

1. Add your OpenAI credentials to the environment:

   ```bash
   # .env.local
   OPENAI_API_KEY=sk-...
   # Optional override – defaults to gpt-4o-mini if unset
   OPENAI_MODEL=gpt-4o-mini
   # Required for grounding responses with Supabase factory data
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Restart the Next.js dev server after updating environment variables.

3. In production, ensure the key is stored securely (e.g., Vercel env vars) and never exposed to the client. The API route proxies all requests and redacts error details from end users.

4. Tailor the assistant by extending the system prompt in `app/api/ai/chat/route.ts` with plant-specific context or data source instructions, or by enriching the Supabase grounding queries to include additional metrics.

## Demo Seed Dataset

Populate the Supabase database with a realistic production-style snapshot for demos:

1. Run the Supabase containers (see `SUPABASE_SETUP.md` if needed).
2. Reset and reseed using the bundled script:

   ```bash
   cd web
   npm run db:reset
   ```

   The reset truncates high-churn tables and injects:

   - 12 critical assets and 12 mapped machines with zones and coordinates.
   - 14 days of hourly sensor telemetry per machine (temperature, vibration, power, humidity, flow rate).
   - Layered alerts, downtime events, cost records, and maintenance tickets across multiple statuses.
   - Preventive maintenance templates with scheduled, overdue, and completed tasks.

3. Log into the dashboard to explore populated alerts, maintenance, and capex views aligned with the demo storyline.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Syncing Asset Aliases to Supabase

Use the helper script in `scripts/push-machine-aliases.js` to populate `assets.alias` and `machines.asset_alias` from `data/RtR Assets.csv` so the factory layout can reference live data.

```bash
cd web
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/push-machine-aliases.js
```

The script is idempotent and uses `alias`/`asset_alias` as the upsert keys. A Supabase service role key is required because it bypasses row-level security to insert or update the records in bulk.
