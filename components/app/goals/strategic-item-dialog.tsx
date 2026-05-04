'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'

export function StrategicItemDialog({ activeDialog, onClose }: { activeDialog: any, onClose: () => void }) {
  const { createGoal, updateGoal } = useStore()
  const { type, parentId, data } = activeDialog
  const isEditing = !!data?.id

  const [formData, setFormData] = useState<any>(data || {
    title: '',
    description: '',
    type: 'MOONSHOT',
    quarter: '26-Q2',
    metric: '',
    unit: 'count',
    direction: 'INCREASE',
    baselineValue: 0,
    currentValue: 0,
    targetValue: 0,
    confidence: 0.5,
    status: 'ACTIVE',
    priority: 'P1',
    dri: '',
    hypothesis: '',
    successCriteria: '',
    targetDate: '',
    ambiguityLevel: data?.ambiguityLevel || 'MEDIUM',
    keyUnknowns: data?.keyUnknowns?.join(', ') || '',
    expectedImpact: data?.expectedImpact || '',
    actualImpact: data?.actualImpact || '',
    isL6PromoMaterial: data?.isL6PromoMaterial || false
  })

  const handleSubmit = async () => {
    let payload: any = {}
    
    if (type === 'objective') {
      payload = {
        title: formData.title || formData.metric,
        description: formData.description,
        type: formData.type,
        quarter: formData.quarter,
        status: formData.status
      }
    } else if (type === 'keyresult') {
      payload = {
        objectiveId: parentId || formData.objectiveId,
        metric: formData.metric || formData.title,
        unit: formData.unit,
        direction: formData.direction,
        baselineValue: Number(formData.baselineValue) || 0,
        currentValue: Number(formData.currentValue) || 0,
        targetValue: Number(formData.targetValue) || 0,
        confidence: Number(formData.confidence) || 0.5,
        description: formData.description
      }
    } else if (type === 'initiative') {
      payload = {
        title: formData.title || formData.metric,
        description: formData.description,
        hypothesis: formData.hypothesis,
        objectiveId: parentId || formData.objectiveId,
        status: formData.status,
        priority: formData.priority,
        dri: formData.dri,
        targetDate: formData.targetDate || null,
        ambiguityLevel: formData.ambiguityLevel,
        keyUnknowns: formData.keyUnknowns ? formData.keyUnknowns.split(',').map((s: string) => s.trim()) : [],
      }
      if (formData.keyResultIds) payload.keyResultIds = formData.keyResultIds
    } else if (type === 'project') {
      payload = {
        title: formData.title || formData.metric,
        description: formData.description,
        successCriteria: formData.successCriteria,
        initiativeId: parentId || formData.initiativeId,
        status: formData.status,
        priority: formData.priority,
        dri: formData.dri,
        targetDate: formData.targetDate || null,
        expectedImpact: formData.expectedImpact,
        actualImpact: formData.actualImpact,
        isL6PromoMaterial: formData.isL6PromoMaterial,
      }
    }

    if (isEditing) {
      const { objectiveId, initiativeId, ...updateData } = payload
      await updateGoal(type, data.id, updateData)
    } else {
      await createGoal(type, payload)
    }
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {isEditing ? 'Edit' : 'Create'} {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription>
            {type === 'objective' && "Define a high-level qualitative goal for the quarter."}
            {type === 'keyresult' && "Set a measurable quantitative target to track success."}
            {type === 'initiative' && "Define a strategic bet to drive your key results."}
            {type === 'project' && "Scoped deliverable to fulfill an initiative."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title*</Label>
            <Input 
              id="title" 
              value={formData.title || formData.metric || ''} 
              onChange={e => setFormData({ ...formData, [type === 'keyresult' ? 'metric' : 'title']: e.target.value })} 
              placeholder={type === 'objective' ? "e.g., Become the technical leader for Data Platform" : "Enter title..."}
            />
          </div>

          {type === 'objective' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOONSHOT">🌙 Moonshot (70% = success)</SelectItem>
                      <SelectItem value="ROOFSHOT">🏠 Roofshot (100% = success)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Quarter</Label>
                  <Input value={formData.quarter} onChange={e => setFormData({ ...formData, quarter: e.target.value })} placeholder="e.g., 26-Q2" />
                </div>
              </div>
            </>
          )}

          {type === 'keyresult' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Select value={formData.unit} onValueChange={v => setFormData({ ...formData, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="count">Count (Numbers)</SelectItem>
                      <SelectItem value="%">Percentage (%)</SelectItem>
                      <SelectItem value="$">Currency ($)</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="score">Score (0-10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Direction</Label>
                  <Select value={formData.direction} onValueChange={v => setFormData({ ...formData, direction: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCREASE">Increase</SelectItem>
                      <SelectItem value="DECREASE">Decrease</SelectItem>
                      <SelectItem value="ACHIEVE">Achieve (Binary)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Baseline</Label>
                  <Input type="number" value={formData.baselineValue} onChange={e => setFormData({ ...formData, baselineValue: parseFloat(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-primary font-bold">Current</Label>
                  <Input type="number" value={formData.currentValue} onChange={e => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })} className="border-primary/50" />
                </div>
                <div className="grid gap-2">
                  <Label>Target</Label>
                  <Input type="number" value={formData.targetValue} onChange={e => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Confidence ({Math.round(formData.confidence * 100)}%)</Label>
                <div className="flex gap-2">
                  {[0.2, 0.5, 0.8].map(v => (
                    <Button 
                      key={v}
                      type="button"
                      variant={formData.confidence === v ? 'default' : 'outline'}
                      className="flex-1 text-[10px]"
                      onClick={() => setFormData({ ...formData, confidence: v })}
                    >
                      {v === 0.2 ? '🔴 Low' : v === 0.5 ? '🟡 Medium' : '🟢 High'}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(type === 'initiative' || type === 'project') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P0">🔴 P0 — Critical</SelectItem>
                      <SelectItem value="P1">🟡 P1 — High</SelectItem>
                      <SelectItem value="P2">🟢 P2 — Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {type === 'initiative' ? (
                        <>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="ON_HOLD">On Hold</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="PLANNING">Planning</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="ON_HOLD">On Hold</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>DRI (Owner)</Label>
                  <Input
                    value={formData.dri || ''}
                    onChange={e => setFormData({ ...formData, dri: e.target.value })}
                    placeholder="e.g., @tim"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={formData.targetDate || ''}
                    onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
              </div>
              {type === 'initiative' && (
                <>
                  <div className="grid gap-2">
                    <Label>Hypothesis</Label>
                    <Textarea
                      value={formData.hypothesis || ''}
                      onChange={e => setFormData({ ...formData, hypothesis: e.target.value })}
                      className="resize-none h-16"
                      placeholder="We believe that... will result in... because..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Ambiguity Level</Label>
                      <Select value={formData.ambiguityLevel} onValueChange={v => setFormData({ ...formData, ambiguityLevel: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIGH">High (Many Unknowns)</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low (Clear Path)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Key Unknowns (comma separated)</Label>
                    <Textarea
                      value={formData.keyUnknowns || ''}
                      onChange={e => setFormData({ ...formData, keyUnknowns: e.target.value })}
                      className="resize-none h-16"
                      placeholder="e.g., Legal approval, API limits..."
                    />
                  </div>
                </>
              )}
              {type === 'project' && (
                <>
                  <div className="grid gap-2">
                    <Label>Success Criteria</Label>
                    <Textarea
                      value={formData.successCriteria || ''}
                      onChange={e => setFormData({ ...formData, successCriteria: e.target.value })}
                      className="resize-none h-16"
                      placeholder="This project is done when..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Expected Impact</Label>
                      <Input
                        value={formData.expectedImpact || ''}
                        onChange={e => setFormData({ ...formData, expectedImpact: e.target.value })}
                        placeholder="e.g., +10% conversion"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Actual Impact</Label>
                      <Input
                        value={formData.actualImpact || ''}
                        onChange={e => setFormData({ ...formData, actualImpact: e.target.value })}
                        placeholder="e.g., +12% conversion"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="promo-material" 
                      checked={formData.isL6PromoMaterial || false}
                      onChange={(e) => setFormData({ ...formData, isL6PromoMaterial: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="promo-material" className="cursor-pointer text-primary font-bold">
                      Flag as Promo Material
                    </Label>
                  </div>
                </>
              )}
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea 
              id="desc" 
              value={formData.description || ''} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              className="resize-none h-16"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!(formData.title || formData.metric)}>
            {isEditing ? 'Save Changes' : `Create ${type}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
