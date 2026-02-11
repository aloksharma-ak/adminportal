"use client";

const ORG_KEY = "org_code";
const LOGO_KEY = "org_logo_src";
const FULL_LOGO_KEY = "org_full_logo_src";

export function getImagesFromSession(orgCode?: string | null): {
  logoSrc: string | null;
  fullLogoSrc: string | null;
} {
  if (!orgCode) return { logoSrc: null, fullLogoSrc: null };

  const savedOrg = sessionStorage.getItem(ORG_KEY);
  if (savedOrg !== orgCode) return { logoSrc: null, fullLogoSrc: null };

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
  const { orgCode, logoSrc, fullLogoSrc } = params;

  sessionStorage.setItem(ORG_KEY, orgCode);

  if (typeof logoSrc === "string" && logoSrc.length) {
    sessionStorage.setItem(LOGO_KEY, logoSrc);
  } else {
    sessionStorage.removeItem(LOGO_KEY);
  }

  if (typeof fullLogoSrc === "string" && fullLogoSrc.length) {
    sessionStorage.setItem(FULL_LOGO_KEY, fullLogoSrc);
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

  // base64 -> data url (default png)
  return `data:image/png;base64,${raw}`;
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
