'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Box, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { TaskCard } from '@/components/app/task-card'
import { SprintCapacityBar } from './sprint-capacity-bar'
import { EmptySprintState } from './empty-sprint-state'
import { EffortSize } from '@/lib/types'

const SIZE_MINUTES = {
  [EffortSize.XS]: 15,
  [EffortSize.S]: 30,
  [EffortSize.M]: 60,
  [EffortSize.L]: 120,
  [EffortSize.XL]: 240,
}

interface SprintProposalProps {
  proposedSprint: any
  sprintTasks: any[]
  onRemoveTask: (taskId: number) => void
  onGenerateProposal: () => void
  isGenerating: boolean
}

export function SprintProposal({ 
  proposedSprint, 
  sprintTasks, 
  onRemoveTask, 
  onGenerateProposal, 
  isGenerating 
}: SprintProposalProps) {
  const totalMinutes = sprintTasks.reduce((acc, t) => acc + (SIZE_MINUTES[t.size as EffortSize] || 0), 0)
  const capacityPercent = (totalMinutes / 2400) * 100

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Proposed Sprint
        </h2>
        {proposedSprint && (
          <Badge variant="outline" className="rounded-full px-3 py-1">
            {format(new Date(proposedSprint.startDate), 'MMM d')} - {format(new Date(proposedSprint.endDate), 'MMM d')}
          </Badge>
        )}
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-3xl">
        {proposedSprint ? (
          <>
            <div className="p-6 bg-background border-b">
              <h3 className="text-2xl font-black mb-2">{proposedSprint.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{proposedSprint.aiSummary}"
              </p>
              
              <SprintCapacityBar 
                totalMinutes={totalMinutes}
                capacityPercent={capacityPercent}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sprintTasks.map(task => (
                <div key={task.id} className="group relative">
                  <TaskCard task={task} />
                  <button 
                    onClick={() => onRemoveTask(task.id)}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 bg-background border rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              ))}
              {sprintTasks.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 p-12">
                  <Box className="h-12 w-12 mb-4" />
                  <p className="font-medium">No tasks in this proposal yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <EmptySprintState 
            onGenerate={onGenerateProposal}
            isGenerating={isGenerating}
          />
        )}
      </Card>
    </div>
  )
}
