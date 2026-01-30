

## Plano: Grid de Nichos Dinamico + Modal "Ver todas as categorias"

### 1. Visao Geral

Transformar a secao "Especialistas em cada nicho" de estatica para dinamica, com:
- Grid de 6 nichos principais (featured) na Home
- Botao "Ver todas as categorias" que abre modal com todos os nichos
- CRUD completo de nichos no Admin
- Seed inicial com 17 categorias

---

### 2. Estrutura do Banco de Dados

Criar tabela `niches` com os seguintes campos:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | Chave primaria |
| name | text | Nome exibido (ex: "Casamento") |
| slug | text | URL slug (ex: "casamento") |
| description | text | Descricao curta |
| cover_image | text | URL da imagem de capa |
| whatsapp_template | text | Mensagem padrao para WhatsApp |
| is_featured | boolean | Exibir no grid principal da Home |
| is_active | boolean | Se esta ativo no site |
| display_order | integer | Ordem de exibicao |
| created_at | timestamp | Data de criacao |
| updated_at | timestamp | Data de atualizacao |

**RLS Policies:**
- SELECT: Publico (para nichos ativos)
- INSERT/UPDATE/DELETE: Admin + Editor

**Seed inicial:** 17 nichos conforme lista fornecida

---

### 3. Atualizacao da Home (NichosSection)

#### 3.1 Grid Principal

| Aspecto | Detalhes |
|---------|----------|
| Fonte de dados | Buscar nichos com `is_featured = true` e `is_active = true` |
| Ordenacao | Por `display_order` ascendente |
| Layout desktop | 3 colunas x 2 linhas |
| Layout tablet | 2 colunas x 3 linhas |
| Layout mobile | 1 coluna x 6 linhas |

#### 3.2 CTA "Ver todas as categorias"

- Botao centralizado abaixo do grid
- Estilo: outline com bordas douradas
- Ao clicar: abre modal com todas as categorias

---

### 4. Modal "Todas as categorias"

#### 4.1 Estrutura do Modal

```text
+------------------------------------------+
|  [X]                                     |
|                                          |
|      TODAS AS CATEGORIAS                 |
|                                          |
|  [Buscar categoria...            ]       |
|                                          |
|  +--------+  +--------+  +--------+      |
|  | Nicho  |  | Nicho  |  | Nicho  |      |
|  | Card   |  | Card   |  | Card   |      |
|  +--------+  +--------+  +--------+      |
|                                          |
|  +--------+  +--------+  +--------+      |
|  | Nicho  |  | Nicho  |  | Nicho  |      |
|  | Card   |  | Card   |  | Card   |      |
|  +--------+  +--------+  +--------+      |
|                ...                       |
+------------------------------------------+
```

#### 4.2 Comportamento

| Recurso | Implementacao |
|---------|---------------|
| Animacao de entrada | fade + slide-up (respeita prefers-reduced-motion) |
| Fechar | Clique no X, clique fora, tecla ESC |
| Busca | Filtro em tempo real por nome |
| Grid | 3 colunas desktop, 2 tablet, 1 mobile |
| Scroll | ScrollArea interna com altura maxima |

#### 4.3 Card do Modal (versao compacta)

Cada card tera:
- Imagem de capa (aspect-ratio 16:9)
- Titulo do nicho
- Descricao curta (line-clamp-2)
- Link "Ver mais" com arrow

Hover: zoom suave na imagem + border glow

---

### 5. Pagina do Admin: Nichos

#### 5.1 Lista de Nichos (/admin/nichos)

**Interface similar a Portfolio:**
- Tabela com colunas: Imagem, Nome, Slug, Featured, Ativo, Ordem, Acoes
- Filtros: Todos / Featured / Ativos
- Busca por nome
- Acoes: Editar, Toggle Featured, Toggle Ativo, Excluir

#### 5.2 Formulario de Nicho (/admin/nichos/new e /admin/nichos/:id/edit)

**Campos do formulario:**

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| Nome | Input text | Sim |
| Slug | Input text (auto-gerado) | Sim |
| Descricao | Textarea | Sim |
| Imagem de capa | Input URL | Nao |
| Template WhatsApp | Textarea | Nao |
| Featured | Checkbox | Nao |
| Ativo | Checkbox | Nao |
| Ordem | Input number | Nao |

**Auto-geracao de slug:** Ao digitar o nome, o slug e gerado automaticamente (lowercase, sem acentos, espacos viram hifens)

---

### 6. Atualizacao da NichoPage

A pagina `/nicho/:slug` precisa buscar dados dinamicamente:

1. Buscar nicho pelo slug no banco
2. Se nao encontrar, mostrar 404
3. Usar dados do nicho (nome, descricao, imagem) ao inves de hardcoded
4. Manter lista de beneficios hardcoded inicialmente (pode ser expandido depois)

