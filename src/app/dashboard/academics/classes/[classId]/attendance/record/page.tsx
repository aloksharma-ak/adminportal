import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  getAcademicsMasterData,
  getClassList,
  getClassStudentList,
  getAttendanceDetail,
  type ClassStudent,
  type AttendanceSession,
} from "@/app/dashboard/academics/actions";
import RecordAttendanceWorkspace from "@/components/academics/AttendanceWorkspace/RecordAttendanceWorkspace";
import { Container } from "@/components";
import { ErrorCard } from "@/components/shared-ui/States";

type PageProps = {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ id?: string }>;
};

export default async function RecordAttendancePage({
  params,
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { classId: rawClassId } = await params;
  const query = await searchParams;
  const classId = Number(rawClassId);
  if (!Number.isInteger(classId) || classId <= 0) notFound();

  const attendanceId = query.id ? Number(query.id) : undefined;

  let students: ClassStudent[] = [];
  let attendanceSessionData: AttendanceSession | null = null;
  let className = `Class #${classId}`;
  let statusOptions = [
    { value: "1", label: "Present" },
    { value: "2", label: "Absent" },
    { value: "3", label: "Leave" },
  ];
  let errorMessage: string | null = null;

  try {
    const promises = [
      getClassStudentList({
        classId,
        orgId: session.user.orgId,
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
    ] as const;

    const [studentsResult, classResult, masterResult] = await Promise.allSettled(promises);

    if (studentsResult.status === "fulfilled") {
      students = studentsResult.value;
    } else {
      throw studentsResult.reason;
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
      const statuses =
        masterResult.value.data?.attendanceStatusMasters ?? [];
      if (statuses.length > 0) {
        statusOptions = statuses.map((status) => ({
          value: String(status.id),
          label: status.status ?? status.name ?? `Status ${status.id}`,
        }));
      }
    }

    if (attendanceId) {
      const detail = await getAttendanceDetail({
        attendanceId,
        orgId: session.user.orgId,
        userId: session.user.profileId,
      });
      if (detail) {
        attendanceSessionData = detail;
      }
    }
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to load record attendance page.";
  }

  return (
    <Container className="py-8">
      {errorMessage ? (
        <ErrorCard message={errorMessage} />
      ) : (
        <RecordAttendanceWorkspace
          classId={classId}
          orgId={session.user.orgId}
          className={className}
          students={students}
          attendanceSession={attendanceSessionData}
          statusOptions={statusOptions}
          brandColor={session.user.brandColor}
        />
      )}
    </Container>
  );
}
