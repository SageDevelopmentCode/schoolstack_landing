"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { G_INPUT, G_LABEL, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenSelect, GardenSwitch } from "@/components/school-admin/garden/kit";
import { PRIORITY_LABEL, type NewSchoolInput } from "@/lib/admin-crm/research-types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { SITE_NAME } from "@/lib/site";

type Form = Omit<NewSchoolInput, "strengths" | "pain_points"> & { strengths: string; pain_points: string };

const EMPTY: Form = {
  name: "",
  state: "",
  location: "",
  website: "",
  school_model: "",
  grades: "",
  estimated_size: "",
  tuition_schedule: "",
  strengths: "",
  pain_points: "",
  software_fit_reason: "",
  priority_score: 4,
  confidence: "",
  is_closing: false,
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  notes: "",
};

const REQUIRED: (keyof Form)[] = ["name", "state", "location", "website", "school_model"];

function lines(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function AddSchoolDrawer({
  theme,
  open,
  saving,
  onClose,
  onSave,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (input: NewSchoolInput) => Promise<boolean>;
}) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [showErrors, setShowErrors] = useState(false);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const missing = REQUIRED.filter((k) => !String(form[k]).trim());

  async function submit() {
    if (missing.length > 0) {
      setShowErrors(true);
      return;
    }
    const ok = await onSave({ ...form, strengths: lines(form.strengths), pain_points: lines(form.pain_points) });
    if (ok) {
      setForm(EMPTY);
      setShowErrors(false);
      onClose();
    }
  }

  const text = (key: keyof Form, label: string, opts: { placeholder?: string; type?: string; area?: boolean } = {}) => {
    const required = REQUIRED.includes(key);
    const error = showErrors && required && !String(form[key]).trim();
    const id = `add-school-${key}`;
    return (
      <div>
        <label htmlFor={id} className={G_LABEL}>
          {label}
          {required ? <span className="ml-0.5 text-[var(--sf-clay-deep)]" aria-hidden>*</span> : null}
        </label>
        {opts.area ? (
          <textarea
            id={id}
            rows={3}
            value={String(form[key])}
            onChange={(e) => set(key, e.target.value as Form[typeof key])}
            placeholder={opts.placeholder}
            className={`${G_INPUT} resize-y`}
            data-garden-skip
          />
        ) : (
          <input
            id={id}
            type={opts.type ?? "text"}
            value={String(form[key])}
            onChange={(e) => set(key, e.target.value as Form[typeof key])}
            placeholder={opts.placeholder}
            aria-invalid={error || undefined}
            className={`${G_INPUT} ${error ? "!border-[#b4412f]/60" : ""}`}
            data-garden-skip
          />
        )}
        {error ? <p className="m-0 mt-1 text-[12px] font-bold text-[#9a3422]">Required.</p> : null}
      </div>
    );
  };

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={() => !saving && onClose()}
      title="Add a school"
      kicker="CRM"
      subtitle="It starts in All schools as Not started."
      testId="research-add-school"
      panelId="research-add-school-panel"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <p className="m-0 text-[13px] font-bold text-[var(--sf-soft)]">
            {showErrors && missing.length > 0 ? `${missing.length} required field${missing.length === 1 ? "" : "s"} missing.` : ""}
          </p>
          <div className="flex gap-2">
            <button type="button" className={gBtnOutlineSm} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="button" className={gBtnPopSm} onClick={() => void submit()} disabled={saving} aria-busy={saving || undefined}>
              <BusyLabel busy={saving} busyLabel="Adding…" icon={<Plus className="h-4 w-4" aria-hidden />}>
                Add school
              </BusyLabel>
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4">
        {text("name", "School name", { placeholder: "Ascend Micro School" })}
        <div className="grid grid-cols-[90px_1fr] gap-3">
          {text("state", "State", { placeholder: "CO" })}
          {text("location", "Location", { placeholder: "Colorado Springs, CO" })}
        </div>
        {text("website", "Website", { placeholder: "https://example.org", type: "url" })}
        {text("school_model", "School model", { placeholder: "Private microschool / hybrid" })}
        <div className="grid grid-cols-2 gap-3">
          {text("grades", "Grades", { placeholder: "K-8" })}
          {text("estimated_size", "Size", { placeholder: "~30 students" })}
        </div>
        {text("tuition_schedule", "Tuition / schedule", { placeholder: "$3,500/year; 2 days/week" })}
        {text("strengths", "Strengths", { placeholder: "One per line", area: true })}
        {text("pain_points", "Gaps to check", { placeholder: "One per line", area: true })}
        {text("software_fit_reason", `Why ${SITE_NAME} fits`, { area: true })}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="add-school-priority" className={G_LABEL}>
              Priority
            </label>
            <GardenSelect
              id="add-school-priority"
              value={String(form.priority_score)}
              onChange={(v) => set("priority_score", Number(v))}
              options={[5, 4, 3, 2, 1].map((p) => ({ value: String(p), label: `P${p} · ${PRIORITY_LABEL[p]}` }))}
            />
          </div>
          {text("confidence", "Confidence", { placeholder: "High" })}
        </div>
        <GardenSwitch
          checked={form.is_closing}
          onChange={(v: boolean) => set("is_closing", v)}
          label="This school is closing"
        />
        <div className="grid gap-3 border-t border-dashed border-[var(--sf-ink)]/12 pt-4">
          {text("contact_name", "Contact name", { placeholder: "Sarah Johnson" })}
          {text("contact_email", "Email", { type: "email" })}
          {text("contact_phone", "Phone", { type: "tel" })}
          {text("notes", "Notes", { area: true })}
        </div>
      </div>
    </GSidePanel>
  );
}
