import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string(),
  context: z.string().optional(),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL']),
  impact: z.enum(['NEEDLE', 'BUCKET']),
  projectId: z.number().nullable().optional(),
  stakeholderGroupId: z.number().nullable().optional(),
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
