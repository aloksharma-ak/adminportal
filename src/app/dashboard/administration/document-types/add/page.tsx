import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { DocumentTypeForm } from "@/components/administration/DocumentTypes";
import { Container, PageHeader } from "@/components";

export default async function AddDocumentTypePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  return <Container className="py-8"><PageHeader title="Add Document Type" description="Configure a document type for uploads" backLabel="Back to List" /><DocumentTypeForm orgId={session.user.orgId} brandColor={session.user.brandColor} /></Container>;
}
