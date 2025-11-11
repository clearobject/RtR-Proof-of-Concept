'use client'

import { ReactNode } from 'react'
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

  return (
    <Card
      className={cn(
        'flex flex-col gap-4 p-6 transition-shadow hover:shadow-[var(--shadow-rtr-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rtr-wine focus-visible:ring-offset-2',
        accentClasses
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-rtr-slate uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-rtr-ink">{value}</p>
        </div>
        {icon && (
          <span
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-xl',
              iconWrapperClasses
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-rtr-slate">
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center gap-2 font-medium',
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
  )
}


