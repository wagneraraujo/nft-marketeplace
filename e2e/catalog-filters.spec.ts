import { expect, test } from '@playwright/test'
import Decimal from 'decimal.js'

test('coleções e faixa de preço usam a API e persistem na URL', async ({
  page,
}) => {
  await page.goto('/?reset=1')
  await expect(page.getByText('36 obras para descobrir')).toBeVisible()
  const toggle = page.getByRole('button', { name: 'Mostrar filtros' })
  if (await toggle.isVisible()) await toggle.click()
  const sidebar = page.locator('.catalog-sidebar')
  for (const label of [
    'Arte digital',
    'Fotografia',
    'Música',
    'Arte 3D',
    'Colecionáveis',
    'Generativa',
    'Jogos',
    'Assinaturas',
    'Utilidade',
  ])
    await expect(
      sidebar.getByRole('link', { name: new RegExp(`^${label}`) }),
    ).toBeVisible()

  const maximum = page.getByRole('slider', { name: 'Preço máximo em ETH' })
  const minimum = page.getByRole('slider', { name: 'Preço mínimo em ETH' })
  await minimum.scrollIntoViewIfNeeded()
  const rangeBox = await minimum.boundingBox()
  const outputBox = await page.locator('.price-output').boundingBox()
  expect(rangeBox?.height).toBe(24)
  expect(outputBox!.y).toBeGreaterThanOrEqual(rangeBox!.y + rangeBox!.height)
  await page.mouse.move(rangeBox!.x + 8, rangeBox!.y + 12)
  await page.mouse.down()
  await page.mouse.move(rangeBox!.x + rangeBox!.width / 2, rangeBox!.y + 12, {
    steps: 6,
  })
  await page.mouse.up()
  expect(new Decimal(await minimum.inputValue()).gt('0.02')).toBe(true)
  await minimum.focus()
  await minimum.press('Home')
  await maximum.focus()
  await maximum.press('Home')
  await maximum.press('PageUp')
  const upper = await maximum.inputValue()
  const responsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return (
      url.pathname === '/api/nfts' && url.searchParams.get('maxPrice') === upper
    )
  })
  await sidebar.getByRole('button', { name: 'Aplicar', exact: true }).click()
  const response = await responsePromise
  expect(response.status()).toBe(200)
  const catalog = await response.json()
  expect(catalog.total).toBeGreaterThan(0)
  expect(catalog.total).toBeLessThan(36)
  for (const item of catalog.items)
    expect(new Decimal(item.price).lte(upper)).toBe(true)
  await expect
    .poll(() =>
      JSON.parse(new URL(page.url()).searchParams.get('maxPrice') ?? 'null'),
    )
    .toBe(upper)
  await page.reload()
  await expect(page.locator('#main')).toBeVisible()
  if (await toggle.isVisible()) await toggle.click()
  await expect(maximum).toHaveValue(upper)
  await sidebar.getByRole('link', { name: /^Música/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Nenhuma obra encontrada' }),
  ).toBeVisible()
  await sidebar.getByRole('button', { name: 'Limpar preço' }).click()
  await expect(page.getByText('1 obras para descobrir')).toBeVisible()
  await expect(page).toHaveURL(/category=M%C3%BAsica/)
  await expect(page).not.toHaveURL(/maxPrice=/)
})
