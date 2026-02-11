"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
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

export default function Page() {
  const { data: session } = useSession();

  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<string>("");

  const form = useForm({
    mode: "onSubmit",
    defaultValues: {
      orgId: session?.user.orgId,
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

  // ✅ if sameAddress => copy permanent -> communication
  React.useEffect(() => {
    if (!sameAddress) return;
    setValue("communicationAddress", getValues("permanantAddress"));
  }, [sameAddress, getValues, setValue]);

  const onSubmit = handleSubmit(async (v) => {
    // ✅ small client-side UX validation (server also validates)
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
                placeholder={session?.user.orgName}
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
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Role
                </label>

                <Controller
                  control={control}
                  name="roleId"
                  rules={{ required: "Role is required" }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <DropdownFilter
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select role"
                        options={ROLE_OPTIONS}
                        className={cn(
                          "h-11 rounded-2xl",
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
                  placeholder="9876543210"
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
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (file.size > 500 * 1024) {
                        toast.error("Image must be less than 500KB");
                        return;
                      }

                      const { dataUrl, base64 } = await fileToBase64(file);

                      // ✅ preview needs dataUrl
                      setPreview(dataUrl);

                      // ✅ API needs base64 only
                      setValue("profilePicture", base64);
                    }}
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

                <InputField
                  control={control}
                  name="permanantAddress.city"
                  label="City"
                  placeholder="City"
                  className="h-11 rounded-2xl"
                  rules={{ required: "Required" }}
                />

                <InputField
                  control={control}
                  name="permanantAddress.state"
                  label="State"
                  placeholder="State"
                  className="h-11 rounded-2xl md:col-span-2"
                  rules={{ required: "Required" }}
                />
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
                color={session?.user.brandColor}
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
                  />

                  <InputField
                    control={control}
                    name="communicationAddress.city"
                    label="City"
                    className="h-11 rounded-2xl"
                  />

                  <InputField
                    control={control}
                    name="communicationAddress.state"
                    label="State"
                    className="h-11 rounded-2xl md:col-span-2"
                  />
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
                color={session?.user.brandColor}
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
              color={session?.user.brandColor}
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
