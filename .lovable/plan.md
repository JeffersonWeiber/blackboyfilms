

## Plano: Video Dinamico nas Paginas de Nicho

Integrar as paginas de nicho com o banco de dados `portfolio_items` para exibir videos em autoplay/loop e projetos recentes dinamicos.

---

### Mudancas Necessarias

**Arquivo: `src/pages/NichoPage.tsx`**

#### 1. Secao "Incluido no Servico" - Video Unico com Autoplay

**Situacao atual:**
- Exibe 2 thumbnails estaticas do array `nichosData`
- Usuario precisa clicar para ver o video

**Nova implementacao:**
- Buscar o projeto mais recente do nicho atual no Supabase
- Ordenar por `created_at DESC` e limitar a 1 resultado
- Exibir como video embeddado (nao thumbnail)
- Configurar autoplay + muted + loop
- Usar a tecnica de zoom (140%) para esconder controles do YouTube
- Layout: um unico video ocupando a area ao inves de 2 cards

```text
┌─────────────────────────────────────────────────────────────┐
│  INCLUIDO NO SERVICO                                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐   ┌─────────────────────────────┐  │
│  │ ✓ Cobertura completa│   │                             │  │
│  │ ✓ Filme principal   │   │   ┌───────────────────┐    │  │
│  │ ✓ Teaser redes      │   │   │                   │    │  │
│  │ ✓ Same-day edit     │   │   │   VIDEO AUTOPLAY  │    │  │
│  │ ✓ Drone             │   │   │   (loop infinito) │    │  │
│  │ ✓ Entrega 60 dias   │   │   │                   │    │  │
│  │                     │   │   └───────────────────┘    │  │
│  │ [Solicitar Orcam.] │   │                             │  │
│  └─────────────────────┘   └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Secao "Projetos Recentes" - Dados Dinamicos

**Situacao atual:**
- Exibe 3 projetos do array estatico `nichosData`

**Nova implementacao:**
- Buscar projetos publicados do nicho atual no Supabase
- Filtrar: `is_published = true` AND `niche = nicho_atual`
- Ordenar: `created_at DESC` (mais recentes primeiro)
- Limitar: 3 projetos
- Ao clicar, abrir o VideoModal existente com a URL do video

---

### Codigo - Resumo das Alteracoes

```text
1. Adicionar imports:
   - useQuery do @tanstack/react-query
   - supabase client
   - generateEmbedUrl, detectVideoType de videoUtils
   - useState para controlar VideoModal

2. Criar query para buscar o video mais recente do nicho:
   SELECT * FROM portfolio_items
   WHERE niche = $nicho AND is_published = true
   ORDER BY created_at DESC
   LIMIT 1

3. Criar query para buscar projetos recentes do nicho:
   SELECT * FROM portfolio_items
   WHERE niche = $nicho AND is_published = true
   ORDER BY created_at DESC
   LIMIT 3

4. Substituir a grid de 2 thumbnails por:
   - Um unico iframe com o video embeddado
   - Usar generateEmbedUrl com autoplay=true, loop=true
   - Aplicar escala 140% para esconder UI do player
   - Fallback para placeholder se nao houver video

5. Substituir data.projects por projectsFromDb:
   - Mapear os dados do Supabase
   - Adicionar onClick para abrir VideoModal
   - Usar thumbnail_url do banco ou gerar automaticamente
```

---

### Mapeamento de Nichos

Os nichos no banco usam valores como "casamento", "eventos", etc. O parametro da URL `:nicho` ja corresponde a esses valores, entao o filtro funcionara diretamente.

---

### Componente de Video Inline

Criar um componente reutilizavel para exibir video embeddado com autoplay:

```text
<NicheVideoPlayer>
  - Recebe video_url e video_type
  - Gera embed URL com autoplay + loop
  - Aplica escala 140% para esconder controles
  - Exibe skeleton enquanto carrega
  - Fallback para imagem se video nao disponivel
</NicheVideoPlayer>
```

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/NichoPage.tsx` | Adicionar queries do Supabase, substituir dados estaticos por dinamicos, implementar video autoplay inline |
| `src/components/ui/NicheVideoPlayer.tsx` (novo) | Componente de video embeddado com autoplay/loop para uso nas paginas de nicho |

---

### Comportamento Esperado

1. Usuario acessa `/nicho/casamento`
2. Na secao "Incluido no Servico", video mais recente do nicho "casamento" comeca a tocar automaticamente em loop
3. Na secao "Projetos Recentes", aparecem os 3 projetos mais recentes do nicho
4. Ao clicar em um projeto, abre o modal com o video
5. Se nao houver projetos no banco, exibe mensagem ou placeholder

---

### Nota sobre Performance

- Videos do YouTube com autoplay sao mutados por padrao (exigencia dos navegadores)
- O video fica em loop infinito ate o usuario sair da pagina
- Lazy loading para evitar carregar todos os videos de uma vez

