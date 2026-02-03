import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Megaphone,
  Users,
  Wallet,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tile = {
  title: string;
  desc: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const tiles: Tile[] = [
  {
    title: "Leads & Enquiries",
    desc: "Capture and track admissions leads.",
    href: "/dashboard/leads",
    Icon: Megaphone,
  },
  {
    title: "Students",
    desc: "Manage student profiles and status.",
    href: "/dashboard/students",
    Icon: Users,
  },
  {
    title: "Fees",
    desc: "Invoices, dues, receipts, payments.",
    href: "/dashboard/fees",
    Icon: Wallet,
  },
  {
    title: "Schedule",
    desc: "Timetable, classes, exams calendar.",
    href: "/dashboard/schedule",
    Icon: CalendarDays,
  },
  {
    title: "Reports",
    desc: "Admissions, fees, and performance.",
    href: "/dashboard/reports",
    Icon: BarChart3,
  },
  {
    title: "More",
    desc: "Go to full modules list.",
    href: "/dashboard/more",
    Icon: ArrowRight,
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Quick access to your main modules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map(({ title, desc, href, Icon }) => (
            <Link key={title} href={href} className="group">
              <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">{desc}</p>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-lg border bg-slate-50">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    Open
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
