import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // objective, keyresult, initiative, project

  try {
    if (type === 'objective') {
      const objectives = await prisma.objective.findMany({
        include: { 
          keyResults: { 
            include: { initiatives: { include: { initiative: true } } } 
          },
          initiatives: { include: { projects: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(objectives)
    }
    
    if (type === 'keyresult') {
      const krs = await prisma.keyResult.findMany({
        include: { initiatives: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(krs)
    }

    if (type === 'initiative') {
      const initiatives = await prisma.initiative.findMany({
        include: { projects: true, keyResults: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(initiatives)
    }

    if (type === 'project') {
      const projects = await prisma.project.findMany({
        include: { stakeholderGroup: true, initiative: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(projects)
    }

    // Default: return full hierarchy for Strategic Priorities view
    const objectives = await prisma.objective.findMany({
      include: { 
        keyResults: { 
          include: { 
            initiatives: { 
              include: { 
                initiative: { 
                  include: { 
                    projects: {
                      include: { tasks: true }
                    } 
                  } 
                } 
              } 
            } 
          } 
        },
        initiatives: {
          include: {
            projects: {
              include: { tasks: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(objectives)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  try {
    const data = await req.json()
    console.log(`[API] Creating ${type}:`, data)

    if (type === 'objective') {
      const objective = await prisma.objective.create({ data })
      return NextResponse.json(objective)
    }
    if (type === 'keyresult') {
      const { initiativeId, objectiveId, ...krData } = data
      if (!objectiveId) throw new Error('objectiveId is required for Key Result')
      
      const kr = await prisma.keyResult.create({
        data: {
          ...krData,
          objectiveId: parseInt(objectiveId.toString()),
          ...(initiativeId && {
            initiatives: {
              create: { initiativeId: parseInt(initiativeId.toString()) }
            }
          })
        }
      })
      return NextResponse.json(kr)
    }
    if (type === 'initiative') {
      const { keyResultIds, objectiveId, ...initiativeData } = data
      if (!objectiveId) throw new Error('objectiveId is required for Initiative')

      const initiative = await prisma.initiative.create({
        data: {
          ...initiativeData,
          objectiveId: parseInt(objectiveId.toString()),
          ...(keyResultIds && keyResultIds.length > 0 && {
            keyResults: {
              create: keyResultIds.map((id: any) => ({ keyResultId: parseInt(id.toString()) }))
            }
          })
        }
      })
      return NextResponse.json(initiative)
    }
    if (type === 'project') {
      const { initiativeId, stakeholderGroupId, ...projectData } = data
      const project = await prisma.project.create({
        data: {
          ...projectData,
          initiativeId: initiativeId ? parseInt(initiativeId.toString()) : null,
          stakeholderGroupId: stakeholderGroupId ? parseInt(stakeholderGroupId.toString()) : null,
        }
      })
      return NextResponse.json(project)
    }
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error(`[API] Failed to create ${type}:`, error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = parseInt(searchParams.get('id') || '')

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

  try {
    const data = await req.json()
    let result
    
    switch (type) {
      case 'objective':
        result = await prisma.objective.update({ where: { id }, data })
        break
      case 'keyresult':
        result = await prisma.keyResult.update({ where: { id }, data })
        break
      case 'initiative':
        result = await prisma.initiative.update({ where: { id }, data })
        break
      case 'project':
        result = await prisma.project.update({ where: { id }, data })
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = parseInt(searchParams.get('id') || '')

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

  try {
    switch (type) {
      case 'objective':
        await prisma.objective.delete({ where: { id } })
        break
      case 'keyresult':
        await prisma.keyResult.delete({ where: { id } })
        break
      case 'initiative':
        await prisma.initiative.delete({ where: { id } })
        break
      case 'project':
        await prisma.project.delete({ where: { id } })
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
