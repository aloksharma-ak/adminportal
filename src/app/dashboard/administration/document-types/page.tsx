import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getDocumentTypesList } from "@/app/dashboard/administration/actions";
import { DocumentTypesGrid } from "@/components/administration/DocumentTypes";
import { LinkButton } from "@/components/controls/Buttons";
import { Container, PageHeader } from "@/components";

export default async function DocumentTypesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  const data = await getDocumentTypesList({ orgId: session.user.orgId, userId: session.user.profileId });
  return <Container className="py-6"><PageHeader title="Document Types" description="View and manage upload document types" backLabel="Back to Administration" actions={<LinkButton href="/dashboard/administration/document-types/add" color={session.user.brandColor} leftIcon={<Plus className="h-4 w-4" />}>Add Document Type</LinkButton>} /><DocumentTypesGrid data={data} brandColor={session.user.brandColor} /></Container>;
}
