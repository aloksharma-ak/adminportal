"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import Indian_states_cities_list from "indian-states-cities-list";
import { toast } from "sonner";
import { User2, Mail, Phone, ImageIcon, MapPin, GraduationCap, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

import { InputField } from "@/components/controls/InputField";
import { DropdownFilter, type DropdownOption } from "@/components/controls/DropdownFilter";
import { ToggleControl } from "@/components/controls/ToggleControl";
import { ActionButton } from "@/components/controls/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fileToBase64, toImageSrc } from "@/lib/image-session.client";
import { enrollStudent } from "@/app/dashboard/admission/action";
import type { StudentDetail } from "@/components/admission/student-details";

const MAX_IMAGE_BYTES = 500 * 1024;

type Address = { addressLine1: string; addressLine2: string; pinCode: string; city: string; state: string };

type FormValues = {
  orgId: number;
  classId: string;
  firstName: string; middleName: string; lastName: string; initials: string;
  phone: string; secondaryPhone: string; aadharNo: string; email: string;
  profilePicture: string;
  permanantAddress: Address;
  isCommunicationAddressSameAsPermanant: boolean;
  communicationAddress: Address;
  previousSchoolName: string; previousSchoolAddress: string;
  fatherName: string; fatherPhone: string; fatherSecondaryPhone: string; fatherAadharNo: string; fatherEmail: string;
  motherName: string; motherPhone: string; motherSecondaryPhone: string; motherAadharNo: string; motherEmail: string;
  dob: string; religion: string; cateogry: string;
  contactPersonName: string; contactPersonPhone: string;
};

const trim = (v?: string) => (v ?? "").trim();
const onlyDigits = (v?: string) => (v ?? "").replace(/\D/g, "");
const EMPTY_ADDR: Address = { addressLine1: "", addressLine2: "", pinCode: "", city: "", state: "" };

type Props = {
  orgId: number;
  orgName?: string;
  brandColor?: string;
  classOptions?: { classId: number; className: string }[];
  categoryOptions?: string[];
  studentId?: number;
  defaultValues?: StudentDetail;
};

function addrFromStudent(a?: { addressLine1?: string; addressLine2?: string; pinCode?: string; city?: string; state?: string } | null): Address {
  return {
    addressLine1: a?.addressLine1 ?? "",
    addressLine2: a?.addressLine2 ?? "",
    pinCode: a?.pinCode ?? "",
    city: a?.city ?? "",
    state: a?.state ?? "",
  };
}

export default function EnrollStudentForm({ orgId, orgName, brandColor, classOptions = [], categoryOptions = [], studentId = 0, defaultValues }: Props) {
  const router = useRouter();
  const isEditing = studentId > 0;
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<string>(
    toImageSrc(defaultValues?.profilePicture) ?? "",
  );

  const classDropdownOptions: DropdownOption[] = classOptions.map((c) => ({
    value: String(c.classId),
    label: c.className,
  }));
  const hasClassOptions = classDropdownOptions.length > 0;

  const permAddr = addrFromStudent(defaultValues?.permanantAddress ?? defaultValues?.permanentAddress);
  const commAddr = addrFromStudent(defaultValues?.communicationAddress);

  const getEnrolledClassId = (): string => {
    if (!defaultValues?.enrolledClass) return "";
    if (typeof defaultValues.enrolledClass === "string") return defaultValues.enrolledClass;
    return String((defaultValues.enrolledClass as { classId?: number }).classId ?? "");
  };

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      orgId,
      classId: getEnrolledClassId(),
      firstName: defaultValues?.firstName ?? "",
      middleName: defaultValues?.middleName ?? "",
      lastName: defaultValues?.lastName ?? "",
      initials: defaultValues?.initials ?? "",
      phone: defaultValues?.phone ?? "",
      secondaryPhone: defaultValues?.secondaryPhone ?? "",
      aadharNo: defaultValues?.aadharNo ?? "",
      email: defaultValues?.email ?? "",
      profilePicture: defaultValues?.profilePicture ?? "",
      permanantAddress: permAddr,
      isCommunicationAddressSameAsPermanant: defaultValues?.isCommunicationAddressSameAsPermanant ?? true,
      communicationAddress: commAddr,
      previousSchoolName: defaultValues?.previousSchoolName ?? "",
      previousSchoolAddress: defaultValues?.previousSchoolAddress ?? "",
      fatherName: defaultValues?.fatherContactDetails?.name ?? "",
      fatherPhone: defaultValues?.fatherContactDetails?.phone ?? "",
      fatherSecondaryPhone: defaultValues?.fatherContactDetails?.secondaryPhone ?? "",
      fatherAadharNo: defaultValues?.fatherContactDetails?.aadharNo ?? "",
      fatherEmail: defaultValues?.fatherContactDetails?.email ?? "",
      motherName: defaultValues?.motherContactDetails?.name ?? "",
      motherPhone: defaultValues?.motherContactDetails?.phone ?? "",
      motherSecondaryPhone: defaultValues?.motherContactDetails?.secondaryPhone ?? "",
      motherAadharNo: defaultValues?.motherContactDetails?.aadharNo ?? "",
      motherEmail: defaultValues?.motherContactDetails?.email ?? "",
      dob: defaultValues?.dob ?? "",
      religion: defaultValues?.religion ?? "",
      cateogry: defaultValues?.cateogry ?? defaultValues?.category ?? "",
      contactPersonName: defaultValues?.contactPersonName ?? "",
      contactPersonPhone: defaultValues?.contactPersonPhone ?? "",
    },
  });

  const { control, handleSubmit, setValue, watch } = form;
  const sameAddress = watch("isCommunicationAddressSameAsPermanant");
  const selectedPermState = watch("permanantAddress.state");
  const selectedCommState = watch("communicationAddress.state");
  const p1 = watch("permanantAddress.addressLine1");
  const p2 = watch("permanantAddress.addressLine2");
  const p3 = watch("permanantAddress.pinCode");
  const p4 = watch("permanantAddress.city");
  const p5 = watch("permanantAddress.state");

  React.useEffect(() => {
    if (!sameAddress) return;
    setValue("communicationAddress", { addressLine1: p1, addressLine2: p2, pinCode: p3, city: p4, state: p5 }, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sameAddress, p1, p2, p3, p4, p5, setValue]);

  const stateOptions = React.useMemo<DropdownOption[]>(
    () => (Indian_states_cities_list.STATES_OBJECT ?? []).map((s: any) => ({ value: String(s?.name ?? ""), label: String(s?.label ?? s?.name ?? "") })).filter((x) => x.value && x.label),
    [],
  );

  const getCityOptions = (state: string): DropdownOption[] => {
    if (!state) return [];
    const cities = (Indian_states_cities_list.STATE_WISE_CITIES as any)?.[state] ?? [];
    return cities.map((c: any) =>
      typeof c === "string" ? { value: c, label: c } : { value: String(c?.value ?? c?.name ?? ""), label: String(c?.label ?? c?.name ?? c?.value ?? "") }
    ).filter((x: DropdownOption) => x.value && x.label);
  };

  const permCityOptions = React.useMemo(() => getCityOptions(selectedPermState), [selectedPermState]);
  const commCityOptions = React.useMemo(() => getCityOptions(selectedCommState), [selectedCommState]);

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select a valid image file"); e.currentTarget.value = ""; return; }
    if (file.size > MAX_IMAGE_BYTES) { toast.error("Image must be under 500 KB"); e.currentTarget.value = ""; return; }
    try {
      const { dataUrl, base64 } = await fileToBase64(file);
      setPreview(dataUrl);
      setValue("profilePicture", base64, { shouldDirty: true });
    } catch { toast.error("Unable to process image"); }
    finally { e.currentTarget.value = ""; }
  };

  const categoryDropdownOptions: DropdownOption[] = categoryOptions.map((c) => ({
    value: c,
    label: c,
  }));

  const onSubmit = handleSubmit(async (v) => {
    const orgIdNum = Number(orgId || v.orgId);
    const classIdNum = Number(trim(v.classId));
    if (!orgIdNum || orgIdNum <= 0) return toast.error("OrgId is required");
    if (!trim(v.classId)) return toast.error("Class is required");
    if (!Number.isInteger(classIdNum) || classIdNum < 0) return toast.error("Class ID must be 0 or greater");

    setLoading(true);
    const tId = toast.loading(isEditing ? "Updating student..." : "Enrolling student...");
    try {
      const payload = {
        id: isEditing ? studentId : 0,
        orgId: orgIdNum,
        classId: classIdNum,
        firstName: trim(v.firstName), middleName: trim(v.middleName), lastName: trim(v.lastName), initials: trim(v.initials),
        phone: onlyDigits(v.phone), secondaryPhone: onlyDigits(v.secondaryPhone), aadharNo: onlyDigits(v.aadharNo),
        email: trim(v.email) || null, profilePicture: v.profilePicture || null,
        permanantAddress: { addressLine1: trim(v.permanantAddress.addressLine1), addressLine2: trim(v.permanantAddress.addressLine2), pinCode: onlyDigits(v.permanantAddress.pinCode), city: trim(v.permanantAddress.city), state: trim(v.permanantAddress.state) },
        isCommunicationAddressSameAsPermanant: v.isCommunicationAddressSameAsPermanant,
        communicationAddress: v.isCommunicationAddressSameAsPermanant
          ? { addressLine1: trim(v.permanantAddress.addressLine1), addressLine2: trim(v.permanantAddress.addressLine2), pinCode: onlyDigits(v.permanantAddress.pinCode), city: trim(v.permanantAddress.city), state: trim(v.permanantAddress.state) }
          : { addressLine1: trim(v.communicationAddress.addressLine1), addressLine2: trim(v.communicationAddress.addressLine2), pinCode: onlyDigits(v.communicationAddress.pinCode), city: trim(v.communicationAddress.city), state: trim(v.communicationAddress.state) },
        previousSchoolName: trim(v.previousSchoolName), previousSchoolAddress: trim(v.previousSchoolAddress),
        fatherName: trim(v.fatherName), fatherPhone: onlyDigits(v.fatherPhone), fatherSecondaryPhone: onlyDigits(v.fatherSecondaryPhone), fatherAadharNo: onlyDigits(v.fatherAadharNo), fatherEmail: trim(v.fatherEmail) || null,
        motherName: trim(v.motherName), motherPhone: onlyDigits(v.motherPhone), motherSecondaryPhone: onlyDigits(v.motherSecondaryPhone), motherAadharNo: onlyDigits(v.motherAadharNo), motherEmail: trim(v.motherEmail) || null,
        dob: v.dob || null, religion: trim(v.religion) || null, cateogry: trim(v.cateogry) || null,
        contactPersonName: trim(v.contactPersonName) || null, contactPersonPhone: onlyDigits(v.contactPersonPhone),
      };

      const res = await enrollStudent({ payload });
      if (!res?.status) throw new Error(res?.message || "Failed");
      toast.success(res?.message || (isEditing ? "Student updated!" : "Student enrolled!"), { id: tId });
      if (isEditing) {
        router.push(`/dashboard/admission/${studentId}`);
        router.refresh();
      } else {
        form.reset({ ...form.getValues(), classId: "", firstName: "", middleName: "", lastName: "", initials: "", phone: "", secondaryPhone: "", aadharNo: "", email: "", profilePicture: "", permanantAddress: { ...EMPTY_ADDR }, isCommunicationAddressSameAsPermanant: true, communicationAddress: { ...EMPTY_ADDR }, previousSchoolName: "", previousSchoolAddress: "", fatherName: "", fatherPhone: "", fatherSecondaryPhone: "", fatherAadharNo: "", fatherEmail: "", motherName: "", motherPhone: "", motherSecondaryPhone: "", motherAadharNo: "", motherEmail: "", dob: "", religion: "", cateogry: "", contactPersonName: "", contactPersonPhone: "" });
        setPreview("");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong", { id: tId });
    } finally { setLoading(false); }
  });

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Card className="rounded-3xl border-slate-200/70 dark:border-slate-700/70">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Student" : "Enroll Student"}</CardTitle>
          {orgName && <p className="text-sm text-slate-500">Organisation: <span className="font-medium text-slate-900 dark:text-slate-100">{orgName}</span></p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8" noValidate>
            {/* Class */}
            {hasClassOptions ? (
              <Controller
                control={control}
                name="classId"
                rules={{ required: "Class is required" }}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <DropdownFilter
                      label="Class"
                      value={field.value ?? ""}
                      onChange={(val) => field.onChange(val)}
                      placeholder="Select class"
                      options={classDropdownOptions}
                      className={cn(
                        "h-11 rounded-2xl",
                        fieldState.invalid && "border-red-500"
                      )}
                      allowClear={false}
                    />

                    {fieldState.error && (
                      <p className="text-xs text-red-600">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            ) : (
              <InputField control={control} name="classId" label="Class ID" placeholder="e.g. 6" className="h-11 rounded-2xl" leftIcon={<GraduationCap className="h-4 w-4" />}
                rules={{ required: "Class ID is required", validate: (v) => { const n = Number(String(v ?? "").trim()); return (Number.isInteger(n) && n >= 0) ? true : "Class ID must be a non-negative integer"; } }}
              />
            )}

            <Separator />

            {/* Student Info */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Student Details</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField control={control} name="firstName" label="First Name" placeholder="First name" className="h-11 rounded-2xl" leftIcon={<User2 className="h-4 w-4" />} rules={{ required: "First name is required" }} />
                <InputField control={control} name="middleName" label="Middle Name" placeholder="Optional" className="h-11 rounded-2xl" />
                <InputField control={control} name="lastName" label="Last Name" placeholder="Last name" className="h-11 rounded-2xl" rules={{ required: "Last name is required" }} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField control={control} name="initials" label="Initials" placeholder="e.g. VM" className="h-11 rounded-2xl" leftIcon={<GraduationCap className="h-4 w-4" />} />
                <InputField control={control} name="email" label="Email" placeholder="name@domain.com" className="h-11 rounded-2xl" leftIcon={<Mail className="h-4 w-4" />} />
                <InputField control={control} name="dob" label="Date of Birth" type="date" className="h-11 rounded-2xl" leftIcon={<CalendarDays className="h-4 w-4" />} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField control={control} name="phone" label="Phone" placeholder="0123456789" className="h-11 rounded-2xl" leftIcon={<Phone className="h-4 w-4" />} rules={{ required: "Phone is required" }} />
                <InputField control={control} name="secondaryPhone" label="Secondary Phone" placeholder="Optional" className="h-11 rounded-2xl" />
                <InputField control={control} name="aadharNo" label="Aadhar No" placeholder="Optional" className="h-11 rounded-2xl" />
              </div>

              {/* Profile Pic */}
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
                    <ImageIcon className="h-3.5 w-3.5" />Upload
                    <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Permanent Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Permanent Address</p>
                <MapPin className="h-4 w-4 text-slate-400" />
              </div>
              <AddressBlock prefix="permanantAddress" control={control} setValue={setValue} selectedState={selectedPermState} stateOptions={stateOptions} cityOptions={permCityOptions} />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Communication address same as permanent</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Turn off to enter a different communication address</p>
              </div>
              <ToggleControl color={brandColor} label="" checked={sameAddress} onChange={(v) => setValue("isCommunicationAddressSameAsPermanant", v)} />
            </div>

            {!sameAddress && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Communication Address</p>
                <AddressBlock prefix="communicationAddress" control={control} setValue={setValue} selectedState={selectedCommState} stateOptions={stateOptions} cityOptions={commCityOptions} />
              </div>
            )}

            <Separator />

            {/* Previous School */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Previous School (Optional)</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField control={control} name="previousSchoolName" label="School Name" placeholder="Optional" className="h-11 rounded-2xl" />
                <InputField control={control} name="previousSchoolAddress" label="School Address" placeholder="Optional" className="h-11 rounded-2xl" />
              </div>
            </div>

            <Separator />

            {/* Parents */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Parent Details (Optional)</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField control={control} name="fatherName" label="Father's Name" className="h-11 rounded-2xl" />
                <InputField control={control} name="motherName" label="Mother's Name" className="h-11 rounded-2xl" />
                <InputField control={control} name="fatherPhone" label="Father's Phone" className="h-11 rounded-2xl" />
                <InputField control={control} name="motherPhone" label="Mother's Phone" className="h-11 rounded-2xl" />
                <InputField control={control} name="fatherEmail" label="Father's Email" className="h-11 rounded-2xl" />
                <InputField control={control} name="motherEmail" label="Mother's Email" className="h-11 rounded-2xl" />
                <InputField control={control} name="fatherAadharNo" label="Father's Aadhar" className="h-11 rounded-2xl" />
                <InputField control={control} name="motherAadharNo" label="Mother's Aadhar" className="h-11 rounded-2xl" />
              </div>
            </div>

            <Separator />

            {/* Additional */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InputField control={control} name="religion" label="Religion" className="h-11 rounded-2xl" />
              <Controller
                control={control}
                name="cateogry"
                render={({ field }) => (
                  <DropdownFilter
                    label="Category"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Category"
                    options={categoryDropdownOptions}
                    className="h-11 rounded-2xl"
                    allowClear
                  />
                )}
              />
              <InputField control={control} name="contactPersonName" label="Emergency Contact Name" className="h-11 rounded-2xl" />
              <InputField control={control} name="contactPersonPhone" label="Emergency Contact Phone" className="h-11 rounded-2xl" />
            </div>

            <ActionButton type="submit" color={brandColor} loading={loading} disabled={loading} className="h-11 w-full rounded-2xl">
              {loading ? (isEditing ? "Updating..." : "Enrolling...") : (isEditing ? "Save Changes" : "Enroll Student")}
            </ActionButton>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function AddressBlock({ prefix, control, setValue, selectedState, stateOptions, cityOptions }: {
  prefix: "permanantAddress" | "communicationAddress";
  control: any; setValue: any; selectedState: string;
  stateOptions: DropdownOption[]; cityOptions: DropdownOption[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <InputField control={control} name={`${prefix}.addressLine1`} label="Address Line 1" placeholder="House no, street" className="h-11 rounded-2xl" rules={{ required: "Address Line 1 is required" }} />
      <InputField control={control} name={`${prefix}.addressLine2`} label="Address Line 2" placeholder="Optional" className="h-11 rounded-2xl" />
      <InputField control={control} name={`${prefix}.pinCode`} label="Pin Code" placeholder="e.g. 110001" className="h-11 rounded-2xl" rules={{ required: "Pin code is required" }} />
      <div className="flex gap-4">
        <Controller control={control} name={`${prefix}.state`} rules={{ required: "State is required" }}
          render={({ field, fieldState }) => (
            <div className="flex-1 space-y-1.5">
              <DropdownFilter label="State" value={field.value} onChange={(val) => { field.onChange(val); setValue(`${prefix}.city`, ""); }} placeholder="Select State" options={stateOptions} className={cn("h-11 py-5 rounded-2xl", fieldState.invalid && "border-red-500")} allowClear={false} />
              {fieldState.invalid && <p className="text-xs text-red-600">{fieldState.error?.message}</p>}
            </div>
          )}
        />
        <Controller control={control} name={`${prefix}.city`} rules={{ required: "City is required" }}
          render={({ field, fieldState }) => (
            <div className="flex-1 space-y-1.5">
              <DropdownFilter label="City" value={field.value} onChange={field.onChange} placeholder={selectedState ? "Select City" : "Select state first"} options={cityOptions} className={cn("h-11 py-5 rounded-2xl", fieldState.invalid && "border-red-500")} allowClear={false} />
              {fieldState.invalid && <p className="text-xs text-red-600">{fieldState.error?.message}</p>}
            </div>
          )}
        />
      </div>
    </div>
  );
}
