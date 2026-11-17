"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type {
  PublicTourFieldDefinition,
  PublicTourFieldType,
} from "@/lib/admissions/public-tour-settings";
import { GChip, G_FOCUS, G_INPUT, NOTE_TINTS } from "@/components/school-parent/garden/ui";
import { PUBLIC_TOUR_FIELD_TYPE_LABELS } from "@/components/school-admin/admissions/public-tour-wizard-copy";

/*
 * Booking-form questions for the public tour page, as compact Garden rows.
 * Renders inside the admin Garden frame (`--sf-*` tokens); only used by
 * PublicTourSchoolSettingsPanel.
 */

const CUSTOM_FIELD_TYPES: PublicTourFieldType[] = [
  "text",
  "textarea",
  "email",
  "phone",
  "select",
  "checkbox",
];

const ROW_ICON_BTN = `inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/65 transition-colors hover:border-[var(--sf-ink)]/45 hover:text-[var(--sf-ink)] disabled:cursor-not-allowed disabled:opacity-35 ${G_FOCUS}`;

const ROW_INPUT = `${G_INPUT} !py-2`;

type PublicTourFieldsEditorProps = {
  fields: PublicTourFieldDefinition[];
  disabled?: boolean;
  onChange: (fields: PublicTourFieldDefinition[]) => void;
};

function canRemoveField(field: PublicTourFieldDefinition): boolean {
  return (
    field.type !== "children_repeat" &&
    field.id !== "email" &&
    field.id !== "contact_name"
  );
}

function parseChoices(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function RequiredSwitch({
  checked,
  disabled,
  questionIndex,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  questionIndex: number;
  onChange: (required: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Required for question ${questionIndex + 1}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex min-h-[36px] shrink-0 items-center gap-2 rounded-full px-1.5 disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`}
    >
      <span
        aria-hidden
        className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 border-[var(--sf-ink)] transition-colors ${
          checked ? "bg-[var(--sf-clay)]" : "bg-[var(--sf-ink)]/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full border-[1.5px] border-[var(--sf-ink)] bg-white transition-transform duration-200 ${
            checked ? "translate-x-[17px]" : "translate-x-[2px]"
          }`}
        />
      </span>
      <span
        aria-hidden
        className={`w-[58px] text-left text-[12.5px] font-extrabold ${
          checked ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-soft)]"
        }`}
      >
        {checked ? "Required" : "Optional"}
      </span>
    </button>
  );
}

/** Choices keep the raw text while typing so commas and spaces aren't eaten. */
function ChoicesInput({
  id,
  options,
  disabled,
  onChange,
}: {
  id: string;
  options: string[];
  disabled: boolean;
  onChange: (options: string[]) => void;
}) {
  const [draft, setDraft] = useState(() => options.join(", "));
  const [lastOptions, setLastOptions] = useState(options);
  if (lastOptions !== options) {
    setLastOptions(options);
    if (parseChoices(draft).join("\u0000") !== options.join("\u0000")) {
      setDraft(options.join(", "));
    }
  }
  return (
    <div className="mt-2 pl-10 lg:pl-10">
      <label htmlFor={id} className="mb-1 block text-[12.5px] font-extrabold text-[var(--sf-ink)]/80">
        Choices, separated by commas
      </label>
      <input
        id={id}
        type="text"
        disabled={disabled}
        placeholder="Option A, Option B, Option C"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          onChange(parseChoices(event.target.value));
        }}
        className={ROW_INPUT}
      />
    </div>
  );
}

