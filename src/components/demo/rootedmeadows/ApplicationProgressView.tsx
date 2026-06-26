"use client";

import { CheckCircle, Circle } from "lucide-react";
import {
  ROOTED_MEADOWS_APPLICATION_COPY,
  ROOTED_MEADOWS_APPLICATION_SECTIONS,
  type ApplicationField,
} from "@/data/school-demos/rooted-meadows-application";
import { ROOTED_MEADOWS_ADMIN_COLORS } from "@/data/school-demos/rootedmeadows-admin-demo";

const C = {
  ...ROOTED_MEADOWS_ADMIN_COLORS,
  surface: "#FFFFFF",
  textTertiary: ROOTED_MEADOWS_ADMIN_COLORS.textSecondary,
};

function formatApplicationFieldAnswer(
  field: ApplicationField,
  raw: string | undefined,
): string {
  if (raw === undefined || raw === null || raw.trim() === "") {
    if (field.type === "file") return "—";
    return "—";
  }
  if (field.type === "file") {
    return raw.includes(".") ? raw : "Uploaded";
  }
  if (field.type === "select" || field.type === "radio") {
    const match = field.options?.find((o) => o.value === raw);
    return match?.label ?? raw;
  }
  if (field.type === "checkbox") {
    return raw === "true" ? "Yes" : raw === "false" ? "No" : raw;
  }
  return raw;
}

function sectionStatus(
  sectionIndex: number,
  applicationSectionIndex: number,
  isApplicationComplete: boolean,
): "complete" | "current" | "upcoming" {
  if (isApplicationComplete || sectionIndex < applicationSectionIndex) return "complete";
  if (sectionIndex === applicationSectionIndex) return "current";
  return "upcoming";
}

function fieldsWithAnswers(
  fields: ApplicationField[],
  responses: Record<string, string>,
  status: "complete" | "current" | "upcoming",
) {
  if (status === "upcoming") return [];
  if (status === "complete") {
    return fields.filter((field) => {
      const raw = responses[field.id];
      return raw !== undefined && raw.trim() !== "";
    });
  }
  return fields.filter((field) => {
    const raw = responses[field.id];
    return raw !== undefined && raw.trim() !== "";
  });
}

export default function ApplicationProgressView({
  responses,
  applicationSectionIndex,
  status,
}: {
  responses: Record<string, string>;
  applicationSectionIndex: number;
  status: "applying" | "booking";
}) {
  const isApplicationComplete = status === "booking";
  const sectionCount = ROOTED_MEADOWS_APPLICATION_SECTIONS.length;
  const displayStep = isApplicationComplete
    ? sectionCount
    : Math.min(applicationSectionIndex + 1, sectionCount);

  return (
    <div className="flex flex-col gap-5 pb-3">
      <div>
        <p
          className="text-xs font-semibold"
          style={{ color: C.textPrimary }}
        >
          Application progress · Step {displayStep} of {sectionCount}
        </p>
        <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
          {ROOTED_MEADOWS_APPLICATION_COPY.externalLinkNote}
        </p>
        <div className="mt-3 flex items-center gap-2">
          {ROOTED_MEADOWS_APPLICATION_SECTIONS.map((_, index) => (
            <div
              key={index}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor:
                  index < applicationSectionIndex || isApplicationComplete
                    ? C.accent
                    : index === applicationSectionIndex && !isApplicationComplete
                      ? C.accentBright
                      : C.border,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {ROOTED_MEADOWS_APPLICATION_SECTIONS.map((section, sectionIndex) => {
          const secStatus = sectionStatus(
            sectionIndex,
            applicationSectionIndex,
            isApplicationComplete,
          );
          const visibleFields = fieldsWithAnswers(
            section.fields,
            responses,
            secStatus,
          );
          const isComplete = secStatus === "complete";
          const isCurrent = secStatus === "current";
          const isUpcoming = secStatus === "upcoming";

          return (
            <div
              key={section.id}
              className="rounded-sm px-3 py-3 sm:px-4 sm:py-3.5"
              style={{
                backgroundColor: isCurrent ? C.accentLight : C.bg,
                border: `1px solid ${
                  isCurrent ? C.accent : isComplete ? C.borderStrong : C.border
                }`,
                opacity: isUpcoming ? 0.55 : 1,
                boxShadow: isCurrent
                  ? "0 1px 3px rgba(130,112,150,0.12)"
                  : "0 1px 2px rgba(17,28,22,0.04)",
              }}
            >
              <div className="mb-2 flex items-start gap-2">
                {isComplete ? (
                  <CheckCircle
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                    style={{ color: C.accent }}
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                    style={{
                      color: isCurrent ? C.accent : C.textTertiary,
                    }}
                    aria-hidden
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="text-xs font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      {section.title}
                    </p>
                    {isCurrent && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: C.accentLight,
                          color: C.accent,
                          border: `1px solid ${C.secondaryBtnBorder}`,
                        }}
                      >
                        In progress
                      </span>
                    )}
                    {isUpcoming && (
                      <span
                        className="text-[9px] font-medium uppercase tracking-wide"
                        style={{ color: C.textTertiary }}
                      >
                        Not started
                      </span>
                    )}
                  </div>
                  {section.description && isComplete && (
                    <p
                      className="mt-1 text-[11px] leading-relaxed"
                      style={{ color: C.textTertiary }}
                    >
                      {section.description}
                    </p>
                  )}
                </div>
              </div>

              {visibleFields.length > 0 && (
                <div className="ml-6 flex flex-col gap-2.5">
                  {visibleFields.map((field) => {
                    const answer = formatApplicationFieldAnswer(
                      field,
                      responses[field.id],
                    );
                    const multiline =
                      field.type === "textarea" && answer.length > 80;
                    return (
                      <div
                        key={field.id}
                        className="rounded-sm px-3 py-2"
                        style={{
                          backgroundColor: C.surface,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <p
                          className="mb-1 text-[10px] font-semibold uppercase tracking-widest"
                          style={{ color: C.textTertiary }}
                        >
                          {field.label}
                          {field.required ? (
                            <span style={{ color: C.textSecondary }}> *</span>
                          ) : null}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            multiline ? "whitespace-pre-wrap leading-relaxed" : ""
                          }`}
                          style={{ color: C.textPrimary }}
                        >
                          {answer}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
