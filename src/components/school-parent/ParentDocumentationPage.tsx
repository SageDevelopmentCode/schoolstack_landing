"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Search } from "lucide-react";
import ParentDocumentationGuidePanel from "@/components/school-parent/ParentDocumentationGuidePanel";
import {
  buildParentDocumentationGuides,
  groupParentDocumentationByCategory,
  type ParentDocGuide,
  type ParentDocumentationContext,
} from "@/lib/parent-portal/parent-documentation";
import { searchParentDocumentationGuides } from "@/lib/parent-portal/parent-documentation-search";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type ParentDocumentationPageProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  coopModeEnabled: boolean;
  bulletinEnabled?: boolean;
  programSlug?: string;
  parentNavBasePath?: string;
  previewBasePath?: string;
  documentationBasePath: string;
};

function GuideCard({
  theme,
  guide,
  onOpenGuide,
}: {
  theme: ReturnType<typeof buildParentThemeTokens>;
  guide: ParentDocGuide;
  onOpenGuide: (guide: ParentDocGuide) => void;
}) {
  return (
    <article
      className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
      style={{
        borderColor: theme.line,
        backgroundColor: theme.white,
      }}
    >
      <div className="min-w-0">
        <h3 className="text-sm font-semibold" style={{ color: theme.ink }}>
          {guide.title}
        </h3>
        <p
          className="mt-1 text-xs leading-relaxed"
          style={{ color: theme.muted }}
        >
          {guide.summary}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onOpenGuide(guide)}
        className="shrink-0 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ color: theme.primary }}
      >
        Show steps
      </button>
    </article>
  );
}

export default function ParentDocumentationPage({
  slug,
  schoolName,
  branding,
  features,
  coopModeEnabled,
  bulletinEnabled = false,
  programSlug,
  parentNavBasePath,
  previewBasePath,
  documentationBasePath,
}: ParentDocumentationPageProps) {
  const searchParams = useSearchParams();
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);

  const docContext = useMemo<ParentDocumentationContext>(
    () => ({
      slug,
      features,
      coopModeEnabled,
      bulletinEnabled,
      programSlug,
      parentNavBasePath,
      previewBasePath,
    }),
    [
      slug,
      features,
      coopModeEnabled,
      bulletinEnabled,
      programSlug,
      parentNavBasePath,
      previewBasePath,
    ],
  );

  const allGuides = useMemo(
    () => buildParentDocumentationGuides(docContext),
    [docContext],
  );

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const guideIdFromUrl = searchParams.get("guide");
  const activeGuide = useMemo(
    () =>
      guideIdFromUrl
        ? (allGuides.find((guide) => guide.id === guideIdFromUrl) ?? null)
        : null,
    [allGuides, guideIdFromUrl],
  );

  const updateUrlParams = useCallback(
    (patch: { q?: string; guide?: string | null }) => {
      const params = new URLSearchParams(window.location.search);

      if (patch.q !== undefined) {
        const trimmed = patch.q.trim();
        if (trimmed) {
          params.set("q", trimmed);
        } else {
          params.delete("q");
        }
      }

      if (patch.guide !== undefined) {
        if (patch.guide) {
          params.set("guide", patch.guide);
        } else {
          params.delete("guide");
        }
      }

      const queryString = params.toString();
      window.history.replaceState(
        null,
        "",
        queryString ? `${documentationBasePath}?${queryString}` : documentationBasePath,
      );
    },
    [documentationBasePath],
  );

  const openGuide = useCallback(
    (guide: ParentDocGuide) => {
      updateUrlParams({ guide: guide.id });
    },
    [updateUrlParams],
  );

  const closeGuide = useCallback(() => {
    updateUrlParams({ guide: null });
  }, [updateUrlParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!activeGuide) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGuide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGuide, closeGuide]);

  const filteredGuides = useMemo(
    () => searchParentDocumentationGuides(allGuides, debouncedQuery),
    [allGuides, debouncedQuery],
  );

  const groupedGuides = useMemo(
    () => groupParentDocumentationByCategory(filteredGuides),
    [filteredGuides],
  );

  const isSearching = debouncedQuery.trim().length > 0;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    updateUrlParams({ q: value });
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: theme.primarySoft,
              border: `1px solid ${theme.line}`,
            }}
          >
            <BookOpen className="h-5 w-5" style={{ color: theme.primary }} />
          </div>
          <div>
            <h1
              className="font-heading text-xl font-semibold tracking-[-0.03em]"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              How-to guides
            </h1>
            <p className="mt-1 text-sm" style={{ color: theme.muted }}>
              Step-by-step guides for using the parent portal at {schoolName}.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="parent-doc-search" className="sr-only">
            Search guides
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: theme.muted }}
            />
            <input
              id="parent-doc-search"
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search guides…"
              className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm"
              style={{
                borderColor: theme.line,
                backgroundColor: theme.white,
                color: theme.ink,
              }}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-6 space-y-8">
          {filteredGuides.length === 0 ? (
            <p className="text-sm" style={{ color: theme.muted }}>
              No guides match your search.
            </p>
          ) : isSearching ? (
            <section className="space-y-3">
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: theme.muted }}
              >
                {filteredGuides.length} result
                {filteredGuides.length === 1 ? "" : "s"}
              </p>
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  theme={theme}
                  guide={guide}
                  onOpenGuide={openGuide}
                />
              ))}
            </section>
          ) : (
            groupedGuides.map((group) => (
              <section key={group.category}>
                <h2
                  className="mb-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: theme.muted }}
                >
                  {group.category}
                </h2>
                <div className="space-y-3">
                  {group.guides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      theme={theme}
                      guide={guide}
                      onOpenGuide={openGuide}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <p className="mt-8 text-xs" style={{ color: theme.muted }}>
          Still stuck? Use <span className="font-medium">Need help?</span> to
          contact support.
        </p>
      </div>

      <ParentDocumentationGuidePanel
        theme={theme}
        guide={activeGuide}
        open={activeGuide != null}
        onClose={closeGuide}
      />
    </>
  );
}
