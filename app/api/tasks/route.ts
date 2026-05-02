import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { TaskStatus, TaskPriority, TaskType, MoscowClass, EffortSize } from '@/lib/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const stakeholderId = searchParams.get('stakeholderId')
  const type = searchParams.get('type')

  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId: parseInt(projectId) }),
        ...(status && { status: status as TaskStatus }),
        ...(priority && { priority: priority as TaskPriority }),
        ...(stakeholderId && { stakeholderGroupId: parseInt(stakeholderId) }),
        ...(type && { taskType: type as TaskType }),
      },
      orderBy: [
        { priority: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        project: true,
        stakeholderGroup: true,
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
        description: data.description,
        status: data.status || TaskStatus.TODO,
        priority: data.priority || TaskPriority.P2,
        moscowClass: data.moscowClass || MoscowClass.SHOULD,
        effort: data.effort || EffortSize.M,
        estimatedPomodoros: data.estimatedPomodoros || 1,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        tags: data.tags || [],
        projectId: data.projectId ? parseInt(data.projectId) : null,
        stakeholderGroupId: data.stakeholderGroupId ? parseInt(data.stakeholderGroupId) : null,
        taskType: data.taskType || TaskType.STRATEGIC,
        aiGenerated: data.aiGenerated || false,
        aiReasoning: data.aiReasoning || null,
        sortOrder: data.sortOrder || 0,
        parentTaskId: data.parentTaskId ? parseInt(data.parentTaskId) : null,
        captureResolvedId: data.captureResolvedId || null,
      }
    })
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
