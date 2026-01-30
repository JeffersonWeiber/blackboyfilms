

## Plano: Categorias Dinâmicas na Página Works

### 1. Problema Atual

A página Works usa uma lista fixa de categorias hardcoded no código:

```typescript
const categories = [
  { id: "all", label: "Todos" },
  { id: "casamento", label: "Casamento" },
  { id: "eventos", label: "Eventos" },
  // ... fixo
];
```

Isso não reflete os nichos gerenciados dinamicamente no Admin.

---

### 2. Solução

Usar o hook `useActiveNiches()` já existente para buscar todas as categorias ativas do banco de dados e exibi-las como filtros.

---

### 3. Mudanças no Works.tsx

| Item | Atual | Novo |
|------|-------|------|
| Categorias | Array hardcoded | Query do banco de dados |
| Dependência | Nenhuma | `useActiveNiches()` |
| Loading | Não existe | Skeleton nos filtros |

#### 3.1 Código Atual vs Novo

**Antes:**
```typescript
const categories = [
  { id: "all", label: "Todos" },
  { id: "casamento", label: "Casamento" },
  // ... hardcoded
];
```

**Depois:**
```typescript
const { data: niches, isLoading: isLoadingNiches } = useActiveNiches();

const categories = [
  { id: "all", label: "Todos" },
  ...(niches?.map(n => ({ id: n.slug, label: n.name })) || []),
];
```

#### 3.2 Atualização do Filtro

O filtro atual compara `p.niche === activeCategory`. Isso continuará funcionando porque:
- O campo `niche` nos portfolio_items usa o `slug` do nicho
- Os nichos no banco têm um campo `slug` único

#### 3.3 Loading State para Filtros

Enquanto os nichos carregam, exibir um loading sutil:

```tsx
{isLoadingNiches ? (
  <div className="flex justify-center gap-3 mb-12">
    {[1, 2, 3, 4, 5].map(i => (
      <Skeleton key={i} className="w-24 h-10 rounded-full" />
    ))}
  </div>
) : (
  <div className="flex flex-wrap justify-center gap-3 mb-12">
    {categories.map((cat) => (
      // ... botões de filtro
    ))}
  </div>
)}
```

---

### 4. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Works.tsx` | Usar `useActiveNiches()` para categorias dinâmicas |

---

### 5. Fluxo

```text
[Página Works carrega]
        |
        v
[useActiveNiches() busca nichos ativos]
        |
        v
[Monta array de categorias: "Todos" + nichos]
        |
        v
[Renderiza filtros com todas as categorias]
        |
        v
[Usuário clica em categoria]
        |
        v
[Filtra projetos pelo slug do nicho]
```

---

### 6. Benefícios

- Filtros sempre sincronizados com nichos cadastrados no Admin
- Novos nichos aparecem automaticamente
- Nichos desativados não aparecem como filtro
- Respeita a ordem de exibição (`display_order`)

