import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
test('Kurio: evidência visual e ausência de overflow nos fluxos', async ({
  page,
}, testInfo) => {
  await page.clock.setFixedTime(new Date('2026-10-31T12:00:00Z'))
  test.setTimeout(120000)
  const mobile = testInfo.project.name === 'mobile'
  const capture = async (name: string) => {
    await page.evaluate(() => document.fonts.ready)
    await page.locator('img').evaluateAll((images) =>
      images.forEach((image) => {
        ;(image as HTMLImageElement).loading = 'eager'
      }),
    )
    await page.locator('img:visible').evaluateAll((images) =>
      Promise.all(
        images.map((image) => {
          const img = image as HTMLImageElement
          return img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true })
                img.addEventListener('error', resolve, { once: true })
              })
        }),
      ),
    )
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true)
    await mkdir('.impeccable/review', { recursive: true })
    await page.screenshot({
      path: path.resolve(
        `.impeccable/review/${name}-${mobile ? 'mobile' : 'desktop'}.png`,
      ),
      fullPage: !mobile,
      animations: 'disabled',
      scale: 'css',
    })
  }
  if (mobile) await page.setViewportSize({ width: 414, height: 896 })
  await page.goto('/?reset=1')
  await expect(page.locator('.nft-card')).toHaveCount(9)
  await capture('home')
  await page.goto('/nfts/nft-1')
  await expect(
    page.getByRole('heading', { name: 'Emerald Ape #042', exact: true }),
  ).toBeVisible()
  await capture('detail')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByText('NFT adicionado ao carrinho.')).toBeVisible()
  await page.goto('/cart')
  await expect(page.locator('.cart-item')).toHaveCount(1)
  await capture('cart-visitor')
  for (const route of ['register', 'login']) {
    await page.goto(`/${route}`)
    await expect(page.getByRole('dialog')).toBeVisible()
    if (route === 'wallets')
      await expect(page.locator('.wallet')).toHaveCount(1)
    await capture(route)
  }
  await page.getByLabel('E-mail', { exact: true }).fill('alex@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('Demo1234!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(
    page.getByTitle('Meu perfil').filter({ visible: true }),
  ).toBeVisible()
  for (const route of ['profile', 'wallets', 'cart', 'checkout']) {
    await page.goto(`/${route}`)
    if (route === 'checkout' || route === 'cart')
      await expect(page.getByText('1.21975 ETH', { exact: true })).toBeVisible()
    else
      await expect(
        page.getByLabel(route === 'profile' ? 'Nome' : 'Nome da carteira', {
          exact: true,
        }),
      ).toBeVisible()
    if (route === 'wallets')
      await expect(page.locator('.wallet')).toHaveCount(1)
    await capture(route)
  }
  await page.getByRole('radio', { name: /Minha carteira/ }).check()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(
    page.getByRole('heading', {
      name: 'A obra agora faz parte da sua coleção.',
    }),
  ).toBeVisible()
  await capture('confirmation')
  if (!mobile) {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.locator('.nft-card')).toHaveCount(9)
    await page.screenshot({
      path: '.impeccable/review/home-tablet.png',
      fullPage: true,
      animations: 'disabled',
      scale: 'css',
    })
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true)
  }
})
