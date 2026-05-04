import { getAgentModel } from '@/lib/ai'
import prisma from '@/lib/prisma'
import { generateObject } from 'ai'
import { startOfDay } from 'date-fns'
import { z } from 'zod'

export const maxDuration = 30

const unblockerSchema = z.object({
  slackDraft: z.string(),
  sop: z.string().optional(),
  recommendedAction: z.string(),
})

export async function POST(req: Request) {
  try {
    const { taskId, rawInput } = await req.json()
    
    const latestPlan = await prisma.plan.findFirst({
      orderBy: { date: 'desc' }
    })
    const preferences = latestPlan?.preferences ? (latestPlan.preferences as any) : null

    const model = getAgentModel('unblocker', preferences)

    let taskContext = ""
    if (taskId && typeof taskId === 'string') {
      let actualTaskId: number | null = null
      
      if (taskId.startsWith('task-')) {
        const parts = taskId.split('-')
        if (parts.length >= 2) {
          const parsed = parseInt(parts[1])
          if (!isNaN(parsed)) actualTaskId = parsed
        }
      } else {
        const parsed = parseInt(taskId)
        if (!isNaN(parsed)) actualTaskId = parsed
      }

      if (actualTaskId !== null) {
        const task = await prisma.task.findUnique({ where: { id: actualTaskId } })
        if (task) {
          taskContext = `Task Title: ${task.title}\nContext: ${task.context || 'N/A'}`
        }
      }
    }

    const result = await generateObject({
      model: model as any,
      schema: unblockerSchema,
      prompt: `You are the "Unblocker / Delegation" AI Agent acting on behalf of a Google L6 (Senior PM).
The PM is currently stuck doing "Endless Unblocking" tasks, which pulls them away from strategy.

Your job is to take the raw dictation from the PM on HOW to unblock an issue, and generate:
1. 'communicationDraft': A concise, professional Slack or email draft to the team/individual that empowers THEM to unblock themselves now.
2. 'sopDraft': If applicable, a short Standard Operating Procedure (SOP) bullet list that the PM can add to the team wiki so this issue doesn't come back to the PM next time.
3. 'recommendedAction': A one-sentence recommendation for the PM to close this loop.

Context of the task:
${taskContext}

Raw PM dictation:
"""
${rawInput}
"""
      `,
    })

    const data = result.object

    return Response.json({ success: true, data })

  } catch (error: any) {
    console.error('Unblocker Agent Error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
