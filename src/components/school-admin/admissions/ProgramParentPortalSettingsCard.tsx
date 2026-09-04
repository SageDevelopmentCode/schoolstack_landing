"use client";

import { createElement, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { FEATURE_CATALOG } from "@/lib/organization-settings/catalog";
import {
  type ProgramParentPortalEditorState,
  wouldUseIsolatedProgramPortal,
} from "@/lib/admissions/program-parent-portal";
import {
  mergePortalFeatureNav,
  resolveFeatureNavItem,
} from "@/lib/organization-settings/feature-nav";
import { describeParentPortalCalendarScope } from "@/lib/school-events/event-audience";
import { describeParentPortalMessagesScope } from "@/lib/messages/message-audience";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { getParentFeatureIconStyle } from "@/lib/organization-settings/parent-feature-icon-styles";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
  ParentFeatures,
} from "@/lib/organization-settings/types";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import {
  BuilderQuestionCard,
} from "./builder-question-card";
import BuilderInfoTooltip from "./BuilderInfoTooltip";
import ProgramParentPortalPreviewModal from "./ProgramParentPortalPreviewModal";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const PARENT_FEATURE_CATALOG = FEATURE_CATALOG.filter(
  (entry) => entry.portal === "parent",
);

const HOME_CATALOG_ENTRY = PARENT_FEATURE_CATALOG.find(
  (entry) => entry.key === "portal",
);

const SECTION_INTRO_TOOLTIP =
  "Choose which parent portal features appear in this program's separate portal. Features follow your school-wide parent portal settings.";

const SECTION_INTRO_READONLY_TOOLTIP =
  "This program uses the main parent portal. Separate program portals are enabled by MudKitchen for specific programs.";

const PORTAL_LABEL_TOOLTIP =
  "Optional. Shown in the portal header and future context switcher.";

const FEATURES_CARD_TOOLTIP =
  "Only features enabled in Organization settings appear here.";

const HOME_ROW_TOOLTIP =
  "Always included — every parent portal needs a home overview.";

const PHOTOS_LABEL_TOOLTIP =
  'Optional nav label override for the feed feature (e.g. "Photos").';

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: "#FCFDFC",
    border: "1px solid #D9E0DA",
    color: C.textPrimary,
    borderRadius: "7px",
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

function FeatureRowIcon({ iconSlug }: { iconSlug: string }) {
  const { iconBg, iconColor } = getParentFeatureIconStyle(iconSlug);
  const icon = getFeatureIcon(iconSlug);

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}
    >
      {createElement(icon, { className: `h-4 w-4 ${iconColor}` })}
    </div>
  );
}

type SettingToggleRowProps = {
  C: AdminThemeTokens;
  label: string;
  description?: string;
  infoTooltip?: string;
  iconSlug: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};

function SettingToggleRow({
  C,
  label,
  description,
  infoTooltip,
  iconSlug,
  checked,
  disabled = false,
  onChange,
}: SettingToggleRowProps) {
  const content = (
    <>
      <FeatureRowIcon iconSlug={iconSlug} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className="block text-sm font-medium"
            style={{ color: C.textPrimary }}
          >
            {label}
          </span>
          {infoTooltip ? (
            <BuilderInfoTooltip C={C} content={infoTooltip} ariaLabel={`About ${label}`} />
          ) : null}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs" style={{ color: C.textSecondary }}>
            {description}
          </span>
        ) : null}
      </span>
      <span
        className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{
          backgroundColor: checked ? C.accent : C.border,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span
          className="inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform"
          style={{
            transform: checked ? "translateX(1.25rem)" : "translateX(0.125rem)",
          }}
        />
      </span>
    </>
  );

  return (
    <div
      className="rounded-md border px-3 py-3"
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
      {disabled || !onChange ? (
        <div
          className="flex w-full items-center gap-3 text-left"
          aria-disabled="true"
        >
          {content}
        </div>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className="flex w-full items-center gap-3 text-left"
        >
          {content}
        </button>
      )}
    </div>
  );
}

type ProgramParentPortalSettingsCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  branding: OrganizationBranding;
  organizationId: string;
  programName: string;
  orgFeatures: OrganizationFeatures;
  schoolSlug: string;
  schoolName: string;
  portalSlug: string | null;
  editor: ProgramParentPortalEditorState;
  isolationAllowed: boolean;
  programParentPortalEnabled: boolean;
  onChange: (next: ProgramParentPortalEditorState) => void;
};

export default function ProgramParentPortalSettingsCard({
  C,
  theme,
  branding,
  organizationId,
  programName,
  orgFeatures,
  schoolSlug,
  schoolName,
  portalSlug,
  editor,
  isolationAllowed,
  programParentPortalEnabled,
  onChange,
}: ProgramParentPortalSettingsCardProps) {
  const orgParent = orgFeatures.parent;
  const programFeatures = editor.features;
  const portalGovernance = { isolationAllowed };
  const usesSeparatePortal = wouldUseIsolatedProgramPortal(
    editor,
    orgFeatures,
    portalGovernance,
  );
  const isReadOnly = !programParentPortalEnabled || !isolationAllowed;
  const [previewOpen, setPreviewOpen] = useState(false);

  const mergedParentNav = useMemo(
    () => mergePortalFeatureNav("parent", orgFeatures.feature_nav?.parent),
    [orgFeatures.feature_nav?.parent],
  );

  const resolveIconSlug = (key: string) =>
    resolveFeatureNavItem("parent", key, mergedParentNav).icon ?? "puzzle";

  const showHomeRow = Boolean(orgParent.portal) && HOME_CATALOG_ENTRY;

  const configurableFeatures = useMemo(
    () =>
      PARENT_FEATURE_CATALOG.filter(
        (entry) =>
          entry.key !== "portal" &&
          Boolean((orgParent as Record<string, boolean>)[entry.key]),
      ),
    [orgParent],
  );

  const enabledTabLabels = useMemo(() => {
    const labels: string[] = [];
    if (showHomeRow && HOME_CATALOG_ENTRY) {
      labels.push(HOME_CATALOG_ENTRY.label);
    }
    for (const entry of configurableFeatures) {
      if ((programFeatures as Record<string, boolean>)[entry.key]) {
        labels.push(entry.label);
      }
    }
    return labels;
  }, [configurableFeatures, programFeatures, showHomeRow]);

  const setFeature = (key: keyof ParentFeatures, enabled: boolean) => {
    onChange({
      ...editor,
      features: {
        ...programFeatures,
        [key]: enabled,
      },
    });
  };

  const setLabel = (label: string) => {
    onChange({
      ...editor,
      label: label.trim() || undefined,
    });
  };

  const setFeedLabel = (label: string) => {
    onChange({
      ...editor,
      feature_nav: {
        parent: {
          ...(editor.feature_nav?.parent ?? {}),
          items: {
            ...(editor.feature_nav?.parent?.items ?? {}),
            feed: {
              ...(editor.feature_nav?.parent?.items?.feed ?? {}),
              label: label.trim() || undefined,
            },
          },
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <AdminSectionKicker theme={theme}>Parent portal</AdminSectionKicker>
          <div className="mt-1.5 flex items-center gap-2">
            <AdminDisplayHeading theme={theme} as="h2" size="canvas">
              Portal configuration
            </AdminDisplayHeading>
            <BuilderInfoTooltip
              C={C}
              content={
                isReadOnly ? SECTION_INTRO_READONLY_TOOLTIP : SECTION_INTRO_TOOLTIP
              }
              ariaLabel="About portal configuration"
            />
          </div>
        </div>
        {!isReadOnly ? (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold"
            style={getAdminButtonStyle(C, "warning")}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        ) : null}
      </div>

      <div
        className="rounded-md border px-3 py-3 text-sm"
        style={{
          borderColor: C.border,
          backgroundColor: C.surface,
          color: C.textSecondary,
        }}
      >
        {isReadOnly ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Uses the main parent portal.
              </span>{" "}
              Separate program portals are configured by MudKitchen.
            </p>
            <p>
              This program&apos;s families use{" "}
              <code className="rounded bg-black/5 px-1 py-0.5">
                /school/{schoolSlug}/parent/...
              </code>
              .
            </p>
          </div>
        ) : usesSeparatePortal && portalSlug ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Isolated now:
              </span>{" "}
              separate portal at{" "}
              <code className="rounded bg-black/5 px-1 py-0.5">
                /school/{schoolSlug}/parent/p/{portalSlug}/...
              </code>
              {enabledTabLabels.length > 0 ? (
                <>
                  {" "}
                  with {enabledTabLabels.join(", ")}.
                </>
              ) : (
                "."
              )}
            </p>
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Calendar:
              </span>{" "}
              {describeParentPortalCalendarScope(true)}
            </p>
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Messages:
              </span>{" "}
              {describeParentPortalMessagesScope(true)}
            </p>
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Still shared:
              </span>{" "}
              Billing, feed, and other content stay org-wide for now.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Separate parent portal enabled for this program.
              </span>{" "}
              Portal URL will be assigned when you save.
            </p>
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Calendar:
              </span>{" "}
              {describeParentPortalCalendarScope(true)}
            </p>
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Messages:
              </span>{" "}
              {describeParentPortalMessagesScope(true)}
            </p>
            <p>
              <span className="font-medium" style={{ color: C.textPrimary }}>
                Still shared:
              </span>{" "}
              Billing, feed, and other content stay org-wide for now.
            </p>
          </div>
        )}
      </div>

      {isReadOnly ? null : (
        <>
      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="Portal label"
        action={
          <BuilderInfoTooltip
            C={C}
            content={PORTAL_LABEL_TOOLTIP}
            ariaLabel="About portal label"
          />
        }
      >
        <input
          type="text"
          value={editor.label ?? ""}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Defaults to program name"
          style={inputStyle(C)}
        />
      </BuilderQuestionCard>

      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="Parent portal features"
        action={
          <BuilderInfoTooltip
            C={C}
            content={FEATURES_CARD_TOOLTIP}
            ariaLabel="About parent portal features"
          />
        }
      >
        <div className="space-y-2">
          {showHomeRow && HOME_CATALOG_ENTRY ? (
            <SettingToggleRow
              C={C}
              iconSlug={resolveIconSlug(HOME_CATALOG_ENTRY.key)}
              label={HOME_CATALOG_ENTRY.label}
              description={HOME_CATALOG_ENTRY.description}
              infoTooltip={HOME_ROW_TOOLTIP}
              checked
              disabled
            />
          ) : null}
          {configurableFeatures.map((entry) => (
            <SettingToggleRow
              key={entry.key}
              C={C}
              iconSlug={resolveIconSlug(entry.key)}
              label={entry.label}
              description={entry.description}
              checked={Boolean(
                (programFeatures as Record<string, boolean>)[entry.key],
              )}
              onChange={(checked) =>
                setFeature(entry.key as keyof ParentFeatures, checked)
              }
            />
          ))}
        </div>
      </BuilderQuestionCard>

      {programFeatures.feed && orgParent.feed ? (
        <BuilderQuestionCard
          C={C}
          tone="accent"
          question="Photos label"
          action={
            <BuilderInfoTooltip
              C={C}
              content={PHOTOS_LABEL_TOOLTIP}
              ariaLabel="About photos label"
            />
          }
        >
          <input
            type="text"
            value={editor.feature_nav?.parent?.items?.feed?.label ?? ""}
            onChange={(e) => setFeedLabel(e.target.value)}
            placeholder="Photos"
            style={inputStyle(C)}
          />
        </BuilderQuestionCard>
      ) : null}

      <ProgramParentPortalPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        branding={branding}
        orgFeatures={orgFeatures}
        editor={editor}
        schoolSlug={schoolSlug}
        schoolName={schoolName}
        organizationId={organizationId}
        programName={programName}
        portalSlug={portalSlug}
        isolationAllowed={isolationAllowed}
      />
        </>
      )}
    </div>
  );
}
