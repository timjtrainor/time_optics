import { create } from 'zustand'
import { Plan, TimerSession, ChatHistory } from './types'

interface TimeOpticsState {
  plan: Plan | null
  activeSession: TimerSession | null
  history: ChatHistory[]
  isLoading: boolean
  
  // Actions
  fetchPlan: (date: Date) => Promise<void>
  updatePlan: (date: Date, content: string, preferences?: any) => Promise<void>
  fetchActiveSession: () => Promise<void>
  startTimer: (content: string, type: string, sessionId: string) => Promise<void>
  completeTimer: (sessionId: string, endType: string) => Promise<void>
  pauseTimer: (sessionId: string, pauseNote: string, accumulatedElapsedMs: number) => Promise<void>
  resumeTimer: (sessionId: string, accumulatedElapsedMs: number) => Promise<void>
  extendTimer: (sessionId: string, minutes: number) => Promise<void>
  updateHeartbeat: (sessionId: string) => Promise<void>
  fetchHistory: (type: string, limit?: number) => Promise<void>
  saveHistory: (type: string, input: any, output: any, title: string, metadata?: any) => Promise<void>
}

export const useStore = create<TimeOpticsState>((set, get) => ({
  plan: null,
  activeSession: null,
  history: [],
  isLoading: false,

  fetchPlan: async (date) => {
    set({ isLoading: true })
    const res = await fetch(`/api/db/plans?date=${date.toISOString()}`)
    const plan = await res.json()
    set({ plan, isLoading: false })
  },

  updatePlan: async (date, content, preferences) => {
    const res = await fetch('/api/db/plans', {
      method: 'POST',
      body: JSON.stringify({ date: date.toISOString(), content, preferences })
    })
    const plan = await res.json()
    set({ plan })
  },

  fetchActiveSession: async () => {
    const res = await fetch('/api/db/timer')
    const activeSession = await res.json()
    set({ activeSession })
  },

  startTimer: async (content, type, sessionId) => {
    const res = await fetch('/api/db/timer', {
      method: 'POST',
      body: JSON.stringify({ action: 'start', content, type, sessionId, duration: type === 'work' ? 25 : 5 })
    })
    const activeSession = await res.json()
    set({ activeSession })
  },

  completeTimer: async (sessionId, endType) => {
    await fetch('/api/db/timer', {
      method: 'POST',
      body: JSON.stringify({ action: 'complete', sessionId, endType })
    })
    set({ activeSession: null })
  },

  pauseTimer: async (sessionId: string, pauseNote: string, accumulatedElapsedMs: number) => {
    const res = await fetch('/api/db/timer', {
      method: 'POST',
      body: JSON.stringify({ action: 'pause', sessionId, pauseNote, accumulatedElapsedMs })
    })
    const activeSession = await res.json()
    set({ activeSession })
  },

  resumeTimer: async (sessionId: string, accumulatedElapsedMs: number) => {
    const res = await fetch('/api/db/timer', {
      method: 'POST',
      body: JSON.stringify({ action: 'resume', sessionId, accumulatedElapsedMs })
    })
    const activeSession = await res.json()
    set({ activeSession })
  },

  extendTimer: async (sessionId: string, minutes: number) => {
    const res = await fetch('/api/db/timer', {
      method: 'POST',
      body: JSON.stringify({ action: 'extend', sessionId, minutes })
    })
    const activeSession = await res.json()
    set({ activeSession })
  },

  updateHeartbeat: async (sessionId) => {
    await fetch('/api/db/timer', {
      method: 'POST',
      body: JSON.stringify({ action: 'heartbeat', sessionId })
    })
  },

  fetchHistory: async (type, limit = 5) => {
    const res = await fetch(`/api/db/history?type=${type}&limit=${limit}`)
    const history = await res.json()
    set({ history })
  },

  saveHistory: async (type, input, output, title, metadata) => {
    const res = await fetch('/api/db/history', {
      method: 'POST',
      body: JSON.stringify({ type, input, output, title, metadata })
    })
    const newEntry = await res.json()
    set((state) => ({ history: [newEntry, ...state.history].slice(0, 10) }))
  }
}))
