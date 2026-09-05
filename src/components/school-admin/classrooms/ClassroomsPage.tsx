"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { SchoolAdminSplitPaneSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import ClassroomDetailPane from "@/components/school-admin/classrooms/ClassroomDetailPane";
import ClassroomListSidebar from "@/components/school-admin/classrooms/ClassroomListSidebar";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import type { ClassroomStatus, ClassroomSummary } from "@/lib/school-admin/classrooms";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";

type ProgramOption = { id: string; name: string };

type ClassroomsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

type AddClassroomModalProps = {
  open: boolean;
  slug: string;
  programs: ProgramOption[];
  onClose: () => void;
  onAdded: () => void;
};

function AddClassroomModal({
  open,
  slug,
  programs,
  onClose,
  onAdded,
}: AddClassroomModalProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState("");
  const [status, setStatus] = useState<ClassroomStatus>("open");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setName("");
      setProgramId("");
      setStatus("open");
      setError(null);
    });
  }, [open]);

  const inputStyle: React.CSSProperties = {
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/school/${slug}/classrooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          programId: programId || null,
          status,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to create classroom.");
      }

      adminToast.success("Classroom created.");
      onAdded();
      onClose();
    } catch (submitError) {
      setError(formatActionError(submitError, "Failed to create classroom."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md rounded-[16px] border p-5 shadow-xl"
            style={{ backgroundColor: theme.white, borderColor: "#DCE4DC" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: theme.ink }}>
                  Add classroom
                </h2>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  Group students and staff into a classroom roster.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
              <label className="block space-y-1">
                <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  Name
                </span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Kindergarten Group A"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  Program (optional)
                </span>
                <select
                  value={programId}
                  onChange={(event) => setProgramId(event.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                >
                  <option value="">All programs</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  Status
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ClassroomStatus)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                >
                  <option value="open">Open</option>
                  <option value="full">Full</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              {error ? (
                <p className="text-sm" style={{ color: C.error }}>
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <AdminButton theme={theme} variant="soft" type="button" onClick={onClose}>
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Add classroom
                </AdminButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function ClassroomsPage({
  organizationId,
  branding,
  slug,
}: ClassroomsPageProps) {
  void branding;
  const { theme, C } = useSchoolAdminStoryTheme();

  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const loadClassrooms = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) setLoading(true);
    setError(null);

    try {
      const [classroomsResponse, staffResponse] = await Promise.all([
        fetch(`/api/school/${slug}/classrooms`),
        fetch(`/api/school/${slug}/staff`),
      ]);
      const classroomsBody = await classroomsResponse.json();
      const staffBody = await staffResponse.json();

      if (!classroomsResponse.ok) {
        throw new Error(classroomsBody.error ?? "Failed to load classrooms.");
      }
      if (!staffResponse.ok) {
        throw new Error(staffBody.error ?? "Failed to load staff.");
      }

      const nextClassrooms = (classroomsBody.classrooms ?? []) as ClassroomSummary[];
      setClassrooms(nextClassrooms);
      setPrograms((classroomsBody.programs ?? []) as ProgramOption[]);
      setStaffMembers((staffBody.staffMembers ?? []) as StaffMemberRecord[]);
      setSelectedId((current) => {
        if (current && nextClassrooms.some((classroom) => classroom.id === current)) {
          return current;
        }
        return nextClassrooms[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(formatActionError(loadError, "Failed to load classrooms."));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadClassrooms();
    });
  }, [loadClassrooms]);

  const selectedClassroom =
    classrooms.find((classroom) => classroom.id === selectedId) ?? null;

  const totalRosterStudents = useMemo(
    () => classrooms.reduce((sum, classroom) => sum + classroom.studentCount, 0),
    [classrooms],
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(16px,3vw,36px)] py-[18px] pb-8">
          {!loading && !error && classrooms.length > 0 ? (
            <>
              <div className="mb-[19px]">
                <AdminSectionKicker theme={theme}>My School</AdminSectionKicker>
                <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1">
                  Classrooms
                </AdminDisplayHeading>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  Group students and staff into classroom rosters with lead teacher assignments.
                </p>
              </div>

              <div className="mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2">
                <AdminMetricCard
                  theme={theme}
                  value={String(classrooms.length)}
                  label="Classrooms"
                  accent="forest"
                />
                <AdminMetricCard
                  theme={theme}
                  value={String(totalRosterStudents)}
                  label="Roster students"
                  accent="sky"
                />
              </div>
            </>
          ) : null}

          {loading ? (
            <SchoolAdminSplitPaneSkeleton C={C} label="Loading classrooms" />
          ) : error ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm" style={{ color: C.error }}>
                {error}
              </p>
            </AdminCard>
          ) : classrooms.length === 0 ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                No classrooms yet. Create your first classroom to group students and assign
                lead teachers.
              </p>
              <AdminButton
                theme={theme}
                variant="primary"
                className="mt-3"
                onClick={() => setAddOpen(true)}
              >
                Add classroom →
              </AdminButton>
            </AdminCard>
          ) : (
            <>
              <ClassroomListSidebar
                classrooms={classrooms}
                selectedId={selectedId ?? ""}
                onSelect={setSelectedId}
                theme={theme}
                layout="strip"
                onAddClassroom={() => setAddOpen(true)}
              />

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
                <div className="hidden lg:block">
                  <ClassroomListSidebar
                    classrooms={classrooms}
                    selectedId={selectedId ?? ""}
                    onSelect={setSelectedId}
                    theme={theme}
                    onAddClassroom={() => setAddOpen(true)}
                  />
                </div>

                {selectedClassroom ? (
                  <ClassroomDetailPane
                    key={selectedClassroom.id}
                    classroom={selectedClassroom}
                    slug={slug}
                    organizationId={organizationId}
                    programs={programs}
                    staffMembers={staffMembers}
                    onUpdated={() => loadClassrooms({ silent: true })}
                    onDeleted={() => void loadClassrooms()}
                  />
                ) : (
                  <AdminCard theme={theme} padding="canvas">
                    <p className="text-sm" style={{ color: theme.muted }}>
                      Select a classroom from the list to manage staff and roster.
                    </p>
                  </AdminCard>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <AddClassroomModal
        open={addOpen}
        slug={slug}
        programs={programs}
        onClose={() => setAddOpen(false)}
        onAdded={() => void loadClassrooms()}
      />
    </div>
  );
}
