'use client'

import { cn } from '@/lib/utils'

interface SprintCapacityBarProps {
  totalMinutes: number
  capacityPercent: number
}

export function SprintCapacityBar({ totalMinutes, capacityPercent }: SprintCapacityBarProps) {
  return (
    <div className="mt-6 space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span>Planned Capacity</span>
        <span>{Math.round(totalMinutes / 60)}h / 40h</span>
      </div>
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500",
            capacityPercent > 60 ? "bg-amber-500" : "bg-primary"
          )}
          style={{ width: `${Math.min(capacityPercent, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        AI recommended leaving 50% (20h) for reactive/KTLO work.
      </p>
    </div>
  )
}
