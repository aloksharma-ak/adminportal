"use client";

import * as React from "react";
import type {
  Control,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { ArrowLeft, LockIcon, User2 } from "lucide-react";

import { ActionButton } from "@/components/controls/Buttons";
import { InputField } from "@/components/controls/InputField";
import type { LoginFormValues } from "./OrganisationForm";
import { Organisation } from "@/shared-types/organisation.types";

type Props = {
  org: Organisation;
  control: Control<LoginFormValues>;
  register: UseFormRegister<LoginFormValues>;
  handleSubmit: UseFormHandleSubmit<LoginFormValues>;
  loading: boolean;
  onBack: () => void;
  onLogin: (data: LoginFormValues) => void;
};

export const LoginForm = React.memo(function LoginForm({
  org,
  control,
  register,
  handleSubmit,
  loading,
  onBack,
  onLogin,
}: Props) {
  const onSubmit = React.useCallback(
    (v: LoginFormValues) => onLogin(v),
    [onLogin],
  );

  const brandColor: string | undefined = org?.brandColor ?? undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("orgId", { required: true })} />

      <div className="flex items-center justify-between">
        <ActionButton
          type="button"
          onClick={onBack}
          color="transparent"
          className="h-11 rounded-2xl"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Change Org
        </ActionButton>
      </div>

      <InputField
        control={control}
        name="username"
        label="Username"
        placeholder="demouser"
        autoComplete="username"
        className="h-11 rounded-2xl"
        rules={{
          required: "Username is required",
          validate: (v) => (v.trim().length ? true : "Username is required"),
        }}
        leftIcon={<User2 className="h-4 w-4" />}
      />

      <InputField
        control={control}
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        className="h-11 rounded-2xl"
        rules={{ required: "Password is required" }}
        leftIcon={<LockIcon className="h-4 w-4" />}
        showPasswordToggle
      />

      <ActionButton
        type="submit"
        color={brandColor}
        loading={loading}
        disabled={loading}
        className="h-11 w-full rounded-2xl"
      >
        {loading ? "Signing in..." : "Sign in"}
      </ActionButton>
    </form>
  );
});
