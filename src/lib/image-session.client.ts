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

export function toImageSrc(rawLogo?: string | null): string | null {
  if (!rawLogo) return null;

  const raw = rawLogo.trim();
  if (!raw) return null;

  // Already valid URL or full data URL
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/") ||
    raw.startsWith("data:image/")
  ) {
    return raw.replace(/\s/g, "");
  }

  // Remove whitespace / line breaks from backend base64
  const cleaned = raw.replace(/\s/g, "");

  const mimeType = detectMimeType(cleaned);

  return `data:${mimeType};base64,${cleaned}`;
}

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
