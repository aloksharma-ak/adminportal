"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, LayoutGrid, Shield } from "lucide-react";

import { createPermission } from "@/app/utils";
import { InputField } from "@/components/controls/InputField";
import {
  DropdownFilter,
  type DropdownOption,
} from "@/components/controls/DropdownFilter";
import { ActionButton } from "@/components/controls/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Props = {
  modules: { moduleId: number; moduleName: string; icon?: string | null }[];
  brandColor?: string;
  successRedirect?: string;
};

type FormValues = {
  moduleId: string | undefined;
  name: string;
  description: string;
};

export default function CreatePermissionForm({
  modules,
  brandColor,
  successRedirect,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const moduleOptions = React.useMemo<DropdownOption[]>(
    () =>
      modules.map((m) => ({
        value: String(m.moduleId),
        label: m.moduleName,
      })),
    [modules],
  );

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      moduleId: undefined,
      name: "",
      description: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const moduleIdNum = Number(values.moduleId);

    if (!Number.isFinite(moduleIdNum) || moduleIdNum <= 0) {
      toast.error("Please select a valid module");
      return;
    }

    const name = values.name.trim();
    const description = values.description.trim();

    if (!name) { toast.error("Permission name is required"); return; }
    if (!description) { toast.error("Description is required"); return; }

    setLoading(true);
    const tId = toast.loading("Creating permission…");

    try {
      await createPermission({ name, description, moduleId: moduleIdNum });
      toast.success("Permission created successfully", { id: tId });
      reset();
      if (successRedirect) router.push(successRedirect);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create permission",
        { id: tId },
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{ background: brandColor ? `${brandColor}18` : "#eef2ff" }}
          >
            <Shield
              className="h-5 w-5"
              style={{ color: brandColor ?? "#6366f1" }}
            />
          </div>
          <div>
            <CardTitle className="text-xl">Permission Details</CardTitle>
            <p className="text-sm text-slate-500">
              Fill in the fields below to create a new permission.
            </p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {/* Module */}
          {moduleOptions.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              No modules available — check Master Data API connectivity.
              You can still submit; the API will validate the module ID.
            </div>
          ) : (
            <Controller
              control={control}
              name="moduleId"
              rules={{ required: "Module is required" }}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <DropdownFilter
                    label="Module"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a module…"
                    options={moduleOptions}
                    className={cn(
                      "h-11 rounded-2xl",
                      fieldState.invalid && "border-red-500",
                    )}
                    allowClear={false}
                  />
                  {fieldState.invalid && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
          )}

          {/* Permission name */}
          <InputField
            control={control}
            name="name"
            label="Permission Name"
            placeholder="e.g. INSERT_REPORT"
            className="h-11 rounded-2xl"
            leftIcon={<LayoutGrid className="h-4 w-4" />}
            rules={{
              required: "Permission name is required",
              validate: (v) =>
                String(v).trim().length > 0 || "Permission name is required",
            }}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            rules={{
              required: "Description is required",
              validate: (v) =>
                String(v).trim().length > 0 || "Description is required",
            }}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <div
                  className={cn(
                    "rounded-2xl border bg-white dark:bg-slate-900",
                    fieldState.invalid
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700",
                  )}
                >
                  <div className="flex items-start gap-2 p-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="Describe what this permission allows…"
                      className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
                    />
                  </div>
                </div>
                {fieldState.invalid && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldState.error?.message}
                  </p>
                )}
              </div>
            )}
          />

          <Separator />

          <ActionButton
            type="submit"
            color={brandColor}
            loading={loading}
            disabled={loading}
            className="h-11 w-full rounded-2xl"
          >
            Create Permission
          </ActionButton>
        </form>
      </CardContent>
    </Card>
  );
}