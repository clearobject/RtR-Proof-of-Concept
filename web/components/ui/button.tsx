import { cn } from '@/lib/utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rtr-wine focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      primary: 'bg-rtr-wine text-white hover:bg-rtr-wine-light active:bg-rtr-wine-light/90 shadow-sm hover:shadow-md',
      secondary: 'bg-rtr-blush text-rtr-ink hover:bg-rtr-blush/80 active:bg-rtr-blush/70 border border-rtr-border',
      ghost: 'text-rtr-ink hover:bg-rtr-blush/50 active:bg-rtr-blush/70',
      destructive: 'bg-rtr-danger text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }


