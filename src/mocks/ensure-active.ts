/** MSW 2.15 keeps active clients in worker memory, which is lost on suspension. */
export function createMockActivationGate() {
  let pending: Promise<void> | undefined

  return function ensureActive() {
    if (pending) return pending
    const activation = new Promise<void>((resolve, reject) => {
      const controller = navigator.serviceWorker.controller
      if (!controller) {
        reject(new Error('A simulação está indisponível. Recarregue a página.'))
        return
      }
      const cleanup = () => {
        clearTimeout(timer)
        navigator.serviceWorker.removeEventListener('message', onMessage)
      }
      const onMessage = (event: MessageEvent<unknown>) => {
        if (
          event.source !== controller ||
          !event.data ||
          typeof event.data !== 'object' ||
          !('type' in event.data) ||
          event.data.type !== 'MOCKING_ENABLED'
        )
          return
        cleanup()
        event.ports[0]?.postMessage({})
        resolve()
      }
      const timer = setTimeout(() => {
        cleanup()
        reject(new Error('A simulação não respondeu. Tente novamente.'))
      }, 5000)
      navigator.serviceWorker.addEventListener('message', onMessage)
      // Reuse the bundled worker protocol; never edit the generated worker file.
      // Wait for its acknowledgment before allowing an HTTP request onto the wire.
      try {
        controller.postMessage('MOCK_ACTIVATE')
      } catch (error) {
        cleanup()
        reject(error)
      }
    })
    pending = activation.finally(() => {
      pending = undefined
    })
    return pending
  }
}
