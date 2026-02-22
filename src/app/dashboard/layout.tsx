import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Navbar from "../navbar";
import Footer from "../footer";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import { getEmployee, getOrganisationDetail } from "../utils";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgCode) redirect("/auth/login");

  const [orgResult, empResult] = await Promise.allSettled([
    getOrganisationDetail(session.user.orgCode),
    getEmployee({ profileId: session.user.profileId, empId: 0, orgId: session.user.orgId }),
  ]);

  if (orgResult.status === "rejected") redirect("/auth/login");

  const org = orgResult.value.organisation;
  const emp = empResult.status === "fulfilled" ? empResult.value?.data : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar
        orgCode={session.user.orgCode}
        brandColor={session.user.brandColor ?? ""}
        initials={emp?.initials ?? ""}
        profilePicture={emp?.profilePicture ?? ""}
        firstName={emp?.firstName ?? ""}
        lastName={emp?.lastName ?? ""}
      />
      <main className="flex-1 overflow-y-auto pt-16 pb-10 custom-scroll">
        {children}
      </main>
      <Footer website={org.website} email={org.email} phone={org.phone} />
    </div>
  );
}
