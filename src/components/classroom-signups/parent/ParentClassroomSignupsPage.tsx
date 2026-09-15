"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ClipboardList, Loader2 } from "lucide-react";
import ParentClassroomSignupSidebar from "./ParentClassroomSignupSidebar";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import {
  classifyParentClassroomSignupListItem,
} from "@/lib/classroom-signups/load-parent-signups";
import type {
  ClassroomSignupResponse,
  ParentClassroomSignupListItem,
  ParentClassroomSignupListStatus,
  ParentClassroomSignupsPageBundle,
} from "@/lib/classroom-signups/types";
import { SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import { formatSignupDeadline } from "@/lib/classroom-signups/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentClassroomSignupsPageProps = {
  organizationId: string;
  slug: string;
  initialBundle: ParentClassroomSignupsPageBundle;
  previewBasePath?: string;
  readOnly?: boolean;
  initialSignupId?: string;
};

type FilterStatus = ParentClassroomSignupListStatus | "all";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

function StoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ParentThemeTokens;
}) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: theme.primarySoft,
              color: theme.primary,
              borderColor: "#BCD4C1",
            }
          : {
              backgroundColor: theme.white,
              color: theme.muted,
              borderColor: theme.line,
            }
      }
    >
      {displayLabel}
    </button>
  );
}

export default function ParentClassroomSignupsPage(
  props: ParentClassroomSignupsPageProps,
) {
  const { theme } = useParentTheme();

  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center gap-2 py-12 text-sm"
          style={{ color: theme.muted }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading signups…
        </div>
      }
    >
      <ParentClassroomSignupsPageContent {...props} />
    </Suspense>
  );
}

