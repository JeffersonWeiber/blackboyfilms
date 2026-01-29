

## Plano: Kanban de Leads e Tela Analytics

### 1. Visao Geral

Implementar duas funcionalidades principais no painel Admin:

1. **Kanban de Leads** - Visualizacao e gestao de leads em colunas por status com drag-and-drop
2. **Tela Analytics** - Dashboard com graficos de crescimento e metricas de conversao

---

### 2. Kanban de Leads

#### Estrutura do Kanban

Colunas baseadas nos status existentes no sistema:

| Coluna | Status | Cor |
|--------|--------|-----|
| Novos | `novo` | Azul |
| Em Contato | `em_contato` | Amarelo |
| Proposta Enviada | `proposta_enviada` | Roxo |
| Fechados | `fechado` | Verde |
| Perdidos | `perdido` | Vermelho |

#### Funcionalidades

- Drag and drop entre colunas (atualiza status automaticamente)
- Contador de leads por coluna
- Card do lead com: nome, telefone, nicho, data
- Click no card abre detalhes do lead
- Acoes rapidas: WhatsApp, email
- Filtro por nicho
- Alternancia entre visualizacao: Kanban / Lista (ja existente)

#### Componentes a Criar

- `src/components/admin/LeadsKanban.tsx` - Container principal do Kanban
- `src/components/admin/KanbanColumn.tsx` - Coluna individual
- `src/components/admin/KanbanCard.tsx` - Card do lead arrastavel

---

### 3. Tela Analytics - Metricas Recomendadas

Baseado nos dados disponiveis (tabela `leads`), as metricas mais relevantes sao:

#### 3.1 KPIs Principais (Cards no Topo)

| Metrica | Descricao | Calculo |
|---------|-----------|---------|
| Total de Leads | Todos os leads recebidos | `COUNT(*)` |
| Taxa de Conversao | % de leads que fecharam | `fechados / total * 100` |
| Tempo Medio de Resposta | Media de dias ate primeiro contato | `AVG(data_em_contato - data_criacao)` |
| Valor Medio por Nicho | Distribuicao de leads por nicho | Agrupamento |

#### 3.2 Graficos de Crescimento

**Grafico 1: Leads ao Longo do Tempo (Linha)**
- Eixo X: Dias/Semanas/Meses
- Eixo Y: Quantidade de leads
- Filtro de periodo: 7d, 30d, 90d, 12m
- Mostra tendencia de crescimento

**Grafico 2: Leads por Nicho (Barras)**
- Cada barra = um nicho
- Altura = quantidade de leads
- Cores diferenciadas por nicho

**Grafico 3: Funil de Conversao (Barras Horizontais)**
- Visualizacao do pipeline
- Novo -> Em Contato -> Proposta -> Fechado
- Mostra taxa de conversao entre etapas

**Grafico 4: Distribuicao por Status (Donut/Pizza)**
- Proporcao de leads por status
- Bom para visao geral rapida

#### 3.3 Tabelas e Insights

**Origem do Trafego**
- UTM Source mais frequentes
- UTM Campaign com melhor conversao
- Pagina de origem (source_page)

**Performance por Nicho**
- Nicho com mais leads
- Nicho com maior taxa de conversao
- Tendencia de crescimento por nicho

#### 3.4 Filtros Globais

- Periodo: Hoje, 7 dias, 30 dias, 90 dias, Ano, Customizado
- Nicho: Todos / Individual
- Status: Todos / Individual

---

### 4. Arquitetura Tecnica

#### Novos Arquivos

```
src/pages/admin/
  Analytics.tsx           # Nova pagina de analytics
  LeadsKanban.tsx         # Pagina do Kanban (nova)

src/components/admin/
  LeadsKanban.tsx         # Componente Kanban principal
  KanbanColumn.tsx        # Coluna do Kanban
  KanbanCard.tsx          # Card arrastavel
  AnalyticsCharts.tsx     # Graficos do analytics
  AnalyticsKPIs.tsx       # Cards de KPIs
  DateRangeFilter.tsx     # Filtro de periodo
```

#### Bibliotecas Utilizadas

- **recharts** (ja instalado) - Para todos os graficos
- **date-fns** (ja instalado) - Manipulacao de datas

#### Implementacao do Drag-and-Drop

Usar a API nativa de HTML5 Drag and Drop:
- `draggable="true"` nos cards
- `onDragStart`, `onDragOver`, `onDrop` para controle
- Atualizar status no Supabase ao soltar

---

### 5. Queries SQL para Analytics

**Leads por periodo:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date
```

**Leads por nicho:**
```sql
SELECT 
  niche,
  COUNT(*) as count
FROM leads
GROUP BY niche
ORDER BY count DESC
```

**Funil de conversao:**
```sql
SELECT 
  status,
  COUNT(*) as count
FROM leads
GROUP BY status
```

**Origem do trafego:**
```sql
SELECT 
  COALESCE(utm_source, 'Direto') as source,
  COUNT(*) as count
FROM leads
GROUP BY utm_source
ORDER BY count DESC
LIMIT 10
```

---

### 6. Rotas a Adicionar

| Rota | Componente | Descricao |
|------|------------|-----------|
| `/admin/analytics` | Analytics.tsx | Dashboard de analytics |
| `/admin/leads/kanban` | LeadsKanban.tsx | Visualizacao Kanban |

A rota `/admin/leads` atual continuara funcionando com a visualizacao em lista.

---

### 7. UI/UX

- Manter a estetica dark cinematografica do site
- Usar a cor gold (#D4AF37) como destaque nos graficos
- Cards com bordas sutis e sombras suaves
- Graficos responsivos
- Animacoes suaves ao carregar dados
- Loading skeletons enquanto carrega

---

### 8. Ordem de Implementacao

1. **Passo 1**: Criar pagina `/admin/analytics` basica com KPIs
2. **Passo 2**: Adicionar graficos de linha (leads ao longo do tempo)
3. **Passo 3**: Adicionar graficos de barra (nicho) e donut (status)
4. **Passo 4**: Implementar filtros de periodo e nicho
5. **Passo 5**: Criar componentes do Kanban
6. **Passo 6**: Implementar drag-and-drop
7. **Passo 7**: Integrar Kanban na pagina de leads
8. **Passo 8**: Adicionar rota no App.tsx

---

### 9. Resumo dos Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/pages/admin/Analytics.tsx` | Criar | Dashboard de analytics completo |
| `src/components/admin/LeadsKanban.tsx` | Criar | Kanban de gestao de leads |
| `src/components/admin/KanbanColumn.tsx` | Criar | Coluna do Kanban |
| `src/components/admin/KanbanCard.tsx` | Criar | Card arrastavel do lead |
| `src/App.tsx` | Modificar | Adicionar rota /admin/analytics |
| `src/components/admin/AdminSidebar.tsx` | Modificar | Link para Kanban (se necessario) |

