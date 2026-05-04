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
      const totalMinutes = group.tasks.reduce((acc, t) => acc + t.actualMinutes, 0)
      const bucketTasks = group.tasks.filter(t => t.impact === 'BUCKET')
      const needleTasks = group.tasks.filter(t => t.impact === 'NEEDLE')
      
      const bucketMinutes = bucketTasks.reduce((acc, t) => acc + t.actualMinutes, 0)
      const needleMinutes = needleTasks.reduce((acc, t) => acc + t.actualMinutes, 0)

      return {
        ...group,
        stats: {
          totalMinutes,
          bucketPercent: totalMinutes > 0 ? Math.round((bucketMinutes / totalMinutes) * 100) : 0,
          needlePercent: totalMinutes > 0 ? Math.round((needleMinutes / totalMinutes) * 100) : 0,
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
