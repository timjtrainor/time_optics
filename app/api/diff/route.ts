import { getAgentModel } from '@/lib/ai'
import { generateText } from 'ai'
import { diffWords } from 'diff'
import { NextResponse } from 'next/server'
import { PROMPTS } from '@/lib/prompts'

async function getTitle(
  type: string,
  current: string,
  apiKey?: string,
  model?: string,
) {
  const prefs = { openRouterKey: apiKey, defaultModel: model }
  const agentModel = getAgentModel('diff', prefs as any)
  const { text } = await generateText({
    model: agentModel,
    system: PROMPTS.getDiffTitleSystem(type),
    prompt: PROMPTS.getDiffTitlePrompt(type, current),
  })
  return text.trim()
}

export async function POST(request: Request) {
  try {
    const { current, previous, type } = await request.json()
    const apiKey = request.headers.get('x-openai-key')
    const model = request.headers.get('x-model') || undefined

    // Skip AI call if there's no previous input to compare
    if (!previous || !current) {
      return NextResponse.json({
        summary: await getTitle(
          type,
          current,
          apiKey || undefined,
          model,
        ),
      })
    }

    if (previous === current) {
      return NextResponse.json({
        summary: await getTitle(
          type,
          current,
          apiKey || undefined,
          model,
        ),
      })
    }

    const diff = diffWords(previous, current)
    const added = diff.filter((part) => part.added).map((part) => part.value)
    const removed = diff
      .filter((part) => part.removed)
      .map((part) => part.value)

    console.log(diff)

    if (!added.length && !removed.length) {
      return NextResponse.json({
        summary: await getTitle(
          type,
          current,
          apiKey || undefined,
          model,
        ),
      })
    }

    const prefs = { openRouterKey: apiKey, defaultModel: model }
    const agentModel = getAgentModel('diff', prefs as any)

    const { text } = await generateText({
      model: agentModel,
      system: PROMPTS.getDiffLabelSystem(type),
      prompt: PROMPTS.getDiffLabelPrompt(type, previous, current, added, removed),
    })
    const summary = text.trim()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating diff:', error)
    return NextResponse.json({ summary: 'Initial' })
  }
}
