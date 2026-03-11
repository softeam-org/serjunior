---
title: Criando Páginas
order: 1
---

# Criando Páginas na Wiki

Toda página da wiki é um arquivo `.md` dentro da pasta `wiki/`. Não há nenhuma configuração adicional — basta criar o arquivo e ele aparece na sidebar automaticamente.

## Estrutura básica

Todo arquivo deve começar com um bloco de **frontmatter** seguido do conteúdo em Markdown:

```markdown
---
title: Minha Página
order: 1
---

# Título da Página

Conteúdo aqui.
```

## Campos do frontmatter

| Campo   | Tipo    | Obrigatório | Descrição                                             |
|---------|---------|-------------|-------------------------------------------------------|
| `title` | string  | Não         | Nome exibido na sidebar. Usa o nome do arquivo se omitido. |
| `order` | número  | Não         | Ordem dentro da seção. Padrão: `999` (final da lista). |

## Organizando com pastas

Subpastas dentro de `wiki/` viram **seções colapsáveis** na sidebar:

```
wiki/
  introducao.md          ← aparece solto na sidebar
  guia/
    criando-paginas.md   ← aparece dentro da seção "Guia"
    estilizacao.md
  referencia/
    api.md
```

### Prefixo numérico para ordenar

Adicione `N-` no início do nome da pasta ou arquivo para controlar a ordem:

```
wiki/
  01-introducao.md
  02-guia/
    01-criando-paginas.md
    02-estilizacao.md
  03-referencia/
    01-api.md
```

O prefixo é **removido automaticamente** do título exibido na sidebar.

> O campo `order` no frontmatter tem prioridade sobre o prefixo numérico do arquivo.

## Seções aninhadas

Aninhamento funciona em qualquer profundidade:

```
wiki/
  02-guia/
    01-basico/
      01-inicio.md
    02-avancado/
      01-performance.md
      02-deploy.md
```

Resultado na sidebar:

```
▾ Guia
  ▾ Basico
      Inicio
  ▾ Avancado
      Performance
      Deploy
```

## Sintaxe Markdown suportada

Esta wiki usa **GitHub Flavored Markdown (GFM)**, que inclui:

### Formatação de texto

```markdown
**negrito**   _itálico_   ~~tachado~~   `código inline`
```

**negrito** — _itálico_ — ~~tachado~~ — `código inline`

### Listas

```markdown
- Item A
- Item B
  - Subitem B1
  - Subitem B2

1. Primeiro
2. Segundo
3. Terceiro
```

### Links e imagens

```markdown
[Texto do link](https://exemplo.com)
![Alt da imagem](./imagem.png)
```

### Tabelas

```markdown
| Coluna A | Coluna B |
|----------|----------|
| Valor 1  | Valor 2  |
```

### Blocos de código

Use três crases e o nome da linguagem para highlight:

````markdown
```typescript
function saudacao(nome: string): string {
  return `Olá, ${nome}!`
}
```
````

```typescript
function saudacao(nome: string): string {
  return `Olá, ${nome}!`
}
```

### Citações

```markdown
> Isso é uma citação.
> Pode ter múltiplas linhas.
```

> Isso é uma citação.
> Pode ter múltiplas linhas.

### Linha horizontal

```markdown
---
```

---

### Checkbox (task lists)

```markdown
- [x] Tarefa concluída
- [ ] Tarefa pendente
```

- [x] Tarefa concluída
- [ ] Tarefa pendente
