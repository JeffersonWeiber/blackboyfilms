

## Plano: Upload de Imagem de Capa para Nichos

### 1. Visao Geral

Trocar o campo de URL por upload de arquivo para imagens de capa dos nichos, seguindo o mesmo padrao implementado para thumbnails do portfolio.

| Item | Estado Atual | Estado Desejado |
|------|--------------|-----------------|
| Campo cover_image | Input de URL | Upload de arquivo (JPG/PNG/WebP) |
| Armazenamento | URL externa | Supabase Storage |
| Preview | Nenhum | Preview visual do arquivo |
| Validacao | URL valida | Tipo + tamanho do arquivo |

---

### 2. Banco de Dados - Novo Bucket

Criar um novo bucket `niche-covers` para armazenar as imagens de capa:

| Configuracao | Valor |
|--------------|-------|
| Nome | niche-covers |
| Publico | Sim |
| Tipos permitidos | image/jpeg, image/png, image/webp |
| Tamanho maximo | 5MB |

**Politicas RLS:**
- SELECT: publico (exibir no site)
- INSERT/UPDATE/DELETE: admin + editor

---

### 3. Novos Hooks - useNicheCover

Criar hooks para upload e delete de capas de nichos:

```typescript
// src/hooks/useNicheCover.ts (novo arquivo)

const BUCKET_NAME = "niche-covers";

export function useUploadNicheCover() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      return data.publicUrl;
    },
  });
}

export function useDeleteNicheCover() {
  return useMutation({
    mutationFn: async (coverUrl: string) => {
      const filePath = coverUrl.split(`${BUCKET_NAME}/`)[1];
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    },
  });
}

export function isNicheCoverUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes(BUCKET_NAME);
}
```

---

### 4. Mudancas no NichesForm

#### 4.1 Novo Layout do Campo Imagem de Capa

```text
+--------------------------------------------------+
|  Imagem de Capa                                  |
+--------------------------------------------------+
|                                                  |
|  +----------------+  +------------------------+  |
|  |                |  |                        |  |
|  |    [Preview    |  |   [Upload] Escolher    |  |
|  |   da imagem]   |  |          arquivo       |  |
|  |                |  |                        |  |
|  |      [X]       |  |  JPG, PNG ou WebP.     |  |
|  |                |  |  Maximo 5MB.           |  |
|  +----------------+  +------------------------+  |
|                                                  |
|  Recomendado: 800x600 pixels                     |
+--------------------------------------------------+
```

#### 4.2 Novos Estados

```typescript
const [coverFile, setCoverFile] = useState<File | null>(null);
const [coverPreview, setCoverPreview] = useState<string | null>(null);
const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
```

#### 4.3 Handler de Arquivo

```typescript
const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validar tipo
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    toast({ title: "Formato invalido. Use JPG, PNG ou WebP", variant: "destructive" });
    return;
  }

  // Validar tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast({ title: "Arquivo muito grande. Maximo 5MB", variant: "destructive" });
    return;
  }

  setCoverFile(file);
  setCoverPreview(URL.createObjectURL(file));
};
```

#### 4.4 Logica de Submit Atualizada

```typescript
const onSubmit = async (values: FormValues) => {
  let coverUrl = existingCoverUrl;

  // Upload nova capa se selecionada
  if (coverFile) {
    // Deletar antiga se existir e for do nosso bucket
    if (existingCoverUrl && isNicheCoverUrl(existingCoverUrl)) {
      await deleteCover.mutateAsync(existingCoverUrl);
    }
    coverUrl = await uploadCover.mutateAsync(coverFile);
  }

  const payload = {
    ...values,
    cover_image: coverUrl || null,
  };

  // ... resto do save
};
```

---

### 5. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/useNicheCover.ts` | Hooks de upload/delete de capas |
| Migracao SQL | Criar bucket + politicas RLS |

---

### 6. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/admin/NichesForm.tsx` | Trocar input URL por upload de arquivo |

---

### 7. Migracao SQL

```sql
-- Criar bucket para capas de nichos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'niche-covers',
  'niche-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- SELECT publico
CREATE POLICY "Public can view niche covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'niche-covers');

-- INSERT para admin/editor
CREATE POLICY "Admin and editor can upload niche covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'niche-covers' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

-- UPDATE para admin/editor
CREATE POLICY "Admin and editor can update niche covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'niche-covers' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

-- DELETE para admin/editor
CREATE POLICY "Admin and editor can delete niche covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'niche-covers' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);
```

---

### 8. Fluxo de Upload

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
   [Upload para niche-covers]
                |
                v
   [Retorna URL publica]
                |
                v
   [Salva em niches.cover_image]
```

---

### 9. Componente Visual do Campo

```tsx
{/* Campo de Upload de Capa */}
<FormItem>
  <FormLabel>Imagem de Capa</FormLabel>
  <div className="flex items-start gap-4">
    {/* Preview */}
    {(coverPreview || existingCoverUrl) && (
      <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-border">
        <img
          src={coverPreview || existingCoverUrl || ""}
          alt="Cover preview"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={handleRemoveCover}
          className="absolute top-1 right-1 p-1 bg-destructive rounded-full"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    )}
    
    {/* Upload Input */}
    <div className="flex-1">
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleCoverChange}
      />
      <FormDescription>
        JPG, PNG ou WebP. Maximo 5MB. Recomendado: 800x600
      </FormDescription>
    </div>
  </div>
</FormItem>
```

---

### 10. Ordem de Implementacao

1. **Migracao**: Criar bucket `niche-covers` + politicas RLS
2. **Hooks**: Criar `useNicheCover.ts` com upload/delete
3. **Form**: Atualizar `NichesForm.tsx` com novo campo de upload
4. **Testar**: Upload, preview e remocao de imagem

