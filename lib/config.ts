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
    unblocker: {
      id: 'unblocker',
      name: '🛡️ Unblocker',
      defaultProvider: 'openrouter',
    },
    'promo-scribe': {
      id: 'promo-scribe',
      name: '📝 Promo Scribe',
      defaultProvider: 'openrouter',
    },
    'scope-slicer': {
      id: 'scope-slicer',
      name: '🔪 Scope Slicer',
      defaultProvider: 'openrouter',
    },
  }
} as const
