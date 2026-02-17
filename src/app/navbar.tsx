"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { signOut, useSession } from "next-auth/react";

import { Container } from "@/components/shared-ui/container";
import { HamburgerButton } from "@/components/shared-ui/hamburger-button";
import { ActionButton, LinkButton } from "@/components/controls/Buttons";
import Image from "next/image";
import { getImagesFromSession } from "@/lib/image-session.client";
import NavProfileCard from "@/components/shared-ui/nav-profile-card";

type NavItem = { label: string; href: string };

type AppUser = {
  userName?: string;
};

// Add nav items here as the app grows
const NAV: NavItem[] = [];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function MobileMenu({
  open,
  pathname,
  nav,
  isAuthed,
  userInitial,
  userName,
  onLogin,
  onLogout,
  panelRef,
}: {
  open: boolean;
  pathname: string;
  nav: NavItem[];
  isAuthed: boolean;
  userInitial: string;
  userName: string;
  onLogin: () => void;
  onLogout: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 right-0 top-full z-50 lg:hidden"
        >
          <div
            ref={panelRef}
            className="border-t border-gray-200 bg-sky-50/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85"
          >
            <Container>
              <div className="pb-4">
                {nav.length > 0 && (
                  <ul className="flex flex-col gap-1 pt-2">
                    {nav.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={
                              active
                                ? "flex items-center justify-between rounded-xl bg-blue-900/5 px-4 py-3 text-base font-semibold text-blue-900 dark:bg-white/10 dark:text-white"
                                : "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition hover:bg-blue-900/5 hover:text-blue-900 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
                            }
                          >
                            <motion.span
                              initial={false}
                              whileHover={{ x: 2 }}
                              transition={{ duration: 0.15 }}
                            >
                              {item.label}
                            </motion.span>
                            <span
                              className={
                                active
                                  ? "h-2 w-2 rounded-full bg-blue-900 dark:bg-white"
                                  : "h-2 w-2 rounded-full bg-blue-900/30 dark:bg-white/30"
                              }
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-white/10">
                  {!isAuthed ? (
                    <ActionButton
                      type="button"
                      onClick={onLogin}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Login
                    </ActionButton>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {userName}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300">
                            Signed in
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <LinkButton
                          href="/dashboard/"
                          variant="ghost"
                          color="blue"
                          className="rounded-lg px-3 py-2 text-sm"
                        >
                          Dashboard
                        </LinkButton>
                        <ActionButton
                          type="button"
                          onClick={onLogout}
                          variant="ghost"
                          color="rose"
                          className="rounded-lg px-3 py-2 text-sm"
                        >
                          Logout
                        </ActionButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Container>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar(props: {
  orgCode: string;
  brandColor: string;
  initials?: string;
  profilePicture?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const user = session?.user as AppUser;

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = useCallback(() => setOpen((v) => !v), []);
  const closeMenu = useCallback(() => setOpen(false), []);

  const goLogin = useCallback(() => router.push("/auth/login"), [router]);
  const doLogout = useCallback(
    async () => signOut({ callbackUrl: "/auth/login" }),
    [],
  );

  // Close menu on route change
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Close menu on outside click / Escape / scroll
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) closeMenu();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const onScroll = () => closeMenu();

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
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

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 will-change-transform"
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
    >
      <nav
        className="relative w-full backdrop-blur-xl transition-all duration-300 bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/60 dark:border-white/10"
        style={
          props.brandColor
            ? { borderBottomColor: `${props.brandColor}30` }
            : undefined
        }
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* Logo / org name */}
            <Link
              href="/dashboard/"
              aria-label={props.orgCode || "Dashboard"}
              className="relative inline-flex h-14 items-center md:h-16"
            >
              {fullLogoSrc ? (
                <div className="relative h-full w-44 md:w-56 lg:w-64">
                  <Image
                    src={fullLogoSrc}
                    alt={props.orgCode ?? "Organisation Logo"}
                    fill
                    priority
                    sizes="(max-width: 768px) 176px, (max-width: 1024px) 224px, 256px"
                    unoptimized={fullLogoSrc.startsWith("data:image/")}
                    className="object-contain"
                  />
                </div>
              ) : logoSrc ? (
                <div className="relative aspect-square h-full max-h-12 md:max-h-14 lg:max-h-16">
                  <Image
                    src={logoSrc}
                    alt={props.orgCode ?? "Organisation Logo"}
                    fill
                    priority
                    sizes="(max-width: 768px) 48px, 56px"
                    unoptimized={logoSrc.startsWith("data:image/")}
                    className="object-contain"
                  />
                </div>
              ) : (
                <span
                  className="text-base font-bold uppercase tracking-wide"
                  style={{ color: props.brandColor || undefined }}
                >
                  {props.orgCode || "Portal"}
                </span>
              )}
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-3 lg:flex">
              {NAV.length > 0 && (
                <ul className="flex items-center gap-1">
                  {NAV.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`group relative rounded-lg px-3 py-2 text-base ${
                            active
                              ? "font-semibold text-blue-700 dark:text-blue-400"
                              : "font-medium text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          <span className="relative z-10 transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                            {item.label}
                          </span>
                          {active && (
                            <motion.span
                              layoutId="nav-underline"
                              className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="ml-2 flex items-center gap-2 border-l border-gray-200 pl-3 dark:border-white/10">
                {!isAuthed ? (
                  <ActionButton type="button" onClick={goLogin}>
                    Login
                  </ActionButton>
                ) : (
                  <NavProfileCard
                    initials={props.initials ?? ""}
                    profilePicture={props.profilePicture ?? ""}
                    doLogout={doLogout}
                    username={user?.userName ?? ""}
                  />
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <HamburgerButton
                open={open}
                onClick={toggleMenu}
                barClassName="h-[2px] w-6 origin-center rounded-full bg-gray-900 dark:bg-white"
              />
            </div>
          </div>

          <MobileMenu
            open={open}
            pathname={pathname}
            nav={NAV}
            isAuthed={isAuthed}
            userInitial={props.initials ?? ""}
            userName={user?.userName ?? ""}
            onLogin={goLogin}
            onLogout={doLogout}
            panelRef={panelRef}
          />
        </Container>
      </nav>
    </motion.header>
  );
}
