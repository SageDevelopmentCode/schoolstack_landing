import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { canManageGalleryPhoto } from "./gallery-access";
import { GalleryError } from "./gallery-errors";
import { getGalleryPhotoForOrg } from "./photos";
import type { GalleryPhoto } from "./types";

export function displayNameFromAuthUser(user: User): string {
  const metadata = user.user_metadata ?? {};
  const firstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const lastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name.trim() : "";
  const combined = [firstName, lastName].filter(Boolean).join(" ");
  if (combined) return combined;
  if (fullName) return fullName;
  const email = user.email?.split("@")?.[0]?.trim();
  return email || "Account";
}

export async function assertCanManageGalleryPhoto(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
  userId: string,
  isOrgAdmin: boolean,
): Promise<GalleryPhoto> {
  const photo = await getGalleryPhotoForOrg(supabase, organizationId, photoId);
  if (!photo) {
    throw new GalleryError("Photo not found.", "not_found", 404);
  }

  if (
    !canManageGalleryPhoto({
      isOrgAdmin,
      userId,
      photo,
    })
  ) {
    throw new GalleryError(
      "You do not have permission to manage this photo.",
      "forbidden",
      403,
    );
  }

  return photo;
}
