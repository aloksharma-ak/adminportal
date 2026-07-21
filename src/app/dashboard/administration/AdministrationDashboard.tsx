"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { GraduationCap, Wallet, Coins, Files, type LucideIcon } from "lucide-react";
import AddFeeShortcutDialog from "@/components/administration/AddFeeShortcutDialog";
import { type ClassMaster } from "@/app/dashboard/administration/actions";

type TileItem = {
  href?: string;
  onClick?: () => void;
  Icon: LucideIcon;
  gradient: string;
  title: string;
  description: string;
};

type Props = {
  orgId: number;
  userId?: number;
  classMasters: ClassMaster[];
  brandColor?: string | null;
};

export default function AdministrationDashboard({
  orgId,
  userId,
  classMasters,
  brandColor,
}: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const tiles: TileItem[] = [
    {
      href: "/dashboard/administration/document-types",
      Icon: Files,
      gradient: "from-cyan-500 to-blue-500",
      title: "Document Types",
      description: "Configure document types used by upload controls",
    },
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
    {
      onClick: () => setDialogOpen(true),
      Icon: Coins,
      gradient: "from-violet-500 to-purple-500",
      title: "Add Fee",
      description: "Quick search to record new student fees or admissions",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tiles.map(
          ({ href, onClick, Icon, gradient, title, description }, index) => {
            const content = (
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
            );

            if (href) {
              return (
                <Link key={href} href={href} className="group">
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={index}
                onClick={onClick}
                className="text-left w-full h-full block focus:outline-hidden"
                type="button"
              >
                {content}
              </button>
            );
          },
        )}
      </div>

      <AddFeeShortcutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classMasters={classMasters}
        orgId={orgId}
        userId={userId}
        brandColor={brandColor}
      />
    </>
  );
}
