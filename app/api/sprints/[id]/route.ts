import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const id = parseInt(rawId)
  try {
    const sprint = await prisma.sprint.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            project: true,
            stakeholderGroup: true
          }
        }
      }
    })
    return NextResponse.json(sprint)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const id = parseInt(rawId)
  try {
    const data = await req.json()
    
    // If starting a sprint, close all others first
    if (data.status === 'ACTIVE') {
      await prisma.sprint.updateMany({
        where: { status: 'ACTIVE', id: { not: id } },
        data: { status: 'CLOSED' }
      })
      
      // Also, update all tasks in this sprint to 'TODO' if they are 'BACKLOG'
      await prisma.task.updateMany({
        where: { sprintId: id, status: 'BACKLOG' },
        data: { status: 'TODO' }
      })
    }

    const sprint = await prisma.sprint.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      }
    })
    return NextResponse.json(sprint)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const id = parseInt(rawId)
  try {
    await prisma.sprint.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
