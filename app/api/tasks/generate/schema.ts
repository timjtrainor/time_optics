import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  moscowClass: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT']),
  effort: z.enum(['XS', 'S', 'M', 'L', 'XL']),
  estimatedPomodoros: z.number(),
  taskType: z.enum(['STRATEGIC', 'KTLO', 'INTERRUPT', 'ADMIN']),
  projectSlug: z.string().optional(),
  stakeholderGroupSlug: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  aiReasoning: z.string().optional(),
})

export const generatePlanSchema = z.object({
  reasoning: z.string(),
  tasks: z.array(taskSchema),
  backlog: z.array(taskSchema),
  moscowDistribution: z.object({
    must: z.number(),
    should: z.number(),
    could: z.number(),
    wont: z.number(),
  }),
  notes: z.string(),
})
