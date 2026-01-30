
## Plano: Adicionar Blur Dourado Premium nos Vídeos

### 1. Conceito Visual

Adicionar um efeito de **glow/blur suave** na cor gold (dourado da identidade) atrás dos containers de vídeo, criando um aspecto mais cinematográfico e premium. O efeito será sutil para não competir com o conteúdo.

### 2. Locais Afetados

| Local | Componente | Descrição |
|-------|------------|-----------|
| Página de Nicho - Vídeo em Destaque | `NichoPage.tsx` | Vídeo lateral na seção "Incluído no Serviço" |
| Página de Nicho - Projetos Recentes | `NichoPage.tsx` | Grid de thumbnails de vídeo |
| Página Works | `Works.tsx` | Grid completo do portfólio |
| Player de Vídeo | `NicheVideoPlayer.tsx` | Componente base do player |

### 3. Implementação Técnica

#### 3.1 Nova Classe CSS Global (`src/index.css`)

Criar uma classe reutilizável `.video-glow` que adiciona o efeito:

```css
.video-glow {
  @apply relative;
}

.video-glow::before {
  content: '';
  @apply absolute -inset-4 rounded-2xl opacity-30 blur-2xl -z-10;
  background: linear-gradient(
    135deg, 
    hsl(var(--gold) / 0.4), 
    hsl(var(--gold-light) / 0.2)
  );
}

/* Hover enhancement */
.video-glow:hover::before {
  @apply opacity-50;
  transition: opacity 0.5s ease;
}
```

Características:
- **`-inset-4`**: Expande 16px além das bordas do vídeo
- **`blur-2xl`**: Blur de 40px para suavidade
- **`opacity-30`**: Bem sutil por padrão
- **`-z-10`**: Fica atrás do vídeo
- **Hover**: Aumenta a intensidade levemente

#### 3.2 Aplicar nos Componentes

**NichoPage.tsx - Vídeo em Destaque (linha 312):**
```tsx
<div className="aspect-video rounded-lg overflow-hidden video-glow">
```

**NichoPage.tsx - Projetos Recentes (linha 357):**
```tsx
<div className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer video-glow">
```

**Works.tsx - Grid de Projetos (linha 138):**
```tsx
<div className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer video-glow">
```

### 4. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/index.css` | Adicionar classe `.video-glow` com pseudo-elemento blur |
| `src/pages/NichoPage.tsx` | Aplicar classe `video-glow` nos containers de vídeo |
| `src/pages/Works.tsx` | Aplicar classe `video-glow` nos cards do portfólio |

### 5. Resultado Visual Esperado

```text
┌─────────────────────────────────┐
│    ░░░░░░░░░░░░░░░░░░░░░░░░░   │  ← Blur dourado sutil
│  ░░┌───────────────────────┐░░ │
│  ░░│                       │░░ │
│  ░░│      📹 VÍDEO        │░░ │
│  ░░│                       │░░ │
│  ░░└───────────────────────┘░░ │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────┘
```

### 6. Respeito a prefers-reduced-motion

O efeito de blur é estático, então não precisa ser desabilitado para usuários com reduced-motion.

### 7. Benefícios

- Visual mais premium e cinematográfico
- Reforça a identidade visual (cor gold)
- Efeito sutil que não distrai do conteúdo
- Classe reutilizável para futuros componentes
- Zero impacto na performance (CSS puro)
