'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Inbox, Sparkles, ArrowRight, Trash2, CheckCircle2, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskStatus, EffortSize, TaskImpact } from '@/lib/types'

export default function InboxPage() {
  const { captureItems, fetchCaptureItems, createCaptureItem, deleteCaptureItem, createTask } = useStore()
  const [rawText, setRawText] = useState('')
  const [isTriageLoading, setIsTriageLoading] = useState(false)

  useEffect(() => {
    fetchCaptureItems()
  }, [fetchCaptureItems])

  const handleCapture = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!rawText.trim()) return
    await createCaptureItem(rawText)
    setRawText('')
    toast.success('Captured to Inbox')
  }

  const handleTriageAll = async () => {
    setIsTriageLoading(true)
    try {
      toast.info('AI is triaging your inbox...')
      const res = await fetch('/api/capture/triage', { method: 'POST' })
      if (!res.ok) throw new Error('Triage failed')
      await fetchCaptureItems()
      toast.success('Inbox triaged into tasks!')
    } catch (error) {
      toast.error('Failed to triage inbox')
    } finally {
      setIsTriageLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteCaptureItem(id)
    toast.success('Item deleted')
  }

  const handleResolve = async (item: any) => {
    try {
      await createTask({
        title: item.rawText,
        status: TaskStatus.BACKLOG,
        size: EffortSize.M,
        impact: TaskImpact.BUCKET
      })
      await deleteCaptureItem(item.id)
      toast.success('Converted to backlog task')
    } catch (error) {
      toast.error('Failed to convert to task')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
          <Inbox className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Capture Inbox</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Clear your head. Dump your thoughts here and let AI triage them later.
        </p>
      </div>

      <Card className="p-6 border-2 shadow-2xl shadow-primary/5">
        <form onSubmit={handleCapture} className="space-y-4">
          <Textarea 
            placeholder="Quick capture: 'Email Sarah about the API spec', 'The database migration is risky', 'Need to buy coffee'..."
            className="min-h-[120px] text-lg bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleCapture()
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">⌘ + Enter to capture</span>
            <Button disabled={!rawText.trim()} size="lg" className="px-8 gap-2">
              <Zap className="h-4 w-4 fill-current" />
              Capture
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Pending Items
            <Badge variant="secondary" className="h-5 px-1.5">{captureItems.length}</Badge>
          </h2>
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
            onClick={handleTriageAll}
            disabled={captureItems.length === 0 || isTriageLoading}
          >
            <Sparkles className="h-4 w-4" />
            {isTriageLoading ? 'Triaging...' : 'AI Triage All'}
          </Button>
        </div>

        <div className="grid gap-3">
          <AnimatePresence>
            {captureItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className="p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="flex-1 text-sm font-medium">{item.rawText}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-green-600"
                      onClick={() => handleResolve(item)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {captureItems.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground">Inbox is Empty</h3>
              <p className="text-sm text-muted-foreground/60">Your mind is clear. Good job!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
