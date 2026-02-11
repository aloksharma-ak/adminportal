"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import Indian_states_cities_list from "indian-states-cities-list";
import { toast } from "sonner";
import {
  User2,
  LockIcon,
  Mail,
  Phone,
  ImageIcon,
  MapPin,
  Hash,
} from "lucide-react";

import { InputField } from "@/components/controls/InputField";
import {
  DropdownFilter,
  type DropdownOption,
} from "@/components/controls/DropdownFilter";
import { ToggleControl } from "@/components/controls/ToggleControl";
import { ActionButton } from "@/components/controls/Buttons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createEmployee } from "@/app/utils";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fileToBase64 } from "@/lib/image-session.client";
import { useSession } from "next-auth/react";

const MAX_IMAGE_BYTES = 500 * 1024;

const ROLE_OPTIONS: DropdownOption[] = [
  { value: "1", label: "SuperAdmin" },
  { value: "2", label: "SchoolAdmin" },
  { value: "3", label: "Principal" },
  { value: "4", label: "HOD" },
  { value: "5", label: "Teacher" },
  { value: "6", label: "ExamController" },
  { value: "7", label: "Student" },
  { value: "8", label: "Parent" },
  { value: "9", label: "Accountant" },
  { value: "10", label: "HRManager" },
  { value: "11", label: "AdmissionOfficer" },
  { value: "12", label: "Receptionist" },
  { value: "13", label: "TransportIncharge" },
  { value: "14", label: "Librarian" },
  { value: "15", label: "AssetsManager" },
  { value: "16", label: "Counsellor" },
  { value: "17", label: "Nurse" },
  { value: "18", label: "ITSupport" },
  { value: "19", label: "Auditor" },
];

type Address = {
  addressLine1: string;
  addressLine2: string;
  pinCode: string;
  city: string;
  state: string;
};

type EmployeeFormValues = {
  orgId: number | string | undefined;
  roleId: string | undefined;

  firstName: string;
  middleName: string;
  lastName: string;
  initials: string;

  phone: string;
  secondaryPhone: string;
  email: string;

  panNo: string;
  aadharNo: string;
  passportNo: string;

  profilePicture: string;

  permanantAddress: Address;

  isCommunicationAddressSameAsPermanant: boolean;
  communicationAddress: Address;

  isCreateCredential: boolean;
  userName: string;
  password: string;
};

