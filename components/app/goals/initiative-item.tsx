'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Pencil, 
  Trash2, 
  Box, 
  Award, 
  Plus 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InitiativeItemProps {
  initiative: any
  onEdit: (initiative: any) => void
  onDelete: (id: number) => void
  onAddProject: (initiativeId: number) => void
  onEditProject: (initiativeId: number, project: any) => void
  onGeneratePromo: (projectId: number) => void
  isGeneratingPromo: boolean
}

export function InitiativeItem({ 
  initiative, 
  onEdit, 
  onDelete, 
  onAddProject,
  onEditProject,
  onGeneratePromo,
  isGeneratingPromo
}: InitiativeItemProps) {
  return (
    <div className="bg-background/50 rounded-lg p-3 border border-transparent hover:border-primary/20 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3 text-primary" />
          <h4 className="text-xs font-bold">{initiative.title}</h4>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(initiative)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(initiative.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {initiative.projects?.map((proj: any) => (
          <div key={proj.id} className="flex items-center gap-1 group/proj">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[9px] font-medium py-0 px-2 cursor-pointer hover:bg-primary/10", 
                proj.isL6PromoMaterial && "border-primary/50 bg-primary/5 text-primary"
              )} 
              onClick={() => onEditProject(initiative.id, proj)}
            >
              <Box className="h-2 w-2 mr-1" /> {proj.title}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 opacity-0 group-hover/proj:opacity-100 transition-opacity text-primary" 
              title="Generate Promo Draft"
              onClick={() => onGeneratePromo(proj.id)}
              disabled={isGeneratingPromo}
            >
              <Award className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="outline" className="h-5 text-[9px] px-2 border-dashed" onClick={() => onAddProject(initiative.id)}>
          <Plus className="h-2 w-2 mr-1" /> Project
        </Button>
      </div>
    </div>
  )
}
