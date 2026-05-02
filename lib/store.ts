import { create } from 'zustand'
import { toast } from 'sonner'
import { 
  Plan, 
  TimerSession, 
  ChatHistory, 
  Task, 
  OKR, 
  Initiative,
  Project,
  StakeholderGroup, 
  CaptureItem, 
  DayPlan,
  TaskStatus
} from './types'

interface TimeOpticsState {
  plan: Plan | null
  activeSession: TimerSession | null
  history: ChatHistory[]
  tasks: Task[]
  okrs: OKR[]
  projects: Project[]
  stakeholderGroups: StakeholderGroup[]
  captureItems: CaptureItem[]
  dayPlan: DayPlan | null
  isLoading: boolean
  sidebarCollapsed: boolean
  
  // Existing Actions
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

  // New Actions
  fetchTasks: (filters?: any) => Promise<void>
  createTask: (data: Partial<Task>) => Promise<void>
  updateTask: (id: number, data: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  
  fetchGoals: () => Promise<void>
  fetchProjects: () => Promise<void>
  createGoal: (type: string, data: Partial<OKR | Project | Initiative>) => Promise<void>
  
  fetchStakeholders: () => Promise<void>
  createStakeholder: (data: Partial<StakeholderGroup>) => Promise<void>
  
  fetchCaptureItems: () => Promise<void>
  createCaptureItem: (rawText: string) => Promise<void>
  deleteCaptureItem: (id: number) => Promise<void>
  
  fetchDayPlan: (date: Date) => Promise<void>
  updateDayPlan: (date: Date, data: Partial<DayPlan>) => Promise<void>
  toggleSidebar: () => void
}

export const useStore = create<TimeOpticsState>((set, get) => ({
  plan: null,
  activeSession: null,
  history: [],
  tasks: [],
  okrs: [],
  projects: [],
  stakeholderGroups: [],
  captureItems: [],
  dayPlan: null,
  isLoading: false,
  sidebarCollapsed: false,

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
  },

  fetchTasks: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const res = await fetch(`/api/tasks?${params}`)
    const tasks = await res.json()
    set({ tasks })
  },

  createTask: async (data: Partial<Task>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create task')
      const newTask = await res.json()
      set(state => ({ tasks: [newTask, ...state.tasks] }))
    } catch (error) {
      toast.error('Failed to create task')
    }
  },

  updateTask: async (id: number, data: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update task')
      const updatedTask = await res.json()
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t)
      }))
    } catch (error) {
      toast.error('Failed to update task')
    }
  },

  deleteTask: async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete task')
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id)
      }))
    } catch (error) {
      toast.error('Failed to delete task')
    }
  },

  fetchGoals: async () => {
    const res = await fetch('/api/goals')
    const okrs = await res.json()
    set({ okrs })
  },

  createGoal: async (type: string, data: Partial<OKR | Project | Initiative>) => {
    try {
      const res = await fetch(`/api/goals?type=${type}`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create goal')
      const newGoal = await res.json()
      if (type === 'okr') set(state => ({ okrs: [newGoal, ...state.okrs] }))
      else get().fetchGoals()
    } catch (error) {
      toast.error('Failed to create goal')
    }
  },

  fetchStakeholders: async () => {
    const res = await fetch('/api/stakeholders')
    const stakeholderGroups = await res.json()
    set({ stakeholderGroups })
  },

  createStakeholder: async (data: Partial<StakeholderGroup>) => {
    try {
      const res = await fetch('/api/stakeholders', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create stakeholder group')
      const newGroup = await res.json()
      set(state => ({ stakeholderGroups: [newGroup, ...state.stakeholderGroups] }))
    } catch (error) {
      toast.error('Failed to create stakeholder group')
    }
  },

  fetchCaptureItems: async () => {
    const res = await fetch('/api/capture')
    const captureItems = await res.json()
    set({ captureItems })
  },

  createCaptureItem: async (rawText: string) => {
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        body: JSON.stringify({ rawText })
      })
      if (!res.ok) throw new Error('Failed to capture item')
      const newItem = await res.json()
      set(state => ({ captureItems: [newItem, ...state.captureItems] }))
    } catch (error) {
      toast.error('Failed to capture item')
    }
  },
  deleteCaptureItem: async (id: number) => {
    try {
      const res = await fetch(`/api/capture?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete capture item')
      set(state => ({
        captureItems: state.captureItems.filter(item => item.id !== id)
      }))
    } catch (error) {
      toast.error('Failed to delete capture item')
    }
  },

  fetchDayPlan: async (date) => {
    // Need API for DayPlan, but for now we might use Plan or create a new one
    // Let's assume we have /api/dayplan
    const res = await fetch(`/api/dayplan?date=${date.toISOString()}`)
    const dayPlan = await res.json()
    set({ dayPlan })
  },

  updateDayPlan: async (date: Date, data: Partial<DayPlan>) => {
    try {
      const res = await fetch('/api/dayplan', {
        method: 'POST',
        body: JSON.stringify({ date: date.toISOString(), ...data })
      })
      if (!res.ok) throw new Error('Failed to update day plan')
      const dayPlan = await res.json()
      set({ dayPlan })
    } catch (error) {
      toast.error('Failed to update day plan')
    }
  },

  fetchProjects: async () => {
    const res = await fetch('/api/goals?type=project')
    const projects = await res.json()
    set({ projects })
  },

  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}))
