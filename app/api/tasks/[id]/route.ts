import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const id = parseInt(rawId)
  try {
    const data = await req.json()
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
      }
    })
    return NextResponse.json(task)
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
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
