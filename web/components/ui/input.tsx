import { cn } from '@/lib/utils/cn'
import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-rtr-border bg-white px-3 py-2 text-sm text-rtr-ink ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-rtr-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rtr-wine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }


