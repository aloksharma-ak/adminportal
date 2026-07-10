/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { z } from "zod";
import { apiPost, reqMeta, requireUrl } from "@/lib/api-client";
import { detectMimeType } from "@/lib/image-loader";
import { revalidatePath } from "next/cache";
import { extractList, extractDetail } from "@/app/dashboard/utils";

const ADMINISTRATION_API_URL = process.env.ADMINISTRATION_API_URL;

function requireAdministrationUrl(): string {
  return requireUrl(ADMINISTRATION_API_URL, "ADMINISTRATION_API_URL");
}

async function post<T = unknown>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const base = requireAdministrationUrl();
  return apiPost<T>(base, path, body);
}

// ─────────────────────────────────────────────────────────
// Types & Schemas
// ─────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  responseTime: string;
  status: boolean;
  message: string;
  data: T;
};

export type ClassMaster = {
  id: number;
  grade: string;
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

export type GradeMaster = {
  id: number;
  grade: string;
};

export type FrequencyMaster = {
  id: number;
  name: string;
  monthsInterval: number;
  isActive: boolean;
  createdOn: string;
};

export type AdmissionStatusMaster = {
  id: number;
  status: string;
  description: string;
  isActive: boolean;
  orgId: number;
  createdOn: string;
  createdBy: string;
  updatedOn: string | null;
  updatedBy: string | null;
  eventId: string;
};

export type AdmissionMasterData = {
  classMasters: ClassMaster[];
  cateogryMaster: string[];
  gradeMasters: GradeMaster[];
  frequencyMasters: FrequencyMaster[];
  admissionStatusMasters: AdmissionStatusMaster[];
  paymentModeMasters?: string[];
};

export type Student = {
  studentId: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
  initials: string;
  fatherName: string | null;
  motherName: string | null;
  currentAdmissionStatus: string;
  enrolledClass: string | null;
  enrolledClassId: number | null;
  currentAdmissionId: number;
  profilePicture?: string | null;
};

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

export type TransportCharge = {
  id: number;
  orgId: number;
  fromKM: number;
  toKM: number;
  amount: number;
  isActive: boolean;
  frequencyId: number;
};

export type StudentFeeLineItem = {
  id: number;
  headerId: number;
  chargeId: number;
  chargeName: string;
  chargeType: string;
  frequencyId: number;
  transportSlabId: number;
  monthsInterval: number;
  fromMonth: number;
  toMonth: number;
  baseAmount: number;
  transportAmount: number;
  finalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  isActive: boolean;
};

export type StudentFee = {
  id: number;
  orgId: number;
  admissionId: number;
  studentId: number;
  isTransportInclude: boolean;
  distanceFromSchool: number;
  defaultFrequencyId: number;
  defaultDiscountPercentage: number;
  receiptNo: string;
  transactionDate: string;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMode: string;
  remarks: string;
  isActive: boolean;
  feeLineItems: StudentFeeLineItem[];
  finalAmount?: number;
};

export type ApplicableChargesParams = {
  orgId: number;
  grade: string;
  includeTransport: boolean;
  distanceFromSchool: number;
  searchText?: string;
  count?: number;
};

// ---------- Zod Schemas ----------

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

const AddressSchema = z.object({
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: nullableString,
  pinCode: z.string().min(4, "Pin code must be at least 4 digits"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

const EnrollStudentSchema = z.object({
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
  profilePicture: nullableString.refine((val) => {
    if (!val) return true;
    const mime = detectMimeType(val);
    return ["image/jpeg", "image/png"].includes(mime);
  }, "Only JPG and PNG images are allowed"),

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

// ─────────────────────────────────────────────────────────
// API Actions
// ─────────────────────────────────────────────────────────

// Master Data APIs
export async function getAdmissionMasterData(params: {
  orgId: number;
  userId?: number;
}) {
  const orgId = Number(params.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  return post<ApiResponse<AdmissionMasterData>>("/api/MasterData/Get", {
    ...(await reqMeta(params.userId)),
    orgId,
  });
}

// Student APIs
export async function getStudentsByOrgId(
  orgId: number,
  userId?: number,
  isActive?: boolean,
  classId?: number,
  searchText?: string,
) {
  const finalOrgId = Number(orgId);
  const finalClassId = Number(classId ?? 0);

  const data = await post<ApiResponse<Student[]>>("/api/Student/GetStudents", {
    ...(await reqMeta(userId)),
    orgId: Number.isFinite(finalOrgId) ? finalOrgId : 0,
    isActive: isActive ?? true,
    classId: Number.isFinite(finalClassId) ? finalClassId : 0,
    searchText: searchText ?? "",
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

export async function enrollStudent(params: {
  payload: EnrollStudentPayload;
  userId?: number;
}) {
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

  const payloadBody = {
    ...(await reqMeta(params.userId)),
    ...p,
    id: p.id ?? 0,
    orgId: p.orgId,
    communicationAddress,
  };

  const res = await post<ApiResponse<unknown>>(
    "/api/Student/EnrollStudent",
    payloadBody,
  );

  revalidatePath("/dashboard/administration/admission");

  return res;
}

// Admission Charges APIs
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

// Fee Charges APIs
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

// Transport Charges APIs
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

// Admission Fee APIs
export async function getAdmissionFeeList(params: {
  orgId: number;
  admissionId: number;
  userId?: number;
}) {
  const orgId = Number(params.orgId);
  const admissionId = Number(params.admissionId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  if (!Number.isFinite(admissionId) || admissionId <= 0)
    throw new Error("Invalid admission ID");

  const meta = await reqMeta(params.userId);
  let res: ApiResponse<unknown>;

  try {
    res = await post<ApiResponse<unknown>>("/api/Fee/GetAdmissionFeeList", {
      requestGuid: meta.requestGuid,
      requestTime: meta.requestTime,
      userId: meta.userId,
      admissionid: admissionId,
      orgId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("no fees added")) {
      return [];
    }
    throw err;
  }

  const apiData = res?.data as any;
  const rawList = apiData?.admissionFees || apiData?.fees || [];

  return rawList.map((item: any) => ({
    ...item,
    totalAmount: item.totalFeeAmount ?? item.totalAmount ?? 0,
    discountAmount: item.totalDiscountAmount ?? item.discountAmount ?? 0,
    paidAmount: item.totalPaidAmount ?? item.paidAmount ?? 0,
    pendingAmount: item.totalPendingAmount ?? item.pendingAmount ?? 0,
  })) as StudentFee[];
}

export async function saveStudentFee(params: {
  payload: StudentFee;
  userId?: number;
}) {
  const meta = await reqMeta(params.userId);

  const res = await post<ApiResponse<unknown>>("/api/Fee/AddStudentFee", {
    requestGuid: meta.requestGuid,
    requestTime: meta.requestTime,
    userId: meta.userId,
    fee: params.payload,
  });

  revalidatePath(
    `/dashboard/administration/admission/${params.payload.studentId}/admissions/${params.payload.admissionId}/fee-structure`,
  );

  return res;
}

export async function getStudentFeeDetails(params: {
  headerId: number;
  orgId: number;
  userId?: number;
}) {
  const headerId = Number(params.headerId);
  const orgId = Number(params.orgId);
  if (!Number.isFinite(headerId) || headerId <= 0)
    throw new Error("Invalid fee header ID");
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");

  const meta = await reqMeta(params.userId);
  const res = await post<ApiResponse<any>>("/api/Fee/GetFeeDetails", {
    requestGuid: meta.requestGuid,
    requestTime: meta.requestTime,
    userId: meta.userId,
    headerId,
    orgId,
  });

  const apiData = res?.data;
  if (!apiData) return undefined;

  const fee = apiData.feeDetail || apiData.fee;
  const feeLineItems = fee?.feeLineItems || apiData.feeLineItems || [];

  if (fee) {
    return {
      ...fee,
      feeLineItems,
    } as StudentFee;
  }
  return undefined;
}

export async function getApplicableCharges(params: {
  payload: ApplicableChargesParams;
  userId?: number;
}) {
  const orgId = Number(params.payload.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");

  const meta = await reqMeta(params.userId);
  const res = await post<ApiResponse<unknown>>(
    "/api/Fee/GetApplicableCharges",
    {
      requestGuid: meta.requestGuid,
      requestTime: meta.requestTime,
      userId: meta.userId,
      parameters: {
        orgId,
        grade: params.payload.grade,
        includeTransport: params.payload.includeTransport,
        distanceFromSchool: Number(params.payload.distanceFromSchool) || 0,
        searchText: params.payload.searchText ?? "",
        count: params.payload.count ?? 10,
      },
    },
  );

  if (!res?.status && !res?.data) return [];

  return extractList<StudentFeeLineItem>(res?.data, "feeLineItems");
}

// Student Admissions API
export type StudentAdmission = {
  admissionId: number;
  orgId: number;
  studentName: string;
  academicYear: string;
  admissionDate: string;
  defaultFrequency?: string;
  class: string;
  status: string;
  defaultFrequencyId?: number;
  defaultDiscountPrecentage?: number;
  estimateFeeAmount?: number;
  isIncludeTransport: boolean;
  distanceFromSchool?: number;
  isActive: boolean;
  defaultDistance?: number;
  studentId?: number;
  classId?: number;
  totalFeeAmount?: number;
  totalDiscountAmount?: number;
  totalPaidFeeAmount?: number;
  totalPendingFeeAmount?: number;
};

export type StudentAdmissionsResponse = {
  admissions: StudentAdmission[];
};

export async function getStudentAdmissionsList(params: {
  orgId: number;
  studentId: number;
  userId?: number;
}) {
  const orgId = Number(params.orgId);
  const studentId = Number(params.studentId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  if (!Number.isFinite(studentId) || studentId <= 0)
    throw new Error("Invalid student ID");

  const meta = await reqMeta(params.userId);
  const res = await post<ApiResponse<StudentAdmissionsResponse>>(
    "/api/Admissions/GetStudetAdmissionsList",
    {
      requestGuid: meta.requestGuid,
      requestTime: meta.requestTime,
      userId: meta.userId,
      studentid: studentId,
      orgId: orgId,
    },
  );

  if (res?.data?.admissions) {
    res.data.admissions = res.data.admissions.map((item: any) => ({
      ...item,
      defaultDiscountPrecentage:
        item.defaultDiscountPercentage ?? item.defaultDiscountPrecentage ?? 0,
      estimateFeeAmount: item.totalEstimateFee ?? item.estimateFeeAmount ?? 0,
    }));
  }

  return res;
}

export type StudentAdmissionDetailResponse = {
  admission: StudentAdmission;
};

export async function getStudentAdmissionDetail(params: {
  orgId: number;
  admissionId: number;
  userId?: number;
}) {
  const orgId = Number(params.orgId);
  const admissionId = Number(params.admissionId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");
  if (!Number.isFinite(admissionId) || admissionId <= 0)
    throw new Error("Invalid admission ID");

  const meta = await reqMeta(params.userId);
  return post<ApiResponse<StudentAdmissionDetailResponse>>(
    "/api/Admissions/GetAdmission",
    {
      requestGuid: meta.requestGuid,
      requestTime: meta.requestTime,
      userId: meta.userId,
      admisisonId: admissionId,
      orgId: orgId,
    },
  );
}

export type ModifyAdmissionPayload = {
  admissionId: number;
  orgId: number;
  studentId: number;
  academicYear: string;
  classId: number;
  statusId: number;
  defaultFrequencyId: number;
  defaultDiscountPrecentage: number;
  estimateFeeAmount: number;
  isIncludeTransport: boolean;
  distanceFromSchool: number;
  isActive: boolean;
};

export type CalculateEstimateFeePayload = {
  frequencyId: number;
  defaultDiscountPercentage: number;
  orgId: number;
  classId: number;
};

export type CalculateEstimateFeeResponse = {
  totalFee: number;
};

export async function calculateEstimateFee(params: {
  payload: CalculateEstimateFeePayload;
  userId?: number;
}) {
  const meta = await reqMeta(params.userId);
  return post<ApiResponse<CalculateEstimateFeeResponse>>(
    "/api/Admissions/CalculateEstimateFee",
    {
      requestGuid: meta.requestGuid,
      requestTime: meta.requestTime,
      userId: meta.userId,
      ...params.payload,
    },
  );
}

export async function modifyAdmission(params: {
  payload: ModifyAdmissionPayload;
  userId?: number;
}) {
  const meta = await reqMeta(params.userId);
  const res = await post<ApiResponse<unknown>>(
    "/api/Admissions/ModifyAdmission",
    {
      requestGuid: meta.requestGuid,
      requestTime: meta.requestTime,
      userId: meta.userId,
      ...params.payload,
    },
  );

  revalidatePath(
    `/dashboard/administration/admission/${params.payload.studentId}/admissions`,
  );
  if (params.payload.admissionId > 0) {
    revalidatePath(
      `/dashboard/administration/admission/${params.payload.studentId}/admissions/${params.payload.admissionId}`,
    );
  }

  return res;
}

export type StudentWithFeeDetail = {
  academicYear: string;
  currentAdmissionId: number;
  currentAdmissionStatus: string;
  enrolledClass: string;
  enrolledClassId: number;
  fatherName: string;
  firstName: string;
  initials: string;
  isActive: boolean;
  lastName: string;
  motherName: string;
  studentId: number;
  totalDiscountAmount: number;
  totalEstimateFee: number;
  totalFeeAmount: number;
  totalPaidFeeAmount: number;
  totalPendingFeeAmount: number;
};

export type StudentListWithFeeDetailsParams = {
  orgId: number;
  studentName?: string;
  classId?: number;
  studentId?: number;
  fName?: string;
};

export async function getStudentListWithFeeDetails(params: {
  payload: StudentListWithFeeDetailsParams;
  userId?: number;
}) {
  const orgId = Number(params.payload.orgId);
  if (!Number.isFinite(orgId) || orgId <= 0)
    throw new Error("Invalid organisation ID");

  const meta = await reqMeta(params.userId);
  return post<ApiResponse<StudentWithFeeDetail[]>>(
    "/api/Student/GetStudentListWithFeeDetails",
    {
      requestGuid: meta.requestGuid,
      requestTime: meta.requestTime,
      userId: Number(meta.userId) || 0,
      orgId,
      studentName: params.payload.studentName
        ? String(params.payload.studentName).trim()
        : "",
      classId: Number(params.payload.classId) || 0,
      studentId: Number(params.payload.studentId) || 0,
      fName: params.payload.fName ? String(params.payload.fName).trim() : "",
    },
  );
}
