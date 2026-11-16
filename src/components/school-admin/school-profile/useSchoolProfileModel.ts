"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useAdminAction, NOT_SAVED } from "@/components/school-admin/garden/useAdminAction";
import {
  SCHOOL_PROFILE_SECTIONS,
  type SchoolProfileSectionId,
} from "@/components/school-admin/school-profile/school-profile-sections";
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
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/*
 * School Profile view-model: one bundle load (profile + primary campus),
 * local edits, save with the admin feedback contract, unsaved-changes guard.
 * Skill: .claude/skills/admin-portal-garden-design §5.
 */

type Bundle = { profile: OrganizationSchoolProfile; primaryCampus: OrganizationCampus };

const SECTION_LABELS = Object.fromEntries(
  SCHOOL_PROFILE_SECTIONS.map((section) => [section.id, section.label]),
) as Record<SchoolProfileSectionId, string>;

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Which editable sections differ between two bundles (for save copy). */
export function changedSchoolProfileSections(current: Bundle, saved: Bundle): SchoolProfileSectionId[] {
  const changed: SchoolProfileSectionId[] = [];
  const p = current.profile;
  const sp = saved.profile;
  if (
    !sameJson(
      [p.website_url, p.about, p.emergency_line, p.social_links],
      [sp.website_url, sp.about, sp.emergency_line, sp.social_links],
    )
  ) {
    changed.push("about");
  }
  const c = current.primaryCampus;
  const sc = saved.primaryCampus;
  if (
    !sameJson(
      [c.name, c.address_line1, c.address_line2, c.city, c.state_region, c.postal_code],
      [sc.name, sc.address_line1, sc.address_line2, sc.city, sc.state_region, sc.postal_code],
    )
  ) {
    changed.push("campus");
  }
  if (!sameJson(c.phones, sc.phones)) changed.push("phones");
  if (!sameJson(c.emails, sc.emails)) changed.push("emails");
  if (
    !sameJson(
      [c.office_hours_notes, c.directions_notes, c.parking_notes],
      [sc.office_hours_notes, sc.directions_notes, sc.parking_notes],
    )
  ) {
    changed.push("hours");
  }
  return changed;
}

