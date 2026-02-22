"use client";

const ORG_KEY = "org_code";
const LOGO_KEY = "org_logo_src";
const FULL_LOGO_KEY = "org_full_logo_src";

const normalizeOrgCode = (v?: string | null) => v?.trim().toUpperCase() ?? "";

export function getImagesFromSession(orgCode?: string | null): {
  logoSrc: string | null;
  fullLogoSrc: string | null;
} {
  if (typeof window === "undefined") {
    return { logoSrc: null, fullLogoSrc: null };
  }

  const key = normalizeOrgCode(orgCode);
  if (!key) return { logoSrc: null, fullLogoSrc: null };

  const savedOrg = normalizeOrgCode(sessionStorage.getItem(ORG_KEY));
  if (savedOrg !== key) return { logoSrc: null, fullLogoSrc: null };

  return {
    logoSrc: sessionStorage.getItem(LOGO_KEY),
    fullLogoSrc: sessionStorage.getItem(FULL_LOGO_KEY),
  };
}

export function setImagesToSession(params: {
  orgCode: string;
  logoSrc?: string | null;
  fullLogoSrc?: string | null;
}) {
  if (typeof window === "undefined") return;

  const orgCode = normalizeOrgCode(params.orgCode);
  if (!orgCode) return;

  sessionStorage.setItem(ORG_KEY, orgCode);

  if (typeof params.logoSrc === "string" && params.logoSrc.trim().length) {
    sessionStorage.setItem(LOGO_KEY, params.logoSrc);
  } else {
    sessionStorage.removeItem(LOGO_KEY);
  }

  if (
    typeof params.fullLogoSrc === "string" &&
    params.fullLogoSrc.trim().length
  ) {
    sessionStorage.setItem(FULL_LOGO_KEY, params.fullLogoSrc);
  } else {
    sessionStorage.removeItem(FULL_LOGO_KEY);
  }
}

export function clearImageFromSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ORG_KEY);
  sessionStorage.removeItem(LOGO_KEY);
  sessionStorage.removeItem(FULL_LOGO_KEY);
}

export function toImageSrc(rawLogo?: string | null) {
  const raw = rawLogo?.trim();
  if (!raw) return null;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/") ||
    raw.startsWith("data:image/")
  ) {
    return raw;
  }

  // SVG detection (most important for your case)
  if (raw.startsWith("PD94") || raw.includes("PHN2Zy")) {
    return `data:image/svg+xml;base64,${raw}`;
  }

  const signatures: Record<string, string> = {
    "/9j/": "image/jpeg",
    "iVBORw0KGgo": "image/png",
    "R0lGOD": "image/gif",
    "UklGR": "image/webp",
  };

  const detectedType =
    Object.entries(signatures).find(([sig]) => raw.startsWith(sig))?.[1] ||
    "image/png";

  return `data:${detectedType};base64,${raw}`;
}

export async function fileToBase64(file: File): Promise<{
  dataUrl: string;
  base64: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Invalid file result"));
        return;
      }

      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve({ dataUrl: result, base64 });
    };

    reader.readAsDataURL(file);
  });
}
