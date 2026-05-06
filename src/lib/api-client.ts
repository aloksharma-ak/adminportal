import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

/** Robustly parses error responses from the backend. */
export async function parseError(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      // ASP.NET ValidationProblemDetails
      if (j?.errors && typeof j.errors === "object") {
        const details = Object.entries(j.errors)
          .map(([field, msgs]) => {
            const arr = Array.isArray(msgs) ? msgs : [String(msgs)];
            return `${field}: ${arr.join(", ")}`;
          })
          .join(" | ");
        return `${j.title || "Validation failed"}: ${details}`;
      }
      return j?.detail || j?.message || j?.title || res.statusText;
    }
    return await res.text();
  } catch {
    return res.statusText;
  }
}

/** Generates standard request metadata for API compatibility. */
export async function reqMeta(userId?: number) {
  let finalUserId = userId;

  if (finalUserId === undefined) {
    const session = await getServerSession(authOptions);
    finalUserId = Number(session?.user?.profileId ?? 0);
  }

  return {
    requestGuid: crypto.randomUUID(),
    requestTime: new Date().toISOString(),
    userId: finalUserId,
    UserId: finalUserId,
  };
}

/** 
 * Standardized POST request wrapper with error handling. 
 * Can be used in both Server Components and Server Actions.
 */
export async function apiPost<T = unknown>(
  base: string,
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await parseError(res);
    throw new Error(`${path} failed (${res.status}): ${msg}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Utility to get current user session on the server.
 * Useful for ensuring userId is always correct without passing it from the client.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Ensures an environment variable is configured.
 */
export function requireUrl(url: string | undefined, label: string): string {
  if (!url) throw new Error(`${label} environment variable is not configured`);
  return url;
}
