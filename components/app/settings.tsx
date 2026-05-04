'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimePicker } from '@/components/ui/time-picker'
import { AI_CONFIG } from '@/lib/config'
import { useStore } from '@/lib/store'
import { Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AgentProvider, PlanPreferences, AgentConfig } from '@/lib/types'

export function Settings({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void
}) {
  const { plan, fetchPlan, updatePlan } = useStore()
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>(AI_CONFIG.ollama.defaultEndpoint)
  
  const [defaultProvider, setDefaultProvider] = useState<AgentProvider>(AgentProvider.OPENROUTER)
  const [defaultModel, setDefaultModel] = useState<string>(AI_CONFIG.defaultModel)
  
  const [agents, setAgents] = useState<Record<string, AgentConfig>>(() => {
    const initial: Record<string, AgentConfig> = {}
    Object.keys(AI_CONFIG.agents).forEach(id => {
      initial[id] = {}
    })
    return initial
  })

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const parseTime = (time: string) => {
    return Number.parseInt(time.split(':')[0])
  }

  useEffect(() => {
    const today = new Date()
    fetchPlan(today)
  }, [fetchPlan])

  useEffect(() => {
    if (plan?.preferences) {
      const prefs = plan.preferences as PlanPreferences
      const {
        workingHours,
        openRouterKey: savedKey,
        ollamaEndpoint: savedOllama,
        defaultProvider: savedDefaultProvider,
        defaultModel: savedDefaultModel,
        agents: savedAgents,
      } = prefs
      if (workingHours) {
        setStartTime(formatTime(workingHours.start))
        setEndTime(formatTime(workingHours.end))
      }
      if (savedKey) setOpenRouterKey(savedKey)
      if (savedOllama) setOllamaEndpoint(savedOllama)
      if (savedDefaultProvider) setDefaultProvider(savedDefaultProvider)
      if (savedDefaultModel) setDefaultModel(savedDefaultModel)
      if (savedAgents) {
        const merged: Record<string, AgentConfig> = {}
        Object.keys(AI_CONFIG.agents).forEach(id => {
          merged[id] = savedAgents[id] || {}
        })
        setAgents(merged)
      }
    }
  }, [plan])

  const handleSave = async () => {
    const today = new Date()
    await updatePlan(today, plan?.content || '', {
      workingHours: {
        start: parseTime(startTime),
        end: parseTime(endTime),
      },
      openRouterKey,
      ollamaEndpoint,
      defaultProvider,
      defaultModel,
      agents,
    })
    setIsOpen(false)
  }

  const updateAgent = (agentId: string, updates: Partial<AgentConfig>) => {
    setAgents(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...updates }
    }))
  }

  return (
    <div className="grid gap-6 py-4 max-h-[80vh] overflow-y-auto pr-2">
      <div className="grid gap-2">
        <Label className="text-sm font-semibold">General Settings</Label>
        <div className="grid gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="grid gap-2">
            <Label>Working Hours</Label>
            <TimePicker
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-primary">AI Providers</Label>
        <div className="grid gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="grid gap-2">
            <Label>Default Provider</Label>
            <Select 
              value={defaultProvider} 
              onValueChange={(val) => setDefaultProvider(val as AgentProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AgentProvider.OPENROUTER}>OpenRouter</SelectItem>
                <SelectItem value={AgentProvider.OLLAMA}>Ollama</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="default-model">Default Model</Label>
            <Input
              id="default-model"
              type="text"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder="e.g. google/gemini-2.0-flash-001 or llama3"
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
            <Input
              id="openrouter-key"
              type="password"
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="sk-..."
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
            <Input
              id="ollama-endpoint"
              type="text"
              value={ollamaEndpoint}
              onChange={(e) => setOllamaEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
              className="font-mono"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t pt-4">
        <Label className="text-sm font-semibold text-primary">Agent Personas Overrides</Label>
        {Object.entries(AI_CONFIG.agents).map(([id, agent]) => (
          <div key={id} className="grid gap-3 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <Label className="font-medium">{agent.name}</Label>
              <Select 
                value={agents[id]?.provider || 'default'} 
                onValueChange={(val) => updateAgent(id, { provider: val === 'default' ? undefined : val as AgentProvider })}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value={AgentProvider.OPENROUTER}>OpenRouter</SelectItem>
                  <SelectItem value={AgentProvider.OLLAMA}>Ollama</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`${id}-model`} className="text-xs text-muted-foreground">Model Override</Label>
              <Input
                id={`${id}-model`}
                value={agents[id]?.model || ''}
                onChange={(e) => updateAgent(id, { model: e.target.value || undefined })}
                className="h-8 font-mono text-xs"
                placeholder={`Leave blank to use default`}
              />
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} className="sticky bottom-0 mt-2">
        Save all settings
      </Button>
    </div>
  )
}

export function SettingsPopup() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 px-0">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Settings setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}
