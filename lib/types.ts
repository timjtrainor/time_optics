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
  defaultProvider?: AgentProvider
  defaultModel?: string
  agents?: Record<string, AgentConfig>
}

export interface AgentConfig {
  provider?: AgentProvider
  model?: string
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
  hardStopTriggered?: boolean
  extensionCount?: number
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
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
  DEFERRED = 'DEFERRED',
}

export enum EffortSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum TaskImpact {
  NEEDLE = 'NEEDLE',
  BUCKET = 'BUCKET',
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

export interface Objective {
  id: number
  title: string
  description?: string
  quarter?: string
  type: 'MOONSHOT' | 'ROOFSHOT'
  status: 'ACTIVE' | 'ACHIEVED' | 'PAUSED' | 'CLOSED'
  color?: string
  healthMetrics?: any
  createdAt: Date
  updatedAt: Date
  keyResults?: KeyResult[]
  initiatives?: Initiative[]
}

export interface KeyResult {
  id: number
  objectiveId: number
  metric: string
  description?: string
  unit: string
  direction: 'INCREASE' | 'DECREASE' | 'ACHIEVE'
  baselineValue: number
  currentValue: number
  targetValue: number
  confidence: number
  grade?: number
  targetDate?: Date
  createdAt: Date
  updatedAt: Date
  initiatives?: Initiative[]
}

export interface Initiative {
  id: number
  title: string
  description?: string
  hypothesis?: string
  objectiveId: number
  status: 'ACTIVE' | 'ON_HOLD' | 'ARCHIVED'
  priority: 'P0' | 'P1' | 'P2'
  dri?: string
  targetDate?: Date
  ambiguityLevel?: string
  keyUnknowns?: string[]
  createdAt: Date
  updatedAt: Date
  projects?: Project[]
  keyResults?: KeyResult[]
}

export interface Project {
  id: number
  title: string
  description?: string
  successCriteria?: string
  initiativeId?: number
  status: string
  priority: 'P0' | 'P1' | 'P2'
  dri?: string
  targetDate?: Date
  color?: string
  stakeholderGroupId?: number
  expectedImpact?: string
  actualImpact?: string
  isL6PromoMaterial?: boolean
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
  stakeholderGroup?: StakeholderGroup
  initiative?: Initiative
}

export interface Sprint {
  id: number
  name: string
  startDate: Date
  endDate: Date
  status: 'DRAFT' | 'PROPOSED' | 'ACTIVE' | 'CLOSED'
  aiSummary?: string
  capacityMinutes: number
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
}

export interface Task {
  id: number
  title: string
  context?: string
  status: TaskStatus
  size: EffortSize
  impact: TaskImpact
  actualMinutes: number
  isUnplanned: boolean
  sprintId?: number | null
  projectId?: number | null
  stakeholderGroupId?: number | null
  parentTaskId?: number | null
  captureResolvedId?: number | null
  createdAt: Date
  updatedAt: Date
  project?: Project
  stakeholderGroup?: StakeholderGroup
  sprint?: Sprint
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
