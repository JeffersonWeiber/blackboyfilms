

## Plano: Redesenhar os Cards de Nicho

Atualizar o componente `NicheCard` para seguir o design da imagem de referência, com a imagem na parte superior e uma área de texto com fundo escuro sólido na parte inferior.

### Mudanças Visuais

**Layout Atual:**
- Imagem preenche todo o card
- Texto sobreposto na parte inferior com gradiente transparente
- Difícil leitura em algumas imagens

**Novo Layout (conforme referência):**
- Card dividido em duas partes:
  - **Topo (~60%)**: Imagem com leve fade escuro na borda inferior
  - **Base (~40%)**: Área sólida escura com borda arredondada para o texto
- Título em fonte grande e dourada
- Descrição em texto claro
- Link "Ver mais" com seta dourada

### Arquivos a Modificar

1. **`src/components/ui/NicheCard.tsx`**
   - Reestruturar o layout do card para ter duas seções distintas
   - Imagem na parte superior com `rounded-t-lg`
   - Container de texto na parte inferior com fundo sólido `bg-card` ou similar
   - Título com classe `text-gold` ou `text-gradient`
   - Manter o efeito de zoom no hover da imagem

2. **`src/index.css`**
   - Ajustar os estilos do `.niche-card` para o novo layout
   - Atualizar o gradiente `::before` para ser mais sutil, apenas na transição entre imagem e texto

### Estrutura do Novo Card

```text
┌─────────────────────────────┐
│                             │
│         IMAGEM              │
│      (com zoom hover)       │
│                             │
│ ─────────fade escuro─────── │
├─────────────────────────────┤
│                             │
│   CASAMENTO                 │  ← Título dourado
│                             │
│   Descrição do serviço      │  ← Texto branco/cinza
│   em 2-3 linhas...          │
│                             │
│   Ver mais →                │  ← Link dourado
│                             │
└─────────────────────────────┘
```

### Detalhes Técnicos

- Altura total do card mantida: `h-80 md:h-96`
- Proporção aproximada: 55% imagem / 45% texto
- Fundo da área de texto: `bg-card` (7% black) ou `bg-background/95`
- Bordas arredondadas: `rounded-lg` no card, `rounded-t-lg` na imagem
- Efeito hover na imagem (zoom) permanece
- Transição suave no link "Ver mais"

