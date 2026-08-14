import { compressImageForUpload } from "@/lib/images/compress-image";
import { validateStaffPhotoFile } from "@/lib/staff/staff-photo-storage";

export class StaffProfilePhotoClientError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "StaffProfilePhotoClientError";
    this.code = code;
  }
}

export async function uploadStaffProfilePhotoFromTeacher(
  organizationId: string,
  file: File,
): Promise<string> {
  validateStaffPhotoFile(file);

  const prepared = await compressImageForUpload(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.82,
    skipBelowBytes: 80 * 1024,
  });

  const formData = new FormData();
  formData.append("organizationId", organizationId);
  formData.append("file", prepared);

  const response = await fetch("/api/teacher-portal/profile-photo", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { profilePhotoUrl?: string; error?: string; code?: string }
    | null;

  if (!response.ok) {
    throw new StaffProfilePhotoClientError(
      payload?.error ?? "Failed to upload photo.",
      payload?.code ?? "upload_failed",
    );
  }

  const profilePhotoUrl = payload?.profilePhotoUrl?.trim();
  if (!profilePhotoUrl) {
    throw new StaffProfilePhotoClientError(
      "Upload succeeded but no photo URL was returned.",
      "missing_url",
    );
  }

  return profilePhotoUrl;
}
