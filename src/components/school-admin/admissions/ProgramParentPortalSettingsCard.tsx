"use client";

import { createElement, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { FEATURE_CATALOG } from "@/lib/organization-settings/catalog";
import {
  type ProgramParentPortalEditorState,
  getProgramPortalFeatureScopeBadgeLabel,
  getProgramPortalFeatureScopeTooltip,
  wouldUseIsolatedProgramPortal,
} from "@/lib/admissions/program-parent-portal";
import { mergePortalFeatureNav, resolveFeatureNavItem } from "@/lib/organization-settings/feature-nav";
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
  "View which parent portal features appear in this program's separate portal. Feature toggles are configured by MudKitchen.";

const SECTION_INTRO_EDIT_TOOLTIP =
  "Choose which parent portal features appear in this program's separate portal. Features follow your school-wide parent portal settings.";

const SECTION_INTRO_MAIN_PORTAL_TOOLTIP =
  "This program uses the main parent portal. Families see the school-wide parent features below.";

const PORTAL_LABEL_TOOLTIP =
  "Optional. Shown in the portal header and future context switcher.";

const FEATURES_CARD_TOOLTIP =
  "Only features enabled in Organization settings appear here.";

const HOME_ROW_TOOLTIP =
  "Always included — every parent portal needs a home overview.";

const PHOTOS_LABEL_TOOLTIP =
  'Optional nav label override for the feed feature (e.g. "Photos").';

function inputStyle(C: AdminThemeTokens, disabled: boolean): React.CSSProperties {
  return {
    backgroundColor: disabled ? "#F3F5F4" : "#FCFDFC",
    border: "1px solid #D9E0DA",
    color: C.textPrimary,
    borderRadius: "7px",
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    opacity: disabled ? 0.85 : 1,
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

function ToggleSwitch({
  C,
  checked,
  disabled,
}: {
  C: AdminThemeTokens;
  checked: boolean;
  disabled?: boolean;
}) {
  return (
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
  );
}

function ScopeBadge({
  C,
  label,
  featureLabel,
  content,
}: {
  C: AdminThemeTokens;
  label: string;
  featureLabel: string;
  content: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="rounded border px-1.5 py-0.5 text-[10px] font-medium"
        style={{
          borderColor: C.border,
          backgroundColor: C.bg,
          color: C.textSecondary,
        }}
      >
        {label}
      </span>
      <BuilderInfoTooltip
        C={C}
        content={content}
        ariaLabel={`Scope for ${featureLabel}`}
      />
    </span>
  );
}

type SettingToggleRowProps = {
  C: AdminThemeTokens;
  label: string;
  description?: string;
  infoTooltip?: string;
  scopeBadge?: {
    label: string;
    content: string;
  };
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
  scopeBadge,
  iconSlug,
  checked,
  disabled = false,
  onChange,
}: SettingToggleRowProps) {
  const canToggle = Boolean(onChange) && !disabled;

  return (
    <div
      className="rounded-md border px-3 py-3"
      style={{ borderColor: C.border, backgroundColor: C.surface }}
    >
      <div className="flex w-full items-center gap-3 text-left">
        <FeatureRowIcon iconSlug={iconSlug} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span
              className="text-sm font-medium"
              style={{ color: C.textPrimary }}
            >
              {label}
            </span>
            {infoTooltip ? (
              <BuilderInfoTooltip C={C} content={infoTooltip} ariaLabel={`About ${label}`} />
            ) : null}
            {scopeBadge ? (
              <ScopeBadge
                C={C}
                label={scopeBadge.label}
                featureLabel={label}
                content={scopeBadge.content}
              />
            ) : null}
          </span>
          {description ? (
            <span className="mt-0.5 block text-xs" style={{ color: C.textSecondary }}>
              {description}
            </span>
          ) : null}
        </span>
        {canToggle ? (
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={`${checked ? "Disable" : "Enable"} ${label}`}
            onClick={() => onChange?.(!checked)}
            className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <ToggleSwitch C={C} checked={checked} />
          </button>
        ) : (
          <span role="switch" aria-checked={checked} aria-disabled="true" className="shrink-0">
            <ToggleSwitch C={C} checked={checked} disabled />
          </span>
        )}
      </div>
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
  canEditPortalConfig?: boolean;
  embedded?: boolean;
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
  canEditPortalConfig = false,
  embedded = false,
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
  const canEdit =
    canEditPortalConfig && programParentPortalEnabled && isolationAllowed;
  const showIsolatedPortal = programParentPortalEnabled && isolationAllowed;
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

  const resolveScopeBadge = (key: string) => {
    if (!showIsolatedPortal || !usesSeparatePortal) return undefined;
    const badgeLabel = getProgramPortalFeatureScopeBadgeLabel(
      key as keyof ParentFeatures,
    );
    if (!badgeLabel) return undefined;
    const scope = getProgramPortalFeatureScopeTooltip(key as keyof ParentFeatures);
    if (!scope) return undefined;
    return { label: badgeLabel, content: scope.content };
  };

  const isFeatureChecked = (key: string) => {
    if (showIsolatedPortal) {
      return Boolean((programFeatures as Record<string, boolean>)[key]);
    }
    return Boolean((orgParent as Record<string, boolean>)[key]);
  };

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

  const sectionIntroTooltip = canEdit
    ? SECTION_INTRO_EDIT_TOOLTIP
    : showIsolatedPortal
      ? SECTION_INTRO_TOOLTIP
      : SECTION_INTRO_MAIN_PORTAL_TOOLTIP;

  const statusLine = showIsolatedPortal ? (
    usesSeparatePortal ? (
      portalSlug ? (
        <>
          Separate portal:{" "}
          <code className="rounded bg-black/5 px-1 py-0.5">
            /school/{schoolSlug}/parent/p/{portalSlug}/...
          </code>
        </>
      ) : (
        "Separate portal URL is assigned when you save."
      )
    ) : null
  ) : (
    <>
      Uses the main parent portal:{" "}
      <code className="rounded bg-black/5 px-1 py-0.5">
        /school/{schoolSlug}/parent/...
      </code>
    </>
  );

  const showPhotosLabel =
    showIsolatedPortal && programFeatures.feed && orgParent.feed;

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <AdminSectionKicker theme={theme}>Parent portal</AdminSectionKicker>
            <div className="mt-1.5 flex items-center gap-2">
              <AdminDisplayHeading theme={theme} as="h2" size="canvas">
                Portal configuration
              </AdminDisplayHeading>
              <BuilderInfoTooltip
                C={C}
                content={sectionIntroTooltip}
                ariaLabel="About portal configuration"
              />
            </div>
            {statusLine ? (
              <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
                {statusLine}
              </p>
            ) : null}
          </div>
          {showIsolatedPortal ? (
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
      ) : null}

      {showIsolatedPortal ? (
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
            disabled={!canEdit}
            readOnly={!canEdit}
            style={inputStyle(C, !canEdit)}
          />
        </BuilderQuestionCard>
      ) : null}

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
              scopeBadge={resolveScopeBadge(HOME_CATALOG_ENTRY.key)}
              checked={isFeatureChecked(HOME_CATALOG_ENTRY.key)}
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
              scopeBadge={resolveScopeBadge(entry.key)}
              checked={isFeatureChecked(entry.key)}
              disabled={!canEdit}
              onChange={
                canEdit
                  ? (checked) =>
                      setFeature(entry.key as keyof ParentFeatures, checked)
                  : undefined
              }
            />
          ))}
        </div>
      </BuilderQuestionCard>

      {showPhotosLabel ? (
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
            disabled={!canEdit}
            readOnly={!canEdit}
            style={inputStyle(C, !canEdit)}
          />
        </BuilderQuestionCard>
      ) : null}

      {showIsolatedPortal ? (
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
      ) : null}
    </div>
  );
}
