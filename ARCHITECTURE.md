# Arquitetura do NFT Marketplace

## Estrutura e responsabilidades

Frontend modular por funcionalidade. `src/routes` contém rotas file-based geradas pelo plugin TanStack, validação da URL, metadados e guard privado. `src/features` reúne consultas, mutations e interfaces de cada fluxo. `src/contracts` compartilha tipos e schemas entre cliente e simulação. `src/lib` concentra infraestrutura; `src/mocks` é o único proprietário dos dados fictícios e das regras comerciais simuladas.

O fluxo é componente → hook da feature → Axios → MSW → banco simulado. Nenhum componente importa fixtures ou calcula o total comercial. O `App.tsx` original foi preservado como arquivo legado sem participação no bootstrap; `main.tsx` monta Query/Router/Toaster após inicializar o worker.

São usados React, TypeScript strict, Vite, TanStack Router/Query, Axios, Tailwind, shadcn com Base UI, React Hook Form/Zod, decimal.js, Socket.IO e MSW v2. O componente Button existente foi preservado; formulários especificam `type="submit"`, pois a primitiva Base UI usa botão comum por padrão.

## Contratos REST

Tipos em `src/contracts/index.ts`. ETH é string decimal; quantidade é inteiro. Erro padrão: `{code, message, fieldErrors?}`. Handlers validam entradas e autorização; tipagem estática não substitui verificação em runtime.

| Recurso   | Método e caminho                        | Entrada / resposta                                                                  |
| --------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| Conta     | POST `/register`                        | `{name,email,password}` → `{token,user}`; 409 para e-mail existente                 |
| Login     | POST `/login`                           | `{email,password}` → `{token,user}`                                                 |
| Sessão    | GET `/session`; POST `/logout`          | Usuário atual / revogação do token                                                  |
| Catálogo  | GET `/nfts`                             | `q, category, rarity, sort, page` → `{items,total,pages}`                           |
| Detalhe   | GET `/nfts/:id`                         | NFT ou 404                                                                          |
| Favoritos | GET `/favorites`; PUT `/favorites/:id`  | IDs privados / `{active:boolean}` → IDs atualizados                                 |
| Carrinho  | GET `/cart`; PUT `/cart/:id`            | Carrinho com versão / `{quantity:0..10}`; zero remove                               |
| Cotação   | POST `/quotes`                          | `{coupon}` → `Quote` com ID, validade, versões, itens, subtotal/desconto/taxa/total |
| Compra    | POST `/orders`                          | `{quoteId,walletId}` + `Idempotency-Key` → pedido                                   |
| Pedidos   | GET `/orders`; GET `/orders/:id`        | Lista privada / pedido do usuário autenticado                                       |
| Perfil    | GET/PUT `/profile`                      | `{name,email,avatar}`; avatar local data URL até 1 MB                               |
| Senha     | PUT `/password`                         | `{currentPassword,password}`                                                        |
| Carteiras | GET/POST `/wallets`; PUT `/wallets/:id` | `{label,address,primary}` / editar carteira ou torná-la principal                   |

400/422 representam validação; 401 expiração/ausência de sessão; 403 cenário sem permissão; 404 recurso ausente ou pedido de outro usuário; 409 conflito comercial/cadastro/idempotência; 503 falha transitória. Axios mapeia erros para feedback e erros de campo. As rotas privadas preservam somente redirecionamentos internos válidos.

## Dados, cache e sessão

Query keys privadas incluem `userId`; carrinho visitante tem identidade independente. Catálogo inclui parâmetros normalizados da URL. Queries passam `AbortSignal` ao Axios. Catálogo/detalhe: staleTime 30 s; carrinho/favoritos/perfil/carteiras/sessão: 10 s; cotação e pedidos: 0; gcTime: 5 min. Queries tentam novamente no máximo duas vezes em rede/5xx, nunca em 4xx. Sessão e cotação não repetem automaticamente. Mutations têm retry desativado.

Favoritos usam cancelamento da consulta, snapshot, atualização otimista, rollback e invalidação. O retorno da mutation é aguardado para considerar a mudança persistida. Um favorito otimista não é garantia de gravação se a sessão terminar durante a operação.

Token e visitante usam `src/lib/storage.ts`. O banco mock usa namespace próprio e dados privados separados por usuário. Hash SHA-256 com salt é apenas uma simulação, inadequada para autenticação real. Não armazenamos senha em claro. Logout cancela queries, limpa cache e token e remove conexão/listeners. As contas preservam seus próprios registros no banco simulado. Tentativas de compra e cupom são separados por usuário para permitir recuperação.

