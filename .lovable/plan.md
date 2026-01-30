
## Plano: Corrigir Warnings de Refs nos Componentes

### 1. Problema Identificado

Os console logs mostram warnings de "Function components cannot be given refs":
- `Skeleton`
- `SectionTitle`
- `VideoModal`

Esses warnings podem causar comportamento inconsistente de renderização, especialmente quando os componentes recebem refs indiretamente através de componentes pai.

---

### 2. Solução

Adicionar `React.forwardRef()` aos componentes que podem receber refs, permitindo que o React gerencie corretamente a passagem de referências.

---

### 3. Mudanças por Arquivo

| Arquivo | Problema | Solução |
|---------|----------|---------|
| `src/components/ui/skeleton.tsx` | Componente funcional simples sem forwardRef | Envolver com forwardRef |
| `src/components/ui/SectionTitle.tsx` | Componente funcional sem forwardRef | Envolver com forwardRef |
| `src/components/ui/VideoModal.tsx` | Componente funcional sem forwardRef | Envolver com forwardRef |

---

### 4. Código Atual vs Novo

#### 4.1 Skeleton.tsx

**Antes:**
```tsx
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
```

**Depois:**
```tsx
const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
  }
);
Skeleton.displayName = "Skeleton";
```

#### 4.2 SectionTitle.tsx

**Antes:**
```tsx
export function SectionTitle({ title, subtitle, align, className }: SectionTitleProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return <div ref={ref} ... />;
}
```

**Depois:**
```tsx
export const SectionTitle = React.forwardRef<HTMLDivElement, SectionTitleProps>(
  ({ title, subtitle, align = "center", className }, forwardedRef) => {
    const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
    
    // Combinar refs se necessário
    return <div ref={ref} ... />;
  }
);
SectionTitle.displayName = "SectionTitle";
```

#### 4.3 VideoModal.tsx

**Antes:**
```tsx
export function VideoModal({ isOpen, onClose, videoUrl, videoType }: VideoModalProps) {
  // ...
}
```

**Depois:**
```tsx
export const VideoModal = React.forwardRef<HTMLDivElement, VideoModalProps>(
  ({ isOpen, onClose, videoUrl, videoType }, ref) => {
    // ...
  }
);
VideoModal.displayName = "VideoModal";
```

---

### 5. Benefícios

- Elimina warnings de refs no console
- Renderização mais consistente
- Componentes mais robustos e compatíveis com bibliotecas de terceiros
- Melhor integração com animações e scroll

---

### 6. Nota Importante

Além dessas correções, recomendo que você faça um **hard refresh** (Ctrl+Shift+R no Windows/Linux, Cmd+Shift+R no Mac) para garantir que o cache do navegador seja limpo e a versão mais recente do código seja carregada.
