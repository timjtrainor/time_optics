import { AI_CONFIG } from '@/lib/config'
import prisma from '@/lib/prisma'
import { startOfDay } from 'date-fns'

export async function GET() {
  try {
    const today = startOfDay(new Date())
    const plan = await prisma.plan.findUnique({ where: { date: today } })
    let endpoint = AI_CONFIG.ollama.defaultEndpoint

    if (plan?.preferences) {
      const prefs = plan.preferences as any
      if (prefs.ollamaEndpoint) endpoint = prefs.ollamaEndpoint
    }

    const response = await fetch(`${endpoint}/api/tags`)
    if (!response.ok) {
      throw new Error('Failed to fetch Ollama models')
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Ollama models error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
