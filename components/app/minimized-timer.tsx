'use client'

import { TimerType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { TargetIcon, CoffeeIcon } from 'lucide-react'
import { Progress } from '../ui/progress'

interface MinimizedTimerProps {
  isWork: boolean
  isPaused: boolean
  timeLeftStr: string
  content: string
  progress: number
  onClick: () => void
}

export function MinimizedTimer({ 
  isWork, 
  isPaused, 
  timeLeftStr, 
  content, 
  progress, 
  onClick 
}: MinimizedTimerProps) {
  return (
    <button 
      className="relative flex items-center gap-2 h-8 min-w-[140px] rounded-md border border-primary/20 bg-background px-2 hover:bg-accent/50 cursor-pointer overflow-hidden transition-colors"
      onClick={onClick}
      title="Resume/View Timer"
    >
      {isWork ? (
        <TargetIcon className="h-3 w-3 text-primary animate-pulse" />
      ) : (
        <CoffeeIcon className="h-3 w-3 text-primary animate-pulse" />
      )}
      <span className="text-xs font-bold font-mono tracking-tight tabular-nums relative z-10">
        {isPaused ? 'PAUSED' : timeLeftStr}
      </span>
      {content && (
        <span className="text-xs font-medium tabular-nums tracking-tight truncate max-w-[100px] relative z-10">
          {content}
        </span>
      )}
      <Progress
        value={progress}
        className={cn(
          'absolute bottom-0 left-0 right-0 h-full opacity-10 rounded-none z-0',
          isWork ? 'bg-primary' : 'bg-blue-500',
        )}
      />
    </button>
  )
}
