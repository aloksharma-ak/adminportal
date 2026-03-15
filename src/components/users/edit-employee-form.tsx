"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  User2, LockIcon, Mail, Phone, ImageIcon, MapPin, Building2,
} from "lucide-react";

import { InputField } from "@/components/controls/InputField";
import { DropdownFilter, type DropdownOption } from "@/components/controls/DropdownFilter";
import { ActionButton } from "@/components/controls/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createEmployee, type EmployeeDetail } from "@/app/utils";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fileToBase64 } from "@/lib/image-session.client";
import { useSession } from "next-auth/react";

import {
  MAX_IMAGE_BYTES,
  type Address,
  type EmployeeFormValues,
  addressesEqual,
  FormSection,
  FormToggleRow,
  AddressFields,
  useIndianStatesAndCities,
} from "./employee-form-shared";

type FormValues = EmployeeFormValues;

type Props = {
  orgId: number;
  orgName?: string;
  brandColor?: string;
  roles: { roleId: number; roleName: string }[];
  employee: EmployeeDetail;
};

export default function EditEmployeeForm({
  orgId, orgName, brandColor, roles, employee,
}: Props) {
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState(
    employee.profilePicture
      ? `data:image/jpeg;base64,${employee.profilePicture}`
      : "",
  );

  const roleOptions: DropdownOption[] = roles.map((r) => ({
    value: String(r.roleId),
    label: r.roleName,
  }));

  const permAddr: Address = {
    addressLine1: employee.permanantAddress?.addressLine1 ?? "",
    addressLine2: employee.permanantAddress?.addressLine2 ?? "",
    pinCode: employee.permanantAddress?.pinCode ?? "",
    city: employee.permanantAddress?.city ?? "",
    state: employee.permanantAddress?.state ?? "",
  };

  const commAddr: Address = {
    addressLine1: employee.communicationAddress?.addressLine1 ?? "",
    addressLine2: employee.communicationAddress?.addressLine2 ?? "",
    pinCode: employee.communicationAddress?.pinCode ?? "",
    city: employee.communicationAddress?.city ?? "",
    state: employee.communicationAddress?.state ?? "",
  };

  const isSameAddr = addressesEqual(permAddr, commAddr);

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      orgId,
      empId: employee.empId,
      profileId: employee.profileId,
      roleId: employee.role?.id ? String(employee.role.id) : undefined,
      firstName: employee.firstName ?? "",
      middleName: employee.middleName ?? "",
      lastName: employee.lastName ?? "",
      initials: employee.initials ?? "",
      phone: employee.phone ?? "",
      secondaryPhone: employee.secondaryPhone ?? "",
      email: employee.email ?? "",
      panNo: employee.panNo ?? "",
      aadharNo: employee.aadharNo ?? "",
      passportNo: employee.passportNo ?? "",
      profilePicture: employee.profilePicture ?? "",
      permanantAddress: permAddr,
      isCommunicationAddressSameAsPermanant: isSameAddr,
      communicationAddress: isSameAddr ? { ...permAddr } : commAddr,
      isCreateCredential: employee.isCredentialsCreated,
      userName: employee.username ?? "",
      password: "",  // never pre-fill password
    },
  });

  const { control, handleSubmit, setValue, watch } = form;

  const sameAddress = watch("isCommunicationAddressSameAsPermanant");
  const createCred = watch("isCreateCredential");
  const permState = watch("permanantAddress.state");
  const commState = watch("communicationAddress.state");

  const { stateOptions, permCityOptions, commCityOptions } = useIndianStatesAndCities(permState, commState);

  const p1 = watch("permanantAddress.addressLine1");
  const p2 = watch("permanantAddress.addressLine2");
  const p3 = watch("permanantAddress.pinCode");
  const p4 = watch("permanantAddress.city");
  const p5 = watch("permanantAddress.state");

  React.useEffect(() => {
    if (!sameAddress) return;
    setValue(
      "communicationAddress",
      { addressLine1: p1, addressLine2: p2, pinCode: p3, city: p4, state: p5 },
      { shouldValidate: false },
    );
  }, [sameAddress, p1, p2, p3, p4, p5, setValue]);

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.currentTarget.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be under 500 KB");
      e.currentTarget.value = "";
      return;
    }
    try {
      const { dataUrl, base64 } = await fileToBase64(file);
      setPreview(dataUrl);
      setValue("profilePicture", base64, { shouldDirty: true });
    } catch {
      toast.error("Unable to process image");
    } finally {
      e.currentTarget.value = "";
    }
  };

  const onSubmit = handleSubmit(async (v) => {
    const roleIdNum = Number(v.roleId);
    if (!roleIdNum || roleIdNum <= 0) {
      toast.error("Please select a role");
      return;
    }

    const commAddress = v.isCommunicationAddressSameAsPermanant
      ? v.permanantAddress
      : v.communicationAddress;

    setLoading(true);
    const tId = toast.loading("Updating employee...");
    try {
      await createEmployee({
        ...v,
        roleId: roleIdNum,
        communicationAddress: commAddress,
        userId: session?.user?.profileId ?? 0,
      });
      toast.success("Employee updated successfully", { id: tId });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong",
        { id: tId },
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl">Edit Employee</CardTitle>
        {orgName && (
          <p className="text-sm text-slate-500">
            Organisation:{" "}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {orgName}
            </span>
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8" noValidate>

          {/* ── Organisation (display only) + Role ── */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-900">
              <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate text-sm text-slate-500">
                {orgName ?? `Org #${orgId}`}
              </span>
            </div>

            <div className="md:col-span-2">
              {roleOptions.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  No roles available. Check Master Data API connectivity.
                </div>
              ) : (
                <Controller
                  control={control}
                  name="roleId"
                  rules={{ required: "Role is required" }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <DropdownFilter
                        label="Role"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select role"
                        options={roleOptions}
                        className={cn(
                          "h-11 py-5 rounded-2xl",
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
            </div>
          </div>

          <Separator />

          {/* ── Personal Details ── */}
          <FormSection
            title="Personal Details"
            icon={<User2 className="h-4 w-4 text-slate-400" />}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                control={control} name="firstName" label="First Name"
                placeholder="First name" className="h-11 rounded-2xl"
                leftIcon={<User2 className="h-4 w-4" />}
                rules={{
                  required: "First name is required",
                  validate: (v) => String(v).trim().length > 0 || "First name is required",
                }}
              />
              <InputField
                control={control} name="middleName" label="Middle Name"
                placeholder="Optional" className="h-11 rounded-2xl"
              />
              <InputField
                control={control} name="lastName" label="Last Name"
                placeholder="Last name" className="h-11 rounded-2xl"
                rules={{
                  required: "Last name is required",
                  validate: (v) => String(v).trim().length > 0 || "Last name is required",
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                control={control} name="initials" label="Initials"
                placeholder="e.g. JS" className="h-11 rounded-2xl"
              />
              <InputField
                control={control} name="phone" label="Phone"
                placeholder="0123456789" className="h-11 rounded-2xl"
                leftIcon={<Phone className="h-4 w-4" />}
                rules={{ required: "Phone is required" }}
              />
              <InputField
                control={control} name="secondaryPhone" label="Secondary Phone"
                placeholder="Optional" className="h-11 rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                control={control} name="email" label="Email" type="email"
                placeholder="email@example.com" className="h-11 rounded-2xl"
                leftIcon={<Mail className="h-4 w-4" />}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email",
                  },
                }}
              />
              <InputField
                control={control} name="panNo" label="PAN No"
                placeholder="Optional" className="h-11 rounded-2xl"
              />
              <InputField
                control={control} name="aadharNo" label="Aadhar No"
                placeholder="Optional" className="h-11 rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                control={control} name="passportNo" label="Passport No"
                placeholder="Optional" className="h-11 rounded-2xl"
              />
            </div>

            {/* Profile picture */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Profile Picture
                </p>
                <p className="text-xs text-slate-500">Optional · max 500 KB</p>
              </div>
              <div className="flex items-center gap-3">
                {preview ? (
                  <Image
                    src={preview} alt="Preview" width={48} height={48}
                    className="h-12 w-12 rounded-xl border object-cover dark:border-slate-700"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-400">
                    N/A
                  </div>
                )}
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Upload
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={onImageChange}
                  />
                </label>
              </div>
            </div>
          </FormSection>

          <Separator />

          {/* ── Permanent Address ── */}
          <FormSection
            title="Permanent Address"
            icon={<MapPin className="h-4 w-4 text-slate-400" />}
          >
            <AddressFields
              prefix="permanantAddress"
              control={control}
              setValue={setValue}
              selectedState={permState}
              stateOptions={stateOptions}
              cityOptions={permCityOptions}
            />
          </FormSection>

          {/* Same-address toggle */}
          <FormToggleRow
            title="Communication address same as permanent"
            description="Turn off to enter a different communication address"
            checked={sameAddress}
            onChange={(v) => setValue("isCommunicationAddressSameAsPermanant", v)}
            color={brandColor}
          />

          {!sameAddress && (
            <FormSection title="Communication Address">
              <AddressFields
                prefix="communicationAddress"
                control={control}
                setValue={setValue}
                selectedState={commState}
                stateOptions={stateOptions}
                cityOptions={commCityOptions}
              />
            </FormSection>
          )}

          <Separator />

          {/* ── Credentials toggle ── */}
          <FormToggleRow
            title="Update login credentials"
            description="Enable to change username or password for this employee"
            checked={createCred}
            onChange={(v) => setValue("isCreateCredential", v)}
            color={brandColor}
          />

          {createCred && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                control={control} name="userName" label="Username"
                placeholder="username" className="h-11 rounded-2xl"
                leftIcon={<User2 className="h-4 w-4" />}
                rules={{
                  validate: (v) =>
                    !createCred || String(v).trim().length > 0
                      ? true
                      : "Username is required",
                }}
              />
              <InputField
                control={control} name="password" label="Password" type="password"
                placeholder="Leave blank to keep current" className="h-11 rounded-2xl"
                leftIcon={<LockIcon className="h-4 w-4" />}
                showPasswordToggle
              />
            </div>
          )}

          <ActionButton
            type="submit"
            color={brandColor}
            loading={loading}
            disabled={loading}
            className="h-11 w-full rounded-2xl"
          >
            Save Changes
          </ActionButton>
        </form>
      </CardContent>
    </Card>
  );
}