---

### 7. Componentes a Criar

| Componente | Local | Descricao |
|------------|-------|-----------|
| NicheModal | src/components/ui/NicheModal.tsx | Modal com grid de todas as categorias |
| NicheCardCompact | src/components/ui/NicheCardCompact.tsx | Card menor para uso no modal |

---

### 8. Paginas a Criar

| Pagina | Rota | Descricao |
|--------|------|-----------|
| NichesList | /admin/nichos | Lista de nichos |
| NichesForm | /admin/nichos/new | Criar nicho |
| NichesForm | /admin/nichos/:id/edit | Editar nicho |

---

### 9. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| src/components/home/NichosSection.tsx | Buscar nichos do banco, adicionar botao + modal |
| src/pages/NichoPage.tsx | Buscar dados do nicho dinamicamente |
| src/App.tsx | Adicionar rotas de admin para nichos |
| src/components/admin/AdminSidebar.tsx | Adicionar link para Nichos |
| src/pages/admin/PortfolioForm.tsx | Buscar nichos do banco para select |
| src/pages/admin/Portfolio.tsx | Buscar nichos do banco para filtro |

---

### 10. Seed de Nichos

Inserir os 17 nichos no banco:

| Nome | Slug | Featured | Order |
|------|------|----------|-------|
| Casamento | casamento | Sim | 1 |
| Eventos | eventos | Sim | 2 |
| Clinicas | clinicas | Sim | 3 |
| Marcas & Ads | marcas-e-ads | Sim | 4 |
| Food | food | Sim | 5 |
| Imobiliario | imobiliario | Sim | 6 |
| 15 anos | 15-anos | Nao | 7 |
| Aniversarios | aniversarios | Nao | 8 |
| Empresarial (Institucional) | empresarial | Nao | 9 |
| Redes Sociais | redes-sociais | Nao | 10 |
| Para o seu Marketing | marketing | Nao | 11 |
| Automotivo | automotivo | Nao | 12 |
| Estetica (Beleza) | estetica | Nao | 13 |
| Formato Vertical | formato-vertical | Nao | 14 |
| Producao de Cursos | producao-de-cursos | Nao | 15 |
| YouTube | youtube | Nao | 16 |
| Clip Musical | clip-musical | Nao | 17 |

---

### 11. Animacoes

#### Modal
- Entrada: fade (overlay) + slide-up + scale (conteudo)
- Saida: fade + slide-down + scale-out
- Duracao: 300ms
- Timing: cubic-bezier(0.16, 1, 0.3, 1)

#### Cards no Modal
- Stagger animation nos cards (delay incremental)
- Hover: zoom suave na imagem (scale 1.05)

#### Reduced Motion
- Todas as animacoes respeitam `prefers-reduced-motion`
- Se ativado, transicoes instantaneas

---

### 12. Ordem de Implementacao

1. **Banco de dados**: Criar tabela `niches` com RLS + seed dos 17 nichos
2. **Hook useNiches**: Criar hook para buscar nichos (featured, all, by slug)
3. **NicheCardCompact**: Componente de card compacto para modal
4. **NicheModal**: Modal com grid e busca
5. **NichosSection**: Atualizar para buscar do banco + integrar modal
6. **NichoPage**: Buscar dados do nicho dinamicamente
7. **Admin - NichesList**: Pagina de listagem
8. **Admin - NichesForm**: Formulario de criar/editar
9. **Rotas + Sidebar**: Integrar no sistema de rotas
10. **Portfolio**: Atualizar selects para usar nichos dinamicos

---

### 13. Resumo Visual

**Home - Secao Nichos:**
```text
         NOSSOS SERVICOS
    ESPECIALISTAS EM CADA NICHO

+--------+  +--------+  +--------+
|Casament|  |Eventos |  |Clinicas|
+--------+  +--------+  +--------+

+--------+  +--------+  +--------+
|Marcas  |  |  Food  |  |Imobil. |
+--------+  +--------+  +--------+

      [Ver todas as categorias]
```

**Modal aberto:**
```text
+------------------------------------------+
|           TODAS AS CATEGORIAS        [X] |
|  +------------------------------------+  |
|  | Buscar categoria...               |  |
|  +------------------------------------+  |
|                                          |
|  +------+  +------+  +------+            |
|  |Casa- |  |Even- |  |Clini-|            |
|  |mento |  |tos   |  |cas   |            |
|  +------+  +------+  +------+            |
|  +------+  +------+  +------+            |
|  |Marcas|  |Food  |  |Imobi-|            |
|  |& Ads |  |      |  |liario|            |
|  +------+  +------+  +------+            |
|           ... mais nichos ...            |
+------------------------------------------+
```

