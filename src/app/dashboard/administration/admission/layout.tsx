import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdmissionTabs from "@/components/administration/AdmissionTabs";

export default async function AdmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      <AdmissionTabs brandColor={session.user.brandColor} />
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
