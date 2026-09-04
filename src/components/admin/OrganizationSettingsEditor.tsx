"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  createElement,
  type ChangeEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { ChevronDown, ChevronRight, GripVertical, Loader2, Plus, Trash2, Upload } from "lucide-react";
import ButtonLoadingLabel, {
  BUTTON_LOADING_LAYOUT_CLASS,
} from "@/components/ui/ButtonLoadingLabel";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { createClient } from "@/utils/supabase/client";
import {
  addCustomPortalFeature,
  canAddPortalFeatureKey,
  extractCustomPortalFeatureKeys,
  humanizeFeatureKey,
  normalizeFeatureKey,
  removeCustomPortalFeature,
  updateFeatureNavItemForPortal,
} from "@/lib/organization-settings/features";
import {
  addPortalGroup,
  countFeaturesInGroup,
  ensurePortalNav,
  getFeatureNavChildLabel,
  hasDefaultFeatureChildren,
  removePortalGroup,
  resolveFeatureNavChildren,
  resolveFeatureNavItem,
  resolvePortalFeatureOrder,
  setFeatureNavChildren,
  setPortalFeatureOrder,
  updatePortalNav,
} from "@/lib/organization-settings/feature-nav";
import {
  DEFAULT_FEATURE_ICON_SLUG,
  FEATURE_ICON_OPTIONS,
  getFeatureIcon,
} from "@/lib/organization-settings/icon-registry";
import {
  BRANDING_FIELDS,
  DEFAULT_APPLY_AUTH_ENTRY_OPTIONS,
  DEFAULT_FEATURES,
  DEFAULT_PARENT_ONBOARDING_ITEMS,
  FEATURE_CATALOG,
  PORTAL_LABELS,
} from "@/lib/organization-settings/catalog";
import {
  getDefaultSettings,
  mergeBranding,
  mergeFeatures,
} from "@/lib/organization-settings/merge";
import {
  getBrandingValue,
  serializeSettings,
  setBrandingValue,
  toColorInputValue,
} from "@/lib/organization-settings/paths";
import {
  OrganizationLogoUploadError,
  uploadOrganizationLogo,
} from "@/lib/organization-settings/logo-storage";
import {
  getCustomOnboardingUrl,
  isCustomOnboardingUrlTarget,
  toCustomOnboardingUrlTarget,
} from "@/lib/organization-settings/parent-onboarding";
import {
  describeShadowDayModeChangeImpact,
  getShadowDayAvailabilityImpact,
  parseAdmissionsOrgSettings,
  resolveShadowDaySchedulingMode,
  SHADOW_DAY_SCHEDULING_MODE_OPTIONS,
  SHADOW_DAY_SCHEDULING_QUESTION,
  type AdmissionsOrgSettings,
  type ShadowDaySchedulingMode,
} from "@/lib/admissions/admissions-org-settings";
import {
  listProgramsDetailed,
  updateProgram,
  type Program,
} from "@/lib/admissions/programs";
import {
  buildInitialIsolatedProgramPortalSettings,
  parseProgramParentPortalOrgConfig,
} from "@/lib/admissions/program-parent-portal-governance";
import {
  deriveProgramPortalSettingsFromEditor,
  expandProgramPortalSettingsForEditor,
  programPortalEditorStatesEqual,
  type ProgramParentPortalEditorState,
} from "@/lib/admissions/program-parent-portal";
import ProgramParentPortalSettingsCard from "@/components/school-admin/admissions/ProgramParentPortalSettingsCard";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
} from "@/lib/organization-settings/parent-theme";
import type {
  ApplyAuthEntryOption,
  OrganizationBranding,
  OrganizationFeatures,
  OrganizationSettingsRow,
  ParentOnboardingItem,
  Portal,
  FeaturePortal,
  FeatureNavChildConfig,
} from "@/lib/organization-settings/types";

type NewCustomFeatureForm = {
  key: string;
  label: string;
  icon: string;
  group: string;
};

const EMPTY_CUSTOM_FORM: NewCustomFeatureForm = {
  key: "",
  label: "",
  icon: DEFAULT_FEATURE_ICON_SLUG,
  group: "Main",
};

const fieldClass =
  "text-sm border border-admin-border rounded-admin-sm px-2 py-1.5 bg-admin-bg";
const compactSelectTriggerClass =
  "rounded-admin-sm px-2 py-1 h-8";

const FEATURE_PORTALS = ["admin", "teacher", "parent", "additional"] as const;
type FeaturePortalTab = (typeof FEATURE_PORTALS)[number];

type Props = {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  initialRow: OrganizationSettingsRow | null;
  settingsLoading?: boolean;
  onSaved?: () => void | Promise<void>;
};

