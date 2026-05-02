import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay } from 'date-fns'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')
  const date = dateStr ? startOfDay(new Date(dateStr)) : startOfDay(new Date())

  try {
    const dayPlan = await prisma.dayPlan.findUnique({
      where: { date }
    })
    return NextResponse.json(dayPlan)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const date = data.date ? startOfDay(new Date(data.date)) : startOfDay(new Date())
    
    const dayPlan = await prisma.dayPlan.upsert({
      where: { date },
      update: {
        meetingHours: data.meetingHours,
        energyLevel: data.energyLevel,
        availableFocusMinutes: data.availableFocusMinutes,
        scheduledTaskIds: data.scheduledTaskIds,
        captureInboxIds: data.captureInboxIds,
        aiScheduleSummary: data.aiScheduleSummary,
        aiFocusAdvice: data.aiFocusAdvice,
        interruptLog: data.interruptLog,
      },
      create: {
        date,
        meetingHours: data.meetingHours || 0,
        energyLevel: data.energyLevel || 'MEDIUM',
        availableFocusMinutes: data.availableFocusMinutes || 0,
        scheduledTaskIds: data.scheduledTaskIds || [],
        captureInboxIds: data.captureInboxIds || [],
        aiScheduleSummary: data.aiScheduleSummary || '',
        aiFocusAdvice: data.aiFocusAdvice || '',
        interruptLog: data.interruptLog || [],
      }
    })
    return NextResponse.json(dayPlan)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
