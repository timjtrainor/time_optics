'use client'

import { PauseIcon, PlayIcon, Plus, ShieldAlert } from 'lucide-react'
import { Button } from '../ui/button'

interface TimerControlsProps {
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  onAdd5Mins: () => void
  onUnblock: () => void
}

export function TimerControls({ 
  isPaused, 
  onPause, 
  onResume, 
  onAdd5Mins, 
  onUnblock 
}: TimerControlsProps) {
  return (
    <div className="mt-8 flex items-center gap-4 bg-background/80 backdrop-blur-xl p-3 rounded-full border border-border shadow-2xl">
      {!isPaused ? (
        <Button 
          size="lg" 
          variant="default"
          className="rounded-full h-14 px-8 text-lg font-medium shadow-lg"
          onClick={onPause}
        >
          <PauseIcon className="h-5 w-5 mr-2" />
          Pause
        </Button>
      ) : (
        <Button 
          size="lg" 
          variant="default"
          className="rounded-full h-14 px-8 text-lg font-medium shadow-lg animate-pulse"
          onClick={onResume}
        >
          <PlayIcon className="h-5 w-5 mr-2" />
          Resume
        </Button>
      )}

      <div className="w-px h-8 bg-border mx-2" />

      <Button 
        size="lg" 
        variant="secondary"
        className="rounded-full h-14 px-6 font-medium shadow-sm hover:bg-secondary/80"
        onClick={onAdd5Mins}
      >
        <Plus className="h-4 w-4 mr-1" />
        5m
      </Button>

      <div className="w-px h-8 bg-border mx-2" />

      <Button 
        size="lg" 
        variant="ghost"
        className="rounded-full h-14 px-6 font-medium text-primary hover:bg-primary/10"
        onClick={onUnblock}
      >
        <ShieldAlert className="h-5 w-5 mr-2" />
        Unblock
      </Button>
    </div>
  )
}
