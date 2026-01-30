

## Plano: Upload de Thumbnail Customizada no Portfolio

### 1. Visao Geral

Trocar o campo de URL por um sistema de upload de arquivo para thumbnails de projetos do portfolio, igual ao sistema de upload de logos de clientes.

| Item | Estado Atual | Estado Desejado |
|------|--------------|-----------------|
| Campo thumbnail | Input de URL | Upload de arquivo (JPG/PNG/WebP) |
| Armazenamento | URL externa | Supabase Storage |
| Preview | Apenas URL | Preview visual do arquivo |
| Comportamento | URL manual | Upload + fallback automatico |

---

### 2. Banco de Dados - Novo Bucket

Criar um novo bucket `portfolio-thumbnails` para armazenar as thumbnails customizadas:

| Configuracao | Valor |
|--------------|-------|
| Nome | portfolio-thumbnails |
| Publico | Sim |
| Tipos | image/jpeg, image/png, image/webp |
| Tamanho max | 5MB (thumbnails de alta qualidade) |

**Politicas RLS do bucket:**
- SELECT: publico (para exibir no site)
- INSERT/UPDATE: admin + editor
- DELETE: admin + editor

---

### 3. Novos Hooks - usePortfolioThumbnail

Criar hooks para upload e delete de thumbnails:

```typescript
// src/hooks/usePortfolio.ts (novo arquivo)

export function useUploadPortfolioThumbnail() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      await supabase.storage.from("portfolio-thumbnails").upload(filePath, file);
      const { data } = supabase.storage.from("portfolio-thumbnails").getPublicUrl(filePath);
      return data.publicUrl;
    },
  });
}

export function useDeletePortfolioThumbnail() {
  return useMutation({
    mutationFn: async (thumbnailUrl: string) => {
      // Extrair path da URL e deletar
    },
  });
}
```

---

### 4. Mudancas no PortfolioForm

#### 4.1 Novo Layout do Campo Thumbnail

```text
+--------------------------------------------------+
|  Thumbnail Customizada                           |
+--------------------------------------------------+
|  +----------------+  +------------------------+  |
|  |                |  | [Upload] Escolher      |  |
|  |  [Preview      |  |         arquivo        |  |
|  |   da imagem]   |  |                        |  |
|  |       [X]      |  | JPG, PNG ou WebP.      |  |
|  +----------------+  | Max 5MB.               |  |
|                      +------------------------+  |
|                                                  |
|  Deixe vazio para usar a thumbnail do video     |
+--------------------------------------------------+
```

#### 4.2 Estados a Adicionar

```typescript
const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);
```

#### 4.3 Handler de Arquivo

```typescript
const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validar tipo
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    toast.error("Formato invalido. Use JPG, PNG ou WebP");
    return;
  }

  // Validar tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Arquivo muito grande. Maximo 5MB");
    return;
  }

  setThumbnailFile(file);
  setThumbnailPreview(URL.createObjectURL(file));
};
```

#### 4.4 Logica de Submit Atualizada

```typescript
const onSubmit = async (values: FormValues) => {
  let thumbnailUrl = existingThumbnailUrl;

  // Upload nova thumbnail se selecionada
  if (thumbnailFile) {
    // Deletar antiga se existir
    if (existingThumbnailUrl?.includes("portfolio-thumbnails")) {
      await deleteThumbnail.mutateAsync(existingThumbnailUrl);
    }
    thumbnailUrl = await uploadThumbnail.mutateAsync(thumbnailFile);
  }

  // Se nao tem thumbnail customizada, usa a do video
  const finalThumbnail = thumbnailUrl || generateThumbnailUrl(values.video_url) || null;

  // ... resto do save
};
```

---

### 5. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/usePortfolio.ts` | Hooks de upload/delete de thumbnails |
| Migracao SQL | Criar bucket + politicas RLS |

---

### 6. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/admin/PortfolioForm.tsx` | Trocar input URL por upload de arquivo |

---

### 7. Fluxo de Upload

```text
[Usuario clica "Escolher arquivo"]
         |
         v
[Seleciona JPG/PNG/WebP]
         |
         v
[Validar tipo + tamanho]
         |
   +-----+-----+
   |           |
 Invalido    Valido
   |           |
   v           v
[Toast erro] [Preview local]
                |
                v
         [Clique Salvar]
                |
                v
   [Upload para portfolio-thumbnails]
                |
                v
   [Retorna URL publica]
                |
                v
   [Salva em portfolio_items.thumbnail_url]
```

---

### 8. Comportamento Inteligente

| Cenario | Resultado |
|---------|-----------|
| Upload de arquivo | Usa thumbnail customizada |
| Nenhum upload | Usa thumbnail automatica do video (YouTube/Drive) |
| Remover thumbnail existente | Volta a usar thumbnail do video |
| Editar projeto com thumbnail | Mostra preview da existente |

---

### 9. Migracao SQL

```sql
-- Criar bucket para thumbnails do portfolio
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-thumbnails', 'portfolio-thumbnails', true);

-- Politica SELECT publica
CREATE POLICY "Public can view portfolio thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-thumbnails');

-- Politica INSERT para admin/editor
CREATE POLICY "Admin and editor can upload portfolio thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio-thumbnails' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'editor'::app_role)
  )
);

-- Politica DELETE para admin/editor
CREATE POLICY "Admin and editor can delete portfolio thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio-thumbnails' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'editor'::app_role)
  )
);
```

---

### 10. Interface Visual Final

```text
+--------------------------------------------------+
|  Thumbnail Customizada                           |
+--------------------------------------------------+
|                                                  |
|  +----------------+  +------------------------+  |
|  |                |  |                        |  |
|  |    [Imagem     |  |   [Upload] Escolher    |  |
|  |   thumbnail]   |  |          arquivo       |  |
|  |                |  |                        |  |
|  |      [X]       |  |  JPG, PNG ou WebP.     |  |
|  |                |  |  Maximo 5MB.           |  |
|  +----------------+  +------------------------+  |
|                                                  |
|  Deixe vazio para usar a thumbnail do video     |
+--------------------------------------------------+
```

---

### 11. Ordem de Implementacao

1. **Migracao**: Criar bucket `portfolio-thumbnails` + politicas RLS
2. **Hooks**: Criar `usePortfolio.ts` com upload/delete
3. **Form**: Atualizar `PortfolioForm.tsx` com novo campo de upload
4. **Testar**: Verificar upload, preview e fallback automatico

