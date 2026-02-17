import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import Navbar from "../navbar";
import Footer from "../footer";
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

  // Fetch org + employee data in parallel for performance
  const [orgResult, empResult] = await Promise.allSettled([
    getOrganisationDetail(session.user.orgCode),
    getEmployee({
      profileId: session.user.profileId,
      orgId: session.user.orgId,
    }),
  ]);

  if (orgResult.status === "rejected") {
    redirect("/auth/login");
  }

  const org = orgResult.value.organisation;
  const initials =
    empResult.status === "fulfilled"
      ? (empResult.value?.data?.initials ?? "")
      : "";
  const profilePicture =
    empResult.status === "fulfilled"
      ? (empResult.value?.data?.profilePicture ?? "")
      : "";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar
        orgCode={session.user.orgCode}
        brandColor={session.user.brandColor ?? ""}
        initials={initials}
        profilePicture={profilePicture}
      />

      {/* Scrollable content area — padded top for fixed navbar, bottom for fixed footer */}
      <main className="flex-1 overflow-y-auto pt-16 pb-10 custom-scroll">
        {children}
      </main>

      <Footer website={org.website} email={org.email} phone={org.phone} />
    </div>
  );
}
