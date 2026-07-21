import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/auth";

export default async function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (session) redirect("/dashboard");

    return (
        <main className="relative h-screen overflow-y-auto overflow-x-hidden
    [scrollbar-width:thin]
    [scrollbar-color:#b7b2a5_transparent]
    [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-[#b7b2a5]
    hover:[&::-webkit-scrollbar-thumb]:bg-[#8e887a]"
        >
            {children}
        </main>

    );
}
