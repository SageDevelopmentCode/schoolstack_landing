"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ApplicationUploadedFileList from "@/components/admissions/ApplicationUploadedFileList";
import ReadOnlyAnswerBacking from "@/components/admissions/ReadOnlyAnswerBacking";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import { parseApplicationFileFieldValue } from "@/lib/admissions/application-file-storage";
import {
  formatApplicationAddress,
  isApplicationAddressEmpty,
  parseApplicationAddressFieldValue,
} from "@/lib/admissions/application-address";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import {
  type ApplicationDetail,
  type FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type {
  ApplicationField,
  ApplicationFormSchema,
  ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import { formatPhoneNumberInput } from "@/lib/phone-format";
import { formatSelectedDate } from "@/lib/demo-scheduler";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";

type ReadOnlyLayout = "page" | "detail";

type ApplicationReadOnlyViewProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId?: string;
  application: ApplicationDetail;
  embedded?: boolean;
  layout?: ReadOnlyLayout;
  view?: "full" | "section" | "acknowledgments";
  sectionId?: string;
  backHref?: string;
  hideBackLink?: boolean;
  standalone?: boolean;
  userProfile?: FamilyUserProfile;
  previewMode?: boolean;
  previewHomeHref?: string;
  portalOptions?: SchoolPortalOption[];
};

function formatFieldValue(field: ApplicationField, value: string | undefined): string {
  if (!value) return "—";

  if (field.type === "checkbox") {
    return value === "true" || value === "on" || value === "1" ? "Yes" : "No";
  }

  if (field.type === "select" || field.type === "radio") {
    const option = field.options?.find((entry) => entry.value === value);
    return option?.label ?? value;
  }

  if (field.type === "tel") {
    return formatPhoneNumberInput(value);
  }

  if (field.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatSelectedDate(value);
  }

  if (field.type === "address") {
    const address = parseApplicationAddressFieldValue(value);
    if (isApplicationAddressEmpty(address)) return "—";
    return formatApplicationAddress(address);
  }

  return value;
}

function isEmptyFieldValue(field: ApplicationField, value: string | undefined): boolean {
  if (!value) return true;
  if (field.type === "file") {
    return parseApplicationFileFieldValue(value).length === 0;
  }
  if (field.type === "address") {
    return isApplicationAddressEmpty(parseApplicationAddressFieldValue(value));
  }
  return false;
}

function ReadOnlyField({
  field,
  value,
  C,
  layout,
}: {
  field: ApplicationField;
  value: string | undefined;
  C: ReturnType<typeof buildAdminThemeTokens>;
  layout: ReadOnlyLayout;
}) {
  const fileValue =
    field.type === "file" ? parseApplicationFileFieldValue(value ?? "") : [];
  const formattedValue = formatFieldValue(field, value);
  const isEmpty = isEmptyFieldValue(field, value);

  const labelClassName =
    layout === "detail" ? "text-[13px] leading-snug" : "text-sm font-medium leading-snug";

  const answerContent =
    field.type === "file" ? (
      fileValue.length > 0 ? (
        <ApplicationUploadedFileList files={fileValue} C={C} />
      ) : (
        "—"
      )
    ) : (
      formattedValue
    );

  return (
    <div className="flex flex-col gap-1">
      <dt
        className={labelClassName}
        style={{ color: layout === "detail" ? C.textTertiary : C.textSecondary }}
      >
        {field.label}
      </dt>
      <dd
        className={`${layout === "detail" ? "text-sm font-medium leading-relaxed" : "text-sm leading-relaxed"} ${field.type === "file" ? "" : "whitespace-pre-wrap"}`}
        style={layout === "detail" ? undefined : { color: isEmpty ? C.textTertiary : C.textPrimary }}
      >
        {layout === "detail" ? (
          <ReadOnlyAnswerBacking C={C}>
            <div style={{ color: isEmpty ? C.textTertiary : C.textPrimary }}>{answerContent}</div>
          </ReadOnlyAnswerBacking>
        ) : (
          answerContent
        )}
      </dd>
    </div>
  );
}

function ReadOnlySection({
  section,
  responses,
  C,
  layout,
}: {
  section: ApplicationSection;
  responses: Record<string, string>;
  C: ReturnType<typeof buildAdminThemeTokens>;
  layout: ReadOnlyLayout;
}) {
  if (layout === "detail") {
    const visibleFields = section.fields.filter(
      (field) => field.required || !isEmptyFieldValue(field, responses[field.id]),
    );

    return (
      <section>
        {section.description ? (
          <p className="mb-5 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            {section.description}
          </p>
        ) : null}
        <dl className="space-y-5">
          {visibleFields.map((field) => (
            <div key={field.id}>
              <ReadOnlyField
                field={field}
                value={responses[field.id]}
                C={C}
                layout={layout}
              />
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold" style={{ color: C.accentDark }}>
        {section.title}
      </h2>
      {section.description ? (
        <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          {section.description}
        </p>
      ) : null}
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {section.fields.map((field) => (
          <div
            key={field.id}
            className={
              field.type === "address" || field.width !== "half"
                ? "sm:col-span-2"
                : "sm:col-span-1"
            }
          >
            <ReadOnlyField field={field} value={responses[field.id]} C={C} layout={layout} />
          </div>
        ))}
      </dl>
    </section>
  );
}

function ReadOnlyAcknowledgments({
  schema,
  acknowledgments,
  C,
  pageBg,
  layout,
}: {
  schema: ApplicationFormSchema;
  acknowledgments: Record<string, boolean>;
  C: ReturnType<typeof buildAdminThemeTokens>;
  pageBg: string;
  layout: ReadOnlyLayout;
}) {
  if (schema.acknowledgments.length === 0) return null;

  if (layout === "detail") {
    return (
      <section>
        <ul className="space-y-4">
          {schema.acknowledgments.map((item) => (
            <li key={item.id}>
              <ReadOnlyAnswerBacking C={C} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{
                    color: acknowledgments[item.id] ? C.success : C.textQuaternary,
                  }}
                />
                <span className="text-sm leading-relaxed" style={{ color: C.textPrimary }}>
                  {item.label}
                </span>
              </ReadOnlyAnswerBacking>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold" style={{ color: C.accentDark }}>
        Acknowledgments
      </h2>
      <ul className="mt-4 space-y-3">
        {schema.acknowledgments.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-md border px-4 py-3 text-sm"
            style={{ borderColor: C.border, backgroundColor: pageBg }}
          >
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{
                color: acknowledgments[item.id] ? C.accent : C.textQuaternary,
              }}
            />
            <span style={{ color: C.textPrimary }}>{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReadOnlyContent({
  schema,
  responses,
  acknowledgments,
  C,
  pageBg,
  layout,
  view = "full",
  sectionId,
}: {
  schema: ApplicationFormSchema;
  responses: Record<string, string>;
  acknowledgments: Record<string, boolean>;
  C: ReturnType<typeof buildAdminThemeTokens>;
  pageBg: string;
  layout: ReadOnlyLayout;
  view?: "full" | "section" | "acknowledgments";
  sectionId?: string;
}) {
  if (view === "section") {
    const section = schema.sections.find((entry) => entry.id === sectionId);
    if (!section) return null;

    return (
      <ReadOnlySection section={section} responses={responses} C={C} layout={layout} />
    );
  }

  if (view === "acknowledgments") {
    return (
      <ReadOnlyAcknowledgments
        schema={schema}
        acknowledgments={acknowledgments}
        C={C}
        pageBg={pageBg}
        layout={layout}
      />
    );
  }

  return (
    <div className="space-y-8">
      {schema.sections.map((section) => (
        <ReadOnlySection
          key={section.id}
          section={section}
          responses={responses}
          C={C}
          layout={layout}
        />
      ))}
      <ReadOnlyAcknowledgments
        schema={schema}
        acknowledgments={acknowledgments}
        C={C}
        pageBg={pageBg}
        layout={layout}
      />
    </div>
  );
}

function ApplicationReadOnlyBody({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  application,
  embedded = false,
  layout = "page",
  view = "full",
  sectionId,
  backHref,
  hideBackLink = false,
  standalone = true,
  userProfile,
  previewMode = false,
  previewHomeHref,
  portalOptions = [],
}: ApplicationReadOnlyViewProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const pageBg = branding.colors.bg;
  const statusStyle = applicationStatusBadgeStyle(application.status, C);
  const applicationsBackHref = backHref ?? `/school/${schoolSlug}/apply`;
  const submittedLabel = application.submittedAt
    ? new Date(application.submittedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const content = (
    <>
      {!embedded ? (
        <>
          {!hideBackLink ? (
            <Link
              href={applicationsBackHref}
              className="mb-6 inline-flex items-center gap-2 text-sm underline-offset-2 hover:underline"
              style={{ color: C.textSecondary }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to applications</span>
              <span className="sr-only sm:hidden">Back to applications</span>
            </Link>
          ) : null}

          {!userProfile ? (
            <SchoolDemoWordmark
              logo={{
                src: branding.logo.src,
                alt: branding.logo.alt || schoolName,
                width: branding.logo.width,
                height: branding.logo.height,
                text: branding.logo.src ? undefined : schoolName,
              }}
              className="mb-8 h-8 w-auto max-w-[200px] object-contain"
            />
          ) : null}
        </>
      ) : null}

      {!embedded ? (
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: C.accentDark }}>
            {application.formTitle}
          </h1>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={statusStyle}
          >
            {applicationStatusLabel(application.status)}
          </span>
        </div>
      ) : null}

      {!embedded && submittedLabel ? (
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          Submitted {submittedLabel}
        </p>
      ) : null}

      <div
        className={embedded ? "" : "mt-8 rounded-lg border px-5 py-6 sm:px-6"}
        style={
          embedded
            ? undefined
            : { borderColor: C.border, backgroundColor: "#FFFFFF" }
        }
      >
        <ReadOnlyContent
          schema={application.schema}
          responses={application.responses}
          acknowledgments={application.acknowledgments}
          C={C}
          pageBg={pageBg}
          layout={layout}
          view={view}
          sectionId={sectionId}
        />
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  if (!standalone) {
    return (
      <div style={{ backgroundColor: pageBg, color: C.textPrimary }}>
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">{content}</div>
      </div>
    );
  }

  if (userProfile) {
    return (
      <ApplyPortalPageShell
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        organizationId={organizationId}
        userEmail={userProfile.email}
        userDisplayName={userProfile.displayName}
        profilePhotoUrl={userProfile.profilePhotoUrl}
        portalOptions={portalOptions}
        previewMode={previewMode}
        previewHomeHref={previewHomeHref}
      >
        {content}
      </ApplyPortalPageShell>
    );
  }

  return (
    <div
      className="min-h-dvh px-4 py-8 sm:px-6 sm:py-10"
      style={{ backgroundColor: pageBg, color: C.textPrimary }}
    >
      <div className="mx-auto max-w-3xl">{content}</div>
    </div>
  );
}

export default function ApplicationReadOnlyView(props: ApplicationReadOnlyViewProps) {
  return <ApplicationReadOnlyBody {...props} />;
}
