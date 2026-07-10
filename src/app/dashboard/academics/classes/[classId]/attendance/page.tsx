import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  getAcademicsMasterData,
  getClassAttendance,
  getClassList,
  getClassStudentList,
  type AttendanceSession,
  type ClassStudent,
} from "@/app/dashboard/academics/actions";
import AttendanceWorkspace from "@/components/academics/AttendanceWorkspace";
import { Container } from "@/components";

type PageProps = {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ fromDate?: string; toDate?: string }>;
};

function currentMonthRangeInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const year = Number(value.year);
  const month = Number(value.month);

  const fromDate = `${value.year}-${value.month}-01`;
  const lastDayDate = new Date(Date.UTC(year, month, 0));
  const lastDay = String(lastDayDate.getUTCDate()).padStart(2, "0");
  const toDate = `${value.year}-${value.month}-${lastDay}`;

  return { fromDate, toDate };
}

function validDate(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export default async function ClassAttendancePage({
  params,
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { classId: rawClassId } = await params;
  const query = await searchParams;
  const classId = Number(rawClassId);
  if (!Number.isInteger(classId) || classId <= 0) notFound();

  const { fromDate: defaultFromDate, toDate: defaultToDate } =
    currentMonthRangeInIndia();
  const fromDate = validDate(query.fromDate) ?? defaultFromDate;
  const toDate = validDate(query.toDate) ?? defaultToDate;

  let students: ClassStudent[] = [];
  let sessions: AttendanceSession[] = [];
  let className = `Class #${classId}`;
  let statusOptions = [
    { value: "1", label: "Present" },
    { value: "2", label: "Absent" },
    { value: "3", label: "Leave" },
  ];
  let errorMessage: string | null = null;

  try {
    const [studentsResult, attendanceResult, classResult, masterResult] =
      await Promise.allSettled([
        getClassStudentList({
          classId,
          orgId: session.user.orgId,
          userId: session.user.profileId,
        }),
        getClassAttendance({
          classId,
          orgId: session.user.orgId,
          fromDate,
          toDate,
          userId: session.user.profileId,
        }),
        getClassList({
          orgId: session.user.orgId,
          userId: session.user.profileId,
        }),
        getAcademicsMasterData({
          orgId: session.user.orgId,
          userId: session.user.profileId,
        }),
      ]);

    if (studentsResult.status === "fulfilled") {
      students = studentsResult.value;
    } else {
      const rawMsg =
        studentsResult.reason instanceof Error
          ? studentsResult.reason.message
          : "Failed to load student list";
      const colonIndex = rawMsg.indexOf(":");
      errorMessage =
        colonIndex !== -1 ? rawMsg.substring(colonIndex + 1).trim() : rawMsg;
    }

    if (attendanceResult.status === "fulfilled") {
      sessions = attendanceResult.value;
    } else {
      const rawMsg =
        attendanceResult.reason instanceof Error
          ? attendanceResult.reason.message
          : "Failed to load attendance sessions";
      const colonIndex = rawMsg.indexOf(":");
      if (!errorMessage) {
        errorMessage =
          colonIndex !== -1 ? rawMsg.substring(colonIndex + 1).trim() : rawMsg;
      }
    }

    if (classResult.status === "fulfilled") {
      const selectedClass = classResult.value.find(
        (item) => item.id === classId,
      );
      if (selectedClass) {
        className =
          selectedClass.classText ||
          `${selectedClass.grade}-${selectedClass.section}`;
      }
    }

    if (masterResult.status === "fulfilled") {
      const statuses = masterResult.value.data?.attendanceStatusMasters ?? [];
      if (statuses.length > 0) {
        statusOptions = statuses.map((status) => ({
          value: String(status.id),
          label: status.status ?? status.name ?? `Status ${status.id}`,
        }));
      }
    }
  } catch (error) {
    console.error("Academics allSettled wrapper check failed:", error);
  }

  return (
    <Container className="py-8">
      <AttendanceWorkspace
        classId={classId}
        orgId={session.user.orgId}
        className={className}
        students={students}
        sessions={sessions}
        statusOptions={statusOptions}
        initialFromDate={fromDate}
        initialToDate={toDate}
        brandColor={session.user.brandColor}
        errorMessage={errorMessage}
      />
    </Container>
  );
}
