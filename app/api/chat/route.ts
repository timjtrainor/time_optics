import { getAgentModel } from '@/lib/ai'
import { AI_CONFIG } from '@/lib/config'
import prisma from '@/lib/prisma'
import { streamText, convertToModelMessages } from 'ai'
import { startOfDay } from 'date-fns'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  let apiKey = req.headers.get('x-openai-key')
  let model = req.headers.get('x-model')
  
  // If not in headers, try to get from today's plan in DB
  const today = startOfDay(new Date())
  const plan = await prisma.plan.findUnique({ where: { date: today } })
  
  if (plan?.preferences) {
    const prefs = plan.preferences as any
    if (!apiKey) apiKey = prefs.openRouterKey
    if (!model) model = prefs.model
  }

  const prefs = (plan?.preferences as any) || { openRouterKey: apiKey, model: model }
  const agentModel = getAgentModel('chat', prefs)

  const result = await streamText({
    model: agentModel,
    messages: convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
