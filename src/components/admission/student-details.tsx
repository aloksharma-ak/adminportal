"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

type EnrolledClass =
  | string
  | {
      classText?: string;
      classId?: number;
      class?: number;
      section?: string;
      classTeacherId?: number;
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

  // keeping old key + optional corrected key for compatibility
  permanantAddress?: Address | null;
  permanentAddress?: Address | null;

  isCommunicationAddressSameAsPermanant?: boolean;
  communicationAddress?: Address | null;

  orgId?: number;
  enrolledClass?: EnrolledClass | null;

  previousSchoolName?: string | null;
  previousSchoolAddress?: string | null;

  fatherContactDetails?: Contact | null;
  motherContactDetails?: Contact | null;

  isActive?: boolean;

  dob?: string | null;
  religion?: string | null;

  // keeping typo key + corrected key compatibility
  cateogry?: string | null;
  category?: string | null;

  contactPersonName?: string | null;
  contactPersonPhone?: string | null;
};

function cn(...c: (string | undefined | false)[]) {
  return c.filter(Boolean).join(" ");
}

function clean(v?: string | null) {
  const t = (v ?? "").trim();
  return t.length ? t : undefined;
}

function isEmptyValue(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function formatDob(d?: string | null) {
  if (!d) return undefined;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d; // fallback raw string
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}

function getEnrolledClassText(v?: EnrolledClass | null) {
  if (!v) return undefined;
  if (typeof v === "string") return clean(v);
  return clean(v.classText) || undefined;
}

async function copyToClipboard(text?: string | null) {
  const value = clean(text);
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // fallback for restricted clipboard environments
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">
        {isEmptyValue(value) ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          value
        )}
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
  const line1 = clean(address?.addressLine1);
  const line2 = clean(address?.addressLine2);
  const city = clean(address?.city);
  const state = clean(address?.state);
  const pin = clean(address?.pinCode);

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
        <Field label="Name" value={clean(c?.name)} />
        <Field label="Phone" value={clean(c?.phone)} />
        <Field label="Secondary Phone" value={clean(c?.secondaryPhone)} />
        <Field label="Email" value={clean(c?.email)} />
        <Field label="Aadhar No" value={clean(c?.aadharNo)} />
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
    .map((x) => clean(x))
    .filter(Boolean)
    .join(" ");

  const active = Boolean(student.isActive);

  const statusClass = active
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-600";

  const avatarInitials =
    clean(student.initials) ||
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") ||
    "ST";

  const permanentAddress = student.permanantAddress ?? student.permanentAddress;
  const classText = getEnrolledClassText(student.enrolledClass);
  const category = clean(student.cateogry) || clean(student.category);
  const dob = formatDob(student.dob);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Hero Card */}
      <div className="rounded-xl border bg-linear-to-br from-blue-50 via-background to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
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
            {clean(student.phone) ? (
              <Button
                variant="outline"
                onClick={() => copyToClipboard(student.phone)}
              >
                Copy Phone
              </Button>
            ) : null}
            {clean(student.email) ? (
              <Button
                variant="outline"
                onClick={() => copyToClipboard(student.email)}
              >
                Copy Email
              </Button>
            ) : null}
            {clean(student.aadharNo) ? (
              <Button
                variant="outline"
                onClick={() => copyToClipboard(student.aadharNo)}
              >
                Copy Aadhar
              </Button>
            ) : null}
          </div>
        </div>

        <Separator className="my-5" />

        {/* Quick Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <Field label="Phone" value={clean(student.phone)} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Field
                  label="Secondary Phone"
                  value={clean(student.secondaryPhone)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Field label="Email" value={clean(student.email)} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Field label="Aadhar No" value={clean(student.aadharNo)} />
              </CardContent>
            </Card>
          </div>
          <div>
            {/* <Image src={profilePicture} alt="" width={100} height={100} /> */}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Address */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AddressBlock
              title="Permanent Address"
              address={permanentAddress}
            />

            <AddressBlock
              title={
                student.isCommunicationAddressSameAsPermanant
                  ? "Communication Address (Same as Permanent)"
                  : "Communication Address"
              }
              address={
                student.isCommunicationAddressSameAsPermanant
                  ? permanentAddress
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
                value={clean(student.previousSchoolName)}
              />
              <Field
                label="School Address"
                value={clean(student.previousSchoolAddress)}
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
              <Field label="DOB" value={dob} />
              <Field label="Religion" value={clean(student.religion)} />
              <Field label="Category" value={category} />
              <Field label="Class" value={classText} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Emergency / Contact Person
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Name" value={clean(student.contactPersonName)} />
              <Field label="Phone" value={clean(student.contactPersonPhone)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
