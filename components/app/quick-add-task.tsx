'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Users, 
  Box, 
  Zap,
  Info
} from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { EffortSize, TaskImpact, TaskStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function QuickAddTask() {
  const { createTask, projects, stakeholderGroups } = useStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [stakeholderId, setStakeholderId] = useState<string>('')
  const [size, setSize] = useState<EffortSize>(EffortSize.M)
  const [impact, setImpact] = useState<TaskImpact>(TaskImpact.BUCKET)
  const [projectId, setProjectId] = useState<string>('')
  const [context, setContext] = useState('')
  const [showContext, setShowContext] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleQuickAdd = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim()) return

    try {
      await createTask({
        title,
        context: context.trim() || undefined,
        status: TaskStatus.BACKLOG,
        size,
        impact,
        stakeholderGroupId: stakeholderId ? parseInt(stakeholderId) : undefined,
        projectId: projectId ? parseInt(projectId) : undefined,
      })
      toast.success('Task captured in backlog!')
      reset()
    } catch (error) {
      toast.error('Capture failed')
    }
  }

  const reset = () => {
    setTitle('')
    setContext('')
    setShowContext(false)
    setIsExpanded(false)
    setStakeholderId('')
    setProjectId('')
    setSize(EffortSize.M)
    setImpact(TaskImpact.BUCKET)
  }

  return (
    <div className={cn(
      "w-full transition-all duration-300 ease-in-out bg-card border rounded-2xl shadow-xl",
      isExpanded ? "p-4" : "p-2 max-w-xl mx-auto"
    )}>
      <form 
        onSubmit={handleQuickAdd}
        onFocus={() => setIsExpanded(true)}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder="Quick capture something..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg font-medium h-10 px-2"
          />
          
          {!isExpanded && title.trim() && (
            <Button size="icon" variant="ghost" onClick={handleQuickAdd} className="shrink-0">
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2">
            {/* Stakeholder */}
            <Select value={stakeholderId} onValueChange={setStakeholderId}>
              <SelectTrigger className="w-[140px] h-9 bg-muted/50 border-none rounded-full">
                <Users className="h-3 w-3 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Stakeholder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Internal/None</SelectItem>
                {stakeholderGroups.map(sg => (
                  <SelectItem key={sg.id} value={sg.id.toString()}>{sg.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Size Selector */}
            <div className="flex bg-muted/50 rounded-full p-1 h-9 items-center">
              {[EffortSize.XS, EffortSize.S, EffortSize.M, EffortSize.L, EffortSize.XL].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-black rounded-full transition-all",
                    size === s ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Impact Toggle */}
            <div className="flex bg-muted/50 rounded-full p-1 h-9 items-center">
              <button
                type="button"
                onClick={() => setImpact(TaskImpact.NEEDLE)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full transition-all",
                  impact === TaskImpact.NEEDLE ? "bg-background shadow-sm text-amber-500" : "text-muted-foreground"
                )}
              >
                <Zap className="h-3 w-3" />
                NEEDLE
              </button>
              <button
                type="button"
                onClick={() => setImpact(TaskImpact.BUCKET)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full transition-all",
                  impact === TaskImpact.BUCKET ? "bg-background shadow-sm text-blue-500" : "text-muted-foreground"
                )}
              >
                <Box className="h-3 w-3" />
                BUCKET
              </button>
            </div>

            {/* Project */}
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-[160px] h-9 bg-muted/50 border-none rounded-full">
                <Target className="h-3 w-3 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Project (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project (KTLO)</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Context Toggle */}
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className={cn("h-9 rounded-full px-3", showContext && "bg-muted")}
              onClick={() => setShowContext(!showContext)}
            >
              <Info className="h-4 w-4 mr-2" />
              Context
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={reset}>Cancel</Button>
              <Button type="submit" size="sm" className="rounded-full px-6">Add</Button>
            </div>
          </div>
        )}

        {isExpanded && showContext && (
          <textarea
            placeholder="Add context, links, or notes here..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full bg-muted/30 rounded-xl p-3 text-sm min-h-[80px] focus:outline-none border-none animate-in slide-in-from-top-1"
          />
        )}
      </form>
    </div>
  )
}
