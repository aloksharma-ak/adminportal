"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import Indian_states_cities_list from "indian-states-cities-list";
import { toast } from "sonner";
import {
  User2,
  Mail,
  Phone,
  ImageIcon,
  MapPin,
  Hash,
  GraduationCap,
  CalendarDays,
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
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fileToBase64 } from "@/lib/image-session.client";
import { enrollStudent } from "@/app/dashboard/admission/action";

const MAX_IMAGE_BYTES = 500 * 1024;

// TODO: replace with real class list (from API)
const CLASS_OPTIONS: DropdownOption[] = [
  { value: "1", label: "Class 1" },
  { value: "2", label: "Class 2" },
  { value: "3", label: "Class 3" },
  { value: "4", label: "Class 4" },
];

type Address = {
  addressLine1: string;
  addressLine2: string;
  pinCode: string;
  city: string;
  state: string;
};

type FormValues = {
  orgId: number | string | undefined;

  classId: string | undefined;

  firstName: string;
  middleName: string;
  lastName: string;
  initials: string;

  phone: string;
  secondaryPhone: string;
  aadharNo: string;
  email: string;

  profilePicture: string; // base64

  permanantAddress: Address;
  isCommunicationAddressSameAsPermanant: boolean;
  communicationAddress: Address;

  previousSchoolName: string;
  previousSchoolAddress: string;

  fatherName: string;
  fatherPhone: string;
  fatherSecondaryPhone: string;
  fatherAadharNo: string;
  fatherEmail: string;

  motherName: string;
  motherPhone: string;
  motherSecondaryPhone: string;
  motherAadharNo: string;
  motherEmail: string;

  dob: string; // "YYYY-MM-DD"
  religion: string;
  cateogry: string;

  contactPersonName: string;
  contactPersonPhone: string;
};

