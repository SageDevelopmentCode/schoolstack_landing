"use client";

import { useMemo, type ReactNode } from "react";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import SchoolProfilePhotosSection from "@/components/school-admin/school-profile-photos/SchoolProfilePhotosSection";
import {
  SCHOOL_PROFILE_SECTIONS,
  SCHOOL_PROFILE_SECTION_ICON_CLASS,
  subtitleForSchoolProfileSection,
  type SchoolProfileSectionId,
} from "@/components/school-admin/school-profile/school-profile-sections";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  GardenField,
  GardenLoadError,
  GardenSaveBar,
  GardenSteps,
  gIconBtn,
  gInputClass,
  useGardenFieldId,
} from "@/components/school-admin/garden/kit";
import { GCard, GChip, GSkeleton, G_FOCUS, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import {
  buildParentThemeTokens,
  parentThemeToAdminCompat,
} from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { useSchoolProfileModel, type SchoolProfileModel } from "./useSchoolProfileModel";

type SchoolProfilePageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  schoolName: string;
  timezone: string;
};

const SOCIAL_FIELDS = [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
] as const;

export default function SchoolProfilePage({
  organizationId,
  branding,
  slug,
  schoolName,
  timezone,
}: SchoolProfilePageProps) {
  void slug;
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const model = useSchoolProfileModel({ organizationId });

  const sectionCount = SCHOOL_PROFILE_SECTIONS.length;
  const completeCount = SCHOOL_PROFILE_SECTIONS.filter((s) => model.completeness[s.id]).length;
  const statusLine = model.loaded
    ? `${schoolName} · Timezone ${timezone} (organization level) · ${completeCount} of ${sectionCount} sections filled in`
    : `${schoolName} · Timezone ${timezone} (organization level)`;

  const tabs = SCHOOL_PROFILE_SECTIONS.map((section) => {
    const Icon = section.icon;
    const loading = section.id !== "photos" && model.status === "loading" && model.activeSection === section.id;
    const changed = model.changedSections.includes(section.id);
    return {
      key: section.id,
      label: section.label,
      icon: <Icon className={SCHOOL_PROFILE_SECTION_ICON_CLASS} aria-hidden />,
      testId: `school-profile-section-${section.id}`,
      disabled: model.saving,
      ariaBusy: loading,
      suffix: loading ? (
        <Loader2 className="h-3 w-3 animate-spin" data-testid="school-profile-section-loading" />
      ) : changed ? (
        <span aria-label="Unsaved changes" className="h-2 w-2 rounded-full bg-[#d9a400]" />
      ) : undefined,
    };
  });

  const editable = model.activeSection !== "photos";

  return (
    <AdminGardenPage
      theme={theme}
      skinOverlays
      data-testid="admin-school-profile-page"
      overlays={
        <ConfirmDialog
          C={C}
          open={model.leaveDialogOpen}
          title="Unsaved changes"
          description="You have unsaved changes. If you leave now, your changes will be lost."
          confirmLabel="Leave without saving"
          cancelLabel="Keep editing"
          variant="destructive"
          onConfirm={model.confirmLeave}
          onClose={model.cancelLeave}
        />
      }
    >
      <AdminGardenPageHeader
        kicker="My school"
        title={
          <>
            School <span className="text-[var(--sf-clay)]">profile</span>
          </>
        }
        subtitle={statusLine}
        tabs={{
          items: tabs,
          activeKey: model.activeSection,
          onChange: (key) => model.changeSection(key as SchoolProfileSectionId),
          ariaLabel: "School profile sections",
          "data-testid": "school-profile-section-nav",
        }}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          {editable ? <SectionEditor model={model} /> : null}
          {model.visitedPhotos ? (
            <div hidden={model.activeSection !== "photos"}>
              <SchoolProfilePhotosSection
                organizationId={organizationId}
                theme={theme}
                C={C}
                onCountChange={model.setPhotoCount}
              />
            </div>
          ) : null}
          {editable && model.loaded ? (
            <GardenSaveBar
              dirty={model.isDirty}
              saving={model.saving}
              savedAt={model.savedAt}
              onSave={() => void model.save()}
              onDiscard={model.discard}
              saveLabel="Save profile"
              data-testid="school-profile-save-bar"
            />
          ) : null}
        </div>
        <ProfileRail model={model} completeCount={completeCount} />
      </div>
    </AdminGardenPage>
  );
}

/* ------------------------------------------------------------------ */
/* Section editor                                                      */
/* ------------------------------------------------------------------ */

