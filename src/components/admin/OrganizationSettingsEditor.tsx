"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
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
  removePortalGroup,
  resolveFeatureNavItem,
  updatePortalNav,
} from "@/lib/organization-settings/feature-nav";
import {
  DEFAULT_FEATURE_ICON_SLUG,
  FEATURE_ICON_OPTIONS,
  getFeatureIcon,
} from "@/lib/organization-settings/icon-registry";
import {
  BRANDING_FIELDS,
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
import type {
  OrganizationBranding,
  OrganizationFeatures,
  OrganizationSettingsRow,
  Portal,
  FeaturePortal,
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
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (settingsLoading) return;
    const mergedBranding = initialRow
      ? mergeBranding(initialRow.branding as unknown as Record<string, unknown>)
      : getDefaultSettings().branding;
    const mergedFeatures = initialRow
      ? mergeFeatures(initialRow.features as unknown as Record<string, unknown>)
      : getDefaultSettings().features;

    setHasRow(!!initialRow);
    setBranding(mergedBranding);
    setFeatures(mergedFeatures);
    setSavedSnapshot(
      serializeSettings(
        mergedBranding,
        mergedFeatures as unknown as Record<string, unknown>,
      ),
    );
    setSaveMessage(null);
    setError(null);
    setLogoOpen(Boolean(mergedBranding.logo?.src?.trim()));
  }, [organizationId, initialRow, settingsLoading]);

  const isDirty = useMemo(
    () =>
      serializeSettings(
        branding,
        features as unknown as Record<string, unknown>,
      ) !== savedSnapshot,
    [branding, features, savedSnapshot],
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

  const initializeDefaults = useCallback(() => {
    const defaults = getDefaultSettings();
    setBranding(defaults.branding);
    setFeatures(defaults.features);
    setNewPortalFeatureKeys({});
    setNewCustomFeatureForms({});
    setNewSubsectionNames({});
    setError(null);
    setSaveMessage(null);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSaveMessage(null);

    const payload = {
      organization_id: organizationId,
      branding: branding as unknown as Record<string, unknown>,
      features: features as unknown as Record<string, unknown>,
    };

    const { error: upsertError } = await supabase
      .from("organization_settings")
      .upsert(payload, { onConflict: "organization_id" });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setHasRow(true);
    setSavedSnapshot(
      serializeSettings(
        branding,
        payload.features as Record<string, unknown>,
      ),
    );
    setSaveMessage("Settings saved.");
    await onSaved?.();
  }, [supabase, organizationId, branding, features, onSaved]);

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
      <section className="bg-surface border border-border rounded-lg p-4">
        <p className="text-sm text-text-faint font-secondary">
          Loading organization settings…
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {!hasRow ? (
        <div className="bg-clay-soft/30 border border-clay/20 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted font-secondary">
            No settings row yet for {organizationName}. Edit below and click
            Save settings to create one.
          </p>
          <button
            type="button"
            onClick={initializeDefaults}
            className="text-sm px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-bg transition-colors font-secondary"
          >
            Initialize defaults
          </button>
        </div>
      ) : null}

      <section className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
          Branding preview
        </h2>
        <div
          className="rounded-lg border p-4 space-y-3"
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
            className="text-sm px-3 py-1.5 rounded-lg text-white font-secondary"
            style={{ backgroundColor: branding.colors.accent }}
          >
            Primary action
          </button>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-lg p-4 space-y-4">
        <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
          Branding
        </h2>

        {brandingGroups
          .filter(
            ([group]) => group !== "Logo" && group !== "Typography",
          )
          .map(([group, fields]) => (
            <div key={group} className="space-y-2">
              <h3 className="text-xs font-medium text-text-muted font-secondary">
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
                        className="w-8 h-8 rounded border border-border cursor-pointer shrink-0"
                      />
                      <span className="text-text-muted min-w-0 flex-1 truncate">
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
                        className="w-28 text-[11px] font-mono border border-border rounded px-1.5 py-1 bg-bg"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BRANDING_FIELDS.filter((f) => f.group === "Logo").map((field) => {
              const raw = getBrandingValue(branding, field.path);
              return (
                <label key={field.path} className="block space-y-1">
                  <span className="text-xs text-text-muted font-secondary">
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
                    className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
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
                    <span className="text-xs text-text-muted font-secondary">
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
                      className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
                    />
                  </label>
                );
              },
            )}
          </div>
        </CollapsibleSection>
      </section>

      <section className="bg-surface border border-border rounded-lg p-4 space-y-5">
        <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
          Features
        </h2>

        {(["admin", "teacher", "parent", "additional"] as const).map(
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

            return (
              <div key={portal} className="space-y-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
                <h3 className="text-xs font-medium text-text-muted font-secondary">
                  {PORTAL_LABELS[portal]}
                </h3>

                {isNavPortal && portalNav ? (
                  <div className="rounded-lg border border-border bg-bg/50 p-3 space-y-2">
                    <p className="text-xs font-medium text-text-muted font-secondary">
                      Subsections
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {portalNav.groups.map((group) => {
                        const assignedCount = countFeaturesInGroup(
                          portalNav,
                          group,
                        );
                        return (
                          <span
                            key={group}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-border bg-surface font-secondary"
                          >
                            {group}
                            {assignedCount === 0 ? (
                              <button
                                type="button"
                                onClick={() => deleteSubsection(portal, group)}
                                className="text-text-faint hover:text-clay"
                                aria-label={`Remove ${group}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubsectionNames[portal] ?? ""}
                        onChange={(e) =>
                          setNewSubsectionNames((prev) => ({
                            ...prev,
                            [portal]: e.target.value,
                          }))
                        }
                        placeholder="New subsection name"
                        className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
                      />
                      <button
                        type="button"
                        onClick={() => addSubsection(portal)}
                        disabled={!(newSubsectionNames[portal] ?? "").trim()}
                        className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-border bg-bg hover:bg-surface-soft disabled:opacity-40 font-secondary"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add subsection
                      </button>
                    </div>
                  </div>
                ) : null}

                <ul className="space-y-3">
                  {defs.map((def) => {
                    const enabled =
                      portal === "additional"
                        ? Boolean(features[def.key])
                        : Boolean(
                            (
                              features[def.portal as Portal] as Record<
                                string,
                                boolean
                              >
                            )?.[def.key],
                          );
                    const navItem =
                      isNavPortal && portalNav
                        ? resolveFeatureNavItem(portal, def.key, portalNav)
                        : null;

                    return (
                      <li
                        key={`${portal}-${def.key}`}
                        className="rounded-lg border border-border p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-text font-secondary">
                              {def.label}
                            </p>
                            {def.description ? (
                              <p className="text-xs text-text-faint font-secondary">
                                {def.description}
                              </p>
                            ) : null}
                          </div>
                          <Toggle
                            checked={enabled}
                            onChange={(checked) => {
                              if (portal === "additional") {
                                setAdditionalFeature(def.key, checked);
                              } else {
                                setPortalFeature(
                                  def.portal as Portal,
                                  def.key,
                                  checked,
                                );
                              }
                            }}
                            label={def.label}
                          />
                        </div>
                        {isNavPortal && portalNav && navItem ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="block space-y-1">
                              <span className="text-xs text-text-muted font-secondary">
                                Subsection
                              </span>
                              <select
                                value={navItem.group}
                                onChange={(e) =>
                                  updatePortalNavItem(portal, def.key, {
                                    group: e.target.value,
                                  })
                                }
                                className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
                              >
                                {portalNav.groups.map((group) => (
                                  <option key={group} value={group}>
                                    {group}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <FeatureIconPicker
                              value={navItem.icon ?? DEFAULT_FEATURE_ICON_SLUG}
                              onChange={(icon) =>
                                updatePortalNavItem(portal, def.key, { icon })
                              }
                              label="Icon"
                            />
                          </div>
                        ) : null}
                      </li>
                    );
                  })}

                  {customKeys.map((key) => {
                    const enabled =
                      portal === "additional"
                        ? Boolean(features[key])
                        : Boolean(
                            (
                              features[portal] as Record<string, boolean>
                            )?.[key],
                          );
                    const navItem =
                      isNavPortal && portalNav
                        ? resolveFeatureNavItem(portal, key, portalNav)
                        : null;
                    const displayLabel =
                      navItem?.label ?? humanizeFeatureKey(key);

                    return (
                      <li
                        key={`${portal}-custom-${key}`}
                        className="rounded-lg border border-border p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-text font-secondary">
                              {displayLabel}
                            </p>
                            <p className="text-xs text-text-faint font-mono">
                              {key}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Toggle
                              checked={enabled}
                              onChange={(checked) => {
                                if (portal === "additional") {
                                  setAdditionalFeature(key, checked);
                                } else {
                                  setPortalFeature(portal, key, checked);
                                }
                              }}
                              label={displayLabel}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeCustomPortalFeatureKey(portal, key)
                              }
                              className="p-1 text-text-faint hover:text-clay"
                              aria-label={`Remove ${key}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {isNavPortal && portalNav && navItem ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <label className="block space-y-1">
                              <span className="text-xs text-text-muted font-secondary">
                                Display label
                              </span>
                              <input
                                type="text"
                                value={navItem.label ?? displayLabel}
                                onChange={(e) =>
                                  updatePortalNavItem(portal, key, {
                                    label: e.target.value,
                                  })
                                }
                                className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
                              />
                            </label>
                            <label className="block space-y-1">
                              <span className="text-xs text-text-muted font-secondary">
                                Subsection
                              </span>
                              <select
                                value={navItem.group}
                                onChange={(e) =>
                                  updatePortalNavItem(portal, key, {
                                    group: e.target.value,
                                  })
                                }
                                className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
                              >
                                {portalNav.groups.map((group) => (
                                  <option key={group} value={group}>
                                    {group}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <FeatureIconPicker
                              value={navItem.icon ?? DEFAULT_FEATURE_ICON_SLUG}
                              onChange={(icon) =>
                                updatePortalNavItem(portal, key, { icon })
                              }
                              label="Icon"
                            />
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>

                {portal === "additional" ? (
                  <div className="flex gap-2 pt-1">
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
                      className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 font-mono bg-bg"
                    />
                    <button
                      type="button"
                      onClick={() => addCustomPortalFeatureKey(portal)}
                      disabled={!canAddAdditional}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-border bg-bg hover:bg-surface-soft disabled:opacity-40 font-secondary"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
                    <p className="text-xs font-medium text-text-muted font-secondary">
                      Add custom feature
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="block space-y-1">
                        <span className="text-xs text-text-muted font-secondary">
                          Feature key
                        </span>
                        <input
                          type="text"
                          value={customForm.key}
                          onChange={(e) =>
                            setNewCustomFeatureForms((prev) => ({
                              ...prev,
                              [portal]: {
                                ...customForm,
                                key: e.target.value,
                              },
                            }))
                          }
                          placeholder="students"
                          className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-mono bg-bg"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs text-text-muted font-secondary">
                          Display label
                        </span>
                        <input
                          type="text"
                          value={customForm.label}
                          onChange={(e) =>
                            setNewCustomFeatureForms((prev) => ({
                              ...prev,
                              [portal]: {
                                ...customForm,
                                label: e.target.value,
                              },
                            }))
                          }
                          placeholder="Students"
                          className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
                        />
                      </label>
                      <label className="block space-y-1">
                        <span className="text-xs text-text-muted font-secondary">
                          Subsection
                        </span>
                        <select
                          value={customForm.group}
                          onChange={(e) =>
                            setNewCustomFeatureForms((prev) => ({
                              ...prev,
                              [portal]: {
                                ...customForm,
                                group: e.target.value,
                              },
                            }))
                          }
                          className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
                        >
                          {(portalNav?.groups ?? ["Main"]).map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </label>
                      <FeatureIconPicker
                        value={customForm.icon}
                        onChange={(icon) =>
                          setNewCustomFeatureForms((prev) => ({
                            ...prev,
                            [portal]: {
                              ...customForm,
                              icon,
                            },
                          }))
                        }
                        label="Icon"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addCustomPortalFeatureKey(portal)}
                      disabled={!canAddCustom}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-border bg-bg hover:bg-surface-soft disabled:opacity-40 font-secondary"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add feature
                    </button>
                  </div>
                )}
              </div>
            );
          },
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="text-sm px-4 py-2 rounded-lg bg-accent text-white font-secondary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {!hasRow ? (
          <button
            type="button"
            onClick={initializeDefaults}
            className="text-sm px-3 py-2 rounded-lg border border-border bg-surface hover:bg-bg font-secondary"
          >
            Reset to defaults
          </button>
        ) : null}
        {saveMessage ? (
          <span className="text-sm text-accent font-secondary flex items-center gap-2">
            {saveMessage}
            <Link
              href={`/school/${organizationSlug}/admin`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-clay hover:underline"
            >
              Preview school admin
            </Link>
          </span>
        ) : null}
        {error ? (
          <span className="text-sm text-clay font-secondary">{error}</span>
        ) : null}
        {isDirty && !saving ? (
          <span className="text-xs text-text-faint font-secondary">
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

  useEffect(() => {
    setLoadError(false);
  }, [src]);

  return (
    <div
      className={`rounded-lg border flex items-center justify-center ${
        compact ? "p-3 min-h-[72px]" : "p-4 min-h-[88px]"
      }`}
      style={{ borderColor: branding.colors.border }}
    >
      {!src ? (
        <p className="text-xs text-text-faint font-secondary">No logo URL set</p>
      ) : loadError ? (
        <p className="text-xs text-clay font-secondary">Could not load logo</p>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
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
    <div className="border-t border-border pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs font-medium text-text-muted font-secondary hover:text-text"
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

function FeatureIconPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (slug: string) => void;
  label: string;
}) {
  const SelectedIcon = getFeatureIcon(value);

  return (
    <label className="block space-y-1">
      <span className="text-xs text-text-muted font-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded border border-border bg-bg flex items-center justify-center shrink-0">
          <SelectedIcon className="w-4 h-4 text-text-muted" />
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
        >
          {FEATURE_ICON_OPTIONS.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
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
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
