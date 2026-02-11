import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployee } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = await getEmployee({
    profileId: session.user.profileId,
    orgId: session.user.orgId,
  });

  return <div>{user}</div>;
}
