'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface PauseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPause: (note: string) => void
}

export function PauseModal({ open, onOpenChange, onPause }: PauseModalProps) {
  const [note, setNote] = useState('')

  const handlePause = () => {
    if (!note.trim()) return
    onPause(note)
    setNote('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pause Session</DialogTitle>
          <DialogDescription>
            Where are you leaving off? Leave a note so you can jump right back in when you return.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="pause-note"
            placeholder="I was just about to..."
            className="col-span-3 min-h-[100px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handlePause()
              }
            }}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handlePause} disabled={!note.trim()}>Pause Timer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
