"use server";
import { z } from "zod";

const API_URL = process.env.API_URL;

export async function getOrganisationDetail(orgCode: string) {
  if (!API_URL) throw new Error("API_URL is not set");

  const code = orgCode.trim().toUpperCase();
  if (!code) throw new Error("OrgCode is required");

  const res = await fetch(`${API_URL}/api/Organisation/GetDetail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ OrgCode: code }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GetDetail failed (${res.status}): ${text || res.statusText}`,
    );
  }

  const body = await res.json();

  if (!body?.status || !body?.data?.orgId) {
    throw new Error(body?.message || "Organisation not found");
  }

  return {
    success: true,
    message: body?.message,
    organisation: body.data,
  };
}

export async function getEmployee(params: {
  profileId: number;
  orgId: number;
}) {
  if (!API_URL) throw new Error("API_URL is not set");

  const { profileId, orgId } = params;

  if (!Number.isFinite(profileId) || profileId <= 0) {
    throw new Error("Invalid profileId");
  }
  if (!Number.isFinite(orgId) || orgId <= 0) {
    throw new Error("Invalid orgId");
  }

  const res = await fetch(`${API_URL}/api/User/GetEmployee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ profileId, orgId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GetEmployee failed (${res.status}): ${text || res.statusText}`,
    );
  }

  return res.json();
}

export async function getAllowModules(params: { orgId: number }) {
  if (!API_URL) throw new Error("API_URL is not set");

  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0) throw new Error("Invalid orgId");

  const res = await fetch(`${API_URL}/api/Modules/GetAllowModules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      requestGuid: crypto.randomUUID(),
      requestTime: new Date().toISOString(),
      orgid: orgId,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GetAllowModules failed (${res.status}): ${text || res.statusText}`,
    );
  }

  return res.json();
}

const AddressSchema = z.object({
  addressLine1: z.string().trim().min(1, "addressLine1 is required"),
  addressLine2: z.string().trim().optional().default(""),
  pinCode: z.string().trim().min(1, "pinCode is required"),
  city: z.string().trim().min(1, "city is required"),
  state: z.string().trim().min(1, "state is required"),
});

const CreateEmployeeSchema = z
  .object({
    firstName: z.string().trim().min(1, "firstName is required"),
    middleName: z.string().trim().optional().default(""),
    lastName: z.string().trim().min(1, "lastName is required"),
    initials: z.string().trim().optional().default(""),
    phone: z.string().trim().min(1, "phone is required"),
    secondaryPhone: z.string().trim().optional().default(""),
    panNo: z.string().trim().optional().default(""),
    aadharNo: z.string().trim().optional().default(""),
    passportNo: z.string().trim().optional().default(""),
    email: z.string().trim().email("email is invalid"),
    roleId: z.number().int().positive("roleId must be > 0"),
    profilePicture: z.string().optional().default(""),

    permanantAddress: AddressSchema,
    isCommunicationAddressSameAsPermanant: z.boolean(),
    communicationAddress: AddressSchema.optional(),

    isCreateCredential: z.boolean(),
    userName: z.string().trim().optional().default(""),
    password: z.string().optional().default(""),

    orgId: z.number().int().positive("orgId must be > 0"),
  })
  .superRefine((val, ctx) => {
    if (val.isCreateCredential) {
      if (!val.userName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "userName is required when isCreateCredential is true",
          path: ["userName"],
        });
      }
      if (!val.password?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "password is required when isCreateCredential is true",
          path: ["password"],
        });
      }
    }

    if (
      !val.isCommunicationAddressSameAsPermanant &&
      !val.communicationAddress
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "communicationAddress is required when isCommunicationAddressSameAsPermanant is false",
        path: ["communicationAddress"],
      });
    }
  });

export type CreateEmployeePayload = z.infer<typeof CreateEmployeeSchema>;

export async function createEmployee(input: CreateEmployeePayload) {
  if (!API_URL) throw new Error("API_URL is not set");

  const normalizedInput: CreateEmployeePayload = {
    ...input,
    communicationAddress: input.isCommunicationAddressSameAsPermanant
      ? input.permanantAddress
      : input.communicationAddress,
  };

  const data = CreateEmployeeSchema.parse(normalizedInput);

  const body = {
    requestGuid: crypto.randomUUID(),
    requestTime: new Date().toISOString(),

    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    initials: data.initials,
    phone: data.phone,
    secondaryPhone: data.secondaryPhone,
    panNo: data.panNo,
    aadharNo: data.aadharNo,
    passportNo: data.passportNo,
    email: data.email,
    roleId: data.roleId,
    profilePicture: data.profilePicture,

    permanantAddress: data.permanantAddress,
    isCommunicationAddressSameAsPermanant:
      data.isCommunicationAddressSameAsPermanant,
    communicationAddress: data.isCommunicationAddressSameAsPermanant
      ? data.permanantAddress
      : data.communicationAddress,

    isCreateCredential: data.isCreateCredential,
    userName: data.userName,
    password: data.password,

    orgId: data.orgId,
  };

  const res = await fetch(`${API_URL}/api/User/CreateEmployee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `CreateEmployee failed (${res.status}): ${text || res.statusText}`,
    );
  }

  return res.json();
}
