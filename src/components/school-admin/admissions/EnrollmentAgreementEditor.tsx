"use client";

import { useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { FileText, GripVertical, Plus, Trash2, Upload } from "lucide-react";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import type {
  DocumentConfig,
  EnrollmentContractSection,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrollmentAgreementEditorProps = {
  C: AdminThemeTokens;
  document: DocumentConfig;
  onChange: (document: DocumentConfig) => void;
};

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "12px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
  };
}

function SectionListRow({
  C,
  section,
  sectionIdx,
  active,
  onSelect,
  onDelete,
}: {
  C: AdminThemeTokens;
  section: EnrollmentContractSection;
  sectionIdx: number;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragListener={false}
      dragControls={dragControls}
      style={{ listStyle: "none" }}
      layout="position"
    >
      <div
        className="flex items-center gap-1 rounded-md"
        style={{
          backgroundColor: active ? C.accentLight : "transparent",
          border: `1px solid ${active ? C.accent : C.border}`,
        }}
      >
        <button
          type="button"
          aria-label="Drag to reorder section"
          className="touch-none cursor-grab px-1 py-2 active:cursor-grabbing shrink-0"
          style={{ color: C.textQuaternary }}
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 py-2 pr-2 text-left"
        >
          <p
            className="truncate text-[11px] font-medium"
            style={{ color: active ? C.accent : C.textPrimary }}
          >
            {section.title || `Section ${sectionIdx + 1}`}
          </p>
          <p className="text-[10px]" style={{ color: C.textTertiary }}>
            Signature required
          </p>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="mr-1 rounded p-1 shrink-0"
          style={{ color: C.error }}
          aria-label="Delete section"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </Reorder.Item>
  );
}

