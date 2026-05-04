'use client'

import { useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { TaskStatus, EffortSize } from '@/lib/types'
import { TaskCard } from '@/components/app/task-card'
import { QuickAddTask } from '@/components/app/quick-add-task'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  LayoutDashboard, 
  Target, 
  Calendar, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const SIZE_MINUTES = {
  [EffortSize.XS]: 15,
  [EffortSize.S]: 30,
  [EffortSize.M]: 60,
  [EffortSize.L]: 120,
  [EffortSize.XL]: 240,
}

export default function TasksPage() {
  const { tasks, fetchTasks, sprints, fetchSprints, activeSprint, isLoading } = useStore()
  const [oneThingMode, setOneThingMode] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchSprints()
  }, [fetchTasks, fetchSprints])

  const sprintTasks = useMemo(() => {
    if (!activeSprint) return []
    return tasks.filter(t => t.sprintId === activeSprint.id && t.status !== TaskStatus.BACKLOG)
  }, [tasks, activeSprint])

  const { todo, inProgress, done } = useMemo(() => {
    return {
      todo: sprintTasks.filter(t => t.status === TaskStatus.TODO || t.status === TaskStatus.BLOCKED),
      inProgress: sprintTasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
      done: sprintTasks.filter(t => t.status === TaskStatus.DONE)
    }
  }, [sprintTasks])

  const totalMinutes = sprintTasks.reduce((acc, t) => acc + (SIZE_MINUTES[t.size] || 0), 0)
  const capacityPercent = (totalMinutes / 2400) * 100

  const focusTask = useMemo(() => {
    const active = inProgress[0] || todo[0]
    return active
  }, [inProgress, todo])

  if (!activeSprint && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-6">
        <div className="p-8 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/20">
          <Calendar className="h-16 w-16 text-muted-foreground opacity-20" />
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-black mb-2">No Active Sprint</h2>
          <p className="text-muted-foreground">
            You don't have a focused plan for this week. Head over to Planning to let the AI help you groom your backlog.
          </p>
        </div>
        <Link href="/planning">
          <Button size="lg" className="rounded-full px-8 gap-2">
            Go to Planning <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 gap-8">
      {/* Header & Capacity */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-primary border-primary/20">
              ACTIVE SPRINT
            </Badge>
            {activeSprint && (
              <span className="text-sm font-medium text-muted-foreground">
                Ends {new Date(activeSprint.endDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            {activeSprint?.name || "This Week's Focus"}
          </h1>
          
          <div className="flex items-center gap-4 max-w-xl mt-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                <span className="text-muted-foreground">Week Load</span>
                <span>{Math.round(totalMinutes / 60)}h / 40h</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    capacityPercent > 80 ? "bg-red-500" : capacityPercent > 50 ? "bg-amber-500" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl">
              <Zap className="h-3 w-3 text-amber-500" />
              {capacityPercent < 50 ? "50% BUFFER REMAINING" : "CAPACITY FULL"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant={oneThingMode ? "default" : "outline"} 
            className={cn("rounded-full gap-2", oneThingMode && "bg-amber-500 hover:bg-amber-600 border-none")}
            onClick={() => setOneThingMode(!oneThingMode)}
          >
            <Sparkles className={cn("h-4 w-4", oneThingMode && "fill-current animate-pulse")} />
            {oneThingMode ? "Hyperfocus Active" : "Hyperfocus Mode"}
          </Button>
          <div className="hidden md:block">
            <QuickAddTask />
          </div>
        </div>
      </div>

      {oneThingMode && focusTask && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-amber-500/[0.03] rounded-[3rem] border-4 border-dashed border-amber-500/10 mb-6">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-4">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white animate-bounce px-4 py-1 rounded-full text-xs font-black">
                YOUR ONLY MISSION
              </Badge>
              <h2 className="text-5xl font-black tracking-tighter leading-tight">Do this one thing.</h2>
            </div>
            <div className="scale-110">
              <TaskCard task={focusTask} />
            </div>
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-amber-600 font-bold" onClick={() => setOneThingMode(false)}>
              Show the rest of the sprint
            </Button>
          </div>
        </div>
      )}

      {!oneThingMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0 pb-10">
          {/* TO DO */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
              To Do
              <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px]">{todo.length}</span>
            </h2>
            <div className="flex flex-col gap-3">
              {todo.map(t => <TaskCard key={t.id} task={t} />)}
              {todo.length === 0 && !isLoading && (
                <div className="p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center opacity-30">
                  <Info className="h-8 w-8 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-tight">Clear</p>
                </div>
              )}
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 px-1">
              Doing
              <span className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px]">{inProgress.length}</span>
            </h2>
            <div className="flex flex-col gap-3">
              {inProgress.map(t => <TaskCard key={t.id} task={t} />)}
              {inProgress.length === 0 && !isLoading && (
                <div className="p-12 border-2 border-dashed border-blue-500/10 rounded-3xl flex flex-col items-center justify-center text-center opacity-20">
                  <Zap className="h-8 w-8 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-tight text-blue-500">Idle</p>
                </div>
              )}
            </div>
          </div>

          {/* DONE */}
          <div className="flex flex-col gap-4 opacity-70">
            <h2 className="text-sm font-black uppercase tracking-widest text-green-600 flex items-center gap-2 px-1">
              Done
              <span className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center text-[10px]">{done.length}</span>
            </h2>
            <div className="flex flex-col gap-3">
              {done.map(t => <TaskCard key={t.id} task={t} />)}
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Add for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6">
        <QuickAddTask />
      </div>
    </div>
  )
}
