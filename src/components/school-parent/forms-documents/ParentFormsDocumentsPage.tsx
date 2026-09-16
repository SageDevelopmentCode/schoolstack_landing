"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentFormDetailModal from "./ParentFormDetailModal";
import ParentFormListCard from "./ParentFormListCard";
import ParentFormsDocumentsStoryHeader from "./ParentFormsDocumentsStoryHeader";
import {
  classifyParentFormListStatus,
  countParentFormsByStatus,
  filterParentFormsByStatus,
} from "@/lib/school-parent/forms-documents/utils";
import type {
  ParentFormDetail,
  ParentFormFilterStatus,
  ParentFormListItem,
  ParentFormsDocumentsPageBundle,
} from "@/lib/school-parent/forms-documents/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentFormsDocumentsPageProps = {
  organizationId: string;
  slug: string;
  initialBundle: ParentFormsDocumentsPageBundle;
  readOnly?: boolean;
  initialFormId?: string;
  uploadPreviewUrlsByFormId?: Record<string, string>;
};

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

function FormListCard({
  item,
  theme,
  index,
  reducedMotion,
  onOpen,
}: {
  item: ParentFormListItem;
  theme: ParentThemeTokens;
  index: number;
  reducedMotion: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial={reducedMotion ? false : "hidden"}
      animate="visible"
    >
      <ParentFormListCard item={item} theme={theme} onOpen={onOpen} />
    </motion.div>
  );
}

export default function ParentFormsDocumentsPage(props: ParentFormsDocumentsPageProps) {
  const { theme } = useParentTheme();

  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center gap-2 py-12 text-sm"
          style={{ color: theme.muted }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading forms…
        </div>
      }
    >
      <ParentFormsDocumentsPageContent {...props} />
    </Suspense>
  );
}

function ParentFormsDocumentsPageContent({
  organizationId,
  initialBundle,
  readOnly = false,
  initialFormId,
  uploadPreviewUrlsByFormId,
}: ParentFormsDocumentsPageProps) {
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState(initialBundle.items);
  const [filter, setFilter] = useState<ParentFormFilterStatus>("all");

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
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const openSidebar = useCallback(
    (formId: string) => {
      setFormParam(formId);
    },
    [setFormParam],
  );

  const closeSidebar = useCallback(() => {
    setFormParam(null);
  }, [setFormParam]);

  const selectedItem = useMemo(
    () => items.find((item) => item.form.id === selectedFormId) ?? null,
    [items, selectedFormId],
  );

  const statusCounts = useMemo(() => countParentFormsByStatus(items), [items]);

  const filteredItems = useMemo(
    () => filterParentFormsByStatus(items, filter),
    [items, filter],
  );

  const handleSubmitted = useCallback((detail: ParentFormDetail) => {
    setItems((current) =>
      current.map((item) => {
        if (item.form.id !== detail.form.id) return item;
        return {
          form: detail.form,
          response: detail.response,
          listStatus: classifyParentFormListStatus(detail.response.status),
        };
      }),
    );
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <ParentFormsDocumentsStoryHeader theme={theme} />

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["needs_action", "Needs action"],
            ["signed", "Signed"],
          ] as const
        ).map(([key, label]) => (
          <StoryFilterPill
            key={key}
            active={filter === key}
            label={label}
            count={statusCounts[key]}
            onClick={() => setFilter(key)}
            theme={theme}
          />
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <ParentCard theme={theme}>
          <p className="text-sm" style={{ color: theme.muted }}>
            {filter === "all"
              ? "No forms have been assigned to your family yet."
              : "No forms match this filter."}
          </p>
        </ParentCard>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <FormListCard
              key={item.form.id}
              item={item}
              theme={theme}
              index={index}
              reducedMotion={reducedMotion ?? false}
              onOpen={() => openSidebar(item.form.id)}
            />
          ))}
        </div>
      )}

      <ParentFormDetailModal
        theme={theme}
        open={Boolean(selectedFormId)}
        organizationId={organizationId}
        formId={selectedFormId}
        initialItem={selectedItem}
        readOnly={readOnly}
        uploadPreviewUrl={
          selectedFormId
            ? (uploadPreviewUrlsByFormId?.[selectedFormId] ?? null)
            : null
        }
        onClose={closeSidebar}
        onSubmitted={handleSubmitted}
      />
    </div>
  );
}