function SectionEditor({ model }: { model: SchoolProfileModel }) {
  const section = model.activeSection;
  const meta = SCHOOL_PROFILE_SECTIONS.find((s) => s.id === section);
  const title = meta?.label ?? "";

  if (model.status === "loading") {
    return (
      <GCard index={1} kicker={title} title="Loading your school profile">
        <div className="flex flex-col gap-3" role="status" aria-live="polite">
          <span className="sr-only">Loading section</span>
          <GSkeleton className="h-11 !rounded-[14px]" />
          <GSkeleton className="h-24 !rounded-[14px]" />
          <GSkeleton className="h-11 !rounded-[14px]" />
        </div>
      </GCard>
    );
  }
  if (model.status === "error") {
    return (
      <GardenLoadError
        title="Your school profile didn't load"
        description={`${model.loadError ?? "Something went wrong."} Nothing can be saved until it loads, so your current details stay safe.`}
        onRetry={() => void model.retryLoad()}
        retrying={model.retrying}
      />
    );
  }

  let body: ReactNode = null;
  if (section === "about") body = <AboutFields model={model} />;
  if (section === "campus") body = <CampusFields model={model} />;
  if (section === "phones") body = <PhoneRows model={model} />;
  if (section === "emails") body = <EmailRows model={model} />;
  if (section === "hours") body = <HoursFields model={model} />;

  const action =
    section === "phones" ? (
      <button type="button" className={gBtnOutlineSm} onClick={model.addPhone}>
        <Plus className="h-4 w-4" aria-hidden />
        Add phone
      </button>
    ) : section === "emails" ? (
      <button type="button" className={gBtnOutlineSm} onClick={model.addEmail}>
        <Plus className="h-4 w-4" aria-hidden />
        Add email
      </button>
    ) : undefined;

  return (
    <GCard
      index={1}
      kicker="Section"
      title={title}
      action={action}
      data-testid={`school-profile-panel-${section}`}
    >
      <p className="-mt-2 mb-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
        {subtitleForSchoolProfileSection(section)}
      </p>
      {body}
    </GCard>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  multiline,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: ReactNode;
  multiline?: boolean;
  rows?: number;
}) {
  const id = useGardenFieldId("sp");
  return (
    <GardenField id={id} label={label} hint={hint}>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-garden-skip
          className={`${gInputClass()} resize-y`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-garden-skip
          className={gInputClass()}
        />
      )}
    </GardenField>
  );
}

function AboutFields({ model }: { model: SchoolProfileModel }) {
  const { profile } = model;
  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Website"
        type="url"
        value={profile.website_url ?? ""}
        onChange={(value) => model.updateProfile({ website_url: value })}
        placeholder="https://"
      />
      <TextField
        label="About your school"
        multiline
        rows={4}
        value={profile.about ?? ""}
        onChange={(value) => model.updateProfile({ about: value })}
        placeholder="A short description families and staff might see in the future."
      />
      <TextField
        label="Emergency line"
        type="tel"
        value={profile.emergency_line ?? ""}
        onChange={(value) => model.updateProfile({ emergency_line: value })}
        placeholder="Optional after-hours or emergency number"
      />
      <div>
        <p className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
          Social links
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              type="url"
              value={profile.social_links[key] ?? ""}
              onChange={(value) =>
                model.updateProfile({ social_links: { ...profile.social_links, [key]: value } })
              }
              placeholder="https://"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CampusFields({ model }: { model: SchoolProfileModel }) {
  const { campus } = model;
  return (
    <div className="flex flex-col gap-4">
      <TextField label="Campus name" value={campus.name} onChange={(value) => model.updateCampus({ name: value })} />
      <TextField
        label="Address line 1"
        value={campus.address_line1 ?? ""}
        onChange={(value) => model.updateCampus({ address_line1: value })}
      />
      <TextField
        label="Address line 2"
        value={campus.address_line2 ?? ""}
        onChange={(value) => model.updateCampus({ address_line2: value })}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField label="City" value={campus.city ?? ""} onChange={(value) => model.updateCampus({ city: value })} />
        <TextField
          label="State / region"
          value={campus.state_region ?? ""}
          onChange={(value) => model.updateCampus({ state_region: value })}
        />
        <TextField
          label="Postal code"
          value={campus.postal_code ?? ""}
          onChange={(value) => model.updateCampus({ postal_code: value })}
        />
      </div>
    </div>
  );
}

function HoursFields({ model }: { model: SchoolProfileModel }) {
  const { campus } = model;
  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Office hours"
        multiline
        value={campus.office_hours_notes ?? ""}
        onChange={(value) => model.updateCampus({ office_hours_notes: value })}
        placeholder="e.g. Mon–Fri 8:30am–3:30pm"
      />
      <TextField
        label="Directions"
        multiline
        value={campus.directions_notes ?? ""}
        onChange={(value) => model.updateCampus({ directions_notes: value })}
      />
      <TextField
        label="Parking"
        multiline
        rows={2}
        value={campus.parking_notes ?? ""}
        onChange={(value) => model.updateCampus({ parking_notes: value })}
      />
    </div>
  );
}