export default function PublicTourFieldsEditor({
  fields,
  disabled = false,
  onChange,
}: PublicTourFieldsEditorProps) {
  const baseId = useId().replace(/:/g, "");
  const focusFieldIdRef = useRef<string | null>(null);

  function updateField(index: number, patch: Partial<PublicTourFieldDefinition>) {
    onChange(fields.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(next);
  }

  function addField() {
    const id = `custom_${Date.now()}`;
    focusFieldIdRef.current = id;
    onChange([...fields, { id, label: "New question", required: false, type: "text" }]);
  }

  return (
    <div className="space-y-3">
      <ol className="m-0 flex list-none flex-col gap-2 p-0" data-testid="public-tour-questions">
        {fields.map((field, index) => {
          const labelId = `${baseId}-label-${field.id}`;
          const typeId = `${baseId}-type-${field.id}`;
          const fixed = field.type === "children_repeat";
          const tint = NOTE_TINTS[index % NOTE_TINTS.length];
          return (
            <li
              key={field.id}
              className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-2.5 sm:px-3.5"
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    aria-hidden
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/70 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-ink)] ${tint}`}
                  >
                    {index + 1}
                  </span>
                  {fixed ? (
                    <div className="min-w-0 flex-1 py-1">
                      <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">
                        <span className="sr-only">Question {index + 1}: </span>
                        {field.label}
                      </p>
                      <p className="m-0 mt-0.5 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                        {field.helpText ?? "Families can add multiple children."}
                      </p>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <label htmlFor={labelId} className="sr-only">
                        Question {index + 1} label
                      </label>
                      <input
                        id={labelId}
                        ref={(node) => {
                          if (node && focusFieldIdRef.current === field.id) {
                            focusFieldIdRef.current = null;
                            node.focus();
                            node.select();
                          }
                        }}
                        type="text"
                        disabled={disabled}
                        value={field.label}
                        onChange={(event) => updateField(index, { label: event.target.value })}
                        className={ROW_INPUT}
                        placeholder="What families will read on the form"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pl-10 lg:shrink-0 lg:pl-0">
                  {fixed ? (
                    <GChip tone="success" className="!py-1">
                      {PUBLIC_TOUR_FIELD_TYPE_LABELS.children_repeat}
                    </GChip>
                  ) : (
                    <div className="relative w-[150px]">
                      <label htmlFor={typeId} className="sr-only">
                        Answer type for question {index + 1}
                      </label>
                      <select
                        id={typeId}
                        disabled={disabled}
                        value={field.type}
                        data-garden-skip
                        onChange={(event) =>
                          updateField(index, { type: event.target.value as PublicTourFieldType })
                        }
                        className={`${ROW_INPUT} cursor-pointer appearance-none pr-9`}
                      >
                        {CUSTOM_FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {PUBLIC_TOUR_FIELD_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/55"
                      />
                    </div>
                  )}

                  <RequiredSwitch
                    checked={field.required}
                    disabled={disabled}
                    questionIndex={index}
                    onChange={(required) => updateField(index, { required })}
                  />

                  <div className="ml-auto flex items-center gap-1 lg:ml-0">
                    <button
                      type="button"
                      disabled={disabled || index === 0}
                      onClick={() => moveField(index, -1)}
                      className={ROW_ICON_BTN}
                      aria-label={`Move question ${index + 1} up`}
                    >
                      <ChevronUp className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      disabled={disabled || index === fields.length - 1}
                      onClick={() => moveField(index, 1)}
                      className={ROW_ICON_BTN}
                      aria-label={`Move question ${index + 1} down`}
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </button>
                    {canRemoveField(field) ? (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => removeField(index)}
                        className={`${ROW_ICON_BTN} hover:!border-[#b4412f]/60 hover:!text-[#9a3422]`}
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    ) : (
                      <span aria-hidden className="inline-block h-8 w-8" />
                    )}
                  </div>
                </div>
              </div>

              {field.type === "select" ? (
                <ChoicesInput
                  id={`${baseId}-choices-${field.id}`}
                  options={field.options ?? []}
                  disabled={disabled}
                  onChange={(options) => updateField(index, { options })}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        disabled={disabled}
        onClick={addField}
        className={`flex w-full items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/25 bg-[var(--sf-paper)] px-4 py-3 text-[14px] font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:border-[var(--sf-clay)] hover:bg-[var(--sf-accent-wash)] disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`}
      >
        <Plus className="h-4 w-4" aria-hidden strokeWidth={2.6} />
        Add question
      </button>
    </div>
  );
}
