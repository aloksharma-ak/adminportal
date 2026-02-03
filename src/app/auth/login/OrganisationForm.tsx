"use client";

import * as React from "react";
import type { Control, UseFormHandleSubmit } from "react-hook-form";
import { HomeIcon } from "lucide-react";

import { ActionButton } from "@/components/controls/Buttons";
import { InputField } from "@/components/controls/InputField";

export type LoginFormValues = {
  orgCode: string;
  orgId: string;
  username: string;
  password: string;
};

type Props = {
  control: Control<LoginFormValues>;
  handleSubmit: UseFormHandleSubmit<LoginFormValues>;
  loading: boolean;
  onContinue: (orgCode: string) => void;
};

export const OrganisationForm = React.memo(function OrganisationForm({
  control,
  handleSubmit,
  loading,
  onContinue,
}: Props) {
  const onSubmit = React.useCallback(
    (v: LoginFormValues) => onContinue(v.orgCode),
    [onContinue],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <InputField
        control={control}
        name="orgCode"
        label="OrgCode"
        placeholder="EX:- ORGNAME"
        autoComplete="off"
        className="h-11 rounded-2xl uppercase"
        rules={{
          required: "OrgCode is required",
          validate: (v) => (v.trim().length ? true : "OrgCode is required"),
        }}
        leftIcon={<HomeIcon className="h-4 w-4" />}
      />

      <ActionButton
        type="submit"
        loading={loading}
        disabled={loading}
        className="h-11 w-full rounded-2xl"
      >
        {loading ? "Checking..." : "Continue"}
      </ActionButton>
    </form>
  );
});
