

## Plano: Corrigir Exibicao dos Nichos no Modal

### 1. Diagnostico

O modal esta recebendo os dados corretamente do Supabase (17 nichos retornados com status 200), mas nao esta exibindo os cards.

**Causas identificadas:**

| Problema | Descricao |
|----------|-----------|
| ScrollArea sem altura | O componente `ScrollArea` do Radix precisa de altura definida (nao apenas `max-height`) para o viewport funcionar |
| Viewport colapsando | Com `overflow-hidden` e `h-full` sem altura fixa no pai, o conteudo nao renderiza visivelmente |
| Cards invisiveis inicialmente | Os cards iniciam com `opacity-0` e dependem da animacao para aparecer |

---

### 2. Solucao

Modificar o componente `NicheModal.tsx`:

#### 2.1 Corrigir altura do ScrollArea

```text
Antes:
  <ScrollArea className="max-h-[calc(90vh-160px)]">

Depois:
  <ScrollArea className="h-[calc(90vh-180px)] flex-1">
```

Usar `h-` (altura fixa) ao inves de apenas `max-h-` para que o ScrollArea funcione corretamente.

#### 2.2 Garantir que cards fiquem visiveis

Adicionar `fill-mode: forwards` corretamente no estilo e garantir fallback de opacidade:

```text
className={cn(
  isVisible 
    ? "animate-in fade-in slide-in-from-bottom-2 fill-mode-forwards"
    : "opacity-0 translate-y-2",
  "motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:animate-none"
)}
```

#### 2.3 Adicionar fallback para reduced-motion

Garantir que usuarios com `prefers-reduced-motion` vejam os cards imediatamente.

---

### 3. Alteracoes no Arquivo

**Arquivo:** `src/components/ui/NicheModal.tsx`

| Linha | Alteracao |
|-------|-----------|
| 84 | Mudar classe do ScrollArea de `max-h-[calc(90vh-160px)]` para `h-[calc(90vh-180px)]` |
| 115-119 | Simplificar logica de animacao dos cards para garantir visibilidade |

---

### 4. Codigo Corrigido

```tsx
{/* Content - com altura fixa */}
<ScrollArea className="h-[calc(90vh-180px)]">
  <div className="p-6">
    {isLoading ? (
      // ... loading state
    ) : filteredNiches.length === 0 ? (
      // ... empty state
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNiches.map((niche, index) => (
          <NicheCardCompact
            key={niche.id}
            name={niche.name}
            slug={niche.slug}
            description={niche.description}
            coverImage={niche.cover_image}
            onClick={() => onOpenChange(false)}
            className="motion-reduce:opacity-100"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              transitionDelay: `${index * 50}ms`,
            }}
          />
        ))}
      </div>
    )}
  </div>
</ScrollArea>
```

---

### 5. Resumo

| Item | Status |
|------|--------|
| Dados carregando | OK (17 nichos) |
| RLS configurado | OK |
| ScrollArea | Corrigir altura |
| Animacao dos cards | Simplificar para inline styles |

A correcao e simples e focada em garantir que:
1. O `ScrollArea` tenha altura definida para funcionar
2. Os cards fiquem visiveis apos a animacao

