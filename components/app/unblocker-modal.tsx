'use client'

import { useState } from 'react'
import { ShieldAlert, Brain, Loader2, Send, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { toast } from 'sonner'

interface UnblockerModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
}

export function UnblockerModal({ isOpen, onOpenChange, sessionId }: UnblockerModalProps) {
  const [unblockerNote, setUnblockerNote] = useState('')
  const [unblockerResult, setUnblockerResult] = useState<{ slackDraft: string, sop: string } | null>(null)
  const [isUnblockingAI, setIsUnblockingAI] = useState(false)

  const handleRunUnblocker = async () => {
    if (!unblockerNote.trim()) return
    setIsUnblockingAI(true)
    try {
      const res = await fetch('/api/ai/unblocker', {
        method: 'POST',
        body: JSON.stringify({ 
          taskId: sessionId, 
          rawInput: unblockerNote 
        })
      })
      if (!res.ok) throw new Error('Unblocker failed')
      const result = await res.json()
      if (result.success) {
        setUnblockerResult(result.data)
      } else {
        throw new Error(result.error || 'Unblocker failed')
      }
    } catch (error) {
      toast.error('AI Unblocker failed')
    } finally {
      setIsUnblockingAI(false)
    }
  }

  const handleClose = () => {
    setUnblockerResult(null)
    setUnblockerNote('')
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Unblocker Agent
          </DialogTitle>
          <DialogDescription>
            Stuck on a tactical blocker? Describe it, and the agent will draft a delegation message and SOP.
          </DialogDescription>
        </DialogHeader>
        
        {!unblockerResult ? (
          <div className="grid gap-4 py-4">
            <Textarea 
              placeholder="What's blocking you? e.g., 'Waiting for legal to approve the API terms...'"
              value={unblockerNote}
              onChange={e => setUnblockerNote(e.target.value)}
              className="h-32 resize-none"
            />
            <Button 
              onClick={handleRunUnblocker} 
              disabled={isUnblockingAI || !unblockerNote.trim()}
              className="w-full gap-2"
            >
              {isUnblockingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Generate Unblocking Strategy
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                <Send className="h-4 w-4" /> Slack/Email Draft
              </h4>
              <div className="bg-muted p-3 rounded-lg text-sm italic border">
                {unblockerResult.slackDraft}
              </div>
              <Button variant="outline" size="sm" className="w-full text-[10px]" onClick={() => {
                navigator.clipboard.writeText(unblockerResult.slackDraft)
                toast.success('Copied draft!')
              }}>Copy Draft</Button>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-bold flex items-center gap-2 text-green-600">
                <FileText className="h-4 w-4" /> Team SOP (Capture)
              </h4>
              <div className="bg-muted p-3 rounded-lg text-xs font-mono border">
                {unblockerResult.sop}
              </div>
              <Button variant="outline" size="sm" className="w-full text-[10px]" onClick={() => {
                navigator.clipboard.writeText(unblockerResult.sop)
                toast.success('Copied SOP!')
              }}>Copy SOP</Button>
            </div>
            
            <Button variant="default" className="w-full mt-4" onClick={handleClose}>
              Done & Unblocked
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
