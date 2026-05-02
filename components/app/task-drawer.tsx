'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskType, 
  MoscowClass, 
  EffortSize 
} from '@/lib/types'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface TaskDrawerProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDrawer({ task, open, onOpenChange }: TaskDrawerProps) {
  const { updateTask, projects, stakeholderGroups } = useStore()
  const [formData, setFormData] = useState<Partial<Task>>({})

  useEffect(() => {
    if (task) {
      setFormData(task)
    }
  }, [task])

  const handleSave = async () => {
    if (!task) return
    try {
      await updateTask(task.id, formData)
      toast.success('Task updated')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  if (!task) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-2xl overflow-y-auto">
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>Edit Task</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
            </DrawerClose>
          </DrawerHeader>
          
          <div className="p-6 grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title || ''} 
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description || ''} 
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={val => setFormData(prev => ({ ...prev, status: val as TaskStatus }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={val => setFormData(prev => ({ ...prev, priority: val as TaskPriority }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskPriority).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>MoSCoW</Label>
                <Select 
                  value={formData.moscowClass} 
                  onValueChange={val => setFormData(prev => ({ ...prev, moscowClass: val as MoscowClass }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(MoscowClass).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Effort (T-Shirt)</Label>
                <Select 
                  value={formData.effort} 
                  onValueChange={val => setFormData(prev => ({ ...prev, effort: val as EffortSize }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(EffortSize).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Type</Label>
                <Select 
                  value={formData.taskType} 
                  onValueChange={val => setFormData(prev => ({ ...prev, taskType: val as TaskType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskType).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Pomodoros</Label>
                <Input 
                  type="number" 
                  value={formData.estimatedPomodoros || 1} 
                  onChange={e => setFormData(prev => ({ ...prev, estimatedPomodoros: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Project</Label>
                <Select 
                  value={formData.projectId?.toString()} 
                  onValueChange={val => setFormData(prev => ({ ...prev, projectId: parseInt(val) }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Stakeholder</Label>
                <Select 
                  value={formData.stakeholderGroupId?.toString()} 
                  onValueChange={val => setFormData(prev => ({ ...prev, stakeholderGroupId: parseInt(val) }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>
                    {stakeholderGroups.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DrawerFooter className="flex-row gap-2">
            <Button onClick={handleSave} className="flex-1">Save Changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
