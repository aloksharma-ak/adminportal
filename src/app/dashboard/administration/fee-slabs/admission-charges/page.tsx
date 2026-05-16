"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAdmissionChargesList, type AdmissionCharge } from "../action";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import { LinkButton } from "@/components/controls/Buttons";
import { Plus } from "lucide-react";
import AdmissionChargesGrid from "@/components/administration/fee-slabs/admission-charges-grid";

export default async function AdmissionChargesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let charges: AdmissionCharge[] = [];
  let fetchError: string | null = null;

  try {
    charges = await getAdmissionChargesList(
      session.user.orgId,
      session.user.profileId,
    );
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to load admission charges";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Admission Charges"
        description="View and manage admission related charges"
        backLabel="Back to Fee Slabs"
        backHref="/dashboard/administration/fee-slabs"
        actions={
          <LinkButton
            color={session.user.brandColor}
            href="/dashboard/administration/fee-slabs/admission-charges/add"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Charge
          </LinkButton>
        }
      />

      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <AdmissionChargesGrid
          data={charges}
          brandColor={session.user.brandColor}
        />
      )}
    </div>
  );
}
