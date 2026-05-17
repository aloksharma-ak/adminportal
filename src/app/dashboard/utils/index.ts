/**
 * Robustly extracts a list from the API response data.
 * Tries the specific key first, then falls back to any array found in the data object.
 */
export function extractList<T>(data: any, key: string): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object") {
    if (Array.isArray(data[key])) return data[key];
    // Fallback: find the first array property
    const firstArray = Object.values(data).find((v) => Array.isArray(v));
    if (firstArray) return firstArray as T[];
  }
  return [];
}

/**
 * Robustly extracts a detail object from the API response data.
 * Tries the specific key first, then falls back to the data object itself.
 */
export function extractDetail<T>(data: any, key: string): T | undefined {
  if (!data) return undefined;
  if (typeof data === "object") {
    if (data[key]) return data[key] as T;
  }
  return data as T;
}
