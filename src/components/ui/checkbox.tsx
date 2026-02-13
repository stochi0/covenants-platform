import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ControlledCheckboxProps
  extends Omit<React.ComponentProps<'button'>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const ControlledCheckbox = React.forwardRef<HTMLButtonElement, ControlledCheckboxProps>(
  ({ checked = false, onCheckedChange, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'size-4 shrink-0 rounded border border-input bg-background ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        checked && 'bg-primary border-primary text-primary-foreground',
        className
      )}
      {...props}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" className="size-full p-0.5" fill="currentColor">
          <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  )
)
ControlledCheckbox.displayName = 'ControlledCheckbox'

export { ControlledCheckbox }
