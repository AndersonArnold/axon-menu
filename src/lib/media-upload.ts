import { supabase } from "./supabase";

const BUCKET_PRODUTOS = "produtos";
const BUCKET_LOJISTAS = "imagens-lojas";
/** @deprecated use BUCKET_PRODUTOS */
const BUCKET = BUCKET_PRODUTOS;
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface UploadResult {
  url: string;
  path: string;
}

export class MediaUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaUploadError";
  }
}

/**
 * Validates and uploads a product image to Supabase Storage ('produtos' bucket).
 * Returns the public URL and storage path.
 *
 * @param file        - The File object from an <input type="file">
 * @param lojista_id  - UUID of the lojista (used to namespace the upload path)
 * @param produto_id  - Optional: UUID of the produto (for deterministic filenames)
 */
export async function uploadProductImage(
  file: File,
  lojista_id: string,
  produto_id?: string
): Promise<UploadResult> {
  // ── Validate file ────────────────────────────────────────────────────────
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new MediaUploadError(
      "Formato inválido. Use JPEG, PNG, WebP ou AVIF."
    );
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    throw new MediaUploadError(
      `A imagem é muito grande (${sizeMB.toFixed(1)} MB). Máximo: ${MAX_FILE_SIZE_MB} MB.`
    );
  }

  // ── Build deterministic path: lojista_id/product_<id>.<ext> ─────────────
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = produto_id
    ? `product_${produto_id}.${ext}`
    : `product_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const storagePath = `${lojista_id}/${filename}`;

  // ── Upload to Supabase Storage ───────────────────────────────────────────
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true, // overwrite if re-uploading for same product
      contentType: file.type,
    });

  if (uploadError) {
    throw new MediaUploadError(`Falha no upload: ${uploadError.message}`);
  }

  // ── Get public URL ───────────────────────────────────────────────────────
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return {
    url: urlData.publicUrl,
    path: storagePath,
  };
}

/**
 * Saves the image URL to the 'produtos' table in Supabase.
 *
 * @param produto_id  - UUID of the produto record to update
 * @param imageUrl    - The public URL returned by uploadProductImage
 * @param lojista_id  - UUID of the lojista (for RLS enforcement)
 */
export async function saveProductImageUrl(
  produto_id: string,
  imageUrl: string,
  lojista_id: string
): Promise<void> {
  const { error } = await supabase
    .from("produtos")
    .update({ imagem_url: imageUrl })
    .eq("id", produto_id)
    .eq("lojista_id", lojista_id); // ensures ownership

  if (error) {
    throw new MediaUploadError(`Falha ao salvar URL no banco: ${error.message}`);
  }
}

/**
 * Convenience: uploads the image AND saves its URL to the DB in one call.
 */
export async function uploadAndSaveProductImage(
  file: File,
  produto_id: string,
  lojista_id: string
): Promise<string> {
  const { url } = await uploadProductImage(file, lojista_id, produto_id);
  await saveProductImageUrl(produto_id, url, lojista_id);
  return url;
}

/**
 * Deletes a product image from Supabase Storage by its path.
 */
export async function deleteProductImage(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new MediaUploadError(`Falha ao deletar imagem: ${error.message}`);
  }
}

/**
 * Uploads a store-identity image (banner or logo) to the 'imagens-lojas' bucket.
 *
 * @param file       - The File object from <input type="file">
 * @param lojista_id - UUID of the lojista (used to namespace the path)
 * @param kind       - "banner" | "logo" — determines the filename prefix
 */
export async function uploadLojistaImage(
  file: File,
  lojista_id: string,
  kind: "banner" | "logo"
): Promise<UploadResult> {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new MediaUploadError(
      "Formato inválido. Use JPEG, PNG, WebP ou AVIF."
    );
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    throw new MediaUploadError(
      `A imagem é muito grande (${sizeMB.toFixed(1)} MB). Máximo: ${MAX_FILE_SIZE_MB} MB.`
    );
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${kind}_${Date.now()}.${ext}`;
  const storagePath = `${lojista_id}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_LOJISTAS)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new MediaUploadError(`Falha no upload: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_LOJISTAS)
    .getPublicUrl(storagePath);

  return {
    url: urlData.publicUrl,
    path: storagePath,
  };
}