export default function EnrollmentAgreementEditor({
  C,
  document,
  onChange,
}: EnrollmentAgreementEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const style = inputStyle(C);
  const mode = document.kind;

  const setMode = (kind: DocumentConfig["kind"]) => {
    if (kind === "pdf") {
      onChange({ kind: "pdf", fileName: "" });
      setActiveSectionId(null);
      return;
    }
    const sections =
      document.kind === "inline_sections"
        ? document.sections
        : [
            {
              id: newAdmissionsId(),
              title: "1. Section title",
              body: "Add agreement text families will read and sign.",
            },
          ];
    onChange({ kind: "inline_sections", sections });
    setActiveSectionId(sections[0]?.id ?? null);
  };

  const updateSections = (sections: EnrollmentContractSection[]) => {
    if (document.kind !== "inline_sections") return;
    onChange({ ...document, sections });
    if (activeSectionId && !sections.some((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0]?.id ?? null);
    }
  };

  const addSection = () => {
    if (document.kind !== "inline_sections") return;
    const nextIndex = document.sections.length + 1;
    const newSection: EnrollmentContractSection = {
      id: newAdmissionsId(),
      title: `${nextIndex}. Section title`,
      body: "",
    };
    updateSections([...document.sections, newSection]);
    setActiveSectionId(newSection.id);
  };

  const handlePdfSelect = (file: File | null) => {
    if (!file) return;
    onChange({ kind: "pdf", fileName: file.name });
  };

  const activeSection =
    document.kind === "inline_sections"
      ? document.sections.find((s) => s.id === activeSectionId) ??
        document.sections[0]
      : null;

  const resolvedActiveId = activeSection?.id ?? null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold mb-2" style={{ color: C.textSecondary }}>
          Agreement format
        </p>
        <div className="flex gap-2">
          {(["inline_sections", "pdf"] as const).map((kind) => {
            const active = mode === kind;
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setMode(kind)}
                className="rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? C.accentLight : C.surface,
                  color: active ? C.accent : C.textSecondary,
                  border: `1px solid ${active ? C.accent : C.border}`,
                }}
              >
                {kind === "inline_sections" ? "Write sections" : "Upload PDF"}
              </button>
            );
          })}
        </div>
      </div>

      {document.kind === "inline_sections" ? (
        <>
          {document.showWarningBanner && (
            <div
              className="rounded-md border px-3 py-2 text-[11px] leading-relaxed"
              style={{
                borderColor: C.warningBorder,
                backgroundColor: C.warningBg,
                color: C.warning,
              }}
            >
              Families will see a warning banner before signing this agreement.
            </div>
          )}

          {document.consentOptions && document.consentOptions.length > 0 && (
            <div
              className="rounded-md border px-3 py-2 text-[11px] leading-relaxed"
              style={{ borderColor: C.border, backgroundColor: C.bg, color: C.textTertiary }}
            >
              Includes {document.consentOptions.length} consent options families choose before
              signing.
            </div>
          )}

          {document.sections.length === 0 ? (
            <div
              className="rounded-md px-3 py-6 text-center text-[11px]"
              style={{
                border: `1px dashed ${C.borderStrong}`,
                color: C.textTertiary,
              }}
            >
              No sections yet.
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="w-[200px] shrink-0 space-y-1.5">
                <Reorder.Group
                  axis="y"
                  values={document.sections}
                  onReorder={updateSections}
                  as="div"
                  className="flex flex-col gap-1.5"
                >
                  {document.sections.map((section, sectionIdx) => (
                    <SectionListRow
                      key={section.id}
                      C={C}
                      section={section}
                      sectionIdx={sectionIdx}
                      active={resolvedActiveId === section.id}
                      onSelect={() => setActiveSectionId(section.id)}
                      onDelete={() =>
                        updateSections(
                          document.sections.filter((s) => s.id !== section.id),
                        )
                      }
                    />
                  ))}
                </Reorder.Group>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex w-full items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-[10px] font-medium"
                  style={{
                    border: `1px dashed ${C.borderStrong}`,
                    color: C.accent,
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Add section
                </button>
              </div>

              {activeSection ? (
                <div
                  className="min-w-0 flex-1 rounded-md border p-4 space-y-3"
                  style={{ borderColor: C.border, backgroundColor: C.bg }}
                >
                  <p className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>
                    Section content
                  </p>
                  <input
                    type="text"
                    value={activeSection.title}
                    onChange={(e) =>
                      updateSections(
                        document.sections.map((s) =>
                          s.id === activeSection.id
                            ? { ...s, title: e.target.value }
                            : s,
                        ),
                      )
                    }
                    placeholder="Section title"
                    style={style}
                  />
                  <textarea
                    rows={16}
                    value={activeSection.body}
                    onChange={(e) =>
                      updateSections(
                        document.sections.map((s) =>
                          s.id === activeSection.id
                            ? { ...s, body: e.target.value }
                            : s,
                        ),
                      )
                    }
                    placeholder="Agreement text families will read and sign..."
                    style={{ ...style, resize: "vertical" }}
                  />
                  <p className="text-[10px]" style={{ color: C.textTertiary }}>
                    Families sign this section before moving on.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {document.sections.length === 0 ? (
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium"
              style={{
                backgroundColor: C.accentLight,
                color: C.accent,
                border: `1px solid ${C.secondaryBtnBorder}`,
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add section
            </button>
          ) : null}
        </>
      ) : (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handlePdfSelect(e.target.files?.[0] ?? null)}
          />
          <div
            className="flex flex-col items-center justify-center rounded-md px-4 py-8 text-center"
            style={{
              border: `2px dashed ${C.borderStrong}`,
              backgroundColor: C.bg,
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file?.type === "application/pdf" || file?.name.endsWith(".pdf")) {
                handlePdfSelect(file);
              }
            }}
          >
            <Upload className="mb-2 h-6 w-6" style={{ color: C.textQuaternary }} />
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              Drop a PDF here
            </p>
            <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
              Families will read and sign the uploaded document.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold"
              style={{
                backgroundColor: C.accentLight,
                color: C.accent,
                border: `1px solid ${C.accent}`,
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Choose PDF
            </button>
          </div>
          {document.fileName ? (
            <div
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-[11px]"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <FileText className="h-4 w-4 shrink-0" style={{ color: C.accent }} />
              <span className="truncate font-medium" style={{ color: C.textPrimary }}>
                {document.fileName}
              </span>
              <button
                type="button"
                onClick={() => onChange({ kind: "pdf", fileName: "" })}
                className="ml-auto text-[10px] font-medium"
                style={{ color: C.error }}
              >
                Remove
              </button>
            </div>
          ) : null}
          <p className="text-[10px]" style={{ color: C.textTertiary }}>
            PDF upload is preview-only for now — files are not saved yet.
          </p>
        </div>
      )}
    </div>
  );
}
