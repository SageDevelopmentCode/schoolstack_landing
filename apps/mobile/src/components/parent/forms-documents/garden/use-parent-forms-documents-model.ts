import { useEffect, useMemo, useRef, useState } from 'react';

import { sortFormQueue } from '@/components/parent/forms-documents/garden/forms-garden-ui';
import type { ParentFormsDocumentsScreenController } from '@/components/parent/forms-documents/garden/use-parent-forms-documents-screen-controller';
import type { ParentFormFilterStatus } from '@/lib/parent/parent-forms-documents-types';
import {
  countParentFormsByStatus,
  filterParentFormsByStatus,
} from '@/lib/parent/parent-forms-documents-utils';

/** The status filter, the signing queue and the "all signed" moment, derived from the list. */
export function useParentFormsDocumentsModel(controller: ParentFormsDocumentsScreenController) {
  const { items, hasLoaded } = controller;
  const [filter, setFilter] = useState<ParentFormFilterStatus>('all');

  const counts = useMemo(() => countParentFormsByStatus(items), [items]);
  const filtered = useMemo(() => filterParentFormsByStatus(items, filter), [filter, items]);
  const queue = useMemo(() => sortFormQueue(items), [items]);
  const overdueCount = useMemo(
    () => queue.filter((item) => item.response.status === 'overdue').length,
    [queue],
  );
  const nextDue = useMemo(() => queue.find((item) => item.form.dueDate) ?? null, [queue]);

  // Web `justCompletedAll`: needs-action went from >0 to 0 while this list was mounted.
  const [justCompletedAll, setJustCompletedAll] = useState(false);
  const previousNeedsAction = useRef<number | null>(null);
  useEffect(() => {
    if (!hasLoaded) return;
    const previous = previousNeedsAction.current;
    previousNeedsAction.current = counts.needs_action;
    if (previous !== null && previous > 0 && counts.needs_action === 0) {
      setJustCompletedAll(true);
    } else if (counts.needs_action > 0) {
      setJustCompletedAll(false);
    }
  }, [counts.needs_action, hasLoaded]);

  return {
    filter,
    setFilter,
    counts,
    filtered,
    queue,
    overdueCount,
    nextDue,
    justCompletedAll,
  };
}

export type ParentFormsDocumentsModel = ReturnType<typeof useParentFormsDocumentsModel>;