export default function Page() {
  const { data: session } = useSession();

  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<string>("");

  const form = useForm<EmployeeFormValues>({
    mode: "onSubmit",
    defaultValues: {
      orgId: session?.user?.orgId,
      roleId: undefined,

      firstName: "",
      middleName: "",
      lastName: "",
      initials: "",

      phone: "",
      secondaryPhone: "",
      email: "",

      panNo: "",
      aadharNo: "",
      passportNo: "",

      profilePicture: "",

      permanantAddress: {
        addressLine1: "",
        addressLine2: "",
        pinCode: "",
        city: "",
        state: "",
      },

      isCommunicationAddressSameAsPermanant: true,
      communicationAddress: {
        addressLine1: "",
        addressLine2: "",
        pinCode: "",
        city: "",
        state: "",
      },

      isCreateCredential: true,
      userName: "",
      password: "",
    },
  });

  const { control, handleSubmit, getValues, setValue } = form;

  const sameAddress = form.watch("isCommunicationAddressSameAsPermanant");
  const createCred = form.watch("isCreateCredential");
  const selectedPermanentState = form.watch("permanantAddress.state");
  const selectedCommState = form.watch("communicationAddress.state");
  const permanentAddress = form.watch("permanantAddress");

  React.useEffect(() => {
    if (!sameAddress) return;
    setValue("communicationAddress", permanentAddress, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [sameAddress, permanentAddress, setValue]);

  // session load ke baad orgId sync
  React.useEffect(() => {
    if (session?.user?.orgId !== undefined && session?.user?.orgId !== null) {
      setValue("orgId", session.user.orgId);
    }
  }, [session?.user?.orgId, setValue]);

  // ✅ if sameAddress => copy permanent -> communication
  React.useEffect(() => {
    if (!sameAddress) return;
    setValue("communicationAddress", getValues("permanantAddress"));
  }, [sameAddress, getValues, setValue]);

  const stateOptions = React.useMemo<DropdownOption[]>(
    () =>
      (Indian_states_cities_list.STATES_OBJECT ?? []).map((s) => ({
        value: s.name, // key for STATE_WISE_CITIES
        label: s.label, // UI text
      })),
    [],
  );

  const permanentCityOptions = React.useMemo<DropdownOption[]>(() => {
    if (!selectedPermanentState) return [];
    const cities =
      Indian_states_cities_list.STATE_WISE_CITIES?.[selectedPermanentState] ??
      [];
    return cities.map((c) => ({ value: c.value, label: c.label }));
  }, [selectedPermanentState]);

  const commCityOptions = React.useMemo<DropdownOption[]>(() => {
    if (!selectedCommState) return [];
    const cities =
      Indian_states_cities_list.STATE_WISE_CITIES?.[selectedCommState] ?? [];
    return cities.map((c) => ({ value: c.value, label: c.label }));
  }, [selectedCommState]);

  const onProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      input.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be less than 500 KB");
      setValue("profilePicture", "");
      setPreview("");
      input.value = ""; // important: same file select again triggers onChange
      return;
    }

    try {
      const { dataUrl, base64 } = await fileToBase64(file);
      setPreview(dataUrl);
      setValue("profilePicture", base64, { shouldDirty: true });
    } catch {
      toast.error("Unable to process image");
    } finally {
      input.value = "";
    }
  };

  const onSubmit = handleSubmit(async (v) => {
    const orgIdNum = Number(v.orgId);
    const roleIdNum = Number(v.roleId);

    if (!orgIdNum || orgIdNum <= 0) {
      toast.error("OrgId is required");
      return;
    }
    if (!roleIdNum || roleIdNum <= 0) {
      toast.error("Role is required");
      return;
    }

    if (v.isCreateCredential) {
      if (!v.userName.trim()) return toast.error("Username is required");
      if (!v.password.trim()) return toast.error("Password is required");
    }

    setLoading(true);
    const tId = toast.loading("Creating employee...");

    try {
      const payload = {
        ...v,
        orgId: orgIdNum,
        roleId: roleIdNum,
        communicationAddress: v.isCommunicationAddressSameAsPermanant
          ? v.permanantAddress
          : v.communicationAddress,
      };

      await createEmployee(payload);

      toast.success("Employee created", { id: tId });
      form.reset();
      setPreview("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong", {
        id: tId,
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <Card className="rounded-3xl border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">Create Employee</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8" noValidate>
            {/* Org + Role */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                control={control}
                name="orgId"
                label="Org ID"
                placeholder={session?.user?.orgName}
                className="h-11 rounded-2xl"
                leftIcon={<Hash className="h-4 w-4" />}
                disabled
                rules={{
                  required: "OrgId is required",
                  validate: (v) =>
                    Number(String(v)) > 0 ? true : "OrgId must be > 0",
                }}
              />

              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name="roleId"
                  rules={{ required: "Role is required" }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <DropdownFilter
                        label="Role"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select role"
                        options={ROLE_OPTIONS}
                        className={cn(
                          "h-11 py-5 rounded-2xl",
                          fieldState.invalid && "border border-red-500",
                        )}
                        allowClear={false}
                      />
                      {fieldState.invalid && (
                        <p className="text-xs text-red-600">
                          {fieldState.error?.message ?? "Role is required"}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Basic */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField
                  control={control}
                  name="firstName"
                  label="First Name"
                  placeholder="First name"
                  className="h-11 rounded-2xl"
                  leftIcon={<User2 className="h-4 w-4" />}
                  rules={{
                    required: "First name is required",
                    validate: (v) =>
                      String(v).trim() ? true : "First name is required",
                  }}
                />

                <InputField
                  control={control}
                  name="middleName"
                  label="Middle Name"
                  placeholder="Optional"
                  className="h-11 rounded-2xl"
                />

                <InputField
                  control={control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Last name"
                  className="h-11 rounded-2xl"
                  rules={{
                    required: "Last name is required",
                    validate: (v) =>
                      String(v).trim() ? true : "Last name is required",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="name@domain.com"
                  className="h-11 rounded-2xl"
                  leftIcon={<Mail className="h-4 w-4" />}
                  rules={{ required: "Email is required" }}
                />

                <InputField
                  control={control}
                  name="phone"
                  label="Phone"
                  placeholder="0123456789"
                  className="h-11 rounded-2xl"
                  leftIcon={<Phone className="h-4 w-4" />}
                  rules={{ required: "Phone is required" }}
                />

                <InputField
                  control={control}
                  name="secondaryPhone"
                  label="Secondary Phone"
                  placeholder="Optional"
                  className="h-11 rounded-2xl"
                />
              </div>

              {/* Image upload */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Profile Picture
                    </div>
                    <div className="text-xs text-slate-600">
                      Upload an image (max 500KB)
                    </div>
                  </div>

                  {preview ? (
                    <Image
                      src={preview}
                      alt="preview"
                      width={48}
                      height={48}
                      className="h-14 w-14 rounded-2xl border object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border text-xs text-slate-500">
                      N/A
                    </div>
                  )}
                </div>

                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl border px-4 text-sm">
                  <ImageIcon className="h-4 w-4" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onProfileImageChange}
                  />
                </label>
              </div>
            </div>

            <Separator />

            {/* Permanent Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Permanent Address
                  </div>
                  <div className="text-xs text-slate-600">
                    Fill complete address
                  </div>
                </div>
                <MapPin className="h-4 w-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  control={control}
                  name="permanantAddress.addressLine1"
                  label="Address Line 1"
                  placeholder="House no, street"
                  className="h-11 rounded-2xl"
                  rules={{ required: "Required" }}
                />

                <InputField
                  control={control}
                  name="permanantAddress.addressLine2"
                  label="Address Line 2"
                  placeholder="Optional"
                  className="h-11 rounded-2xl"
                />

                <InputField
                  control={control}
                  name="permanantAddress.pinCode"
                  label="Pin Code"
                  placeholder="e.g. 110001"
                  className="h-11 rounded-2xl"
                  rules={{ required: "Required" }}
                />

                <div className="flex gap-6">
                  <Controller
                    control={control}
                    name="communicationAddress.state"
                    rules={{ required: "State is required" }}
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <DropdownFilter
                          label="State"
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            setValue("communicationAddress.city", "");
                          }}
                          placeholder="Select State"
                          options={stateOptions}
                          className={cn(
                            "h-11 py-5 rounded-2xl",
                            fieldState.invalid && "border border-red-500",
                          )}
                          allowClear={false}
                        />
                        {fieldState.invalid && (
                          <p className="text-xs text-red-600">
                            {fieldState.error?.message ?? "State is required"}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name="communicationAddress.city"
                    rules={{ required: "City is required" }}
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        <DropdownFilter
                          label="City"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={
                            selectedCommState
                              ? "Select City"
                              : "Select state first"
                          }
                          options={commCityOptions}
                          className={cn(
                            "h-11 py-5 rounded-2xl",
                            fieldState.invalid && "border border-red-500",
                          )}
                          allowClear={false}
                        />
                        {fieldState.invalid && (
                          <p className="text-xs text-red-600">
                            {fieldState.error?.message ?? "City is required"}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Toggle same address */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Communication address same as permanent
                </div>
                <div className="text-xs text-slate-600">
                  Turn off to enter different communication address
                </div>
              </div>

              <ToggleControl
                color={session?.user?.brandColor}
                label=""
                checked={sameAddress}
                onChange={(v) =>
                  setValue("isCommunicationAddressSameAsPermanant", v)
                }
              />
            </div>

            {!sameAddress && (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-slate-900">
                  Communication Address
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    control={control}
                    name="communicationAddress.addressLine1"
                    label="Address Line 1"
                    className="h-11 rounded-2xl"
                    rules={{ required: "Required" }}
                  />

                  <InputField
                    control={control}
                    name="communicationAddress.addressLine2"
                    label="Address Line 2"
                    className="h-11 rounded-2xl"
                  />

                  <InputField
                    control={control}
                    name="communicationAddress.pinCode"
                    label="Pin Code"
                    className="h-11 rounded-2xl"
                    rules={{ required: "Required" }}
                  />

                  <div className="flex gap-6">
                    <Controller
                      control={control}
                      name="permanantAddress.state"
                      rules={{ required: "State is required" }}
                      render={({ field, fieldState }) => (
                        <div>
                          <DropdownFilter
                            label="State"
                            value={field.value}
                            onChange={(val) => {
                              field.onChange(val);
                              setValue("permanantAddress.city", "");
                            }}
                            placeholder="Select State"
                            options={stateOptions}
                            className={cn(
                              "h-11 py-5 rounded-2xl",
                              fieldState.invalid && "border border-red-500",
                            )}
                            allowClear={false}
                          />
                          {fieldState.invalid && (
                            <p className="text-xs text-red-600">
                              {fieldState.error?.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      control={control}
                      name="permanantAddress.city"
                      rules={{ required: "City is required" }}
                      render={({ field, fieldState }) => (
                        <div className="space-y-2">
                          <DropdownFilter
                            label="City"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={
                              selectedPermanentState
                                ? "Select City"
                                : "Select state first"
                            }
                            options={permanentCityOptions}
                            className={cn(
                              "h-11 py-5 rounded-2xl",
                              fieldState.invalid && "border border-red-500",
                            )}
                            allowClear={false}
                          />
                          {fieldState.invalid && (
                            <p className="text-xs text-red-600">
                              {fieldState.error?.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Credential toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Create login credentials
                </div>
                <div className="text-xs text-slate-600">
                  Enable to set username & password
                </div>
              </div>

              <ToggleControl
                color={session?.user?.brandColor}
                label=""
                checked={createCred}
                onChange={(v) => setValue("isCreateCredential", v)}
              />
            </div>

            {createCred && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  control={control}
                  name="userName"
                  label="Username"
                  placeholder="username"
                  className="h-11 rounded-2xl"
                  leftIcon={<User2 className="h-4 w-4" />}
                  rules={{
                    validate: (v) =>
                      !createCred || String(v).trim()
                        ? true
                        : "Username is required",
                  }}
                />

                <InputField
                  control={control}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-2xl"
                  leftIcon={<LockIcon className="h-4 w-4" />}
                  showPasswordToggle
                  rules={{
                    validate: (v) =>
                      !createCred || String(v).trim()
                        ? true
                        : "Password is required",
                  }}
                />
              </div>
            )}

            <ActionButton
              type="submit"
              color={session?.user?.brandColor}
              loading={loading}
              disabled={loading}
              className="h-11 w-full rounded-2xl"
            >
              Create Employee
            </ActionButton>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
