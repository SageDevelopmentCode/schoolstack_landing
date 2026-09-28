"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Globe } from "lucide-react";
import type { PublicTourFieldDefinition } from "@/lib/admissions/public-tour-settings";
import { DEFAULT_PUBLIC_TOUR_FIELDS } from "@/lib/admissions/public-tour-settings";
import PublicTourFieldsEditor from "@/components/school-admin/admissions/PublicTourFieldsEditor";
import { BuilderSectionIntro } from "@/components/school-admin/admissions/builder-question-card";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import PublicTourVisibilityBadge from "@/components/school-admin/admissions/PublicTourVisibilityBadge";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type PublicTourSchoolSettingsPanelProps = {
  C: AdminThemeTokens;
  organizationId: string;
  schoolSlug: string;
  onPlatformEnabledChange?: (enabled: boolean) => void;
};

export default function PublicTourSchoolSettingsPanel({
  C,
  organizationId,
  schoolSlug,
  onPlatformEnabledChange,
}: PublicTourSchoolSettingsPanelProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const inputStyle = committeeStoryInputStyle(theme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platformEnabled, setPlatformEnabled] = useState(false);
  const [headline, setHeadline] = useState("");
  const [intro, setIntro] = useState("");
  const [fields, setFields] = useState<PublicTourFieldDefinition[]>(
    DEFAULT_PUBLIC_TOUR_FIELDS,
  );

  const tourPath = `/school/${schoolSlug}/tour`;
  const [urlCopied, setUrlCopied] = useState(false);

  const handleCopyTourUrl = useCallback(async () => {
    const absoluteUrl = `${window.location.origin}${tourPath}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setUrlCopied(true);
      adminToast.success("Link copied");
      window.setTimeout(() => setUrlCopied(false), 1500);
    } catch {
      adminToast.error("Could not copy link to clipboard.");
    }
  }, [tourPath]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/school-admin/admissions/public-tour-settings?organizationId=${encodeURIComponent(organizationId)}`,
      );
      const payload = (await response.json()) as {
        platformEnabled?: boolean;
        headline?: string;
        intro?: string;
        fields?: PublicTourFieldDefinition[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load settings.");
      }
      setPlatformEnabled(Boolean(payload.platformEnabled));
      onPlatformEnabledChange?.(Boolean(payload.platformEnabled));
      setHeadline(payload.headline ?? "");
      setIntro(payload.intro ?? "");
      setFields(payload.fields?.length ? payload.fields : DEFAULT_PUBLIC_TOUR_FIELDS);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load public tour settings."));
    } finally {
      setLoading(false);
    }
  }, [organizationId, onPlatformEnabledChange]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/school-admin/admissions/public-tour-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          headline,
          intro,
          fields,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to save.");
      }
      adminToast.success("Public tour page updated");
    } catch (err) {
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "public_tour.settings.save",
        error: "",
      }, err);
      adminToast.error(formatActionError(err, "Failed to save settings."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm" style={{ color: C.textTertiary }}>
        Loading public tour settings…
      </p>
    );
  }

  const formDisabled = !platformEnabled || saving;
  const tourDisplayUrl = `${window.location.host}${tourPath}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Public tour page
        </h3>
        <PublicTourVisibilityBadge theme={theme} platformEnabled={platformEnabled} />
      </div>

      {platformEnabled ? (
        <div
          className="flex flex-col gap-2 rounded-[12px] border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: "#B8DFC4",
            backgroundColor: "#EAF7EE",
          }}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <Globe
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "#348457" }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: "#2D6B47" }}>
                Live for families
              </p>
              <div className="mt-1 flex max-w-full items-center gap-1">
                <span
                  className="min-w-0 flex-1 truncate font-mono text-[11px]"
                  style={{ color: "#348457" }}
                >
                  {tourDisplayUrl}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopyTourUrl()}
                  className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-white/60"
                  style={{ color: urlCopied ? "#2D6B47" : "#348457" }}
                  aria-label="Copy tour page link"
                >
                  {urlCopied ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>
              </div>
            </div>
          </div>
          <a
            href={tourPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2 text-[11px] font-bold transition-opacity hover:opacity-90"
            style={{
              borderColor: "#B8DFC4",
              backgroundColor: theme.white,
              color: C.accent,
            }}
          >
            Open tour page
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </a>
        </div>
      ) : (
        <div
          className="rounded-[12px] border px-3 py-3"
          style={{
            borderColor: "#E0E7E0",
            backgroundColor: theme.white,
          }}
        >
          <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
            Not public
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
            MudKitchen must enable this under platform admin{" "}
            <strong>Features → Admissions</strong>. When enabled, families can book at{" "}
            <span style={{ color: C.textSecondary }}>/school/{schoolSlug}/tour</span>
          </p>
        </div>
      )}

      <AdminCard theme={theme} padding="canvas" className="space-y-4">
        <BuilderSectionIntro
          C={C}
          theme={theme}
          eyebrow="Public tour page"
          title="What families see first"
          subtitle="Headline and intro appear above the calendar on your public tour page."
        />

        <div
          className="overflow-hidden rounded-[12px] border"
          style={{ borderColor: theme.line, backgroundColor: "#F4F7F4" }}
        >
          <div
            className="border-b bg-white/90 px-4 py-4 sm:px-5"
            style={{ borderColor: theme.line }}
          >
            <label
              className="block text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: theme.muted }}
            >
              Headline
            </label>
            <input
              type="text"
              value={headline}
              disabled={formDisabled}
              onChange={(event) => setHeadline(event.target.value)}
              className={`mt-2 ${committeeStoryInputClassName}`}
              style={inputStyle}
              placeholder="Schedule a campus tour"
            />
          </div>
          <div className="bg-white/90 px-4 py-4 sm:px-5">
            <label
              className="block text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: theme.muted }}
            >
              Intro
            </label>
            <textarea
              value={intro}
              disabled={formDisabled}
              onChange={(event) => setIntro(event.target.value)}
              rows={3}
              className={`mt-2 ${committeeStoryInputClassName} resize-y`}
              style={inputStyle}
              placeholder="Pick a time that works for you…"
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard theme={theme} padding="canvas" className="space-y-4">
        <BuilderSectionIntro
          C={C}
          theme={theme}
          eyebrow="Intake form"
          title="Questions on the booking form"
          subtitle="Reorder, require, or add custom questions families answer after choosing a time."
        />

        <PublicTourFieldsEditor
          C={C}
          theme={theme}
          fields={fields}
          disabled={formDisabled}
          onChange={setFields}
        />

        <div className="border-t pt-4" style={{ borderTopColor: theme.line }}>
          <AdminButton
            theme={theme}
            type="button"
            disabled={formDisabled}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving…" : "Save public tour page"}
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  );
}
