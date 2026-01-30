
## Plano: Corrigir Visibilidade das Seções nas Páginas de Nicho

### 1. Problema Identificado

A seção "O Que Oferecemos" e o vídeo lateral estão invisíveis porque:
- A classe CSS `reveal` define `opacity: 0` por padrão
- O hook `useScrollReveal` usa IntersectionObserver para adicionar `visible` (opacity: 1)
- O Observer não está disparando corretamente na navegação entre páginas (SPA behavior)
- O scroll é resetado para o topo, mas o elemento pode já estar visível antes do Observer ser registrado

### 2. Solução Proposta

Modificar o componente `NichoPage.tsx` para **não depender exclusivamente** do scroll reveal na seção de benefícios, garantindo que o conteúdo seja visível imediatamente ou após um pequeno delay.

---

### 3. Mudanças Específicas

#### 3.1 Arquivo: `src/pages/NichoPage.tsx`

**Problema atual (linha 264-266):**
```tsx
<div
  ref={ref}
  className={cn("grid lg:grid-cols-2 gap-12 lg:gap-20 items-center reveal", isVisible && "visible")}
>
```

**Solução:** Adicionar um `useEffect` que força `visible` após um pequeno delay quando os dados do nicho carregam, garantindo que o conteúdo apareça mesmo se o Observer falhar:

```tsx
const [forceVisible, setForceVisible] = useState(false);

useEffect(() => {
  if (nicheData) {
    // Force visibility after a short delay to ensure content is shown
    const timer = setTimeout(() => {
      setForceVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }
}, [nicheData]);
```

E atualizar a className:
```tsx
className={cn(
  "grid lg:grid-cols-2 gap-12 lg:gap-20 items-center reveal", 
  (isVisible || forceVisible) && "visible"
)}
```

---

### 4. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/NichoPage.tsx` | Adicionar `forceVisible` state e useEffect para garantir visibilidade após carregamento dos dados |

---

### 5. Benefícios

- Conteúdo sempre visível após o carregamento
- Mantém a animação de scroll reveal quando funciona
- Fallback seguro para quando o Observer não dispara
- Compatível com navegação SPA (React Router)

---

### 6. Impacto

- Zero quebras de funcionalidade existente
- Melhora significativa na UX das páginas de nicho
- Padrão já usado com sucesso em `NichosSection.tsx` (linha 18-24 do código existente)
