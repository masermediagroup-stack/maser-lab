import { readFileAsDataUrl } from "./storage";

type UploadResult = {
  url: string;
  source: "blob" | "local";
};

/** Upload to Vercel Blob when configured; otherwise fall back to data URL. */
export async function uploadMediaFile(file: File): Promise<UploadResult> {
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/brand-case-studio/upload", {
      method: "POST",
      body,
    });
    if (response.ok) {
      const payload = (await response.json()) as { url: string };
      return { url: payload.url, source: "blob" };
    }
  } catch {
    // fall through to local data URL
  }
  return { url: await readFileAsDataUrl(file), source: "local" };
}
