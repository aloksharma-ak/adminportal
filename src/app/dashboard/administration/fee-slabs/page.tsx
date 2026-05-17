import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Card, CardContent } from "@/components/ui/Card";
import { ReceiptText, Coins, Truck, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared-ui/PageHeader";

const tiles: {
  href: string;
  Icon: LucideIcon;
  gradient: string;
  title: string;
  description: string;
}[] = [
  {
    href: "/dashboard/administration/fee-slabs/admission-charges",
    Icon: ReceiptText,
    gradient: "from-blue-500 to-indigo-500",
    title: "Admission Charges",
    description: "Manage one-time or recurring admission related charges",
  },
  {
    href: "/dashboard/administration/fee-slabs/fee-charges",
    Icon: Coins,
    gradient: "from-emerald-500 to-teal-500",
    title: "Fee Charges",
    description: "Configure regular tuition and other fee charges by grade",
  },
  {
    href: "/dashboard/administration/fee-slabs/transport-charges",
    Icon: Truck,
    gradient: "from-orange-500 to-amber-500",
    title: "Transport Charges",
    description: "Set transport fees based on distance and frequency",
  },
];

export default async function FeeSlabsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Fee Slabs"
        description="Configure various charges and fee structures"
        backLabel="Back to Administration"
        backHref="/dashboard/administration"
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
