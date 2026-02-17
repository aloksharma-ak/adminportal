"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import Indian_states_cities_list from "indian-states-cities-list";
import { toast } from "sonner";
import { User2, LockIcon, Mail, Phone, ImageIcon, MapPin, Hash } from "lucide-react";

import { InputField } from "@/components/controls/InputField";
import { DropdownFilter, type DropdownOption } from "@/components/controls/DropdownFilter";
import { ToggleControl } from "@/components/controls/ToggleControl";
import { ActionButton } from "@/components/controls/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createEmployee } from "@/app/utils";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fileToBase64 } from "@/lib/image-session.client";

const MAX_IMAGE_BYTES = 500 * 1024;

type Address = {
  addressLine1: string;
  addressLine2: string;
  pinCode:      string;
  city:         string;
  state:        string;
};

type FormValues = {
  orgId:      number | string | undefined;
  roleId:     string | undefined;
  firstName:  string;
  middleName: string;
  lastName:   string;
  initials:   string;
  phone:      string;
  secondaryPhone: string;
  email:      string;
  panNo:      string;
  aadharNo:   string;
  passportNo: string;
  profilePicture: string;
  permanantAddress:                      Address;
  isCommunicationAddressSameAsPermanant: boolean;
  communicationAddress:                  Address;
  isCreateCredential: boolean;
  userName:  string;
  password:  string;
};

const EMPTY_ADDRESS: Address = { addressLine1: "", addressLine2: "", pinCode: "", city: "", state: "" };

type Props = {
  orgId:      number;
  orgName?:   string;
  brandColor?: string;
  roles:      { roleId: number; roleName: string }[];
};

