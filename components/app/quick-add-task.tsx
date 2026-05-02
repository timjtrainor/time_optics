'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Sparkles } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { TaskPriority, TaskType } from '@/lib/types'
import { toast } from 'sonner'

export function QuickAddTask() {
  const { createTask, projects, stakeholderGroups } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.P2)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await createTask({
        title,
        projectId: projectId ? parseInt(projectId) : undefined,
        priority,
        taskType: TaskType.STRATEGIC, // Default
      })
      toast.success('Task added!')
      setTitle('')
      setProjectId('')
      setPriority(TaskPriority.P2)
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to add task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Quick Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Capture New Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">What needs to be done?</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Refactor data ingestion pipeline..."
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">General / None</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.P0}>P0 - Critical</SelectItem>
                  <SelectItem value={TaskPriority.P1}>P1 - High</SelectItem>
                  <SelectItem value={TaskPriority.P2}>P2 - Medium</SelectItem>
                  <SelectItem value={TaskPriority.P3}>P3 - Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
