'use client'

import { Button } from '@/components/ui/button'
import { Target, Plus } from 'lucide-react'

interface EmptyObjectivesStateProps {
  onAddObjective: () => void
}

export function EmptyObjectivesState({ onAddObjective }: EmptyObjectivesStateProps) {
  return (
    <div className="text-center py-32 border-2 border-dashed rounded-3xl bg-muted/5">
      <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-6">
        <Target className="h-12 w-12 text-muted-foreground opacity-30" />
      </div>
      <h3 className="text-xl font-black text-muted-foreground">No Strategic Priorities Defined</h3>
      <p className="text-muted-foreground/60 mb-8 max-w-sm mx-auto">
        Set your quarterly objectives to drive alignment and performance.
      </p>
      <Button size="lg" onClick={onAddObjective} className="gap-2 px-8">
        <Plus className="h-5 w-5" /> Define First Objective
      </Button>
    </div>
  )
}
