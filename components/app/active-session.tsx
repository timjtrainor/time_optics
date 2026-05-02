'use client'

import { useStore } from '@/lib/store'
import { TimerEndType, TimerType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { PauseIcon, PlayIcon, Square, Plus, TargetIcon, CoffeeIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { TimerDial } from './timer-dial'
import { PauseModal } from './pause-modal'
import { createPortal } from 'react-dom'

const setFavicon = (emoji: string) => {
  const canvas = document.createElement('canvas')
  canvas.height = 32
  canvas.width = 32

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.font = '28px serif'
  ctx.fillText(emoji, 2, 24)

  const link =
    document.querySelector<HTMLLinkElement>('link[rel*="icon"]') ||
    document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'shortcut icon'
  link.href = canvas.toDataURL()
  document.head.appendChild(link)
}

export function ActiveSession() {
  const { activeSession, completeTimer, startTimer, pauseTimer, resumeTimer, extendTimer } = useStore()
  const [progress, setProgress] = useState(0)
  const [timeLeftStr, setTimeLeftStr] = useState('')
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false)
  const [currentElapsedMs, setCurrentElapsedMs] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)

  // Auto-maximize when a new session starts
  useEffect(() => {
    setIsMinimized(false)
  }, [activeSession?.sessionId])

  useEffect(() => {
    if (!activeSession) return

    const originalTitle = document.title
    const isWork = activeSession.type === TimerType.WORK
    const content = activeSession.content || (isWork ? 'Work' : 'Break')

    setFavicon(isWork ? '🎯' : '☕')

    const updateTimer = () => {
      const durationMs = activeSession.duration * 60 * 1000
      let elapsedMs = activeSession.accumulatedElapsedMs || 0

      if (activeSession.status === 'RUNNING' && activeSession.startTime) {
        elapsedMs += Date.now() - new Date(activeSession.startTime).getTime()
      }
      
      setCurrentElapsedMs(elapsedMs)

      const newProgress = Math.min((elapsedMs / durationMs) * 100, 100)
      setProgress(newProgress)

      const remaining = Math.max(0, durationMs - elapsedMs)
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`
      setTimeLeftStr(timeString)

      document.title = activeSession.status === 'PAUSED' 
        ? `PAUSED - ${content}` 
        : `${timeString} ${content} - TimeOptics`

      if (elapsedMs >= durationMs && activeSession.status === 'RUNNING') {
        document.title = `${content} - TimeOptics`
        setFavicon('✅')

        // Auto transition logic
        if (activeSession.type === TimerType.WORK) {
          completeTimer(activeSession.sessionId, TimerEndType.COMPLETED).then(() => {
            startTimer(content, TimerType.BREAK, activeSession.sessionId)
          })
        } else if (activeSession.type === TimerType.BREAK) {
          completeTimer(activeSession.sessionId, TimerEndType.COMPLETED)
        }

        try {
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
        } catch {}

        const audio = new Audio('/_static/Hero.aiff')
        audio.play().catch(() => {})
      }
    }

    // Initial update
    updateTimer()

    let interval: NodeJS.Timeout
    if (activeSession.status === 'RUNNING') {
      interval = setInterval(updateTimer, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
      document.title = originalTitle
      setFavicon('🐿️')
    }
  }, [activeSession, completeTimer, startTimer])

  if (!activeSession) return null

  const handleStop = async () => {
    await completeTimer(activeSession.sessionId, TimerEndType.INTERRUPTED)
  }

  const handlePauseSubmit = async (note: string) => {
    await pauseTimer(activeSession.sessionId, note, currentElapsedMs)
    setIsPauseModalOpen(false)
    setIsMinimized(true)
  }

  const handleResume = async () => {
    await resumeTimer(activeSession.sessionId, currentElapsedMs)
  }

  const handleAdd5Mins = async () => {
    await extendTimer(activeSession.sessionId, 5)
  }

  const isWork = activeSession.type === TimerType.WORK
  const isPaused = activeSession.status === 'PAUSED'

  if (isMinimized) {
    return (
      <button 
        className="relative flex items-center gap-2 h-8 min-w-[140px] rounded-md border border-primary/20 bg-background px-2 hover:bg-accent/50 cursor-pointer overflow-hidden transition-colors"
        onClick={() => setIsMinimized(false)}
        title="Resume/View Timer"
      >
        {isWork ? (
          <TargetIcon className="h-3 w-3 text-primary animate-pulse" />
        ) : (
          <CoffeeIcon className="h-3 w-3 text-primary animate-pulse" />
        )}
        <span className="text-xs font-bold font-mono tracking-tight tabular-nums relative z-10">
          {isPaused ? 'PAUSED' : timeLeftStr}
        </span>
        {activeSession?.content && (
          <span className="text-xs font-medium tabular-nums tracking-tight truncate max-w-[100px] relative z-10">
            {activeSession.content}
          </span>
        )}
        <Progress
          value={progress}
          className={cn(
            'absolute bottom-0 left-0 right-0 h-full opacity-10 rounded-none z-0',
            isWork ? 'bg-primary' : 'bg-blue-500',
          )}
        />
      </button>
    )
  }

  // Render a full-screen fixed overlay using a portal
  return typeof document !== 'undefined' ? createPortal(
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 backdrop-blur-md transition-colors duration-500",
      isWork ? "bg-red-500/5 dark:bg-red-950/20" : "bg-blue-500/5 dark:bg-blue-950/20"
    )}>
      {/* Minimize button (only when paused) */}
      {isPaused && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 left-6 h-12 w-12 rounded-full hover:bg-secondary/20"
          onClick={() => setIsMinimized(true)}
          title="Minimize Timer"
        >
          <X className="h-6 w-6" />
        </Button>
      )}

      {/* Absolute Stop button in top right for emergency aborts */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 h-12 w-12 rounded-full hover:bg-destructive/20 hover:text-destructive"
        onClick={handleStop}
        title="Stop Session"
      >
        <Square className="h-6 w-6" />
      </Button>

      {/* The main dial and text */}
      <div className="w-full flex items-center justify-center mt-[-5vh]">
        <TimerDial
          progress={progress}
          timeLeft={timeLeftStr}
          taskName={activeSession.content || ''}
          isWork={isWork}
          isPaused={isPaused}
          pauseNote={activeSession.pauseNote}
        />
      </div>

      {/* Main Controls Overlay - Rendered in normal flow below the dial */}
      <div className="mt-8 flex items-center gap-4 bg-background/80 backdrop-blur-xl p-3 rounded-full border border-border shadow-2xl">
        {!isPaused ? (
          <Button 
            size="lg" 
            variant="default"
            className="rounded-full h-14 px-8 text-lg font-medium shadow-lg"
            onClick={() => setIsPauseModalOpen(true)}
          >
            <PauseIcon className="h-5 w-5 mr-2" />
            Pause
          </Button>
        ) : (
          <Button 
            size="lg" 
            variant="default"
            className="rounded-full h-14 px-8 text-lg font-medium shadow-lg animate-pulse"
            onClick={handleResume}
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
          onClick={handleAdd5Mins}
        >
          <Plus className="h-4 w-4 mr-1" />
          5m
        </Button>
      </div>

      <PauseModal
        open={isPauseModalOpen}
        onOpenChange={setIsPauseModalOpen}
        onPause={handlePauseSubmit}
      />
    </div>,
    document.body
  ) : null
}
