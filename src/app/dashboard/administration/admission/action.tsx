"use server";
import { z } from "zod";

import { apiPost, reqMeta, requireUrl } from "@/lib/api-client";

const ADMISSION_API_URL = process.env.ADMISSION_API_URL;

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

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

// ---------- helpers ----------
const nullableString = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().nullable().optional(),
);

const nullableEmail = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().email("Invalid email address").nullable().optional(),
);

const nullableDate = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be in YYYY-MM-DD format")
    .nullable()
    .optional(),
);

// ---------- schemas ----------
const AddressSchema = z.object({
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: nullableString,
  pinCode: z.string().min(4, "Pin code must be at least 4 digits"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

const EnrollStudentSchema = z.object({
  // IMPORTANT: add these
  id: z.number().int().nonnegative().optional().default(0),
  orgId: z.number().int().positive("Org ID is required"),

  firstName: z.string().min(1, "First name is required"),
  middleName: nullableString,
  lastName: z.string().min(1, "Last name is required"),
  initials: nullableString,

  phone: z.string().min(6, "Phone number is required"),
  secondaryPhone: nullableString,
  aadharNo: nullableString,
  email: nullableEmail,
  profilePicture: nullableString,

  permanantAddress: AddressSchema,
  isCommunicationAddressSameAsPermanant: z.boolean(),
  communicationAddress: AddressSchema.optional().nullable(),

  classId: z.number().int().nonnegative("Class ID must be 0 or greater"),

  previousSchoolName: nullableString,
  previousSchoolAddress: nullableString,

  fatherName: nullableString,
  fatherPhone: nullableString,
  fatherSecondaryPhone: nullableString,
  fatherAadharNo: nullableString,
  fatherEmail: nullableEmail,

  motherName: nullableString,
  motherPhone: nullableString,
  motherSecondaryPhone: nullableString,
  motherAadharNo: nullableString,
  motherEmail: nullableEmail,

  dob: nullableDate,
  religion: nullableString,
  cateogry: nullableString,

  contactPersonName: nullableString,
  contactPersonPhone: nullableString,
});

export type EnrollStudentPayload = z.infer<typeof EnrollStudentSchema>;

export type ApiResponse<T> = {
  responseTime: string;
  status: boolean;
  message: string;
  data: T;
};

// ─────────────────────────────────────────────────────────
// API Actions
// ─────────────────────────────────────────────────────────

export async function getStudentsByOrgId(orgId: number, userId?: number) {
  const data = await post<ApiResponse<Student[]>>("/api/Student/GetStudents", {
    ...(await reqMeta(userId)),
    orgId,
    isActive: true,
  });
  return Array.isArray(data?.data) ? data.data : [];
}

type GetStudentDetailResponse = {
  data: Student;
};

export async function getStudentDetail(params: {
  orgId: number;
  studentId: number | string;
  userId?: number;
}): Promise<GetStudentDetailResponse> {
  const orgId = Number(params.orgId);
  const studentId = parseInt(String(params.studentId), 10);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  if (!Number.isFinite(studentId) || studentId <= 0)
    throw new Error("Invalid student ID");

  return post("/api/Student/GetStudentDetail", {
    ...(await reqMeta(params.userId)),
    studentId,
    orgId,
  });
}

export async function enrollStudent(params: { payload: EnrollStudentPayload; userId?: number }) {
  const parsed = EnrollStudentSchema.safeParse(params.payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid student data");
  }

  const p = parsed.data;

  const communicationAddress = p.isCommunicationAddressSameAsPermanant
    ? p.permanantAddress
    : p.communicationAddress;

  if (!communicationAddress) {
    throw new Error("Communication address is required");
  }


  return post<ApiResponse<unknown>>("/api/Student/EnrollStudent", {
    ...(await reqMeta(params.userId)),
    ...p,
    id: p.id ?? 0,
    orgId: p.orgId, // ensure always present
    communicationAddress,
  });
}

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export type Student = {
  studentId: number;
  firstName: string;
  lastName: string;
  enrolledClass: string | null;
  isActive: boolean;
  initials: string;
};

