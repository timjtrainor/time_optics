'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { TaskStatus } from '@/lib/types'
import { SprintProposal } from '@/components/app/planning/sprint-proposal'
import { Backlog } from '@/components/app/planning/backlog'

export default function PlanningPage() {
  const { 
    tasks, 
    fetchTasks, 
    sprints, 
    fetchSprints, 
    startSprint,
    updateTask,
  } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchTasks({ status: TaskStatus.BACKLOG })
    fetchSprints()
  }, [fetchTasks, fetchSprints])

  const proposedSprint = sprints
    .filter(s => s.status === 'PROPOSED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  const handleGenerateProposal = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/sprint-planner', { method: 'POST' })
      
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Generation failed');
        } else {
          throw new Error('Server returned an unexpected error format.');
        }
      }

      await Promise.all([
        fetchSprints(),
        fetchTasks({ status: TaskStatus.BACKLOG })
      ])
      toast.success('AI Sprint Proposal ready!')
    } catch (error: any) {
      console.error("Sprint Generation Error:", error)
      toast.error('AI failed to plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddToSprint = async (taskId: number) => {
    if (!proposedSprint) return
    try {
      await updateTask(taskId, { sprintId: proposedSprint.id })
      toast.success('Task added to proposal')
    } catch (error) {
      toast.error('Failed to add task')
    }
  }

  const handleRemoveFromSprint = async (taskId: number) => {
    try {
      await updateTask(taskId, { sprintId: null })
      toast.success('Task returned to backlog')
    } catch (error) {
      toast.error('Failed to remove task')
    }
  }

  const sprintTasks = tasks.filter(t => t.sprintId === proposedSprint?.id)
  const backlogTasks = tasks.filter(t => !t.sprintId && t.status === TaskStatus.BACKLOG)

  return (
    <div className="flex flex-col h-full p-6 max-w-7xl mx-auto w-full gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Sprint Planning
          </h1>
          <p className="text-muted-foreground mt-1">Groom your backlog and focus your week.</p>
        </div>
        
        {proposedSprint ? (
          <Button 
            size="lg" 
            className="rounded-full px-8 shadow-xl shadow-primary/20 gap-2"
            onClick={() => startSprint(proposedSprint.id)}
          >
            Start Sprint <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full px-8 gap-2 border-2"
            onClick={handleGenerateProposal}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-500" />}
            Generate AI Proposal
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        <SprintProposal 
          proposedSprint={proposedSprint}
          sprintTasks={sprintTasks}
          onRemoveTask={handleRemoveFromSprint}
          onGenerateProposal={handleGenerateProposal}
          isGenerating={isGenerating}
        />

        <Backlog 
          tasks={backlogTasks}
          onAddTask={handleAddToSprint}
        />
      </div>
    </div>
  )
}
