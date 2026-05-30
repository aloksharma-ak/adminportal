import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Card, CardContent } from "@/components/ui/Card";
import { GraduationCap, Wallet, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared-ui/PageHeader";

const tiles: {
  href: string;
  Icon: LucideIcon;
  gradient: string;
  title: string;
  description: string;
}[] = [
  {
    href: "/dashboard/administration/admission",
    Icon: GraduationCap,
    gradient: "from-blue-500 to-indigo-500",
    title: "Admission",
    description: "Manage student enrolments, records and details",
  },
  {
    href: "/dashboard/administration/fee-slabs",
    Icon: Wallet,
    gradient: "from-emerald-500 to-teal-500",
    title: "Fee Slabs",
    description: "Configure admission, fee and transport charges",
  },
];

export default async function AdministrationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Administration"
        description="Manage school operations and financial configurations"
        backLabel="Back to Dashboard"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tiles.map(({ href, Icon, gradient, title, description }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50">
              <CardContent className="flex flex-col gap-4 p-6">
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl bg-linear-to-br ${gradient} shadow-sm`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
