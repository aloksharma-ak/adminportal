import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-white">
      <h1 className="text-3xl font-bold text-gray-800">User Page</h1>
    </main>
  );
}
