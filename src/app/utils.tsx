"use server";

export async function getOrganisationDetailAction(orgCode: string) {
  const API_URL = process.env.API_URL;

  if (!API_URL) {
    return { success: false, message: "API_URL is missing on server" };
  }

  const code = orgCode.trim().toUpperCase();
  if (!code) return { success: false, message: "OrgCode is required" };

  try {
    const res = await fetch(`${API_URL}/api/Organisation/GetDetail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ OrgCode: code }),
      cache: "no-store",
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: body?.message ?? "Failed to fetch organisation",
        raw: body,
      };
    }

    if (!body?.status || !body.data || !Number.isFinite(body.data.orgId)) {
      return {
        success: false,
        message: body?.message ?? "Organisation not found",
        raw: body,
      };
    }

    return { success: true, organisation: body.data };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Something went wrong",
    };
  }
}
