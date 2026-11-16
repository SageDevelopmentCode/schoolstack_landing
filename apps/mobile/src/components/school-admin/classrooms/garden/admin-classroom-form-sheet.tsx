import { useState } from 'react';

import { GChoiceChips, GTextField } from '@/components/parent/garden/fields';
import { AdminFormSheet, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import type { ClassroomStatus, ClassroomSummary, ProgramOption } from '@/lib/school-admin/classrooms';

export type ClassroomFormInput = { name: string; programId: string | null; status: ClassroomStatus };

const STATUS_OPTIONS: { id: ClassroomStatus; label: string; description: string }[] = [
  { id: 'open', label: 'Open', description: 'Accepting students' },
  { id: 'full', label: 'Full', description: 'At capacity' },
  { id: 'inactive', label: 'Inactive', description: 'Not in use' },
];

/**
 * Garden "Add / Edit classroom" sheet: same fields (Name, Program, Status),
 * dirty tracking and validation as the Story `ClassroomFormSheet`. Saving
 * happens in the parent; failures come back as `notice`.
 */
export function AdminClassroomFormSheet({
  visible,
  classroom = null,
  programs,
  saving,
  notice,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  classroom?: ClassroomSummary | null;
  programs: ProgramOption[];
  saving: boolean;
  notice: AdminSheetNotice | null;
  onClose: () => void;
  onSubmit: (input: ClassroomFormInput) => void;
}) {
  const isEdit = classroom != null;
  const baseline = { name: classroom?.name ?? '', programId: classroom?.programId ?? '', status: classroom?.status ?? 'open' };
  const [name, setName] = useState(baseline.name);
  const [programId, setProgramId] = useState(baseline.programId);
  const [status, setStatus] = useState<ClassroomStatus>(baseline.status);
  const [openedFor, setOpenedFor] = useState<{ visible: boolean; id: string | null }>({ visible, id: classroom?.id ?? null });

  // Reset each time the sheet opens (previous-value pattern).
  if (openedFor.visible !== visible || openedFor.id !== (classroom?.id ?? null)) {
    setOpenedFor({ visible, id: classroom?.id ?? null });
    if (visible) {
      setName(baseline.name);
      setProgramId(baseline.programId);
      setStatus(baseline.status);
    }
  }

  const isDirty = name !== baseline.name || programId !== baseline.programId || status !== baseline.status;
  const canSave = isDirty && Boolean(name.trim());
  const statusLine = saving
    ? 'Saving classroom…'
    : !name.trim()
      ? 'Give the classroom a name'
      : isDirty
        ? isEdit
          ? 'Changes not saved yet'
          : 'Ready to add'
        : 'No changes yet';

  return (
    <AdminFormSheet
      visible={visible}
      onClose={onClose}
      title={isEdit ? 'Edit classroom' : 'Add classroom'}
      subtitle={isEdit ? classroom?.name : 'Name it, pick a program, then add staff and students.'}
      isDirty={isDirty}
      saving={saving}
      canSave={canSave}
      saveLabel={isEdit ? 'Save' : 'Add classroom'}
      saveIcon={isEdit ? 'checkmark' : 'add'}
      statusLine={statusLine}
      notice={notice}
      maxHeight="88%"
      onSave={() => onSubmit({ name: name.trim(), programId: programId || null, status })}>
      <GTextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Rose Room" autoCapitalize="words" />
      <GChoiceChips<string>
        label="Program (optional)"
        options={[{ id: '', label: 'All programs' }, ...programs.map((program) => ({ id: program.id, label: program.name }))]}
        value={programId}
        onChange={setProgramId}
        helper="Org-wide classrooms can be used for any program."
      />
      <GChoiceChips<ClassroomStatus> label="Status" layout="stack" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
    </AdminFormSheet>
  );
}
