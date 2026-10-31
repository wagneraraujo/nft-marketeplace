import { http, HttpResponse } from 'msw'
import { db, reset, save } from '../db'
import { body } from './shared'
import { scenario, setScenario, scenarioNames } from '../scenarios'
import { emit, disconnectClients } from '../socket'
export const controlHandlers = [
  http.get('/api/dev/scenario', () =>
    HttpResponse.json({ active: scenario(), options: scenarioNames }),
  ),
  http.post('/api/dev/scenario', async ({ request }) => {
    const input = await body(request)
    setScenario(String(input.scenario))
    return HttpResponse.json({ active: scenario() })
  }),
  http.post('/api/dev/reset', async () => {
    disconnectClients()
    await reset()
    setScenario('success')
    return HttpResponse.json({ ok: true })
  }),
  http.post('/api/dev/event', async ({ request }) => {
    const input = await body(request)
    const nft = db.nfts.find((n) => n.id === input.id) ?? db.nfts[0]
    if (input.disconnect === true) {
      disconnectClients()
      return HttpResponse.json({ ok: true })
    }
    if (input.duplicate !== true) {
      nft.version++
      nft.price = input.soldOut === true ? nft.price : '0.99'
      if (input.soldOut === true) nft.stock = 0
      save()
    }
    const event = {
      type: 'nft.updated' as const,
      eventId: `${nft.id}:${nft.version}`,
      resourceId: nft.id,
      version: nft.version,
    }
    emit(event)
    return HttpResponse.json(event)
  }),
]
