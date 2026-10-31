import { test, expect } from '@playwright/test'
test('visual: início, detalhe, carrinho e pagamento', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-31T12:00:00Z'))
  // UI assertions and screenshots verify readiness after the SPA boots.
  await page.goto('/?reset=1', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.nft-card')).toHaveCount(9)
  await expect(page).toHaveScreenshot('home.png', {
    fullPage: true,
    animations: 'disabled',
  })
  await page.goto('/nfts/nft-1', { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByRole('heading', { name: 'Emerald Ape #042' }),
  ).toBeVisible()
  await expect(page).toHaveScreenshot('detail.png', {
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByText('NFT adicionado ao carrinho.')).toBeVisible()
  await page.goto('/cart', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.cart-item')).toHaveCount(1)
  await expect(page).toHaveScreenshot('cart.png', {
    fullPage: true,
    animations: 'disabled',
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('E-mail', { exact: true }).fill('alex@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('Demo1234!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(
    page.getByTitle('Meu perfil').filter({ visible: true }),
  ).toBeVisible()
  await page.goto('/checkout', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Cotação válida por')).toBeVisible()
  await expect(page).toHaveScreenshot('checkout.png', {
    fullPage: true,
    animations: 'disabled',
  })
})
