import * as React from 'react'
import { cn } from '../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          variant === 'primary' && 'bg-accent text-white hover:bg-accent/90',
          variant === 'secondary' && 'border border-border bg-surface text-text-primary hover:bg-surface/80',
          variant === 'ghost' && 'text-text-secondary hover:text-text-primary hover:bg-surface',
          variant === 'danger' && 'bg-danger text-white hover:bg-danger/90',
          size === 'sm' && 'h-7 px-3 text-xs',
          size === 'md' && 'h-9 px-4 text-sm',
          size === 'lg' && 'h-10 px-5 text-sm',
          className,
        )}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
