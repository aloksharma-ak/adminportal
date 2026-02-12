import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <Link href="/dashboard/users/employees/create">
        <Button className="bg-amber-100 text-black hover:bg-amber-50">
          Create Employees
        </Button>
      </Link>
    </main>
  );
}
