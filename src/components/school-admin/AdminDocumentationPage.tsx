"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Search } from "lucide-react";
import AdminDocumentationGuidePanel from "@/components/school-admin/AdminDocumentationGuidePanel";
import {
  buildAdminDocumentationGuides,
  groupAdminDocumentationByCategory,
  type AdminDocGuide,
} from "@/lib/school-admin/admin-documentation";
import { searchAdminDocumentationGuides } from "@/lib/school-admin/admin-documentation-search";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type AdminDocumentationPageProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
};

function GuideCard({
  C,
  guide,
  onOpenGuide,
}: {
  C: ReturnType<typeof buildAdminThemeTokens>;
  guide: AdminDocGuide;
  onOpenGuide: (guide: AdminDocGuide) => void;
}) {
  return (
    <article
      className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
      style={{
        borderColor: C.border,
        backgroundColor: C.surface,
      }}
    >
      <div className="min-w-0">
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          {guide.title}
        </h3>
        <p
          className="mt-1 text-xs leading-relaxed"
          style={{ color: C.textTertiary }}
        >
          {guide.summary}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onOpenGuide(guide)}
        className="shrink-0 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ color: C.accent }}
      >
        Show steps
      </button>
    </article>
  );
}

export default function AdminDocumentationPage({
  slug,
  schoolName,
  branding,
  features,
}: AdminDocumentationPageProps) {
  const searchParams = useSearchParams();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const allGuides = useMemo(
    () => buildAdminDocumentationGuides(slug, features),
    [slug, features],
  );

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [activeGuide, setActiveGuide] = useState<AdminDocGuide | null>(null);

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
      const path = `/school/${slug}/admin/documentation`;
      window.history.replaceState(
        null,
        "",
        queryString ? `${path}?${queryString}` : path,
      );
    },
    [slug],
  );

  const openGuide = useCallback(
    (guide: AdminDocGuide) => {
      setActiveGuide(guide);
      updateUrlParams({ guide: guide.id });
    },
    [updateUrlParams],
  );

  const closeGuide = useCallback(() => {
    setActiveGuide(null);
    updateUrlParams({ guide: null });
  }, [updateUrlParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const guideId = searchParams.get("guide");
    if (!guideId) {
      setActiveGuide(null);
      return;
    }

    const match = allGuides.find((guide) => guide.id === guideId);
    if (match) {
      setActiveGuide(match);
    }
  }, [allGuides, searchParams]);

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
    () => searchAdminDocumentationGuides(allGuides, debouncedQuery),
    [allGuides, debouncedQuery],
  );

  const groupedGuides = useMemo(
    () => groupAdminDocumentationByCategory(filteredGuides),
    [filteredGuides],
  );

  const isSearching = debouncedQuery.trim().length > 0;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    updateUrlParams({ q: value });
  };

  const inputStyle: React.CSSProperties = {
    borderColor: C.inputBorder,
    backgroundColor: C.input,
    color: C.textPrimary,
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: C.accentLight,
              border: `1px solid ${C.secondaryBtnBorder}`,
            }}
          >
            <BookOpen className="h-5 w-5" style={{ color: C.accent }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: C.textPrimary }}>
              How-to guides
            </h1>
            <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
              Step-by-step guides for common admin tasks at {schoolName}.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="doc-search" className="sr-only">Search guides</label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: C.textTertiary }}
            />
            <input
              id="doc-search"
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search guides…"
              className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm"
              style={inputStyle}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-6 space-y-8">
          {filteredGuides.length === 0 ? (
            <p className="text-sm" style={{ color: C.textTertiary }}>
              No guides match your search.
            </p>
          ) : isSearching ? (
            <section className="space-y-3">
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: C.textQuaternary }}
              >
                {filteredGuides.length} result
                {filteredGuides.length === 1 ? "" : "s"}
              </p>
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  C={C}
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
                  style={{ color: C.textQuaternary }}
                >
                  {group.category}
                </h2>
                <div className="space-y-3">
                  {group.guides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      C={C}
                      guide={guide}
                      onOpenGuide={openGuide}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <p className="mt-8 text-xs" style={{ color: C.textTertiary }}>
          Still stuck? Use <span className="font-medium">Need help?</span> in the
          sidebar to contact support.
        </p>
      </div>

      <AdminDocumentationGuidePanel
        C={C}
        guide={activeGuide}
        open={activeGuide != null}
        onClose={closeGuide}
      />
    </>
  );
}
