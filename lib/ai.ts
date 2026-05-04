import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createOllama } from 'ollama-ai-provider'
import { AI_CONFIG } from './config'
import { AgentProvider, PlanPreferences } from './types'
import { LanguageModel } from 'ai'

export function getOpenRouter(apiKey?: string | null) {
  return createOpenRouter({
    apiKey: apiKey || process.env.OPENROUTER_API_KEY,
  })
}

export function getOllama(baseUrl?: string | null) {
  return createOllama({
    baseURL: baseUrl || AI_CONFIG.ollama.defaultEndpoint,
  })
}


export function getAgentModel(agentId: string, preferences: PlanPreferences | null): LanguageModel {
  const agentConfig = preferences?.agents?.[agentId]
  const provider = agentConfig?.provider || preferences?.defaultProvider || (AI_CONFIG.agents as any)[agentId]?.defaultProvider || AgentProvider.OPENROUTER
  const model = agentConfig?.model || preferences?.defaultModel || (provider === AgentProvider.OLLAMA ? AI_CONFIG.ollama.defaultModel : AI_CONFIG.defaultModel)

  if (provider === AgentProvider.OLLAMA) {
    return getOllama(preferences?.ollamaEndpoint).chat(model) as unknown as LanguageModel
  }

  return getOpenRouter(preferences?.openRouterKey).chat(model) as unknown as LanguageModel
}
