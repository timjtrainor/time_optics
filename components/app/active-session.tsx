'use client'

import { useStore } from '@/lib/store'
import { TimerEndType, TimerType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { TimerDial } from './timer-dial'
import { PauseModal } from './pause-modal'
import { createPortal } from 'react-dom'
import { HyperfocusInterceptor } from './hyperfocus-interceptor'
import { UnblockerModal } from './unblocker-modal'
import { MinimizedTimer } from './minimized-timer'
import { TimerControls } from './timer-controls'

const setFavicon = (emoji: string) => {
  if (typeof document === 'undefined') return
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
  const [isHardStopOpen, setIsHardStopOpen] = useState(false)
  const [hasFiredHardStop, setHasFiredHardStop] = useState(false)
  const [isUnblockerOpen, setIsUnblockerOpen] = useState(false)

  // Auto-maximize when a new session starts
  useEffect(() => {
    setIsMinimized(false)
    setHasFiredHardStop(false)
    setIsHardStopOpen(false)
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

      // HYPERFOCUS INTERCEPTOR LOGIC
      if (isWork && elapsedMs > durationMs * 1.2 && !hasFiredHardStop && activeSession.status === 'RUNNING') {
        setHasFiredHardStop(true)
        setIsHardStopOpen(true)
        pauseTimer(activeSession.sessionId, 'Hyperfocus Intercept', elapsedMs)
        return
      }

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
  }, [activeSession, completeTimer, startTimer, hasFiredHardStop, pauseTimer])

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
      <MinimizedTimer 
        isWork={isWork}
        isPaused={isPaused}
        timeLeftStr={timeLeftStr}
        content={activeSession.content || ''}
        progress={progress}
        onClick={() => setIsMinimized(false)}
      />
    )
  }

  return typeof document !== 'undefined' ? createPortal(
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 backdrop-blur-md transition-colors duration-500",
      isWork ? "bg-red-500/5 dark:bg-red-950/20" : "bg-blue-500/5 dark:bg-blue-950/20"
    )}>
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

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 h-12 w-12 rounded-full hover:bg-destructive/20 hover:text-destructive"
        onClick={handleStop}
        title="Stop Session"
      >
        <Square className="h-6 w-6" />
      </Button>

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

      <TimerControls 
        isPaused={isPaused}
        onPause={() => setIsPauseModalOpen(true)}
        onResume={handleResume}
        onAdd5Mins={handleAdd5Mins}
        onUnblock={() => setIsUnblockerOpen(true)}
      />

      <PauseModal
        open={isPauseModalOpen}
        onOpenChange={setIsPauseModalOpen}
        onPause={handlePauseSubmit}
      />

      <UnblockerModal 
        isOpen={isUnblockerOpen}
        onOpenChange={setIsUnblockerOpen}
        sessionId={activeSession.sessionId}
      />

      {isHardStopOpen && (
        <HyperfocusInterceptor 
          onStop={handleStop}
          onExtend={() => {
            setIsHardStopOpen(false)
            handleAdd5Mins()
            handleResume()
          }}
        />
      )}
    </div>,
    document.body
  ) : null
}
