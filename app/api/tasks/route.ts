import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { TaskStatus, EffortSize } from '@/lib/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const sprintId = searchParams.get('sprintId')
  const stakeholderId = searchParams.get('stakeholderId')
  const impact = searchParams.get('impact')

  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId: parseInt(projectId) }),
        ...(status && { status: status as TaskStatus }),
        ...(sprintId && { sprintId: parseInt(sprintId) }),
        ...(stakeholderId && { stakeholderGroupId: parseInt(stakeholderId) }),
        ...(impact && { impact: impact as any }),
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      include: {
        project: true,
        stakeholderGroup: true,
        sprint: true,
      }
    })
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const task = await prisma.task.create({
      data: {
        title: data.title,
        context: data.context,
        status: data.status || TaskStatus.BACKLOG,
        size: data.size || EffortSize.M,
        impact: data.impact || 'BUCKET',
        actualMinutes: data.actualMinutes || 0,
        isUnplanned: data.isUnplanned || false,
        sprintId: data.sprintId ? parseInt(data.sprintId) : null,
        projectId: data.projectId ? parseInt(data.projectId) : null,
        stakeholderGroupId: data.stakeholderGroupId ? parseInt(data.stakeholderGroupId) : null,
        parentTaskId: data.parentTaskId ? parseInt(data.parentTaskId) : null,
        captureResolvedId: data.captureResolvedId || null,
      }
    })
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
