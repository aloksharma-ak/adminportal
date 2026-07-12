"use server";

import { revalidatePath } from "next/cache";
import { apiPost, reqMeta, requireUrl } from "@/lib/api-client";
import { extractDetail, extractList } from "@/app/dashboard/utils";

const ACADEMICS_API_URL = process.env.ACADEMICS_API_URL;

function requireAcademicsUrl() {
  return requireUrl(ACADEMICS_API_URL, "ACADEMICS_API_URL");
}

async function post<T>(path: string, body: Record<string, unknown>) {
  return apiPost<T>(requireAcademicsUrl(), path, body);
}

function isEmptyResult(error: unknown, terms: string[]) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error);
  return terms.some((term) => message.includes(term));
}

export type AcademicsApiResponse<T> = {
  responseTime?: string;
  status: boolean;
  message: string;
  data: T;
};

export type AcademicClass = {
  id: number;
  grade: string;
  section: string;
  classText?: string;
  classTeacherId: number;
  classTeacherName?: string;
  noOfStudents?: number;
  orgId: number;
  isActive?: boolean;
};

export type AcademicMasterData = {
  gradeMasters?: { id: number; grade: string }[];
  classMasters?: AcademicClass[];
  classTeachersMasterData?: {
    id: number;
    name: string;
  }[];
  attendanceStatusMasters?: {
    id: number;
    status?: string;
    name?: string;
  }[];
};

export type ClassStudent = {
  studentId: number;
  firstName?: string;
  lastName?: string;
  studentName?: string;
  admissionNo?: string;
  rollNo?: string;
};

export type AttendanceDetail = {
  studentId: number;
  studentName?: string;
  status: number;
  statusName?: string;
  remarks: string;
};

export type AttendanceSession = {
  id: number;
  attendanceId?: number;
  classId: number;
  orgId: number;
  date: string;
  presentCount?: number;
  absentCount?: number;
  details?: AttendanceDetail[];
  totalStudent?: number;
  totalPresent?: number;
  totalAbsent?: number;
};

export async function getAcademicsMasterData(params: {
  orgId: number;
  userId?: number;
}) {
  const meta = await reqMeta(params.userId);
  return post<AcademicsApiResponse<AcademicMasterData>>("/api/MasterData/Get", {
    ...meta,
    orgId: Number(params.orgId),
  });
}

export async function getClassList(params: { orgId: number; userId?: number }) {
  const meta = await reqMeta(params.userId);
  try {
    const response = await post<AcademicsApiResponse<unknown>>(
      "/api/Classes/GetClassList",
      {
        ...meta,
        orgId: Number(params.orgId),
      },
    );
    return extractList<AcademicClass>(response.data, "classes");
  } catch (error) {
    if (isEmptyResult(error, ["no classes", "class list not found"])) return [];
    throw error;
  }
}

export async function createClass(params: {
  payload: Pick<
    AcademicClass,
    "id" | "grade" | "section" | "classTeacherId" | "orgId"
  >;
  userId?: number;
}) {
  const meta = await reqMeta(params.userId);
  const response = await post<AcademicsApiResponse<unknown>>(
    "/api/Classes/CreateClass",
    {
      ...meta,
      ...params.payload,
    },
  );
  revalidatePath("/dashboard/academics");
  return response;
}

export async function getClassStudentList(params: {
  classId: number;
  orgId: number;
  userId?: number;
}) {
  const meta = await reqMeta(params.userId);
  try {
    const response = await post<AcademicsApiResponse<unknown>>(
      "/api/Classes/GetClassStudentList",
      {
        ...meta,
        classId: Number(params.classId),
        orgId: Number(params.orgId),
      },
    );
    return extractList<ClassStudent>(response.data, "students");
  } catch (error) {
    if (isEmptyResult(error, ["no students", "student list not found"]))
      return [];
    throw error;
  }
}

export async function getClassAttendance(params: {
  orgId: number;
  classId: number;
  fromDate: string;
  toDate: string;
  userId?: number;
}) {
  const meta = await reqMeta(params.userId);
  try {
    const response = await post<AcademicsApiResponse<unknown>>(
      "/api/Attendance/GetClassAttendance",
      {
        ...meta,
        orgId: Number(params.orgId),
        classId: Number(params.classId),
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    );
    return extractList<AttendanceSession>(response.data, "attendance");
  } catch (error) {
    if (isEmptyResult(error, ["no attendance", "attendance not found"]))
      return [];
    throw error;
  }
}

export async function getAttendanceDetail(params: {
  attendanceId: number;
  orgId: number;
  userId?: number;
}) {
  const meta = await reqMeta(params.userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await post<AcademicsApiResponse<any>>(
    "/api/Attendance/GetAttendanceDetail",
    {
      ...meta,
      attendanceId: Number(params.attendanceId),
      orgId: Number(params.orgId),
    },
  );

  const extracted = extractDetail<AttendanceSession>(
    response.data,
    "attendanceDetail",
  );

  return extracted;
}

export async function modifyAttendanceSession(params: {
  attendance: {
    id: number;
    classId: number;
    orgId: number;
    date: string;
    details: {
      studentId: number;
      status: number;
      remarks: string;
    }[];
  };
  userId?: number;
}) {
  try {
    const meta = await reqMeta(params.userId);
    const response = await post<AcademicsApiResponse<unknown>>(
      "/api/Attendance/ModifyAttendanceSession",
      {
        ...meta,
        attendance: params.attendance,
      },
    );
    revalidatePath(
      `/dashboard/academics/classes/${params.attendance.classId}/attendance`,
    );
    return response;
  } catch (error) {
    return {
      status: false,
      message: error instanceof Error ? error.message : String(error),
      data: null,
    };
  }
}