O Axios captura o escopo da sessão na requisição e descarta respostas, inclusive de mutations, quando a sessão já mudou. Um 401 só encerra a sessão correspondente à requisição; não pode desconectar uma conta nova por uma resposta antiga. O rollback de favoritos usa a identidade capturada no início da operação.

## Carrinho, cotação e pedidos

O merge visitante→usuário é feito no mock, remove a origem após a mesclagem e respeita estoque/limite de dez edições. O banco centraliza aritmética via utilitários decimal.js. Cupom `ART10`: desconto de 10%; taxa: 2,5% sobre subtotal descontado, com seis casas decimais. A cotação tem validade de dois minutos e snapshot dos itens/versões.

Antes de criar pedido, o mock verifica dono/validade da cotação, versão do carrinho, preços, disponibilidade e carteira. Uma cotação alterada retorna 409; o cliente pede nova revisão. Na liquidação também se verifica estoque/versões para impedir que pedidos concorrentes confirmem a mesma disponibilidade no cenário local.

A tentativa é gravada antes de enviar. A chave de idempotência é indexada por usuário e comparada ao fingerprint do conteúdo. Mesmo conteúdo retorna o mesmo pedido; outro conteúdo retorna 409. Falha de rede preserva a tentativa; rejeição definitiva de cotação permite descartá-la e obter nova cotação. 401/403 preservam o contexto para retomada. O botão de recuperação só aparece depois que o envio terminou, evitando uma segunda ação concorrente.

Pedidos seguem `pending → confirmed | declined`. Estados terminais não retrocedem. REST recupera pedido pendente após refresh; o polling de dois segundos funciona como reconciliação adicional ao socket. Apenas confirmação remove as quantidades compradas, uma única vez; recibo usa o snapshot imutável. A transação é fictícia.

## Tempo real e compatibilidade

MSW 2.15.0 com `@mswjs/socket.io-binding` 0.2.0. Essa versão publicada expõe `toSocketIo`, e não a API `SocketIo` mostrada na branch principal mais recente do repositório. Consultar documentação da versão instalada evita misturar APIs incompatíveis.

O cliente usa transporte WebSocket exclusivamente, namespace padrão e eventos JSON de texto. O mock faz o handshake/framing pelo binding e mantém heartbeat Engine.IO. MSW 2.15 normaliza o prefixo `/socket.io/`: o handler registra `wss://nft-marketplace.local/`, enquanto o cliente usa `/socket.io/`. Esse domínio é interceptado; não há servidor externo. Salas, namespaces adicionais, acknowledgements e binários não são utilizados.

`nft.updated` e `order.updated` carregam `eventId`, `resourceId`, `version`, `type` e, em evento privado, `userId`. O banco REST é a mesma fonte dos eventos. O cliente compara versões de eventos e dados REST, ignora duplicatas/antigos e verifica token/usuário antes de agir. Eventos invalidam recursos ativos e anunciam mudanças; reconexão força reconciliação REST. Listeners e versões em memória são descartados ao encerrar a sessão.

## Interface, acessibilidade e desempenho

Direção visual provisória: fundo claro, destaque violeta, cards de arte abstrata e tipografia Geist local. SVGs em `public/art` são substitutos provisórios dos assets do Figma. O acesso à cópia `T3mb62CfaKKBEad1KGr5Qy` foi confirmado; extração de tokens/assets e adaptação ainda estão pendentes. Não há comprovação de equivalência visual ao arquivo de referência.

Layout responsivo, campos com labels/erros associados, foco visível, link para pular navegação, feedback anunciado e skeletons dimensionados com preferência de movimento reduzido. Não foram introduzidos diálogos/drawers que exigiriam controle de foco adicional. Arte principal e fonte possuem preload; o build também antecipa a transferência do módulo MSW para evitar uma cascata de rede tardia; rotas têm code splitting e conexão Socket.IO é carregada quando há sessão.

## Verificação e limites

Testes automatizados foram escritos na etapa final por orientação do usuário. Playwright cobre a API MSW no navegador e eventos passam pelo socket real do cliente; endpoints de controle só configuram o mock. Baselines visuais usam relógio fixo, fixtures estáveis e movimento reduzido. Lighthouse mede build otimizado, três vezes por página/perfil; registrar medianas e diferenças das metas, sem confundir notas com garantia de acessibilidade completa.

A persistência é local à demonstração, sem sincronização transacional entre abas. Uma futura API real exigirá autorização, armazenamento seguro, pagamentos e infraestrutura de eventos reais, além de verificação dos contratos. Configuração de Vercel está preparada; publicação e fidelidade Figma precisam de evidência própria. Resultados executados e pendências ficam em `docs/execution/progress.md`.
