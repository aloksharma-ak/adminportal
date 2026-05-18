"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { LinkButton } from "@/components/controls/Buttons";
import { UserPlus, Landmark, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdmissionTabsProps {
  brandColor?: string | null;
}

export default function AdmissionTabs({ brandColor }: AdmissionTabsProps) {
  const pathname = usePathname();
  const currentTab = pathname?.endsWith("/fees") ? "fees" : "details";
  const primaryColor = brandColor || "#3b82f6";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission"
        description={
          currentTab === "fees"
            ? "Manage student fees and collections"
            : "Manage student enrolments and records"
        }
        backLabel="Back to Administration"
        backHref="/dashboard/administration"
        actions={
          currentTab === "details" && (
            <LinkButton
              color={primaryColor}
              href="/dashboard/administration/admission/enroll-student"
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Enroll Student
            </LinkButton>
          )
        }
      />

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-8" aria-label="Tabs">
          <Link
            href="/dashboard/administration/admission/details"
            className={cn(
              "flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition-all duration-200",
              currentTab === "details"
                ? "border-current text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            )}
            style={
              currentTab === "details"
                ? { color: primaryColor, borderColor: primaryColor }
                : undefined
            }
          >
            <FileText className="h-4 w-4" />
            Admission Details
          </Link>

          <Link
            href="/dashboard/administration/admission/fees"
            className={cn(
              "flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition-all duration-200",
              currentTab === "fees"
                ? "border-current text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            )}
            style={
              currentTab === "fees"
                ? { color: primaryColor, borderColor: primaryColor }
                : undefined
            }
          >
            <Landmark className="h-4 w-4" />
            Fee Details
          </Link>
        </nav>
      </div>
    </div>
  );
}
