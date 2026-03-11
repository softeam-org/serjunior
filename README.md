# SerJunior

Landing page e wiki geradas automaticamente a partir de arquivos Markdown.

## Sumário

- [Rodando localmente](#rodando-localmente)
- [Adicionando páginas à wiki](#adicionando-páginas-à-wiki)
- [Frontmatter](#frontmatter)
- [Ordenação](#ordenação)
- [Seções e subseções](#seções-e-subseções)
- [HTML dentro do Markdown](#html-dentro-do-markdown)
- [Estilização](#estilização)
- [Deploy](#deploy)

---

## Rodando localmente

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## Adicionando páginas à wiki

Basta criar um arquivo `.md` dentro da pasta `wiki/`. A sidebar é gerada automaticamente — nenhuma configuração manual necessária.

```
wiki/
  minha-pagina.md      ← nova página disponível em /#/wiki/minha-pagina
```

---

## Frontmatter

Cada página suporta um bloco de frontmatter no topo do arquivo com os seguintes campos:

```markdown
---
title: Minha Página
order: 2
---

# Conteúdo aqui
```

| Campo   | Tipo    | Descrição                                                             |
|---------|---------|-----------------------------------------------------------------------|
| `title` | string  | Nome exibido na sidebar. Se omitido, usa o nome do arquivo formatado. |
| `order` | número  | Posição na sidebar dentro da seção. Padrão: `999`.                    |

---

## Ordenação

Há duas formas de controlar a ordem dos itens na sidebar:

### 1. Frontmatter `order` (páginas)

```markdown
---
title: Introdução
order: 1
---
```

### 2. Prefixo numérico no nome do arquivo ou pasta

Adicione um prefixo `N-` ao nome do arquivo ou diretório. O prefixo é removido do título exibido.

```
wiki/
  01-introducao.md        → título "Introducao", ordem 1
  02-primeiros-passos.md  → título "Primeiros Passos", ordem 2
  03-guias/               → seção "Guias", ordem 3
    01-basico.md
    02-avancado.md
```

> O frontmatter `order` tem prioridade sobre o prefixo numérico do arquivo.

---

## Seções e subseções

Subdiretórios dentro de `wiki/` viram seções colapsáveis na sidebar. Aninhamento de qualquer profundidade é suportado.

```
wiki/
  01-introducao.md
  02-guias/
    01-instalacao.md
    02-configuracao.md
    03-topicos-avancados/
      01-performance.md
      02-deploy.md
```

A sidebar ficará assim:

```
Introducao
▾ Guias
    Instalacao
    Configuracao
  ▾ Topicos Avancados
      Performance
      Deploy
```

As seções que contêm a página ativa são abertas automaticamente ao navegar.

---

## HTML dentro do Markdown

Como o plugin `rehype-raw` está habilitado, você pode inserir HTML puro em qualquer arquivo `.md` para criar layouts customizados.

```markdown
## Minha seção

Texto normal em Markdown.

<div class="meu-layout">
  <div class="coluna">Coluna 1</div>
  <div class="coluna">Coluna 2</div>
</div>
```

Estilize o HTML com classes CSS em `src/styles/wiki.css`.

---

## Estilização

| Arquivo                      | Responsável por                              |
|------------------------------|----------------------------------------------|
| `src/styles/global.css`      | Variáveis CSS globais, resets                |
| `src/styles/landing.css`     | Estilos da landing page                      |
| `src/styles/wiki.css`        | Estilos da wiki (sidebar, artigo, tipografia)|

As variáveis CSS definidas em `global.css` são usadas em todo o projeto. Alterar uma cor lá reflete em tudo:

```css
:root {
  --color-primary: #4f46e5;  /* altera a cor de destaque em todo o site */
}
```

---

## Deploy

O deploy é feito automaticamente via GitHub Actions ao fazer push na branch `main`. O workflow em `.github/workflows/deploy.yml` compila o projeto e publica na branch `gh-pages`.

**Configuração necessária no repositório:**

1. Vá em **Settings → Pages**
2. Em **Source**, selecione **Deploy from a branch**
3. Selecione a branch **`gh-pages`** e a pasta **`/ (root)`**
4. Salve

O site estará disponível em `https://<seu-usuario>.github.io/<nome-do-repositório>/`.
