"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Navbar from "../navbar";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import { getEmployee, getOrganisationDetail } from "../utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.orgCode) {
    redirect("/auth/login");
  }

  const orgCode = session.user.orgCode;
  const org = await getOrganisationDetail(orgCode);
  const impDetails = await getEmployee({
    profileId: session.user.profileId,
    orgId: session.user.orgId,
  });

  return (
    <>
      <Navbar
        orgCode={orgCode}
        brandColor={org.brandColor}
        impDetails={impDetails}
      />
      {children}
    </>
  );
}