function ContactRow({
  index,
  label,
  value,
  primary,
  valueType,
  valuePlaceholder,
  noun,
  radioName,
  onLabel,
  onValue,
  onPrimary,
  onRemove,
}: {
  index: number;
  label: string;
  value: string;
  primary: boolean;
  valueType: "tel" | "email";
  valuePlaceholder: string;
  noun: string;
  radioName: string;
  onLabel: (value: string) => void;
  onValue: (value: string) => void;
  onPrimary: () => void;
  onRemove: () => void;
}) {
  return (
    <li
      className={`grid gap-2.5 rounded-[16px] border-[1.5px] p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-center ${
        primary ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]" : "border-[var(--sf-ink)]/10 bg-white"
      }`}
    >
      <input
        value={label}
        onChange={(e) => onLabel(e.target.value)}
        placeholder="Label"
        aria-label={`${noun} ${index + 1} label`}
        data-garden-skip
        className={gInputClass()}
      />
      <input
        type={valueType}
        value={value}
        onChange={(e) => onValue(e.target.value)}
        placeholder={valuePlaceholder}
        aria-label={`${noun} ${index + 1}`}
        data-garden-skip
        className={gInputClass()}
      />
      <div className="flex items-center justify-end gap-2">
        <label
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1.5 text-[12.5px] font-extrabold transition-colors focus-within:ring-4 focus-within:ring-[var(--sf-clay)]/25 ${
            primary
              ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
              : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/35"
          }`}
        >
          <input type="radio" name={radioName} checked={primary} onChange={onPrimary} className="sr-only" />
          <Star className={`h-3.5 w-3.5 ${primary ? "fill-current" : ""}`} aria-hidden />
          Primary
        </label>
        <button type="button" className={`${gIconBtn} ${G_FOCUS}`} onClick={onRemove} aria-label={`Remove ${noun.toLowerCase()}`}>
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}

function PhoneRows({ model }: { model: SchoolProfileModel }) {
  const phones = model.campus.phones;
  if (phones.length === 0) {
    return (
      <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
        No phone numbers yet. Use <b className="text-[var(--sf-ink)]">Add phone</b> to add the office line first. The first one
        becomes the primary number.
      </p>
    );
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {phones.map((phone, index) => (
        <ContactRow
          key={index}
          index={index}
          label={phone.label}
          value={phone.number}
          primary={phone.is_primary}
          valueType="tel"
          valuePlaceholder="Phone number"
          noun="Phone"
          radioName="primary-phone"
          onLabel={(value) => model.updatePhone(index, { label: value })}
          onValue={(value) => model.updatePhone(index, { number: value })}
          onPrimary={() => model.setPrimaryPhone(index)}
          onRemove={() => model.removePhone(index)}
        />
      ))}
    </ul>
  );
}

function EmailRows({ model }: { model: SchoolProfileModel }) {
  const emails = model.campus.emails;
  if (emails.length === 0) {
    return (
      <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
        No contact emails yet. Use <b className="text-[var(--sf-ink)]">Add email</b> to add the inbox families should write to.
      </p>
    );
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {emails.map((email, index) => (
        <ContactRow
          key={index}
          index={index}
          label={email.label}
          value={email.email}
          primary={email.is_primary}
          valueType="email"
          valuePlaceholder="email@school.org"
          noun="Email"
          radioName="primary-email"
          onLabel={(value) => model.updateEmail(index, { label: value })}
          onValue={(value) => model.updateEmail(index, { email: value })}
          onPrimary={() => model.setPrimaryEmail(index)}
          onRemove={() => model.removeEmail(index)}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Rail: completeness                                                  */
/* ------------------------------------------------------------------ */

function ProfileRail({ model, completeCount }: { model: SchoolProfileModel; completeCount: number }) {
  const firstMissing = SCHOOL_PROFILE_SECTIONS.find((s) => !model.completeness[s.id])?.id ?? null;
  return (
    <GCard
      index={2}
      tone="paper"
      kicker="Profile checklist"
      title={completeCount === SCHOOL_PROFILE_SECTIONS.length ? "Everything is filled in" : "What's left to fill in"}
      className="lg:sticky lg:top-4"
    >
      {model.loaded ? (
        <>
          <GardenSteps
            progressLabel="Sections filled in"
            steps={SCHOOL_PROFILE_SECTIONS.map((section) => {
              const done = model.completeness[section.id];
              const isPhotos = section.id === "photos";
              const unknown = isPhotos && model.photoCount == null;
              return {
                id: section.id,
                title: (
                  <button
                    type="button"
                    onClick={() => model.changeSection(section.id)}
                    className={`text-left hover:underline ${G_FOCUS}`}
                    aria-current={model.activeSection === section.id ? "true" : undefined}
                  >
                    {section.label}
                  </button>
                ),
                description: unknown ? "Open School photos to check." : subtitleForSchoolProfileSection(section.id),
                status: done ? "done" : section.id === firstMissing ? "current" : "todo",
                aside: model.changedSections.includes(section.id) ? <GChip tone="warning">Unsaved</GChip> : undefined,
              };
            })}
          />
          <p className="m-0 mt-4 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
            Changes save together with <b className="text-[var(--sf-ink)]">Save profile</b>. Photos save as soon as you add or
            remove them.
          </p>
        </>
      ) : model.status === "error" ? (
        <p className="m-0 text-[13.5px] font-semibold text-[var(--sf-soft)]">The checklist appears once the profile loads.</p>
      ) : (
        <div className="flex flex-col gap-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <GSkeleton key={i} className="h-10 !rounded-[14px]" />
          ))}
        </div>
      )}
    </GCard>
  );
}