function filled(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

/** Completeness per section, built only from the saved data. */
export function schoolProfileCompleteness(bundle: Bundle, photoCount: number | null) {
  const { profile, primaryCampus: campus } = bundle;
  return {
    about: filled(profile.website_url) || filled(profile.about),
    campus: filled(campus.address_line1) && filled(campus.city),
    phones: campus.phones.some((phone) => filled(phone.number)),
    emails: campus.emails.some((email) => filled(email.email)),
    hours: filled(campus.office_hours_notes),
    photos: photoCount != null ? photoCount > 0 : false,
  } satisfies Record<SchoolProfileSectionId, boolean>;
}

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

export function useSchoolProfileModel({ organizationId }: { organizationId: string }) {
  const [activeSection, setActiveSection] = useState<SchoolProfileSectionId>("about");
  const [visitedPhotos, setVisitedPhotos] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [profile, setProfile] = useState<OrganizationSchoolProfile>(getDefaultOrganizationSchoolProfile);
  const [campus, setCampus] = useState<OrganizationCampus>(() => getDefaultPrimaryCampus(organizationId));
  const [savedProfile, setSavedProfile] = useState<OrganizationSchoolProfile>(getDefaultOrganizationSchoolProfile);
  const [savedCampus, setSavedCampus] = useState<OrganizationCampus>(() => getDefaultPrimaryCampus(organizationId));
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [photoCount, setPhotoCount] = useState<number | null>(null);
  const action = useAdminAction();
  const saving = action.pendingKey === "school-profile-save";

  const profileRef = useRef(profile);
  const campusRef = useRef(campus);
  useEffect(() => {
    profileRef.current = profile;
    campusRef.current = campus;
  }, [profile, campus]);

  const parseBundle = useCallback(
    (nextProfile: OrganizationSchoolProfile, nextCampus: OrganizationCampus) => ({
      profile: parseOrganizationSchoolProfile(nextProfile as unknown as Record<string, unknown>),
      campus: parseOrganizationCampusRow(organizationId, nextCampus as unknown as Record<string, unknown>),
    }),
    [organizationId],
  );

  const requestIdRef = useRef(0);
  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const response = await fetch(
        `/api/school-admin/school-profile?organizationId=${encodeURIComponent(organizationId)}`,
      );
      const payload = (await response.json().catch(() => ({}))) as {
        profile?: OrganizationSchoolProfile;
        primaryCampus?: OrganizationCampus;
        error?: string;
      };
      if (!response.ok) throw new Error(payload.error ?? "Failed to load school profile.");
      if (requestId !== requestIdRef.current) return;
      const parsed = parseBundle(
        payload.profile ?? getDefaultOrganizationSchoolProfile(),
        payload.primaryCampus ?? getDefaultPrimaryCampus(organizationId),
      );
      setProfile(parsed.profile);
      setCampus(parsed.campus);
      setSavedProfile(parsed.profile);
      setSavedCampus(parsed.campus);
      setLoadError(null);
      setStatus("ready");
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setLoadError(formatActionError(err, "Failed to load school profile."));
      setStatus((current) => (current === "ready" ? current : "error"));
    }
  }, [organizationId, parseBundle]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const retryLoad = useCallback(async () => {
    setRetrying(true);
    await load();
    setRetrying(false);
  }, [load]);

  const loaded = status === "ready";
  const current: Bundle = useMemo(() => ({ profile, primaryCampus: campus }), [profile, campus]);
  const saved: Bundle = useMemo(
    () => ({ profile: savedProfile, primaryCampus: savedCampus }),
    [savedProfile, savedCampus],
  );
  const isDirty = loaded && isSchoolProfileBundleDirty(current, saved);
  const changedSections = useMemo(
    () => (isDirty ? changedSchoolProfileSections(current, saved) : []),
    [current, saved, isDirty],
  );

  const guard = useUnsavedChangesGuard({ isDirty, enabled: loaded });

  const discard = useCallback(() => {
    setProfile(savedProfile);
    setCampus(savedCampus);
  }, [savedCampus, savedProfile]);

  const confirmLeave = useCallback(() => {
    discard();
    guard.confirmLeave();
  }, [discard, guard]);

  const changeSection = useCallback(
    (section: SchoolProfileSectionId) => {
      if (saving || section === activeSection) return;
      guard.requestAction(() => {
        if (section === "photos") setVisitedPhotos(true);
        setActiveSection(section);
      });
    },
    [activeSection, guard, saving],
  );

  const save = useCallback(async () => {
    const sentAtSaveStart = { profile: profileRef.current, primaryCampus: campusRef.current };
    const sections = changedSchoolProfileSections(sentAtSaveStart, saved).map((id) => SECTION_LABELS[id]);
    await action.run(
      async () => {
        try {
          const response = await fetch("/api/school-admin/school-profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId,
              profile: sentAtSaveStart.profile,
              primaryCampus: sentAtSaveStart.primaryCampus,
            }),
          });
          const payload = (await response.json().catch(() => ({}))) as {
            profile?: OrganizationSchoolProfile;
            primaryCampus?: OrganizationCampus;
            error?: string;
          };
          if (!response.ok) throw new Error(payload.error ?? "Failed to save school profile.");
          const parsed = parseBundle(
            payload.profile ?? sentAtSaveStart.profile,
            payload.primaryCampus ?? sentAtSaveStart.primaryCampus,
          );
          setSavedProfile(parsed.profile);
          setSavedCampus(parsed.campus);
          // Keep edits made while the save was in flight.
          const editedDuringSave = isSchoolProfileBundleDirty(
            { profile: profileRef.current, primaryCampus: campusRef.current },
            sentAtSaveStart,
          );
          if (!editedDuringSave) {
            setProfile(parsed.profile);
            setCampus(parsed.campus);
          }
          setSavedAt(Date.now());
        } catch (err) {
          void reportPortalOperationalError(
            "school_admin",
            { organizationId, operation: "school_profile.save", error: "" },
            err,
          );
          throw err;
        }
      },
      {
        key: "school-profile-save",
        id: "school-profile-save",
        success: {
          title: "School profile saved.",
          description: sections.length
            ? `${joinLabels(sections)} ${sections.length === 1 ? "is" : "are"} up to date.`
            : undefined,
        },
        error: {
          title: "Couldn't save the school profile.",
          description: `${NOT_SAVED} Your edits are still here.`,
          fallback: "Failed to save school profile.",
        },
      },
    );
  }, [action, organizationId, parseBundle, saved]);

  /* ---- field helpers (local edits only) ---- */
  const updateProfile = useCallback((patch: Partial<OrganizationSchoolProfile>) => {
    setProfile((currentProfile) => ({ ...currentProfile, ...patch }));
  }, []);
  const updateCampus = useCallback((patch: Partial<OrganizationCampus>) => {
    setCampus((currentCampus) => ({ ...currentCampus, ...patch }));
  }, []);

  const updatePhone = useCallback((index: number, patch: Partial<SchoolProfileContactPhone>) => {
    setCampus((c) => ({ ...c, phones: c.phones.map((phone, i) => (i === index ? { ...phone, ...patch } : phone)) }));
  }, []);
  const addPhone = useCallback(() => {
    setCampus((c) => ({
      ...c,
      phones: [...c.phones, { label: "Main office", number: "", is_primary: c.phones.length === 0 }],
    }));
  }, []);
  const removePhone = useCallback((index: number) => {
    setCampus((c) => ({ ...c, phones: c.phones.filter((_, i) => i !== index) }));
  }, []);
  const setPrimaryPhone = useCallback((index: number) => {
    setCampus((c) => ({ ...c, phones: c.phones.map((entry, i) => ({ ...entry, is_primary: i === index })) }));
  }, []);

  const updateEmail = useCallback((index: number, patch: Partial<SchoolProfileContactEmail>) => {
    setCampus((c) => ({ ...c, emails: c.emails.map((email, i) => (i === index ? { ...email, ...patch } : email)) }));
  }, []);
  const addEmail = useCallback(() => {
    setCampus((c) => ({
      ...c,
      emails: [...c.emails, { label: "General", email: "", is_primary: c.emails.length === 0 }],
    }));
  }, []);
  const removeEmail = useCallback((index: number) => {
    setCampus((c) => ({ ...c, emails: c.emails.filter((_, i) => i !== index) }));
  }, []);
  const setPrimaryEmail = useCallback((index: number) => {
    setCampus((c) => ({ ...c, emails: c.emails.map((entry, i) => ({ ...entry, is_primary: i === index })) }));
  }, []);

  const completeness = useMemo(() => schoolProfileCompleteness(saved, photoCount), [saved, photoCount]);

  return {
    activeSection,
    changeSection,
    visitedPhotos: visitedPhotos || activeSection === "photos",
    status,
    loaded,
    loadError,
    retrying,
    retryLoad,
    profile,
    campus,
    updateProfile,
    updateCampus,
    updatePhone,
    addPhone,
    removePhone,
    setPrimaryPhone,
    updateEmail,
    addEmail,
    removeEmail,
    setPrimaryEmail,
    isDirty,
    changedSections,
    saving,
    savedAt,
    save,
    discard,
    leaveDialogOpen: guard.dialogOpen,
    confirmLeave,
    cancelLeave: guard.cancelLeave,
    photoCount,
    setPhotoCount,
    completeness,
  };
}

export type SchoolProfileModel = ReturnType<typeof useSchoolProfileModel>;
