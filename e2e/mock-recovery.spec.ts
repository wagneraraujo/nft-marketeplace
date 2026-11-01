import { expect, test, type Page } from '@playwright/test'

async function suspendWorker(page: Page) {
  const session = await page.context().newCDPSession(page)
  const version = new Promise<string>((resolve) => {
    session.on('ServiceWorker.workerVersionUpdated', ({ versions }) => {
      const active = versions.find(
        (worker) =>
          worker.scriptURL ===
            new URL('/mockServiceWorker.js', page.url()).href &&
          worker.status === 'activated',
      )
      if (active) resolve(active.versionId)
    })
  })
  await session.send('ServiceWorker.enable')
  const versionId = await version
  await session.send('ServiceWorker.stopWorker', { versionId })
  await session.detach()
}

test('retoma REST após suspensão do worker sem reload ou repetição de mutation', async ({
  page,
}) => {
  await page.goto('/?reset=1')
  await expect(page.getByText('36 obras para descobrir')).toBeVisible()
  const toggle = page.getByRole('button', { name: 'Mostrar filtros' })
  if (await toggle.isVisible()) await toggle.click()
  const initialUrl = page.url()

  await suspendWorker(page)
  // A filter sends a new Axios request without reloading the document.
  const catalogResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/nfts' &&
      response.request().method() === 'GET',
  )
  await page.getByLabel('Ordenação').selectOption('price-asc')
  const response = await catalogResponse
  expect(response.status()).toBe(200)
  expect(response.fromServiceWorker()).toBe(true)
  expect(page.url()).not.toBe(initialUrl)
  await expect(page.getByText('36 obras para descobrir')).toBeVisible()

  await page.goto('/nfts/nft-1')
  await expect(
    page.getByRole('button', { name: 'Comprar NFT: adicionar ao carrinho' }),
  ).toBeVisible()
  await suspendWorker(page)
  const mutations: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'PUT' && request.url().includes('/api/cart/'))
      mutations.push(request.url())
  })
  await page
    .getByRole('button', { name: 'Comprar NFT: adicionar ao carrinho' })
    .click()
  await expect(page.getByText('NFT adicionado ao carrinho.')).toBeVisible()
  expect(mutations).toHaveLength(1)
  if (await page.locator('.cart-link').isVisible()) {
    const iconBox = await page.locator('.cart-link .asset-icon').boundingBox()
    const countBox = await page.locator('.cart-link .cart-count').boundingBox()
    expect(iconBox?.width).toBeGreaterThanOrEqual(23)
    expect(iconBox?.height).toBeGreaterThanOrEqual(23)
    expect(countBox?.height).toBe(13)
  }
  await page.goto('/cart')
  await expect(
    page.getByText('Emerald Ape #042', { exact: true }),
  ).toBeVisible()
})
