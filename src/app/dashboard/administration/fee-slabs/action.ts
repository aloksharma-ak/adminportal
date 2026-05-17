"use server";

import { apiPost, reqMeta, requireUrl } from "@/lib/api-client";

const ADMISSION_API_URL = process.env.ADMISSION_API_URL;

function requireAdmissionUrl(): string {
  return requireUrl(ADMISSION_API_URL, "ADMISSION_API_URL");
}

async function post<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const base = requireAdmissionUrl();
  return apiPost<T>(base, path, body);
}

export type ApiResponse<T> = {
  responseTime: string;
  status: boolean;
  message: string;
  data: T;
};

/**
 * Robustly extracts a list from the API response data.
 * Tries the specific key first, then falls back to any array found in the data object.
 */
function extractList<T>(data: any, key: string): T[] {
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
function extractDetail<T>(data: any, key: string): T | undefined {
  if (!data) return undefined;
  if (typeof data === "object") {
    if (data[key]) return data[key] as T;
  }
  return data as T;
}

// ─────────────────────────────────────────────────────────
// Admission Charges
// ─────────────────────────────────────────────────────────

export type AdmissionCharge = {
  chargeId: number;
  orgId: number;
  chargeName: string;
  chargeType: string;
  isRecurring: boolean;
  frequencyId: number | null;
  amount: number;
  isActive: boolean;
};

export async function getAdmissionChargesList(orgId: number, userId?: number) {
  const res = await post<ApiResponse<any>>("/api/Charges/GetChargesList", {
    ...(await reqMeta(userId)),
    orgId,
  });
  return extractList<AdmissionCharge>(res?.data, "charges");
}

export async function getAdmissionChargeDetail(
  id: number,
  orgId: number,
  userId?: number,
) {
  const res = await post<ApiResponse<any>>("/api/Charges/GetCharge", {
    ...(await reqMeta(userId)),
    orgId,
    chargeId: id,
  });
  return extractDetail<AdmissionCharge>(res?.data, "charge");
}

export async function modifyAdmissionCharge(
  payload: Partial<AdmissionCharge>,
  userId?: number,
) {
  return post<ApiResponse<unknown>>("/api/Charges/ModifyCharge", {
    ...(await reqMeta(userId)),
    ...payload,
  });
}

// ─────────────────────────────────────────────────────────
// Fee Charges
// ─────────────────────────────────────────────────────────

export type FeeCharge = {
  feeChargeId: number;
  orgId: number;
  grade: string;
  frequencyId: number | null;
  frequency?: string;
  amount: number;
  isActive: boolean;
};

export type FeeChargesResponse = {
  fee: FeeCharge;
};

export async function getFeeChargesList(orgId: number, userId?: number) {
  const res = await post<ApiResponse<any>>("/api/Charges/GetFeeChargesList", {
    ...(await reqMeta(userId)),
    orgId,
  });
  return extractList<FeeCharge>(res?.data, "feeCharges");
}

export async function getFeeChargeDetail(
  id: number,
  orgId: number,
  userId?: number,
) {
  const res = await post<ApiResponse<any>>("/api/Charges/GetFeeCharge", {
    ...(await reqMeta(userId)),
    orgId,
    feeChargeId: id,
  });
  return extractDetail<FeeChargesResponse>(res?.data, "feeCharge");
}

export async function modifyFeeCharge(
  payload: Partial<FeeCharge>,
  userId?: number,
) {
  return post<ApiResponse<unknown>>("/api/Charges/ModifyFeeCharge", {
    ...(await reqMeta(userId)),
    ...payload,
  });
}

// ─────────────────────────────────────────────────────────
// Transport Charges
// ─────────────────────────────────────────────────────────

export type TransportCharge = {
  id: number;
  orgId: number;
  fromKM: number;
  toKM: number;
  amount: number;
  isActive: boolean;
  frequencyId: number;
};

export async function getTransportChargesList(orgId: number, userId?: number) {
  const res = await post<ApiResponse<any>>("/api/Charges/GetTransportList", {
    ...(await reqMeta(userId)),
    orgId,
  });
  return extractList<TransportCharge>(res?.data, "transport");
}

export async function getTransportChargeDetail(
  id: number,
  orgId: number,
  userId?: number,
) {
  const res = await post<ApiResponse<any>>("/api/Charges/GetTransport", {
    ...(await reqMeta(userId)),
    orgId,
    id,
  });
  return extractDetail<TransportCharge>(res?.data, "transport");
}

export async function modifyTransportCharge(
  payload: Partial<TransportCharge>,
  userId?: number,
) {
  return post<ApiResponse<unknown>>("/api/Charges/ModifyTransport", {
    ...(await reqMeta(userId)),
    ...payload,
  });
}
