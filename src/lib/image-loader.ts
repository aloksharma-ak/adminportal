import { Base64, toUint8Array } from "js-base64";

/**
 * Shared image utilities used across the entire app.
 * Handles Base64 conversion, MIME type detection, and renderable source generation.
 */

// In-memory cache for Blob URLs, mapping clean base64 to Blob URL
const blobUrlCache = new Map<string, string>();
const cacheKeysOrder: string[] = [];
const MAX_CACHE_SIZE = 200;

function normalizeBase64(value: string): string {
  let normalized = value.trim().replace(/\s/g, "");
  normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }
  return normalized;
}

function isImageBase64Signature(value: string): boolean {
  const s = value.trim();
  return (
    s.startsWith("/9j") ||
    s.startsWith("iVBORw0KG") ||
    s.startsWith("R0lGOD") ||
    s.startsWith("UklGR") ||
    s.startsWith("PD94") ||
    s.startsWith("Qk") ||
    s.startsWith("SUkq") ||
    s.startsWith("TU0AKg") ||
    s.startsWith("AAABAA") ||
    s.startsWith("AAAAIGZ0eXBhdmlm")
  );
}

function isPassthroughImageUrl(value: string): boolean {
  if (
    value.startsWith("blob:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return true;
  }

  return value.startsWith("/") && !isImageBase64Signature(value);
}

/**
 * Detects the MIME type of a Base64 encoded image string.
 * Supports all major web formats.
 */
export function detectMimeType(base64: string): string {
  const s = base64.trim();
  // Common magic numbers / signatures in Base64
  if (s.startsWith("/9j")) return "image/jpeg";
  if (s.startsWith("iVBORw0KGgo")) return "image/png";
  if (s.startsWith("R0lGOD")) return "image/gif";
  if (s.startsWith("UklGR")) return "image/webp";
  if (
    s.startsWith("PD94") ||
    s.includes("PHN2Zy") ||
    s.toLowerCase().includes("<svg")
  )
    return "image/svg+xml";
  if (s.startsWith("Qk")) return "image/bmp";
  if (s.startsWith("SUkq") || s.startsWith("TU0AKg")) return "image/tiff";
  if (s.startsWith("AAABAA")) return "image/x-icon";
  if (s.startsWith("AAAAIGZ0eXBhdmlm")) return "image/avif";

  // Safe fallback if we can't detect it perfectly
  return "image/jpeg";
}

/**
 * Extracts a clean raw Base64 string and detects/extracts its MIME type.
 * Handles double/multiple encoded Base64 strings.
 */
function getCleanRawBase64(raw: string): { cleaned: string; mime: string } {
  if (!raw) {
    return { cleaned: "", mime: "image/png" };
  }

  let value = raw.trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  }

  // Remove data URI prefix if present
  let cleaned = value;
  let detectedMime = "";
  const prefixIndex = value.indexOf("base64,");
  if (prefixIndex !== -1) {
    const prefix = value.slice(0, prefixIndex + 7);
    const mimeMatch = prefix.match(/data:([^;]+);/);
    if (mimeMatch) {
      detectedMime = mimeMatch[1];
    }
    cleaned = value.slice(prefixIndex + 7);
  }

  cleaned = normalizeBase64(cleaned);

  // Decode double/multiple encoding safely using js-base64
  // BUT: skip this entirely if cleaned already looks like raw image base64
  const alreadyRawImage = isImageBase64Signature(cleaned);

  if (!alreadyRawImage) {
    try {
      let attempts = 0;
      while (attempts < 3) {
        const checkStr = normalizeBase64(cleaned);

        if (!Base64.isValid(checkStr)) {
          break;
        }

        const decoded = Base64.decode(checkStr);
        const trimmedDecoded = decoded.trim();

        // If the decoded string starts with standard signatures or data URL prefix
        if (
          trimmedDecoded.startsWith("data:image/") ||
          trimmedDecoded.startsWith("/9j") ||
          trimmedDecoded.startsWith("iVBORw0KG") ||
          trimmedDecoded.startsWith("R0lGOD") ||
          trimmedDecoded.startsWith("UklGR") ||
          trimmedDecoded.startsWith("PD94") ||
          trimmedDecoded.includes("base64,")
        ) {
          const innerPrefixIndex = trimmedDecoded.indexOf("base64,");
          if (innerPrefixIndex !== -1) {
            const mimeMatch = trimmedDecoded.slice(0, innerPrefixIndex + 7).match(/data:([^;]+);/);
            if (mimeMatch) {
              detectedMime = mimeMatch[1];
            }
            cleaned = normalizeBase64(trimmedDecoded.slice(innerPrefixIndex + 7));
          } else {
            cleaned = normalizeBase64(trimmedDecoded);
          }
        } else {
          break;
        }
        attempts++;
      }
    } catch (err) {
      console.error("[image-loader] [getCleanRawBase64] Base64 clean decoding failed:", err);
    }
  }

  if (!detectedMime) {
    detectedMime = detectMimeType(cleaned);
  }

  return { cleaned, mime: detectedMime };
}

