import { format } from 'date-fns'

export const PROMPTS = {
  getDiffTitleSystem: (type: string) => 
    `Today is ${format(new Date(), 'MMMM d, yyyy')}. Your task is to write a brief summary of the current ${type}.`,
  
  getDiffTitlePrompt: (type: string, current: string) => `
# Current ${type}
${current}

Return a single, concise sentence summary of the current ${type} (max 5 words), nothing else.`,

  getDiffLabelSystem: (type: string) => 
    `Today is ${format(new Date(), 'MMMM d, yyyy')}. Your task is to write a brief label for the current ${type}.`,

  getDiffLabelPrompt: (type: string, previous: string, current: string, added: string[], removed: string[]) => `Based on the following diff, write a single sentence title for the current ${type}:

# Previous
${previous}

# Current
${current}

# Changes
${added.length > 0 ? `## Added\n${added.join('\n')}` : ''}
${removed.length > 0 ? `## Removed\n${removed.join('\n')}` : ''}

# Task
Return a single, concise sentence summary of the changes (max 5 words), nothing else. If no changes, return a single sentence summary (max 5 words) of the current ${type}.
`
}
