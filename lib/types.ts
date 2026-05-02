export interface Plan {
  id?: number
  content: string
  date: Date
  lastUpdated: Date
  preferences?: {
    workingHours: {
      start: number
      end: number
    }
    openRouterKey?: string
    baseURL?: string
    model?: string
  }
}

export enum TimerType {
  WORK = 'work',
  BREAK = 'break',
}

export enum TimerEndType {
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
  ABANDONED = 'abandoned',
}

export interface TimerSession {
  id?: number
  type: TimerType
  content?: string
  startTime: Date
  endTime?: Date
  duration: number
  endType?: TimerEndType
  sessionId: string
  lastHeartbeat: Date
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED'
  pauseNote?: string | null
  accumulatedElapsedMs: number
  pausedAt?: Date | null
}

export interface ChatHistory<TInput = unknown, TOutput = unknown> {
  id?: number
  input: TInput
  output: TOutput
  timestamp: Date
  type: string
  title: string
  metadata?: Record<string, unknown>
}
