import { useCallback, useState } from 'react';

import { closeThen, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { READ_ONLY_NOTICE, errorText, type AdminSheetNotice } from '@/components/school-admin/garden/admin-sheet';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import type { StaffListController, StaffListFilter } from '@/components/school-admin/staff/garden/use-staff-list-controller';
import { haptic } from '@/lib/haptics';
import type { CreateStaffMemberInput } from '@/lib/school-admin-api';

/**
 * Feedback for the Staff roster: filter haptics, pull-to-refresh toasts, the
 * Add staff sheet with in-sheet status, then a toast once it closes and the
 * new record opens. The controller reports, so no `operation` here.
 */
export function useStaffListFeedback(controller: StaffListController) {
  const action = useAdminAction(controller.organizationId);
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [addNotice, setAddNotice] = useState<AdminSheetNotice | null>(null);
  const { setRosterFilter, openAddSheet, closeAddSheet, createMember, refresh, openMember } = controller;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh,
    error: controller.error,
    label: 'Staff',
    id: 'admin-staff-refresh',
  });

  const applyFilter = useCallback(
    (filter: StaffListFilter) => {
      haptic.select();
      setRosterFilter(filter);
    },
    [setRosterFilter],
  );

  const openAdd = useCallback(() => {
    if (readOnly) return notifyReadOnly();
    setAddNotice(null);
    openAddSheet();
  }, [notifyReadOnly, openAddSheet, readOnly]);

  const closeAdd = useCallback(() => {
    setAddNotice(null);
    closeAddSheet();
  }, [closeAddSheet]);

  const submitAdd = useCallback(
    async (input: CreateStaffMemberInput) => {
      if (readOnly) {
        setAddNotice(READ_ONLY_NOTICE);
        return;
      }
      setAddNotice(null);
      const created = { id: '' };
      let failure = '';
      const ok = await action.run(
        async () => {
          const member = await createMember(input);
          created.id = member.id;
          return member;
        },
        {
          key: 'staff-create',
          silent: true,
          error: (err) => {
            failure = errorText(err, 'Failed to add staff member.');
            return { title: "Couldn't add staff" };
          },
        },
      );
      if (!ok || !created.id) {
        setAddNotice({
          tone: 'error',
          title: `${input.firstName} wasn't added`,
          description: `${failure} Nothing was saved. Check the details, then tap Add staff again.`,
        });
        return;
      }
      const id = created.id;
      void refresh();
      closeThen(closeAdd, () => {
        action.toast.success(`${input.firstName} ${input.lastName} added`, {
          id: 'staff-create',
          description: 'Their record is open. Assign learners, or copy their sign-in link from Portal access.',
        });
        openMember({ id });
      });
    },
    [action, closeAdd, createMember, openMember, readOnly, refresh],
  );

  return { action, readOnly, pullRefreshing, onPullRefresh, applyFilter, openAdd, closeAdd, submitAdd, addNotice };
}

export type StaffListFeedback = ReturnType<typeof useStaffListFeedback>;
