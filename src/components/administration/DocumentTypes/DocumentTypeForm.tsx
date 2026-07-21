"use client";

import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { InputField } from "@/components/controls/InputField";
import { ToggleControl } from "@/components/controls/ToggleControl";
import { ActionButton } from "@/components/controls/Buttons";
import { Card, CardContent } from "@/components/ui/Card";
import { modifyDocumentType, type DocumentType } from "@/app/dashboard/administration/actions";
import { getErrorMessage } from "@/app/dashboard/utils";

export default function DocumentTypeForm({ orgId, defaultValues, brandColor }: { orgId: number; defaultValues?: DocumentType; brandColor?: string | null }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<DocumentType>({ defaultValues: defaultValues ?? { id: 0, orgId, documentType: "", moduleId: 0, isActive: true } });
  const submit = handleSubmit(async (values) => {
    const toastId = toast.loading(defaultValues ? "Updating document type…" : "Adding document type…");
    try {
      const res = await modifyDocumentType({ payload: { ...values, orgId, moduleId: Number(values.moduleId) }, userId: session?.user?.profileId });
      if (!res.status) throw new Error(res.message);
      toast.success(res.message || "Document type saved", { id: toastId });
      router.push("/dashboard/administration/document-types"); router.refresh();
    } catch (error) { toast.error(getErrorMessage(error), { id: toastId }); }
  });
  return <Card><CardContent className="pt-6"><form onSubmit={submit} className="space-y-6"><div className="grid gap-4 md:grid-cols-2"><InputField control={control} name="documentType" label="Document Type Name" rules={{ required: "Document type name is required" }} /><InputField control={control} name="moduleId" type="number" label="Module ID" rules={{ required: "Module ID is required", min: { value: 1, message: "Select a valid module" } }} /></div><Controller control={control} name="isActive" render={({ field }) => <ToggleControl label="Is Active" checked={field.value} onChange={field.onChange} color={brandColor ?? undefined} />} /><ActionButton type="submit" loading={isSubmitting} color={brandColor ?? undefined}>Save Document Type</ActionButton></form></CardContent></Card>;
}
