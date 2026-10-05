# Catálogo de Produtos

Página responsiva de consulta de produtos que consome a API pública [DummyJSON](https://dummyjson.com/docs/products).

## Tecnologias

- HTML5 semântico
- CSS3 (custom properties, grid, flexbox, media queries)
- JavaScript puro (ES Modules), sem frameworks e sem etapa de build

## Como executar

Por usar ES Modules, o projeto precisa ser servido por HTTP (abrir o `index.html` direto pelo `file://` é bloqueado pelo navegador). Dentro da pasta do projeto, use qualquer servidor estático:

# ou Node.js
npx serve .
```

Depois acesse `http://localhost:8080`. Também funciona com a extensão Live Server do VS Code.

## Funcionalidades

- Listagem em tabela: imagem, produto, categoria, preço, estoque, avaliação e ação de detalhes
- Tela de detalhes com nome, imagem, descrição, categoria, marca (quando existe), preço, desconto, preço com desconto, avaliação, estoque e tags (quando existem)
- URL compartilhável para os detalhes: `#/produtos/1`
- Estados de carregamento, erro (com botão "Tentar novamente"), lista vazia e sucesso
- Busca por produto, filtro por categoria, ordenação por preço/avaliação, paginação e escolha de itens por página
- Os filtros ficam na URL (`#/?q=phone&page=2`), então o "Voltar ao catálogo" restaura a lista
- Tratamento de imagem indisponível
- Layout responsivo; em telas até 720px a tabela vira uma lista de cartões

## Decisões técnicas

- **Roteamento por hash** (`#/produtos/1`): funciona em qualquer servidor estático, sem configuração de rewrite.
- **`toElement(html)`**: helper que converte uma string HTML em elemento usando `<template>`, evitando longas cadeias de `document.createElement`. Todo dado vindo da API passa por `esc()` antes de entrar no template.
- **Organização**: `api.js` (requisições), `format.js` (formatação), `dom.js` (helpers), `components.js` (peças reutilizáveis), `views/` (telas) e `main.js` (rotas).
- **Busca e categoria são excludentes**, pois a API do DummyJSON não combina os dois filtros no mesmo endpoint.
- **Requisições concorrentes**: um contador de requisição descarta respostas antigas, evitando que uma resposta lenta sobrescreva a mais recente. A busca usa debounce de 350 ms.
- **Acessibilidade**: `caption` e `th scope` na tabela, `alt` nas imagens, rótulos nos campos, links "Ver detalhes de {produto}" com texto completo para leitores de tela, regiões `aria-live` para os estados, foco movido para o título ao trocar de tela, foco visível e cores com contraste adequado.
- **Moeda**: a API retorna valores em dólar, então os preços são formatados como USD no padrão pt-BR.
