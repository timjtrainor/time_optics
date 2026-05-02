'use client'

import { useState } from 'react'
import { Task, TaskStatus, TaskPriority, TaskType, EffortSize, MoscowClass } from '@/lib/types'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Clock, 
  Tag, 
  AlertCircle, 
  MoreHorizontal, 
  Play, 
  Flame, 
  Target,
  Users,
  Zap
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface TaskCardProps {
  task: Task
}

import { TaskDrawer } from './task-drawer'

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask, startTimer } = useStore()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleStatusChange = async (checked: boolean) => {
    // Stop propagation if needed, but checkbox is outside the main click area usually
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

  const priorityColors = {
    [TaskPriority.P0]: 'text-red-500 bg-red-500/10 border-red-500/20',
    [TaskPriority.P1]: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    [TaskPriority.P2]: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    [TaskPriority.P3]: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
  }

  const typeColors = {
    [TaskType.STRATEGIC]: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
    [TaskType.KTLO]: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    [TaskType.INTERRUPT]: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    [TaskType.ADMIN]: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  }

  const isDone = task.status === TaskStatus.DONE
  const isStale = !isDone && (new Date().getTime() - new Date(task.updatedAt || task.createdAt).getTime() > 3 * 24 * 60 * 60 * 1000)

  return (
    <>
      <Card 
        className={cn(
          "group relative flex flex-col p-3 transition-all hover:shadow-md border-l-4 cursor-pointer w-full min-w-0",
          isDone ? "opacity-60 bg-muted/50 border-l-slate-400" : "bg-card",
          !isDone && task.priority === TaskPriority.P0 && "border-l-red-500 shadow-red-500/5",
          !isDone && task.priority === TaskPriority.P1 && "border-l-orange-500",
          !isDone && task.priority === TaskPriority.P2 && "border-l-yellow-500",
          !isDone && task.priority === TaskPriority.P3 && "border-l-slate-300",
          isStale && "ring-1 ring-amber-500/50 bg-amber-500/5"
        )}
        onClick={() => setIsDrawerOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View details for task: ${task.title}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsDrawerOpen(true); } }}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <Checkbox 
              checked={isDone} 
              onCheckedChange={handleStatusChange}
              disabled={isUpdating}
              className="mt-1"
              aria-label={isDone ? `Mark task ${task.title} as incomplete` : `Mark task ${task.title} as complete`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1 w-full">
              <h3 className={cn(
                "text-sm font-semibold leading-none overflow-hidden text-ellipsis whitespace-nowrap flex-1",
                isDone && "line-through text-muted-foreground"
              )} style={{ minWidth: 0 }}>
                {task.title}
              </h3>
              <div 
                className="flex items-center gap-0.5 ml-auto pl-1" 
                style={{ flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {!isDone && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full text-primary opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-primary hover:text-primary-foreground transition-all duration-200" 
                    onClick={handleStartTask} 
                    aria-label={`Start timer for ${task.title}`}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-muted transition-all duration-200" aria-label={`Options for ${task.title}`}>
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
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline" className={cn("text-[10px] h-4 px-1 font-mono uppercase shrink-0", priorityColors[task.priority])}>
                {task.priority === TaskPriority.P0 && <Flame className="h-2 w-2 mr-0.5 fill-current shrink-0" />}
                {task.priority}
              </Badge>
              
              {task.moscowClass && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-muted font-bold tracking-tight shrink-0">
                  {task.moscowClass.charAt(0)}
                </Badge>
              )}

              <Badge variant="outline" className={cn("text-[10px] h-4 px-1 shrink-0", typeColors[task.taskType])}>
                {task.taskType}
              </Badge>

              {task.effort && (
                <Badge variant="outline" className="text-[10px] h-4 px-1 border bg-background flex items-center gap-0.5 shrink-0">
                  <Zap className="h-2 w-2 text-yellow-500 fill-yellow-500 shrink-0" />
                  {task.effort}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-muted-foreground font-medium min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="h-2.5 w-2.5 shrink-0" />
              <span>{task.estimatedPomodoros * 25}m</span>
            </div>
            {task.project && (
              <div className="flex items-center gap-1 text-primary/70 shrink-0 min-w-0">
                <Target className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate max-w-[70px] inline-block">{task.project.title}</span>
              </div>
            )}
            {task.stakeholderGroup && (
              <div className="flex items-center gap-1 shrink-0 min-w-0">
                <Users className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate max-w-[70px] inline-block">{task.stakeholderGroup.name}</span>
              </div>
            )}
          </div>
          
          {task.dueDate && (
            <div className={cn(
              "text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0",
              new Date(task.dueDate) < new Date() && !isDone ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"
            )}>
              <AlertCircle className="h-2.5 w-2.5 shrink-0" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {task.aiReasoning && (
          <div className="mt-2 text-[9px] text-muted-foreground italic line-clamp-1 group-hover:line-clamp-none transition-all">
            AI: {task.aiReasoning}
          </div>
        )}
        
        {isStale && (
          <div className="absolute top-0 right-3 -translate-y-1/2">
            <Badge variant="warning" className="text-[8px] py-0 h-3 leading-none border-amber-500/50">STALE</Badge>
          </div>
        )}
      </Card>
      <TaskDrawer task={task} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  )
}
