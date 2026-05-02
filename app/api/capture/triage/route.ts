import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateObject } from 'ai'
import { getAgentModel } from '@/lib/ai'
import { z } from 'zod'

export async function POST() {
  try {
    const items = await prisma.captureItem.findMany({
      where: { processed: false }
    })

    if (items.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    const model = getAgentModel('prioritizer', null)
    
    const { object } = await generateObject({
      model: model as any,
      schema: z.object({
        tasks: z.array(z.object({
          originalId: z.number(),
          title: z.string(),
          priority: z.enum(['P0', 'P1', 'P2', 'P3']),
          taskType: z.enum(['STRATEGIC', 'KTLO', 'INTERRUPT', 'ADMIN']),
          description: z.string().optional(),
        }))
      }),
      prompt: `You are an expert Chief of Staff. Triage the following capture items into actionable tasks.
      Items:
      ${items.map(i => `ID ${i.id}: ${i.rawText}`).join('\n')}
      `
    })

    // Create tasks and mark items as processed
    for (const taskData of object.tasks) {
      await prisma.$transaction([
        prisma.task.create({
          data: {
            title: taskData.title,
            priority: taskData.priority,
            taskType: taskData.taskType,
            description: taskData.description,
            captureResolvedId: taskData.originalId,
            aiGenerated: true
          }
        }),
        prisma.captureItem.update({
          where: { id: taskData.originalId },
          data: { processed: true }
        })
      ])
    }

    return NextResponse.json({ success: true, processed: object.tasks.length })
  } catch (error) {
    console.error('Triage error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
