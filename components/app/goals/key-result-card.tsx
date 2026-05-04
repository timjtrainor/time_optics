'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Pencil, 
  Trash2, 
  Plus 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { InitiativeItem } from './initiative-item'

interface KeyResultCardProps {
  kr: any
  objectiveId: number
  onEdit: (objectiveId: number, kr: any) => void
  onDelete: (id: number) => void
  onAddInitiative: (objectiveId: number, krId: number) => void
  onEditInitiative: (objectiveId: number, initiative: any) => void
  onDeleteInitiative: (id: number) => void
  onAddProject: (initiativeId: number) => void
  onEditProject: (initiativeId: number, project: any) => void
  onGeneratePromo: (projectId: number) => void
  isGeneratingPromo: boolean
}

export function KeyResultCard({ 
  kr, 
  objectiveId,
  onEdit, 
  onDelete,
  onAddInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onAddProject,
  onEditProject,
  onGeneratePromo,
  isGeneratingPromo
}: KeyResultCardProps) {
  const calculateProgress = (kr: any) => {
    const { baselineValue, currentValue, targetValue, direction } = kr
    if (direction === 'ACHIEVE') return currentValue >= targetValue ? 100 : 0
    
    const range = Math.abs(targetValue - baselineValue)
    if (range === 0) return 0
    
    const progress = direction === 'INCREASE' 
      ? (currentValue - baselineValue) / range
      : (baselineValue - currentValue) / range
      
    return Math.min(Math.max(Math.round(progress * 100), 0), 100)
  }

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.7) return 'text-green-500 bg-green-500/10'
    if (conf >= 0.4) return 'text-yellow-500 bg-yellow-500/10'
    return 'text-red-500 bg-red-500/10'
  }

  const progress = calculateProgress(kr)

  return (
    <Card className="p-5 border-none bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[9px] font-bold h-5", getConfidenceColor(kr.confidence))}>
              CONF: {Math.round(kr.confidence * 100)}%
            </Badge>
            {kr.grade !== null && (
              <Badge variant="outline" className="text-[9px] font-bold h-5 border-primary/20 bg-primary/5">
                GRADE: {kr.grade.toFixed(1)}
              </Badge>
            )}
          </div>
          <h3 className="font-bold text-sm leading-tight">{kr.metric}</h3>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(objectiveId, kr)}>
             <Pencil className="h-3 w-3" />
           </Button>
           <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(kr.id)}>
             <Trash2 className="h-3 w-3" />
           </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end text-[11px]">
          <div className="space-y-1">
            <span className="text-muted-foreground uppercase tracking-tighter block">Baseline</span>
            <span className="font-mono font-bold">{kr.baselineValue} {kr.unit !== 'count' ? kr.unit : ''}</span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-primary font-black block">Current</span>
            <span className="font-mono font-bold bg-primary/10 px-2 py-0.5 rounded">{kr.currentValue}</span>
          </div>
          <div className="text-right space-y-1">
            <span className="text-muted-foreground uppercase tracking-tighter block">Target</span>
            <span className="font-mono font-bold">{kr.targetValue}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Initiatives under this KR */}
      <div className="mt-6 pt-4 border-t border-dashed space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Linked Initiatives</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-[9px] px-2 gap-1" 
            onClick={() => onAddInitiative(objectiveId, kr.id)}
          >
            <Plus className="h-3 w-3" /> Add Initiative
          </Button>
        </div>
        <div className="space-y-2">
          {kr.initiatives?.map((ikr: any) => (
            <InitiativeItem 
              key={ikr.initiative.id}
              initiative={ikr.initiative}
              onEdit={(initiative) => onEditInitiative(objectiveId, initiative)}
              onDelete={onDeleteInitiative}
              onAddProject={onAddProject}
              onEditProject={onEditProject}
              onGeneratePromo={onGeneratePromo}
              isGeneratingPromo={isGeneratingPromo}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
