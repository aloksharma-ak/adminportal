import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import EnrollStudentForm from "@/components/admission/enroll-student-form";
import { Container } from "@/components/shared-ui/container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Index() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <Container className="py-6">
      <EnrollStudentForm
        orgId={session.user.orgId}
        orgName={session.user.orgName ?? ""}
        brandColor={session.user.brandColor ?? ""}
      />
    </Container>
  );
}
