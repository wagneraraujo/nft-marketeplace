# Lighthouse

Execute `yarn build`, depois `yarn preview --host 127.0.0.1` em outro terminal e `yarn lighthouse`.

O script audita início e detalhe em mobile/desktop, três vezes por combinação, usando o Chromium do Playwright. Gera HTML/JSON por execução e `reports/summary.json` com medianas, ambiente e LCP/CLS/TBT. Versões exatas das ferramentas estão no `yarn.lock`; os relatórios individuais registram a versão do Lighthouse e o navegador.

Metas: Performance 90, Accessibility 95, Best Practices 95, SEO 90. Comparar as medianas reais às metas; o comando não altera funcionalidades para melhorar pontuação. `AUDIT_URL` permite alterar o endereço local.
