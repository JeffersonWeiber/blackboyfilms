

## Plano: Ajustar Hero para Layout com Logo Centralizada

### 1. Visao Geral das Mudancas

| Componente | Estado Atual | Estado Desejado |
|------------|--------------|-----------------|
| Header (logo) | Logo completa "BLACKBOY FILMS" | Apenas icone "B" (favicon) |
| Hero | Titulo "HISTORIAS QUE INSPIRAM" | Logo grande centralizada |
| Hero texto | "Producao Audiovisual Premium" acima do titulo | Abaixo da logo |

---

### 2. Mudancas no Header

**Arquivo:** `src/components/layout/Header.tsx`

Trocar a logo completa pelo icone (favicon):

| Antes | Depois |
|-------|--------|
| `logo-blackboy-films.svg` (logo completa) | Novo arquivo `logo-icon.svg` (apenas o "B") |
| Altura: `h-8 md:h-10` | Altura: `h-8 md:h-10` (mantida) |

O icone "B" ja existe em `public/favicon.svg`, mas precisamos copia-lo para `src/assets/logo-icon.svg` para usar como import ES6.

---

### 3. Mudancas no Hero

**Arquivo:** `src/components/home/HeroSection.tsx`

**Nova estrutura (de cima para baixo):**

```text
+--------------------------------------------------+
|                                                  |
|              [LOGO GRANDE CENTRALIZADA]          |
|                 BLACKBOY FILMS                   |
|                                                  |
|         PRODUCAO AUDIOVISUAL PREMIUM             |
|                                                  |
|   Transformamos ideias em experiencias...        |
|                                                  |
|    [Receber Proposta]   [Ver Portfolio]          |
|                                                  |
+--------------------------------------------------+
```

**Alteracoes especificas:**

| Elemento | Mudanca |
|----------|---------|
| Logo grande | Adicionar `<img>` da logo completa no topo, centralizada |
| Tamanho logo | Desktop: `max-w-md` (~400px), Mobile: `max-w-xs` (~280px) |
| Titulo antigo | Remover "HISTORIAS QUE INSPIRAM" |
| Subtitulo gold | Mover "PRODUCAO AUDIOVISUAL PREMIUM" para baixo da logo |
| Descricao | Manter como esta |
| Botoes | Manter como estao |

---

### 4. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/assets/logo-icon.svg` | Copia do favicon para usar no header |

---

### 5. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/layout/Header.tsx` | Trocar import da logo pela logo-icon |
| `src/components/home/HeroSection.tsx` | Adicionar logo grande + reorganizar conteudo |

---

### 6. Codigo - Header

```tsx
// Antes
import logoBlackboy from "@/assets/logo-blackboy-films.svg";

// Depois  
import logoIcon from "@/assets/logo-icon.svg";

// No JSX
<img 
  src={logoIcon} 
  alt="Blackboy Films" 
  className="h-8 md:h-10 w-auto"
/>
```

---

### 7. Codigo - HeroSection

```tsx
import logoBlackboy from "@/assets/logo-blackboy-films.svg";

// Nova estrutura do conteudo:
<div className={cn("reveal", isVisible && "visible")}>
  {/* Logo Grande Centralizada */}
  <img
    src={logoBlackboy}
    alt="Blackboy Films"
    className="mx-auto mb-8 w-64 md:w-80 lg:w-96 h-auto"
  />
  
  {/* Subtitulo */}
  <span className="inline-block text-gold text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-6">
    Producao Audiovisual Premium
  </span>
  
  {/* Descricao */}
  <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
    Transformamos ideias em experiencias cinematograficas inesqueciveis. 
    Do conceito a entrega, cada frame e pensado para impactar.
  </p>

  {/* Botoes - mantidos */}
</div>
```

---

### 8. Responsividade

| Breakpoint | Logo Hero | Logo Header |
|------------|-----------|-------------|
| Mobile (<640px) | `w-64` (256px) | `h-8` (32px) |
| Tablet (md) | `w-80` (320px) | `h-10` (40px) |
| Desktop (lg+) | `w-96` (384px) | `h-10` (40px) |

---

### 9. Resumo Visual

**Header (depois):**

```text
[B icon]    HOME  WORKS  PROCESSO  SOBRE  CONTATO    [Fale Conosco]
```

**Hero (depois):**

```text
+--------------------------------------------------+
|                                                  |
|              FILMS                               |
|           [>] BLACK                              |
|               BOY                                |
|                                                  |
|         PRODUCAO AUDIOVISUAL PREMIUM             |
|                                                  |
|   Transformamos ideias em experiencias           |
|   cinematograficas inesqueciveis...              |
|                                                  |
|    [Receber Proposta]   [> Ver Portfolio]        |
|                                                  |
|                   v (scroll)                     |
+--------------------------------------------------+
```

---

### 10. Ordem de Implementacao

1. Criar `src/assets/logo-icon.svg` (copiar do favicon)
2. Atualizar `Header.tsx` para usar o icone
3. Atualizar `HeroSection.tsx` com logo grande centralizada
4. Testar responsividade em mobile/tablet/desktop

