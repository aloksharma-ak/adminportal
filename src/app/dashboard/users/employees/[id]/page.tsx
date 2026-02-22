import { getEmployee } from "@/app/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Phone, CreditCard, Shield, Home, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared-ui/page-header";
import { Avatar } from "@/components/shared-ui/avatar";
import { ErrorCard } from "@/components/shared-ui/states";

type Props = { params: Promise<{ id: string }> };

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {value || <span className="text-slate-400">—</span>}
      </span>
    </div>
  );
}

export default async function EmployeeDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const empId = Number(id);
  if (!Number.isFinite(empId) || empId <= 0) notFound();

  let emp;
  let fetchError: string | null = null;

  try {
    const res = await getEmployee({ profileId: 0, empId, orgId: session.user.orgId });
    if (!res?.status || !res?.data) {
      fetchError = res?.message || "Employee not found";
    } else {
      emp = res.data;
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load employee";
  }

  if (!fetchError && !emp) notFound();

  const brandColor = session.user.brandColor ?? undefined;
  const fullName = emp ? [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ") : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <PageHeader
        title={fullName || "Employee Details"}
        description={emp?.role?.roleName}
        backHref="/dashboard/users/employees"
        backLabel="Back to Employees"
        actions={
          emp && (
            <Link
              href={`/dashboard/users/employees/${empId}/edit`}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: brandColor ?? "#3b82f6" }}
            >
              <Pencil className="h-4 w-4" />
              Edit Employee
            </Link>
          )
        }
      />

      {fetchError && <ErrorCard message={fetchError} />}

      {emp && (
        <div className="space-y-6">
          {/* Hero card */}
          <Card className="overflow-hidden">
            <div
              className="h-24 w-full"
              style={{
                background: brandColor
                  ? `linear-gradient(135deg, ${brandColor}40, ${brandColor}15)`
                  : "linear-gradient(135deg, #3b82f620, #6366f115)",
              }}
            />
            <CardContent className="-mt-12 pb-6 px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <Avatar
                    src={emp.profilePicture}
                    firstName={emp.firstName}
                    lastName={emp.lastName}
                    initials={emp.initials}
                    size="xl"
                    brandColor={brandColor}
                    className="ring-4 ring-white dark:ring-slate-900"
                  />
                  <div className="pb-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {fullName}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-medium"
                        style={brandColor ? { borderColor: brandColor, color: brandColor } : undefined}
                      >
                        {emp.role?.roleName ?? "No Role"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={emp.isActive
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-400 bg-gray-50 text-gray-500"}
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-1">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Emp ID</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">#{emp.empId}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Contact info */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4 text-slate-400" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow label="Email" value={emp.email} />
                <InfoRow label="Username" value={emp.username} />
                <InfoRow label="Phone" value={emp.phone} />
                <InfoRow label="Secondary Phone" value={emp.secondaryPhone} />
                <InfoRow label="PAN No" value={emp.panNo} />
                <InfoRow label="Aadhar No" value={emp.aadharNo} />
                <InfoRow label="Passport No" value={emp.passportNo} />
                <InfoRow label="Initials" value={emp.initials} />
              </CardContent>
            </Card>

            {/* Status card */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4 text-slate-400" /> Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoRow label="Login Credentials" value={
                    <Badge variant="outline" className={emp.isCredentialsCreated ? "border-blue-300 bg-blue-50 text-blue-700" : ""}>
                      {emp.isCredentialsCreated ? "Created" : "Not Created"}
                    </Badge>
                  } />
                  <InfoRow label="Status" value={
                    <Badge variant="outline" className={emp.isActive ? "border-green-500 bg-green-50 text-green-700" : "border-gray-400 bg-gray-50 text-gray-500"}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </Badge>
                  } />
                </CardContent>
              </Card>

              {/* Permissions */}
              {emp.permissions?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="h-4 w-4 text-slate-400" /> Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {emp.permissions.map((p) => (
                        <Badge key={p.id} variant="outline" className="font-mono text-xs">
                          {p.code}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Home className="h-4 w-4 text-slate-400" /> Permanent Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emp.permanantAddress?.addressLine1 ? (
                  <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    <p>{emp.permanantAddress.addressLine1}</p>
                    {emp.permanantAddress.addressLine2 && <p>{emp.permanantAddress.addressLine2}</p>}
                    <p className="mt-1 text-slate-500">
                      {[emp.permanantAddress.city, emp.permanantAddress.state, emp.permanantAddress.pinCode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No address provided</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-slate-400" /> Communication Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emp.communicationAddress?.addressLine1 ? (
                  <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    <p>{emp.communicationAddress.addressLine1}</p>
                    {emp.communicationAddress.addressLine2 && <p>{emp.communicationAddress.addressLine2}</p>}
                    <p className="mt-1 text-slate-500">
                      {[emp.communicationAddress.city, emp.communicationAddress.state, emp.communicationAddress.pinCode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Same as permanent</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
