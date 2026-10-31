# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Colecionadores que exploram NFTs, mantêm favoritos e carrinho e concluem uma compra simulada. O projeto também é avaliado como desafio técnico frontend.

## Product Purpose

Implementar o marketplace especificado em docs/AGENTS.md com os fluxos reais sobre MSW e o visual da referência Figma fornecida por Wagner.

## Operating Context

Aplicação React/Vite existente, desenvolvida e executada localmente; dados e pagamentos simulados no navegador. Viewports de avaliação: 390, 768 e 1440 px; referência mobile de 414 px.

## Capabilities and Constraints

Catálogo com URL tipada, favoritos, sessão isolada, carrinho, cotação autoritativa, idempotência de compra, pedidos recuperáveis, Socket.IO/MSW, perfil e carteiras. Preservar essas funções e as alterações locais anteriores. Não criar backend, pagamentos reais ou integração blockchain. Ações editoriais e sociais sem implementação devem indicar indisponibilidade.

## Brand Commitments

A fonte de verdade visual é a cópia Figma T3mb62CfaKKBEad1KGr5Qy, página 0:1, com a marca Kurio. A direção provisória anterior deve ser substituída pelo sistema do arquivo, sem nova escolha estética.

## Evidence on Hand

Contratos, mocks e E2E existentes. Os 15 contextos Figma, exports locais e capturas de referência estão em docs/figma e public/figma. Os resultados anteriores de testes/auditoria são históricos e precisam de nova validação após a adaptação.

## Product Principles

- Contratos e mocks mantêm as regras comerciais.
- A interface confirma apenas resultados realmente retornados pelo mock.
- Dados privados e eventos permanecem isolados por usuário.
- Fidelidade visual não justifica controles que aparentem sucesso sem operação.

## Accessibility & Inclusion

Teclado, foco visível, labels/erros associados, anúncios acessíveis, layouts sem overflow e preferência de movimento reduzido. Diálogos devem controlar foco e permitir fechamento.
