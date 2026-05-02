'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TimerDialProps {
  progress: number // 0 to 100
  timeLeft: string
  taskName: string
  isWork: boolean
  isPaused: boolean
  pauseNote?: string | null
  className?: string
}

export function TimerDial({
  progress,
  timeLeft,
  taskName,
  isWork,
  isPaused,
  pauseNote,
  className,
}: TimerDialProps) {
  // Convert progress (0-100) to degrees (0-360)
  // For a Time Timer, we start at 360 degrees (full) and go to 0.
  const remainingProgress = Math.max(0, 100 - progress)
  const degrees = (remainingProgress / 100) * 360

  const size = 600
  const center = size / 2
  const radius = size * 0.45 

  const startAngle = -90 
  const endAngle = startAngle + degrees

  const startX = center + radius * Math.cos((startAngle * Math.PI) / 180)
  const startY = center + radius * Math.sin((startAngle * Math.PI) / 180)
  const endX = center + radius * Math.cos((endAngle * Math.PI) / 180)
  const endY = center + radius * Math.sin((endAngle * Math.PI) / 180)

  const largeArcFlag = degrees > 180 ? 1 : 0

  let pathD = ''
  if (degrees >= 359.9) {
    pathD = `
      M ${center} ${center - radius}
      A ${radius} ${radius} 0 1 1 ${center - 0.1} ${center - radius}
      A ${radius} ${radius} 0 1 1 ${center} ${center - radius}
      Z
    `
  } else if (degrees <= 0) {
    pathD = ''
  } else {
    pathD = `
      M ${center} ${center}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      Z
    `
  }

  const ticks = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const innerRadius = radius * 0.95
    const outerRadius = radius * 1.05
    const x1 = center + innerRadius * Math.cos(angle)
    const y1 = center + innerRadius * Math.sin(angle)
    const x2 = center + outerRadius * Math.cos(angle)
    const y2 = center + outerRadius * Math.sin(angle)
    return { x1, y1, x2, y2, key: i }
  })

  const minTicks = Array.from({ length: 60 }).map((_, i) => {
    if (i % 5 === 0) return null
    const angle = (i * 6 - 90) * (Math.PI / 180)
    const innerRadius = radius * 1.0
    const outerRadius = radius * 1.05
    const x1 = center + innerRadius * Math.cos(angle)
    const y1 = center + innerRadius * Math.sin(angle)
    const x2 = center + outerRadius * Math.cos(angle)
    const y2 = center + outerRadius * Math.sin(angle)
    return { x1, y1, x2, y2, key: i }
  }).filter(Boolean) as { x1: number, y1: number, x2: number, y2: number, key: number }[]

  return (
    <div className={cn("flex flex-col items-center justify-center w-full", className)}>
      <div className="relative w-full max-w-[50vh] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible drop-shadow-2xl">
          <circle cx={center} cy={center} r={radius} className="fill-timer-face stroke-border" strokeWidth="2" />
          
          {ticks.map(tick => (
            <line
              key={`h-${tick.key}`}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              className="stroke-timer-tick"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}

          {minTicks.map(tick => (
            <line
              key={`m-${tick.key}`}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              className="stroke-timer-tick/50"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}

          {pathD && (
            <path
              d={pathD}
              className={cn(
                "transition-all duration-1000 ease-linear",
                isWork ? "fill-timer-wedge" : "fill-timer-wedge-break",
                isPaused && "opacity-50"
              )}
            />
          )}

          <circle cx={center} cy={center} r="8" className="fill-foreground drop-shadow-md" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          {isPaused && (
            <div className="bg-background/80 backdrop-blur-md px-6 py-4 rounded-xl border border-border shadow-2xl flex flex-col items-center max-w-[80%] text-center transform scale-110">
              <span className="text-2xl font-bold uppercase tracking-widest text-primary mb-2">Paused</span>
              {pauseNote && (
                <div className="text-lg text-muted-foreground mt-2 font-medium">
                  "{pauseNote}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center space-y-4">
        <h2 className="text-6xl font-black tabular-nums tracking-tighter drop-shadow-sm">
          {timeLeft}
        </h2>
        <div className="text-2xl text-muted-foreground font-medium max-w-[80vw] text-center truncate px-4 py-2 bg-muted/50 rounded-full">
          {taskName || (isWork ? 'Work Session' : 'Break Session')}
        </div>
      </div>
    </div>
  )
}