export default function OrganizationSettingsEditor({
  organizationId,
  organizationSlug,
  organizationName,
  initialRow,
  settingsLoading = false,
  onSaved,
}: Props) {
  const supabase = createClient();
  const [hasRow, setHasRow] = useState(!!initialRow);
  const [branding, setBranding] = useState<OrganizationBranding>(() =>
    initialRow
      ? mergeBranding(initialRow.branding as unknown as Record<string, unknown>)
      : getDefaultSettings().branding,
  );
  const [features, setFeatures] = useState<OrganizationFeatures>(() =>
    initialRow
      ? mergeFeatures(initialRow.features as unknown as Record<string, unknown>)
      : getDefaultSettings().features,
  );
  const [admissions, setAdmissions] = useState<AdmissionsOrgSettings>(() =>
    parseAdmissionsOrgSettings(initialRow?.admissions),
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeSettings(
      initialRow
        ? mergeBranding(initialRow.branding as unknown as Record<string, unknown>)
        : getDefaultSettings().branding,
      initialRow
        ? (mergeFeatures(
            initialRow.features as unknown as Record<string, unknown>,
          ) as unknown as Record<string, unknown>)
        : (getDefaultSettings().features as unknown as Record<string, unknown>),
    ),
  );
  const [savedAdmissionsSnapshot, setSavedAdmissionsSnapshot] = useState(() =>
    JSON.stringify(parseAdmissionsOrgSettings(initialRow?.admissions)),
  );
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [logoOpen, setLogoOpen] = useState(() =>
    Boolean(
      initialRow?.branding &&
        typeof initialRow.branding === "object" &&
        "logo" in initialRow.branding &&
        (initialRow.branding as OrganizationBranding).logo?.src?.trim(),
    ),
  );
  const [typographyOpen, setTypographyOpen] = useState(false);
  const [newPortalFeatureKeys, setNewPortalFeatureKeys] = useState<
    Partial<Record<FeaturePortal, string>>
  >({});
  const [newCustomFeatureForms, setNewCustomFeatureForms] = useState<
    Partial<Record<Portal, NewCustomFeatureForm>>
  >({});
  const [newSubsectionNames, setNewSubsectionNames] = useState<
    Partial<Record<Portal, string>>
  >({});
  const [activeFeaturePortal, setActiveFeaturePortal] =
    useState<FeaturePortalTab>("admin");
  const [expandedSubtabParents, setExpandedSubtabParents] = useState<
    Partial<Record<Portal, Record<string, boolean>>>
  >({});
  const [orgPrograms, setOrgPrograms] = useState<Program[]>([]);
  const [orgProgramsLoading, setOrgProgramsLoading] = useState(false);
  const [programPortalEditors, setProgramPortalEditors] = useState<
    Record<string, ProgramParentPortalEditorState>
  >({});
  const [expandedProgramPortalIds, setExpandedProgramPortalIds] = useState<
    Record<string, boolean>
  >({});

  const parentTheme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const parentAdminCompat = useMemo(
    () => parentThemeToAdminCompat(parentTheme),
    [parentTheme],
  );

  useEffect(() => {
    if (settingsLoading) return;
    queueMicrotask(() => {
      const mergedBranding = initialRow
        ? mergeBranding(initialRow.branding as unknown as Record<string, unknown>)
        : getDefaultSettings().branding;
      const mergedFeatures = initialRow
        ? mergeFeatures(initialRow.features as unknown as Record<string, unknown>)
        : getDefaultSettings().features;
      const mergedAdmissions = parseAdmissionsOrgSettings(initialRow?.admissions);

      setHasRow(!!initialRow);
      setBranding(mergedBranding);
      setFeatures(mergedFeatures);
      setAdmissions(mergedAdmissions);
      setSavedSnapshot(
        serializeSettings(
          mergedBranding,
          mergedFeatures as unknown as Record<string, unknown>,
        ),
      );
      setSavedAdmissionsSnapshot(JSON.stringify(mergedAdmissions));
      setSaveMessage(null);
      setError(null);
      setLogoOpen(Boolean(mergedBranding.logo?.src?.trim()));
      setActiveFeaturePortal("admin");
    });
  }, [organizationId, initialRow, settingsLoading]);

  const savedShadowDayMode = useMemo(
    () =>
      resolveShadowDaySchedulingMode(
        parseAdmissionsOrgSettings(JSON.parse(savedAdmissionsSnapshot)),
      ),
    [savedAdmissionsSnapshot],
  );
  const currentShadowDayMode = resolveShadowDaySchedulingMode(admissions);
  const programPortalConfig = useMemo(
    () => parseProgramParentPortalOrgConfig(admissions),
    [admissions],
  );
  const portalProgramSummary = useMemo(() => {
    const isolatedIds = new Set(programPortalConfig.isolated_program_ids);
    const isolatedPrograms = orgPrograms.filter((program) =>
      isolatedIds.has(program.id),
    );
    return {
      isolatedPrograms,
      isolatedCount: isolatedPrograms.length,
      mainCount: orgPrograms.length - isolatedPrograms.length,
    };
  }, [orgPrograms, programPortalConfig.isolated_program_ids]);

  useEffect(() => {
    if (!programPortalConfig.enabled) {
      queueMicrotask(() => setOrgPrograms([]));
      return;
    }

    let cancelled = false;
    queueMicrotask(async () => {
      setOrgProgramsLoading(true);
      try {
        const rows = await listProgramsDetailed(supabase, organizationId);
        if (!cancelled) setOrgPrograms(rows);
      } catch {
        if (!cancelled) setOrgPrograms([]);
      } finally {
        if (!cancelled) setOrgProgramsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [organizationId, programPortalConfig.enabled, supabase]);

  useEffect(() => {
    if (!programPortalConfig.enabled || orgPrograms.length === 0) {
      queueMicrotask(() => setProgramPortalEditors({}));
      return;
    }

    const orgParent = features.parent ?? DEFAULT_FEATURES.parent;
    queueMicrotask(() => {
      setProgramPortalEditors((prev) => {
        const next: Record<string, ProgramParentPortalEditorState> = {};
        for (const programId of programPortalConfig.isolated_program_ids) {
          const program = orgPrograms.find((row) => row.id === programId);
          if (!program) continue;
          next[programId] =
            prev[programId] ??
            expandProgramPortalSettingsForEditor(
              program.parent_portal_settings,
              orgParent,
            );
        }
        return next;
      });
    });
  }, [
    features.parent,
    orgPrograms,
    programPortalConfig.enabled,
    programPortalConfig.isolated_program_ids,
  ]);

  const programPortalEditorsDirty = useMemo(() => {
    if (!programPortalConfig.enabled) return false;
    const governance = { isolationAllowed: true };
    const orgParent = features.parent ?? DEFAULT_FEATURES.parent;

    for (const programId of programPortalConfig.isolated_program_ids) {
      const program = orgPrograms.find((row) => row.id === programId);
      const editor = programPortalEditors[programId];
      if (!program || !editor) continue;

      const savedEditor = expandProgramPortalSettingsForEditor(
        program.parent_portal_settings,
        orgParent,
      );
      if (
        !programPortalEditorStatesEqual(
          editor,
          savedEditor,
          features,
          governance,
        )
      ) {
        return true;
      }
    }

    return false;
  }, [features, orgPrograms, programPortalConfig, programPortalEditors]);

  const isDirty = useMemo(
    () =>
      serializeSettings(
        branding,
        features as unknown as Record<string, unknown>,
      ) !== savedSnapshot ||
      JSON.stringify(admissions) !== savedAdmissionsSnapshot ||
      programPortalEditorsDirty,
    [
      admissions,
      branding,
      features,
      programPortalEditorsDirty,
      savedAdmissionsSnapshot,
      savedSnapshot,
    ],
  );

  const brandingGroups = useMemo(() => {
    const groups = new Map<string, typeof BRANDING_FIELDS>();
    for (const field of BRANDING_FIELDS) {
      const list = groups.get(field.group) ?? [];
      list.push(field);
      groups.set(field.group, list);
    }
    return Array.from(groups.entries());
  }, []);

  const featuresByPortal = useMemo(() => {
    const map = new Map<string, typeof FEATURE_CATALOG>();
    for (const def of FEATURE_CATALOG) {
      const list = map.get(def.portal) ?? [];
      list.push(def);
      map.set(def.portal, list);
    }
    return map;
  }, []);

  const parentOnboardingTargetOptions = useMemo(
    () => [
      ...FEATURE_CATALOG.filter(
        (def) => def.portal === "parent" && def.key !== "portal",
      ).map((def) => ({ key: def.key, label: def.label })),
      { key: "health", label: "Children — health profile" },
    ],
    [],
  );

  const onboardingItems = features.parent_onboarding?.items ?? DEFAULT_PARENT_ONBOARDING_ITEMS;
  const applyAuthEntryOptions =
    features.apply_auth_entry?.options ?? DEFAULT_APPLY_AUTH_ENTRY_OPTIONS;

  const setOnboardingItems = useCallback((items: ParentOnboardingItem[]) => {
    setFeatures((prev) => ({
      ...prev,
      parent_onboarding: { items },
    }));
  }, []);

  const setApplyAuthEntryOptions = useCallback((options: ApplyAuthEntryOption[]) => {
    setFeatures((prev) => ({
      ...prev,
      apply_auth_entry: { options },
    }));
  }, []);

  const initializeDefaults = useCallback(() => {
    const defaults = getDefaultSettings();
    setBranding(defaults.branding);
    setFeatures(defaults.features);
    setNewPortalFeatureKeys({});
    setNewCustomFeatureForms({});
    setNewSubsectionNames({});
    setError(null);
    setSaveMessage(null);
    setLogoUploadError(null);
  }, []);

  const handleLogoFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setLogoUploading(true);
      setLogoUploadError(null);
      setSaveMessage(null);

      try {
        const publicUrl = await uploadOrganizationLogo(
          supabase,
          organizationId,
          file,
        );
        setBranding((current) =>
          setBrandingValue(current, "logo.src", publicUrl),
        );
        setLogoOpen(true);
      } catch (uploadError) {
        setLogoUploadError(
          uploadError instanceof OrganizationLogoUploadError
            ? uploadError.message
            : uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload logo.",
        );
      } finally {
        setLogoUploading(false);
      }
    },
    [organizationId, supabase],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSaveMessage(null);

    if (currentShadowDayMode !== savedShadowDayMode) {
      try {
        const impact = await getShadowDayAvailabilityImpact(supabase, organizationId);
        if (impact.hasData) {
          const confirmed = window.confirm(
            `Change how families book shadow days?\n\n${describeShadowDayModeChangeImpact(impact)}`,
          );
          if (!confirmed) {
            setSaving(false);
            return;
          }
        }
      } catch (impactError) {
        setSaving(false);
        setError(
          impactError instanceof Error
            ? impactError.message
            : "Failed to check existing shadow day data.",
        );
        return;
      }
    }

    const payload = {
      organization_id: organizationId,
      branding: branding as unknown as Record<string, unknown>,
      features: features as unknown as Record<string, unknown>,
      admissions,
    };

    const { error: upsertError } = await supabase
      .from("organization_settings")
      .upsert(payload, { onConflict: "organization_id" });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    const prevPortalConfig = parseProgramParentPortalOrgConfig(
      JSON.parse(savedAdmissionsSnapshot),
    );
    const nextPortalConfig = parseProgramParentPortalOrgConfig(admissions);
    const prevIsolatedIds = new Set(
      prevPortalConfig.enabled ? prevPortalConfig.isolated_program_ids : [],
    );
    const nextIsolatedIds = new Set(
      nextPortalConfig.enabled ? nextPortalConfig.isolated_program_ids : [],
    );
    const addedProgramIds = [...nextIsolatedIds].filter(
      (id) => !prevIsolatedIds.has(id),
    );
    const removedProgramIds = [...prevIsolatedIds].filter(
      (id) => !nextIsolatedIds.has(id),
    );

    const governance = { isolationAllowed: true };
    const orgParent = features.parent ?? DEFAULT_FEATURES.parent;
    const portalUpdatePromises: Promise<Program>[] = [];

    for (const programId of removedProgramIds) {
      portalUpdatePromises.push(
        updateProgram(supabase, programId, organizationId, {
          parent_portal_settings: { mode: "inherit" },
        }),
      );
    }

    for (const programId of nextIsolatedIds) {
      const program = orgPrograms.find((row) => row.id === programId);
      const editor = programPortalEditors[programId];
      if (!program || !editor) continue;

      const savedEditor = expandProgramPortalSettingsForEditor(
        program.parent_portal_settings,
        orgParent,
      );
      const shouldUpdate =
        addedProgramIds.includes(programId) ||
        !programPortalEditorStatesEqual(
          editor,
          savedEditor,
          features,
          governance,
        );

      if (shouldUpdate) {
        portalUpdatePromises.push(
          updateProgram(supabase, programId, organizationId, {
            parent_portal_settings: deriveProgramPortalSettingsFromEditor(
              editor,
              features,
              governance,
            ),
          }),
        );
      }
    }

    if (portalUpdatePromises.length > 0) {
      try {
        const updatedPrograms = await Promise.all(portalUpdatePromises);
        if (programPortalConfig.enabled) {
          const rows = await listProgramsDetailed(supabase, organizationId);
          setOrgPrograms(rows);
          setProgramPortalEditors((prev) => {
            const next = { ...prev };
            for (const program of updatedPrograms) {
              if (nextIsolatedIds.has(program.id)) {
                next[program.id] = expandProgramPortalSettingsForEditor(
                  program.parent_portal_settings,
                  orgParent,
                );
              }
            }
            return next;
          });
        }
      } catch (syncError) {
        setError(
          syncError instanceof Error
            ? syncError.message
            : "Settings saved, but program portal sync failed.",
        );
        return;
      }
    }

    setHasRow(true);
    setSavedSnapshot(
      serializeSettings(
        branding,
        payload.features as Record<string, unknown>,
      ),
    );
    setSavedAdmissionsSnapshot(JSON.stringify(admissions));
    setSaveMessage("Settings saved.");
    await onSaved?.();
  }, [
    admissions,
    branding,
    currentShadowDayMode,
    features,
    onSaved,
    organizationId,
    orgPrograms,
    programPortalConfig.enabled,
    programPortalEditors,
    savedAdmissionsSnapshot,
    savedShadowDayMode,
    supabase,
  ]);

  const setShadowDaySchedulingMode = (mode: ShadowDaySchedulingMode) => {
    setAdmissions((current) => ({
      ...current,
      shadowDaySchedulingMode: mode,
    }));
  };

  const setPortalFeature = (
    portal: Portal,
    key: string,
    enabled: boolean,
  ) => {
    setFeatures((prev) => {
      const portalFeatures = { ...(prev[portal] as Record<string, boolean>) };
      portalFeatures[key] = enabled;
      return { ...prev, [portal]: portalFeatures } as OrganizationFeatures;
    });
  };

  const setAdditionalFeature = (key: string, enabled: boolean) => {
    setFeatures((prev) => ({ ...prev, [key]: enabled }));
  };

  const updatePortalNavItem = (
    portal: Portal,
    key: string,
    patch: { group?: string; label?: string; icon?: string },
  ) => {
    setFeatures((prev) => updateFeatureNavItemForPortal(prev, portal, key, patch));
  };

  const reorderPortalFeatures = (portal: Portal, order: string[]) => {
    setFeatures((prev) => {
      const nav = ensurePortalNav(prev, portal);
      return updatePortalNav(prev, portal, setPortalFeatureOrder(nav, order));
    });
  };

  const reorderFeatureChildren = (
    portal: Portal,
    parentKey: string,
    childKeys: string[],
  ) => {
    setFeatures((prev) => {
      const nav = ensurePortalNav(prev, portal);
      const children = resolveFeatureNavChildren(portal, parentKey, nav);
      const byKey = new Map(children.map((child) => [child.key, child]));
      const nextChildren = childKeys
        .map((key) => byKey.get(key))
        .filter((child): child is FeatureNavChildConfig => Boolean(child));
      return updatePortalNav(
        prev,
        portal,
        setFeatureNavChildren(nav, parentKey, nextChildren),
      );
    });
  };

  const updateFeatureChild = (
    portal: Portal,
    parentKey: string,
    childKey: string,
    patch: Partial<FeatureNavChildConfig>,
  ) => {
    setFeatures((prev) => {
      const nav = ensurePortalNav(prev, portal);
      const children = resolveFeatureNavChildren(portal, parentKey, nav);
      const nextChildren = children.map((child) =>
        child.key === childKey ? { ...child, ...patch } : child,
      );
      return updatePortalNav(
        prev,
        portal,
        setFeatureNavChildren(nav, parentKey, nextChildren),
      );
    });
  };

  const addSubsection = (portal: Portal) => {
    const name = (newSubsectionNames[portal] ?? "").trim();
    if (!name) return;

    setFeatures((prev) => {
      const nav = ensurePortalNav(prev, portal);
      return updatePortalNav(prev, portal, addPortalGroup(nav, name));
    });
    setNewSubsectionNames((prev) => ({ ...prev, [portal]: "" }));
  };

  const deleteSubsection = (portal: Portal, groupName: string) => {
    setFeatures((prev) => {
      const nav = ensurePortalNav(prev, portal);
      if (countFeaturesInGroup(nav, groupName) > 0) return prev;
      return updatePortalNav(prev, portal, removePortalGroup(nav, groupName));
    });
  };

  const addCustomPortalFeatureKey = (portal: FeaturePortal) => {
    if (portal === "additional") {
      const raw = newPortalFeatureKeys[portal] ?? "";
      const key = normalizeFeatureKey(raw);
      if (!canAddPortalFeatureKey(portal, features, key)) return;
      setFeatures((prev) => addCustomPortalFeature(prev, portal, key));
      setNewPortalFeatureKeys((prev) => ({ ...prev, [portal]: "" }));
      return;
    }

    const form = newCustomFeatureForms[portal] ?? EMPTY_CUSTOM_FORM;
    const key = normalizeFeatureKey(form.key);
    const label = form.label.trim();
    const group = form.group.trim() || ensurePortalNav(features, portal).groups[0] || "Main";

    if (!canAddPortalFeatureKey(portal, features, key) || !label) return;

    setFeatures((prev) =>
      addCustomPortalFeature(prev, portal, key, {
        label,
        icon: form.icon || DEFAULT_FEATURE_ICON_SLUG,
        group,
      }),
    );
    setNewCustomFeatureForms((prev) => ({
      ...prev,
      [portal]: {
        ...EMPTY_CUSTOM_FORM,
        group,
        icon: form.icon || DEFAULT_FEATURE_ICON_SLUG,
      },
    }));
  };

  const removeCustomPortalFeatureKey = (portal: FeaturePortal, key: string) => {
    setFeatures((prev) => removeCustomPortalFeature(prev, portal, key));
  };

  if (settingsLoading) {
    return (
      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4">
        <p className="text-sm text-admin-faint font-secondary">
          Loading organization settings…
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {!hasRow ? (
        <div className="bg-admin-accent-soft/30 border border-admin-accent/20 rounded-admin-md px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-admin-muted font-secondary">
            No settings row yet for {organizationName}. Edit below and click
            Save settings to create one.
          </p>
          <button
            type="button"
            onClick={initializeDefaults}
            className="text-sm px-3 py-1.5 rounded-admin-md border border-admin-border bg-admin-surface hover:bg-admin-bg transition-colors font-secondary"
          >
            Initialize defaults
          </button>
        </div>
      ) : null}

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Branding preview
        </h2>
        <div
          className="rounded-admin-md border p-4 space-y-3"
          style={{
            backgroundColor: branding.colors.bg,
            borderColor: branding.colors.border,
          }}
        >
          <LogoPreview branding={branding} />
          <h3
            className="text-base font-semibold font-display"
            style={{ color: branding.colors.textPrimary }}
          >
            {organizationName}
          </h3>
          <p
            className="text-sm font-secondary"
            style={{ color: branding.colors.textSecondary }}
          >
            Sample body text for parent and admin portals.
          </p>
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-admin-md text-white font-secondary"
            style={{ backgroundColor: branding.colors.accent }}
          >
            Primary action
          </button>
        </div>
      </section>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Branding
        </h2>

        {brandingGroups
          .filter(
            ([group]) => group !== "Logo" && group !== "Typography",
          )
          .map(([group, fields]) => (
            <div key={group} className="space-y-2">
              <h3 className="text-xs font-medium text-admin-muted font-secondary">
                {group}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map((field) => {
                  const raw = getBrandingValue(branding, field.path);
                  if (field.type !== "color") return null;
                  const hex = toColorInputValue(String(raw));
                  return (
                    <label
                      key={field.path}
                      className="flex items-center gap-2 text-xs font-secondary"
                    >
                      <input
                        type="color"
                        value={hex}
                        onChange={(e) =>
                          setBranding((b) =>
                            setBrandingValue(b, field.path, e.target.value),
                          )
                        }
                        className="w-8 h-8 rounded border border-admin-border cursor-pointer shrink-0"
                      />
                      <span className="text-admin-muted min-w-0 flex-1 truncate">
                        {field.label}
                      </span>
                      <input
                        type="text"
                        value={String(raw)}
                        onChange={(e) =>
                          setBranding((b) =>
                            setBrandingValue(b, field.path, e.target.value),
                          )
                        }
                        className="w-28 text-[11px] font-mono border border-admin-border rounded px-1.5 py-1 bg-admin-bg"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

        <CollapsibleSection
          title="Logo"
          open={logoOpen}
          onToggle={() => setLogoOpen((v) => !v)}
        >
          <div className="pt-2 space-y-3">
            <LogoPreview branding={branding} compact />
            <p className="text-xs text-admin-faint font-secondary">
              Used in the school admin sidebar, apply flow, and other
              parent-facing pages. Images are optimized automatically before
              upload.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoFileChange}
              />
              <button
                type="button"
                disabled={logoUploading || saving}
                onClick={() => logoFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-admin-md border border-admin-border bg-admin-bg hover:bg-admin-surface disabled:opacity-60"
              >
                {logoUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {logoUploading ? "Uploading…" : "Upload logo"}
              </button>
              <span className="text-xs text-admin-faint font-secondary">
                PNG, JPEG, WebP, or SVG · max 2 MB
              </span>
            </div>
            {logoUploadError ? (
              <p className="text-xs text-admin-accent font-secondary" role="alert">
                {logoUploadError}
              </p>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BRANDING_FIELDS.filter((f) => f.group === "Logo").map((field) => {
              const raw = getBrandingValue(branding, field.path);
              return (
                <label key={field.path} className="block space-y-1">
                  <span className="text-xs text-admin-muted font-secondary">
                    {field.label}
                  </span>
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={raw}
                    onChange={(e) =>
                      setBranding((b) =>
                        setBrandingValue(
                          b,
                          field.path,
                          field.type === "number"
                            ? Number(e.target.value) || 0
                            : e.target.value,
                        ),
                      )
                    }
                    className="w-full text-sm border border-admin-border rounded-admin-md px-2 py-1.5 bg-admin-bg"
                  />
                </label>
              );
            })}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Typography"
          open={typographyOpen}
          onToggle={() => setTypographyOpen((v) => !v)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {BRANDING_FIELDS.filter((f) => f.group === "Typography").map(
              (field) => {
                const raw = getBrandingValue(branding, field.path);
                return (
                  <label key={field.path} className="block space-y-1">
                    <span className="text-xs text-admin-muted font-secondary">
                      {field.label}
                    </span>
                    <input
                      type="text"
                      value={String(raw)}
                      placeholder="e.g. var(--font-display)"
                      onChange={(e) =>
                        setBranding((b) =>
                          setBrandingValue(b, field.path, e.target.value),
                        )
                      }
                      className="w-full text-sm border border-admin-border rounded-admin-md px-2 py-1.5 bg-admin-bg"
                    />
                  </label>
                );
              },
            )}
          </div>
        </CollapsibleSection>
      </section>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-5">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Features
        </h2>

        <div
          role="tablist"
          aria-label="Feature portals"
          className="flex gap-4 overflow-x-auto border-b border-admin-border"
        >
          {FEATURE_PORTALS.map((portal) => (
            <button
              key={portal}
              type="button"
              role="tab"
              aria-selected={activeFeaturePortal === portal}
              onClick={() => setActiveFeaturePortal(portal)}
              className={`text-sm font-medium py-2 border-b-2 transition-colors whitespace-nowrap ${
                activeFeaturePortal === portal
                  ? "border-admin-accent text-admin-accent"
                  : "border-transparent text-admin-muted hover:text-admin-text"
              }`}
            >
              {PORTAL_LABELS[portal]}
            </button>
          ))}
        </div>

        {FEATURE_PORTALS.filter((portal) => portal === activeFeaturePortal).map(
          (portal) => {
            const defs = featuresByPortal.get(portal) ?? [];
            if (defs.length === 0) return null;

            const customKeys = extractCustomPortalFeatureKeys(portal, features);
            const isNavPortal = portal !== "additional";
            const portalNav = isNavPortal
              ? ensurePortalNav(features, portal)
              : null;
            const newKey = newPortalFeatureKeys[portal] ?? "";
            const canAddAdditional =
              portal === "additional" &&
              canAddPortalFeatureKey(portal, features, newKey);
            const customForm = isNavPortal
              ? (newCustomFeatureForms[portal] ?? {
                  ...EMPTY_CUSTOM_FORM,
                  group: portalNav?.groups[0] ?? "Main",
                })
              : EMPTY_CUSTOM_FORM;
            const canAddCustom =
              isNavPortal &&
              canAddPortalFeatureKey(portal, features, customForm.key) &&
              customForm.label.trim().length > 0 &&
              customForm.group.trim().length > 0;
            const catalogKeys = defs.map((def) => def.key);
            const allFeatureKeys = [...catalogKeys, ...customKeys];
            const orderedFeatureKeys =
              isNavPortal && portalNav
                ? resolvePortalFeatureOrder(portal, allFeatureKeys, portalNav)
                : allFeatureKeys;
            const defsByKey = new Map(defs.map((def) => [def.key, def]));

            const renderFeatureRow = (
              key: string,
              options?: { sortable?: boolean },
            ) => {
              const sortable = options?.sortable ?? false;
              const rowKey = `${portal}-${key}`;
              const catalogDef = defsByKey.get(key);
              if (catalogDef) {
                const enabled =
                  portal === "additional"
                    ? Boolean(features[catalogDef.key])
                    : Boolean(
                        (
                          features[catalogDef.portal as Portal] as Record<
                            string,
                            boolean
                          >
                        )?.[catalogDef.key],
                      );
                const navItem =
                  isNavPortal && portalNav
                    ? resolveFeatureNavItem(portal, catalogDef.key, portalNav)
                    : null;
                const hasSubtabs =
                  isNavPortal && hasDefaultFeatureChildren(catalogDef.key);
                const subtabsExpanded =
                  expandedSubtabParents[portal as Portal]?.[catalogDef.key] ??
                  false;
                const subtabs =
                  hasSubtabs && portalNav
                    ? resolveFeatureNavChildren(
                        portal,
                        catalogDef.key,
                        portalNav,
                      )
                    : [];

                return (
                  <FeatureSettingsRow
                    key={rowKey}
                    sortable={sortable}
                    reorderValue={sortable ? key : undefined}
                    title={navItem?.label ?? catalogDef.label}
                    subtitle={catalogDef.description}
                    enabled={enabled}
                    onToggle={(checked) => {
                      if (portal === "additional") {
                        setAdditionalFeature(catalogDef.key, checked);
                      } else {
                        setPortalFeature(
                          catalogDef.portal as Portal,
                          catalogDef.key,
                          checked,
                        );
                      }
                    }}
                    toggleLabel={navItem?.label ?? catalogDef.label}
                    showNavControls={isNavPortal && !!navItem}
                    navGroups={portalNav?.groups}
                    subsection={navItem?.group}
                    onSubsectionChange={(group) =>
                      updatePortalNavItem(portal as Portal, catalogDef.key, {
                        group,
                      })
                    }
                    icon={navItem?.icon ?? DEFAULT_FEATURE_ICON_SLUG}
                    onIconChange={(icon) =>
                      updatePortalNavItem(portal as Portal, catalogDef.key, {
                        icon,
                      })
                    }
                    hasSubtabs={hasSubtabs}
                    subtabsExpanded={subtabsExpanded}
                    onToggleSubtabs={() =>
                      setExpandedSubtabParents((prev) => ({
                        ...prev,
                        [portal]: {
                          ...prev[portal as Portal],
                          [catalogDef.key]: !subtabsExpanded,
                        },
                      }))
                    }
                    subtabsFooter={
                      hasSubtabs && subtabsExpanded ? (
                        <FeatureSubtabsEditor
                          parentKey={catalogDef.key}
                          subtabs={subtabs}
                          onReorder={(childKeys) =>
                            reorderFeatureChildren(
                              portal as Portal,
                              catalogDef.key,
                              childKeys,
                            )
                          }
                          onLabelChange={(childKey, label) =>
                            updateFeatureChild(
                              portal as Portal,
                              catalogDef.key,
                              childKey,
                              { label },
                            )
                          }
                          onIconChange={(childKey, icon) =>
                            updateFeatureChild(
                              portal as Portal,
                              catalogDef.key,
                              childKey,
                              { icon },
                            )
                          }
                          onEnabledChange={(childKey, enabled) =>
                            updateFeatureChild(
                              portal as Portal,
                              catalogDef.key,
                              childKey,
                              { enabled },
                            )
                          }
                        />
                      ) : null
                    }
                  />
                );
              }

              if (!customKeys.includes(key)) {
                return null;
              }

              const enabled =
                portal === "additional"
                  ? Boolean(features[key])
                  : Boolean(
                      (features[portal] as Record<string, boolean>)?.[key],
                    );
              const navItem =
                isNavPortal && portalNav
                  ? resolveFeatureNavItem(portal, key, portalNav)
                  : null;
              const displayLabel = navItem?.label ?? humanizeFeatureKey(key);

              return (
                <FeatureSettingsRow
                  key={rowKey}
                  sortable={sortable}
                  reorderValue={sortable ? key : undefined}
                  title={displayLabel}
                  subtitle={key}
                  subtitleMono
                  enabled={enabled}
                  onToggle={(checked) => {
                    if (portal === "additional") {
                      setAdditionalFeature(key, checked);
                    } else {
                      setPortalFeature(portal, key, checked);
                    }
                  }}
                  toggleLabel={displayLabel}
                  showNavControls={isNavPortal && !!navItem}
                  navGroups={portalNav?.groups}
                  subsection={navItem?.group}
                  onSubsectionChange={(group) =>
                    updatePortalNavItem(portal as Portal, key, { group })
                  }
                  icon={navItem?.icon ?? DEFAULT_FEATURE_ICON_SLUG}
                  onIconChange={(icon) =>
                    updatePortalNavItem(portal as Portal, key, { icon })
                  }
                  editableLabel={isNavPortal}
                  onLabelChange={(label) =>
                    updatePortalNavItem(portal as Portal, key, { label })
                  }
                  onDelete={() => removeCustomPortalFeatureKey(portal, key)}
                />
              );
            };

            return (
              <div key={portal} className="space-y-5">
                {isNavPortal && portalNav ? (
                  <SubsectionsToolbar
                    groups={portalNav.groups}
                    getAssignedCount={(group) =>
                      countFeaturesInGroup(portalNav, group)
                    }
                    newName={newSubsectionNames[portal] ?? ""}
                    onNewNameChange={(value) =>
                      setNewSubsectionNames((prev) => ({
                        ...prev,
                        [portal]: value,
                      }))
                    }
                    onAdd={() => addSubsection(portal)}
                    onDelete={(group) => deleteSubsection(portal, group)}
                  />
                ) : null}

                <div className="border border-admin-border rounded-admin-sm divide-y divide-border">
                  {isNavPortal ? (
                    <div className="hidden sm:grid sm:grid-cols-[auto_1fr_128px_148px_auto] gap-4 px-4 py-2.5 text-[11px] uppercase tracking-wide text-admin-faint font-secondary">
                      <span aria-hidden="true" />
                      <span>Feature</span>
                      <span>Subsection</span>
                      <span>Icon</span>
                      <span className="text-right">On</span>
                    </div>
                  ) : (
                    <div className="hidden sm:grid sm:grid-cols-[1fr_auto] gap-4 px-4 py-2.5 text-[11px] uppercase tracking-wide text-admin-faint font-secondary">
                      <span>Feature</span>
                      <span className="text-right">On</span>
                    </div>
                  )}

                  {isNavPortal ? (
                    <Reorder.Group
                      axis="y"
                      values={orderedFeatureKeys}
                      onReorder={(nextOrder) =>
                        reorderPortalFeatures(portal, nextOrder)
                      }
                      as="ul"
                    >
                      {orderedFeatureKeys.map((key) =>
                        renderFeatureRow(key, { sortable: true }),
                      )}
                    </Reorder.Group>
                  ) : (
                    <ul>
                      {orderedFeatureKeys.map((key) => (
                        <Fragment key={`${portal}-${key}`}>
                          {renderFeatureRow(key)}
                        </Fragment>
                      ))}
                    </ul>
                  )}
                </div>

                {portal === "additional" ? (
                  <div className="flex gap-2 border-t border-admin-border pt-5">
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) =>
                        setNewPortalFeatureKeys((prev) => ({
                          ...prev,
                          [portal]: e.target.value,
                        }))
                      }
                      placeholder="feature_key"
                      className={`flex-1 font-mono ${fieldClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => addCustomPortalFeatureKey(portal)}
                      disabled={!canAddAdditional}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-admin-sm border border-admin-border bg-admin-bg hover:bg-admin-neutral-bg disabled:opacity-40 font-secondary"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                ) : (
                  <AddCustomFeatureForm
                    form={customForm}
                    groups={portalNav?.groups ?? ["Main"]}
                    canAdd={canAddCustom}
                    onKeyChange={(key) =>
                      setNewCustomFeatureForms((prev) => ({
                        ...prev,
                        [portal]: { ...customForm, key },
                      }))
                    }
                    onLabelChange={(label) =>
                      setNewCustomFeatureForms((prev) => ({
                        ...prev,
                        [portal]: { ...customForm, label },
                      }))
                    }
                    onGroupChange={(group) =>
                      setNewCustomFeatureForms((prev) => ({
                        ...prev,
                        [portal]: { ...customForm, group },
                      }))
                    }
                    onIconChange={(icon) =>
                      setNewCustomFeatureForms((prev) => ({
                        ...prev,
                        [portal]: { ...customForm, icon },
                      }))
                    }
                    onAdd={() => addCustomPortalFeatureKey(portal)}
                  />
                )}
              </div>
            );
          },
        )}
      </section>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
            Apply entry options
          </h2>
          <p className="mt-1 text-xs text-admin-muted font-secondary">
            Optional paths on the public apply auth screen before families sign in
            (e.g. schedule a campus tour before starting an application).
          </p>
        </div>

        <ApplyAuthEntryEditor
          options={applyAuthEntryOptions}
          onChange={setApplyAuthEntryOptions}
        />
      </section>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
            Parent onboarding
          </h2>
          <p className="mt-1 text-xs text-admin-muted font-secondary">
            Checklist shown on the parent home page when families tap Complete
            your onboarding.
          </p>
        </div>

        <ParentOnboardingEditor
          items={onboardingItems}
          targetOptions={parentOnboardingTargetOptions}
          onChange={setOnboardingItems}
        />
      </section>

      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
            Admissions
          </h2>
          <p className="mt-1 text-xs text-admin-muted font-secondary">
            Platform-level admissions behavior for this school. Schools manage
            open days in their schedule; this controls what families see when booking.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-admin-text font-secondary">
            {SHADOW_DAY_SCHEDULING_QUESTION}
          </legend>
          {SHADOW_DAY_SCHEDULING_MODE_OPTIONS.map((option) => {
            const selected = currentShadowDayMode === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-admin-md border p-3 transition ${
                  selected
                    ? "border-accent bg-accent/5"
                    : "border-admin-border bg-admin-bg hover:bg-admin-surface"
                }`}
              >
                <input
                  type="radio"
                  name="shadowDaySchedulingMode"
                  value={option.value}
                  checked={selected}
                  onChange={() => setShadowDaySchedulingMode(option.value)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-admin-text font-secondary">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-admin-muted font-secondary">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {currentShadowDayMode !== savedShadowDayMode ? (
          <p className="text-xs text-admin-muted font-secondary">
            Saving will change the family booking screen. Existing open days and
            bookings are kept, but the school may need to review grade slots.
          </p>
        ) : null}

        <div className="space-y-3 border-t border-admin-border pt-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={programPortalConfig.enabled}
              onChange={(event) => {
                setAdmissions((current) => {
                  const config = parseProgramParentPortalOrgConfig(current);
                  return {
                    ...current,
                    program_parent_portal: {
                      enabled: event.target.checked,
                      isolated_program_ids: config.isolated_program_ids,
                    },
                  };
                });
              }}
            />
            <span>
              <span className="block text-sm font-medium text-admin-text font-secondary">
                Allow program-scoped parent portals
              </span>
              <span className="mt-0.5 block text-xs text-admin-muted font-secondary">
                Configure allowlisted program portals here. School admins can
                view portal features but cannot change them.
              </span>
            </span>
          </label>

          {programPortalConfig.enabled ? (
            <div className="space-y-2 pl-7">
              <p className="text-xs text-admin-muted font-secondary">
                Select programs that get a separate parent portal URL.
              </p>
              {orgProgramsLoading ? (
                <p className="text-xs text-admin-muted font-secondary">
                  Loading programs…
                </p>
              ) : orgPrograms.length === 0 ? (
                <p className="text-xs text-admin-muted font-secondary">
                  No programs yet for this school.
                </p>
              ) : (
                orgPrograms.map((program) => {
                  const checked = programPortalConfig.isolated_program_ids.includes(
                    program.id,
                  );
                  const portalEditor = programPortalEditors[program.id];
                  const portalExpanded = Boolean(expandedProgramPortalIds[program.id]);
                  return (
                    <div key={program.id} className="space-y-1">
                      <label
                        className="flex cursor-pointer items-center gap-2 text-sm text-admin-text font-secondary"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const orgParent = features.parent ?? DEFAULT_FEATURES.parent;
                            setAdmissions((current) => {
                              const config = parseProgramParentPortalOrgConfig(current);
                              const ids = new Set(config.isolated_program_ids);
                              if (ids.has(program.id)) {
                                ids.delete(program.id);
                                setProgramPortalEditors((prev) => {
                                  const next = { ...prev };
                                  delete next[program.id];
                                  return next;
                                });
                                setExpandedProgramPortalIds((prev) => {
                                  const next = { ...prev };
                                  delete next[program.id];
                                  return next;
                                });
                              } else {
                                ids.add(program.id);
                                setProgramPortalEditors((prev) => ({
                                  ...prev,
                                  [program.id]: expandProgramPortalSettingsForEditor(
                                    buildInitialIsolatedProgramPortalSettings(orgParent),
                                    orgParent,
                                  ),
                                }));
                                setExpandedProgramPortalIds((prev) => ({
                                  ...prev,
                                  [program.id]: true,
                                }));
                              }
                              return {
                                ...current,
                                program_parent_portal: {
                                  enabled: config.enabled,
                                  isolated_program_ids: [...ids],
                                },
                              };
                            });
                          }}
                        />
                        <span>{program.name}</span>
                        <span className="text-xs text-admin-muted">
                          Separate parent portal
                        </span>
                      </label>
                      {checked ? (
                        <div className="space-y-2 pl-6">
                          <p className="text-xs text-admin-muted font-secondary">
                            <code className="rounded bg-black/5 px-1 py-0.5">
                              /school/{organizationSlug}/parent/p/{program.portal_slug}/...
                            </code>
                          </p>
                          <button
                            type="button"
                            className="flex items-center gap-1 text-xs font-medium text-admin-text font-secondary hover:underline"
                            onClick={() =>
                              setExpandedProgramPortalIds((prev) => ({
                                ...prev,
                                [program.id]: !portalExpanded,
                              }))
                            }
                          >
                            {portalExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                            Portal features
                          </button>
                          {portalExpanded && portalEditor ? (
                            <div className="rounded-admin-md border border-admin-border bg-admin-bg p-3">
                              <ProgramParentPortalSettingsCard
                                embedded
                                canEditPortalConfig
                                C={parentAdminCompat}
                                theme={parentTheme}
                                branding={branding}
                                organizationId={organizationId}
                                programName={program.name}
                                orgFeatures={features}
                                schoolSlug={organizationSlug}
                                schoolName={organizationName}
                                portalSlug={program.portal_slug}
                                editor={portalEditor}
                                isolationAllowed
                                programParentPortalEnabled={programPortalConfig.enabled}
                                onChange={(next) =>
                                  setProgramPortalEditors((prev) => ({
                                    ...prev,
                                    [program.id]: next,
                                  }))
                                }
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
              {orgPrograms.length > 0 ? (
                <div className="space-y-1 border-t border-admin-border pt-3">
                  <p className="text-xs font-medium text-admin-text font-secondary">
                    {portalProgramSummary.isolatedCount} program
                    {portalProgramSummary.isolatedCount === 1 ? "" : "s"} isolated
                    {portalProgramSummary.mainCount > 0
                      ? ` · ${portalProgramSummary.mainCount} on main portal`
                      : ""}
                  </p>
                  <p className="text-xs text-admin-muted font-secondary">
                    Isolated portals get their own URL and feature tabs. Calendar
                    and home show this program&apos;s events only. Messages include
                    this program&apos;s threads plus the school office. Billing and
                    feed stay org-wide for now.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`text-sm px-4 py-2 rounded-admin-md bg-accent text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed ${BUTTON_LOADING_LAYOUT_CLASS}`}
        >
          <ButtonLoadingLabel loading={saving} loadingLabel="Saving…">
            Save settings
          </ButtonLoadingLabel>
        </button>
        {!hasRow ? (
          <button
            type="button"
            onClick={initializeDefaults}
            className="text-sm px-3 py-2 rounded-admin-md border border-admin-border bg-admin-surface hover:bg-admin-bg font-secondary"
          >
            Reset to defaults
          </button>
        ) : null}
        {saveMessage ? (
          <span className="text-sm text-accent flex items-center gap-2">
            {saveMessage}
            <Link
              href={`/school/${organizationSlug}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-admin-accent hover:underline"
            >
              Preview school admin
            </Link>
          </span>
        ) : null}
        {error ? (
          <span className="text-sm text-admin-accent font-secondary">{error}</span>
        ) : null}
        {isDirty && !saving ? (
          <span className="text-xs text-admin-faint font-secondary">
            Unsaved changes
          </span>
        ) : null}
      </div>
    </div>
  );
}

function LogoPreview({
  branding,
  compact = false,
}: {
  branding: OrganizationBranding;
  compact?: boolean;
}) {
  const src = branding.logo.src.trim();
  const alt = branding.logo.alt.trim() || "School logo";
  const width = branding.logo.width > 0 ? branding.logo.width : 200;
  const height = branding.logo.height > 0 ? branding.logo.height : 58;
  const [loadError, setLoadError] = useState(false);

  return (
    <div
      className={`rounded-admin-md border flex items-center justify-center ${
        compact ? "p-3 min-h-[72px]" : "p-4 min-h-[88px]"
      }`}
      style={{ borderColor: branding.colors.border }}
    >
      {!src ? (
        <p className="text-xs text-admin-faint font-secondary">No logo URL set</p>
      ) : loadError ? (
        <p className="text-xs text-admin-accent font-secondary">Could not load logo</p>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          width={width}
          height={height}
          onError={() => setLoadError(true)}
          className="max-w-full object-contain"
          style={{
            width: Math.min(width, compact ? 160 : 240),
            height: "auto",
            maxHeight: compact ? 48 : 64,
          }}
        />
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-admin-border pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs font-medium text-admin-muted hover:text-admin-text"
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        {title}
      </button>
      {open ? children : null}
    </div>
  );
}

function SubsectionsToolbar({
  groups,
  getAssignedCount,
  newName,
  onNewNameChange,
  onAdd,
  onDelete,
}: {
  groups: string[];
  getAssignedCount: (group: string) => number;
  newName: string;
  onNewNameChange: (value: string) => void;
  onAdd: () => void;
  onDelete: (group: string) => void;
}) {
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAdding(false);
  };

  const handleCancel = () => {
    onNewNameChange("");
    setAdding(false);
  };

  return (
    <div className="border-b border-admin-border pb-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-admin-muted shrink-0">
          Subsections:
        </span>
        {groups.map((group) => {
          const assignedCount = getAssignedCount(group);
          return (
            <span
              key={group}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-admin-sm border border-admin-border bg-admin-surface font-secondary"
            >
              {group}
              {assignedCount === 0 ? (
                <button
                  type="button"
                  onClick={() => onDelete(group)}
                  className="text-admin-faint hover:text-admin-accent"
                  aria-label={`Remove ${group}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              ) : null}
            </span>
          );
        })}
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-admin-sm border border-dashed border-admin-border bg-admin-bg hover:bg-admin-neutral-bg text-admin-muted font-secondary"
          >
            <Plus className="w-3 h-3" />
            Add subsection
          </button>
        ) : null}
      </div>
      {adding ? (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            placeholder="New subsection name"
            className={`flex-1 ${fieldClass}`}
            autoFocus
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-admin-sm border border-admin-border bg-admin-bg hover:bg-admin-neutral-bg disabled:opacity-40 shrink-0"
          >
            Add
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm px-3 py-1.5 text-admin-muted hover:text-admin-text shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FeatureSubtabsEditor({
  parentKey,
  subtabs,
  onReorder,
  onLabelChange,
  onIconChange,
  onEnabledChange,
}: {
  parentKey: string;
  subtabs: FeatureNavChildConfig[];
  onReorder: (childKeys: string[]) => void;
  onLabelChange: (childKey: string, label: string) => void;
  onIconChange: (childKey: string, icon: string) => void;
  onEnabledChange: (childKey: string, enabled: boolean) => void;
}) {
  const childKeys = subtabs.map((child) => child.key);

  return (
    <div className="mt-3 ml-5 pl-3 border-l border-admin-border space-y-2">
      <p className="text-[11px] uppercase tracking-wide text-admin-faint font-secondary">
        Sub-tabs
      </p>
      <Reorder.Group
        axis="y"
        values={childKeys}
        onReorder={onReorder}
        className="space-y-2"
      >
        {subtabs.map((child) => (
          <FeatureSubtabRow
            key={child.key}
            parentKey={parentKey}
            child={child}
            onLabelChange={(label) => onLabelChange(child.key, label)}
            onIconChange={(icon) => onIconChange(child.key, icon)}
            onEnabledChange={(enabled) => onEnabledChange(child.key, enabled)}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function FeatureSubtabRow({
  parentKey,
  child,
  onLabelChange,
  onIconChange,
  onEnabledChange,
}: {
  parentKey: string;
  child: FeatureNavChildConfig;
  onLabelChange: (label: string) => void;
  onIconChange: (icon: string) => void;
  onEnabledChange: (enabled: boolean) => void;
}) {
  const dragControls = useDragControls();
  const enabled = child.enabled !== false;
  const label =
    child.label ?? getFeatureNavChildLabel(parentKey, child.key, child);

  return (
    <Reorder.Item
      value={child.key}
      dragListener={false}
      dragControls={dragControls}
      className="list-none rounded-admin-sm border border-admin-border bg-admin-bg/60 px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-admin-faint hover:text-admin-muted p-1 shrink-0 touch-none"
          onPointerDown={(event) => dragControls.start(event)}
          aria-label="Drag to reorder sub-tab"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <input
          type="text"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          disabled={!enabled}
          className={`flex-1 min-w-0 ${fieldClass} ${!enabled ? "opacity-50" : ""}`}
        />
        <div className={!enabled ? "opacity-50 pointer-events-none" : ""}>
          <FeatureIconPicker
            value={child.icon ?? DEFAULT_FEATURE_ICON_SLUG}
            onChange={onIconChange}
            compact
          />
        </div>
        <Toggle
          checked={enabled}
          onChange={onEnabledChange}
          label={`${label} sub-tab`}
        />
      </div>
      <p className={`text-[11px] text-admin-faint font-mono mt-1 pl-8 ${!enabled ? "opacity-50" : ""}`}>
        {child.key}
      </p>
    </Reorder.Item>
  );
}

function FeatureSettingsRow({
  title,
  subtitle,
  subtitleMono = false,
  enabled,
  onToggle,
  toggleLabel,
  showNavControls = false,
  navGroups,
  subsection,
  onSubsectionChange,
  icon,
  onIconChange,
  editableLabel = false,
  onLabelChange,
  onDelete,
  sortable = false,
  reorderValue,
  hasSubtabs = false,
  subtabsExpanded = false,
  onToggleSubtabs,
  subtabsFooter,
}: {
  title: string;
  subtitle?: string;
  subtitleMono?: boolean;
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  toggleLabel: string;
  showNavControls?: boolean;
  navGroups?: string[];
  subsection?: string;
  onSubsectionChange?: (group: string) => void;
  icon?: string;
  onIconChange?: (icon: string) => void;
  editableLabel?: boolean;
  onLabelChange?: (label: string) => void;
  onDelete?: () => void;
  sortable?: boolean;
  reorderValue?: string;
  hasSubtabs?: boolean;
  subtabsExpanded?: boolean;
  onToggleSubtabs?: () => void;
  subtabsFooter?: ReactNode;
}) {
  const dragControls = useDragControls();
  const controlsDimmed = !enabled && showNavControls;
  const gridCols = (() => {
    if (sortable && showNavControls) {
      return "sm:grid-cols-[auto_1fr_128px_148px_auto]";
    }
    if (sortable) {
      return "sm:grid-cols-[auto_1fr_auto]";
    }
    if (showNavControls) {
      return "sm:grid-cols-[1fr_128px_148px_auto]";
    }
    return "sm:grid-cols-[1fr_auto]";
  })();

  const dragHandle = sortable ? (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing text-admin-faint hover:text-admin-muted p-1 shrink-0 touch-none"
      onPointerDown={(event) => dragControls.start(event)}
      aria-label="Drag to reorder"
    >
      <GripVertical className="w-4 h-4" />
    </button>
  ) : null;

  const titleBlock = (
    <div className="min-w-0 space-y-0.5">
      <div className="flex items-center gap-1 min-w-0">
        {hasSubtabs ? (
          <button
            type="button"
            onClick={onToggleSubtabs}
            className="p-0.5 text-admin-faint hover:text-admin-muted shrink-0"
            aria-label={subtabsExpanded ? "Hide sub-tabs" : "Show sub-tabs"}
          >
            {subtabsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          {editableLabel && onLabelChange ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onLabelChange(e.target.value)}
              className={`w-full ${fieldClass}`}
            />
          ) : (
            <p className="text-sm text-admin-text font-secondary">{title}</p>
          )}
        </div>
      </div>
      {subtitle ? (
        <p
          className={`text-xs text-admin-faint ${subtitleMono ? "font-mono" : "font-secondary"} ${hasSubtabs ? "pl-5" : ""}`}
        >
          {subtitle}
        </p>
      ) : null}
      {hasSubtabs ? (
        <p className={`text-xs text-admin-faint ${hasSubtabs ? "pl-5" : ""}`}>
          Sub-tabs appear in the school admin sidebar under this feature.
        </p>
      ) : null}
    </div>
  );

  const navControls =
    showNavControls && navGroups && subsection !== undefined ? (
      <div
        className={`flex gap-2 sm:contents ${controlsDimmed ? "opacity-50" : ""}`}
      >
        <AdminSelect
          value={subsection}
          onChange={(e) => onSubsectionChange?.(e.target.value)}
          className="w-full sm:w-auto"
          triggerClassName={compactSelectTriggerClass}
          aria-label="Subsection"
        >
          {navGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </AdminSelect>
        {icon !== undefined && onIconChange ? (
          <FeatureIconPicker
            value={icon}
            onChange={onIconChange}
            compact
          />
        ) : null}
      </div>
    ) : null;

  const toggleBlock = (
    <div className="flex items-center gap-2 shrink-0 justify-end">
      <Toggle checked={enabled} onChange={onToggle} label={toggleLabel} />
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-admin-faint hover:text-admin-accent"
          aria-label={`Remove ${title}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );

  const rowContent = (
    <>
      <div className="sm:hidden space-y-3">
        <div className="flex items-start gap-2">
          {dragHandle}
          <div className="flex flex-1 items-start justify-between gap-3 min-w-0">
            {titleBlock}
            {toggleBlock}
          </div>
        </div>
        {navControls}
      </div>
      <div className={`hidden sm:grid ${gridCols} gap-4 items-center`}>
        {dragHandle}
        {titleBlock}
        {showNavControls ? navControls : null}
        {toggleBlock}
      </div>
      {subtabsFooter}
    </>
  );

  if (sortable && reorderValue) {
    return (
      <Reorder.Item
        value={reorderValue}
        dragListener={false}
        dragControls={dragControls}
        as="li"
        className="list-none px-4 py-3.5"
      >
        {rowContent}
      </Reorder.Item>
    );
  }

  return <li className="px-4 py-3.5">{rowContent}</li>;
}

function AddCustomFeatureForm({
  form,
  groups,
  canAdd,
  onKeyChange,
  onLabelChange,
  onGroupChange,
  onIconChange,
  onAdd,
}: {
  form: NewCustomFeatureForm;
  groups: string[];
  canAdd: boolean;
  onKeyChange: (key: string) => void;
  onLabelChange: (label: string) => void;
  onGroupChange: (group: string) => void;
  onIconChange: (icon: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="border-t border-admin-border pt-5 space-y-4">
      <p className="text-xs font-medium text-admin-muted font-secondary">
        Add custom feature
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs text-admin-muted font-secondary">
            Feature key
          </span>
          <input
            type="text"
            value={form.key}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder="students"
            className={`w-full font-mono ${fieldClass}`}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-admin-muted font-secondary">
            Display label
          </span>
          <input
            type="text"
            value={form.label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder="Students"
            className={`w-full ${fieldClass}`}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-admin-muted font-secondary">
            Subsection
          </span>
          <AdminSelect
            value={form.group}
            onChange={(e) => onGroupChange(e.target.value)}
            className="w-full"
            triggerClassName={compactSelectTriggerClass}
            aria-label="Subsection"
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </AdminSelect>
        </label>
        <FeatureIconPicker
          value={form.icon}
          onChange={onIconChange}
          label="Icon"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-admin-sm border border-admin-border bg-admin-bg hover:bg-admin-neutral-bg disabled:opacity-40 font-secondary"
        >
          <Plus className="w-3.5 h-3.5" />
          Add feature
        </button>
      </div>
    </div>
  );
}

function FeatureIconPicker({
  value,
  onChange,
  label,
  compact = false,
}: {
  value: string;
  onChange: (slug: string) => void;
  label?: string;
  compact?: boolean;
}) {
  const icon = getFeatureIcon(value);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-7 h-7 rounded-admin-sm border border-admin-border bg-admin-bg flex items-center justify-center shrink-0">
          {createElement(icon, { className: "w-3.5 h-3.5 text-admin-muted" })}
        </span>
        <AdminSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0"
          triggerClassName={compactSelectTriggerClass}
          aria-label="Icon"
        >
          {FEATURE_ICON_OPTIONS.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </AdminSelect>
      </div>
    );
  }

  return (
    <label className="block space-y-1">
      {label ? (
        <span className="text-xs text-admin-muted font-secondary">{label}</span>
      ) : null}
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-admin-sm border border-admin-border bg-admin-bg flex items-center justify-center shrink-0">
          {createElement(icon, { className: "w-3.5 h-3.5 text-admin-muted" })}
        </span>
        <AdminSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          triggerClassName={compactSelectTriggerClass}
          aria-label="Icon"
        >
          {FEATURE_ICON_OPTIONS.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </AdminSelect>
      </div>
    </label>
  );
}

function ApplyAuthEntryEditor({
  options,
  onChange,
}: {
  options: ApplyAuthEntryOption[];
  onChange: (options: ApplyAuthEntryOption[]) => void;
}) {
  const tourOption = options.find((option) => option.type === "schedule_campus_tour");

  if (!tourOption) {
    return null;
  }

  const updateTourOption = (patch: Partial<ApplyAuthEntryOption>) => {
    onChange(
      options.map((option) =>
        option.type === "schedule_campus_tour" ? { ...option, ...patch } : option,
      ),
    );
  };

  return (
    <div
      className="rounded-admin-sm border border-admin-border p-4 space-y-4"
    >
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={tourOption.enabled}
          onChange={(event) => updateTourOption({ enabled: event.target.checked })}
          className="mt-1 h-4 w-4 rounded border-admin-border"
        />
        <span className="text-sm font-medium text-admin-text font-secondary">
          Schedule campus tour entry
        </span>
      </label>

      {tourOption.enabled ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-admin-muted font-secondary">Button label</span>
            <input
              type="text"
              value={tourOption.label ?? ""}
              onChange={(event) => updateTourOption({ label: event.target.value })}
              className="rounded-admin-sm border border-admin-border bg-admin-bg px-3 py-2 text-sm font-secondary"
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs text-admin-muted font-secondary">Button description</span>
            <input
              type="text"
              value={tourOption.description ?? ""}
              onChange={(event) =>
                updateTourOption({ description: event.target.value })
              }
              className="rounded-admin-sm border border-admin-border bg-admin-bg px-3 py-2 text-sm font-secondary"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function ParentOnboardingEditor({
  items,
  targetOptions,
  onChange,
}: {
  items: ParentOnboardingItem[];
  targetOptions: Array<{ key: string; label: string }>;
  onChange: (items: ParentOnboardingItem[]) => void;
}) {
  const updateItem = (index: number, patch: Partial<ParentOnboardingItem>) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    const defaultTarget = targetOptions[0]?.key ?? "billing";
    onChange([
      ...items,
      {
        id: `onboarding_${Date.now()}`,
        label: "New onboarding task",
        icon: DEFAULT_FEATURE_ICON_SLUG,
        target: defaultTarget,
      },
    ]);
  };

  return (
    <div className="border border-admin-border rounded-admin-sm divide-y divide-border">
      <div className="hidden sm:grid sm:grid-cols-[auto_1fr_160px_148px_auto] gap-4 px-4 py-2.5 text-[11px] uppercase tracking-wide text-admin-faint font-secondary">
        <span aria-hidden="true" />
        <span>Label</span>
        <span>Link target</span>
        <span>Icon</span>
        <span className="text-right">Remove</span>
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={onChange}
        as="ul"
      >
        {items.map((item, index) => (
          <ParentOnboardingItemRow
            key={item.id}
            item={item}
            index={index}
            targetOptions={targetOptions}
            onUpdate={(patch) => updateItem(index, patch)}
            onRemove={() => removeItem(index)}
          />
        ))}
      </Reorder.Group>

      <div className="flex justify-end px-4 py-3 border-t border-admin-border">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-admin-sm border border-admin-border bg-admin-bg hover:bg-admin-neutral-bg font-secondary"
        >
          <Plus className="w-3.5 h-3.5" />
          Add onboarding item
        </button>
      </div>
    </div>
  );
}

function ParentOnboardingItemRow({
  item,
  index,
  targetOptions,
  onUpdate,
  onRemove,
}: {
  item: ParentOnboardingItem;
  index: number;
  targetOptions: Array<{ key: string; label: string }>;
  onUpdate: (patch: Partial<ParentOnboardingItem>) => void;
  onRemove: () => void;
}) {
  const dragControls = useDragControls();
  const isCustomUrl = isCustomOnboardingUrlTarget(item.target);
  const customUrl = getCustomOnboardingUrl(item.target) ?? "";

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      as="li"
      className="list-none px-4 py-3.5"
    >
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[auto_1fr_160px_148px_auto] sm:items-center sm:gap-4">
        <button
          type="button"
          onPointerDown={(event) => dragControls.start(event)}
          className="p-1 rounded-admin-sm text-admin-faint hover:text-admin-muted cursor-grab active:cursor-grabbing"
          aria-label={`Reorder onboarding item ${index + 1}`}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={item.label}
          onChange={(event) => onUpdate({ label: event.target.value })}
          className={`w-full ${fieldClass}`}
          aria-label="Onboarding item label"
        />

        <div className="space-y-2 min-w-0">
          <AdminSelect
            value={isCustomUrl ? "__custom_url__" : item.target}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "__custom_url__") {
                onUpdate({ target: toCustomOnboardingUrlTarget("https://") });
              } else {
                onUpdate({ target: value });
              }
            }}
            triggerClassName={compactSelectTriggerClass}
            aria-label="Onboarding link target"
          >
            {targetOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
            <option value="__custom_url__">Custom URL</option>
          </AdminSelect>
          {isCustomUrl ? (
            <input
              type="url"
              value={customUrl}
              onChange={(event) =>
                onUpdate({
                  target: toCustomOnboardingUrlTarget(event.target.value),
                })
              }
              placeholder="https://example.com"
              className={`w-full ${fieldClass}`}
              aria-label="Custom onboarding URL"
            />
          ) : null}
        </div>

        <FeatureIconPicker
          value={item.icon ?? DEFAULT_FEATURE_ICON_SLUG}
          onChange={(icon) => onUpdate({ icon })}
          compact
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-admin-sm text-admin-muted hover:text-admin-accent hover:bg-admin-neutral-bg"
            aria-label="Remove onboarding item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-admin-md transition-colors shrink-0 ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-admin-md bg-admin-surface shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
