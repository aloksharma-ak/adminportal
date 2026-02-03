"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;

  label: string;
  id?: string;

  rules?: RegisterOptions<T, Path<T>>;

  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];

  disabled?: boolean;

  className?: string;
  fieldClassName?: string;

  showPasswordToggle?: boolean;

  leftIcon?: React.ReactNode;
}

export function InputField<T extends FieldValues>({
  control,
  name,
  label,
  id,
  rules,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  disabled,
  className,
  fieldClassName,
  showPasswordToggle = false,
  leftIcon,
}: InputFieldProps<T>) {
  const inputId = id ?? String(name);

  const canTogglePassword = type === "password" && showPasswordToggle;
  const [showPassword, setShowPassword] = React.useState(false);

  const actualType: React.HTMLInputTypeAttribute =
    canTogglePassword && showPassword ? "text" : type;

  const hasLeftIcon = Boolean(leftIcon);

  const numberNoSpinnerClasses =
    type === "number"
      ? "appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      : "";

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={fieldClassName}>
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

          <div className="relative">
            {hasLeftIcon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300">
                {leftIcon}
              </span>
            )}

            <Input
              {...field}
              id={inputId}
              type={actualType}
              placeholder={placeholder}
              autoComplete={autoComplete}
              inputMode={inputMode}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              value={field.value ?? ""}
              className={[
                hasLeftIcon ? "pl-10" : "",
                canTogglePassword ? "pr-10" : "",
                numberNoSpinnerClasses,
                className ?? "",
              ]
                .filter(Boolean)
                .join(" ")}
            />

            {canTogglePassword && (
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
