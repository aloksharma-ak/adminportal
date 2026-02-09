import { getServerSession } from "next-auth/next";
import Navbar from "../navbar";
import { authOptions } from "../api/auth/[...nextauth]/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const orgCode = session?.user?.orgCode;

  return (
    <>
      <Navbar orgCode={orgCode} />
      {children}
    </>
  );
}
