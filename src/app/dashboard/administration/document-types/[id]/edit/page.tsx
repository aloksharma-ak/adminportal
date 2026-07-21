import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getDocumentType } from "@/app/dashboard/administration/actions";
import { DocumentTypeForm } from "@/components/administration/DocumentTypes";
import { Container, PageHeader } from "@/components";

export default async function EditDocumentTypePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions); if (!session) redirect("/auth/login");
  const id = Number((await params).id); if (!Number.isInteger(id) || id <= 0) notFound();
  const item = await getDocumentType({ id, orgId: session.user.orgId, userId: session.user.profileId }); if (!item) notFound();
  return <Container className="py-8"><PageHeader title="Edit Document Type" description={`Update ${item.documentType}`} backLabel="Back to Details" /><DocumentTypeForm orgId={session.user.orgId} defaultValues={item} brandColor={session.user.brandColor} /></Container>;
}
