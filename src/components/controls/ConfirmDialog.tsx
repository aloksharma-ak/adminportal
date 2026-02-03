"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type ConfirmDialogTexts = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
};

export type ConfirmDialogProps = ConfirmDialogTexts & {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onConfirm: () => void | Promise<void>;

  onCancel?: () => void;

  loading?: boolean;

  confirmDisabled?: boolean;

  destructive?: boolean;

  contentClassName?: string;
  confirmClassName?: string;
  cancelClassName?: string;
};

type Thenable<T = unknown> = {
  then: (onfulfilled?: (value: T) => unknown) => unknown;
};

function isThenable(value: unknown): value is Thenable {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,

  title = "Are you sure?",
  description = "This action cannot be undone. Please confirm to continue.",
  confirmText = "Confirm",
  cancelText = "Cancel",

  loading = false,
  confirmDisabled = false,
  destructive = false,

  contentClassName,
  confirmClassName,
  cancelClassName,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isBusy = loading || internalLoading;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) onCancel?.();
      onOpenChange(nextOpen);
    },
    [onCancel, onOpenChange],
  );

  const handleConfirm = React.useCallback(async () => {
    if (isBusy || confirmDisabled) return;

    try {
      const res = onConfirm();
      if (isThenable(res)) {
        setInternalLoading(true);
        await res;
      }
    } finally {
      setInternalLoading(false);
    }
  }, [onConfirm, isBusy, confirmDisabled]);

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className={cancelClassName}
            disabled={isBusy}
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            className={cn(
              destructive &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              confirmClassName,
            )}
            disabled={isBusy || confirmDisabled}
            onClick={handleConfirm}
          >
            {isBusy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {confirmText}
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
