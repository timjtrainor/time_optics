'use client'

import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function BuildMyDayLoading() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 space-y-8"
    >
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Consulting your Agents...</h2>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 animate-pulse">📅 Scheduler</span>
          <span className="flex items-center gap-1 animate-pulse delay-75">🎯 Prioritizer</span>
          <span className="flex items-center gap-1 animate-pulse delay-150">🧠 Focus Coach</span>
        </div>
      </div>
    </motion.div>
  )
}
