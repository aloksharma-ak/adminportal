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
        <main className="relative h-screen overflow-y-auto overflow-x-hidden bg-slate-950 text-white
    [scrollbar-width:thin]
    [scrollbar-color:rgba(168,85,247,0.6)_transparent]
    [&::-webkit-scrollbar]:w-1
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-[linear-gradient(to_bottom,rgba(34,211,238,0.6),rgba(168,85,247,0.6))]
    hover:[&::-webkit-scrollbar-thumb]:bg-[linear-gradient(to_bottom,rgba(34,211,238,0.9),rgba(168,85,247,0.9))]"
        >
            {children}
        </main>

    );
}