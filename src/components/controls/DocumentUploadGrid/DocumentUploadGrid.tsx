"use client";

import * as React from "react";
import { Download, FilePlus2, Loader2, Plus, Upload, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  downloadDocuments,
  uploadDocuments,
  type UploadedFile,
} from "@/app/dashboard/administration/document-types/actions";
import { Button } from "@/components/ui/Button";

export type DocumentUploadRow = { documentTypeName: string; files: UploadedFile[]; status: "Success" | "Failed" | "Partial Success"; remarks: string };

export default function DocumentUploadGrid({ orgId, moduleId, documentTypes, value = [], onChange }: { orgId: number; moduleId: number; documentTypes: string[]; value?: DocumentUploadRow[]; onChange?: (rows: DocumentUploadRow[]) => void }) {
  const { data: session } = useSession();
  const [type, setType] = React.useState(documentTypes[0] ?? "");
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setFiles((current) => {
      const byIdentity = new Map(
        current.map((file) => [
          `${file.name}-${file.size}-${file.lastModified}`,
          file,
        ]),
      );
      Array.from(selectedFiles).forEach((file) => {
        byIdentity.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      });
      return Array.from(byIdentity.values());
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  };
  const upload = async () => {
    if (!type || !files.length) return toast.error("Select a document type and files");
    setUploading(true);
    try {
      const body = new FormData(); body.set("OrgId", String(orgId)); body.set("ModuleId", String(moduleId)); body.set("UserId", String(session?.user?.profileId ?? 0)); body.set("DocumentTypeName", type);
      files.forEach((file, index) => { body.set(`Files[${index}].Name`, file.name); body.set(`Files[${index}].File`, file); });
      const response = await uploadDocuments(body); const uploaded = response.data?.files ?? [];
      const successCount = uploaded.filter((file) => file.isSuccess).length;
      const status = successCount === uploaded.length ? "Success" : successCount ? "Partial Success" : "Failed";
      onChange?.([...value, { documentTypeName: type, files: uploaded, status, remarks: uploaded.filter((f) => !f.isSuccess).map((f) => f.message).filter(Boolean).join(", ") }]); setFiles([]); toast.success(response.message);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed"); } finally { setUploading(false); }
  };
  const download = async (row: DocumentUploadRow) => {
    const response = await downloadDocuments({ orgId, moduleId, userId: session?.user?.profileId, documentTypeName: row.documentTypeName, files: row.files.map((f) => f.internalFileName) });
    response.data.files.forEach((file) => { if (!file.isSuccess) return; const anchor = document.createElement("a"); anchor.href = `data:${file.contentType};base64,${file.base64Content}`; anchor.download = file.userFileName; anchor.click(); });
  };
  return <div className="space-y-3 rounded-2xl border p-4"><div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"><select className="rounded-md border bg-background px-3" value={type} onChange={(e) => setType(e.target.value)}>{documentTypes.map((item) => <option key={item}>{item}</option>)}</select><div><input ref={fileInputRef} className="sr-only" id="document-files" type="file" multiple onChange={(e) => addFiles(e.target.files)} /><Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}><FilePlus2 className="mr-2 h-4 w-4" />Select multiple files</Button></div><Button type="button" onClick={upload} disabled={uploading || files.length === 0}>{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload {files.length > 0 ? `(${files.length})` : ""}</Button></div>{files.length > 0 && <div className="rounded-xl bg-muted/50 p-3"><p className="mb-2 text-sm font-medium">{files.length} file{files.length === 1 ? "" : "s"} selected</p><div className="flex flex-wrap gap-2">{files.map((file, index) => <span key={`${file.name}-${file.lastModified}`} className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs">{file.name}<button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}><X className="h-3 w-3" /></button></span>)}</div></div>}<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th>Document Type</th><th>Document</th><th>Status</th><th>Remarks</th><th>Download</th></tr></thead><tbody>{value.map((row, index) => <tr key={`${row.documentTypeName}-${index}`} className="border-b"><td>{row.documentTypeName}</td><td>{row.files.map((f) => f.userFileName).join(", ")}</td><td>{row.status}</td><td>{row.remarks || "—"}</td><td><Button type="button" variant="ghost" size="icon" onClick={() => download(row)}><Download className="h-4 w-4" /></Button></td></tr>)}</tbody></table></div>{!value.length && <p className="text-sm text-muted-foreground"><Plus className="mr-1 inline h-4 w-4" />No documents uploaded</p>}</div>;
}
