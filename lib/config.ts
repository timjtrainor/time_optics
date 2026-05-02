export const AI_CONFIG = {
  defaultModel: 'google/gemini-2.0-flash-001',
  models: {
    gemini: 'google/gemini-2.0-flash-001',
  },
  ollama: {
    defaultEndpoint: 'http://localhost:11434',
    defaultModel: 'llama3',
  },
  agents: {
    scheduler: {
      id: 'scheduler',
      name: '📅 Scheduler',
      defaultProvider: 'openrouter',
    },
    prioritizer: {
      id: 'prioritizer',
      name: '🎯 Prioritizer',
      defaultProvider: 'openrouter',
    },
    coach: {
      id: 'coach',
      name: '🧠 Focus Coach',
      defaultProvider: 'openrouter',
    },
  }
} as const
