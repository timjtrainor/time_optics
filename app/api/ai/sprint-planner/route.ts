import { getAgentModel } from '@/lib/ai'
import prisma from '@/lib/prisma'
import { generateObject } from 'ai'
import { addDays, startOfWeek, addWeeks, format } from 'date-fns'
import { z } from 'zod'

export const maxDuration = 60

const sprintProposalSchema = z.object({
  name: z.string(),
  aiSummary: z.string(),
  taskIds: z.array(z.coerce.number()),
})

export async function POST(req: Request) {
  try {
    const latestPlan = await prisma.plan.findFirst({
      orderBy: { date: 'desc' }
    })
    const preferences = latestPlan?.preferences ? (latestPlan.preferences as any) : null
    const model = getAgentModel('sprint-planner', preferences)

    // Calculate Next Week (Monday to Friday)
    const monday = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 })
    const friday = addDays(monday, 4)

    // Fetch Backlog and Projects for context
    const backlog = await prisma.task.findMany({
      where: { status: 'BACKLOG' },
      include: {
        project: true,
        stakeholderGroup: true
      }
    })

    const activeProjects = await prisma.project.findMany({
      where: { status: 'ACTIVE' }
    })

    if (backlog.length === 0) {
      return Response.json({ success: false, error: "Backlog is empty. Add some tasks first!" }, { status: 400 })
    }

    const taskList = backlog.map(t => ({
      id: t.id,
      title: t.title,
      size: t.size,
      impact: t.impact,
      project: t.project?.title || 'None',
      stakeholder: t.stakeholderGroup?.name || 'None'
    }))

    const projectList = activeProjects.map(p => ({
      title: p.title,
      description: p.description,
      impact: p.expectedImpact
    }))

    const result = await generateObject({
      model: model as any,
      schema: sprintProposalSchema,
      prompt: `You are the "Sprint Planner" AI Agent for a fast-growing AI platform Senior PM with ADHD.
Your goal is to groom the backlog and propose a focused 1-week sprint.

ADHD PRINCIPLE: Less is more. Do not overload the week. 
CAPACITY RULE: Aim for ~20 hours (1200 minutes) of planned work, leaving 50% buffer for fires and reactive work.

Size mapping (Minutes):
XS: 15m
S: 30m
M: 60m
L: 120m
XL: 240m

Current Backlog:
${JSON.stringify(taskList, null, 2)}

Active Strategic Projects:
${JSON.stringify(projectList, null, 2)}

Generate:
1. 'name': A motivating name for the week (e.g. "Focus: Infrastructure Unblocking" or "Week of the Needle").
2. 'aiSummary': A concise rationale (2-3 sentences) explaining why these tasks were chosen and how much buffer was left.
3. 'taskIds': An array of task IDs from the backlog that fit within the ~1200 minute capacity. Prioritize "NEEDLE" impact tasks and those aligned with active projects.
      `,
    })

    const proposal = result.object

    // Create the Proposed Sprint
    const sprint = await prisma.sprint.create({
      data: {
        name: proposal.name,
        startDate: monday,
        endDate: friday,
        status: 'PROPOSED',
        aiSummary: proposal.aiSummary,
        capacityMinutes: 2400, // 40 hours total capacity
      }
    })

    // Assign tasks to the sprint (but keep status as BACKLOG until user starts sprint)
    await prisma.task.updateMany({
      where: { id: { in: proposal.taskIds } },
      data: { sprintId: sprint.id }
    })

    return Response.json({ success: true, sprintId: sprint.id, data: proposal })

  } catch (error: any) {
    console.error('Sprint Planner Error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
