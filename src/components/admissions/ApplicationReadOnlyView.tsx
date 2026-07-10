"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import ApplicationUploadedFileList from "@/components/admissions/ApplicationUploadedFileList";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import { parseApplicationFileFieldValue } from "@/lib/admissions/application-file-storage";
import { type ApplicationDetail } from "@/lib/admissions/parent-portal-access";
import type {
  ApplicationField,
  ApplicationFormSchema,
  ApplicationSection,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationReadOnlyViewProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  application: ApplicationDetail;
  embedded?: boolean;
  view?: "full" | "section" | "acknowledgments";
  sectionId?: string;
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

  return value;
}

function ReadOnlyField({
  field,
  value,
  C,
}: {
  field: ApplicationField;
  value: string | undefined;
  C: ReturnType<typeof buildAdminThemeTokens>;
}) {
  const fileValue =
    field.type === "file" ? parseApplicationFileFieldValue(value ?? "") : [];

  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide" style={{ color: C.textQuaternary }}>
        {field.label}
      </dt>
      <dd
        className={`text-sm leading-relaxed ${field.type === "file" ? "" : "whitespace-pre-wrap"}`}
        style={{ color: C.textPrimary }}
      >
        {field.type === "file" ? (
          fileValue.length > 0 ? (
            <ApplicationUploadedFileList files={fileValue} C={C} />
          ) : (
            "—"
          )
        ) : (
          formatFieldValue(field, value)
        )}
      </dd>
    </div>
  );
}

function ReadOnlySection({
  section,
  responses,
  C,
}: {
  section: ApplicationSection;
  responses: Record<string, string>;
  C: ReturnType<typeof buildAdminThemeTokens>;
}) {
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
            className={field.width === "half" ? "sm:col-span-1" : "sm:col-span-2"}
          >
            <ReadOnlyField field={field} value={responses[field.id]} C={C} />
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
}: {
  schema: ApplicationFormSchema;
  acknowledgments: Record<string, boolean>;
  C: ReturnType<typeof buildAdminThemeTokens>;
  pageBg: string;
}) {
  if (schema.acknowledgments.length === 0) return null;

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
  view = "full",
  sectionId,
}: {
  schema: ApplicationFormSchema;
  responses: Record<string, string>;
  acknowledgments: Record<string, boolean>;
  C: ReturnType<typeof buildAdminThemeTokens>;
  pageBg: string;
  view?: "full" | "section" | "acknowledgments";
  sectionId?: string;
}) {
  if (view === "section") {
    const section = schema.sections.find((entry) => entry.id === sectionId);
    if (!section) return null;

    return (
      <ReadOnlySection section={section} responses={responses} C={C} />
    );
  }

  if (view === "acknowledgments") {
    return (
      <ReadOnlyAcknowledgments
        schema={schema}
        acknowledgments={acknowledgments}
        C={C}
        pageBg={pageBg}
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
        />
      ))}
      <ReadOnlyAcknowledgments
        schema={schema}
        acknowledgments={acknowledgments}
        C={C}
        pageBg={pageBg}
      />
    </div>
  );
}

function ApplicationReadOnlyBody({
  branding,
  schoolName,
  schoolSlug,
  application,
  embedded = false,
  view = "full",
  sectionId,
}: ApplicationReadOnlyViewProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const pageBg = branding.colors.bg;
  const statusStyle = applicationStatusBadgeStyle(application.status, C);
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
          <Link
            href={`/school/${schoolSlug}/apply`}
            className="mb-6 inline-flex items-center gap-2 text-sm underline-offset-2 hover:underline"
            style={{ color: C.textSecondary }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to applications
          </Link>

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
        </>
      ) : null}

      {!embedded ? (
        <div className="flex flex-wrap items-center gap-2">
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
          view={view}
          sectionId={sectionId}
        />
      </div>
    </>
  );

  if (embedded) {
    return content;
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
