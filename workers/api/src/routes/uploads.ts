import { error, json, generateId } from "../utils";
import type { Env } from "../index";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — logos, docs and sample data only
const ALLOWED = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/zip",
];

function safeName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(-80) || "asset"
  );
}

/** Intake assets go to R2 under intake/<quote-less id>/<file>. Keys are stored on the quote. */
export const uploads = {
  create: async (request: Request, env: Env) => {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return error(400, "Expected multipart form data");
    }

    const file = form.get("file") as unknown as File | null;
    if (!file || typeof file === "string" || !file.size) {
      return error(400, "No file uploaded");
    }
    if (file.size > MAX_BYTES) {
      return error(413, "File is larger than 10 MB");
    }
    if (file.type && !ALLOWED.includes(file.type)) {
      return error(415, "Unsupported file type");
    }

    const key = `intake/${generateId()}/${safeName(file.name)}`;
    await env.ASSETS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    return json({ key, name: file.name, size: file.size, contentType: file.type }, 201);
  },
};
