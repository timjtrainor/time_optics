'use client'

import { useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { TaskStatus } from '@/lib/types'
import { TaskCard } from '@/components/app/task-card'
import { QuickAddTask } from '@/components/app/quick-add-task'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Zap, LayoutDashboard, Target } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DragDropContext, Draggable } from '@hello-pangea/dnd'
import { StrictModeDroppable } from '@/components/strict-mode-droppable'
import { toast } from 'sonner'

export default function TasksPage() {
  const { tasks, fetchTasks, updateTask, isLoading } = useStore()
  const [oneThingMode, setOneThingMode] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const taskId = parseInt(draggableId)
    const newStatus = destination.droppableId as TaskStatus
    
    try {
      await updateTask(taskId, { status: newStatus })
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      toast.error('Failed to move task')
    }
  }

  const columns = useMemo(() => [
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-slate-500/10' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-500/10' },
    { id: TaskStatus.DONE, title: 'Done', color: 'bg-green-500/10' },
  ], [])

  const filteredTasks = useMemo(() => {
    if (!oneThingMode) return tasks
    // Only show the top priority task that isn't done
    const todo = tasks.filter(t => t.status !== TaskStatus.DONE)
      .sort((a, b) => {
        const pMap = { P0: 0, P1: 1, P2: 2, P3: 3 }
        return pMap[a.priority as keyof typeof pMap] - pMap[b.priority as keyof typeof pMap]
      })
    return todo.length > 0 ? [todo[0]] : []
  }, [tasks, oneThingMode])

  const tasksByStatus = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = []
      acc[task.status].push(task)
      return acc
    }, {} as Record<string, typeof tasks>)
  }, [filteredTasks])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground text-sm">Manage your strategic and KTLO tasks.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant={oneThingMode ? "default" : "outline"} 
            className={cn("gap-2", oneThingMode && "bg-amber-500 hover:bg-amber-600 border-none animate-pulse")}
            onClick={() => setOneThingMode(!oneThingMode)}
          >
            <Zap className={cn("h-4 w-4", oneThingMode && "fill-current")} />
            {oneThingMode ? "One Thing Mode Active" : "One Thing Mode"}
          </Button>
          <QuickAddTask />
        </div>
      </div>

      {oneThingMode && filteredTasks.length > 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-amber-500/5 rounded-3xl border-2 border-dashed border-amber-500/20 mb-6">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="warning" className="animate-bounce">YOUR ONLY FOCUS</Badge>
              <h2 className="text-3xl font-black tracking-tighter">Do this one thing.</h2>
            </div>
            <TaskCard task={filteredTasks[0]} />
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-amber-600" onClick={() => setOneThingMode(false)}>
              Show everything else
            </Button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0 w-full", oneThingMode && "hidden")}>
          {columns.map(column => (
            <div key={column.id} className="flex flex-col h-full min-w-0">
              <div className={`flex items-center gap-2 p-3 rounded-t-xl border-t border-x ${column.color}`}>
                <h2 className="font-semibold text-sm uppercase tracking-wider">{column.title}</h2>
                <span className="ml-auto text-xs font-medium bg-background/50 px-2 py-0.5 rounded-full border">
                  {(tasksByStatus[column.id] || []).length}
                </span>
              </div>
              
              <StrictModeDroppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <Card 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 min-h-[500px] rounded-t-none border-t-0 bg-muted/20 flex flex-col transition-colors rounded-2xl border",
                      snapshot.isDraggingOver && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex-1 overflow-y-auto p-3 w-full" style={{ maxWidth: '100%' }}>
                      <div className="flex flex-col gap-3 pb-4 w-full">
                        {isLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-xl" />
                          ))
                        ) : (
                          (tasksByStatus[column.id] || []).map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "transition-transform w-full min-w-0",
                                    snapshot.isDragging && "z-50 shadow-2xl"
                                  )}
                                  style={{ maxWidth: '100%', boxSizing: 'border-box', ...provided.draggableProps.style }}
                                >
                                  <div className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
                                    <TaskCard task={task} />
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                        {!isLoading && (tasksByStatus[column.id] || []).length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-xs text-muted-foreground italic">No tasks here yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </StrictModeDroppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
