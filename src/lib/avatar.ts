/**
 * Shared avatar / profile-picture utilities used across the entire app.
 * Keeps image-to-src conversion logic in one place.
 */

/** Convert a raw base64 / URL string into a renderable <img> src, or null. */
export function toAvatarSrc(raw?: string | null): string | null {
  if (!raw) return null;

  const value = raw.trim();
  if (!value) return null;

  // If already a full data URL
  if (value.startsWith("data:image/")) {
    return value.replace(/\s/g, "");
  }

  // Clean whitespace/newlines
  const cleaned = value.replace(/\s/g, "");

  // Try to detect mime type from base64 header
  const mime = detectMimeType(cleaned);

  return `data:${mime};base64,${cleaned}`;
}

/**
 * Detect mime type from base64 signature
 * Covers ALL common formats
 */
function detectMimeType(base64: string): string {
  if (base64.startsWith("/9j")) return "image/jpeg";
  if (base64.startsWith("iVBORw0KGgo")) return "image/png";
  if (base64.startsWith("R0lGOD")) return "image/gif";
  if (base64.startsWith("UklGR")) return "image/webp";
  if (base64.startsWith("PD94") || base64.includes("PHN2Zy"))
    return "image/svg+xml";
  if (base64.startsWith("Qk")) return "image/bmp";
  if (base64.startsWith("SUkq") || base64.startsWith("TU0AKg"))
    return "image/tiff";
  if (base64.startsWith("AAABAA")) return "image/x-icon";
  if (base64.startsWith("AAAAIGZ0eXBhdmlm"))
    return "image/avif";

  // Safe fallback
  return "image/jpeg";
}

/** Generate initials from a full name or separate parts. */
export function getInitials(
  ...parts: (string | undefined | null)[]
): string {
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
