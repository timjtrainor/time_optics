import { getAgentModel } from '@/lib/ai'
import prisma from '@/lib/prisma'
import { streamObject, createTextStreamResponse } from 'ai'
import { startOfDay } from 'date-fns'
import { generatePlanSchema } from './schema'
import { PlanPreferences } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const input = await req.json()
    
    const latestPlan = await prisma.plan.findFirst({
      orderBy: { date: 'desc' }
    })
    const preferences = (latestPlan?.preferences as unknown as PlanPreferences) || null

    if (!input || !input.content) {
      return new Response('Plan content is required', { status: 400 })
    }

    // Fetch context for the prompt
    const [objectives, projects, stakeholders] = await Promise.all([
      prisma.objective.findMany({ where: { status: 'ACTIVE' }, include: { keyResults: true } }),
      prisma.project.findMany({ where: { status: 'ACTIVE' } }),
      prisma.stakeholderGroup.findMany(),
    ])

    const model = getAgentModel('prioritizer', preferences)

    const result = streamObject({
      model: model as any,
      schema: generatePlanSchema,
      output: 'object',
      prompt: `
        Persona: You are a world-class Chief of Staff for a Senior Product Manager at a high-growth AI company.
        The PM is neurodivergent (ADHD) and works on platform data integrations.
        Your goal is to triage their brain dump into a strategic, actionable delivery plan that protects their time and focus.

        Current Context:
        - Strategic Priorities (OKRs): ${JSON.stringify(objectives)}
        - Active Projects: ${JSON.stringify(projects)}
        - Stakeholders: ${JSON.stringify(stakeholders)}
        - User Brain Dump: "${input.content}"
        - Energy Level: ${input.energyLevel || 'MEDIUM'}
        - Meeting Hours Today: ${input.meetingHours || 0}h

        Instructions for Task Generation:
        1. Actionable Tasks: Each task must be a clear, discrete deliverable.
        2. Size mapping (Cognitive Load):
           - XS: <15m, S: 30m, M: 60m, L: 120m, XL: 240m+
        3. Impact mapping:
           - NEEDLE: Strategic, high-leverage, or derisking work (moves projects forward).
           - BUCKET: Maintenance, KTLO, administrative, or "filling the gaps".
        4. ADHD Safety:
           - Avoid vague titles like "Review documents". Use "Identify 3 gaps in API spec".
           - Break anything > 2 hours (L) into smaller sub-tasks.
        5. Strategic Alignment:
           - Link tasks to active Projects or Stakeholders where obvious.
        6. The 50% Buffer Principle: Assume that unexpected requests take up half the available time; prioritize accordingly.

        Reasoning: Explain your prioritization logic, specifically how you ensured the user has a manageable load with space for reactive work.
        
        Tasks vs Backlog:
        - tasks: Items the user should focus on for their immediate planning.
        - backlog: Items that are important but not urgent.
        
        Notes: Provide 1-2 sentences of encouragement or executive function advice (e.g., "Batch your Slack replies after your deep work block").
      `,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('API route error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
