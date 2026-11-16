"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";
import type { ClassroomStatus, ClassroomSummary } from "@/lib/school-admin/classrooms";
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

/*
 * Classrooms view-model (admin Garden): list + programs + staff, selection
 * in `?classroom=`, status filter, create. Per-classroom detail lives in
 * ClassroomDetailPane.
 */

export type ProgramOption = { id: string; name: string };
export type ClassroomFilter = "all" | ClassroomStatus | "no_lead";

export type ClassroomCreateDraft = { name: string; programId: string; status: ClassroomStatus };

export const CLASSROOM_STATUS_LABELS: Record<ClassroomStatus, string> = {
  open: "Open",
  full: "Full",
  inactive: "Inactive",
};

export function useClassroomsModel({
  organizationId,
  slug,
  initialClassrooms,
  initialPrograms,
  initialStaff,
  initialSelectedClassroomId,
  previewMode,
}: {
  organizationId: string;
  slug: string;
  initialClassrooms?: ClassroomSummary[];
  initialPrograms?: ProgramOption[];
  initialStaff?: StaffMemberRecord[];
  initialSelectedClassroomId?: string | null;
  previewMode: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get("classroom");
  const hasInitial = initialClassrooms !== undefined;

  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>(initialClassrooms ?? []);
  const [programs, setPrograms] = useState<ProgramOption[]>(initialPrograms ?? []);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>(initialStaff ?? []);
  const [loading, setLoading] = useState(!hasInitial);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedIdState] = useState<string | null>(
    initialSelectedClassroomId ?? deepLinkId ?? initialClassrooms?.[0]?.id ?? null,
  );
  const [filter, setFilter] = useState<ClassroomFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const action = useAdminAction();
  const requestIdRef = useRef(0);

  const [prevInitial, setPrevInitial] = useState(initialClassrooms);
  if (initialClassrooms !== prevInitial) {
    setPrevInitial(initialClassrooms);
    if (initialClassrooms) {
      setClassrooms(initialClassrooms);
      setPrograms(initialPrograms ?? []);
      setStaffMembers(initialStaff ?? []);
      setLoading(false);
      setSelectedIdState((current) =>
        initialSelectedClassroomId ??
        (current && initialClassrooms.some((c) => c.id === current) ? current : initialClassrooms[0]?.id ?? null),
      );
    }
  }

  const loadClassrooms = useCallback(
    async (options?: { silent?: boolean; selectName?: string }): Promise<ClassroomSummary[] | null> => {
      if (previewMode) return null;
      const requestId = ++requestIdRef.current;
      if (options?.silent) setRefreshing(true);
      else setLoading(true);
      try {
        const [classroomsResponse, staffResponse] = await Promise.all([
          fetch(`/api/school/${slug}/classrooms`),
          fetch(`/api/school/${slug}/staff`),
        ]);
        const classroomsBody = (await classroomsResponse.json().catch(() => ({}))) as {
          classrooms?: ClassroomSummary[];
          programs?: ProgramOption[];
          error?: string;
        };
        const staffBody = (await staffResponse.json().catch(() => ({}))) as {
          staffMembers?: StaffMemberRecord[];
          error?: string;
        };
        if (!classroomsResponse.ok) throw new Error(classroomsBody.error ?? "Failed to load classrooms.");
        if (!staffResponse.ok) throw new Error(staffBody.error ?? "Failed to load staff.");
        if (requestId !== requestIdRef.current) return null;
        const next = classroomsBody.classrooms ?? [];
        setClassrooms(next);
        setPrograms(classroomsBody.programs ?? []);
        setStaffMembers(staffBody.staffMembers ?? []);
        setError(null);
        setLastUpdatedAt(Date.now());
        setSelectedIdState((current) => {
          if (options?.selectName) {
            const created = [...next].reverse().find((c) => c.name === options.selectName);
            if (created) return created.id;
          }
          if (current && next.some((c) => c.id === current)) return current;
          return next[0]?.id ?? null;
        });
        return next;
      } catch (loadError) {
        if (requestId !== requestIdRef.current) return null;
        setError(formatActionError(loadError, "Failed to load classrooms."));
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "classrooms.load", error: "" },
          loadError,
        );
        return null;
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [organizationId, previewMode, slug],
  );

  useEffect(() => {
    if (previewMode || hasInitial) return;
    queueMicrotask(() => {
      void loadClassrooms();
    });
  }, [hasInitial, loadClassrooms, previewMode]);

  const selectClassroom = useCallback(
    (id: string) => {
      setSelectedIdState(id);
      if (previewMode) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("classroom", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, previewMode, router, searchParams],
  );

  const selectedClassroom = classrooms.find((c) => c.id === selectedId) ?? classrooms[0] ?? null;

  const metrics = useMemo(() => {
    let students = 0;
    let open = 0;
    let full = 0;
    let inactive = 0;
    let noLead = 0;
    for (const c of classrooms) {
      students += c.studentCount;
      if (c.status === "open") open += 1;
      if (c.status === "full") full += 1;
      if (c.status === "inactive") inactive += 1;
      if (c.status !== "inactive" && c.leadTeacherNames.length === 0) noLead += 1;
    }
    return { total: classrooms.length, students, open, full, inactive, noLead };
  }, [classrooms]);

  const filteredClassrooms = useMemo(() => {
    if (filter === "all") return classrooms;
    if (filter === "no_lead") return classrooms.filter((c) => c.status !== "inactive" && c.leadTeacherNames.length === 0);
    return classrooms.filter((c) => c.status === filter);
  }, [classrooms, filter]);

  const firstWithoutLead = useMemo(
    () => classrooms.find((c) => c.status !== "inactive" && c.leadTeacherNames.length === 0) ?? null,
    [classrooms],
  );

  const createClassroom = useCallback(
    async (draft: ClassroomCreateDraft) => {
      setCreateError(null);
      const name = draft.name.trim();
      const result = await action.run(
        async () => {
          try {
            const response = await fetch(`/api/school/${slug}/classrooms`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: draft.name, programId: draft.programId || null, status: draft.status }),
            });
            const body = (await response.json().catch(() => ({}))) as { error?: string };
            if (!response.ok) throw new Error(body.error ?? "Failed to create classroom.");
          } catch (submitError) {
            setCreateError(formatActionError(submitError, "Failed to create classroom."));
            void reportPortalOperationalError(
              "school_admin",
              { organizationId, operation: "classrooms.create", error: "" },
              submitError,
            );
            throw submitError;
          }
        },
        {
          key: "classroom-create",
          id: "classroom-create",
          retry: false,
          success: {
            title: `${name} created.`,
            description: "Next, assign a lead teacher and add students to the roster.",
          },
          error: {
            title: "Couldn't create the classroom.",
            description: "Check the form and try again.",
            fallback: "Failed to create classroom.",
          },
        },
      );
      if (result.ok) {
        setCreateOpen(false);
        const list = await loadClassrooms({ silent: true, selectName: name });
        const created = list ? [...list].reverse().find((c) => c.name === name) : null;
        if (created) selectClassroom(created.id);
      }
      return result.ok;
    },
    [action, loadClassrooms, organizationId, selectClassroom, slug],
  );

  return {
    loading,
    refreshing,
    error,
    lastUpdatedAt,
    loadClassrooms,
    classrooms,
    filteredClassrooms,
    programs,
    staffMembers,
    metrics,
    filter,
    setFilter,
    firstWithoutLead,
    selectedClassroom,
    selectClassroom,
    createOpen,
    openCreate: () => {
      setCreateError(null);
      setCreateOpen(true);
    },
    closeCreate: () => setCreateOpen(false),
    createError,
    creating: action.pendingKey === "classroom-create",
    createClassroom,
    previewMode,
    slug,
    organizationId,
  };
}

export type ClassroomsModel = ReturnType<typeof useClassroomsModel>;
