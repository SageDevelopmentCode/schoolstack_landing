"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  BRANDING_FIELDS,
  FEATURE_CATALOG,
  KNOWN_FEATURE_ROOT_KEYS,
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
} from "@/lib/organization-settings/types";

type Props = {
  organizationId: string;
  organizationName: string;
  initialRow: OrganizationSettingsRow | null;
  settingsLoading?: boolean;
  onSaved?: () => void | Promise<void>;
};

function extractCustomFeatureKeys(features: OrganizationFeatures): string[] {
  const catalogKeys = new Set(
    FEATURE_CATALOG.filter((f) => f.portal === "additional").map((f) => f.key),
  );
  return Object.keys(features).filter(
    (key) =>
      !KNOWN_FEATURE_ROOT_KEYS.has(key) &&
      typeof features[key] === "boolean" &&
      !catalogKeys.has(key),
  );
}

export default function OrganizationSettingsEditor({
  organizationId,
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
  const [customKeys, setCustomKeys] = useState<string[]>(() =>
    initialRow
      ? extractCustomFeatureKeys(
          mergeFeatures(
            initialRow.features as unknown as Record<string, unknown>,
          ),
        )
      : [],
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
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [newFeatureKey, setNewFeatureKey] = useState("");

  useEffect(() => {
    if (settingsLoading) return;
    const mergedBranding = initialRow
      ? mergeBranding(initialRow.branding as unknown as Record<string, unknown>)
      : getDefaultSettings().branding;
    const mergedFeatures = initialRow
      ? mergeFeatures(initialRow.features as unknown as Record<string, unknown>)
      : getDefaultSettings().features;
    const custom = initialRow ? extractCustomFeatureKeys(mergedFeatures) : [];

    setHasRow(!!initialRow);
    setBranding(mergedBranding);
    setFeatures(mergedFeatures);
    setCustomKeys(custom);
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
    setCustomKeys([]);
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

  const addCustomFeature = () => {
    const key = newFeatureKey.trim().replace(/\s+/g, "_").toLowerCase();
    if (!key || KNOWN_FEATURE_ROOT_KEYS.has(key) || customKeys.includes(key)) {
      return;
    }
    setCustomKeys((prev) => [...prev, key]);
    setFeatures((prev) => ({ ...prev, [key]: false }));
    setNewFeatureKey("");
  };

  const removeCustomFeature = (key: string) => {
    setCustomKeys((prev) => prev.filter((k) => k !== key));
    setFeatures((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
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
            No settings row yet for {organizationName}. Initialize defaults, then
            save.
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
            return (
              <div key={portal} className="space-y-2">
                <h3 className="text-xs font-medium text-text-muted font-secondary">
                  {PORTAL_LABELS[portal]}
                </h3>
                <ul className="space-y-2">
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
                    return (
                      <li
                        key={`${portal}-${def.key}`}
                        className="flex items-start justify-between gap-3 py-1"
                      >
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
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          },
        )}

        <CollapsibleSection
          title="Custom feature flags"
          open={additionalOpen}
          onToggle={() => setAdditionalOpen((v) => !v)}
        >
          <p className="text-xs text-text-faint font-secondary pt-1 pb-2">
            Org-specific boolean flags at the root of features JSON.
          </p>
          <ul className="space-y-2 mb-3">
            {customKeys.map((key) => (
              <li
                key={key}
                className="flex items-center justify-between gap-2"
              >
                <code className="text-xs font-mono text-text-muted">{key}</code>
                <div className="flex items-center gap-2">
                  <Toggle
                    checked={Boolean(features[key])}
                    onChange={(checked) => setAdditionalFeature(key, checked)}
                    label={key}
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomFeature(key)}
                    className="p-1 text-text-faint hover:text-clay"
                    aria-label={`Remove ${key}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
            {customKeys.length === 0 ? (
              <li className="text-xs text-text-faint font-secondary">
                No custom flags yet.
              </li>
            ) : null}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeatureKey}
              onChange={(e) => setNewFeatureKey(e.target.value)}
              placeholder="feature_key"
              className="flex-1 text-sm border border-border rounded-lg px-2 py-1.5 font-mono bg-bg"
            />
            <button
              type="button"
              onClick={addCustomFeature}
              disabled={!newFeatureKey.trim()}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-border bg-bg hover:bg-surface-soft disabled:opacity-40 font-secondary"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </CollapsibleSection>
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
          <span className="text-sm text-accent font-secondary">
            {saveMessage}
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
