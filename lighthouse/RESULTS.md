# Resultado da auditoria Lighthouse

Data: 31/10/2026. Build de produção com MSW habilitado, servido em `http://127.0.0.1:4173`. Três medições por página/perfil; valores abaixo são medianas das três execuções, calculadas por métrica.

| Página  | Perfil  | Performance | Accessibility | Best Practices | SEO |    LCP |    CLS |   TBT |
| ------- | ------- | ----------: | ------------: | -------------: | --: | -----: | -----: | ----: |
| Início  | mobile  |          90 |           100 |            100 | 100 | 3.54 s | 0.0000 | 91 ms |
| Início  | desktop |         100 |           100 |            100 | 100 | 0.21 s | 0.0000 |  0 ms |
| Detalhe | mobile  |          88 |           100 |            100 | 100 | 3.83 s | 0.0000 | 89 ms |
| Detalhe | desktop |         100 |           100 |            100 | 100 | 0.79 s | 0.0004 |  0 ms |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. A página de detalhe mobile ficou **2 pontos abaixo** da meta de desempenho. As demais metas foram atingidas. Pontuações automáticas não substituem avaliação humana de acessibilidade ou comparação com o Figma.

O principal custo restante no detalhe é o LCP durante a inicialização da SPA, que aguarda o MSW e a consulta REST antes de apresentar os dados da obra. O mock faz parte obrigatória da demonstração; não foi removido para melhorar a nota. Houve preload da fonte/arte, carregamento paralelo do módulo MSW, divisão de rotas e correção do skeleton. A auditoria inicial do detalhe tinha CLS 0.105; a versão final reserva o espaço e eliminou essa mudança de layout. Uma próxima otimização pode estudar antecipação do módulo da rota de detalhe, mantendo o mesmo fluxo de dados.

Ambiente: Linux, Node.js 24.13.0, Lighthouse 13.6.0, Chromium 156.0.8078.4 do Playwright 1.64.1. Mobile usa a simulação padrão do Lighthouse; desktop usa 1440×1000, RTT 40 ms, 10240 Kbps e CPU slowdown 1. Configuração versionada em `scripts/lighthouse.mjs`. Resultados variam com ambiente e throttling; não representam medição em dispositivo físico.

Relatórios completos: `lighthouse/reports/{home|detail}-{mobile|desktop}-{1|2|3}.{html|json}` e `lighthouse/reports/summary.json`. Arquivos completos permanecem locais e ignorados no Git; este resumo é versionado. Reproduzir com `yarn build`, `yarn preview --host 127.0.0.1` e, em outro terminal, `yarn lighthouse`.
