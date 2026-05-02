export interface Plan {
  id?: number
  content: string
  date: Date
  lastUpdated: Date
  preferences?: PlanPreferences
}

export interface PlanPreferences {
  workingHours: {
    start: number
    end: number
  }
  openRouterKey?: string
  ollamaEndpoint?: string
  baseURL?: string
  model?: string
  agents?: Record<string, AgentConfig>
}

export interface AgentConfig {
  provider: AgentProvider
  model: string
}

export enum AgentProvider {
  OPENROUTER = 'openrouter',
  OLLAMA = 'ollama',
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

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
  DEFERRED = 'DEFERRED',
}

export enum TaskPriority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
}

export enum MoscowClass {
  MUST = 'MUST',
  SHOULD = 'SHOULD',
  COULD = 'COULD',
  WONT = 'WONT',
}

export enum EffortSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum TaskType {
  STRATEGIC = 'STRATEGIC',
  KTLO = 'KTLO',
  INTERRUPT = 'INTERRUPT',
  ADMIN = 'ADMIN',
}

export enum StakeholderType {
  ENGINEERING = 'ENGINEERING',
  DATA = 'DATA',
  DESIGN = 'DESIGN',
  LEADERSHIP = 'LEADERSHIP',
  EXTERNAL = 'EXTERNAL',
  PARTNER = 'PARTNER',
}

export enum EnergyLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface OKR {
  id: number
  title: string
  description?: string
  targetDate?: Date
  status: 'ACTIVE' | 'ACHIEVED' | 'PAUSED'
  successMetric?: string
  color?: string
  createdAt: Date
  updatedAt: Date
  initiatives?: Initiative[]
}

export interface Initiative {
  id: number
  title: string
  description?: string
  okrId: number
  status: 'ACTIVE' | 'ON_HOLD' | 'ARCHIVED'
  targetDate?: Date
  color?: string
  createdAt: Date
  updatedAt: Date
  projects?: Project[]
}

export interface Project {
  id: number
  title: string
  description?: string
  initiativeId?: number
  status: string
  targetDate?: Date
  color?: string
  stakeholderGroupId?: number
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
  stakeholderGroup?: StakeholderGroup
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  moscowClass?: MoscowClass
  effort?: EffortSize
  estimatedPomodoros: number
  actualPomodoros: number
  dueDate?: Date
  scheduledDate?: Date
  completedAt?: Date
  tags: string[]
  projectId?: number
  stakeholderGroupId?: number
  taskType: TaskType
  aiGenerated: boolean
  aiReasoning?: string
  sortOrder: number
  parentTaskId?: number
  createdAt: Date
  updatedAt: Date
  project?: Project
  stakeholderGroup?: StakeholderGroup
}

export interface StakeholderGroup {
  id: number
  name: string
  description?: string
  color?: string
  type: StakeholderType
  slackChannel?: string
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
  projects?: Project[]
  stats?: any
}

export interface DayPlan {
  id: number
  date: Date
  meetingHours: number
  energyLevel: EnergyLevel
  availableFocusMinutes: number
  scheduledTaskIds?: number[]
  captureInboxIds?: number[]
  aiScheduleSummary?: string
  aiFocusAdvice?: string
  interruptLog?: any
  createdAt: Date
  updatedAt: Date
}

export interface CaptureItem {
  id: number
  rawText: string
  processed: boolean
  resolvedTaskId?: number
  createdAt: Date
  updatedAt: Date
}
