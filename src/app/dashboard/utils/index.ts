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

/**
 * Centralized, robust error parser to get the clean backend error message.
 * It parses standard Errors, Axios-like objects, fetch responses, validation details,
 * and handles stripping API path suffixes from `apiPost` errors.
 */
export function getErrorMessage(err: unknown): string {
  if (!err) return "Something went wrong";

  // If it's a string, return it directly
  if (typeof err === "string") {
    return err;
  }

  // If it's an Error instance
  if (err instanceof Error) {
    let msg = err.message;
    // Strip apiPost standard prefix: "/api/... failed (400): " or similar
    const apiPostPrefixRegex = /^\/api\/.* failed \(\d+\):\s*/i;
    if (apiPostPrefixRegex.test(msg)) {
      msg = msg.replace(apiPostPrefixRegex, "");
    }
    return msg || "Something went wrong";
  }

  // Handle Axios or Fetch-like error response structure (e.g. error.response.data.message)
  const anyErr = err as any;
  const backendMsg =
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.detail ||
    anyErr?.response?.data?.title ||
    anyErr?.message ||
    anyErr?.detail ||
    anyErr?.title;

  if (backendMsg) {
    return String(backendMsg);
  }

  // ASP.NET Validation details
  if (anyErr?.errors && typeof anyErr.errors === "object") {
    const details = Object.entries(anyErr.errors)
      .map(([field, msgs]) => {
        const arr = Array.isArray(msgs) ? msgs : [String(msgs)];
        return `${field}: ${arr.join(", ")}`;
      })
      .join(" | ");
    return details || "Validation failed";
  }

  return "Something went wrong";
}

