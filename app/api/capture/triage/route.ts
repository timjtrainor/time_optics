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

    const latestPlan = await prisma.plan.findFirst({
      orderBy: { date: 'desc' }
    })
    const preferences = latestPlan?.preferences ? (latestPlan.preferences as any) : null

    const model = getAgentModel('prioritizer', preferences)
    
    const { object } = await generateObject({
      model: model as any,
      schema: z.object({
        tasks: z.array(z.object({
          originalId: z.number(),
          title: z.string(),
          size: z.enum(['XS', 'S', 'M', 'L', 'XL']),
          impact: z.enum(['NEEDLE', 'BUCKET']),
          context: z.string().optional(),
        }))
      }),
      prompt: `You are an expert Chief of Staff. Triage the following capture items into actionable tasks.
      
      Size mapping:
      XS: <15m, S: 30m, M: 1h, L: 2h, XL: 4h+
      
      Impact mapping:
      NEEDLE: Strategic, high-leverage, or derisking work.
      BUCKET: Maintenance, KTLO, or administrative work.
      
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
            size: taskData.size as any,
            impact: taskData.impact as any,
            context: taskData.context,
            captureResolvedId: taskData.originalId,
            status: 'BACKLOG'
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
