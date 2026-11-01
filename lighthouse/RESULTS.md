# Resultado da auditoria Lighthouse — Kurio

Auditoria do build otimizado em 31/10/2026, com MSW habilitado e servido em `http://127.0.0.1:4174`. Foram executadas três medições por página/perfil, sem testes concorrentes. A tabela apresenta a mediana por métrica das 12 execuções.

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO |    LCP |    CLS |    TBT |
| ------- | ------- | ----------: | ------------: | -------------: | --: | -----: | -----: | -----: |
| Início  | mobile  |          86 |           100 |            100 | 100 | 3.87 s | 0.0000 | 168 ms |
| Início  | desktop |          99 |           100 |            100 | 100 | 0.83 s | 0.0000 |   0 ms |
| Detalhe | mobile  |          86 |           100 |            100 | 100 | 4.06 s | 0.0000 | 104 ms |
| Detalhe | desktop |          99 |           100 |            100 | 100 | 0.91 s | 0.0000 |   0 ms |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95 e SEO ≥ 90. **As metas de desempenho mobile ainda não foram atingidas:** ambas as páginas estão 4 pontos abaixo. Desktop e as demais categorias atingiram as metas. Notas automáticas não comprovam acessibilidade completa nem fidelidade visual.

## O que foi corrigido

A primeira auditoria da home Kurio, com PNGs originais como entrega de imagem, teve mediana P74/A98. Foram criadas variantes WebP em 320/640/960/1254 px, qualidade 90, mantendo os PNGs originais intactos. O retrato do hero na variante 320 passa de 1.885.435 para 16.882 bytes; o navegador escolhe a variante adequada com `srcset`/`sizes`. O preload universal do PNG foi substituído por pistas de carregamento específicas da rota e do tamanho exibido. A composição do Figma foi mantida e as capturas foram conferidas. A compressão é com perda; os originais permanecem disponíveis.

Um título de catálogo acessível corrigiu o salto de hierarquia no mobile. No detalhe, a auditoria revelou CLS 0,348: o React reutilizava o nó do texto de carregamento como galeria, porque a ordem dos filhos diferia entre skeleton e conteúdo. A estrutura agora corresponde à tela carregada, incluindo a altura da navegação mobile. O teste verifica posição e dimensões. O CLS mediano final é zero nas quatro combinações.

A antecipação das dependências estáticas do MSW e dos módulos das rotas públicas reduz a descoberta tardia de recursos, sem renderizar a aplicação antes do worker. Uma experiência com registro tardio dos handlers de socket trouxe ganho insuficiente e foi descartada; a integração original foi preservada.

## Limite atual e próximos passos

O custo restante concentra-se no LCP mobile de 3,87–4,06 s, que inclui carregar e executar a SPA, iniciar o MSW obrigatório e consultar o recurso do detalhe. Os mocks, a latência e os fluxos não foram removidos para melhorar a pontuação. Alterações futuras devem ser medidas no mesmo cenário e manter os testes funcionais.

A publicação ainda exige autorização da equipe Vercel. Depois dela, medir o build no domínio publicado permitirá avaliar o comportamento de transferência e cache daquele ambiente; não há garantia antecipada de nota maior.

## Reprodução e evidências

O runner padrão continua executando toda a matriz com `yarn lighthouse`. Para repetir uma combinação:

```sh
AUDIT_URL=http://127.0.0.1:4174 AUDIT_PAGE=detail AUDIT_PROFILE=mobile AUDIT_OUTPUT=lighthouse/reports/kurio-final/detail-mobile yarn lighthouse
```

Depois das quatro combinações, `node scripts/summarize-lighthouse.mjs` agrega os resultados e verifica origem, três medições por combinação e o mesmo hash de manifesto do build. Relatórios HTML/JSON completos estão em `lighthouse/reports/kurio-final/{home|detail}-{mobile|desktop}/`; agregado em `lighthouse/reports/kurio-final/summary.json`. São arquivos locais ignorados no Git; este resumo é versionado.

Manifesto do build auditado (SHA-256): `2d83a0a5c9d4bc70cbe4a056f46bfa0ec9ed88852be477f6c8175b56eaed1789`.

Ambiente: Linux, Node.js 24.13.0, Lighthouse 13.6.0 e Chromium do Playwright 1.64.1. Mobile usa a simulação padrão do Lighthouse; desktop usa 1440×1000, RTT 40 ms, 10240 Kbps e CPU slowdown 1. Resultados variam conforme ambiente; não representam dispositivo físico.

O mesmo candidato foi instalado e compilado em pasta isolada. Os 206 arquivos de dist coincidem byte a byte com os locais. A detecção de classes Tailwind está limitada a src; documentos e relatórios não influenciam o CSS. As medições diagnósticas anteriores não substituem esta matriz final.
