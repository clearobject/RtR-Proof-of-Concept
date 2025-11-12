import { NextRequest, NextResponse } from 'next/server'

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

  const payload = {
    model: DEFAULT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT,
      },
      ...sanitizedMessages,
    ],
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


