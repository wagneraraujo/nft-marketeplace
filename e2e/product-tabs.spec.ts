import { expect, test } from '@playwright/test'

test('produto tem abas acessíveis, avaliações via API e ampliação da obra', async ({
  page,
}) => {
  const reviewsResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/nfts/nft-1/reviews',
  )
  await page.goto('/nfts/nft-1?reset=1')
  await expect(
    page.getByRole('heading', { name: 'Emerald Ape #042' }),
  ).toBeVisible()
  if (page.viewportSize()!.width <= 700) {
    const bar = await page.locator('.purchase-box').boundingBox()
    expect(
      Math.abs(bar!.y + bar!.height - page.viewportSize()!.height),
    ).toBeLessThan(2)
  }
  expect((await reviewsResponse).status()).toBe(200)
  const details = page.getByRole('tab', {
    name: 'Detalhes do NFT',
    exact: true,
  })
  const reviews = page.getByRole('tab', {
    name: 'Avaliações de colecionadores (19)',
    exact: true,
  })
  await expect(details).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toContainText('Direitos autorais:')
  await details.focus()
  await details.press('ArrowRight')
  await reviews.press('Enter')
  await expect(reviews).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel').getByRole('listitem')).toHaveCount(19)
  await expect(page.getByRole('tabpanel')).toContainText(
    'Avaliações demonstrativas',
  )
  await reviews.press('ArrowLeft')
  await details.press('Enter')
  await expect(details).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: 'Ampliar obra' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Ampliar obra' })).toBeFocused()
  expect(await page.pageErrors()).toEqual([])
})
