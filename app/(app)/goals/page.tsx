'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Target, Rocket, Box, ChevronRight, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function GoalsPage() {
  const { okrs, fetchGoals, createGoal } = useStore()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', type: 'okr', parentId: '' })

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleAdd = async () => {
    await createGoal(newGoal.type, {
      title: newGoal.title,
      ...(newGoal.type === 'initiative' && { okrId: parseInt(newGoal.parentId) }),
      ...(newGoal.type === 'project' && { initiativeId: parseInt(newGoal.parentId) }),
    })
    setIsAddOpen(false)
    setNewGoal({ title: '', type: 'okr', parentId: '' })
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Roadmap</h1>
          <p className="text-muted-foreground">OKR → Initiative → Project hierarchy.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Strategic Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Roadmap</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  {['okr', 'initiative', 'project'].map(t => (
                    <Button 
                      key={t}
                      variant={newGoal.type === t ? 'default' : 'outline'}
                      onClick={() => setNewGoal(prev => ({ ...prev, type: t }))}
                      className="flex-1 capitalize"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input 
                  value={newGoal.title} 
                  onChange={e => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title..."
                />
              </div>
              {newGoal.type !== 'okr' && (
                <div className="grid gap-2">
                  <Label>Parent {newGoal.type === 'initiative' ? 'OKR' : 'Initiative'}</Label>
                  <Select value={newGoal.parentId} onValueChange={id => setNewGoal(prev => ({ ...prev, parentId: id }))}>
                    {/* Simplified for now */}
                    <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                    <SelectContent>
                      {newGoal.type === 'initiative' ? 
                        okrs.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.title}</SelectItem>) :
                        okrs.flatMap(o => o.initiatives || []).map((i: any) => <SelectItem key={i.id} value={i.id.toString()}>{i.title}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleAdd} disabled={!newGoal.title}>Create Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
        <div className="space-y-6">
          {okrs.map(okr => (
            <Card key={okr.id} className="p-6 border-l-4 border-l-primary shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-1 text-[10px] uppercase tracking-tighter">OKR</Badge>
                    <h2 className="text-xl font-bold">{okr.title}</h2>
                  </div>
                </div>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>

              <div className="md:pl-11 pl-4 space-y-4">
                {okr.initiatives?.map((initiative: any) => (
                  <div key={initiative.id} className="relative md:pl-6 pl-3 border-l-2 border-muted py-1">
                    <div className="absolute left-[-1px] top-4 w-4 h-[2px] bg-muted hidden md:block" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-blue-500" />
                        <h3 className="font-semibold text-sm">{initiative.title}</h3>
                      </div>
                      <Badge variant="secondary" className="text-[9px]">INITIATIVE</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:pl-4 pl-0">
                      {initiative.projects?.map((project: any) => (
                        <Card key={project.id} className="p-4 bg-muted/30 border-none hover:bg-muted/50 transition-colors cursor-pointer group" role="button" tabIndex={0} aria-label={`View project ${project.title}`}>
                          <div className="flex items-center justify-between mb-3">
                            <Box className="h-4 w-4 text-purple-500" />
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h4 className="text-xs font-bold mb-2 line-clamp-2">{project.title}</h4>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                              <span>Progress</span>
                              <span>{project.tasks?.length ? Math.round((project.tasks.length / 5) * 100) : 0}%</span>
                            </div>
                            <Progress value={project.tasks?.length ? (project.tasks.length / 5) * 100 : 0} className="h-1" />
                          </div>
                        </Card>
                      ))}
                      <Button variant="ghost" className="h-auto p-4 border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 group transition-all">
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary mr-2" />
                        <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">Add Project</span>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="ml-6 h-8 text-xs text-muted-foreground hover:text-primary gap-2">
                  <Plus className="h-3 w-3" />
                  Add Initiative
                </Button>
              </div>
            </Card>
          ))}
          {okrs.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-muted-foreground">No OKRs defined yet</h3>
              <p className="text-sm text-muted-foreground/60 mb-6">Start by creating your first high-level objective.</p>
              <Button onClick={() => setIsAddOpen(true)}>Create OKR</Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

