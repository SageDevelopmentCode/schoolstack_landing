import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import {
  listFamilyChildrenForHome,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import type { ParentFridayBranchStudentOption } from "./types";

export class ParentFridayBranchAuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ParentFridayBranchAuthError";
    this.status = status;
    this.code = code;
  }
}

export async function requireParentFridayBranchAccess(
  supabase: SupabaseClient,
  user: User,
  organizationId: string,
): Promise<{ familyId: string; studentOptions: ParentFridayBranchStudentOption[] }> {
  const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
  if (!hasAccess) {
    throw new ParentFridayBranchAuthError(
      "You do not have access to the parent portal.",
      403,
      "forbidden",
    );
  }

  const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
  const familyId = familyIds[0];
  if (!familyId) {
    throw new ParentFridayBranchAuthError("Family not found.", 404, "not_found");
  }

  const familyChildren = await listFamilyChildrenForHome(supabase, organizationId, user.id);
  const studentOptions = familyChildren
    .filter((child) => child.studentId)
    .map((child) => ({
      id: child.studentId!,
      name: child.studentName,
    }));

  return { familyId, studentOptions };
}