/**
 * Converts a Base64 string into a browser-native Blob URL using js-base64.
 */
export function base64ToBlobUrl(base64: string, mime = "image/png"): string {
  if (typeof window === "undefined" || !base64) return "";

  // Remove data URI prefix if present
  const cleanBase64 = normalizeBase64(base64.includes(",")
    ? base64.split(",")[1]
    : base64);

  try {
    const byteArray = toUint8Array(cleanBase64);

    if (byteArray.length === 0) {
      console.warn("[image-loader] [base64ToBlobUrl] Decoded array is empty, returning empty string.");
      return "";
    }

    const blob = new Blob([byteArray.buffer as ArrayBuffer], { type: mime });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("[image-loader] [base64ToBlobUrl] Failed to convert base64 to Blob URL:", e);
    return "";
  }
}

/**
 * Caches and returns a Blob URL for a given Base64 string.
 * Automatically evicts/revokes old Blob URLs when the cache limit is exceeded.
 */
export function getCachedBlobUrl(base64?: string | null, mime?: string): string {
  if (typeof window === "undefined" || !base64 || typeof base64 !== "string") {
    return "";
  }

  const trimmed = base64.trim();
  if (isPassthroughImageUrl(trimmed)) {
    return trimmed;
  }

  const { cleaned, mime: detectedMime } = getCleanRawBase64(trimmed);
  if (!cleaned) return "";

  const cacheKey = cleaned;
  const finalMime = mime || detectedMime;

  if (blobUrlCache.has(cacheKey)) {
    const idx = cacheKeysOrder.indexOf(cacheKey);
    if (idx !== -1) {
      cacheKeysOrder.splice(idx, 1);
    }
    cacheKeysOrder.push(cacheKey);
    return blobUrlCache.get(cacheKey)!;
  }

  // Evict oldest if limit reached
  if (blobUrlCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cacheKeysOrder.shift();
    if (oldestKey) {
      const oldUrl = blobUrlCache.get(oldestKey);
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }
      blobUrlCache.delete(oldestKey);
    }
  }

  const blobUrl = base64ToBlobUrl(cacheKey, finalMime);
  if (blobUrl) {
    blobUrlCache.set(cacheKey, blobUrl);
    cacheKeysOrder.push(cacheKey);
  }
  return blobUrl;
}

/**
 * Revokes and deletes a cached Blob URL for a given Base64 string.
 */
export function revokeCachedUrl(base64: string) {
  if (typeof window === "undefined" || !base64) return;
  const { cleaned } = getCleanRawBase64(base64);
  const cachedUrl = blobUrlCache.get(cleaned);
  if (cachedUrl) {
    URL.revokeObjectURL(cachedUrl);
    blobUrlCache.delete(cleaned);
    const idx = cacheKeysOrder.indexOf(cleaned);
    if (idx !== -1) {
      cacheKeysOrder.splice(idx, 1);
    }
  }
}

/**
 * Converts a File object to a Base64 Data URL.
 * Returns the full string including the "data:image/xxx;base64," prefix.
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Invalid file result"));
        return;
      }
      resolve(result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Strips the Data URL prefix (e.g., "data:image/png;base64,")
 * to return only the raw Base64 string for API storage.
 */
export function stripDataUrl(str: string): string {
  if (!str) return "";
  const index = str.indexOf("base64,");
  if (index !== -1) {
    return str.slice(index + 7).trim();
  }
  return str.trim();
}

/** Generate initials from a full name or separate parts. */
export function getInitials(...parts: (string | undefined | null)[]): string {
  const words = parts
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Reusable image validation helper.
 * Restricts uploads strictly to PNG, JPG, and JPEG.
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedExtensions = [".png", ".jpg", ".jpeg"];
  const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];

  // 1. Check mime type
  const hasAllowedMime = allowedMimeTypes.includes(file.type.toLowerCase());

  // 2. Check extension
  const extIndex = file.name.lastIndexOf(".");
  const ext = extIndex !== -1 ? file.name.substring(extIndex).toLowerCase() : "";
  const hasAllowedExt = allowedExtensions.includes(ext);

  if (!hasAllowedMime && !hasAllowedExt) {
    return { isValid: false, error: "Only JPG and PNG images are allowed" };
  }

  return { isValid: true };
}
