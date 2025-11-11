'use client'

import Link from 'next/link'
import type { ElementType, ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

type TrendDirection = 'up' | 'down' | 'flat'

interface KpiCardProps {
  label: string
  value: string
  trend?: {
    direction: TrendDirection
    value: string
  }
  helperText?: string
  icon?: ReactNode
  accent?: 'default' | 'wine' | 'blush' | 'success' | 'warning'
  href?: string
  onClick?: () => void
}

const trendIconMap: Record<TrendDirection, ReactNode> = {
  up: <ArrowUpRight className="h-4 w-4" aria-hidden />,
  down: <ArrowDownRight className="h-4 w-4" aria-hidden />,
  flat: <Minus className="h-4 w-4" aria-hidden />,
}

export function KpiCard({
  label,
  value,
  trend,
  helperText,
  icon,
  accent = 'default',
  href,
  onClick,
}: KpiCardProps) {
  const accentClasses = {
    default: 'border-rtr-border',
    wine: 'border-rtr-wine/20',
    blush: 'border-rtr-blush',
    success: 'border-rtr-success/30',
    warning: 'border-rtr-warning/30',
  }[accent]

  const iconWrapperClasses = {
    default: 'bg-rtr-cream text-rtr-wine',
    wine: 'bg-rtr-wine text-white',
    blush: 'bg-rtr-blush text-rtr-wine',
    success: 'bg-rtr-success/10 text-rtr-success',
    warning: 'bg-rtr-warning/10 text-rtr-warning',
  }[accent]

  const clickable = Boolean(href || onClick)
  const WrapperComponent: ElementType = href ? Link : onClick ? 'button' : 'div'
  const wrapperProps: Record<string, unknown> = {}
  if (href) wrapperProps.href = href
  if (onClick) {
    wrapperProps.onClick = onClick
    if (!href) {
      wrapperProps.type = 'button'
    }
  }

  return (
    <WrapperComponent
      {...wrapperProps}
      className={cn(
        clickable && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rtr-wine focus-visible:ring-offset-2',
        'block'
      )}
      aria-label={clickable ? label : undefined}
    >
      <Card
        className={cn(
          'flex min-h-[120px] flex-col gap-3 rounded-xl border border-rtr-border bg-white p-4 sm:min-h-[120px] sm:p-5 transition-shadow',
          clickable && 'cursor-pointer hover:shadow-[var(--shadow-rtr-elevated)]',
          accentClasses
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rtr-slate">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-rtr-ink sm:text-3xl">
              {value}
            </p>
          </div>
          {icon && (
            <span
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-lg',
                iconWrapperClasses
              )}
            >
              {icon}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-rtr-slate sm:text-sm">
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 font-medium',
                trend.direction === 'up' && 'text-rtr-success',
                trend.direction === 'down' && 'text-rtr-danger'
              )}
            >
              {trendIconMap[trend.direction]}
              {trend.value}
            </span>
          ) : (
            <span aria-hidden />
          )}
          {helperText && <span className="text-right">{helperText}</span>}
        </div>
      </Card>
    </WrapperComponent>
  )
}