export default function CreateEmployeeForm({ orgId, orgName, brandColor, roles }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState("");

  const roleOptions: DropdownOption[] = roles.map((r) => ({
    value: String(r.roleId),
    label: r.roleName,
  }));

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      orgId, roleId: undefined, firstName: "", middleName: "", lastName: "", initials: "",
      phone: "", secondaryPhone: "", email: "", panNo: "", aadharNo: "", passportNo: "",
      profilePicture: "",
      permanantAddress:             { ...EMPTY_ADDRESS },
      isCommunicationAddressSameAsPermanant: true,
      communicationAddress:         { ...EMPTY_ADDRESS },
      isCreateCredential: true, userName: "", password: "",
    },
  });

  const { control, handleSubmit, setValue } = form;
  const sameAddress   = form.watch("isCommunicationAddressSameAsPermanant");
  const createCred    = form.watch("isCreateCredential");
  const permState     = form.watch("permanantAddress.state");
  const commState     = form.watch("communicationAddress.state");
  const permAddress   = form.watch("permanantAddress");

  React.useEffect(() => {
    if (!sameAddress) return;
    setValue("communicationAddress", permAddress, { shouldDirty: true });
  }, [sameAddress, permAddress, setValue]);

  const stateOptions = React.useMemo<DropdownOption[]>(
    () => (Indian_states_cities_list.STATES_OBJECT ?? []).map((s) => ({ value: s.name, label: s.label })),
    [],
  );

  const permCityOptions = React.useMemo<DropdownOption[]>(() => {
    if (!permState) return [];
    return (Indian_states_cities_list.STATE_WISE_CITIES?.[permState] ?? []).map((c) => ({ value: c.value, label: c.label }));
  }, [permState]);

  const commCityOptions = React.useMemo<DropdownOption[]>(() => {
    if (!commState) return [];
    return (Indian_states_cities_list.STATE_WISE_CITIES?.[commState] ?? []).map((c) => ({ value: c.value, label: c.label }));
  }, [commState]);

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select a valid image file"); e.currentTarget.value = ""; return; }
    if (file.size > MAX_IMAGE_BYTES)      { toast.error("Image must be under 500 KB");       e.currentTarget.value = ""; return; }
    try {
      const { dataUrl, base64 } = await fileToBase64(file);
      setPreview(dataUrl);
      setValue("profilePicture", base64, { shouldDirty: true });
    } catch { toast.error("Unable to process image"); }
    finally { e.currentTarget.value = ""; }
  };

  const onSubmit = handleSubmit(async (v) => {
    const orgIdNum  = Number(v.orgId);
    const roleIdNum = Number(v.roleId);
    if (!orgIdNum  || orgIdNum  <= 0) { toast.error("Organisation ID is missing"); return; }
    if (!roleIdNum || roleIdNum <= 0) { toast.error("Please select a role");       return; }

    setLoading(true);
    const tId = toast.loading("Creating employee...");
    try {
      await createEmployee({
        ...v,
        orgId:  orgIdNum,
        roleId: roleIdNum,
        communicationAddress: v.isCommunicationAddressSameAsPermanant ? v.permanantAddress : v.communicationAddress,
      });
      toast.success("Employee created successfully", { id: tId });
      form.reset();
      setPreview("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong", { id: tId });
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl">Create Employee</CardTitle>
        {orgName && (
          <p className="text-sm text-slate-500">
            Organisation: <span className="font-medium text-slate-900 dark:text-slate-100">{orgName}</span>
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8" noValidate>

          {/* Org ID + Role */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputField
              control={control} name="orgId" label="Org ID"
              placeholder={orgName ?? "Organisation"} className="h-11 rounded-2xl"
              leftIcon={<Hash className="h-4 w-4" />} disabled
              rules={{ required: "Org ID is required" }}
            />
            <div className="md:col-span-2">
              {roleOptions.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  No roles available. Check Master Data API connectivity.
                </div>
              ) : (
                <Controller control={control} name="roleId" rules={{ required: "Role is required" }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <DropdownFilter
                        label="Role" value={field.value} onChange={field.onChange}
                        placeholder="Select role" options={roleOptions}
                        className={cn("h-11 py-5 rounded-2xl", fieldState.invalid && "border-red-500")}
                        allowClear={false}
                      />
                      {fieldState.invalid && <p className="text-xs text-red-600 dark:text-red-400">{fieldState.error?.message}</p>}
                    </div>
                  )}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Personal Info */}
          <Section title="Personal Details" icon={<User2 className="h-4 w-4 text-slate-400" />}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField control={control} name="firstName" label="First Name" placeholder="First name"
                className="h-11 rounded-2xl" leftIcon={<User2 className="h-4 w-4" />}
                rules={{ required: "First name is required", validate: (v) => String(v).trim() || "First name is required" }} />
              <InputField control={control} name="middleName" label="Middle Name" placeholder="Optional" className="h-11 rounded-2xl" />
              <InputField control={control} name="lastName" label="Last Name" placeholder="Last name"
                className="h-11 rounded-2xl"
                rules={{ required: "Last name is required", validate: (v) => String(v).trim() || "Last name is required" }} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField control={control} name="initials" label="Initials" placeholder="e.g. JS" className="h-11 rounded-2xl" />
              <InputField control={control} name="phone" label="Phone" placeholder="0123456789"
                className="h-11 rounded-2xl" leftIcon={<Phone className="h-4 w-4" />}
                rules={{ required: "Phone is required" }} />
              <InputField control={control} name="secondaryPhone" label="Secondary Phone" placeholder="Optional" className="h-11 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField control={control} name="email" label="Email" type="email" placeholder="email@example.com"
                className="h-11 rounded-2xl" leftIcon={<Mail className="h-4 w-4" />}
                rules={{ required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } }} />
              <InputField control={control} name="panNo"    label="PAN No"    placeholder="Optional" className="h-11 rounded-2xl" />
              <InputField control={control} name="aadharNo" label="Aadhar No" placeholder="Optional" className="h-11 rounded-2xl" />
            </div>

            {/* Profile picture */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Profile Picture</p>
                <p className="text-xs text-slate-500">Optional · max 500 KB</p>
              </div>
              <div className="flex items-center gap-3">
                {preview ? (
                  <Image src={preview} alt="Preview" width={48} height={48} className="h-12 w-12 rounded-xl border object-cover dark:border-slate-700" unoptimized />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-400">N/A</div>
                )}
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                </label>
              </div>
            </div>
          </Section>

          <Separator />

          {/* Permanent Address */}
          <Section title="Permanent Address" icon={<MapPin className="h-4 w-4 text-slate-400" />}>
            <AddressFields prefix="permanantAddress" control={control} setValue={setValue}
              selectedState={permState} stateOptions={stateOptions} cityOptions={permCityOptions} />
          </Section>

          {/* Same address toggle */}
          <ToggleRow title="Communication address same as permanent"
            description="Turn off to enter a different communication address"
            checked={sameAddress} onChange={(v) => setValue("isCommunicationAddressSameAsPermanant", v)} color={brandColor} />

          {!sameAddress && (
            <Section title="Communication Address">
              <AddressFields prefix="communicationAddress" control={control} setValue={setValue}
                selectedState={commState} stateOptions={stateOptions} cityOptions={commCityOptions} />
            </Section>
          )}

          <Separator />

          {/* Credentials toggle */}
          <ToggleRow title="Create login credentials"
            description="Enable to set a username and password for this employee"
            checked={createCred} onChange={(v) => setValue("isCreateCredential", v)} color={brandColor} />

          {createCred && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField control={control} name="userName" label="Username" placeholder="username"
                className="h-11 rounded-2xl" leftIcon={<User2 className="h-4 w-4" />}
                rules={{ validate: (v) => !createCred || String(v).trim() ? true : "Username is required" }} />
              <InputField control={control} name="password" label="Password" type="password" placeholder="••••••••"
                className="h-11 rounded-2xl" leftIcon={<LockIcon className="h-4 w-4" />} showPasswordToggle
                rules={{ validate: (v) => !createCred || String(v).trim() ? true : "Password is required" }} />
            </div>
          )}

          <ActionButton type="submit" color={brandColor} loading={loading} disabled={loading} className="h-11 w-full rounded-2xl">
            Create Employee
          </ActionButton>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Sub-components ───────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {icon}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange, color }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void; color?: string | null;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ToggleControl color={color ?? undefined} label="" checked={checked} onChange={onChange} />
    </div>
  );
}

function AddressFields({ prefix, control, setValue, selectedState, stateOptions, cityOptions }: {
  prefix: "permanantAddress" | "communicationAddress";
  control: ReturnType<typeof useForm<FormValues>>["control"];
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  selectedState: string; stateOptions: DropdownOption[]; cityOptions: DropdownOption[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <InputField control={control} name={`${prefix}.addressLine1`} label="Address Line 1"
        placeholder="House no, street" className="h-11 rounded-2xl" rules={{ required: "Address Line 1 is required" }} />
      <InputField control={control} name={`${prefix}.addressLine2`} label="Address Line 2" placeholder="Optional" className="h-11 rounded-2xl" />
      <InputField control={control} name={`${prefix}.pinCode`} label="Pin Code" placeholder="e.g. 110001"
        className="h-11 rounded-2xl" rules={{ required: "Pin code is required" }} />
      <div className="flex gap-4">
        <Controller control={control} name={`${prefix}.state`} rules={{ required: "State is required" }}
          render={({ field, fieldState }) => (
            <div className="flex-1 space-y-1.5">
              <DropdownFilter label="State" value={field.value} onChange={(val) => { field.onChange(val); setValue(`${prefix}.city`, ""); }}
                placeholder="Select State" options={stateOptions}
                className={cn("h-11 py-5 rounded-2xl", fieldState.invalid && "border-red-500")} allowClear={false} />
              {fieldState.invalid && <p className="text-xs text-red-600 dark:text-red-400">{fieldState.error?.message}</p>}
            </div>
          )}
        />
        <Controller control={control} name={`${prefix}.city`} rules={{ required: "City is required" }}
          render={({ field, fieldState }) => (
            <div className="flex-1 space-y-1.5">
              <DropdownFilter label="City" value={field.value} onChange={field.onChange}
                placeholder={selectedState ? "Select City" : "Select state first"} options={cityOptions}
                className={cn("h-11 py-5 rounded-2xl", fieldState.invalid && "border-red-500")} allowClear={false} />
              {fieldState.invalid && <p className="text-xs text-red-600 dark:text-red-400">{fieldState.error?.message}</p>}
            </div>
          )}
        />
      </div>
    </div>
  );
}
