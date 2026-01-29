

## Plano: Vídeos com Autoplay e Controles Escondidos

Integrar o player de vídeo do YouTube na página Works para que os vídeos toquem automaticamente com visual limpo, sem controles visíveis.

---

### Como Vai Funcionar

Quando o usuário clicar em um projeto no portfólio:
1. Abre um modal/lightbox escuro com o vídeo em destaque
2. O vídeo começa automaticamente (autoplay)
3. Sem controles do YouTube visíveis (play, barra, logo)
4. Visual limpo e cinematográfico
5. Botão de fechar discreto no canto

---

### Mudanças Técnicas

**1. Criar componente de Modal de Vídeo**

Arquivo: `src/components/ui/VideoModal.tsx`

- Modal escuro fullscreen ou quase fullscreen
- Usa o componente `EmbeddedVideo` já existente (que já tem os parâmetros de autoplay e controles escondidos)
- Fecha ao clicar fora ou no botão X
- Animação suave de entrada/saída

**2. Atualizar página Works.tsx**

- Adicionar estado para controlar qual vídeo está aberto
- Ao clicar no card do projeto, abre o modal com o videoId correspondente
- Integrar com o novo componente VideoModal

---

### Parâmetros do YouTube (já configurados)

O componente `EmbeddedVideo` já usa estes parâmetros:

| Parâmetro | Valor | Efeito |
|-----------|-------|--------|
| `autoplay` | 1 | Inicia automaticamente |
| `mute` | 1 | Som desligado (necessário para autoplay) |
| `loop` | 1 | Repete infinitamente |
| `controls` | 0 | Esconde controles |
| `showinfo` | 0 | Esconde título/canal |
| `modestbranding` | 1 | Minimiza branding YouTube |
| `rel` | 0 | Não mostra vídeos relacionados |
| `disablekb` | 1 | Desabilita atalhos de teclado |
| `fs` | 0 | Esconde botão fullscreen |

---

### Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/ui/VideoModal.tsx` | Criar | Modal para exibir vídeo em destaque |
| `src/pages/Works.tsx` | Modificar | Integrar modal ao clicar nos projetos |

---

### Resultado Visual

```text
┌─────────────────────────────────────────────────────────────┐
│                         [X]                                 │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │                                                     │   │
│   │              VÍDEO YOUTUBE                          │   │
│   │           (autoplay, sem controles)                 │   │
│   │                                                     │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    Wedding Film - Ana & Pedro               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

