# Comprehensive Data Seeding Guide

This guide explains how to seed the database with realistic data for demonstrations and walkthroughs.

## Prerequisites

1. **Run the migration** to add required columns:
   ```bash
   # Apply migration 008_add_asset_financial_fields.sql in Supabase
   # This adds: acquisition_cost, salvage_value, mttr_hours columns to assets table
   ```

2. **Ensure you have assets** in the database. If not, import them first using the Assets page CSV import feature.

3. **Set environment variables** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Running the Seed Script

```bash
cd web
node scripts/seed-comprehensive-data.mjs
```

## What Gets Seeded

### 1. Sensor Data (24h and 7d)
- Generates hourly sensor readings for the last 7 days
- Includes temperature, vibration, power, and humidity metrics
- Data varies by equipment type and time of day
- Accounts for asset status (operational, warning, critical)

### 2. Alerts
- Creates alerts based on asset status
- Critical/warning assets get more alerts
- Mix of acknowledged and unacknowledged alerts
- Alerts span the last 30 days

### 3. Downtime Events
- Generates 2-8 downtime events per asset over 6 months
- Mix of planned (30%) and unplanned (70%) events
- Includes realistic causes and impacts
- Duration: planned (2-8 hours), unplanned (1-24 hours)

### 4. Maintenance Tickets and Costs
- Creates tickets from unacknowledged alerts
- Generates historical tickets (3-8 per asset)
- Associates costs with resolved tickets
- Cost types: parts, labor, energy, other

### 5. Acquisition Costs
- Assigns realistic acquisition costs based on equipment type
- Uses industry-standard pricing ranges
- Updates all assets in the database

### 6. Salvage Values
- Calculates salvage values based on asset age
- Decreases with age (new = 15% of acquisition, EOL = 5%)
- Used in Capex forecasting

### 7. Preventive Maintenance Tasks
- Generates 2-6 PM tasks per active asset
- Scheduled for next 6 months
- Mix of scheduled, completed, and overdue statuses
- Links to PM templates when available

### 8. MTTR Values
- Calculates Mean Time To Repair from downtime events
- Updates `mttr_hours` column in assets table
- Based on unplanned downtime events only

## Equipment Pricing Reference

The script uses the following pricing ranges (based on real-world estimates):

| Equipment Type | Price Range | Salvage % (New) |
|---------------|-------------|-----------------|
| Washer | $45,000 - $85,000 | 15% |
| Dryer | $35,000 - $65,000 | 12% |
| Dry Cleaner | $120,000 - $200,000 | 10% |
| Steam Tunnel | $80,000 - $150,000 | 8% |
| Press | $25,000 - $45,000 | 15% |
| Automated Sorter | $200,000 - $350,000 | 5% |
| Quality Scanner | $15,000 - $30,000 | 20% |
| Packing Line | $100,000 - $180,000 | 10% |

## Data Volume Estimates

For a typical installation with 50 assets:

- **Sensor Data**: ~8,400 records (50 assets × 24 hours × 7 days)
- **Alerts**: ~50-150 alerts
- **Downtime Events**: ~200-400 events
- **Maintenance Tickets**: ~150-400 tickets
- **Cost Records**: ~300-800 cost entries
- **PM Tasks**: ~100-300 tasks

## Verification

After running the seed script, verify the data:

1. **Assets Page**: Check that chips show correct counts
2. **Asset Detail Page**: Verify 24h and 7d metrics display
3. **Alerts Page**: Confirm alert count matches Digital Twin chip
4. **Capex Page**: Verify replacement priorities and timeline show data
5. **Maintenance Page**: Check tickets and costs are visible

## Troubleshooting

### "No assets found" warnings
- Ensure you have assets in the database
- Check that assets have `status` set to 'active', 'operational', 'warning', or 'critical'

### Missing acquisition costs
- Run the migration `008_add_asset_financial_fields.sql` first
- Re-run the seed script to populate costs

### Alert count mismatch
- The Digital Twin page shows **unacknowledged** alerts only
- The Alerts page shows **all** alerts
- This is expected behavior

### Empty Capex timeline
- Ensure assets have `expected_life_years` set
- Check that `in_service_date` is in the past
- Timeline shows assets reaching end of life in next 5 years

## Notes

- The script is **idempotent** - you can run it multiple times
- Existing data may be duplicated if run multiple times
- Consider clearing test data before re-running for production demos
- Sensor data generation can take several minutes for large asset counts

