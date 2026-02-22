"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared-ui/avatar";
import { Phone, Mail, Shield, GraduationCap, Users, Home, MapPin } from "lucide-react";

type Address = { addressLine1?: string; addressLine2?: string; pinCode?: string; city?: string; state?: string };
type Contact = { name?: string; phone?: string; secondaryPhone?: string; aadharNo?: string; email?: string };
type EnrolledClass = string | { classText?: string; classId?: number; section?: string };

export type StudentDetail = {
  studentId?: number;
  firstName?: string; middleName?: string; lastName?: string; initials?: string;
  phone?: string; secondaryPhone?: string; aadharNo?: string; email?: string;
  profilePicture?: string | null;
  permanantAddress?: Address | null; permanentAddress?: Address | null;
  isCommunicationAddressSameAsPermanant?: boolean;
  communicationAddress?: Address | null;
  orgId?: number;
  enrolledClass?: EnrolledClass | null;
  previousSchoolName?: string | null; previousSchoolAddress?: string | null;
  fatherContactDetails?: Contact | null; motherContactDetails?: Contact | null;
  isActive?: boolean;
  dob?: string | null; religion?: string | null;
  cateogry?: string | null; category?: string | null;
  contactPersonName?: string | null; contactPersonPhone?: string | null;
};

function clean(v?: string | null) {
  const t = (v ?? "").trim();
  return t.length ? t : undefined;
}

function formatDob(d?: string | null) {
  if (!d) return undefined;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(dt);
}

function getClassText(v?: EnrolledClass | null) {
  if (!v) return undefined;
  if (typeof v === "string") return clean(v);
  return clean(v.classText);
}

async function copyText(text?: string | null) {
  const v = clean(text);
  if (!v) return;
  await navigator.clipboard.writeText(v).catch(() => {});
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {value ?? <span className="text-slate-400">—</span>}
      </p>
    </div>
  );
}

function AddressBlock({ title, address }: { title: string; address?: Address | null }) {
  const line1 = clean(address?.addressLine1);
  if (!line1) return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-slate-400">No address provided</p></CardContent>
    </Card>
  );
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-slate-700 dark:text-slate-300">{line1}</p>
        {clean(address?.addressLine2) && <p className="text-sm text-slate-700 dark:text-slate-300">{clean(address?.addressLine2)}</p>}
        <p className="mt-1 text-sm text-slate-500">
          {[clean(address?.city), clean(address?.state), clean(address?.pinCode)].filter(Boolean).join(" • ")}
        </p>
      </CardContent>
    </Card>
  );
}

function ContactCard({ title, c }: { title: string; c?: Contact | null }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-slate-400" />{title}</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Field label="Name" value={clean(c?.name)} />
        <Field label="Phone" value={clean(c?.phone)} />
        <Field label="Secondary Phone" value={clean(c?.secondaryPhone)} />
        <Field label="Email" value={clean(c?.email)} />
        <Field label="Aadhar" value={clean(c?.aadharNo)} />
      </CardContent>
    </Card>
  );
}

export default function StudentDetails({ student, brandColor }: { student: StudentDetail; brandColor?: string }) {
  const fullName = [student.firstName, student.middleName, student.lastName]
    .map(clean).filter(Boolean).join(" ");
  const active = Boolean(student.isActive);
  const permanentAddr = student.permanantAddress ?? student.permanentAddress;
  const classText = getClassText(student.enrolledClass);
  const category = clean(student.cateogry) || clean(student.category);
  const dob = formatDob(student.dob);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden">
        <div
          className="h-24"
          style={{ background: brandColor ? `linear-gradient(135deg, ${brandColor}40, ${brandColor}15)` : "linear-gradient(135deg, #10b98120, #3b82f615)" }}
        />
        <CardContent className="-mt-12 px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                src={student.profilePicture}
                firstName={student.firstName}
                lastName={student.lastName}
                initials={student.initials}
                size="xl"
                brandColor={brandColor}
                className="ring-4 ring-white dark:ring-slate-900"
              />
              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {fullName || "Student"}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={active ? "border-green-500 bg-green-50 text-green-700" : "border-gray-400 bg-gray-50 text-gray-500"}>
                    {active ? "Active" : "Inactive"}
                  </Badge>
                  {classText && (
                    <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                      <GraduationCap className="mr-1 h-3 w-3" />{classText}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              {clean(student.phone) && (
                <Button variant="outline" size="sm" onClick={() => copyText(student.phone)}>
                  <Phone className="mr-1.5 h-3.5 w-3.5" />Copy Phone
                </Button>
              )}
              {clean(student.email) && (
                <Button variant="outline" size="sm" onClick={() => copyText(student.email)}>
                  <Mail className="mr-1.5 h-3.5 w-3.5" />Copy Email
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left col */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4 text-slate-400" />Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-5">
              <Field label="Phone" value={clean(student.phone)} />
              <Field label="Secondary Phone" value={clean(student.secondaryPhone)} />
              <Field label="Email" value={clean(student.email)} />
              <Field label="Aadhar No" value={clean(student.aadharNo)} />
              <Field label="Date of Birth" value={dob} />
              <Field label="Initials" value={clean(student.initials)} />
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AddressBlock title="Permanent Address" address={permanentAddr} />
            <AddressBlock
              title={student.isCommunicationAddressSameAsPermanant ? "Communication (Same)" : "Communication Address"}
              address={student.isCommunicationAddressSameAsPermanant ? permanentAddr : student.communicationAddress}
            />
          </div>

          {/* Previous school */}
          {(clean(student.previousSchoolName) || clean(student.previousSchoolAddress)) && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Previous School</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Field label="School Name" value={clean(student.previousSchoolName)} />
                <Field label="School Address" value={clean(student.previousSchoolAddress)} />
              </CardContent>
            </Card>
          )}

          {/* Parents */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ContactCard title="Father Contact" c={student.fatherContactDetails} />
            <ContactCard title="Mother Contact" c={student.motherContactDetails} />
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-slate-400" />Additional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Religion" value={clean(student.religion)} />
              <Field label="Category" value={category} />
              <Field label="Enrolled Class" value={classText} />
              <Field label="Student ID" value={student.studentId ? `#${student.studentId}` : undefined} />
            </CardContent>
          </Card>

          {(clean(student.contactPersonName) || clean(student.contactPersonPhone)) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Name" value={clean(student.contactPersonName)} />
                <Field label="Phone" value={clean(student.contactPersonPhone)} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
