"use server";
import { z } from "zod";
import type { Organisation } from "@/shared-types/organisation.types";

const API_URL = process.env.API_URL;
const ADMISSION_API_URL = process.env.ADMISSION_API_URL;

// ─────────────────────────────────────────────────────────
// Shared Helpers
// ─────────────────────────────────────────────────────────

function requireUrl(url: string | undefined, label: string): string {
  if (!url) throw new Error(`${label} environment variable is not configured`);
  return url;
}

function reqMeta() {
  return {
    requestGuid: crypto.randomUUID(),
    requestTime: new Date().toISOString(),
  };
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return j?.message || j?.title || res.statusText;
  } catch {
    try {
      return await res.text();
    } catch {
      return res.statusText;
    }
  }
}

async function apiPost<T = unknown>(
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

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type ApiResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

type OrgApiResponse = {
  status?: boolean;
  message?: string;
  data?: Partial<Organisation> & { OrgId?: number; OrgCode?: string };
};

type GetOrganisationDetailResult = {
  success: true;
  message?: string;
  organisation: Organisation;
};

const AddressSchema = z.object({
  addressLine1: z.string().trim().min(1, "Address Line 1 is required"),
  addressLine2: z.string().trim().optional().default(""),
  pinCode: z.string().trim().min(1, "Pin code is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
});

const CreateEmployeeSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    middleName: z.string().trim().optional().default(""),
    lastName: z.string().trim().min(1, "Last name is required"),
    initials: z.string().trim().optional().default(""),
    phone: z.string().trim().min(1, "Phone is required"),
    secondaryPhone: z.string().trim().optional().default(""),
    panNo: z.string().trim().optional().default(""),
    aadharNo: z.string().trim().optional().default(""),
    passportNo: z.string().trim().optional().default(""),
    email: z.string().trim().email("Invalid email address"),
    roleId: z.number().int().positive("Role is required"),
    profilePicture: z.string().optional().default(""),
    permanantAddress: AddressSchema,
    isCommunicationAddressSameAsPermanant: z.boolean(),
    communicationAddress: AddressSchema.optional(),
    isCreateCredential: z.boolean(),
    userName: z.string().trim().optional().default(""),
    password: z.string().optional().default(""),
    orgId: z.number().int().positive("Org ID is required"),
  })
  .superRefine((val, ctx) => {
    if (val.isCreateCredential) {
      if (!val.userName?.trim())
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Username is required when creating credentials",
          path: ["userName"],
        });
      if (!val.password?.trim())
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password is required when creating credentials",
          path: ["password"],
        });
    }
    if (
      !val.isCommunicationAddressSameAsPermanant &&
      !val.communicationAddress
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Communication address is required",
        path: ["communicationAddress"],
      });
    }
  });

export type CreateEmployeePayload = z.infer<typeof CreateEmployeeSchema>;

// ─────────────────────────────────────────────────────────
// Organisation APIs (API_URL)
// ─────────────────────────────────────────────────────────

export async function getOrganisationDetail(
  orgCode: string,
): Promise<GetOrganisationDetailResult> {
  const base = requireUrl(API_URL, "API_URL");
  const code = orgCode.trim().toUpperCase();
  if (!code) throw new Error("Organisation code is required");

  const body = await apiPost<OrgApiResponse>(
    base,
    "/api/Organisation/GetDetail",
    { OrgCode: code },
  );
  const raw = body?.data;
  const orgId = Number(raw?.orgId ?? raw?.OrgId ?? 0);

  if (!body?.status || !orgId)
    throw new Error(body?.message || "Organisation not found");

  return {
    success: true,
    message: body.message,
    organisation: {
      orgId,
      orgName: raw?.orgName ?? "",
      orgCode: String(raw?.orgCode ?? raw?.OrgCode ?? code)
        .trim()
        .toUpperCase(),
      phone: raw?.phone ?? null,
      email: raw?.email ?? null,
      gstin: raw?.gstin ?? null,
      panNo: raw?.panNo ?? null,
      brandColor: raw?.brandColor ?? null,
      logo: raw?.logo ?? null,
      fullLogo: raw?.fullLogo ?? null,
      stateCode: raw?.stateCode ?? null,
      website: raw?.website ?? null,
      addressLine1: raw?.addressLine1 ?? null,
      addressLine2: raw?.addressLine2 ?? null,
      pinCode: raw?.pinCode ?? null,
      city: raw?.city ?? null,
      state: raw?.state ?? null,
    },
  };
}

