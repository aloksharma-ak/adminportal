"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Navbar from "../navbar";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import Footer from "../footer";
import { getOrganisationDetail } from "../utils";
// import { getEmployee } from "../utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.orgCode) {
    redirect("/auth/login");
  }

  // const impDetails = await getEmployee({
  //   profileId: session.user.profileId,
  //   orgId: session.user.orgId,
  // });

  const org = await getOrganisationDetail(session.user.orgCode);
  if (!org.success) {
    redirect("/auth/login");
  }

  return (
    <>
      <Navbar
        orgCode={session.user.orgCode}
        brandColor={session.user.brandColor ?? ""}
        // impDetails={impDetails}
      />
      {children}
      <Footer
        website={org.organisation.website}
        email={org.organisation.email}
        phone={org.organisation.phone}
      />
    </>
  );
}
