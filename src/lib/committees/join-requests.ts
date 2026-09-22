import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import type { ActorType, ActivitySurface } from "@/lib/activity-log";
import type { CommitteeJoinRequest, CommitteeJoinRequestStatus, CommitteeRole } from "./types";
import {
  sendCommitteeJoinApprovedNotifications,
  sendCommitteeJoinDeclinedNotifications,
  sendCommitteeJoinRequestedNotifications,
  sendCommitteeJoinWithdrawnNotifications,
} from "./committee-notifications";
import { getCommitteeJoinRequestDisplayName } from "./join-request-display";

export { getCommitteeJoinRequestDisplayName } from "./join-request-display";

export type CommitteeJoinRequestRow = {
  id: string;
  organization_id: string;
  committee_id: string;
  user_id: string;
  guardian_id: string | null;
  staff_member_id: string | null;
  preferred_duty_role_id: string | null;
  grade: string | null;
  note: string | null;
  status: CommitteeJoinRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  committees?: { name: string } | { name: string }[] | null;
  guardians?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }[] | null;
  staff_members?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  }[] | null;
  committee_duty_roles?: { title: string } | { title: string }[] | null;
};

function mapJoinRequestRow(row: CommitteeJoinRequestRow): CommitteeJoinRequest {
  const committee = Array.isArray(row.committees) ? row.committees[0] : row.committees;
  const guardian = Array.isArray(row.guardians) ? row.guardians[0] : row.guardians;
  const staffMember = Array.isArray(row.staff_members)
    ? row.staff_members[0]
    : row.staff_members;
  const dutyRole = Array.isArray(row.committee_duty_roles)
    ? row.committee_duty_roles[0]
    : row.committee_duty_roles;

  const guardianName = guardian
    ? [guardian.first_name, guardian.last_name].filter(Boolean).join(" ").trim() || null
    : null;
  const staffName = staffMember
    ? [staffMember.first_name, staffMember.last_name].filter(Boolean).join(" ").trim() || null
    : null;

  return {
    id: row.id,
    organizationId: row.organization_id,
    committeeId: row.committee_id,
    userId: row.user_id,
    guardianId: row.guardian_id,
    staffMemberId: row.staff_member_id,
    preferredDutyRoleId: row.preferred_duty_role_id,
    grade: row.grade,
    note: row.note,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    committeeName: committee?.name ?? undefined,
    guardianName: guardianName ?? undefined,
    guardianEmail: guardian?.email ?? undefined,
    staffName: staffName ?? undefined,
    staffEmail: staffMember?.email ?? undefined,
    requesterType: row.staff_member_id ? "staff" : "parent",
    preferredDutyRoleTitle: dutyRole?.title ?? null,
  };
}

const JOIN_REQUEST_SELECT = `
  *,
  committees (name),
  guardians (first_name, last_name, email),
  staff_members (first_name, last_name, email),
  committee_duty_roles (title)
`;

type ActiveCommitteeContext = {
  id: string;
  name: string;
  organizationId: string;
  schoolName: string;
  schoolSlug: string;
};

async function loadActiveCommitteeForOrg(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
): Promise<ActiveCommitteeContext> {
  const { data: committee, error } = await supabase
    .from("committees")
    .select("id, name, organization_id, status, organizations(name, slug)")
    .eq("id", committeeId)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!committee) throw new Error("Committee not found.");

  const organizationRaw = committee.organizations as
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null
    | undefined;
  const organization = Array.isArray(organizationRaw)
    ? organizationRaw[0] ?? null
    : organizationRaw ?? null;

  if (!organization?.name || !organization.slug) {
    throw new Error("Committee not found.");
  }

  return {
    id: String(committee.id),
    name: committee.name,
    organizationId: String(committee.organization_id),
    schoolName: organization.name,
    schoolSlug: organization.slug,
  };
}

