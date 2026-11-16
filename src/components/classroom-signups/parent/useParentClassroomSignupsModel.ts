"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { classifyParentClassroomSignupListItem } from "@/lib/classroom-signups/load-parent-signups";
import type {
  ClassroomSignupResponse,
  ParentClassroomSignupListItem,
  ParentClassroomSignupListStatus,
} from "@/lib/classroom-signups/types";
import { SIGNUP_GROUP_LABELS, buildUpcomingHelp, type SignupFilter } from "./garden/signups-garden-ui";

const FLASH_MS = 2600;
const GROUP_ORDER: ParentClassroomSignupListStatus[] = ["needs_response", "signed_up", "closed"];

/**
 * View-model for the parent Classroom signups tab: the list, the status filter,
 * the `?signup=` deep link that opens the drawer, and the after-response updates.
 */
export function useParentClassroomSignupsModel({
  initialItems,
  initialSignupId,
}: {
  initialItems: ParentClassroomSignupListItem[];
  initialSignupId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<SignupFilter>("all");
  const [recentlyChangedId, setRecentlyChangedId] = useState<string | null>(null);
  const [initialNeedsCount] = useState(
    () => initialItems.filter((item) => item.listStatus === "needs_response").length,
  );
  const flashTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const flash = useCallback((signupId: string) => {
    setRecentlyChangedId(signupId);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setRecentlyChangedId(null), FLASH_MS);
  }, []);

  const signupParam = searchParams.get("signup") ?? initialSignupId ?? null;

  const selectedSignupId = useMemo(() => {
    if (!signupParam) return null;
    return items.some((item) => item.signup.id === signupParam) ? signupParam : null;
  }, [signupParam, items]);

  const setSignupParam = useCallback(
    (signupId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (signupId) params.set("signup", signupId);
      else params.delete("signup");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openSignup = useCallback((signupId: string) => setSignupParam(signupId), [setSignupParam]);
  const closeSignup = useCallback(() => setSignupParam(null), [setSignupParam]);

  const selectedItem = useMemo(
    () => items.find((item) => item.signup.id === selectedSignupId) ?? null,
    [items, selectedSignupId],
  );

  const statusCounts = useMemo<Record<SignupFilter, number>>(
    () => ({
      all: items.length,
      needs_response: items.filter((item) => item.listStatus === "needs_response").length,
      signed_up: items.filter((item) => item.listStatus === "signed_up").length,
      closed: items.filter((item) => item.listStatus === "closed").length,
    }),
    [items],
  );

  const filteredItems = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.listStatus === filter)),
    [items, filter],
  );

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((key) => ({
        key,
        label: SIGNUP_GROUP_LABELS[key],
        items: filteredItems.filter((item) => item.listStatus === key),
      })).filter((group) => group.items.length > 0),
    [filteredItems],
  );

  const needsResponse = useMemo(
    () => items.filter((item) => item.listStatus === "needs_response"),
    [items],
  );

  /** Open signups (answered or not), for the "N of M answered" footer. */
  const openCount = statusCounts.needs_response + statusCounts.signed_up;

  const upcomingHelp = useMemo(() => buildUpcomingHelp(items), [items]);

  /** The family answered every request that was waiting when the page opened. */
  const justAnsweredAll = initialNeedsCount > 0 && statusCounts.needs_response === 0;

  const handleSubmitted = useCallback(
    (signupId: string, response: ClassroomSignupResponse) => {
      setItems((current) => {
        const existing = current.find((item) => item.signup.id === signupId);
        if (!existing) return current;
        const nextItem = classifyParentClassroomSignupListItem(existing.signup, response);
        if (!nextItem) return current.filter((item) => item.signup.id !== signupId);
        return current.map((item) => (item.signup.id === signupId ? nextItem : item));
      });
      flash(signupId);
    },
    [flash],
  );

  const handleWithdrawn = useCallback(
    (signupId: string) => {
      setItems((current) => {
        const existing = current.find((item) => item.signup.id === signupId);
        if (!existing) return current;
        const nextItem = classifyParentClassroomSignupListItem(existing.signup, null);
        if (!nextItem) return current.filter((item) => item.signup.id !== signupId);
        return current.map((item) => (item.signup.id === signupId ? nextItem : item));
      });
      flash(signupId);
    },
    [flash],
  );

  return {
    items,
    filter,
    setFilter,
    statusCounts,
    filteredItems,
    groups,
    needsResponse,
    openCount,
    upcomingHelp,
    selectedSignupId,
    selectedItem,
    openSignup,
    closeSignup,
    handleSubmitted,
    handleWithdrawn,
    recentlyChangedId,
    justAnsweredAll,
  };
}

export type ParentClassroomSignupsModel = ReturnType<typeof useParentClassroomSignupsModel>;
