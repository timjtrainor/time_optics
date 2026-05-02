'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Sparkles, 
  Calendar, 
  Target, 
  Zap, 
  Clock, 
  ChevronRight,
  BrainCircuit,
  LayoutDashboard
} from 'lucide-react'
import { EnergyLevel, TaskStatus } from '@/lib/types'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { experimental_useObject } from '@ai-sdk/react'
import { generatePlanSchema } from '@/app/api/tasks/generate/schema'

export function BuildMyDay() {
  const { plan, updatePlan, updateDayPlan, createTask, fetchTasks } = useStore()
  const [step, setStep] = useState(1) // 1: Inputs, 2: AI Generation, 3: Review
  const [content, setContent] = useState('')
  const [meetingHours, setMeetingHours] = useState(4)
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(EnergyLevel.MEDIUM)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)

  const { submit, object, isLoading } = experimental_useObject({
    api: '/api/tasks/generate',
    schema: generatePlanSchema,
    onFinish: (result) => {
      setGeneratedPlan(result.object)
    },
    onError: () => {
      toast.error('Failed to generate plan')
      setStep(1)
    }
  })

  const handleGenerate = async () => {
    setStep(2)
    submit({ content, meetingHours, energyLevel })
  }

  // Auto-transition to review step once tasks start streaming
  useEffect(() => {
    if (step === 2 && object?.tasks?.length) {
      setStep(3)
    }
  }, [object, step])

  const handleAcceptPlan = async () => {
    if (!generatedPlan) return
    try {
      // Create all tasks in the DB
      for (const task of generatedPlan.tasks) {
        await createTask({
          ...task,
          status: TaskStatus.TODO,
          scheduledDate: new Date(),
        })
      }

      // Save the day plan metadata
      await updateDayPlan(new Date(), {
        meetingHours,
        energyLevel,
        aiScheduleSummary: generatedPlan.notes,
        aiFocusAdvice: generatedPlan.reasoning,
      })

      toast.success('Day plan activated!')
      setStep(1)
      setContent('')
      setGeneratedPlan(null)
    } catch (error) {
      toast.error('Failed to save tasks')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Command Center
        </h1>
        <p className="text-muted-foreground text-lg">Build your neurodivergent-optimized daily plan.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-6"
          >
            <Card className="p-6 border-2 border-primary/10 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                      Brain Dump
                    </Label>
                    <span className="text-xs text-muted-foreground italic">Don't filter, just capture everything.</span>
                  </div>
                  <Textarea 
                    placeholder="What's on your mind? Tasks, worries, meetings, project updates..."
                    className="min-h-[200px] text-lg bg-background/50 focus:bg-background transition-all"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="grid gap-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Meeting Load (Hours)
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="range" 
                        min="0" 
                        max="8" 
                        step="0.5" 
                        value={meetingHours}
                        onChange={(e) => setMeetingHours(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold w-12 text-center">{meetingHours}h</span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Today's Energy
                    </Label>
                    <div className="flex gap-2">
                      {Object.values(EnergyLevel).map((level) => (
                        <Button
                          key={level}
                          variant={energyLevel === level ? 'default' : 'outline'}
                          className="flex-1 capitalize h-10"
                          onClick={() => setEnergyLevel(level)}
                        >
                          {level.toLowerCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-xl gap-3 shadow-lg shadow-primary/20"
                  disabled={!content.trim() || isLoading}
                  onClick={handleGenerate}
                >
                  <Sparkles className="h-6 w-6" />
                  Generate My Day
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-8"
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Consulting your Agents...</h2>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 animate-pulse">📅 Scheduler</span>
                <span className="flex items-center gap-1 animate-pulse delay-75">🎯 Prioritizer</span>
                <span className="flex items-center gap-1 animate-pulse delay-150">🧠 Focus Coach</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (generatedPlan || object) && (
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
                    Proposed Schedule {isLoading && <span className="animate-pulse">...</span>}
                  </h2>
                  <div className="flex gap-2">
                    <Badge variant="success">MUST: {(generatedPlan || object)?.moscowDistribution?.must || 0}%</Badge>
                    <Badge variant="secondary">SHOULD: {(generatedPlan || object)?.moscowDistribution?.should || 0}%</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {(generatedPlan || object)?.tasks?.map((task: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border bg-muted/20">
                      <div className="mt-1">
                        <Badge className="bg-primary/20 text-primary border-none">{task.moscowClass?.[0]}</Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{task.title || '...'}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{task.aiReasoning}</p>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimatedPomodoros ? task.estimatedPomodoros * 25 : '?'}m
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
                    "{(generatedPlan || object)?.notes || 'Analyzing your day...'}"
                  </p>
                </Card>

                <Card className="p-6 border-dashed">
                  <h3 className="font-semibold text-sm mb-4">Plan Logic</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {(generatedPlan || object)?.reasoning || '...'}
                  </p>
                </Card>

                <div className="flex flex-col gap-3 pt-4">
                  <Button size="lg" className="w-full h-12" onClick={handleAcceptPlan} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Accept & Start Day'}
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => setStep(1)} disabled={isLoading}>
                    Refine Inputs
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'secondary' | 'success' | 'warning', className?: string }) {
  const styles = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-500/10 text-green-600 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
  }
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight", styles[variant], className)}>
      {children}
    </span>
  )
}
