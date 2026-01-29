

## Plano: Corrigir Visualizacao do Video nas Paginas de Nicho

### Problema Atual

O video esta sendo cortado e aparece "em pe" com uma area preta embaixo porque:
- O container usa `aspect-[3/4]` (formato retrato/vertical)
- A escala de 140% para esconder controles do YouTube amplia o video e corta as bordas
- Videos 16:9 (1920x1080) sao forcados em containers verticais

### Solucao

Ajustar o componente `NicheVideoPlayer` e o container na `NichoPage` para:
1. Manter o aspect ratio original do video (16:9)
2. Remover a escala excessiva que corta o conteudo
3. Usar uma abordagem mais sutil para esconder os controles
4. Garantir melhor qualidade de video com parametros corretos

---

### Alteracoes Necessarias

#### Arquivo: `src/components/ui/NicheVideoPlayer.tsx`

**Remover a escala 140%** que corta o video e usar uma abordagem mais limpa:

```text
ANTES (problema):
- Container interno: inset-[-20%] w-[140%] h-[140%]
- Transforma o video em 140% do tamanho e corta as bordas
- Resultado: video cortado, visualizacao ruim

DEPOIS (solucao):
- Container simples sem escala excessiva
- Usar parametros do YouTube para minimizar a UI
- Manter o video em seu tamanho natural
- Leve escala (~103-105%) apenas para esconder borda fina do player
```

Mudancas tecnicas:
- Remover `inset-[-20%]`, `w-[140%]`, `h-[140%]`
- Usar `w-full h-full` com `object-fit: contain` via CSS
- Manter autoplay, muted, loop
- Adicionar parametro `vq=hd1080` para alta qualidade

#### Arquivo: `src/pages/NichoPage.tsx`

**Alterar o aspect ratio do container** de vertical para horizontal:

```text
ANTES:
- <div className="aspect-[3/4]"> (retrato)

DEPOIS:
- <div className="aspect-video"> (16:9, equivalente a 1920x1080)
```

Isso garante que:
- Videos horizontais (maioria) exibam corretamente
- O layout se adapte ao formato natural do video
- Nenhum corte ou distorcao

#### Arquivo: `src/lib/videoUtils.ts`

**Adicionar parametro de qualidade** no embed do YouTube:

```text
Adicionar ao generateEmbedUrl:
- vq=hd1080 (forca qualidade 1080p)
- hd=1 (ativa modo HD)
```

---

### Padrao para Todas as Paginas de Nicho

A mudanca no `NicheVideoPlayer.tsx` sera automaticamente aplicada a todas as paginas:
- `/nicho/casamento`
- `/nicho/eventos`
- `/nicho/clinicas`
- `/nicho/marcas`
- `/nicho/food`
- `/nicho/imobiliario`

Como todas usam o mesmo componente, a correcao sera universal.

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/ui/NicheVideoPlayer.tsx` | Remover escala 140%, usar layout natural, manter autoplay/loop |
| `src/pages/NichoPage.tsx` | Mudar aspect ratio de `3/4` para `video` (16:9) |
| `src/lib/videoUtils.ts` | Adicionar parametros de qualidade HD ao embed |

---

### Resultado Esperado

1. Video exibido em proporcao correta 16:9 (1920x1080)
2. Sem cortes ou distorcao
3. Autoplay mantido (mutado)
4. Loop infinito mantido
5. Melhor qualidade de video (1080p quando disponivel)
6. Interface limpa sem controles intrusivos do YouTube
7. Padrao consistente em todas as paginas de nicho

