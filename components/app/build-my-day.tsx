'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { EnergyLevel, TaskStatus } from '@/lib/types'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { experimental_useObject } from '@ai-sdk/react'
import { generatePlanSchema } from '@/app/api/tasks/generate/schema'
import { BuildMyDayInputs } from './build-my-day-inputs'
import { BuildMyDayLoading } from './build-my-day-loading'
import { BuildMyDayReview } from './build-my-day-review'

export function BuildMyDay() {
  const { updateDayPlan, createTask } = useStore()
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
    const { activeSprint } = useStore.getState()
    try {
      // Create all tasks in the DB
      for (const task of generatedPlan.tasks) {
        await createTask({
          ...task,
          status: TaskStatus.TODO,
          sprintId: activeSprint?.id || null,
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
        <p className="text-muted-foreground text-lg">Build your optimized daily plan.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <BuildMyDayInputs 
            content={content}
            setContent={setContent}
            meetingHours={meetingHours}
            setMeetingHours={setMeetingHours}
            energyLevel={energyLevel}
            setEnergyLevel={setEnergyLevel}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        )}

        {step === 2 && (
          <BuildMyDayLoading />
        )}

        {step === 3 && (generatedPlan || object) && (
          <BuildMyDayReview 
            generatedPlan={generatedPlan}
            object={object}
            isLoading={isLoading}
            onAccept={handleAcceptPlan}
            onRefine={() => setStep(1)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
