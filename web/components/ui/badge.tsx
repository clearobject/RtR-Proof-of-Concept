import { cn } from '@/lib/utils/cn'
import { HTMLAttributes, forwardRef } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'neutral'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => {
    const variants = {
      success: 'bg-green-50 text-rtr-success border-green-200',
      warning: 'bg-amber-50 text-rtr-warning border-amber-200',
      danger: 'bg-red-50 text-rtr-danger border-red-200',
      neutral: 'bg-gray-50 text-rtr-slate border-rtr-border',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }

