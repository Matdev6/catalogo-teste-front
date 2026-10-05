# Catálogo de Produtos

Página responsiva de consulta de produtos que consome a API pública [DummyJSON](https://dummyjson.com/docs/products).

## Tecnologias

- HTML5 semântico
- CSS3 (custom properties, grid, flexbox, media queries)
- JavaScript puro (ES Modules), sem frameworks e sem etapa de build

## Como executar

Como o projeto utiliza ES Modules, ele precisa ser servido por HTTP. Abrir o `index.html` diretamente pelo protocolo `file://` pode causar bloqueios no navegador.

### Opção 1 — Live Server no VS Code

1. Instale a extensão **Live Server** no Visual Studio Code.
2. Abra a pasta do projeto no VS Code.
3. Clique com o botão direito no arquivo `index.html`.
4. Selecione **Open with Live Server**.

O projeto será aberto automaticamente no navegador, normalmente em um endereço como:

```txt
http://127.0.0.1:5500
```

### Opção 2 — Node.js

Caso tenha Node.js instalado, também é possível utilizar um servidor estático pelo terminal:

```bash
npx serve .
```

Depois, acesse o endereço exibido no terminal.

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
- **Criação de componentes com `<template>`**: os componentes visuais são montados a partir de strings HTML e convertidos em elementos reais do DOM usando um elemento `<template>`. O helper `toElement(html)` insere o HTML em `template.innerHTML` e retorna o primeiro elemento criado. Isso evita longas sequências de `document.createElement`, `appendChild` e atribuições manuais, mantendo a criação dos componentes mais legível.
- **`toElement(html)`**: centraliza essa conversão de HTML em elemento DOM. Antes de dados vindos da API serem inseridos nos templates, eles passam por `esc()` para escapar caracteres especiais e evitar que conteúdo externo seja interpretado como HTML.
- **Componentização em JavaScript puro**: funções como `productDetail()`, `statusBox()` e outras retornam elementos do DOM prontos para serem inseridos na página, funcionando como componentes reutilizáveis sem a necessidade de frameworks como React ou Vue.
- **Organização**: `api.js` (requisições), `format.js` (formatação), `dom.js` (helpers), `components.js` (peças reutilizáveis), `views/` (telas) e `main.js` (rotas).
- **Busca e categoria são excludentes**, pois a API do DummyJSON não combina os dois filtros no mesmo endpoint.
- **Requisições concorrentes**: um contador de requisição descarta respostas antigas, evitando que uma resposta lenta sobrescreva a mais recente. A busca usa debounce de 350 ms.
- **Acessibilidade**: `caption` e `th scope` na tabela, `alt` nas imagens, rótulos nos campos, links "Ver detalhes de {produto}" com texto completo para leitores de tela, regiões `aria-live` para os estados, foco movido para o título ao trocar de tela, foco visível e cores com contraste adequado.
- **Moeda**: a API retorna valores em dólar, então os preços são formatados como USD no padrão pt-BR.