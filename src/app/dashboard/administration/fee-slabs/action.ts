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
  const res = await post<ApiResponse<AdmissionCharge[]>>("/api/Charges/GetChargesList", {
    ...(await reqMeta(userId)),
    orgId,
  });
  return Array.isArray(res?.data) ? res.data : [];
}

export async function getAdmissionChargeDetail(id: number, orgId: number, userId?: number) {
  const res = await post<ApiResponse<AdmissionCharge>>("/api/Charges/GetCharge", {
    ...(await reqMeta(userId)),
    orgId,
    chargeId: id,
  });
  return res?.data;
}

export async function modifyAdmissionCharge(payload: Partial<AdmissionCharge>, userId?: number) {
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
  amount: number;
  isActive: boolean;
};

export async function getFeeChargesList(orgId: number, userId?: number) {
  const res = await post<ApiResponse<FeeCharge[]>>("/api/Charges/GetFeeChargesList", {
    ...(await reqMeta(userId)),
    orgId,
  });
  return Array.isArray(res?.data) ? res.data : [];
}

export async function getFeeChargeDetail(id: number, orgId: number, userId?: number) {
  const res = await post<ApiResponse<FeeCharge>>("/api/Charges/GetFeeCharge", {
    ...(await reqMeta(userId)),
    orgId,
    feeChargeId: id,
  });
  return res?.data;
}

export async function modifyFeeCharge(payload: Partial<FeeCharge>, userId?: number) {
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
  const res = await post<ApiResponse<TransportCharge[]>>("/api/Charges/GetTransportList", {
    ...(await reqMeta(userId)),
    orgId,
  });
  return Array.isArray(res?.data) ? res.data : [];
}

export async function getTransportChargeDetail(id: number, orgId: number, userId?: number) {
  const res = await post<ApiResponse<TransportCharge>>("/api/Charges/GetTransport", {
    ...(await reqMeta(userId)),
    orgId,
    id,
  });
  return res?.data;
}

export async function modifyTransportCharge(payload: Partial<TransportCharge>, userId?: number) {
  return post<ApiResponse<unknown>>("/api/Charges/ModifyTransport", {
    ...(await reqMeta(userId)),
    ...payload,
  });
}
