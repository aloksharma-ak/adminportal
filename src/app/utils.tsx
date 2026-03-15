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

/** Generates standard request metadata for API compatibility. */
function reqMeta(userId?: number) {
  return {
    requestGuid: crypto.randomUUID(),
    requestTime: new Date().toISOString(),
    userId: userId ?? 0,
    UserId: userId ?? 0,
  };
}

/** Robustly parses error responses from the backend. */
async function parseError(res: Response): Promise<string> {
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
      return j?.message || j?.title || res.statusText;
    }
    return await res.text();
  } catch {
    return res.statusText;
  }
}

/** Standardized POST request wrapper with error handling. */
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
    email: z.string().trim().email("Invalid email address").or(z.literal("")).optional().default(""),
    roleId: z.number().int().positive("Role is required"),
    empId: z.number().int().nonnegative().optional().default(0),
    profilePicture: z.string().optional().default(""),
    permanantAddress: AddressSchema,
    isCommunicationAddressSameAsPermanant: z.boolean(),
    communicationAddress: AddressSchema.optional().nullable(),
    isCreateCredential: z.boolean(),
    userName: z.string().trim().optional().default(""),
    password: z.string().optional().default(""),
    orgId: z.number().int().positive("Org ID is required"),
    profileId: z.number().int().nonnegative().optional().default(0),
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
    { orgCode: code, OrgCode: code },
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

// ─────────────────────────────────────────────────────────
// User / Employee APIs (API_URL)
// ─────────────────────────────────────────────────────────

export async function getUser(params: {
  profileId: number;
  orgId: number;
}): Promise<ApiResponse<{ details: EmployeeDetail }>> {
  const base = requireUrl(API_URL, "API_URL");
  return apiPost(base, "/api/User/GetUser", {
    ...reqMeta(params.profileId),
    profileId: params.profileId,
    orgId: params.orgId,
  });
}

export async function getEmployee(params: {
  profileId: number;
  empId: number;
  orgId: number;
  userId: number;
}): Promise<ApiResponse<EmployeeDetail>> {
  const base = requireUrl(API_URL, "API_URL");
  return apiPost(base, "/api/User/GetEmployee", {
    ...reqMeta(params.userId),
    profileId: params.profileId,
    empId: params.empId,
    orgId: params.orgId,
  });
}