export default function EnrollStudentForm(props: {
  orgId: number;
  orgName?: string;
  brandColor?: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<string>("");

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      orgId: props.orgId,

      classId: undefined,

      firstName: "",
      middleName: "",
      lastName: "",
      initials: "",

      phone: "",
      secondaryPhone: "",
      aadharNo: "",
      email: "",

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

      previousSchoolName: "",
      previousSchoolAddress: "",

      fatherName: "",
      fatherPhone: "",
      fatherSecondaryPhone: "",
      fatherAadharNo: "",
      fatherEmail: "",

      motherName: "",
      motherPhone: "",
      motherSecondaryPhone: "",
      motherAadharNo: "",
      motherEmail: "",

      dob: "",
      religion: "",
      cateogry: "",

      contactPersonName: "",
      contactPersonPhone: "",
    },
  });

  const { control, handleSubmit, setValue } = form;

  const sameAddress = form.watch("isCommunicationAddressSameAsPermanant");
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

  const stateOptions = React.useMemo<DropdownOption[]>(
    () =>
      (Indian_states_cities_list.STATES_OBJECT ?? []).map((s) => ({
        value: s.name,
        label: s.label,
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
      input.value = "";
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
    const classIdNum = Number(v.classId);

    if (!orgIdNum || orgIdNum <= 0) return toast.error("OrgId is required");
    if (!classIdNum || classIdNum <= 0) return toast.error("Class is required");

    setLoading(true);
    const tId = toast.loading("Enrolling student...");

    try {
      const payload = {
        firstName: v.firstName.trim(),
        middleName: v.middleName?.trim() || "",
        lastName: v.lastName.trim(),
        initials: v.initials?.trim() || "",

        phone: v.phone.trim(),
        secondaryPhone: v.secondaryPhone?.trim() || "",
        aadharNo: v.aadharNo?.trim() || "",
        email: v.email?.trim() || "",
        profilePicture: v.profilePicture || null,

        permanantAddress: v.permanantAddress,
        isCommunicationAddressSameAsPermanant:
          v.isCommunicationAddressSameAsPermanant,
        communicationAddress: v.isCommunicationAddressSameAsPermanant
          ? v.permanantAddress
          : v.communicationAddress,

        classId: classIdNum,

        previousSchoolName: v.previousSchoolName?.trim() || "",
        previousSchoolAddress: v.previousSchoolAddress?.trim() || "",

        fatherName: v.fatherName?.trim() || "",
        fatherPhone: v.fatherPhone?.trim() || "",
        fatherSecondaryPhone: v.fatherSecondaryPhone?.trim() || "",
        fatherAadharNo: v.fatherAadharNo?.trim() || "",
        fatherEmail: v.fatherEmail?.trim() || "",

        motherName: v.motherName?.trim() || "",
        motherPhone: v.motherPhone?.trim() || "",
        motherSecondaryPhone: v.motherSecondaryPhone?.trim() || "",
        motherAadharNo: v.motherAadharNo?.trim() || "",
        motherEmail: v.motherEmail?.trim() || "",

        dob: v.dob || null, // "YYYY-MM-DD"
        religion: v.religion?.trim() || null,
        cateogry: v.cateogry?.trim() || null,

        contactPersonName: v.contactPersonName?.trim() || null,
        contactPersonPhone: v.contactPersonPhone?.trim() || null,
      };

      const res = await enrollStudent({ orgId: orgIdNum, payload });

      if (!res?.status) {
        throw new Error(res?.message || "Enroll failed");
      }

      toast.success(res?.message || "Student enrolled", { id: tId });
      form.reset({ ...form.getValues(), profilePicture: "" });
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
          <CardTitle className="text-xl">Enroll Student</CardTitle>
          {props.orgName ? (
            <p className="text-sm text-muted-foreground">
              Organization:{" "}
              <span className="font-medium text-foreground">
                {props.orgName}
              </span>
            </p>
          ) : null}
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8" noValidate>
            {/* Org + Class */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                control={control}
                name="orgId"
                label="Org ID"
                placeholder={props.orgName || "Org"}
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
                  name="classId"
                  rules={{ required: "Class is required" }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <DropdownFilter
                        label="Class"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select class"
                        options={CLASS_OPTIONS}
                        className={cn(
                          "h-11 py-5 rounded-2xl",
                          fieldState.invalid && "border border-red-500",
                        )}
                        allowClear={false}
                      />
                      {fieldState.invalid && (
                        <p className="text-xs text-red-600">
                          {fieldState.error?.message ?? "Class is required"}
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
                  rules={{ required: "First name is required" }}
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
                  rules={{ required: "Last name is required" }}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField
                  control={control}
                  name="initials"
                  label="Initials"
                  placeholder="e.g. VM"
                  className="h-11 rounded-2xl"
                  leftIcon={<GraduationCap className="h-4 w-4" />}
                />
                <InputField
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="name@domain.com"
                  className="h-11 rounded-2xl"
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                <InputField
                  control={control}
                  name="dob"
                  label="DOB"
                  type="date"
                  className="h-11 rounded-2xl"
                  leftIcon={<CalendarDays className="h-4 w-4" />}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <InputField
                  control={control}
                  name="aadharNo"
                  label="Aadhar No"
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
                      width={56}
                      height={56}
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
                    name="permanantAddress.state"
                    rules={{ required: "State is required" }}
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
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
                            {fieldState.error?.message ?? "State is required"}
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
                color={props.brandColor}
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
            )}

            <Separator />

            {/* Previous school */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-900">
                Previous School (Optional)
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  control={control}
                  name="previousSchoolName"
                  label="School Name"
                  className="h-11 rounded-2xl"
                  placeholder="Optional"
                />
                <InputField
                  control={control}
                  name="previousSchoolAddress"
                  label="School Address"
                  className="h-11 rounded-2xl"
                  placeholder="Optional"
                />
              </div>
            </div>

            <Separator />

            {/* Parents */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-900">
                Parent Details (Optional)
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  control={control}
                  name="fatherName"
                  label="Father Name"
                  className="h-11 rounded-2xl"
                />
                <InputField
                  control={control}
                  name="motherName"
                  label="Mother Name"
                  className="h-11 rounded-2xl"
                />
                <InputField
                  control={control}
                  name="fatherPhone"
                  label="Father Phone"
                  className="h-11 rounded-2xl"
                />
                <InputField
                  control={control}
                  name="motherPhone"
                  label="Mother Phone"
                  className="h-11 rounded-2xl"
                />
                <InputField
                  control={control}
                  name="fatherEmail"
                  label="Father Email"
                  className="h-11 rounded-2xl"
                />
                <InputField
                  control={control}
                  name="motherEmail"
                  label="Mother Email"
                  className="h-11 rounded-2xl"
                />
              </div>
            </div>

            <Separator />

            {/* Other */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                control={control}
                name="religion"
                label="Religion"
                className="h-11 rounded-2xl"
              />
              <InputField
                control={control}
                name="cateogry"
                label="Category"
                className="h-11 rounded-2xl"
              />
              <InputField
                control={control}
                name="contactPersonPhone"
                label="Emergency Contact Phone"
                className="h-11 rounded-2xl"
              />
            </div>

            <ActionButton
              type="submit"
              color={props.brandColor}
              loading={loading}
              disabled={loading}
              className="h-11 w-full rounded-2xl"
            >
              Enroll Student
            </ActionButton>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
