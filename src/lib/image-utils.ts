/**
 * Shared image utilities used across the entire app.
 * Handles Base64 conversion, MIME type detection, and renderable source generation.
 */

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

/**
 * Validates if a string is a potentially valid Base64 string.
 * This is a light check to avoid rendering total garbage.
 */
export function isValidBase64(str: string): boolean {
  if (!str || str.length % 4 !== 0) return false;
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(str);
}

/**
 * Converts a raw string (Base64 or URL) into a renderable <img> src.
 * Automatically cleans up whitespace and prepends necessary data URL headers.
 * Aggressively handles potential corruption like surrounding quotes or URL-safe encoding.
 */
export function toImageSrc(raw?: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;

  const value = raw.trim();
  if (value.length < 5) return null;

  // 1. If it's already a full data URL or a standard URL, just return it
  if (
    value.startsWith("data:image/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    // Basic cleanup of accidental spaces that break src
    return value.replace(/\s/g, "");
  }

  // 2. Handle raw Base64 from backend
  // Clean it up: remove whitespace, line breaks, and possible surrounding quotes
  let cleaned = value.replace(/\s/g, "");
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }

  // Handle URL-safe base64 back to standard base64
  cleaned = cleaned.replace(/-/g, "+").replace(/_/g, "/");

  // Quick validation - if it's too short, return null
  if (cleaned.length < 10) return null;

  const mime = detectMimeType(cleaned);
  return `data:${mime};base64,${cleaned}`;
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
