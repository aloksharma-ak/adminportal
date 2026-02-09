"use client";

const IMAGE_KEY = "org_logo_src";
const ORG_KEY = "org_code";

export function getImageFromSession(orgCode?: string | null) {
  if (!orgCode) return null;
  const savedOrg = sessionStorage.getItem(ORG_KEY);
  const savedLogo = sessionStorage.getItem(IMAGE_KEY);
  if (savedOrg === orgCode && savedLogo) return savedLogo;
  return null;
}

export function setImageToSession(orgCode: string, logoSrc: string) {
  sessionStorage.setItem(ORG_KEY, orgCode);
  sessionStorage.setItem(IMAGE_KEY, logoSrc);
}

export function clearImageFromSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ORG_KEY);
  sessionStorage.removeItem(IMAGE_KEY);
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

  // base64 -> data url
  return `data:image/png;base64,${raw}`;
}
