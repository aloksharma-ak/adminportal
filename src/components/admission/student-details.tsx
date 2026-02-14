"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type Address = {
  addressLine1?: string;
  addressLine2?: string;
  pinCode?: string;
  city?: string;
  state?: string;
};

type Contact = {
  name?: string;
  phone?: string;
  secondaryPhone?: string;
  aadharNo?: string;
  email?: string;
};

export type StudentDetail = {
  studentId?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  initials?: string;
  phone?: string;
  secondaryPhone?: string;
  aadharNo?: string;
  email?: string;
  profilePicture?: string | null;

  permanantAddress?: Address | null;
  isCommunicationAddressSameAsPermanant?: boolean;
  communicationAddress?: Address | null;

  orgId?: number;
  enrolledClass?: string | null;

  previousSchoolName?: string | null;
  previousSchoolAddress?: string | null;

  fatherContactDetails?: Contact | null;
  motherContactDetails?: Contact | null;

  isActive?: boolean;

  dob?: string | null;
  religion?: string | null;
  cateogry?: string | null;

  contactPersonName?: string | null;
  contactPersonPhone?: string | null;
};

function cn(...c: (string | undefined | false)[]) {
  return c.filter(Boolean).join(" ");
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">
        {value ?? <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address?: Address | null;
}) {
  const line1 = address?.addressLine1?.trim();
  const line2 = address?.addressLine2?.trim();
  const city = address?.city?.trim();
  const state = address?.state?.trim();
  const pin = address?.pinCode?.trim();

  const hasAny = Boolean(line1 || line2 || city || state || pin);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasAny ? (
          <>
            <div className="text-sm font-medium">
              {[line1, line2].filter(Boolean).join(", ")}
            </div>
            <div className="text-sm text-muted-foreground">
              {[city, state, pin].filter(Boolean).join(" • ")}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            No address provided
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactCard({ title, c }: { title: string; c?: Contact | null }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" value={c?.name || "—"} />
        <Field label="Phone" value={c?.phone || "—"} />
        <Field label="Secondary Phone" value={c?.secondaryPhone || "—"} />
        <Field label="Email" value={c?.email || "—"} />
      </CardContent>
    </Card>
  );
}

export default function StudentDetails({
  student,
}: {
  student: StudentDetail;
}) {
  const fullName = [student.firstName, student.middleName, student.lastName]
    .map((x) => (x ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const active = Boolean(student.isActive);

  const statusClass = active
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Hero Card */}
      <div className="rounded-xl border bg-linear-to-br from-blue-50 via-background to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <span className="text-lg font-bold">
                {student.initials ?? "ST"}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {fullName || "Student"}
                </h1>
                <Badge
                  variant="outline"
                  className={cn("px-2 py-1", statusClass)}
                >
                  {active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {student.phone ? (
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(student.phone!)}
              >
                Copy Phone
              </Button>
            ) : null}
            {student.email ? (
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(student.email!)}
              >
                Copy Email
              </Button>
            ) : null}
            {student.aadharNo ? (
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(student.aadharNo!)}
              >
                Copy Aadhar
              </Button>
            ) : null}
          </div>
        </div>

        <Separator className="my-5" />

        {/* Quick Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <Field label="Phone" value={student.phone || "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Field
                label="Secondary Phone"
                value={student.secondaryPhone || "—"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Field label="Email" value={student.email || "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Field label="Aadhar No" value={student.aadharNo || "—"} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Address */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AddressBlock
              title="Permanent Address"
              address={student.permanantAddress}
            />

            <AddressBlock
              title={
                student.isCommunicationAddressSameAsPermanant
                  ? "Communication Address (Same as Permanent)"
                  : "Communication Address"
              }
              address={
                student.isCommunicationAddressSameAsPermanant
                  ? student.permanantAddress
                  : student.communicationAddress
              }
            />
          </div>

          {/* Previous School */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Previous School</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="School Name"
                value={student.previousSchoolName || "—"}
              />
              <Field
                label="School Address"
                value={student.previousSchoolAddress || "—"}
              />
            </CardContent>
          </Card>

          {/* Parents */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ContactCard
              title="Father Contact"
              c={student.fatherContactDetails}
            />
            <ContactCard
              title="Mother Contact"
              c={student.motherContactDetails}
            />
          </div>
        </div>

        {/* Right: Misc */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="DOB" value={student.dob || "—"} />
              <Field label="Religion" value={student.religion || "—"} />
              <Field label="Category" value={student.cateogry || "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Emergency / Contact Person
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Name" value={student.contactPersonName || "—"} />
              <Field label="Phone" value={student.contactPersonPhone || "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Initials" value={student.initials || "—"} />
              <Field label="Active" value={active ? "Yes" : "No"} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
