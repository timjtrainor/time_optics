'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus, MessageSquare, PieChart, TrendingUp, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { StakeholderType } from '@/lib/types'

export default function StakeholdersPage() {
  const { stakeholderGroups, fetchStakeholders, createStakeholder } = useStore()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', type: StakeholderType.ENGINEERING })

  useEffect(() => {
    fetchStakeholders()
  }, [fetchStakeholders])

  const handleAdd = async () => {
    await createStakeholder(newGroup)
    setIsAddOpen(false)
    setNewGroup({ name: '', type: StakeholderType.ENGINEERING })
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stakeholder Groups</h1>
          <p className="text-muted-foreground">Monitor time allocation and KTLO vs Strategic balance per team.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stakeholder Group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Group Name</Label>
                <Input 
                  value={newGroup.name} 
                  onChange={e => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Core Platform Engineering"
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={newGroup.type} onValueChange={val => setNewGroup(prev => ({ ...prev, type: val as StakeholderType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(StakeholderType).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} disabled={!newGroup.name}>Create Group</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stakeholderGroups.map((group: any) => (
          <Card key={group.id} className="p-6 overflow-hidden relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{group.name}</h3>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">{group.type}</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                {group.slackChannel && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-medium text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Strategic Alignment
                  </span>
                  <span className="font-bold">{group.stats?.strategicPercent || 0}%</span>
                </div>
                <Progress value={group.stats?.strategicPercent || 0} className="h-2 bg-teal-500/10" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-medium text-muted-foreground">
                    <ShieldAlert className="h-3 w-3" />
                    KTLO / Maintenance
                  </span>
                  <span className="font-bold text-amber-600">{group.stats?.ktloPercent || 0}%</span>
                </div>
                <Progress value={group.stats?.ktloPercent || 0} className="h-2 bg-amber-500/10" />
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Time</p>
                  <p className="text-lg font-bold">{Math.round((group.stats?.totalMinutes || 0) / 60)}h</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Active Tasks</p>
                  <p className="text-lg font-bold text-primary">{group.stats?.activeTaskCount || 0}</p>
                </div>
              </div>
            </div>

            {group.stats?.ktloPercent > 60 && (
              <div className="absolute top-2 right-2">
                <Badge variant="warning" className="h-5 px-1.5 animate-pulse">KTLO Heavy</Badge>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {stakeholderGroups.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-muted-foreground">No Stakeholder Groups</h3>
          <p className="text-sm text-muted-foreground/60 mb-6">Create groups to track where your time is being spent.</p>
          <Button onClick={() => setIsAddOpen(true)}>Add First Group</Button>
        </div>
      )}
    </div>
  )
}
