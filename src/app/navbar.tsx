"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Container } from "@/components/shared-ui/container";
import { HamburgerButton } from "@/components/shared-ui/hamburger-button";
import Image from "next/image";
import { getImagesFromSession } from "@/lib/image-session.client";
import NavProfileCard from "@/components/shared-ui/nav-profile-card";

type NavItem = { label: string; href: string };
const NAV: NavItem[] = [];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Navbar(props: {
  orgCode: string;
  brandColor: string;
  initials?: string;
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = useCallback(() => setOpen((v) => !v), []);
  const closeMenu = useCallback(() => setOpen(false), []);
  const goLogin = useCallback(() => router.push("/auth/login"), [router]);
  const doLogout = useCallback(
    async () => signOut({ callbackUrl: "/auth/login" }),
    [],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", closeMenu, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", closeMenu);
    };
  }, [open, closeMenu]);

  const normalizedOrgCode = useMemo(
    () => (props.orgCode ?? "").trim().toUpperCase(),
    [props.orgCode],
  );

  const { logoSrc, fullLogoSrc } = useMemo(
    () => getImagesFromSession(normalizedOrgCode),
    [normalizedOrgCode],
  );

  const userName = (session?.user as { userName?: string })?.userName ?? "";

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 will-change-transform"
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
    >
      <nav
        className="relative w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/90"
        style={props.brandColor ? { borderBottomColor: `${props.brandColor}40` } : undefined}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard/" aria-label={props.orgCode || "Dashboard"} className="relative inline-flex h-full items-center">
              {fullLogoSrc ? (
                <div className="relative h-16 w-52 md:w-72">
                  <Image src={fullLogoSrc} alt={props.orgCode ?? "Logo"} fill priority sizes="176px" unoptimized={fullLogoSrc.startsWith("data:image/")} className="object-contain" />
                </div>
              ) : logoSrc ? (
                <div className="relative h-10 w-10">
                  <Image src={logoSrc} alt={props.orgCode ?? "Logo"} fill priority sizes="40px" unoptimized={logoSrc.startsWith("data:image/")} className="object-contain" />
                </div>
              ) : (
                <span className="text-base font-bold uppercase tracking-wide" style={{ color: props.brandColor || undefined }}>
                  {props.orgCode || "Portal"}
                </span>
              )}
            </Link>

            {/* Desktop right */}
            <div className="hidden items-center gap-4 lg:flex">
              {isAuthed && (
                <NavProfileCard
                  initials={props.initials ?? ""}
                  profilePicture={props.profilePicture}
                  firstName={props.firstName}
                  lastName={props.lastName}
                  doLogout={doLogout}
                  username={userName}
                  brandColor={props.brandColor}
                />
              )}
              {!isAuthed && (
                <button
                  onClick={goLogin}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-3 lg:hidden">
              {isAuthed && (
                <NavProfileCard
                  initials={props.initials ?? ""}
                  profilePicture={props.profilePicture}
                  firstName={props.firstName}
                  lastName={props.lastName}
                  doLogout={doLogout}
                  username={userName}
                  brandColor={props.brandColor}
                />
              )}
              {/* <HamburgerButton
                open={open}
                onClick={toggleMenu}
                barClassName="h-[2px] w-5 origin-center rounded-full bg-gray-900 dark:bg-white"
              /> */}
            </div>
          </div>
        </Container>
      </nav>
    </motion.header>
  );
}
