import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const history = await prisma.chatHistory.findMany({
      where: type ? { type } : {},
      orderBy: { timestamp: 'desc' },
      take: limit
    })
    return NextResponse.json(history)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const history = await prisma.chatHistory.create({
      data: {
        type: body.type,
        input: body.input,
        output: body.output,
        title: body.title,
        metadata: body.metadata,
        timestamp: new Date()
      }
    })
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error saving history to DB:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Failed to save history', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
