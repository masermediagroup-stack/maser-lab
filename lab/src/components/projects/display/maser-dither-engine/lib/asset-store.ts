/**
 * Sprint 8.1 / v0.8 — Durable image assets for lab projects (IndexedDB).
 * Portable exports still strip blob: / mde-asset: refs (see export/assets.ts).
 */

export const ASSET_REF_PREFIX = "mde-asset:";
export const ASSET_DB_NAME = "mde-assets-v1";
export const ASSET_STORE = "blobs";
/** Soft cap per image after compress (bytes of Blob). */
export const ASSET_MAX_BYTES = 1_200_000;
const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

export type StoredAsset = {
  id: string;
  blob: Blob;
  mime: string;
  bytes: number;
  createdAt: number;
  width?: number;
  height?: number;
};

export function isAssetRef(url: string | null | undefined): boolean {
  return Boolean(url && url.startsWith(ASSET_REF_PREFIX));
}

export function assetIdFromRef(ref: string): string | null {
  if (!isAssetRef(ref)) return null;
  const id = ref.slice(ASSET_REF_PREFIX.length).trim();
  return id || null;
}

export function assetRefFromId(id: string): string {
  return `${ASSET_REF_PREFIX}${id}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(ASSET_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ASSET_STORE)) {
        db.createObjectStore(ASSET_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
  });
}

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB request failed"));
  });
}

export async function putAssetBlob(
  blob: Blob,
  meta?: { width?: number; height?: number },
): Promise<string> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `a-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record: StoredAsset = {
    id,
    blob,
    mime: blob.type || "image/jpeg",
    bytes: blob.size,
    createdAt: Date.now(),
    width: meta?.width,
    height: meta?.height,
  };
  const db = await openDb();
  try {
    const tx = db.transaction(ASSET_STORE, "readwrite");
    await idbReq(tx.objectStore(ASSET_STORE).put(record));
  } finally {
    db.close();
  }
  return assetRefFromId(id);
}

export async function getAssetRecord(
  refOrId: string,
): Promise<StoredAsset | null> {
  const id = assetIdFromRef(refOrId) ?? (refOrId.includes(":") ? null : refOrId);
  if (!id) return null;
  const db = await openDb();
  try {
    const tx = db.transaction(ASSET_STORE, "readonly");
    const row = await idbReq<StoredAsset | undefined>(
      tx.objectStore(ASSET_STORE).get(id),
    );
    return row ?? null;
  } finally {
    db.close();
  }
}

export async function deleteAsset(refOrId: string): Promise<void> {
  const id = assetIdFromRef(refOrId) ?? refOrId;
  if (!id) return;
  const db = await openDb();
  try {
    const tx = db.transaction(ASSET_STORE, "readwrite");
    await idbReq(tx.objectStore(ASSET_STORE).delete(id));
  } finally {
    db.close();
  }
}

/** Resolve a lab URL (asset ref / data / http / blob) to something <img>/GL can load. */
export async function resolveDisplayUrl(
  url: string | null,
): Promise<{ url: string | null; revoke?: string }> {
  if (!url) return { url: null };
  if (isAssetRef(url)) {
    const row = await getAssetRecord(url);
    if (!row) return { url: null };
    const objectUrl = URL.createObjectURL(row.blob);
    return { url: objectUrl, revoke: objectUrl };
  }
  return { url };
}

/** Compress a File/Blob to a JPEG under ASSET_MAX_BYTES when possible. */
export async function compressImageBlob(
  input: Blob,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(input);
  try {
    let { width, height } = bitmap;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { blob: input, width: bitmap.width, height: bitmap.height };
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    let quality = JPEG_QUALITY;
    let blob = await canvasToBlob(canvas, "image/jpeg", quality);
    while (blob.size > ASSET_MAX_BYTES && quality > 0.45) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
    }
    if (blob.size > ASSET_MAX_BYTES) {
      const shrink = Math.sqrt(ASSET_MAX_BYTES / blob.size);
      canvas.width = Math.max(1, Math.round(width * shrink));
      canvas.height = Math.max(1, Math.round(height * shrink));
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      blob = await canvasToBlob(canvas, "image/jpeg", 0.7);
      return { blob, width: canvas.width, height: canvas.height };
    }
    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });
}

/** Store an uploaded image; returns durable `mde-asset:` ref. */
export async function putImageFile(file: File | Blob): Promise<string> {
  const { blob, width, height } = await compressImageBlob(file);
  return putAssetBlob(blob, { width, height });
}

/** If url is blob:, persist into IDB and return asset ref; otherwise return as-is (null for empty). */
export async function persistUrlIfNeeded(
  url: string | null,
): Promise<string | null> {
  if (!url) return null;
  if (isAssetRef(url) || url.startsWith("data:") || /^https?:/i.test(url)) {
    return url;
  }
  if (!url.startsWith("blob:")) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return putImageFile(blob);
  } catch {
    return null;
  }
}
