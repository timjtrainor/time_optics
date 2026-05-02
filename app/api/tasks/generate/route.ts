import { getAgentModel } from '@/lib/ai'
import prisma from '@/lib/prisma'
import { streamObject, createTextStreamResponse } from 'ai'
import { startOfDay } from 'date-fns'
import { generatePlanSchema } from './schema'
import { PlanPreferences } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const input = await req.json()
    const today = startOfDay(new Date())
    const plan = await prisma.plan.findUnique({ where: { date: today } })
    const preferences = (plan?.preferences as unknown as PlanPreferences) || null

    if (!input || !input.content) {
      return new Response('Plan content is required', { status: 400 })
    }

    // Fetch context for the prompt
    const [okrs, projects, stakeholders] = await Promise.all([
      prisma.oKR.findMany({ where: { status: 'ACTIVE' } }),
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
        - Active OKRs: ${JSON.stringify(okrs)}
        - Active Projects: ${JSON.stringify(projects)}
        - Stakeholders: ${JSON.stringify(stakeholders)}
        - User Brain Dump: "${input.content}"
        - Energy Level: ${input.energyLevel || 'MEDIUM'}
        - Meeting Hours Today: ${input.meetingHours || 0}h

        Instructions for Task Generation:
        1. Actionable Tasks: Each task must be a clear, discrete deliverable.
        2. MoSCoW Distribution:
           - MUST: Absolute critical focus today (Max 30% of total tasks).
           - SHOULD: Important but can slide if meetings run over (Max 40%).
           - COULD: Nice to have if energy is high.
           - WONT: Archive/Decline.
        3. ADHD Safety:
           - Avoid vague titles like "Review documents". Use "Identify 3 gaps in API spec".
           - Break anything > 2 pomodoros into smaller sub-tasks.
           - Flag "ADHD Traps": tasks with high context-switch cost.
        4. Classification:
           - STRATEGIC: Directly moves an OKR or Initiative.
           - KTLO (Keep The Lights On): Maintenance, bugs, small requests.
           - ADMIN: Emails, scheduling, expense reports.
           - INTERRUPT: Unexpected fires from stakeholders.
        5. Effort (T-Shirt): Based on cognitive complexity and risk, not just time.
        6. Estimated Pomodoros: Number of 25-minute blocks required.

        Reasoning: Explain your prioritization logic, specifically how you balanced KTLO vs Strategic work.
        
        Tasks vs Backlog:
        - tasks: Items the user SHOULD or MUST do TODAY (based on meeting hours and energy).
        - backlog: Items that were in the dump but are lower priority or don't fit today.
        
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
