import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import type {
  Alert,
  DowntimeEvent,
  MaintenanceTicket,
  Machine,
  SensorData,
} from '@/lib/types'

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

const SYSTEM_PROMPT = `
You are "RTR Insight", an analytic co-pilot for Rent the Runway's garment processing facility.
Synthesize insights across throughput, quality, labor efficiency, inventory turns, SLA adherence, predictive maintenance, and sustainability metrics.
Explain trends over time, call out anomalies, and highlight factors that contribute to improvements or risks.
When data is unavailable, recommend the signals, dashboards, or experiments that would uncover the answer.
Keep responses concise, actionable, and focused on operations outcomes (cost, uptime, turnaround, customer satisfaction).
`.trim()

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type TelemetryAggregate = {
  vibrationAvg?: number
  temperatureMax?: number
  powerAvg?: number
  flowAvg?: number
}

type TelemetrySamples = {
  vibration: number[]
  temperature: number[]
  power: number[]
  flow: number[]
}

function formatNumber(value: number | undefined, options?: Intl.NumberFormatOptions) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return new Intl.NumberFormat('en-US', options).format(value)
}

function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('[AI Chat] Supabase environment variables missing; skipping data grounding')
    return null
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })
}

async function buildOperationalContext(): Promise<string | null> {
  const supabase = createSupabaseServiceClient()

  if (!supabase) {
    return null
  }

  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { data: machines, error: machinesError },
      { data: alerts, error: alertsError },
      { data: tickets, error: ticketsError },
      { data: downtimeEvents, error: downtimeError },
      { data: telemetryRows, error: telemetryError },
    ] = await Promise.all([
      supabase
        .from('assets')
        .select('id,name,type,status,zone')
        .eq('facility_id', '550e8400-e29b-41d4-a716-446655440000'),
      supabase
        .from('alerts')
        .select('id,asset_id,severity,message,acknowledged,created_at')
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('maintenance_tickets')
        .select('id,asset_id,status,priority,title,created_at,updated_at')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('downtime_events')
        .select('id,asset_id,start_time,end_time,duration_minutes,type,cause,impact,created_at')
        .gte('start_time', since14d),
      supabase
        .from('sensor_data')
        .select('asset_id,temperature,vibration,power,flow_rate,timestamp')
        .gte('timestamp', since24h)
        .order('timestamp', { ascending: false })
        .limit(2000),
    ])

    if (machinesError) throw machinesError
    if (alertsError) throw alertsError
    if (ticketsError) throw ticketsError
    if (downtimeError) throw downtimeError
    if (telemetryError) throw telemetryError

    const machineList = (machines ?? []) as Pick<Machine, 'id' | 'name' | 'type' | 'status' | 'zone'>[]
    const machineLookup = new Map(machineList.map((machine) => [machine.id, machine]))

    const statusCounts = machineList.reduce<Record<string, number>>((acc, machine) => {
      acc[machine.status] = (acc[machine.status] ?? 0) + 1
      return acc
    }, {})

    const alertsData = (alerts ?? []) as Alert[]
    const openAlerts = alertsData.filter((alert) => !alert.acknowledged).slice(0, 5)

    const ticketData = (tickets ?? []) as MaintenanceTicket[]
    const openTickets = ticketData.filter((ticket) => ['Open', 'In_progress'].includes(ticket.status))
    const urgentTickets = openTickets.filter((ticket) => ticket.priority === 'Urgent')
    const statusSummary = ticketData.reduce<Record<string, number>>((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] ?? 0) + 1
      return acc
    }, {})

    const downtimeData = (downtimeEvents ?? []) as DowntimeEvent[]
    const downtimeTotals = downtimeData.reduce(
      (acc, event) => {
        const duration =
          event.duration_minutes ??
          (event.end_time
            ? Math.round(
                (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000
              )
            : Math.round((Date.now() - new Date(event.start_time).getTime()) / 60000))

        if (event.type === 'Planned') {
          acc.planned += Math.max(duration, 0)
        } else {
          acc.unplanned += Math.max(duration, 0)
        }

        if (!event.end_time) {
          acc.active.push(event)
        }

        return acc
      },
      { planned: 0, unplanned: 0, active: [] as DowntimeEvent[] }
    )

    const telemetrySamples = new Map<string, TelemetrySamples>()
    const telemetryRowsTyped = (telemetryRows ?? []) as Pick<
      SensorData,
      'asset_id' | 'temperature' | 'vibration' | 'power' | 'flow_rate'
    >[]

    telemetryRowsTyped.forEach((row) => {
      if (!row.asset_id) return

      const current = telemetrySamples.get(row.asset_id) ?? {
        vibration: [],
        temperature: [],
        power: [],
        flow: [],
      }

      if (typeof row.vibration === 'number') {
        current.vibration.push(row.vibration)
      }
      if (typeof row.temperature === 'number') {
        current.temperature.push(row.temperature)
      }
      if (typeof row.power === 'number') {
        current.power.push(row.power)
      }
      if (typeof row.flow_rate === 'number') {
        current.flow.push(row.flow_rate)
      }

      telemetrySamples.set(row.asset_id, current)
    })

    const telemetrySummaries = Array.from(telemetrySamples.entries()).reduce<
      Record<string, TelemetryAggregate>
    >((acc, [assetId, samples]) => {
      const vibrationSamples = samples.vibration
      const temperatureSamples = samples.temperature
      const powerSamples = samples.power
      const flowSamples = samples.flow

      acc[assetId] = {
        vibrationAvg:
          vibrationSamples && vibrationSamples.length
            ? vibrationSamples.reduce((sum, value) => sum + value, 0) / vibrationSamples.length
            : undefined,
        temperatureMax:
          temperatureSamples && temperatureSamples.length
            ? temperatureSamples.reduce((max, value) => Math.max(max, value), -Infinity)
            : undefined,
        powerAvg:
          powerSamples && powerSamples.length
            ? powerSamples.reduce((sum, value) => sum + value, 0) / powerSamples.length
            : undefined,
        flowAvg:
          flowSamples && flowSamples.length
            ? flowSamples.reduce((sum, value) => sum + value, 0) / flowSamples.length
            : undefined,
      }

      return acc
    }, {})

    const vibrationHotspots = Object.entries(telemetrySummaries)
      .filter(([, agg]) => typeof agg.vibrationAvg === 'number')
      .sort(([, a], [, b]) => (b.vibrationAvg ?? 0) - (a.vibrationAvg ?? 0))
      .slice(0, 4)
      .map(([assetId, agg]) => {
        const machine = machineLookup.get(assetId)
        const vibration = formatNumber(agg.vibrationAvg, { maximumFractionDigits: 2 })
        return machine && vibration ? `${machine.name} (${machine.type}): ${vibration} mm/s` : null
      })
      .filter(Boolean)

    const temperatureHotspots = Object.entries(telemetrySummaries)
      .filter(([, agg]) => typeof agg.temperatureMax === 'number')
      .sort(([, a], [, b]) => (b.temperatureMax ?? 0) - (a.temperatureMax ?? 0))
      .slice(0, 3)
      .map(([assetId, agg]) => {
        const machine = machineLookup.get(assetId)
        const temp = formatNumber(agg.temperatureMax, { maximumFractionDigits: 1 })
        return machine && temp ? `${machine.name}: ${temp}°C` : null
      })
      .filter(Boolean)

    const throughputLeaders = Object.entries(telemetrySummaries)
      .filter(([, agg]) => typeof agg.flowAvg === 'number')
      .sort(([, a], [, b]) => (b.flowAvg ?? 0) - (a.flowAvg ?? 0))
      .slice(0, 3)
      .map(([assetId, agg]) => {
        const machine = machineLookup.get(assetId)
        const flow = formatNumber(agg.flowAvg, { maximumFractionDigits: 0 })
        return machine && flow ? `${machine.name}: ${flow} units/hr` : null
      })
      .filter(Boolean)

    const contextSections: string[] = []

    contextSections.push(
      `Snapshot generated ${new Date().toISOString()}. ${machineList.length} machines tracked (facility EWR).`
    )

    if (machineList.length) {
      const statusLine = Object.entries(statusCounts)
        .map(([status, count]) => `${status}: ${count}`)
        .join(', ')
      contextSections.push(`Machine status mix → ${statusLine}.`)
    }

    if (vibrationHotspots.length) {
      contextSections.push(
        `Vibration hotspots (24h avg mm/s): ${vibrationHotspots.join('; ')}.`
      )
    }

    if (temperatureHotspots.length) {
      contextSections.push(`Peak temperatures (last 24h): ${temperatureHotspots.join('; ')}.`)
    }

    if (throughputLeaders.length) {
      contextSections.push(
        `Throughput proxies (avg flow rate units/hr): ${throughputLeaders.join('; ')}.`
      )
    }

    if (openAlerts.length) {
      const alertLines = openAlerts.map((alert) => {
        const machine = machineLookup.get(alert.asset_id)
        const createdAgo = new Date(alert.created_at)
        const minutesAgo = Math.round((Date.now() - createdAgo.getTime()) / 60000)
        return `${alert.severity.toUpperCase()} – ${machine?.name ?? alert.asset_id}: ${
          alert.message
        } (${minutesAgo} min ago)`
      })
      contextSections.push(`Active alerts: ${alertLines.join(' | ')}.`)
    }

    if (Object.keys(statusSummary).length) {
      const ticketLine = Object.entries(statusSummary)
        .map(([status, count]) => `${status}: ${count}`)
        .join(', ')
      contextSections.push(`Maintenance ticket load → ${ticketLine}.`)
    }

    if (urgentTickets.length) {
      const urgentLine = urgentTickets
        .slice(0, 3)
        .map((ticket) => {
          const machine = ticket.asset_id ? machineLookup.get(ticket.asset_id) : null
          return `${ticket.title}${machine ? ` (${machine.name})` : ''}`
        })
        .join('; ')
      contextSections.push(`Urgent focus items: ${urgentLine}.`)
    }

    if (downtimeData.length) {
      const downtimeSummary = `Downtime trailing 14d → Unplanned: ${downtimeTotals.unplanned} min; Planned: ${downtimeTotals.planned} min.`
      contextSections.push(downtimeSummary)
      if (downtimeTotals.active.length) {
        const activeLine = downtimeTotals.active
          .map((event) => {
            const machine = event.asset_id ? machineLookup.get(event.asset_id) : null
            const minutesOpen = Math.round(
              (Date.now() - new Date(event.start_time).getTime()) / 60000
            )
            return `${machine?.name ?? event.asset_id} – ${event.cause ?? 'Active outage'} (${
              minutesOpen > 0 ? `${minutesOpen} min ongoing` : 'started recently'
            })`
          })
          .join('; ')
        contextSections.push(`Live outages: ${activeLine}.`)
      }
    }

    return contextSections.join('\n')
  } catch (error) {
    console.error('[AI Chat] Failed to gather operational context', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error('[AI Chat] Missing OPENAI_API_KEY environment variable')
    return NextResponse.json(
      {
        error: 'AI service is not configured. Please set OPENAI_API_KEY on the server.',
      },
      { status: 500 }
    )
  }

  let parsedBody: { messages?: ChatMessage[] }

  try {
    parsedBody = await request.json()
  } catch (error) {
    console.error('[AI Chat] Failed to parse request body', error)
    return NextResponse.json(
      { error: 'Invalid JSON payload.' },
      {
        status: 400,
      }
    )
  }

  const history = Array.isArray(parsedBody.messages) ? parsedBody.messages : []

  const sanitizedMessages: ChatMessage[] = history
    .filter(
      (message): message is ChatMessage =>
        Boolean(message?.role) &&
        (message.role === 'user' || message.role === 'assistant' || message.role === 'system') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))

  const operationalContext = await buildOperationalContext()

  const payload = {
    model: DEFAULT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT,
      },
      operationalContext
        ? {
            role: 'system' as const,
            content: `Latest plant telemetry and maintenance context:\n${operationalContext}`,
          }
        : null,
      ...sanitizedMessages,
    ].filter(Boolean),
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null)

      console.error('[AI Chat] Upstream failure', {
        status: response.status,
        statusText: response.statusText,
        body: errorPayload,
      })

      return NextResponse.json(
        {
          error: 'The AI service returned an error. Please try again shortly.',
          details: errorPayload ?? null,
        },
        { status: response.status }
      )
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      usage?: Record<string, unknown>
    }

    const assistantReply = data.choices?.[0]?.message?.content?.trim()

    if (!assistantReply) {
      console.error('[AI Chat] No assistant message found in response', data)

      return NextResponse.json(
        {
          error: 'Received an unexpected response from the AI service.',
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      message: assistantReply,
      usage: data.usage ?? null,
    })
  } catch (error) {
    console.error('[AI Chat] Unexpected failure', error)

    return NextResponse.json(
      {
        error: 'Unable to reach the AI service. Check network connectivity and credentials.',
      },
      { status: 502 }
    )
  }
}


