"use server";
import { z } from "zod";

const ADMISSION_API_URL = process.env.ADMISSION_API_URL;

export async function getStudentsByOrgId(orgId: number) {
  if (!ADMISSION_API_URL) throw new Error("API_URL is not set");

  const url = new URL("/api/Student/GetStudents", ADMISSION_API_URL).toString();

  const payload = {
    requestGuid: crypto.randomUUID(),
    requestTime: new Date().toISOString(),
    orgId,
    isActive: true,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // If you're using Next.js Server Actions and want no caching:
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GetStudents failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  return data.data;
}

export async function getStudentDetail(params: {
  orgId: number;
  studentId: number | string;
}) {
  const orgId = Number(params.orgId);
  const studentId = parseInt(String(params.studentId), 10);

  if (!Number.isFinite(orgId) || !Number.isFinite(studentId)) {
    throw new Error(
      `Invalid orgId/studentId. orgId=${params.orgId}, studentId=${params.studentId}`,
    );
  }

  const url = new URL(
    "/api/Student/GetStudentDetail",
    ADMISSION_API_URL,
  ).toString();

  const payload = {
    requestGuid: crypto.randomUUID(),
    requestTime: new Date().toISOString(),
    studentId,
    orgId,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");
  if (!res.ok)
    throw new Error(`GetStudentDetail failed (${res.status}): ${text}`);

  return JSON.parse(text);
}

const AddressSchema = z.object({
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional().nullable(),
  pinCode: z.string().min(4, "Invalid pin code"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

const EnrollStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, "Last name is required"),
  initials: z.string().optional().nullable(),

  phone: z.string().min(6, "Phone is required"),
  secondaryPhone: z.string().optional().nullable(),
  aadharNo: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  profilePicture: z.string().optional().nullable(),

  permanantAddress: AddressSchema,

  isCommunicationAddressSameAsPermanant: z.boolean(),
  communicationAddress: AddressSchema.optional().nullable(),

  classId: z.number().int().positive("Class is required"),

  previousSchoolName: z.string().optional().nullable(),
  previousSchoolAddress: z.string().optional().nullable(),

  fatherName: z.string().optional().nullable(),
  fatherPhone: z.string().optional().nullable(),
  fatherSecondaryPhone: z.string().optional().nullable(),
  fatherAadharNo: z.string().optional().nullable(),
  fatherEmail: z.string().optional().nullable(),

  motherName: z.string().optional().nullable(),
  motherPhone: z.string().optional().nullable(),
  motherSecondaryPhone: z.string().optional().nullable(),
  motherAadharNo: z.string().optional().nullable(),
  motherEmail: z.string().optional().nullable(),

  dob: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  cateogry: z.string().optional().nullable(),

  contactPersonName: z.string().optional().nullable(),
  contactPersonPhone: z.string().optional().nullable(),
});

type EnrollStudentPayload = z.infer<typeof EnrollStudentSchema>;

export type ApiResponse<T> = {
  responseTime: string;
  status: boolean;
  message: string;
  data: T;
};

export async function enrollStudent(params: {
  orgId: number;
  payload: EnrollStudentPayload;
}) {
  if (!ADMISSION_API_URL) {
    throw new Error("ADMISSION_API_URL is not set");
  }

  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0) {
    throw new Error("Invalid organisation ID");
  }

  // ✅ Validate payload
  const parsed = EnrollStudentSchema.safeParse(params.payload);

  if (!parsed.success) {
    const firstError =
      parsed.error.issues?.[0]?.message ?? "Invalid student data";

    throw new Error(firstError);
  }

  const payload = parsed.data;

  const url = new URL(
    "/api/Student/EnrollStudent",
    ADMISSION_API_URL,
  ).toString();

  const body = {
    requestGuid: crypto.randomUUID(),
    requestTime: new Date().toISOString(),

    ...payload,
    orgId,

    // enforce rule
    communicationAddress: payload.isCommunicationAddressSameAsPermanant
      ? payload.permanantAddress
      : (payload.communicationAddress ?? null),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    // try parse json error
    try {
      const j = JSON.parse(text);
      const msg = j?.message || j?.title || "Enroll failed";
      throw new Error(`EnrollStudent failed (${res.status}): ${msg}`);
    } catch {
      throw new Error(
        `EnrollStudent failed (${res.status}): ${text || res.statusText}`,
      );
    }
  }

  return JSON.parse(text);
}
