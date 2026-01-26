"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Container } from "@/components/shared-ui/container";
import { HamburgerButton } from "@/components/shared-ui/hamburger-button";
import { ThemeToggle } from "@/components/shared-ui/theme-toggle";
import { RippleButton } from "@/components/ui/ripple-button";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [{ label: "Home", href: "/" }];

const SHADOW_AT = 8;
const HIDE_SHOW_DELTA = 20;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function MobileMenu({
  open,
  pathname,
  nav,
  onLogin,
  panelRef,
}: {
  open: boolean;
  pathname: string;
  nav: NavItem[];
  onLogin: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 right-0 top-full z-50 lg:hidden"
        >
          <div
            ref={panelRef}
            className={`border-t border-gray-200 bg-sky-50/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85`}
          >
            <Container>
              <div className="pb-4">
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

                <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-white/10">
                  <RippleButton
                    type="button"
                    onClick={onLogin}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-slate-900 dark:hover:bg-blue-400"
                  >
                    Login
                  </RippleButton>
                </div>
              </div>
            </Container>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  // --- refs to avoid stale state inside scroll handler
  const openRef = useRef(open);
  const scrolledRef = useRef(scrolled);
  const navVisibleRef = useRef(navVisible);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const barCommon = useMemo(
    () => "h-[2px] w-6 origin-center rounded-full bg-gray-900 dark:bg-white",
    [],
  );

  const toggleMenu = useCallback(() => setOpen((v) => !v), []);
  const closeMenu = useCallback(() => setOpen(false), []);

  const goLogin = useCallback(() => {
    router.push("/signup");
  }, [router]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    scrolledRef.current = scrolled;
  }, [scrolled]);

  useEffect(() => {
    navVisibleRef.current = navVisible;
  }, [navVisible]);

  // close menu on route change
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  //Scroll logic (single rAF-throttled listener)
  useEffect(() => {
    let rafId = 0;
    const lastYRef = { current: window.scrollY };
    const accRef = { current: 0 };

    const applyState = (next: {
      scrolled?: boolean;
      navVisible?: boolean;
      closeMenu?: boolean;
    }) => {
      if (
        typeof next.scrolled === "boolean" &&
        next.scrolled !== scrolledRef.current
      ) {
        scrolledRef.current = next.scrolled;
        setScrolled(next.scrolled);
      }

      if (
        typeof next.navVisible === "boolean" &&
        next.navVisible !== navVisibleRef.current
      ) {
        navVisibleRef.current = next.navVisible;
        setNavVisible(next.navVisible);
      }

      if (next.closeMenu && openRef.current) {
        openRef.current = false;
        setOpen(false);
      }
    };

    const onScroll = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = 0;

        const y = window.scrollY;

        // shadow state
        const nextScrolled = y > SHADOW_AT;

        // close mobile menu when user scrolls (only if it was open)
        const shouldCloseMenu = nextScrolled && openRef.current;

        // hide/show navbar by direction with 20px threshold
        const dy = y - lastYRef.current;

        if (dy !== 0) {
          const sameDir = Math.sign(dy) === Math.sign(accRef.current || dy);
          accRef.current = sameDir ? accRef.current + dy : dy;
        }

        let nextVisible = navVisibleRef.current;

        if (y <= 10) {
          nextVisible = true; // always show near top
          accRef.current = 0;
        } else {
          if (accRef.current >= HIDE_SHOW_DELTA) {
            nextVisible = false;
            accRef.current = 0;
          } else if (accRef.current <= -HIDE_SHOW_DELTA) {
            nextVisible = true;
            accRef.current = 0;
          }
        }

        applyState({
          scrolled: nextScrolled,
          navVisible: nextVisible,
          closeMenu: shouldCloseMenu,
        });

        lastYRef.current = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Outside click + ESC
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = panelRef.current;
      if (!el) return;

      if (!el.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeMenu]);

  return (
    <motion.header
      className="sticky inset-x-0 top-0 z-50 will-change-transform"
      animate={navVisible ? { y: 0 } : { y: "-110%" }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
    >
      <nav
        className={`relative w-full bg-sky-50/80 backdrop-blur-xl transition-all duration-300 dark:bg-slate-950/60
        ${
          scrolled
            ? "shadow-[0_6px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
            : "shadow-none"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              aria-label="CuetPlus Portal"
              className="relative inline-flex h-14 w-30 md:h-16 md:w-40 lg:h-20 lg:w-50"
            >
              <span className="absolute top-1/2 -translate-y-1/2 transform text-3xl font-bold text-blue-600">
                CuetPlus
              </span>
            </Link>

            {/* Desktop */}
            <div className="hidden items-center gap-3 lg:flex">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`
                          group relative rounded-lg px-3 py-2 text-base
                          ${
                            active
                              ? "font-semibold text-blue-700 dark:text-blue-400"
                              : "font-medium text-gray-700 dark:text-gray-200"
                          }
                        `}
                      >
                        <span className="relative z-10 transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                          {item.label}
                        </span>

                        <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-blue-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />

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

              <div className="ml-2 flex items-center gap-2 border-l border-gray-200 pl-3 dark:border-white/10">
                <ThemeToggle size="lg" />
                <RippleButton
                  type="button"
                  onClick={goLogin}
                  rippleColor="#ADD8E6"
                >
                  Login
                </RippleButton>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <HamburgerButton
                open={open}
                onClick={toggleMenu}
                barClassName={barCommon}
              />
            </div>
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            open={open}
            pathname={pathname}
            nav={NAV}
            onLogin={goLogin}
            panelRef={panelRef}
          />
        </Container>
      </nav>
    </motion.header>
  );
}
