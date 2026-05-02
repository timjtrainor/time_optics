import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay } from 'date-fns'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')
  
  if (!dateStr) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  const date = startOfDay(new Date(dateStr))
  
  try {
    const plan = await prisma.plan.findUnique({
      where: { date }
    })
    return NextResponse.json(plan)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { date, content, preferences } = body
    
    const normalizedDate = startOfDay(new Date(date))
    
    const plan = await prisma.plan.upsert({
      where: { date: normalizedDate },
      update: { content, preferences, lastUpdated: new Date() },
      create: { date: normalizedDate, content, preferences }
    })
    
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error saving plan:', error)
    return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 })
  }
}
