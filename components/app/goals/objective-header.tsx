'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket, 
  Activity, 
  Target, 
  Pencil, 
  Trash2 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ObjectiveHeaderProps {
  obj: any
  onEdit: (obj: any) => void
  onDelete: (id: number) => void
}

export function ObjectiveHeader({ obj, onEdit, onDelete }: ObjectiveHeaderProps) {
  return (
    <Card className={cn(
      "p-6 border-l-4 shadow-sm relative overflow-hidden",
      obj.type === 'MOONSHOT' ? "border-l-purple-500" : "border-l-blue-500"
    )}>
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
        {obj.type === 'MOONSHOT' ? <Rocket className="size-32" /> : <Activity className="size-32" />}
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            obj.type === 'MOONSHOT' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
          )}>
            {obj.type === 'MOONSHOT' ? <Rocket className="h-7 w-7" /> : <Target className="h-7 w-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest">
                {obj.type}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">
                {obj.quarter || '26-Q2'}
              </Badge>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{obj.title}</h2>
            {obj.description && <p className="text-muted-foreground text-sm mt-1">{obj.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(obj)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(obj.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {obj.healthMetrics && (
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
            <Activity className="h-3 w-3" /> Health Guardrails:
          </span>
          {(obj.healthMetrics as any[]).map((m: any, i: number) => (
            <Badge key={i} variant="outline" className="bg-muted/50 text-[10px]">
              {m.metric}: {m.floor ? `≥ ${m.floor}` : m.note}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
