import { test, expect, type Page } from '@playwright/test'
async function control(
  page: Page,
  path: string,
  input: Record<string, unknown> = {},
) {
  // Wait for bootstrap: MSW starts before React exposes the app shell.
  await page.locator('#main').waitFor()
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
  await expect(
    page.getByTitle('Meu perfil').filter({ visible: true }),
  ).toHaveText(email === 'sam@example.com' ? 'S' : 'A')
}
async function signOut(page: Page) {
  const button = page
    .getByRole('button', { name: 'Sair', exact: true })
    .filter({ visible: true })
    .first()
  if (!(await button.count())) await page.goto('/profile')
  await page
    .getByRole('button', { name: 'Sair', exact: true })
    .filter({ visible: true })
    .first()
    .click()
  await expect(
    page.getByRole('link', { name: 'Entrar', exact: true }),
  ).toBeVisible()
}
async function addToCart(page: Page) {
  await page.goto('/nfts/nft-1')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByText('NFT adicionado ao carrinho.')).toBeVisible()
}
async function checkout(page: Page) {
  await page.goto('/checkout')
  await expect(page.getByText('Cotação válida por')).toBeVisible()
  await page.getByRole('radio', { name: /Minha carteira/ }).check()
  await page.getByRole('checkbox').check()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeEnabled()
}
test.beforeEach(async ({ page }) => {
  await page.goto('/?reset=1')
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible()
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
  await expect(page.getByText('1.21975 ETH', { exact: true })).toBeVisible()
  await control(page, 'event', { id: 'nft-1' })
  await page.reload()
  await expect(page.getByText('1.21975 ETH', { exact: true })).toBeVisible()
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
  const filterToggle = page.getByRole('button', { name: 'Mostrar filtros' })
  if (await filterToggle.isVisible()) await filterToggle.click()
  await page.getByRole('button', { name: /^Arte digital/ }).click()
  await expect(page).toHaveURL(/page=1/)
  await page.getByLabel('Ordenação').selectOption('price-desc')
  await page.getByLabel('Buscar NFTs').filter({ visible: true }).fill('Emerald')
  await expect(page.getByText('4 obras para descobrir')).toBeVisible()
  await page.reload()
  await expect(
    page.getByLabel('Buscar NFTs').filter({ visible: true }),
  ).toHaveValue('Emerald')
  await page.goBack()
  await expect(
    page.getByLabel('Buscar NFTs').filter({ visible: true }),
  ).not.toHaveValue('Emerald')
})
test('isolamento de favoritos e pedidos entre usuários', async ({ page }) => {
  await login(page)
  const favorite = page.getByRole('button', {
    name: 'Adicionar aos favoritos: Emerald Ape #042',
  })
  await favorite.click()
  await expect(
    page.getByRole('button', {
      name: 'Remover dos favoritos: Emerald Ape #042',
    }),
  ).toBeEnabled()
  await signOut(page)
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
  await signOut(page)
  await expect(
    page.getByRole('link', { name: 'Entrar', exact: true }),
  ).toBeVisible()
  await login(page)
  await page.goto('/favorites')
  await expect(
    page.getByRole('heading', { name: 'Emerald Ape #042' }),
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
    page.getByRole('heading', { name: 'Emerald Ape #042' }),
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
    page
      .getByText('0.99 ETH', { exact: false })
      .filter({ visible: true })
      .first(),
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
      name: 'Adicionar aos favoritos: Emerald Ape #042',
    })
    .click()
  await expect(
    page.getByText('Não foi possível salvar o favorito.'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', {
      name: 'Adicionar aos favoritos: Emerald Ape #042',
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
    page.getByRole('heading', { name: 'Emerald Ape #042' }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Emerald Ape #042' }),
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
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Demo1234!')
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
  await page.getByLabel('Quantidade de Emerald Ape #042').selectOption('2')
  await expect(page.getByLabel('Quantidade de Emerald Ape #042')).toBeEnabled()
  await page.goto('/checkout')
  await page.getByRole('button', { name: 'Recuperar tentativa' }).click()
  await expect(
    page.getByRole('button', { name: 'Recuperar tentativa' }),
  ).not.toBeVisible()
  await page.getByRole('radio', { name: /Minha carteira/ }).check()
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
  await signOut(page)
  await expect(
    page.getByRole('link', { name: 'Entrar', exact: true }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Entrar', exact: true }).click()
  await page.getByLabel('E-mail', { exact: true }).fill('sam@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('Demo1234!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(
    page.getByTitle('Meu perfil').filter({ visible: true }),
  ).toHaveText('S')
  await delayedResponse
  await page.getByTitle('Meu perfil').filter({ visible: true }).click()
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
test('detalhe lento reserva o espaço da imagem antes dos dados', async ({
  page,
}) => {
  await page.goto('/nfts/nft-1?scenario=slow')
  const placeholder = page.locator('.detail-loading-art')
  await expect(placeholder).toBeVisible()
  const reserved = await placeholder.boundingBox()
  await expect(
    page.getByRole('heading', { name: 'Emerald Ape #042' }),
  ).toBeVisible()
  const image = await page.locator('.detail-art').boundingBox()
  expect(reserved).not.toBeNull()
  expect(image).not.toBeNull()
  expect(Math.abs((reserved?.x ?? 0) - (image?.x ?? 0))).toBeLessThan(1)
  expect(Math.abs((reserved?.y ?? 0) - (image?.y ?? 0))).toBeLessThan(1)
  expect(Math.abs((reserved?.width ?? 0) - (image?.width ?? 0))).toBeLessThan(1)
  expect(Math.abs((reserved?.height ?? 0) - (image?.height ?? 0))).toBeLessThan(
    1,
  )
})

test('cupom recalcula a cotação e exige revisão dos novos valores', async ({
  page,
}) => {
  await login(page)
  await addToCart(page)
  await checkout(page)
  await page.getByLabel('Cupom', { exact: true }).fill('ART10')
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click()
  await expect(page.getByText('1.097775 ETH', { exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeDisabled()
  await page.getByLabel('Cupom', { exact: true }).fill('EXPIRED')
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click()
  await expect(
    page.getByText('Este cupom expirou.', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeDisabled()
  await page.getByLabel('Cupom', { exact: true }).fill('')
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click()
  await expect(page.getByText('1.21975 ETH', { exact: true })).toBeVisible()
})

test('sessão expirada no checkout preserva destino e itens após autenticar', async ({
  page,
}) => {
  await login(page)
  await addToCart(page)
  await checkout(page)
  await control(page, 'scenario', { scenario: 'expired-session' })
  await page.getByRole('button', { name: 'Atualizar cotação' }).click()
  await expect(page).toHaveURL(/\/login\?/)
  expect(new URL(page.url()).searchParams.get('redirect')).toBe('/checkout')
  await control(page, 'scenario', { scenario: 'success' })
  await page.getByLabel('E-mail', { exact: true }).fill('alex@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('Demo1234!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByText('1.21975 ETH', { exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeDisabled()
})

test('reconexão recupera mudança perdida e evento antigo não invalida revisão', async ({
  page,
}) => {
  await login(page)
  await addToCart(page)
  await checkout(page)
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.dataset.connection),
    )
    .toBe('online')
  await control(page, 'event', { disconnect: true })
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.dataset.connection),
    )
    .toBe('offline')
  await control(page, 'event', { id: 'nft-1' })
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.dataset.connection),
    )
    .toBe('online')
  await expect(
    page
      .getByText('0.99 ETH', { exact: false })
      .filter({ visible: true })
      .first(),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeDisabled()
  // Reload clears the client's event-version map; REST must still reject an older first event.
  await page.reload()
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.dataset.connection),
    )
    .toBe('online')
  await page.getByRole('radio', { name: /Minha carteira/ }).check()
  await page.getByRole('checkbox').check()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeEnabled()
  const unexpectedQuote = page
    .waitForRequest(
      (request) =>
        request.url().endsWith('/api/quotes') && request.method() === 'POST',
      { timeout: 1200 },
    )
    .then(
      () => true,
      () => false,
    )
  await control(page, 'event', { id: 'nft-1', stale: true })
  expect(await unexpectedQuote).toBe(false)
  await expect(page.getByRole('checkbox')).toBeChecked()
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' }),
  ).toBeEnabled()
})

test('conhecer o ID de um pedido não permite acessar o recibo de outra conta', async ({
  page,
}) => {
  await login(page)
  await addToCart(page)
  await checkout(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(
    page.getByRole('heading', {
      name: 'A obra agora faz parte da sua coleção.',
    }),
  ).toBeVisible()
  const receipt = page.url()
  await page.getByRole('button', { name: 'Fechar recibo' }).click()
  await expect(page).toHaveURL(/\/orders$/)
  await signOut(page)
  await login(page, 'sam@example.com')
  await page.goto(receipt)
  await expect(
    page.getByText('Pedido não encontrado.', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Recibo da compra' }),
  ).toHaveCount(0)
  await expect(page.getByText('1.21975 ETH', { exact: true })).toHaveCount(0)
})

test('avatar valida limite de arquivo e persiste após atualizar a página', async ({
  page,
}) => {
  await login(page)
  await page.goto('/profile')
  const file = page.getByLabel('Selecionar imagem do perfil', { exact: true })
  await file.setInputFiles({
    name: 'large.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(1024 * 1024 + 1),
  })
  await expect(
    page.getByText('Use uma imagem de até 1 MB.', { exact: true }),
  ).toBeVisible()
  await file.setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGO41OUDAAPaAakDehmdAAAAAElFTkSuQmCC',
      'base64',
    ),
  })
  await expect(page.getByAltText('Seu avatar', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(
    page.getByText('Perfil atualizado.', { exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByAltText('Seu avatar', { exact: true }),
  ).toHaveAttribute('src', /^data:image\/png;base64,/)
})

test('troca de senha valida a senha atual e permite novo login', async ({
  page,
}) => {
  await login(page)
  await page.goto('/profile')
  await page.getByLabel(/^Senha atual/).fill('WrongPassword123!')
  await page
    .getByLabel('Nova senha', { exact: true })
    .fill('ChangedPassword123!')
  await page
    .getByLabel('Confirmar nova senha', { exact: true })
    .fill('ChangedPassword123!')
  await page.getByRole('button', { name: 'Alterar senha', exact: true }).click()
  await expect(page.locator('#currentPassword-error')).toHaveText(
    'Senha atual incorreta.',
  )
  await page.getByLabel(/^Senha atual/).fill('Demo1234!')
  await page.getByRole('button', { name: 'Alterar senha', exact: true }).click()
  await expect(page.getByText('Senha alterada.', { exact: true })).toBeVisible()
  await signOut(page)
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('alex@example.com')
  await page.getByLabel(/^Senha/).fill('Demo1234!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.locator('#password-error')).toHaveText(
    'E-mail ou senha incorretos.',
  )
  await page.getByLabel(/^Senha/).fill('ChangedPassword123!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(
    page.getByTitle('Meu perfil').filter({ visible: true }),
  ).toHaveText('A')
})

test('diálogo de acesso mantém o fundo inerte e fecha com Escape', async ({
  page,
}) => {
  await page.goto('/login')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).focus()
  for (let index = 0; index < 3; index++) {
    await page.keyboard.press('Tab')
    expect(
      await page.evaluate(() =>
        document.activeElement?.closest('dialog')?.matches(':modal'),
      ),
    ).toBe(true)
  }
  // Native dialogs may transfer the final Tab to browser chrome, but background
  // controls must stay inert. Do not replace native behavior with a custom trap.
  await page
    .locator('.skip-link')
    .evaluate((element) => (element as HTMLElement).focus())
  expect(
    await page.evaluate(() =>
      document.activeElement?.closest('dialog')?.matches(':modal'),
    ),
  ).toBe(true)
  await page.keyboard.press('Escape')
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
