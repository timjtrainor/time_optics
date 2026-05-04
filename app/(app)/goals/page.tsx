'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  Plus, 
  ChevronRight, 
  TrendingUp 
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StrategicItemDialog } from '@/components/app/goals/strategic-item-dialog'
import { PromoDraftDialog } from '@/components/app/goals/promo-draft-dialog'
import { ObjectiveHeader } from '@/components/app/goals/objective-header'
import { KeyResultCard } from '@/components/app/goals/key-result-card'
import { EmptyObjectivesState } from '@/components/app/goals/empty-objectives-state'

export default function StrategicPrioritiesPage() {
  const { objectives, fetchObjectives, deleteGoal } = useStore()
  const [activeDialog, setActiveDialog] = useState<{
    type: 'objective' | 'keyresult' | 'initiative' | 'project'
    parentId?: number
    data?: any
  } | null>(null)
  const [promoDraft, setPromoDraft] = useState<string | null>(null)
  const [isGeneratingPromo, setIsGeneratingPromo] = useState(false)

  useEffect(() => {
    fetchObjectives()
  }, [fetchObjectives])

  const handleGeneratePromo = async (projectId: number) => {
    setIsGeneratingPromo(true)
    try {
      const res = await fetch('/api/ai/promo-scribe', {
        method: 'POST',
        body: JSON.stringify({ projectId })
      })
      if (!res.ok) throw new Error('Failed to generate promo')
      const result = await res.json()
      if (result.success) {
        setPromoDraft(result.data.starBulletPoint)
      } else {
        throw new Error(result.error || 'Failed to generate promo')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate promo draft')
    } finally {
      setIsGeneratingPromo(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Priorities</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Quarterly OKR Execution <ChevronRight className="h-4 w-4" /> Performance Dashboard
          </p>
        </div>
        <Button onClick={() => setActiveDialog({ type: 'objective' })} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Define Objective
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
        <div className="space-y-12">
          {objectives.map((obj: any) => (
            <div key={obj.id} className="space-y-6">
              <ObjectiveHeader 
                obj={obj}
                onEdit={(data) => setActiveDialog({ type: 'objective', data })}
                onDelete={(id) => deleteGoal('objective', id)}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-4 md:pl-12">
                {obj.keyResults?.map((kr: any) => (
                  <KeyResultCard 
                    key={kr.id}
                    kr={kr}
                    objectiveId={obj.id}
                    onEdit={(objectiveId, data) => setActiveDialog({ type: 'keyresult', parentId: objectiveId, data })}
                    onDelete={(id) => deleteGoal('keyresult', id)}
                    onAddInitiative={(objectiveId, krId) => setActiveDialog({ type: 'initiative', parentId: objectiveId, data: { keyResultIds: [krId] } })}
                    onEditInitiative={(objectiveId, data) => setActiveDialog({ type: 'initiative', parentId: objectiveId, data })}
                    onDeleteInitiative={(id) => deleteGoal('initiative', id)}
                    onAddProject={(initiativeId) => setActiveDialog({ type: 'project', parentId: initiativeId })}
                    onEditProject={(initiativeId, data) => setActiveDialog({ type: 'project', parentId: initiativeId, data })}
                    onGeneratePromo={handleGeneratePromo}
                    isGeneratingPromo={isGeneratingPromo}
                  />
                ))}
                
                <Button 
                  variant="ghost" 
                  className="h-auto py-12 border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 group transition-all flex-col gap-2"
                  onClick={() => setActiveDialog({ type: 'keyresult', parentId: obj.id })}
                >
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary font-bold">Define Key Result</span>
                </Button>
              </div>
            </div>
          ))}

          {objectives.length === 0 && (
            <EmptyObjectivesState 
              onAddObjective={() => setActiveDialog({ type: 'objective' })}
            />
          )}
        </div>
      </ScrollArea>

      {activeDialog && (
        <StrategicItemDialog 
          activeDialog={activeDialog} 
          onClose={() => setActiveDialog(null)} 
        />
      )}

      <PromoDraftDialog 
        promoDraft={promoDraft}
        onClose={() => setPromoDraft(null)}
      />
    </div>
  )
}
