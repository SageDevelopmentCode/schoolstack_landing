import type { SupabaseClient } from "@supabase/supabase-js";
import type { GalleryPhoto } from "./types";

function staffDisplayName(row: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string | null {
  const first = String(row.first_name ?? "").trim();
  const last = String(row.last_name ?? "").trim();
  const full = [first, last].filter(Boolean).join(" ");
  if (full) return full;
  const email = String(row.email ?? "").trim();
  return email || null;
}

export async function loadGalleryUploaderNames(
  supabase: SupabaseClient,
  organizationId: string,
  userIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const result = new Map<string, string>();
  if (uniqueIds.length === 0) return result;

  const { data, error } = await supabase
    .from("staff_members")
    .select("user_id, first_name, last_name, email")
    .eq("organization_id", organizationId)
    .in("user_id", uniqueIds);

  if (error) throw error;

  for (const row of data ?? []) {
    if (!row.user_id) continue;
    const name = staffDisplayName(row);
    if (name) {
      result.set(String(row.user_id), name);
    }
  }

  return result;
}

export async function attachUploaderNamesToGalleryPhotos(
  supabase: SupabaseClient,
  organizationId: string,
  photos: GalleryPhoto[],
): Promise<GalleryPhoto[]> {
  const userIds = photos
    .map((photo) => photo.uploadedBy)
    .filter((id): id is string => Boolean(id));

  const nameByUserId = await loadGalleryUploaderNames(
    supabase,
    organizationId,
    userIds,
  );

  return photos.map((photo) => ({
    ...photo,
    uploadedByName: photo.uploadedBy
      ? nameByUserId.get(photo.uploadedBy)
      : undefined,
  }));
}
