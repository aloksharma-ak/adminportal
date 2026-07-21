import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getDocumentType } from "@/app/dashboard/administration/actions";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Container, PageHeader } from "@/components";

export default async function DocumentTypePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions); if (!session) redirect("/auth/login");
  const id = Number((await params).id); if (!Number.isInteger(id) || id <= 0) notFound();
  const item = await getDocumentType({ id, orgId: session.user.orgId, userId: session.user.profileId }); if (!item) notFound();
  return <Container className="py-8"><PageHeader title={item.documentType} description="Document type details" backLabel="Back to List" actions={<Link href={`/dashboard/administration/document-types/${id}/edit`}><Pencil className="h-4 w-4" /></Link>} /><Card><CardContent className="grid gap-6 pt-6 md:grid-cols-4"><div><p className="text-sm text-slate-500">ID</p><p className="font-semibold">#{item.id}</p></div><div><p className="text-sm text-slate-500">Document Type Name</p><p className="font-semibold">{item.documentType}</p></div><div><p className="text-sm text-slate-500">Module ID</p><p className="font-semibold">{item.moduleId}</p></div><div><p className="text-sm text-slate-500">Status</p><Badge>{item.isActive ? "Active" : "Inactive"}</Badge></div></CardContent></Card></Container>;
}
