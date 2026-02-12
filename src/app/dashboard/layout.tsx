"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Navbar from "../navbar";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import Footer from "../footer";
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

  const org = await getOrganisationDetail(session.user.orgCode);
  if (!org.success) {
    redirect("/auth/login");
  }

  const impDetails = await getEmployee({
    profileId: session.user.profileId,
    orgId: session.user.orgId,
  });

  const initials = impDetails.data.initials;
  const profilePicture = impDetails.data.profilePicture;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar
        orgCode={session.user.orgCode}
        brandColor={session.user.brandColor ?? ""}
        initials={initials}
        profilePicture={profilePicture}
      />

      {/* ✅ Only this area scrolls */}
      <main className="flex-1 overflow-y-auto custom-scroll py-16">
        {children}
      </main>

      {/* Footer */}
      <Footer
        website={org.organisation.website}
        email={org.organisation.email}
        phone={org.organisation.phone}
      />
    </div>
  );
}
