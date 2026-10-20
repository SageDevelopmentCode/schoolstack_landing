"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import SchoolProfilePhotosSection from "@/components/school-admin/school-profile-photos/SchoolProfilePhotosSection";
import SchoolProfileStoryHeader from "@/components/school-admin/school-profile/SchoolProfileStoryHeader";
import type { SchoolProfileSectionId } from "@/components/school-admin/school-profile/school-profile-sections";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  getDefaultOrganizationSchoolProfile,
  getDefaultPrimaryCampus,
  isSchoolProfileBundleDirty,
  parseOrganizationCampusRow,
  parseOrganizationSchoolProfile,
  type OrganizationCampus,
  type OrganizationSchoolProfile,
  type SchoolProfileContactEmail,
  type SchoolProfileContactPhone,
} from "@/lib/school-admin/school-profile/school-profile";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

const PAGE_SHELL_CLASS =
  "mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14";

type SchoolProfilePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  schoolName: string;
  timezone: string;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B7A6E]">
      {children}
    </label>
  );
}

function SectionLoadingPanel({ theme }: { theme: ParentThemeTokens }) {
  return (
    <AdminCard theme={theme} padding="canvas">
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#6B7A6E]" aria-label="Loading section" />
      </div>
    </AdminCard>
  );
}

export default function SchoolProfilePage({
  organizationId,
  branding,
  slug,
  schoolName,
  timezone,
}: SchoolProfilePageProps) {
  void branding;
  void slug;
  const { theme, C } = useSchoolAdminStoryTheme();
  const inputStyle = committeeStoryInputStyle(theme);

  const [activeSection, setActiveSection] =
    useState<SchoolProfileSectionId>("about");
  const [visitedSections, setVisitedSections] = useState(
    () => new Set<SchoolProfileSectionId>(["about"]),
  );
  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [pendingSection, setPendingSection] =
    useState<SchoolProfileSectionId | null>("about");
  const [loadingSection, setLoadingSection] =
    useState<SchoolProfileSectionId | null>("about");
  const bundleLoadedRef = useRef(false);
  const loadInFlightRef = useRef<Promise<void> | null>(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<OrganizationSchoolProfile>(
    getDefaultOrganizationSchoolProfile(),
  );
  const [campus, setCampus] = useState<OrganizationCampus>(
    getDefaultPrimaryCampus(organizationId),
  );
  const [savedProfile, setSavedProfile] = useState<OrganizationSchoolProfile>(
    getDefaultOrganizationSchoolProfile(),
  );
  const [savedCampus, setSavedCampus] = useState<OrganizationCampus>(
    getDefaultPrimaryCampus(organizationId),
  );

  const commitSavedBundle = useCallback(
    (
      nextProfile: OrganizationSchoolProfile,
      nextCampus: OrganizationCampus,
    ) => {
      const profileParsed = parseOrganizationSchoolProfile(
        nextProfile as unknown as Record<string, unknown>,
      );
      const campusParsed = parseOrganizationCampusRow(
        organizationId,
        nextCampus as unknown as Record<string, unknown>,
      );
      setProfile(profileParsed);
      setCampus(campusParsed);
      setSavedProfile(profileParsed);
      setSavedCampus(campusParsed);
    },
    [organizationId],
  );

  const isDirty = useMemo(() => {
    if (!bundleLoaded) return false;
    return isSchoolProfileBundleDirty(
      { profile, primaryCampus: campus },
      { profile: savedProfile, primaryCampus: savedCampus },
    );
  }, [bundleLoaded, profile, campus, savedProfile, savedCampus]);

  const {
    dialogOpen: leaveDialogOpen,
    requestAction,
    confirmLeave,
    cancelLeave,
  } = useUnsavedChangesGuard({
    isDirty,
    enabled: bundleLoaded && !saving,
  });

  const ensureBundleLoaded = useCallback(
    async (triggerSection: SchoolProfileSectionId) => {
      if (bundleLoadedRef.current) {
        setPendingSection(null);
        setLoadingSection(null);
        return;
      }

      setLoadingSection(triggerSection);

      if (loadInFlightRef.current) {
        await loadInFlightRef.current;
        return;
      }

      const loadPromise = (async () => {
        try {
          const response = await fetch(
            `/api/school-admin/school-profile?organizationId=${encodeURIComponent(organizationId)}`,
          );
          const payload = (await response.json()) as {
            profile?: OrganizationSchoolProfile;
            primaryCampus?: OrganizationCampus;
            error?: string;
          };
          if (!response.ok) {
            throw new Error(payload.error ?? "Failed to load school profile.");
          }
          commitSavedBundle(
            payload.profile ?? getDefaultOrganizationSchoolProfile(),
            payload.primaryCampus ?? getDefaultPrimaryCampus(organizationId),
          );
          bundleLoadedRef.current = true;
          setBundleLoaded(true);
        } catch (err) {
          adminToast.error(
            formatActionError(err, "Failed to load school profile."),
          );
        } finally {
          setPendingSection(null);
          setLoadingSection(null);
          loadInFlightRef.current = null;
        }
      })();

      loadInFlightRef.current = loadPromise;
      await loadPromise;
    },
    [organizationId, commitSavedBundle],
  );

  const applySectionChange = useCallback(
    (section: SchoolProfileSectionId) => {
      setVisitedSections((current) => {
        if (current.has(section)) return current;
        const next = new Set(current);
        next.add(section);
        return next;
      });
      setActiveSection(section);
      if (section === "photos") {
        setPendingSection(null);
        setLoadingSection(null);
        return;
      }
      if (bundleLoadedRef.current) {
        setPendingSection(null);
        setLoadingSection(null);
        return;
      }
      setPendingSection(section);
      void ensureBundleLoaded(section);
    },
    [ensureBundleLoaded],
  );

  const handleSectionChange = useCallback(
    (section: SchoolProfileSectionId) => {
      if (section === activeSection) return;
      requestAction(() => applySectionChange(section));
    },
    [activeSection, applySectionChange, requestAction],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void ensureBundleLoaded("about");
    });
  }, [ensureBundleLoaded]);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/school-admin/school-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          profile,
          primaryCampus: campus,
        }),
      });
      const payload = (await response.json()) as {
        profile?: OrganizationSchoolProfile;
        primaryCampus?: OrganizationCampus;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save school profile.");
      }
      commitSavedBundle(
        payload.profile ?? profile,
        payload.primaryCampus ?? campus,
      );
      adminToast.success("School profile saved");
    } catch (err) {
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "school_profile.save",
          error: "",
        },
        err,
      );
      adminToast.error(formatActionError(err, "Failed to save school profile."));
    } finally {
      setSaving(false);
    }
  }

  function updatePhone(index: number, patch: Partial<SchoolProfileContactPhone>) {
    setCampus((current) => {
      const phones = current.phones.map((phone, i) =>
        i === index ? { ...phone, ...patch } : phone,
      );
      return { ...current, phones };
    });
  }

  function addPhone() {
    setCampus((current) => ({
      ...current,
      phones: [
        ...current.phones,
        {
          label: "Main office",
          number: "",
          is_primary: current.phones.length === 0,
        },
      ],
    }));
  }

  function removePhone(index: number) {
    setCampus((current) => ({
      ...current,
      phones: current.phones.filter((_, i) => i !== index),
    }));
  }

  function updateEmail(index: number, patch: Partial<SchoolProfileContactEmail>) {
    setCampus((current) => {
      const emails = current.emails.map((email, i) =>
        i === index ? { ...email, ...patch } : email,
      );
      return { ...current, emails };
    });
  }

  function addEmail() {
    setCampus((current) => ({
      ...current,
      emails: [
        ...current.emails,
        {
          label: "General",
          email: "",
          is_primary: current.emails.length === 0,
        },
      ],
    }));
  }

  function removeEmail(index: number) {
    setCampus((current) => ({
      ...current,
      emails: current.emails.filter((_, i) => i !== index),
    }));
  }

  const showSectionContent = bundleLoaded;

  return (
    <div className={PAGE_SHELL_CLASS}>
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <SchoolProfileStoryHeader
          theme={theme}
          schoolName={schoolName}
          timezone={timezone}
          activeSection={activeSection}
          pendingSection={pendingSection}
          loadingSection={loadingSection}
          saving={saving}
          saveDisabled={!bundleLoaded || !isDirty || saving}
          showUnsavedChanges={isDirty && !saving}
          showSaveButton={activeSection !== "photos"}
          onSectionChange={handleSectionChange}
          onSave={() => void handleSave()}
        />

        {visitedSections.has("about") ? (
          <div hidden={activeSection !== "about"}>
            {!showSectionContent ? (
              <SectionLoadingPanel theme={theme} />
            ) : (
          <AdminCard theme={theme} padding="canvas" className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#2F3D33]">About &amp; links</h2>
            <div>
              <FieldLabel>Website</FieldLabel>
              <input
                type="url"
                className={committeeStoryInputClassName}
                style={inputStyle}
                value={profile.website_url ?? ""}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    website_url: e.target.value,
                  }))
                }
                placeholder="https://"
              />
            </div>
            <div>
              <FieldLabel>About your school</FieldLabel>
              <textarea
                className={`${committeeStoryInputClassName} min-h-[96px] resize-y`}
                style={inputStyle}
                value={profile.about ?? ""}
                onChange={(e) =>
                  setProfile((current) => ({ ...current, about: e.target.value }))
                }
                placeholder="A short description families and staff might see in the future."
              />
            </div>
            <div>
              <FieldLabel>Emergency line</FieldLabel>
              <input
                type="tel"
                className={committeeStoryInputClassName}
                style={inputStyle}
                value={profile.emergency_line ?? ""}
                onChange={(e) =>
                  setProfile((current) => ({
                    ...current,
                    emergency_line: e.target.value,
                  }))
                }
                placeholder="Optional after-hours or emergency number"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["instagram", "Instagram"],
                  ["facebook", "Facebook"],
                  ["linkedin", "LinkedIn"],
                  ["youtube", "YouTube"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <input
                    type="url"
                    className={committeeStoryInputClassName}
                    style={inputStyle}
                    value={profile.social_links[key] ?? ""}
                    onChange={(e) =>
                      setProfile((current) => ({
                        ...current,
                        social_links: {
                          ...current.social_links,
                          [key]: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://"
                  />
                </div>
              ))}
            </div>
          </AdminCard>
            )}
          </div>
        ) : null}

        {visitedSections.has("campus") ? (
          <div hidden={activeSection !== "campus"}>
            {!showSectionContent ? (
              <SectionLoadingPanel theme={theme} />
            ) : (
          <AdminCard theme={theme} padding="canvas" className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#2F3D33]">Primary campus</h2>
            <div>
              <FieldLabel>Campus name</FieldLabel>
              <input
                className={committeeStoryInputClassName}
                style={inputStyle}
                value={campus.name}
                onChange={(e) =>
                  setCampus((current) => ({ ...current, name: e.target.value }))
                }
              />
            </div>
            <div>
              <FieldLabel>Address line 1</FieldLabel>
              <input
                className={committeeStoryInputClassName}
                style={inputStyle}
                value={campus.address_line1 ?? ""}
                onChange={(e) =>
                  setCampus((current) => ({
                    ...current,
                    address_line1: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel>Address line 2</FieldLabel>
              <input
                className={committeeStoryInputClassName}
                style={inputStyle}
                value={campus.address_line2 ?? ""}
                onChange={(e) =>
                  setCampus((current) => ({
                    ...current,
                    address_line2: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <FieldLabel>City</FieldLabel>
                <input
                  className={committeeStoryInputClassName}
                  style={inputStyle}
                  value={campus.city ?? ""}
                  onChange={(e) =>
                    setCampus((current) => ({ ...current, city: e.target.value }))
                  }
                />
              </div>
              <div>
                <FieldLabel>State / region</FieldLabel>
                <input
                  className={committeeStoryInputClassName}
                  style={inputStyle}
                  value={campus.state_region ?? ""}
                  onChange={(e) =>
                    setCampus((current) => ({
                      ...current,
                      state_region: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <FieldLabel>Postal code</FieldLabel>
                <input
                  className={committeeStoryInputClassName}
                  style={inputStyle}
                  value={campus.postal_code ?? ""}
                  onChange={(e) =>
                    setCampus((current) => ({
                      ...current,
                      postal_code: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </AdminCard>
            )}
          </div>
        ) : null}

        {visitedSections.has("phones") ? (
          <div hidden={activeSection !== "phones"}>
            {!showSectionContent ? (
              <SectionLoadingPanel theme={theme} />
            ) : (
          <AdminCard theme={theme} padding="canvas" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#2F3D33]">Phone numbers</h2>
              <AdminButton theme={theme} variant="soft" type="button" onClick={addPhone}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add phone
              </AdminButton>
            </div>
            {campus.phones.length === 0 ? (
              <p className="text-sm text-[#6B7A6E]">No phone numbers yet.</p>
            ) : (
              campus.phones.map((phone, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-lg border border-[#E4ECE4] p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    className={committeeStoryInputClassName}
                    style={inputStyle}
                    value={phone.label}
                    onChange={(e) => updatePhone(index, { label: e.target.value })}
                    placeholder="Label"
                  />
                  <input
                    type="tel"
                    className={committeeStoryInputClassName}
                    style={inputStyle}
                    value={phone.number}
                    onChange={(e) => updatePhone(index, { number: e.target.value })}
                    placeholder="Phone number"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-[#6B7A6E]">
                      <input
                        type="radio"
                        name="primary-phone"
                        checked={phone.is_primary}
                        onChange={() =>
                          setCampus((current) => ({
                            ...current,
                            phones: current.phones.map((entry, i) => ({
                              ...entry,
                              is_primary: i === index,
                            })),
                          }))
                        }
                      />
                      Primary
                    </label>
                    <button
                      type="button"
                      className="rounded p-1 text-[#8A968C] hover:bg-[#F3F6F3]"
                      onClick={() => removePhone(index)}
                      aria-label="Remove phone"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </AdminCard>
            )}
          </div>
        ) : null}

        {visitedSections.has("emails") ? (
          <div hidden={activeSection !== "emails"}>
            {!showSectionContent ? (
              <SectionLoadingPanel theme={theme} />
            ) : (
          <AdminCard theme={theme} padding="canvas" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#2F3D33]">Contact emails</h2>
              <AdminButton theme={theme} variant="soft" type="button" onClick={addEmail}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add email
              </AdminButton>
            </div>
            {campus.emails.length === 0 ? (
              <p className="text-sm text-[#6B7A6E]">No contact emails yet.</p>
            ) : (
              campus.emails.map((email, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-lg border border-[#E4ECE4] p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    className={committeeStoryInputClassName}
                    style={inputStyle}
                    value={email.label}
                    onChange={(e) => updateEmail(index, { label: e.target.value })}
                    placeholder="Label"
                  />
                  <input
                    type="email"
                    className={committeeStoryInputClassName}
                    style={inputStyle}
                    value={email.email}
                    onChange={(e) => updateEmail(index, { email: e.target.value })}
                    placeholder="email@school.org"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-[#6B7A6E]">
                      <input
                        type="radio"
                        name="primary-email"
                        checked={email.is_primary}
                        onChange={() =>
                          setCampus((current) => ({
                            ...current,
                            emails: current.emails.map((entry, i) => ({
                              ...entry,
                              is_primary: i === index,
                            })),
                          }))
                        }
                      />
                      Primary
                    </label>
                    <button
                      type="button"
                      className="rounded p-1 text-[#8A968C] hover:bg-[#F3F6F3]"
                      onClick={() => removeEmail(index)}
                      aria-label="Remove email"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </AdminCard>
            )}
          </div>
        ) : null}

        {visitedSections.has("hours") ? (
          <div hidden={activeSection !== "hours"}>
            {!showSectionContent ? (
              <SectionLoadingPanel theme={theme} />
            ) : (
          <AdminCard theme={theme} padding="canvas" className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#2F3D33]">Hours &amp; directions</h2>
            <div>
              <FieldLabel>Office hours</FieldLabel>
              <textarea
                className={`${committeeStoryInputClassName} min-h-[80px] resize-y`}
                style={inputStyle}
                value={campus.office_hours_notes ?? ""}
                onChange={(e) =>
                  setCampus((current) => ({
                    ...current,
                    office_hours_notes: e.target.value,
                  }))
                }
                placeholder="e.g. Mon–Fri 8:30am–3:30pm"
              />
            </div>
            <div>
              <FieldLabel>Directions</FieldLabel>
              <textarea
                className={`${committeeStoryInputClassName} min-h-[80px] resize-y`}
                style={inputStyle}
                value={campus.directions_notes ?? ""}
                onChange={(e) =>
                  setCampus((current) => ({
                    ...current,
                    directions_notes: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <FieldLabel>Parking</FieldLabel>
              <textarea
                className={`${committeeStoryInputClassName} min-h-[64px] resize-y`}
                style={inputStyle}
                value={campus.parking_notes ?? ""}
                onChange={(e) =>
                  setCampus((current) => ({
                    ...current,
                    parking_notes: e.target.value,
                  }))
                }
              />
            </div>
          </AdminCard>
            )}
          </div>
        ) : null}

        {visitedSections.has("photos") ? (
          <div hidden={activeSection !== "photos"}>
            <SchoolProfilePhotosSection
              organizationId={organizationId}
              theme={theme}
              C={C}
            />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        C={C}
        open={leaveDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you leave now, your changes will be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={confirmLeave}
        onClose={cancelLeave}
      />
    </div>
  );
}
