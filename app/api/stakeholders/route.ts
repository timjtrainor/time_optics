import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const groups = await prisma.stakeholderGroup.findMany({
      include: {
        tasks: true,
        projects: true,
      },
      orderBy: { name: 'asc' }
    })

    // Calculate time-allocation stats per group
    const stats = groups.map(group => {
      const totalMinutes = group.tasks.reduce((acc, t) => acc + (t.actualPomodoros * 25), 0)
      const ktloTasks = group.tasks.filter(t => t.taskType === 'KTLO')
      const strategicTasks = group.tasks.filter(t => t.taskType === 'STRATEGIC')
      
      const ktloMinutes = ktloTasks.reduce((acc, t) => acc + (t.actualPomodoros * 25), 0)
      const strategicMinutes = strategicTasks.reduce((acc, t) => acc + (t.actualPomodoros * 25), 0)

      return {
        ...group,
        stats: {
          totalMinutes,
          ktloPercent: totalMinutes > 0 ? Math.round((ktloMinutes / totalMinutes) * 100) : 0,
          strategicPercent: totalMinutes > 0 ? Math.round((strategicMinutes / totalMinutes) * 100) : 0,
          activeTaskCount: group.tasks.filter(t => t.status !== 'DONE').length
        }
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const group = await prisma.stakeholderGroup.create({ data })
    return NextResponse.json(group)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
