import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Users } from "lucide-react";

const tiles = [
  {
    href: "/dashboard/users/employees",
    icon: Users,
    iconBg: "bg-blue-50 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "All Employees",
    description: "View and search all staff members",
  },
  {
    href: "/dashboard/users/employees/create",
    icon: UserPlus,
    iconBg: "bg-emerald-50 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Add Employee",
    description: "Onboard a new staff member",
  },
];

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Users
        </h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Manage employees and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map(
          ({ href, icon: Icon, iconBg, iconColor, title, description }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-xl ${iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {title}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
