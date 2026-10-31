# NFT Marketplace

Marketplace demonstrativo em React + TypeScript, com catálogo, favoritos, carrinho, cotação, compra, pedidos, perfil e carteiras. Toda a API e os eventos de pagamento são simulados no navegador pelo MSW; nenhuma transferência real é realizada.

## Executar

Requer Node.js 22.12+ e Yarn Classic 1.22.22. Versões das dependências estão no `yarn.lock`.

```sh
yarn install --frozen-lockfile
cp .env.example .env
yarn dev
```

Abra o endereço mostrado pelo Vite. `VITE_ENABLE_MOCKS=true` é obrigatório na demonstração, inclusive no build da Vercel. O worker inicia antes do React. Sem os mocks é necessário fornecer uma API compatível; este projeto não inclui backend.

## Contas de demonstração

| E-mail           | Senha fictícia |
| ---------------- | -------------- |
| alex@example.com | Demo1234!      |
| sam@example.com  | Demo1234!      |

As duas contas começam com uma carteira. Novas contas podem cadastrar a primeira carteira em `/wallets`. Cupom válido: `ART10` (10%); `EXPIRED` representa cupom expirado. Qualquer outro código é inválido. Senhas são persistidas apenas como hash com salt simulado; este mecanismo local não é uma autenticação de produção.

## Comandos

```sh
yarn dev
yarn typecheck
yarn lint
yarn build
yarn preview --host 127.0.0.1
yarn format:check
yarn playwright install chromium
yarn test:e2e
yarn test:visual
yarn test:visual:update
yarn lighthouse
```

`test:visual:update` altera baselines e deve ser usado apenas após revisão visual. Os E2E executam Chromium em 1440 px e 390 px contra o MSW no navegador. O relatório fica em `playwright-report/index.html`; falhas geram screenshots e traces em `test-results`. Para Lighthouse, mantenha o preview na porta 4173 e execute o comando em outro terminal; relatórios e medianas ficam em `lighthouse/reports`.

## Fluxos para demonstração

1. Explore o catálogo, use busca/filtros, abra um NFT e escolha uma quantidade.
2. Adicione ao carrinho. Como visitante, os itens serão mesclados à conta no login.
3. Acesse pagamento, aplique um cupom se desejar, escolha a carteira e revise a cotação.
4. Marque a revisão e confirme. O pedido passa por pendente e só mostra recibo após confirmação do mock.
5. Atualize o recibo para demonstrar recuperação e imutabilidade. Consulte outros pedidos em `/orders`.

Perfil e carteiras estão em `/profile` e `/wallets`. Favoritos são privados e persistem por conta. Os dados da simulação ficam no armazenamento deste navegador; abas simultâneas não representam um banco transacional compartilhado e não são o cenário suportado da demonstração.

## Cenários de falha e tempo real

Abra `/dev` para selecionar cenários, alterar preço/estoque, repetir eventos, interromper a conexão ou resetar todos os dados. Os controles chamam endpoints do próprio mock e não alteram diretamente a UI/cache. Outra opção é iniciar com `/?scenario=order-timeout`. A seleção persiste em refresh e navegação até ser alterada/resetada.

Cenários: `success`, `empty`, `slow`, `out-of-order`, `network-error`, `server-error`, `expired-session`, `forbidden`, `validation-error`, `favorite-error`, `late-profile-response`, `price-change`, `sold-out`, `order-timeout`, `payment-declined`.

- **Timeout depois da criação:** selecione `order-timeout`, faça uma compra e aguarde a falha de resposta. Use “Recuperar tentativa”, inclusive após refresh. O mesmo pedido é recuperado pela mesma chave; não há retry automático de compra.
- **Recusa:** selecione `payment-declined` antes de enviar; a compra é recusada e os itens permanecem no carrinho.
- **Cotação alterada:** `price-change` ou `sold-out` revalida a disponibilidade no envio e exige revisão. Para acompanhar eventos durante o checkout, use o endpoint de controle abaixo na mesma página/contexto do navegador.
- **Sessão expirada:** selecione `expired-session`; uma consulta privada leva ao login e preserva o destino. Volte a `success` em `/dev` antes de autenticar novamente, para permitir a retomada.
- **Reset completo:** abra `/?reset=1` ou use `/dev`. Restaura as fixtures; o botão de reset também remove a sessão local. O reset também remove tentativas, cupons e identidade de visitante do contexto local.

Endpoints locais de controle: `POST /api/dev/scenario` com `{scenario}`, `POST /api/dev/event` com `{id, soldOut?, duplicate?, disconnect?}`, `POST /api/dev/reset`. Para interações automatizadas no Vite, os E2E usam a instância Axios da aplicação dentro da página. Chamadas externas por cURL não passam pelo Service Worker do navegador.

## Arquitetura e decisões

Veja [ARCHITECTURE.md](ARCHITECTURE.md), [guia para defesa técnica](docs/SOLUTION-GUIDE.md) e [plano de ação](docs/superpowers/plans/2026-10-31-nft-marketplace.md).

A interface usa direção visual provisória e ilustrações SVG locais. O arquivo Figma fornecido é `Ff0SksUi7UFtPWUO8kyNtw`, página `0:1`; o MCP recusou a leitura por falta de acesso de edição da conta conectada. Fidelidade ao Figma permanece pendente. As ilustrações não foram extraídas do Figma. Nenhum resultado de testes ou pontuação deve ser presumido: consulte as evidências registradas em `docs/execution/progress.md`.

## Deploy

Build: `yarn build`; saída: `dist`; variável: `VITE_ENABLE_MOCKS=true`. `vercel.json` inclui rewrite das rotas do frontend e preserva assets/worker. Validar acesso direto a `/nfts/nft-1` e `/checkout`, registro do Service Worker e eventos Socket.IO no domínio publicado. Publicação pública ainda deve ter sua evidência registrada; possuir configuração não equivale a um deploy realizado.

## Verificação realizada

Typecheck, lint e build aprovados. Instalação com lockfile congelado e build reproduzidos em pasta limpa. Playwright: **34 testes aprovados**, desktop/mobile, incluindo oito baselines visuais e verificações em 768 px. [Resultados Lighthouse](lighthouse/RESULTS.md): desktop 100 nas duas páginas; mobile 90 no início e 88 no detalhe. Accessibility, Best Practices e SEO: 100 em todas as combinações. O detalhe mobile permanece abaixo da meta de desempenho 90.

O deploy público aguarda autorização da integração para a equipe Vercel. A interface continua provisória até obter leitura do Figma; nenhuma equivalência visual com o arquivo foi declarada.