export async function getEmployeeList(params: { orgId: number; userId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  return apiPost<ApiResponse<EmployeeListItem[]>>(
    base,
    "/api/User/GetEmployeeList",
    { ...reqMeta(params.userId), orgId },
  );
}

export async function createEmployee(input: CreateEmployeePayload & { userId: number }) {
  const base = requireUrl(API_URL, "API_URL");

  const normalized = {
    ...input,
    communicationAddress: input.isCommunicationAddressSameAsPermanant
      ? input.permanantAddress
      : input.communicationAddress,
  };
  const data = CreateEmployeeSchema.parse(normalized);

  return apiPost(base, "/api/User/CreateEmployee", {
    ...reqMeta(input.userId),
    ...data,
    communicationAddress: data.isCommunicationAddressSameAsPermanant
      ? data.permanantAddress
      : data.communicationAddress,
  });
}

// ─────────────────────────────────────────────────────────
// Modules API (API_URL)
// ─────────────────────────────────────────────────────────

export async function getAllowModules(params: { orgId: number; userId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");

  try {
    return await apiPost(base, "/api/Modules/GetAllowModules", {
      ...reqMeta(params.userId),
      orgid: orgId, // Legacy lowercase key compatibility
    });
  } catch (err) {
    if (err instanceof Error && err.message.toLowerCase().includes("no modules")) {
      return { status: true, message: "No modules assigned", data: [] };
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────
// Master Data (API_URL + ADMISSION_API_URL)
// ─────────────────────────────────────────────────────────

export async function getMasterData(params: { orgId: number; userId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  return apiPost<ApiResponse<MasterData>>(base, "/api/MasterData/Get", {
    ...reqMeta(params.userId),
    orgId,
  });
}

export async function getAdmissionMasterData(params: { orgId: number; userId: number }) {
  const base = requireUrl(ADMISSION_API_URL, "ADMISSION_API_URL");
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  return apiPost<ApiResponse<AdmissionMasterData>>(
    base,
    "/api/MasterData/Get",
    { ...reqMeta(params.userId), orgId },
  );
}

// ─── Role Permission API calls ────────────────────────────────────────────────

export async function getRoles(params: { userId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  return apiPost<ApiResponse<RolesResponse>>(
    base,
    "/api/RolePermission/GetRoles",
    reqMeta(params.userId),
  );
}

export async function getAllSystemPermissions(params: { userId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  return apiPost<ApiResponse<RolePermissionDetail[]>>(
    base,
    "/api/RolePermission/GetPermissions",
    reqMeta(params.userId),
  );
}

export async function getRolePermissions(params: { roleId: number; userId: number }) {
  const base = requireUrl(API_URL, "API_URL");
  const roleId = Number(params.roleId);
  if (!Number.isFinite(roleId) || roleId <= 0)
    throw new Error("Invalid role ID");
  return apiPost<ApiResponse<RolePermissionDetail[]>>(
    base,
    "/api/RolePermission/GetRolesPermissions",
    { ...reqMeta(params.userId), roleId },
  );
}

export async function updateRolePermissions(params: {
  roleId: number;
  permissionIds: number[];
  userId: number;
}) {
  const base = requireUrl(API_URL, "API_URL");
  const roleId = Number(params.roleId);
  if (!Number.isFinite(roleId) || roleId <= 0)
    throw new Error("Invalid role ID");
  return apiPost(base, "/api/RolePermission/UpdateRolePermission", {
    ...reqMeta(params.userId),
    roleId,
    permissionIds: params.permissionIds,
  });
}

export async function createPermission(params: {
  name: string;
  description: string;
  moduleId: number;
  userId: number;
}) {
  const base = requireUrl(API_URL, "API_URL");
  return apiPost(base, "/api/RolePermission/CreatePermission", {
    ...reqMeta(params.userId),
    ...params,
  });
}

// ─────────────────────────────────────────────────────────
// Shared Types
// ─────────────────────────────────────────────────────────

export type RolePermission = {
  id: number;
  roleName: string;
  isActive: boolean;
};

export type RolesResponse = {
  roles: RolePermission[];
};

export type RolePermissionDetail = {
  id: number;
  code: string;
  description: string;
  permissionGroup: number;
};

export type EmployeeListItem = {
  empId: number;
  empName: string;
  initials?: string;
  profileId: number;
  userName: string | null;
  roleName: string;
  isActive: boolean;
};

export type EmployeePermission = {
  id: number;
  code: string;
  description: string;
  permissionGroup: number;
};

export type EmployeeDetail = {
  empId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  initials?: string;
  phone: string;
  secondaryPhone: string;
  panNo: string;
  aadharNo: string;
  passportNo: string;
  email: string;
  profileId: number;
  profilePicture: string | null;
  orgId: number;
  permanantAddress: {
    addressLine1: string;
    addressLine2: string;
    pinCode: string;
    city: string;
    state: string;
  };
  communicationAddress: {
    addressLine1: string;
    addressLine2: string;
    pinCode: string;
    city: string;
    state: string;
  };
  role: {
    id: number;
    roleName: string;
    isActive: boolean;
  };
  isActive: boolean;
  isCredentialsCreated: boolean;
  username: string;
  permissions: EmployeePermission[];
};

export type Role = {
  roleId: number;
  roleName: string;
  isActive?: boolean;
};

export type MasterData = {
  roleMaster?: Role[];
  modules?: { moduleId: number; moduleName: string; icon?: string | null }[];
};

export type ClassMaster = {
  id: number;
  class: number;
  section: string;
  classText: string;
  noOfStudents: number;
  classTeacherId: number;
  orgId: number;
  isActive: boolean;
  createdOn: string;
  updatedOn: string;
  createdBy: number;
  updatedBy: number;
  eventId: string;
};

export type AdmissionMasterData = {
  classMasters: ClassMaster[];
  cateogryMaster: string[];
};
