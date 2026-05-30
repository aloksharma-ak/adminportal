import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployee } from "@/app/dashboard/users/actions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/shared-ui/Avatar";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import { Mail, CreditCard, Shield, Home, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
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

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) redirect("/auth/login");

  let profile;
  let fetchError: string | null = null;
  try {
    const res = await getEmployee({
      profileId: session.user.profileId,
      empId: 0,
      orgId: session.user.orgId,
      userId: 0,
    });
    if (!res?.status || !res?.data) {
      fetchError = res?.message ?? "Employee record not found";
    } else {
      profile = res.data;
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load profile";
  }

  const brandColor = session.user.brandColor ?? undefined;
  const fullName = profile
    ? [profile.firstName, profile.middleName, profile.lastName]
        .filter(Boolean)
        .join(" ")
    : (session.user.userName ?? "My Profile");

  return (
    <Container className="max-w-5xl py-6">
      <PageHeader
        title="My Profile"
        description="Your personal account information"
        backLabel="Back to Dashboard"
        actions={
          profile && (
            <Link
              href={`/dashboard/users/employees/${profile.empId}/edit`}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: brandColor ?? "#3b82f6" }}
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Link>
          )
        }
      />

      {fetchError && <ErrorCard message={fetchError} />}

      {profile && (
        <div className="space-y-6">
          {/* Hero banner */}
          <Card className="overflow-hidden pt-0">
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
                    src={profile.profilePicture}
                    firstName={profile.firstName}
                    lastName={profile.lastName}
                    initials={profile.initials}
                    size="xl"
                    brandColor={brandColor}
                    className="ring-4 ring-white dark:ring-slate-900"
                  />
                  <div className="pb-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {fullName}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {profile.role?.roleName && (
                        <Badge
                          variant="outline"
                          className="font-medium"
                          style={
                            brandColor
                              ? { borderColor: brandColor, color: brandColor }
                              : undefined
                          }
                        >
                          {profile.role.roleName}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          profile.isActive
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-400 bg-gray-50 text-gray-500"
                        }
                      >
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="pb-1">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Employee ID</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      #{profile.empId}
                    </p>
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
                  <Mail className="h-4 w-4 text-slate-400" /> Contact
                  Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Email" value={profile.email} />
                <Field label="Username" value={profile.username} />
                <Field label="Phone" value={profile.phone} />
                <Field label="Secondary Phone" value={profile.secondaryPhone} />
                <Field label="PAN No" value={profile.panNo} />
                <Field label="Aadhar No" value={profile.aadharNo} />
                <Field label="Passport No" value={profile.passportNo} />
                <Field label="Initials" value={profile.initials} />
              </CardContent>
            </Card>

            {/* Status + Permissions */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4 text-slate-400" /> Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field
                    label="Login Credentials"
                    value={
                      <Badge
                        variant="outline"
                        className={
                          profile.isCredentialsCreated
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "text-slate-500"
                        }
                      >
                        {profile.isCredentialsCreated
                          ? "Active"
                          : "Not Created"}
                      </Badge>
                    }
                  />
                  <Field
                    label="Status"
                    value={
                      <Badge
                        variant="outline"
                        className={
                          profile.isActive
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-400 bg-gray-50 text-gray-500"
                        }
                      >
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    }
                  />
                </CardContent>
              </Card>

              {profile.permissions?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="h-4 w-4 text-slate-400" />{" "}
                      Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.permissions.map((p) => (
                        <Badge
                          key={p.id}
                          variant="outline"
                          className="font-mono text-xs"
                        >
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
                {profile.permanantAddress?.addressLine1 ? (
                  <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <p>{profile.permanantAddress.addressLine1}</p>
                    {profile.permanantAddress.addressLine2 && (
                      <p>{profile.permanantAddress.addressLine2}</p>
                    )}
                    <p className="text-slate-500">
                      {[
                        profile.permanantAddress.city,
                        profile.permanantAddress.state,
                        profile.permanantAddress.pinCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
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
                  <MapPin className="h-4 w-4 text-slate-400" /> Communication
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.communicationAddress?.addressLine1 ? (
                  <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    <p>{profile.communicationAddress.addressLine1}</p>
                    {profile.communicationAddress.addressLine2 && (
                      <p>{profile.communicationAddress.addressLine2}</p>
                    )}
                    <p className="text-slate-500">
                      {[
                        profile.communicationAddress.city,
                        profile.communicationAddress.state,
                        profile.communicationAddress.pinCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
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
    </Container>
  );
}
