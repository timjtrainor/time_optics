'use client'

import { useState } from 'react'
import { Task, TaskStatus, EffortSize, TaskImpact } from '@/lib/types'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Clock, 
  MoreHorizontal, 
  Play, 
  Target,
  Users,
  Zap,
  Box,
  Flame,
  AlertCircle
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const SIZE_MINUTES = {
  [EffortSize.XS]: 15,
  [EffortSize.S]: 30,
  [EffortSize.M]: 60,
  [EffortSize.L]: 120,
  [EffortSize.XL]: 240,
}

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask, startTimer } = useStore()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (checked: boolean) => {
    setIsUpdating(true)
    const newStatus = checked ? TaskStatus.DONE : TaskStatus.TODO
    try {
      await updateTask(task.id, { status: newStatus })
      if (checked) toast.success('Task completed!')
    } catch (error) {
      toast.error('Failed to update task')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStartTask = async () => {
    const sessionId = `task-${task.id}-${Date.now()}`
    await startTimer(task.title, 'work', sessionId)
    if (task.status !== TaskStatus.IN_PROGRESS) {
      await updateTask(task.id, { status: TaskStatus.IN_PROGRESS })
      toast.success('Started task and moved to In Progress')
    }
  }

  const isDone = task.status === TaskStatus.DONE
  const isNeedle = task.impact === TaskImpact.NEEDLE
  const minutes = SIZE_MINUTES[task.size] || 0

  return (
    <Card 
      className={cn(
        "group relative flex flex-col p-3 transition-all hover:shadow-md border-l-4 w-full min-w-0",
        isDone ? "opacity-60 bg-muted/30 border-l-slate-400" : "bg-card",
        !isDone && isNeedle ? "border-l-amber-500 shadow-amber-500/5" : "border-l-blue-500/50",
        task.isUnplanned && !isDone && "ring-1 ring-destructive/20 bg-destructive/[0.02]"
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 pt-0.5">
          <Checkbox 
            checked={isDone} 
            onCheckedChange={handleStatusChange}
            disabled={isUpdating}
            className="rounded-full"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1 w-full">
            <h3 className={cn(
              "text-sm font-bold leading-tight flex-1",
              isDone && "line-through text-muted-foreground font-medium"
            )}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {!isDone && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full text-primary hover:bg-primary hover:text-primary-foreground" 
                  onClick={handleStartTask} 
                >
                  <Play className="h-3 w-3 fill-current" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive">
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {/* Impact Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-[9px] h-4 px-1.5 font-black uppercase tracking-tighter shrink-0",
                isNeedle ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
              )}
            >
              {isNeedle ? <Zap className="h-2 w-2 mr-0.5 fill-current" /> : <Box className="h-2 w-2 mr-0.5" />}
              {task.impact}
            </Badge>

            {/* Size Badge */}
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold shrink-0">
              {task.size}
            </Badge>

            {task.isUnplanned && (
              <Badge variant="destructive" className="text-[9px] h-4 px-1.5 font-bold shrink-0 bg-red-500/10 text-red-600 border-red-500/20">
                UNPLANNED
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-border/50 w-full">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            <span>{minutes}m</span>
          </div>
          
          {task.project && (
            <div className="flex items-center gap-1 text-primary/70 max-w-[100px]">
              <Target className="h-2.5 w-2.5" />
              <span className="truncate">{task.project.title}</span>
            </div>
          )}
          
          {task.stakeholderGroup && (
            <div className="flex items-center gap-1 max-w-[100px]">
              <Users className="h-2.5 w-2.5" />
              <span className="truncate">{task.stakeholderGroup.name}</span>
            </div>
          )}
        </div>
      </div>
      
      {task.context && (
        <div className="mt-2 text-[10px] text-muted-foreground italic line-clamp-1 group-hover:line-clamp-3 transition-all leading-relaxed">
          {task.context}
        </div>
      )}
    </Card>
  )
}
