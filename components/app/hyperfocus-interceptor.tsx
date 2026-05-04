'use client'

import { Brain, ArrowRight, Target } from 'lucide-react'
import { Button } from '../ui/button'

interface HyperfocusInterceptorProps {
  onStop: () => void
  onExtend: () => void
}

export function HyperfocusInterceptor({ onStop, onExtend }: HyperfocusInterceptorProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-xl">
      <div className="max-w-md w-full p-8 rounded-3xl bg-destructive/10 border-2 border-destructive shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
          <Brain className="h-10 w-10 text-destructive animate-pulse" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-destructive mb-4">
          Hyperfocus Intercepted
        </h2>
        <p className="text-lg font-medium text-foreground mb-2">
          You are 20% over your estimated time.
        </p>
        <p className="text-muted-foreground mb-8">
          Are you stuck on an 'Endless Unblocking' task or tactical details? Is this still a high-leverage problem?
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Button 
            size="lg" 
            variant="destructive" 
            className="w-full text-lg h-14"
            onClick={onStop}
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Capture & Move On
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full text-lg h-14 border-destructive/30 hover:bg-destructive/10"
            onClick={onExtend}
          >
            <Target className="mr-2 h-5 w-5" />
            This is Strategic (Extend 5m)
          </Button>
        </div>
      </div>
    </div>
  )
}
