'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Box, ChevronRight } from 'lucide-react'
import { TaskCard } from '@/components/app/task-card'

interface BacklogProps {
  tasks: any[]
  onAddTask: (taskId: number) => void
}

export function Backlog({ tasks, onAddTask }: BacklogProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Box className="h-5 w-5 text-muted-foreground" />
          Backlog
          <Badge variant="secondary" className="rounded-full ml-2">
            {tasks.length}
          </Badge>
        </h2>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col bg-muted/10 border-none rounded-3xl">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="group relative">
              <TaskCard task={task} />
              <button 
                onClick={() => onAddTask(task.id)}
                className="absolute -left-2 top-1/2 -translate-y-1/2 p-2 bg-background border rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 p-12">
              <p className="font-medium italic">Backlog is empty.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
