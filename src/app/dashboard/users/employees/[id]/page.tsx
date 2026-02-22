import { getEmployee } from "@/app/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

    const { id } = await params;

  const empId = Number(id);

  const res = await getEmployee({
    empId,
    orgId: session.user.orgId,
  });

  if (!res?.status || !res?.data) {
    throw new Error(res?.message || "Failed to fetch employee");
  }

  const e = res.data;
  const brandColor = session.user.brandColor ?? undefined;


  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Back */}
      <Link
        href="/dashboard/users/employees"
        className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold capitalize">{e.firstName} {e.middleName} {e.lastName}</h1>
          <p className="text-sm text-slate-500">{e.email}</p>
        </div>

        <Link
          href={`/dashboard/users/employees/${empId}/edit`}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white"
          style={{ backgroundColor: brandColor }}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      {/* Basic Info */}
      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-3">
          <Info label="Employee ID">
            <Badge
              style={{
                backgroundColor: brandColor,
                color: "#fff",
              }}
            >
              {e.empId}
            </Badge>
          </Info>

          <Info label="Username">{e.username}</Info>
          <Info label="Role">{e.role.roleName}</Info>

          <Info label="Phone">{e.phone}</Info>
          <Info label="Secondary Phone">
            {e.secondaryPhone || "—"}
          </Info>

          <Info label="Status">
            <Badge variant="outline">
              {e.isActive ? "Active" : "Inactive"}
            </Badge>
          </Info>

          <Info label="Credentials Created">
            <Badge variant="outline">
              {e.isCredentialsCreated ? "Yes" : "No"}
            </Badge>
          </Info>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2">
          <AddressCard
            title="Permanent Address"
            address={e.permanantAddress}
          />
          <AddressCard
            title="Communication Address"
            address={e.communicationAddress}
          />
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardContent className="py-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Permissions
          </h3>
          <div className="flex flex-wrap gap-2">
            {e.permissions.map((p) => (
              <Badge key={p.id} variant="outline">
                {p.code}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

function AddressCard({
  title,
  address,
}: {
  title: string;
  address: {
    addressLine1: string;
    addressLine2: string;
    pinCode: string;
    city: string;
    state: string;
  };
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      <div className="text-sm text-slate-600">
        {address.addressLine1}
        <br />
        {address.addressLine2 && (
          <>
            {address.addressLine2}
            <br />
          </>
        )}
        {address.city}, {address.state} - {address.pinCode}
      </div>
    </div>
  );
}