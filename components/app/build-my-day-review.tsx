'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Target, 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BuildMyDayReviewProps {
  generatedPlan: any
  object: any
  isLoading: boolean
  onAccept: () => void
  onRefine: () => void
}

export function BuildMyDayReview({
  generatedPlan,
  object,
  isLoading,
  onAccept,
  onRefine
}: BuildMyDayReviewProps) {
  const plan = generatedPlan || object

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid gap-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              Proposed Tasks {isLoading && <span className="animate-pulse">...</span>}
            </h2>
          </div>

          <div className="space-y-4">
            {plan?.tasks?.map((task: any, i: number) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border bg-muted/20">
                <div className="mt-1">
                  <Badge 
                    variant={task.impact === 'NEEDLE' ? "default" : "secondary"}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight"
                  >
                    {task.impact}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{task.title || '...'}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{task.aiReasoning}</p>
                </div>
                <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Badge variant="secondary" className="rounded-md">{task.size}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              Coach's Focus Advice
            </h3>
            <p className="text-sm leading-relaxed italic text-primary/80">
              "{plan?.notes || 'Analyzing your day...'}"
            </p>
          </Card>

          <Card className="p-6 border-dashed">
            <h3 className="font-semibold text-sm mb-4">Plan Logic</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {plan?.reasoning || '...'}
            </p>
          </Card>

          <div className="flex flex-col gap-3 pt-4">
            <Button size="lg" className="w-full h-12" onClick={onAccept} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Accept & Start Day'}
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={onRefine} disabled={isLoading}>
              Refine Inputs
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
