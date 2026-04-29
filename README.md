# App Orcamento Pessoal

Aplicacao para controle financeiro pessoal com cadastro, consulta, filtro e exclusao de despesas usando localStorage.

## Stack Atual

- React
- Rsbuild
- Bun
- Bootstrap
- localStorage

## Funcionalidades

- Cadastro de despesa com validacao de campos
- Consulta e filtro por data, tipo, descricao e valor
- Exclusao de despesa
- Persistencia local no navegador

## Estrutura

- src/components: componentes reutilizaveis (Navbar e Modal)
- src/pages: paginas Cadastro e Consulta
- src/services: servico de dados/localStorage
- public: arquivos estaticos
- legacy: implementacao antiga em HTML/JS puro

## Como Rodar

1. Instale dependencias:

```bash
bun install
```

2. Inicie ambiente de desenvolvimento:

```bash
bun run dev
```

3. Gere build de producao:

```bash
bun run build
```

4. Visualize o build:

```bash
bun run preview
```

## Observacoes

- O codigo original foi preservado em legacy/index.html, legacy/consulta.html e legacy/script/app.js.
