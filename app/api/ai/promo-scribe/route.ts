import { getAgentModel } from '@/lib/ai'
import prisma from '@/lib/prisma'
import { generateObject } from 'ai'
import { startOfDay } from 'date-fns'
import { z } from 'zod'

export const maxDuration = 60 // Allow more time for synthesis

const promoSchema = z.object({
  starBulletPoint: z.string(),
  updatedActualImpact: z.string(),
})

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json()
    
    const latestPlan = await prisma.plan.findFirst({
      orderBy: { date: 'desc' }
    })
    const preferences = latestPlan?.preferences ? (latestPlan.preferences as any) : null

    const model = getAgentModel('promo-scribe', preferences)

    const project = await prisma.project.findUnique({ 
      where: { id: projectId },
      include: {
        tasks: {
          where: {
            status: 'DONE',
            impact: 'NEEDLE'
          }
        }
      }
    })

    if (!project) {
      return Response.json({ success: false, error: "Project not found" }, { status: 404 })
    }

    if (project.tasks.length === 0) {
       return Response.json({ 
         success: false, 
         error: "No completed high-impact tasks found. Only tasks with status 'DONE' and Impact 'NEEDLE' are considered for promo drafts." 
       }, { status: 400 })
    }

    const taskSummaries = project.tasks.map(t => `- ${t.title} (${t.impact}): ${t.context || 'No description'}`).join('\n')

    const result = await generateObject({
      model: model as any,
      schema: promoSchema,
      prompt: `You are the "Promo Scribe" AI Agent acting on behalf of a Google PM moving towards L6 (Senior PM).
Your job is to read the completed high-impact tasks for a given project, and generate a STAR (Situation, Task, Action, Result) format bullet point suitable for a promotion packet.

Project Context:
Title: ${project.title}
Expected Impact: ${project.expectedImpact || 'N/A'}
Current Actual Impact: ${project.actualImpact || 'N/A'}

Completed High-Impact Tasks:
${taskSummaries}

Generate:
1. 'starBulletPoint': A concise, data-driven STAR format bullet point summarizing the achievements.
2. 'updatedActualImpact': A synthesis combining the new STAR bullet point with any existing 'Current Actual Impact' text.
      `,
    })

    const data = result.object

    await prisma.project.update({
      where: { id: projectId },
      data: {
        actualImpact: data.updatedActualImpact,
        isL6PromoMaterial: true // Auto-flag as promo material
      }
    })

    return Response.json({ success: true, data })

  } catch (error: any) {
    console.error('Promo Scribe Error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
