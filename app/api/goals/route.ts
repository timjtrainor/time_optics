import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // okr, initiative, project

  try {
    if (type === 'okr') {
      const okrs = await prisma.oKR.findMany({
        include: { initiatives: { include: { projects: true } } },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(okrs)
    }
    
    if (type === 'initiative') {
      const initiatives = await prisma.initiative.findMany({
        include: { projects: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(initiatives)
    }

    if (type === 'project') {
      const projects = await prisma.project.findMany({
        include: { stakeholderGroup: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(projects)
    }

    // Default: return full hierarchy
    const okrs = await prisma.oKR.findMany({
      include: { 
        initiatives: { 
          include: { 
            projects: {
              include: { tasks: { where: { status: 'DONE' } } }
            } 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(okrs)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  try {
    const data = await req.json()
    if (type === 'okr') {
      const okr = await prisma.oKR.create({ data })
      return NextResponse.json(okr)
    }
    if (type === 'initiative') {
      const initiative = await prisma.initiative.create({ data })
      return NextResponse.json(initiative)
    }
    if (type === 'project') {
      const project = await prisma.project.create({ data })
      return NextResponse.json(project)
    }
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