function ParentClassroomSignupsPageContent({
  organizationId,
  initialBundle,
  readOnly = false,
  initialSignupId,
}: ParentClassroomSignupsPageProps) {
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState(initialBundle.items);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const signupParam =
    searchParams.get("signup") ?? initialSignupId ?? null;

  const selectedSignupId = useMemo(() => {
    if (!signupParam) return null;
    const visible = items.some((item) => item.signup.id === signupParam);
    return visible ? signupParam : null;
  }, [signupParam, items]);

  const setSignupParam = useCallback(
    (signupId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (signupId) params.set("signup", signupId);
      else params.delete("signup");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const openSidebar = useCallback(
    (signupId: string) => {
      setSignupParam(signupId);
    },
    [setSignupParam],
  );

  const closeSidebar = useCallback(() => {
    setSignupParam(null);
  }, [setSignupParam]);

  const selectedItem = useMemo(
    () => items.find((item) => item.signup.id === selectedSignupId) ?? null,
    [items, selectedSignupId],
  );

  const statusCounts = useMemo(() => {
    return {
      all: items.length,
      needs_response: items.filter(
        (item) => item.listStatus === "needs_response",
      ).length,
      signed_up: items.filter((item) => item.listStatus === "signed_up").length,
      closed: items.filter((item) => item.listStatus === "closed").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.listStatus === filter);
  }, [items, filter]);

  const groupedItems = useMemo(() => {
    if (filter !== "all") return null;

    const groups: {
      key: ParentClassroomSignupListStatus;
      label: string;
      items: ParentClassroomSignupListItem[];
    }[] = [
      {
        key: "needs_response",
        label: "Needs your response",
        items: items.filter((item) => item.listStatus === "needs_response"),
      },
      {
        key: "signed_up",
        label: "You're signed up",
        items: items.filter((item) => item.listStatus === "signed_up"),
      },
      {
        key: "closed",
        label: "Past signups",
        items: items.filter((item) => item.listStatus === "closed"),
      },
    ];

    return groups.filter((group) => group.items.length > 0);
  }, [items, filter]);

  const handleSubmitted = useCallback(
    (signupId: string, response: ClassroomSignupResponse) => {
      setItems((current) => {
        const existing = current.find((item) => item.signup.id === signupId);
        if (!existing) return current;
        const nextItem = classifyParentClassroomSignupListItem(
          existing.signup,
          response,
        );
        if (!nextItem) {
          return current.filter((item) => item.signup.id !== signupId);
        }
        return current.map((item) =>
          item.signup.id === signupId ? nextItem : item,
        );
      });
    },
    [],
  );

  const handleWithdrawn = useCallback((signupId: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.signup.id === signupId);
      if (!existing) return current;
      const nextItem = classifyParentClassroomSignupListItem(
        existing.signup,
        null,
      );
      if (!nextItem) {
        return current.filter((item) => item.signup.id !== signupId);
      }
      return current.map((item) =>
        item.signup.id === signupId ? nextItem : item,
      );
    });
  }, []);

  const renderCardList = (
    cardItems: ParentClassroomSignupListItem[],
    startIndex = 0,
  ) => (
    <div className="space-y-3">
      {cardItems.map((item, index) => (
        <SignupListCard
          key={item.signup.id}
          item={item}
          theme={theme}
          index={startIndex + index}
          reducedMotion={reducedMotion ?? false}
          readOnly={readOnly}
          onOpen={() => openSidebar(item.signup.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <ParentSectionKicker
        theme={theme}
        className="normal-case tracking-normal font-semibold"
      >
        Help in the classroom
      </ParentSectionKicker>
      <ParentDisplayHeading theme={theme}>Classroom signups</ParentDisplayHeading>
      <p className="mt-1 mb-6 text-sm" style={{ color: theme.muted }}>
        Help teachers by signing up for volunteer requests.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["needs_response", "Needs response"],
            ["signed_up", "Signed up"],
            ["closed", "Past"],
          ] as const
        ).map(([key, label]) => (
          <StoryFilterPill
            key={key}
            theme={theme}
            active={filter === key}
            label={label}
            count={statusCounts[key]}
            onClick={() => setFilter(key)}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <ParentCard theme={theme} className="py-12 text-center">
          <ClipboardList
            className="mx-auto mb-3 h-10 w-10"
            style={{ color: "#B8C4BC" }}
          />
          <p className="text-sm font-medium" style={{ color: theme.ink }}>
            No classroom signups right now
          </p>
          <p className="mt-1 text-sm" style={{ color: theme.muted }}>
            When a teacher posts a volunteer request for your family, it will
            show up here.
          </p>
        </ParentCard>
      ) : filter === "all" && groupedItems ? (
        <div className="space-y-8">
          {groupedItems.map((group, groupIndex) => (
            <section key={group.key}>
              <h2
                className="mb-3 text-sm font-medium"
                style={{ color: theme.muted }}
              >
                {group.label}
              </h2>
              {renderCardList(
                group.items,
                groupIndex > 0 ? groupedItems[groupIndex - 1].items.length : 0,
              )}
            </section>
          ))}
        </div>
      ) : (
        renderCardList(filteredItems)
      )}

      <ParentClassroomSignupSidebar
        key={selectedSignupId ?? "closed"}
        theme={theme}
        open={selectedSignupId != null && selectedItem != null}
        organizationId={organizationId}
        signupId={selectedSignupId}
        signup={selectedItem?.signup ?? null}
        initialFamilyResponse={selectedItem?.familyResponse ?? null}
        studentOptions={initialBundle.studentOptions}
        readOnly={readOnly}
        onClose={closeSidebar}
        onSubmitted={handleSubmitted}
        onWithdrawn={handleWithdrawn}
      />
    </div>
  );
}

function SignupListCard({
  item,
  theme,
  index,
  reducedMotion,
  readOnly,
  onOpen,
}: {
  item: ParentClassroomSignupListItem;
  theme: ParentThemeTokens;
  index: number;
  reducedMotion: boolean;
  readOnly: boolean;
  onOpen: () => void;
}) {
  const { signup, listStatus } = item;
  const deadline = formatSignupDeadline(signup.responseDeadline);

  const actionLabel =
    listStatus === "needs_response"
      ? "Sign up"
      : listStatus === "signed_up"
        ? "View signup"
        : "View details";

  const actionVariant =
    listStatus === "needs_response"
      ? "primary"
      : listStatus === "signed_up"
        ? "soft"
        : "outline";

  const showMeta = listStatus === "needs_response";
  const cardVariant =
    listStatus === "needs_response" ? "today" : "default";

  const card = (
    <ParentCard
      theme={theme}
      variant={cardVariant}
      className="transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {listStatus === "needs_response" ? (
            <div
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px]"
              style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
            >
              <ClipboardList className="h-4 w-4" aria-hidden />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p
              className="text-base font-semibold leading-snug"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {signup.title}
            </p>
            <p className="mt-1 text-sm" style={{ color: theme.muted }}>
              From {signup.teacherName}
              {signup.classroomName ? ` · ${signup.classroomName}` : ""}
            </p>
            {showMeta ? (
              <div
                className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs"
                style={{ color: theme.muted }}
              >
                <span>{SIGNUP_TYPE_LABELS[signup.signupType]}</span>
                {deadline ? <span>Sign up by {deadline}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
        <ParentButton
          theme={theme}
          variant={actionVariant}
          onClick={onOpen}
          className="w-full shrink-0 sm:w-auto"
        >
          {readOnly && listStatus === "needs_response"
            ? "Preview signup"
            : actionLabel}
        </ParentButton>
      </div>
    </ParentCard>
  );

  if (reducedMotion) {
    return card;
  }

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {card}
    </motion.div>
  );
}
