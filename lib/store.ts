import { create } from 'zustand'
import { toast } from 'sonner'
import { 
  Plan, 
  TimerSession, 
  ChatHistory, 
  Task, 
  Objective,
  KeyResult,
  Initiative,
  Project,
  StakeholderGroup, 
  CaptureItem, 
  DayPlan,
  TaskStatus,
  Sprint
} from './types'

interface TimeOpticsState {
  plan: Plan | null
  activeSession: TimerSession | null
  history: ChatHistory[]
  tasks: Task[]
  objectives: Objective[]
  projects: Project[]
  stakeholderGroups: StakeholderGroup[]
  captureItems: CaptureItem[]
  dayPlan: DayPlan | null
  sprints: Sprint[]
  activeSprint: Sprint | null
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

  // Sprint Actions
  fetchSprints: (filters?: any) => Promise<void>
  createSprint: (data: Partial<Sprint>) => Promise<void>
  updateSprint: (id: number, data: Partial<Sprint>) => Promise<void>
  startSprint: (id: number) => Promise<void>
  
  // New Actions
  fetchTasks: (filters?: any) => Promise<void>
  createTask: (data: Partial<Task>) => Promise<void>
  updateTask: (id: number, data: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  
  fetchObjectives: () => Promise<void>
  fetchProjects: () => Promise<void>
  createGoal: (type: string, data: any) => Promise<void>
  updateGoal: (type: string, id: number, data: any) => Promise<void>
  deleteGoal: (type: string, id: number) => Promise<void>
  
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
  objectives: [],
  projects: [],
  stakeholderGroups: [],
  captureItems: [],
  dayPlan: null,
  sprints: [],
  activeSprint: null,
  isLoading: false,
  sidebarCollapsed: false,

  fetchSprints: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const res = await fetch(`/api/sprints?${params}`)
    const sprints = await res.json()
    set({ 
      sprints,
      activeSprint: sprints.find((s: Sprint) => s.status === 'ACTIVE') || null
    })
  },

  createSprint: async (data) => {
    const res = await fetch('/api/sprints', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    const sprint = await res.json()
    set(state => ({ sprints: [...state.sprints, sprint] }))
  },

  updateSprint: async (id, data) => {
    const res = await fetch(`/api/sprints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
    const updated = await res.json()
    set(state => ({
      sprints: state.sprints.map(s => s.id === id ? updated : s),
      activeSprint: updated.status === 'ACTIVE' ? updated : (state.activeSprint?.id === id ? null : state.activeSprint)
    }))
  },

  startSprint: async (id) => {
    // Specifically sets status to ACTIVE and updates UI
    const res = await fetch(`/api/sprints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACTIVE' })
    })
    const updated = await res.json()
    set(state => ({
      sprints: state.sprints.map(s => s.id === id ? updated : s.status === 'ACTIVE' ? { ...s, status: 'CLOSED' } : s),
      activeSprint: updated
    }))
    toast.success('Sprint started! Focus mode engaged.')
  },

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

  fetchObjectives: async () => {
    const res = await fetch('/api/goals')
    const objectives = await res.json()
    set({ objectives })
  },

  fetchProjects: async () => {
    const res = await fetch('/api/goals?type=project')
    const projects = await res.json()
    set({ projects })
  },

  createGoal: async (type, data) => {
    try {
      const res = await fetch(`/api/goals?type=${type}`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error(`Failed to create ${type}`)
      await get().fetchObjectives()
      toast.success(`${type} created successfully`)
    } catch (error) {
      toast.error(`Failed to create ${type}`)
    }
  },

  updateGoal: async (type, id, data) => {
    try {
      const res = await fetch(`/api/goals?type=${type}&id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error(`Failed to update ${type}`)
      await get().fetchObjectives()
      toast.success(`${type} updated successfully`)
    } catch (error) {
      toast.error(`Failed to update ${type}`)
    }
  },

  deleteGoal: async (type, id) => {
    try {
      const res = await fetch(`/api/goals?type=${type}&id=${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(`Failed to delete ${type}`)
      await get().fetchObjectives()
      toast.success(`${type} deleted successfully`)
    } catch (error) {
      toast.error(`Failed to delete ${type}`)
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

  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}))
