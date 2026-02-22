/**
 * Shared avatar / profile-picture utilities used across the entire app.
 * Keeps image-to-src conversion logic in one place.
 */

/** Convert a raw base64 / URL string into a renderable <img> src, or null. */
export function toAvatarSrc(raw?: string | null): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;

  // Already a valid URL or data-URI
  if (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("/") ||
    v.startsWith("data:image/")
  )
    return v;

  // SVG base64
  if (v.startsWith("PD94") || v.includes("PHN2Zy")) {
    return `data:image/svg+xml;base64,${v}`;
  }

  // Sniff common image signatures
  const signatures: [string, string][] = [
    ["/9j/", "image/jpeg"],
    ["iVBORw0KGgo", "image/png"],
    ["R0lGOD", "image/gif"],
    ["UklGR", "image/webp"],
  ];
  const mime =
    signatures.find(([sig]) => v.startsWith(sig))?.[1] ?? "image/png";

  return `data:${mime};base64,${v}`;
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
