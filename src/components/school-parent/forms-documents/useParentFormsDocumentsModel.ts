"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  classifyParentFormListStatus,
  countParentFormsByStatus,
  filterParentFormsByStatus,
} from "@/lib/school-parent/forms-documents/utils";
import type {
  ParentFormDetail,
  ParentFormFilterStatus,
  ParentFormListItem,
} from "@/lib/school-parent/forms-documents/types";
import { sortFormQueue } from "./garden/forms-garden-ui";

const FLASH_MS = 2600;

/**
 * View-model for the parent Forms & Documents tab: the list, the status filter,
 * the `?form=` deep link that opens the signing dialog, the "to sign" queue
 * (overdue first, then soonest due), and the after-signing updates.
 */
export function useParentFormsDocumentsModel({
  initialItems,
  initialFormId,
}: {
  initialItems: ParentFormListItem[];
  initialFormId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<ParentFormFilterStatus>("all");
  const [recentlySignedId, setRecentlySignedId] = useState<string | null>(null);
  const [justCompletedAll, setJustCompletedAll] = useState(false);
  const flashTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const formParam = searchParams.get("form") ?? initialFormId ?? null;

  const selectedFormId = useMemo(() => {
    if (!formParam) return null;
    return items.some((item) => item.form.id === formParam) ? formParam : null;
  }, [formParam, items]);

  const setFormParam = useCallback(
    (formId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (formId) params.set("form", formId);
      else params.delete("form");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openForm = useCallback((formId: string) => setFormParam(formId), [setFormParam]);
  const closeForm = useCallback(() => setFormParam(null), [setFormParam]);

  const selectedItem = useMemo(
    () => items.find((item) => item.form.id === selectedFormId) ?? null,
    [items, selectedFormId],
  );

  const statusCounts = useMemo(() => countParentFormsByStatus(items), [items]);
  const filteredItems = useMemo(() => filterParentFormsByStatus(items, filter), [items, filter]);
  const queue = useMemo(() => sortFormQueue(items), [items]);
  const overdueCount = useMemo(
    () => queue.filter((item) => item.response.status === "overdue").length,
    [queue],
  );
  const nextDue = useMemo(() => queue.find((item) => item.form.dueDate) ?? null, [queue]);

  /** Forms still waiting, other than the one open in the dialog. */
  const queueAfterSelected = useMemo(
    () => queue.filter((item) => item.form.id !== selectedFormId),
    [queue, selectedFormId],
  );

  const openNext = useCallback(() => {
    const next = queueAfterSelected[0];
    if (next) setFormParam(next.form.id);
  }, [queueAfterSelected, setFormParam]);

  const handleSubmitted = useCallback(
    (detail: ParentFormDetail) => {
      const wasWaiting = items.filter((item) => item.listStatus === "needs_action").length;
      const next = items.map((item) => {
        if (item.form.id !== detail.form.id) return item;
        return {
          form: detail.form,
          response: detail.response,
          listStatus: classifyParentFormListStatus(detail.response.status),
        };
      });
      setItems(next);
      const stillWaiting = next.filter((item) => item.listStatus === "needs_action").length;
      if (wasWaiting > 0 && stillWaiting === 0) setJustCompletedAll(true);

      setRecentlySignedId(detail.form.id);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setRecentlySignedId(null), FLASH_MS);
    },
    [items],
  );

  return {
    items,
    filter,
    setFilter,
    statusCounts,
    filteredItems,
    queue,
    overdueCount,
    nextDue,
    queueAfterSelected,
    selectedFormId,
    selectedItem,
    openForm,
    closeForm,
    openNext,
    handleSubmitted,
    recentlySignedId,
    justCompletedAll,
  };
}

export type ParentFormsDocumentsModel = ReturnType<typeof useParentFormsDocumentsModel>;
