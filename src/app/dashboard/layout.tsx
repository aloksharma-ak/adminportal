import { getServerSession } from "next-auth/next";
import Navbar from "../navbar";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import { getOrganisationDetailAction } from "../utils";

function toDataUrl(base64: string, mime = "image/png") {
  if (!base64) return "";
  if (base64.startsWith("data:")) return base64;
  return `data:${mime};base64,${base64}`;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const orgCode = session?.user?.orgCode;

  const result = orgCode ? await getOrganisationDetailAction(orgCode) : null;

  const logoSrc = toDataUrl(result?.organisation?.logo ?? "", "image/png");

  const organisation = {
    orgName: result?.organisation?.orgName,
    brandColor: result?.organisation?.brandColor,
    logo: logoSrc,
  };

  return (
    <>
      <Navbar {...organisation} />
      {children}
    </>
  );
}
