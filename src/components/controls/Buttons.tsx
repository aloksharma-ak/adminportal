"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ConfirmDialog } from "./ConfirmDialog";

type BaseButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type ActionVariant = NonNullable<BaseButtonProps["variant"]>;
type PresetActionColor = "blue" | "emerald" | "rose" | "slate" | "transparent";
type ActionColor = PresetActionColor | (string & {});

type ConfirmConfig = {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
};

export interface ButtonProps extends Omit<
  BaseButtonProps,
  "onClick" | "color"
> {
  children: React.ReactNode;

  // link support
  href?: string;

  // action support
  onClick?: () => void | Promise<void>;

  loading?: boolean;
  disabledReason?: React.ReactNode;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  confirm?: boolean | ConfirmConfig;

  // ✅ preset or custom
  color?: ActionColor;

  // link attrs
  target?: string;
  rel?: string;

  prefetch?: boolean;
  replace?: boolean;
}

type Thenable<T = unknown> = {
  then: (onfulfilled?: (value: T) => unknown) => unknown;
};

function isThenable<T = unknown>(val: unknown): val is Thenable<T> {
  return (
    typeof val === "object" &&
    val !== null &&
    "then" in val &&
    typeof (val as { then?: unknown }).then === "function"
  );
}

const colorClasses: Record<
  PresetActionColor,
  Partial<Record<ActionVariant, string>>
> = {
  blue: {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
    secondary:
      "bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900",
    outline:
      "border border-blue-200 text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-400 dark:border-blue-800 dark:text-blue-200 dark:hover:bg-blue-950",
    ghost:
      "text-blue-700 hover:bg-blue-50 dark:text-blue-200 dark:hover:bg-blue-950",
    link: "text-blue-700 underline-offset-4 hover:underline dark:text-blue-200",
  },
  emerald: {
    default:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600",
    secondary:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900",
    outline:
      "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-400 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-950",
    ghost:
      "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-950",
    link: "text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-200",
  },
  rose: {
    default:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600",
    secondary:
      "bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-400 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900",
    outline:
      "border border-rose-200 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-400 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-950",
    ghost:
      "text-rose-700 hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-950",
    link: "text-rose-700 underline-offset-4 hover:underline dark:text-rose-200",
  },
  slate: {
    default:
      "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800",
    outline:
      "border border-slate-300 text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-900",
    ghost:
      "text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-900",
    link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
  },
  transparent: {
    default:
      "bg-transparent text-inherit hover:bg-black/5 focus-visible:ring-slate-400 dark:hover:bg-white/5",
    secondary:
      "bg-transparent text-inherit hover:bg-black/5 focus-visible:ring-slate-400 dark:hover:bg-white/5",
    outline:
      "border border-transparent text-inherit hover:bg-black/5 focus-visible:ring-slate-400 dark:hover:bg-white/5",
    ghost: "bg-transparent text-inherit hover:bg-black/5 dark:hover:bg-white/5",
    link: "bg-transparent text-inherit underline-offset-4 hover:underline",
  },
};

const presetColorSet = new Set(Object.keys(colorClasses));

function isPresetColor(color: string): color is PresetActionColor {
  return presetColorSet.has(color);
}

function getDynamicColorClass(safeVariant: ActionVariant) {
  const base =
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--action-color] hover:brightness-95";

  if (safeVariant === "outline")
    return cn(base, "border hover:bg-black/5 dark:hover:bg-white/5");
  if (safeVariant === "secondary") return cn(base, "hover:brightness-95");
  if (safeVariant === "ghost")
    return cn(base, "hover:bg-black/5 dark:hover:bg-white/5");
  if (safeVariant === "link")
    return cn("underline-offset-4 hover:underline", base);

  return base; // default
}

function getDynamicStyle(
  customColor: string,
  safeVariant: ActionVariant,
  incomingStyle?: React.CSSProperties,
): React.CSSProperties {
  const style: React.CSSProperties & Record<"--action-color", string> = {
    ...(incomingStyle ?? {}),
    "--action-color": customColor,
  };

  switch (safeVariant) {
    case "outline":
      style.borderColor = customColor;
      style.color = customColor;
      style.backgroundColor = "transparent";
      break;

    case "secondary":
      style.backgroundColor = `color-mix(in srgb, ${customColor} 12%, transparent)`;
      style.color = customColor;
      break;

    case "ghost":
    case "link":
      style.color = customColor;
      break;

    case "default":
    default:
      style.backgroundColor = customColor;
      style.color = "#fff";
      break;
  }

  return style;
}

