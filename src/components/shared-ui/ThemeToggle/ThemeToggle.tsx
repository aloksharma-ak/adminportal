"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";

type ThemeToggleProps = {
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

export function ThemeToggle({
  ariaLabel = "Toggle theme",
  size = "md",
  className = "",
}: ThemeToggleProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const mounted = useMounted();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const sizeClass = useMemo(() => {
    switch (size) {
      case "sm":
        return "h-8 w-8";
      case "lg":
        return "h-10 w-10";
      default:
        return "h-9 w-9";
    }
  }, [size]);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/60 transition active:scale-95 hover:bg-white",
        "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
        sizeClass,
        className,
      )}
    >
      {!mounted ? null : (
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-5 w-5 text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-5 w-5 text-gray-900" />
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </button>
  );
}
