import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  getAcademicsMasterData,
  getClassList,
  type AcademicClass,
} from "@/app/dashboard/academics/actions";
import ClassGrid from "@/components/academics/ClassGrid";
import { Container } from "@/components";
import { ErrorCard } from "@/components/shared-ui/States";

export default async function AcademicsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let classes: AcademicClass[] = [];
  let gradeOptions: { value: string; label: string }[] = [];
  let teacherOptions: { value: string; label: string }[] = [];
  let errorMessage: string | null = null;

  try {
    const [classResult, masterResult] = await Promise.allSettled([
      getClassList({
        orgId: session.user.orgId,
        userId: session.user.profileId,
      }),
      getAcademicsMasterData({
        orgId: session.user.orgId,
        userId: session.user.profileId,
      }),
    ]);

    if (classResult.status === "fulfilled") {
      classes = classResult.value;
    } else {
      throw classResult.reason;
    }

    if (masterResult.status === "fulfilled") {
      const master = masterResult.value.data;
      gradeOptions = (master?.gradeMasters ?? []).map((grade) => ({
        value: grade.grade,
        label: grade.grade,
      }));
      const classTeachers = master?.classTeachersMasterData ?? [];
      teacherOptions = classTeachers.map((teacher) => ({
        value: String(teacher.id),
        label: teacher.name,
      }));

      const teacherNames = new Map(
        classTeachers.map((teacher) => [teacher.id, teacher.name]),
      );
      classes = classes.map((academicClass) => ({
        ...academicClass,
        classTeacherName:
          academicClass.classTeacherName ||
          teacherNames.get(academicClass.classTeacherId),
      }));
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Failed to load classes.";
  }

  return (
    <Container className="py-8">
      {errorMessage ? (
        <ErrorCard message={errorMessage} />
      ) : (
        <ClassGrid
          data={classes}
          orgId={session.user.orgId}
          brandColor={session.user.brandColor}
          gradeOptions={gradeOptions}
          teacherOptions={teacherOptions}
        />
      )}
    </Container>
  );
}
