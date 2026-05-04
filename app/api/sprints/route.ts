import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  try {
    const sprints = await prisma.sprint.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      orderBy: { startDate: 'desc' },
      include: {
        tasks: {
          include: {
            project: true,
            stakeholderGroup: true
          }
        }
      }
    })
    return NextResponse.json(sprints)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const sprint = await prisma.sprint.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'DRAFT',
        aiSummary: data.aiSummary,
        capacityMinutes: data.capacityMinutes || 2400,
      }
    })
    return NextResponse.json(sprint)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
