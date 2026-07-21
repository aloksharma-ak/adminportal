"use server";

import { parseError, reqMeta, requireUrl } from "@/lib/api-client";

const FILE_API_URL = process.env.FILE_MANAGEMENT_API_URL;

export type UploadedFile = {
  internalFileName: string;
  userFileName: string;
  fileId: number;
  isSuccess: boolean;
  message: string | null;
};

export type DownloadedFile = UploadedFile & {
  fileSize: number;
  fileType: string;
  contentType: string;
  documentTypeName: string;
  moduleId: number;
  base64Content: string;
};

type FileResponse<T> = {
  status: boolean;
  message: string;
  data: { files: T[] };
};

export async function uploadDocuments(formData: FormData) {
  const base = requireUrl(FILE_API_URL, "FILE_MANAGEMENT_API_URL");
  const userId = Number(formData.get("UserId"));
  const meta = await reqMeta(userId);
  formData.set("RequestGuid", meta.requestGuid);
  formData.set("RequestTime", meta.requestTime);

  const response = await fetch(`${base}/api/Files/Upload`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<FileResponse<UploadedFile>>;
}

export async function downloadDocuments(params: {
  orgId: number;
  moduleId: number;
  userId?: number;
  documentTypeName: string;
  files: string[];
}) {
  const base = requireUrl(FILE_API_URL, "FILE_MANAGEMENT_API_URL");
  const response = await fetch(`${base}/api/Files/Download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      ...(await reqMeta(params.userId)),
      orgId: params.orgId,
      moduleId: params.moduleId,
      documentTypeName: params.documentTypeName,
      files: params.files,
    }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<FileResponse<DownloadedFile>>;
}
