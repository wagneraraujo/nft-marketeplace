import { test, expect, type Page } from '@playwright/test'
async function control(
  page: Page,
  path: string,
  input: Record<string, unknown> = {},
) {
  return page.evaluate(
    async ({ path, input }) => {
      const modulePath = '/src/lib/api.ts'
      const { api } = await import(modulePath)
      return (await api.post(`/dev/${path}`, input)).data
    },
    { path, input },
  )
}
async function login(page: Page, email = 'alex@example.com') {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill('Demo1234!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByTitle('Meu perfil')).toBeVisible()
}
async function addToCart(page: Page) {
  await page.goto('/nfts/nft-1')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByText('NFT adicionado ao carrinho.')).toBeVisible()
}
async function checkout(page: Page) {
  await page.goto('/checkout')
  await expect(page.getByText('Cotação válida por')).toBeVisible()
  await page.getByLabel('Selecione uma carteira').selectOption('wallet-user-1')
  await page.getByRole('checkbox').check()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeEnabled()
}
test.beforeEach(async ({ page }) => {
  await page.goto('/?reset=1')
  await expect(
    page.getByRole('heading', { name: /Arte que abre/ }),
  ).toBeVisible()
})
test('compra completa, recibo imutável e refresh', async ({ page }) => {
  await login(page)
  await addToCart(page)
  await checkout(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(
    page.getByRole('heading', {
      name: 'A obra agora faz parte da sua coleção.',
    }),
  ).toBeVisible()
  const url = page.url()
  await expect(page.getByText('0.123 ETH', { exact: true })).toBeVisible()
  await control(page, 'event', { id: 'nft-1' })
  await page.reload()
  await expect(page.getByText('0.123 ETH', { exact: true })).toBeVisible()
  expect(page.url()).toBe(url)
  await page.goto('/cart')
  await expect(
    page.getByRole('heading', { name: 'Seu carrinho está vazio' }),
  ).toBeVisible()
})
test('filtros e paginação sobrevivem ao histórico e refresh', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Próxima', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await page.getByRole('button', { name: 'Arte', exact: true }).click()
  await expect(page).toHaveURL(/page=1/)
  await page.getByLabel('Ordenação').selectOption('price-desc')
  await page.getByLabel('Buscar NFTs').fill('Orbital')
  await expect(page.getByText('6 obras para descobrir')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Buscar NFTs')).toHaveValue('Orbital')
  await page.goBack()
  await expect(page.getByLabel('Buscar NFTs')).not.toHaveValue('Orbital')
})
test('isolamento de favoritos e pedidos entre usuários', async ({ page }) => {
  await login(page)
  const favorite = page.getByRole('button', {
    name: 'Adicionar aos favoritos: Orbital dream #001',
  })
  await favorite.click()
  await expect(
    page.getByRole('button', {
      name: 'Remover dos favoritos: Orbital dream #001',
    }),
  ).toBeEnabled()
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Entrar', exact: true }),
  ).toBeVisible()
  await login(page, 'sam@example.com')
  await page.goto('/favorites')
  await expect(
    page.getByRole('heading', { name: 'Sua seleção começa aqui' }),
  ).toBeVisible()
  await page.goto('/orders')
  await expect(
    page.getByRole('heading', { name: 'Você ainda não tem pedidos' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Entrar', exact: true }),
  ).toBeVisible()
  await login(page)
  await page.goto('/favorites')
  await expect(
    page.getByRole('heading', { name: 'Orbital dream #001' }),
  ).toBeVisible()
})
test('pagamento recusado preserva o carrinho', async ({ page }) => {
  await login(page)
  await addToCart(page)
  await control(page, 'scenario', { scenario: 'payment-declined' })
  await checkout(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(
    page.getByRole('heading', { name: 'Pagamento não aprovado.' }),
  ).toBeVisible()
  await page.goto('/cart')
  await expect(
    page.getByRole('heading', { name: 'Orbital dream #001' }),
  ).toBeVisible()
})
test('timeout recupera a mesma compra sem duplicação', async ({ page }) => {
  await login(page)
  await addToCart(page)
  await control(page, 'scenario', { scenario: 'order-timeout' })
  await checkout(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(
    page.getByRole('button', { name: 'Recuperar tentativa' }),
  ).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Recuperar tentativa' }).click()
  await expect(
    page.getByRole('heading', {
      name: 'A obra agora faz parte da sua coleção.',
    }),
  ).toBeVisible()
  await page.goto('/orders')
  await expect(page.locator('.order-row')).toHaveCount(1)
})
test('Socket.IO altera preço e exige revisão de cotação', async ({ page }) => {
  await login(page)
  await addToCart(page)
  await checkout(page)
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.dataset.connection),
    )
    .toBe('online')
  await control(page, 'event', { id: 'nft-1' })
  await expect(
    page.getByText('Preço ou disponibilidade atualizado. Revise sua cotação.'),
  ).toBeVisible()
  await expect(
    page.getByText('0.99 ETH', { exact: false }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeDisabled()
  await page.getByRole('checkbox').uncheck()
  await page.getByRole('checkbox').check()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeEnabled()
  await control(page, 'event', { id: 'nft-1', duplicate: true })
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeEnabled()
})
test('favorito otimista volta ao estado anterior em falha', async ({
  page,
}) => {
  await login(page)
  await control(page, 'scenario', { scenario: 'favorite-error' })
  await page
    .getByRole('button', {
      name: 'Adicionar aos favoritos: Orbital dream #001',
    })
    .click()
  await expect(
    page.getByText('Não foi possível salvar o favorito.'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', {
      name: 'Adicionar aos favoritos: Orbital dream #001',
    }),
  ).toHaveAttribute('aria-pressed', 'false')
})
test('carrinho visitante é mesclado e persiste após login', async ({
  page,
}) => {
  await addToCart(page)
  await login(page)
  await page.goto('/cart')
  await expect(
    page.getByRole('heading', { name: 'Orbital dream #001' }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Orbital dream #001' }),
  ).toBeVisible()
})
test('detalhe inexistente e rota global desconhecida', async ({ page }) => {
  await page.goto('/nfts/missing')
  await expect(page.getByText('NFT não encontrado.')).toBeVisible()
  await page.goto('/missing')
  await expect(
    page.getByRole('heading', { name: 'Página não encontrada' }),
  ).toBeVisible()
})
test('guard preserva destino e cadastro trata e-mail repetido', async ({
  page,
}) => {
  await page.goto('/checkout')
  await expect(page).toHaveURL(/login.*redirect/)
  await page.goto('/register')
  await page.getByLabel('Nome', { exact: true }).fill('Nova conta')
  await page.getByLabel('E-mail', { exact: true }).fill('alex@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('Demo1234!')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.locator('#email-error')).toHaveText(
    'Este e-mail já está cadastrado.',
  )
})
test('perfil e carteira validam campos e persistem', async ({ page }) => {
  await login(page)
  await page.goto('/profile')
  await page.getByLabel('Nome', { exact: true }).fill('Alex Colecionador')
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(page.getByText('Perfil atualizado.')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(
    'Alex Colecionador',
  )
  await page.goto('/wallets')
  await page.getByLabel('Nome da carteira').fill('Secundária')
  await page.getByLabel('Endereço Ethereum').fill('inválido')
  await page
    .getByRole('button', { name: 'Adicionar carteira', exact: true })
    .click()
  await expect(page.getByText('Endereço Ethereum inválido.')).toBeVisible()
  await page.getByLabel('Endereço Ethereum').fill(`0x${'c'.repeat(40)}`)
  await page
    .getByRole('button', { name: 'Adicionar carteira', exact: true })
    .click()
  await expect(page.getByRole('heading', { name: 'Secundária' })).toBeVisible()
  await page.getByRole('button', { name: 'Definir como principal' }).click()
  await expect(
    page
      .locator('.wallet')
      .filter({ has: page.getByRole('heading', { name: 'Secundária' }) })
      .getByText('Principal', { exact: true }),
  ).toBeVisible()
})
test('layout sem overflow e navegação por teclado', async ({ page }) => {
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true)
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Pular para o conteúdo' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
})
test('rejeição definitiva da recuperação libera nova revisão', async ({
  page,
}) => {
  await login(page)
  await addToCart(page)
  await checkout(page)
  await control(page, 'scenario', { scenario: 'server-error' })
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(
    page.getByRole('button', { name: 'Recuperar tentativa' }),
  ).toBeVisible()
  await control(page, 'scenario', { scenario: 'success' })
  await page.goto('/cart')
  await page.getByLabel('Quantidade de Orbital dream #001').selectOption('2')
  await expect(
    page.getByLabel('Quantidade de Orbital dream #001'),
  ).toBeEnabled()
  await page.goto('/checkout')
  await page.getByRole('button', { name: 'Recuperar tentativa' }).click()
  await expect(
    page.getByRole('button', { name: 'Recuperar tentativa' }),
  ).not.toBeVisible()
  await page.getByLabel('Selecione uma carteira').selectOption('wallet-user-1')
  await page.getByRole('checkbox').check()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeEnabled()
})
test('resposta tardia de perfil não altera identidade de outra conta', async ({
  page,
}) => {
  await login(page)
  await page.goto('/profile')
  await control(page, 'scenario', { scenario: 'late-profile-response' })
  await page.getByLabel('Nome', { exact: true }).fill('Alex atualizado')
  const delayedResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/profile') &&
      response.request().method() === 'PUT',
  )
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const value = JSON.parse(
          localStorage.getItem('nft-marketplace:mock-db:v1') ?? '{}',
        )
        return value.users?.find((u: { id: string }) => u.id === 'user-1')?.name
      }),
    )
    .toBe('Alex atualizado')
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Entrar', exact: true }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Entrar', exact: true }).click()
  await page.getByLabel('E-mail', { exact: true }).fill('sam@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('Demo1234!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByTitle('Meu perfil')).toHaveText('S')
  await delayedResponse
  await page.getByTitle('Meu perfil').click()
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(
    'Sam Rivera',
  )
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(
    'Sam Rivera',
    { timeout: 5000 },
  )
})
test('layout tablet e edição de carteira', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true)
  await login(page)
  await page.goto('/wallets')
  await page.getByRole('button', { name: 'Editar carteira' }).click()
  await page.getByLabel('Nome da carteira').fill('Carteira atualizada')
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(
    page.getByRole('heading', { name: 'Carteira atualizada' }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Carteira atualizada' }),
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true)
})

test.afterEach(async ({ page }) => {
  expect(await page.pageErrors()).toEqual([])
})
