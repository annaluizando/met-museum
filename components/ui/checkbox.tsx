'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || React.useId()
    
    return (
      <div className="flex items-center gap-2">
        <div className="relative inline-flex">
          <input
            type="checkbox"
            id={checkboxId}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ring-offset-white dark:ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer transition-colors checked:bg-zinc-950 dark:checked:bg-zinc-50 checked:border-zinc-950 dark:checked:border-zinc-50',
              className
            )}
            ref={ref}
            {...props}
          />
          <Check 
            className="absolute left-0 top-0 w-4 h-4 text-white dark:text-zinc-950 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
            strokeWidth={3}
            aria-hidden="true"
          />
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
