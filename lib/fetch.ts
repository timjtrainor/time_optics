export async function fetchWithKey(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const today = new Date().toISOString().split('T')[0]
  
  // Fetch the plan from the new Postgres API
  const planResponse = await fetch(`/api/db/plans?date=${today}`)
  const plan = await planResponse.json()
  
  const openRouterKey = plan?.preferences?.openRouterKey
  const model = plan?.preferences?.model
  const headers = new Headers(init?.headers)

  if (openRouterKey) {
    headers.set('x-openai-key', openRouterKey)
  }
  if (model) {
    headers.set('x-model', model)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}
