import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth'
import { catalogHandlers } from './handlers/catalog'
import { cartHandlers } from './handlers/cart'
import { orderHandlers } from './handlers/orders'
import { profileHandlers } from './handlers/profile'
import { controlHandlers } from './handlers/control'
import { socketHandlers } from './socket'
import { initialize, reset } from './db'
import { configureScenario, setScenario } from './scenarios'
export async function startMocks() {
  await initialize()
  if (new URLSearchParams(location.search).get('reset') === '1') {
    await reset()
    localStorage.removeItem('nft-marketplace:session')
    setScenario('success')
  }
  configureScenario()
  const worker = setupWorker(
    ...authHandlers,
    ...catalogHandlers,
    ...cartHandlers,
    ...orderHandlers,
    ...profileHandlers,
    ...controlHandlers,
    ...socketHandlers,
  )
  await worker.start({
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith('/api/')) print.error()
    },
    quiet: true,
  })
}
