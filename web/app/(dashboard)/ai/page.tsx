'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Send, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

type VisibleMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type ApiMessage = {
  role: 'user' | 'assistant'
  content: string
}

const INTRO_MESSAGE: VisibleMessage = {
  id: 'intro',
  role: 'assistant',
  content:
    "Hello! I'm your conversational co-pilot for the fulfillment center. Ask me about throughput, quality, labor efficiency, upcoming maintenance, or anything else you'd expect on an ops war room dashboard—I'll surface the most relevant metrics, trends, and risks.",
}

const SUGGESTED_PROMPTS = [
  'How did garment throughput trend this week versus plan?',
  'Where are we seeing the biggest delays in the dry cleaning line?',
  'Summarize maintenance risks we should escalate for tomorrow’s standup.',
] as const

export default function AiInsightsPage() {
  const [messages, setMessages] = useState<VisibleMessage[]>([INTRO_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const container = messagesContainerRef.current

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isSubmitting])

  const payloadHistory = useMemo<ApiMessage[]>(() => {
    return messages.map(({ role, content }) => ({ role, content }))
  }, [messages])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed || isSubmitting) {
      return
    }

    const userMessage: VisibleMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    }

    setMessages((current) => [...current, userMessage])
    setInputValue('')
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...payloadHistory, { role: 'user', content: trimmed }],
        }),
      })

      if (!response.ok) {
        const { error: apiError } = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(apiError || 'The assistant was unable to respond.')
      }

      const { message } = (await response.json()) as { message: string }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: message,
        },
      ])
    } catch (caughtError) {
      console.error('[AI Page] Failed to fetch assistant response', caughtError)
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong while contacting the assistant.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt)
    inputRef.current?.focus()
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-rtr-cream via-rtr-cream to-rtr-blush/30">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 overflow-hidden p-8">
        <header className="flex flex-shrink-0 flex-col gap-3">
          <div className="flex items-center gap-2 text-rtr-wine">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Generative Ops Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-rtr-ink">
            Insight Assistant
          </h1>
          <p className="w-full text-base text-rtr-slate">
            Discover performance drivers across the operation with a conversational
            interface. Ask about throughput, quality, labor utilization, SLA risk, or any metric you
            would track on the factory floor. The assistant will synthesize data, call out trends, and
            recommend next actions.
          </p>
        </header>

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-rtr-wine/10 shadow-lg">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-2xl text-rtr-ink">
              <Sparkles className="h-6 w-6 text-rtr-wine" />
              Ask the Plant Co-Pilot
            </CardTitle>
            <CardDescription>
              Conversations persist for this session only. No customer PII is sent to external AI
              providers.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
            <div
              ref={messagesContainerRef}
              className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto rounded-xl border border-rtr-border/70 bg-white/70 p-4 shadow-inner"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex', {
                    'justify-end': message.role === 'user',
                    'justify-start': message.role === 'assistant',
                  })}
                >
                  <div
                    className={cn(
                      'max-w-3xl whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                      message.role === 'user'
                        ? 'bg-rtr-wine text-white'
                        : 'bg-rtr-cream text-rtr-ink border border-rtr-border/70'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isSubmitting && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 rounded-2xl border border-rtr-border/70 bg-rtr-cream px-4 py-3 text-sm text-rtr-slate shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-rtr-wine" />
                    Analyzing telemetry and historical trends…
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex-shrink-0 rounded-lg border border-rtr-danger/40 bg-rtr-danger/10 px-4 py-3 text-sm text-rtr-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-shrink-0 flex-col gap-3">
              <div className="flex items-end gap-3">
                <label className="sr-only" htmlFor="ai-question">
                  Ask the Assistant
                </label>
                <textarea
                  id="ai-question"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Ask about plant performance, risks, and opportunities…"
                  minLength={3}
                  rows={3}
                  className="flex-1 resize-none rounded-xl border border-rtr-border/70 bg-white px-4 py-3 text-sm text-rtr-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rtr-wine focus-visible:ring-offset-2"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !inputValue.trim()}
                  className="h-12 rounded-xl px-5 text-base"
                  aria-label="Send question to the Assistant"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Thinking
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Ask
                    </>
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-rtr-slate">
                <span className="font-medium uppercase tracking-wide text-rtr-ink">
                  Try asking:
                </span>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="rounded-full border border-rtr-border/60 bg-rtr-blush/40 px-3 py-1 text-xs font-medium text-rtr-ink transition-colors hover:bg-rtr-blush/80"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


