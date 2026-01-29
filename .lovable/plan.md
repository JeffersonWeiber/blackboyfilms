

## Plano: Corrigir Exibicao do Portfolio na Pagina Works

### Problema Identificado

O portfolio nao exibe projetos quando uma categoria e selecionada porque:

1. O CSS `.reveal-stagger > *` define `opacity: 0` para todos os filhos do grid
2. O hook `useScrollReveal` usa Intersection Observer com `triggerOnce: true`
3. Quando a pagina carrega, o grid esta vazio (dados ainda nao chegaram do Supabase)
4. O observer dispara com `isIntersecting: true` antes dos dados carregarem
5. Quando os dados chegam, `isVisible` pode nao ser mais atualizado porque o observer ja foi desconectado
6. Resultado: os cards ficam com `opacity: 0` permanentemente

### Solucao

Ajustar a logica de visibilidade para garantir que:
- A animacao so inicie apos os dados terem sido carregados
- O Intersection Observer seja re-configurado quando os dados mudarem
- O filtro de categoria funcione corretamente com a animacao

---

### Alteracoes Necessarias

#### Arquivo: `src/pages/Works.tsx`

**1. Forcar visibilidade quando dados estiverem carregados**

Adicionar logica para que o grid so use a animacao apos os dados estarem disponiveis:

```text
ANTES:
- Grid usa reveal-stagger sempre
- isVisible depende apenas do IntersectionObserver
- Quando dados carregam, observer ja pode ter desconectado

DEPOIS:
- Se nao esta carregando E tem projetos: aplicar visible imediatamente
- OU: manter a animacao mas resetar quando a categoria mudar
- Alternativa mais simples: remover animacao do grid ou forcar visible quando ha dados
```

**2. Opcao Recomendada: Simplificar a animacao**

Como o conteudo e dinamico e depende de dados assincronos, a abordagem mais robusta e:

```text
Opcao A (mais simples):
- Remover reveal-stagger do grid
- Manter apenas a animacao de hover nos cards
- Os projetos aparecem imediatamente quando carregados

Opcao B (manter animacao):
- Adicionar condicao: se !isLoading && projects existe, forcar visible
- className={cn(
    "grid ... reveal-stagger",
    (isVisible || (!isLoading && filteredProjects?.length)) && "visible"
  )}
```

**3. Estrutura do codigo proposto:**

```text
// Mudar a logica de className no grid:

<div
  ref={ref}
  className={cn(
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger",
    // Forcar visible quando dados estao carregados OU observer detectou
    (isVisible || (!isLoading && filteredProjects && filteredProjects.length > 0)) && "visible"
  )}
>
```

---

### Comportamento Esperado

1. Usuario acessa `/works`
2. Filtros aparecem: Todos, Casamento, Eventos, Clinicas, etc
3. Com "Todos" selecionado: todos os projetos publicados aparecem
4. Ao clicar em "Casamento": apenas projetos do nicho casamento aparecem
5. Projetos exibem thumbnail, titulo, tag de categoria
6. Ao clicar no projeto: abre modal com video
7. Animacao de entrada funciona corretamente

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Works.tsx` | Corrigir logica de visibilidade para funcionar com dados dinamicos |

---

### Nota Tecnica

Esta e uma correcao pontual. Para uma solucao mais robusta no futuro, o hook `useScrollReveal` poderia aceitar uma dependencia para re-observar quando os dados mudam, ou um parametro `enabled` para so iniciar a observacao quando os dados estiverem prontos.