export async function getEmployee(params: {
  profileId: number;
  orgId: number;
}) {
  const base = requireUrl(API_URL, "API_URL");
  if (!Number.isFinite(params.profileId) || params.profileId <= 0)
    throw new Error("Invalid employee ID");
  if (!Number.isFinite(params.orgId) || params.orgId <= 0)
    throw new Error("Invalid organisation ID");
  return apiPost(base, "/api/User/GetEmployee", {
    profileId: params.profileId,
    orgId: params.orgId,
  });
}

export async function getEmployeeList(params: { orgId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  return apiPost<ApiResponse<EmployeeListItem[]>>(
    base,
    "/api/User/GetEmployeeList",
    { ...reqMeta(), orgId },
  );
}

export async function createEmployee(input: CreateEmployeePayload) {
  const base = requireUrl(API_URL, "API_URL");
  const normalized = {
    ...input,
    communicationAddress: input.isCommunicationAddressSameAsPermanant
      ? input.permanantAddress
      : input.communicationAddress,
  };
  const data = CreateEmployeeSchema.parse(normalized);
  return apiPost(base, "/api/User/CreateEmployee", {
    ...reqMeta(),
    ...data,
    communicationAddress: data.isCommunicationAddressSameAsPermanant
      ? data.permanantAddress
      : data.communicationAddress,
  });
}

export async function getAllowModules(params: { orgId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");

  const url = `${base}/api/Modules/GetAllowModules`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ ...reqMeta(), orgid: orgId }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (
      res.status === 400 &&
      json?.message?.toLowerCase().includes("no modules")
    )
      return { ...json, data: [] };
    throw new Error(
      `GetAllowModules failed (${res.status}): ${json?.message ?? res.statusText}`,
    );
  }
  return json;
}

// ─────────────────────────────────────────────────────────
// Master Data (works for BOTH API_URL and ADMISSION_API_URL)
// ─────────────────────────────────────────────────────────

export async function getMasterData(params: { orgId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  return apiPost<ApiResponse<MasterData>>(base, "/api/MasterData/Get", {
    ...reqMeta(),
    orgId,
  });
}

export async function getAdmissionMasterData(params: { orgId: number }) {
  const base = requireUrl(ADMISSION_API_URL, "ADMISSION_API_URL");
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  return apiPost<ApiResponse<AdmissionMasterData>>(
    base,
    "/api/MasterData/Get",
    { ...reqMeta(), orgId },
  );
}

// ─────────────────────────────────────────────────────────
// Roles & Permissions (API_URL)
// ─────────────────────────────────────────────────────────

export async function getRoles() {
  const base = requireUrl(API_URL, "API_URL");
  return apiPost<ApiResponse<Role[]>>(
    base,
    "/api/RolePermission/GetRoles",
    reqMeta(),
  );
}

export async function getRolePermissions(params: { roleId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  const roleId = Number(params.roleId);
  if (!Number.isFinite(roleId) || roleId <= 0)
    throw new Error("Invalid role ID");
  return apiPost<ApiResponse<RolePermissionDetail>>(
    base,
    "/api/RolePermission/GetRolesPermissions",
    { ...reqMeta(), roleId },
  );
}

export async function updateRolePermissions(params: {
  roleId: number;
  permissionIds: number[];
}) {
  const base = requireUrl(API_URL, "API_URL");
  const roleId = Number(params.roleId);
  if (!Number.isFinite(roleId) || roleId <= 0)
    throw new Error("Invalid role ID");
  return apiPost(base, "/api/RolePermission/UpdateRolePermission", {
    ...reqMeta(),
    roleId,
    permissionIds: params.permissionIds,
  });
}

export async function createPermission(params: {
  name: string;
  description: string;
  moduleId: number;
}) {
  const base = requireUrl(API_URL, "API_URL");
  return apiPost(base, "/api/RolePermission/CreatePermission", {
    ...reqMeta(),
    ...params,
  });
}

// ─────────────────────────────────────────────────────────
// Shared Types
// ─────────────────────────────────────────────────────────

export type Role = {
  roleId: number;
  roleName: string;
};

export type Permission = {
  permissionId: number;
  name: string;
  description: string;
  moduleId: number;
  moduleName?: string;
};

export type RolePermissionDetail = {
  roleId: number;
  roleName: string;
  permissions: Permission[];
  allPermissions: Permission[];
};

export type EmployeeListItem = {
  empId: number;
  profileId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  initials: string;
  phone: string;
  email: string;
  role?: { roleId: number; roleName: string };
  isActive: boolean;
};

export type ClassOption = {
  classId: number;
  className: string;
};

export type MasterData = {
  roles?: Role[];
  modules?: { moduleId: number; moduleName: string }[];
};

export type AdmissionMasterData = {
  classes?: ClassOption[];
};