async function assertDutyRoleBelongsToCommittee(
  supabase: SupabaseClient,
  dutyRoleId: string,
  committeeId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("committee_duty_roles")
    .select("id")
    .eq("id", dutyRoleId)
    .eq("committee_id", committeeId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Duty role not found.");
}

export async function listCommitteeJoinRequests(
  supabase: SupabaseClient,
  organizationId: string,
  options?: { committeeId?: string; status?: CommitteeJoinRequestStatus },
): Promise<CommitteeJoinRequest[]> {
  let query = supabase
    .from("committee_join_requests")
    .select(JOIN_REQUEST_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (options?.committeeId) {
    query = query.eq("committee_id", options.committeeId);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as CommitteeJoinRequestRow[]).map(mapJoinRequestRow);
}

export type CreateJoinRequestInput = {
  organizationId: string;
  committeeId: string;
  userId: string;
  preferredDutyRoleId?: string | null;
  grade?: string | null;
  note?: string | null;
  requesterType: "parent" | "staff";
  guardianId?: string | null;
  guardianName?: string;
  guardianEmail?: string;
  staffMemberId?: string | null;
  staffName?: string;
  staffEmail?: string;
};

export async function createCommitteeJoinRequest(
  supabase: SupabaseClient,
  input: CreateJoinRequestInput,
): Promise<CommitteeJoinRequest> {
  const { data: existing, error: existingError } = await supabase
    .from("committee_join_requests")
    .select("id, status")
    .eq("user_id", input.userId)
    .eq("committee_id", input.committeeId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing) {
    throw new Error("You already have a pending request for this committee.");
  }

  const { data: member, error: memberError } = await supabase
    .from("committee_members")
    .select("id")
    .eq("committee_id", input.committeeId)
    .eq("user_id", input.userId)
    .eq("status", "active")
    .maybeSingle();

  if (memberError) throw new Error(memberError.message);
  if (member) {
    throw new Error("You are already a member of this committee.");
  }

  const committee = await loadActiveCommitteeForOrg(
    supabase,
    input.organizationId,
    input.committeeId,
  );

  if (input.preferredDutyRoleId) {
    await assertDutyRoleBelongsToCommittee(
      supabase,
      input.preferredDutyRoleId,
      committee.id,
    );
  }

  const requesterName =
    input.requesterType === "staff"
      ? input.staffName?.trim() || "Staff member"
      : input.guardianName?.trim() || "Parent";
  const requesterEmail =
    input.requesterType === "staff"
      ? input.staffEmail?.trim() || ""
      : input.guardianEmail?.trim() || "";

  const { data, error } = await supabase
    .from("committee_join_requests")
    .insert({
      organization_id: input.organizationId,
      committee_id: input.committeeId,
      user_id: input.userId,
      guardian_id: input.requesterType === "parent" ? (input.guardianId ?? null) : null,
      staff_member_id:
        input.requesterType === "staff" ? (input.staffMemberId ?? null) : null,
      preferred_duty_role_id: input.preferredDutyRoleId ?? null,
      grade: input.requesterType === "parent" ? input.grade?.trim() || null : null,
      note: input.note?.trim() || null,
      status: "pending",
    })
    .select(JOIN_REQUEST_SELECT)
    .single();

  if (error) throw new Error(error.message);

  const request = mapJoinRequestRow(data as CommitteeJoinRequestRow);

  void sendCommitteeJoinRequestedNotifications(supabase, {
    organizationId: input.organizationId,
    requestId: request.id,
    committeeId: committee.id,
    committeeName: committee.name,
    schoolName: committee.schoolName,
    schoolSlug: committee.schoolSlug,
    requesterName,
    requesterEmail,
    requesterType: input.requesterType,
    preferredDutyRoleTitle: request.preferredDutyRoleTitle,
    grade: input.requesterType === "parent" ? (input.grade ?? null) : null,
    note: input.note ?? null,
    actorUserId: input.userId,
  });

  return request;
}

export async function withdrawCommitteeJoinRequest(
  supabase: SupabaseClient,
  input: {
    requestId: string;
    userId: string;
    organizationId: string;
    committeeName: string;
    requesterName: string;
    actorType?: ActorType;
    surface?: ActivitySurface;
  },
): Promise<CommitteeJoinRequest> {
  const actorType = input.actorType ?? "parent";
  const surface = input.surface ?? "parent_portal";

  const { data, error } = await supabase
    .from("committee_join_requests")
    .update({ status: "withdrawn" })
    .eq("id", input.requestId)
    .eq("user_id", input.userId)
    .eq("organization_id", input.organizationId)
    .eq("status", "pending")
    .select(JOIN_REQUEST_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Pending request not found.");

  const request = mapJoinRequestRow(data as CommitteeJoinRequestRow);

  void logActivityEvent(supabase, {
    organizationId: input.organizationId,
    actorType,
    actorUserId: input.userId,
    actorName: input.requesterName,
    surface,
    action: ACTIVITY_ACTIONS.COMMITTEE_JOIN_WITHDRAWN,
    entityType: "committee_join_request",
    entityId: request.id,
    summary: `${input.requesterName} withdrew their request to join ${input.committeeName}`,
    metadata: {
      committeeId: request.committeeId,
      committeeName: input.committeeName,
      requesterName: input.requesterName,
    },
  });

  void sendCommitteeJoinWithdrawnNotifications(supabase, {
    organizationId: input.organizationId,
    requestId: request.id,
    committeeId: request.committeeId,
    committeeName: input.committeeName,
    guardianName: input.requesterName,
    actorUserId: input.userId,
  });

  return request;
}

export type ApproveJoinRequestInput = {
  requestId: string;
  organizationId: string;
  reviewerUserId: string;
  reviewerName: string;
  schoolSlug: string;
  memberRole?: CommitteeRole;
  assignDutyRoleId?: string | null;
};

export async function approveCommitteeJoinRequest(
  supabase: SupabaseClient,
  input: ApproveJoinRequestInput,
): Promise<CommitteeJoinRequest> {
  const { data: requestRow, error: requestError } = await supabase
    .from("committee_join_requests")
    .select(JOIN_REQUEST_SELECT)
    .eq("id", input.requestId)
    .eq("organization_id", input.organizationId)
    .eq("status", "pending")
    .maybeSingle();

  if (requestError) throw new Error(requestError.message);
  if (!requestRow) throw new Error("Pending request not found.");

  const request = mapJoinRequestRow(requestRow as CommitteeJoinRequestRow);
  const guardian = Array.isArray(requestRow.guardians)
    ? requestRow.guardians[0]
    : requestRow.guardians;
  const staffMember = Array.isArray(requestRow.staff_members)
    ? requestRow.staff_members[0]
    : requestRow.staff_members;

  const isStaffRequest = Boolean(request.staffMemberId);
  const displayName = isStaffRequest
    ? request.staffName ||
      [staffMember?.first_name, staffMember?.last_name].filter(Boolean).join(" ") ||
      "Staff member"
    : request.guardianName ||
      [guardian?.first_name, guardian?.last_name].filter(Boolean).join(" ") ||
      "Parent";
  const memberEmail = isStaffRequest
    ? staffMember?.email ?? null
    : guardian?.email ?? null;

  const committee = await loadActiveCommitteeForOrg(
    supabase,
    input.organizationId,
    request.committeeId,
  );

  if (committee.organizationId !== request.organizationId) {
    throw new Error("Committee does not belong to this school.");
  }

  if (input.assignDutyRoleId) {
    await assertDutyRoleBelongsToCommittee(
      supabase,
      input.assignDutyRoleId,
      request.committeeId,
    );
  }

  const { data: member, error: memberError } = await supabase
    .from("committee_members")
    .insert({
      committee_id: request.committeeId,
      organization_id: committee.organizationId,
      user_id: request.userId,
      guardian_id: isStaffRequest ? null : request.guardianId,
      staff_member_id: isStaffRequest ? request.staffMemberId : null,
      display_name: displayName,
      email: memberEmail,
      role: input.memberRole ?? "member",
      grade: isStaffRequest ? null : request.grade,
      status: "active",
    })
    .select("id")
    .single();

  if (memberError) throw new Error(memberError.message);

  if (input.assignDutyRoleId) {
    const { error: dutyError } = await supabase
      .from("committee_duty_roles")
      .update({ assignee_member_id: member.id })
      .eq("id", input.assignDutyRoleId)
      .eq("committee_id", request.committeeId);

    if (dutyError) throw new Error(dutyError.message);
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("committee_join_requests")
    .update({
      status: "approved",
      reviewed_by: input.reviewerUserId,
      reviewed_at: now,
    })
    .eq("id", input.requestId)
    .select(JOIN_REQUEST_SELECT)
    .single();

  if (updateError) throw new Error(updateError.message);

  const approved = mapJoinRequestRow(updated as CommitteeJoinRequestRow);
  const requesterEmail =
    approved.requesterType === "staff"
      ? approved.staffEmail ?? memberEmail
      : approved.guardianEmail ?? memberEmail;

  void sendCommitteeJoinApprovedNotifications(supabase, {
    organizationId: input.organizationId,
    requestId: approved.id,
    committeeId: approved.committeeId,
    committeeName: approved.committeeName ?? "Committee",
    memberName: displayName,
    memberEmail: requesterEmail?.trim() || null,
    requesterType: approved.requesterType ?? "parent",
    requesterUserId: request.userId,
    reviewerUserId: input.reviewerUserId,
    reviewerName: input.reviewerName,
    schoolSlug: input.schoolSlug,
    memberId: member.id,
  });

  return approved;
}

export async function declineCommitteeJoinRequest(
  supabase: SupabaseClient,
  input: {
    requestId: string;
    organizationId: string;
    reviewerUserId: string;
    reviewerName: string;
    schoolSlug: string;
  },
): Promise<CommitteeJoinRequest> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("committee_join_requests")
    .update({
      status: "declined",
      reviewed_by: input.reviewerUserId,
      reviewed_at: now,
    })
    .eq("id", input.requestId)
    .eq("organization_id", input.organizationId)
    .eq("status", "pending")
    .select(JOIN_REQUEST_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Pending request not found.");

  const declined = mapJoinRequestRow(data as CommitteeJoinRequestRow);

  void sendCommitteeJoinDeclinedNotifications(supabase, {
    organizationId: input.organizationId,
    requestId: declined.id,
    committeeId: declined.committeeId,
    committeeName: declined.committeeName ?? "Committee",
    memberName: getCommitteeJoinRequestDisplayName(declined),
    reviewerUserId: input.reviewerUserId,
    reviewerName: input.reviewerName,
    schoolSlug: input.schoolSlug,
  });

  return declined;
}

export async function countPendingCommitteeJoinRequests(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("committee_join_requests")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
  return count ?? 0;
}
