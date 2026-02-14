"use server";

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
