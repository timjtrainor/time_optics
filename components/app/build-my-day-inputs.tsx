'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  BrainCircuit, 
  Calendar, 
  Zap, 
  Sparkles 
} from 'lucide-react'
import { EnergyLevel } from '@/lib/types'
import { motion } from 'framer-motion'

interface BuildMyDayInputsProps {
  content: string
  setContent: (value: string) => void
  meetingHours: number
  setMeetingHours: (value: number) => void
  energyLevel: EnergyLevel
  setEnergyLevel: (level: EnergyLevel) => void
  onGenerate: () => void
  isLoading: boolean
}

export function BuildMyDayInputs({
  content,
  setContent,
  meetingHours,
  setMeetingHours,
  energyLevel,
  setEnergyLevel,
  onGenerate,
  isLoading
}: BuildMyDayInputsProps) {
  return (
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
            onClick={onGenerate}
          >
            <Sparkles className="h-6 w-6" />
            Generate My Day
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