export function ActionButton({
  children,
  onClick,

  loading = false,
  disabled,
  disabledReason,

  leftIcon,
  rightIcon,

  confirm,

  color = "blue",
  variant = "default",

  className,
  ...rest
}: ButtonProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const isBusy = loading || internalLoading;
  const isDisabled = !!disabled || isBusy;

  const confirmCfg: ConfirmConfig | null = React.useMemo(() => {
    if (!confirm) return null;
    return confirm === true ? {} : confirm;
  }, [confirm]);

  const safeVariant = (variant ?? "default") as ActionVariant;

  const customColor =
    typeof color === "string" && !isPresetColor(color) ? color : null;

  const colorClass = React.useMemo(() => {
    if (safeVariant === "destructive") return "";

    if (!customColor) {
      const preset = color as PresetActionColor;
      return (
        colorClasses[preset]?.[safeVariant] ??
        colorClasses[preset]?.default ??
        ""
      );
    }

    return getDynamicColorClass(safeVariant);
  }, [color, customColor, safeVariant]);

  const computedStyle = React.useMemo(() => {
    if (!customColor) return rest.style;
    return getDynamicStyle(customColor, safeVariant, rest.style);
  }, [customColor, safeVariant, rest.style]);

  const runAction = React.useCallback(async () => {
    if (!onClick || isDisabled) return;

    const res = onClick();
    try {
      if (isThenable(res)) {
        setInternalLoading(true);
        await res;
      }
    } finally {
      setInternalLoading(false);
    }
  }, [onClick, isDisabled]);

  const handleClick = React.useCallback(async () => {
    if (!onClick || isDisabled) return;

    if (confirmCfg) {
      setConfirmOpen(true);
      return;
    }

    await runAction();
  }, [onClick, isDisabled, confirmCfg, runAction]);

  const btn = (
    <Button
      {...rest}
      variant={variant}
      disabled={isDisabled}
      aria-busy={isBusy}
      onClick={handleClick}
      style={computedStyle}
      className={cn("inline-flex items-center gap-2", colorClass, className)}
    >
      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      <span className={cn(isBusy && "opacity-90")}>{children}</span>
      {!isBusy && rightIcon ? rightIcon : null}
    </Button>
  );

  const withTooltip =
    isDisabled && disabledReason ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{btn}</span>
          </TooltipTrigger>
          <TooltipContent>{disabledReason}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      btn
    );

  if (!confirmCfg) return withTooltip;

  const title = confirmCfg.title ?? "Are you sure?";
  const description =
    confirmCfg.description ??
    "This action cannot be undone. Please confirm to continue.";
  const confirmText = confirmCfg.confirmText ?? "Confirm";
  const cancelText = confirmCfg.cancelText ?? "Cancel";

  return (
    <>
      {withTooltip}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={async () => {
          setConfirmOpen(false);
          await runAction();
        }}
      />
    </>
  );
}

export function LinkButton({
  children,
  href = "/",

  loading = false,
  disabled = false,
  disabledReason,

  leftIcon,
  rightIcon,

  confirm,

  color = "blue",
  variant = "default",

  prefetch,
  replace,

  target,
  rel,

  className,
  ...rest
}: ButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const isBusy = loading;
  const isDisabled = disabled || isBusy;

  const confirmCfg: ConfirmConfig | null = React.useMemo(() => {
    if (!confirm) return null;
    return confirm === true ? {} : confirm;
  }, [confirm]);

  const safeVariant = (variant ?? "default") as ActionVariant;

  const customColor =
    typeof color === "string" && !isPresetColor(color) ? color : null;

  const colorClass = React.useMemo(() => {
    if (safeVariant === "destructive") return "";

    if (!customColor) {
      const preset = color as PresetActionColor;
      return (
        colorClasses[preset]?.[safeVariant] ??
        colorClasses[preset]?.default ??
        ""
      );
    }

    return getDynamicColorClass(safeVariant);
  }, [color, customColor, safeVariant]);

  const computedStyle = React.useMemo(() => {
    if (!customColor) return rest.style;
    return getDynamicStyle(customColor, safeVariant, rest.style);
  }, [customColor, safeVariant, rest.style]);

  const navigate = React.useCallback(() => {
    const isExternal =
      /^https?:\/\//.test(href) ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");

    if (isExternal || target) {
      window.open(href, target ?? "_self");
      return;
    }

    if (replace) router.replace(href);
    else router.push(href);
  }, [href, replace, router, target]);

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (confirmCfg) {
      e.preventDefault();
      e.stopPropagation();
      setConfirmOpen(true);
    }
  };

  const linkNode = (
    <Button
      {...rest}
      variant={safeVariant}
      disabled={isDisabled}
      aria-busy={isBusy}
      style={computedStyle}
      className={cn("inline-flex items-center gap-2", colorClass, className)}
      asChild
    >
      <Link
        href={href}
        prefetch={prefetch}
        replace={replace}
        onClick={onLinkClick}
        target={target}
        rel={rel}
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        <span className={cn(isBusy && "opacity-90")}>{children}</span>
        {!isBusy && rightIcon ? rightIcon : null}
      </Link>
    </Button>
  );

  const withTooltip =
    isDisabled && disabledReason ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{linkNode}</span>
          </TooltipTrigger>
          <TooltipContent>{disabledReason}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      linkNode
    );

  if (!confirmCfg) return withTooltip;

  const title = confirmCfg.title ?? "Are you sure?";
  const description = confirmCfg.description ?? "Please confirm to continue.";
  const confirmText = confirmCfg.confirmText ?? "Confirm";
  const cancelText = confirmCfg.cancelText ?? "Cancel";

  return (
    <>
      {withTooltip}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={title}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={async () => {
          setConfirmOpen(false);
          navigate();
        }}
      />
    </>
  );
}
