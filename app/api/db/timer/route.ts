import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const activeSession = await prisma.timerSession.findFirst({
      where: { endTime: null }
    })
    return NextResponse.json(activeSession)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch active session' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ...data } = body

    if (action === 'start') {
      // Abandon existing
      await prisma.timerSession.updateMany({
        where: { endTime: null },
        data: { 
          endTime: new Date(),
          endType: 'abandoned'
        }
      })

      const session = await prisma.timerSession.create({
        data: {
          type: data.type,
          content: data.content,
          duration: data.duration,
          sessionId: data.sessionId,
          startTime: new Date(),
          lastHeartbeat: new Date()
        }
      })
      return NextResponse.json(session)
    }

    if (action === 'complete') {
      await prisma.timerSession.updateMany({
        where: { sessionId: data.sessionId, endTime: null },
        data: {
          endTime: new Date(),
          endType: data.endType,
          status: 'COMPLETED'
        }
      })
      const session = await prisma.timerSession.findFirst({ where: { sessionId: data.sessionId } })
      return NextResponse.json(session)
    }

    if (action === 'pause') {
      await prisma.timerSession.updateMany({
        where: { sessionId: data.sessionId, endTime: null },
        data: {
          status: 'PAUSED',
          pauseNote: data.pauseNote,
          pausedAt: new Date(),
          accumulatedElapsedMs: data.accumulatedElapsedMs
        }
      })
      const session = await prisma.timerSession.findFirst({ where: { sessionId: data.sessionId, endTime: null } })
      return NextResponse.json(session)
    }

    if (action === 'resume') {
      await prisma.timerSession.updateMany({
        where: { sessionId: data.sessionId, endTime: null },
        data: {
          status: 'RUNNING',
          pauseNote: null,
          pausedAt: null,
          startTime: new Date(),
          accumulatedElapsedMs: data.accumulatedElapsedMs
        }
      })
      const session = await prisma.timerSession.findFirst({ where: { sessionId: data.sessionId, endTime: null } })
      return NextResponse.json(session)
    }

    if (action === 'extend') {
      await prisma.timerSession.updateMany({
        where: { sessionId: data.sessionId, endTime: null },
        data: {
          duration: {
            increment: data.minutes
          }
        }
      })
      const session = await prisma.timerSession.findFirst({ where: { sessionId: data.sessionId, endTime: null } })
      return NextResponse.json(session)
    }

    if (action === 'heartbeat') {
      await prisma.timerSession.updateMany({
        where: { sessionId: data.sessionId, endTime: null },
        data: { lastHeartbeat: new Date() }
      })
      const session = await prisma.timerSession.findFirst({ where: { sessionId: data.sessionId, endTime: null } })
      return NextResponse.json(session)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in timer API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
