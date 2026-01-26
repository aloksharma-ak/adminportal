import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(session.user, null, 2)}</pre>
    </div>
  );
}
