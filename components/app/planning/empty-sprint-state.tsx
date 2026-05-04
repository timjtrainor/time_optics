'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface EmptySprintStateProps {
  onGenerate: () => void
  isGenerating: boolean
}

export function EmptySprintState({ onGenerate, isGenerating }: EmptySprintStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-6">
      <div className="p-6 rounded-full bg-primary/10">
        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
      </div>
      <div className="max-w-xs">
        <h3 className="text-xl font-bold mb-2">Ready to plan?</h3>
        <p className="text-sm text-muted-foreground">
          Let the AI analyze your backlog and strategic goals to propose a focused 1-week sprint.
        </p>
      </div>
      <Button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="rounded-full px-8"
      >
        {isGenerating ? "Analyzing Backlog..." : "Generate Proposal"}
      </Button>
    </div>
  )
}
