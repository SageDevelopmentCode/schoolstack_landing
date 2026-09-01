"use client";

import { useState } from "react";
import ApplicationStepNotice from "@/components/admissions/ApplicationStepNotice";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import type {
  HealthAllergyItem,
  HealthAllergySeverity,
  HealthItemType,
  HealthMedicationItem,
  HealthUpdateItem,
  Weekday,
} from "@/components/school-parent/health/parent-health-types";
import {
  SCHOOL_WEEKDAYS,
  SEVERITY_LABELS,
  WEEKDAY_LABELS,
  WEEKDAYS,
} from "@/components/school-parent/health/parent-health-types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type HealthFormValues =
  | Omit<HealthAllergyItem, "id" | "type" | "addedBy">
  | Omit<HealthMedicationItem, "id" | "type" | "addedBy">
  | Omit<HealthUpdateItem, "id" | "type" | "addedBy">;

const HEALTH_TYPE_OPTIONS: Array<{ key: HealthItemType; label: string }> = [
  { key: "allergy", label: "Allergy" },
  { key: "medication", label: "Medication" },
  { key: "update", label: "Update" },
];

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyAllergyValues(): Omit<HealthAllergyItem, "id" | "type" | "addedBy"> {
  return {
    allergen: "",
    severity: "medium",
    treatmentNotes: "",
    updatedAt: todayIsoDate(),
  };
}

function emptyMedicationValues(): Omit<HealthMedicationItem, "id" | "type" | "addedBy"> {
  return {
    name: "",
    dose: "",
    timeOfDay: "",
    daysOfWeek: [...SCHOOL_WEEKDAYS],
    instructions: "",
    startDate: todayIsoDate(),
    endDate: null,
    ongoing: false,
    updatedAt: todayIsoDate(),
  };
}

function emptyUpdateValues(): Omit<HealthUpdateItem, "id" | "type" | "addedBy"> {
  return {
    title: "",
    details: "",
    startDate: todayIsoDate(),
    endDate: todayIsoDate(),
    createdAt: todayIsoDate(),
  };
}

type FormInputs = {
  mode: "create" | "edit";
  initialType: HealthItemType;
  initialValues?: HealthFormValues | null;
};

function buildFormStateFromInputs({
  initialType,
  initialValues,
}: FormInputs) {
  if (initialValues) {
    if ("allergen" in initialValues) {
      return {
        itemType: initialType,
        allergyValues: initialValues,
        medicationValues: emptyMedicationValues(),
        updateValues: emptyUpdateValues(),
        confirmDelete: false,
      };
    }
    if ("name" in initialValues && "timeOfDay" in initialValues) {
      return {
        itemType: initialType,
        allergyValues: emptyAllergyValues(),
        medicationValues: initialValues,
        updateValues: emptyUpdateValues(),
        confirmDelete: false,
      };
    }
    return {
      itemType: initialType,
      allergyValues: emptyAllergyValues(),
      medicationValues: emptyMedicationValues(),
      updateValues: initialValues,
      confirmDelete: false,
    };
  }
  return {
    itemType: initialType,
    allergyValues: emptyAllergyValues(),
    medicationValues: emptyMedicationValues(),
    updateValues: emptyUpdateValues(),
    confirmDelete: false,
  };
}

function inputClassName(theme: ParentThemeTokens): string {
  return "w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2";
}

function inputStyle(theme: ParentThemeTokens): React.CSSProperties {
  return {
    borderColor: theme.line,
    backgroundColor: theme.white,
    color: theme.ink,
  };
}

function labelStyle(theme: ParentThemeTokens): React.CSSProperties {
  return { color: theme.ink };
}

function FieldLabel({
  theme,
  htmlFor,
  children,
  required,
}: {
  theme: ParentThemeTokens;
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold" style={labelStyle(theme)}>
      {children}
      {required ? <span style={{ color: theme.alert }}> *</span> : null}
    </label>
  );
}

export function healthFormSidebarTitle(mode: "create" | "edit", itemType: HealthItemType): string {
  if (mode === "edit") {
    switch (itemType) {
      case "allergy":
        return "Edit allergy";
      case "medication":
        return "Edit medication";
      default:
        return "Edit update";
    }
  }
  switch (itemType) {
    case "allergy":
      return "Add allergy";
    case "medication":
      return "Add medication";
    default:
      return "Share an update";
  }
}

type UseParentHealthFormOptions = {
  mode: "create" | "edit";
  initialType?: HealthItemType;
  initialValues?: HealthFormValues | null;
  readOnly?: boolean;
  saving?: boolean;
  onSave: (type: HealthItemType, values: HealthFormValues) => void;
};

export function useParentHealthForm({
  mode,
  initialType = "allergy",
  initialValues,
  readOnly = false,
  saving = false,
  onSave,
}: UseParentHealthFormOptions) {
  const initialFormState = buildFormStateFromInputs({
    mode,
    initialType,
    initialValues,
  });
  const [itemType, setItemType] = useState<HealthItemType>(initialFormState.itemType);
  const [allergyValues, setAllergyValues] = useState(initialFormState.allergyValues);
  const [medicationValues, setMedicationValues] = useState(initialFormState.medicationValues);
  const [updateValues, setUpdateValues] = useState(initialFormState.updateValues);
  const [confirmDelete, setConfirmDelete] = useState(initialFormState.confirmDelete);
  const [prevInputs, setPrevInputs] = useState<FormInputs>({
    mode,
    initialType,
    initialValues,
  });

  if (
    mode !== prevInputs.mode ||
    initialType !== prevInputs.initialType ||
    initialValues !== prevInputs.initialValues
  ) {
    const nextFormState = buildFormStateFromInputs({
      mode,
      initialType,
      initialValues,
    });
    setPrevInputs({ mode, initialType, initialValues });
    setItemType(nextFormState.itemType);
    setAllergyValues(nextFormState.allergyValues);
    setMedicationValues(nextFormState.medicationValues);
    setUpdateValues(nextFormState.updateValues);
    setConfirmDelete(nextFormState.confirmDelete);
  }

  const handleTypeChange = (nextType: string) => {
    if (mode === "edit") return;
    setItemType(nextType as HealthItemType);
  };

  const toggleMedicationDay = (day: Weekday) => {
    setMedicationValues((prev) => {
      const hasDay = prev.daysOfWeek.includes(day);
      const nextDays = hasDay
        ? prev.daysOfWeek.filter((value) => value !== day)
        : [...prev.daysOfWeek, day];
      return {
        ...prev,
        daysOfWeek: nextDays.sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b)),
      };
    });
  };

  const handleSubmit = () => {
    if (readOnly || saving) return;

    if (itemType === "allergy") {
      if (!allergyValues.allergen.trim()) return;
      onSave("allergy", {
        ...allergyValues,
        allergen: allergyValues.allergen.trim(),
        treatmentNotes: allergyValues.treatmentNotes.trim(),
        updatedAt: todayIsoDate(),
      });
      return;
    }

    if (itemType === "medication") {
      if (!medicationValues.name.trim() || !medicationValues.timeOfDay.trim()) return;
      onSave("medication", {
        ...medicationValues,
        name: medicationValues.name.trim(),
        dose: medicationValues.dose.trim(),
        timeOfDay: medicationValues.timeOfDay.trim(),
        instructions: medicationValues.instructions.trim(),
        endDate: medicationValues.ongoing ? null : medicationValues.endDate,
        updatedAt: todayIsoDate(),
      });
      return;
    }

    if (!updateValues.title.trim()) return;
    onSave("update", {
      ...updateValues,
      title: updateValues.title.trim(),
      details: updateValues.details.trim(),
      createdAt: todayIsoDate(),
    });
  };

  const canSave =
    itemType === "allergy"
      ? allergyValues.allergen.trim().length > 0
      : itemType === "medication"
        ? medicationValues.name.trim().length > 0 && medicationValues.timeOfDay.trim().length > 0
        : updateValues.title.trim().length > 0;

  return {
    itemType,
    allergyValues,
    setAllergyValues,
    medicationValues,
    setMedicationValues,
    updateValues,
    setUpdateValues,
    confirmDelete,
    setConfirmDelete,
    handleTypeChange,
    toggleMedicationDay,
    handleSubmit,
    canSave,
  };
}

type ParentHealthFormFieldsProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  mode: "create" | "edit";
  readOnly?: boolean;
  form: ReturnType<typeof useParentHealthForm>;
};

export function ParentHealthFormFields({
  theme,
  adminCompat,
  mode,
  readOnly = false,
  form,
}: ParentHealthFormFieldsProps) {
  const {
    itemType,
    allergyValues,
    setAllergyValues,
    medicationValues,
    setMedicationValues,
    updateValues,
    setUpdateValues,
    handleTypeChange,
    toggleMedicationDay,
  } = form;

  return (
    <div className="space-y-4" data-testid="parent-health-form-fields">
      {mode === "create" ? (
        <ParentStoryPillNav
          theme={theme}
          items={HEALTH_TYPE_OPTIONS}
          activeKey={itemType}
          onChange={handleTypeChange}
          ariaLabel="Health item type"
          data-testid="parent-health-form-type-nav"
        />
      ) : null}

      {itemType === "allergy" ? (
        <>
          <div>
            <FieldLabel theme={theme} htmlFor="health-allergen" required>
              Allergen
            </FieldLabel>
            <input
              id="health-allergen"
              type="text"
              value={allergyValues.allergen}
              onChange={(event) =>
                setAllergyValues((prev) => ({ ...prev, allergen: event.target.value }))
              }
              placeholder="Food or environmental allergy"
              disabled={readOnly}
              className={inputClassName(theme)}
              style={inputStyle(theme)}
            />
          </div>
          <div>
            <FieldLabel theme={theme} htmlFor="health-severity">
              Severity
            </FieldLabel>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SEVERITY_LABELS) as HealthAllergySeverity[]).map((severity) => {
                const active = allergyValues.severity === severity;
                return (
                  <button
                    key={severity}
                    type="button"
                    disabled={readOnly}
                    onClick={() => setAllergyValues((prev) => ({ ...prev, severity }))}
                      className="rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60"
                    style={{
                      borderColor: active ? theme.primary : theme.line,
                      backgroundColor: active ? theme.primarySoft : theme.white,
                      color: active ? theme.primary : theme.muted,
                    }}
                  >
                    {SEVERITY_LABELS[severity]}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <FieldLabel theme={theme} htmlFor="health-treatment">
              Treatment or reaction notes
            </FieldLabel>
            <textarea
              id="health-treatment"
              value={allergyValues.treatmentNotes}
              onChange={(event) =>
                setAllergyValues((prev) => ({ ...prev, treatmentNotes: event.target.value }))
              }
              rows={3}
              placeholder="Treatment used in case of a reaction"
              disabled={readOnly}
              className={inputClassName(theme)}
              style={inputStyle(theme)}
            />
          </div>
        </>
      ) : null}

      {itemType === "medication" ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <FieldLabel theme={theme} htmlFor="health-med-name" required>
                Medication name
              </FieldLabel>
              <input
                id="health-med-name"
                type="text"
                value={medicationValues.name}
                onChange={(event) =>
                  setMedicationValues((prev) => ({ ...prev, name: event.target.value }))
                }
                disabled={readOnly}
                className={inputClassName(theme)}
                style={inputStyle(theme)}
              />
            </div>
            <div>
              <FieldLabel theme={theme} htmlFor="health-med-dose">
                Dose
              </FieldLabel>
              <input
                id="health-med-dose"
                type="text"
                value={medicationValues.dose}
                onChange={(event) =>
                  setMedicationValues((prev) => ({ ...prev, dose: event.target.value }))
                }
                placeholder="e.g. 2 puffs, 5 ml"
                disabled={readOnly}
                className={inputClassName(theme)}
                style={inputStyle(theme)}
              />
            </div>
          </div>
          <div>
            <FieldLabel theme={theme} htmlFor="health-med-time" required>
              Time at school
            </FieldLabel>
            <input
              id="health-med-time"
              type="text"
              value={medicationValues.timeOfDay}
              onChange={(event) =>
                setMedicationValues((prev) => ({ ...prev, timeOfDay: event.target.value }))
              }
              placeholder="e.g. 12:30 PM"
              disabled={readOnly}
              className={inputClassName(theme)}
              style={inputStyle(theme)}
            />
          </div>
          <div>
            <FieldLabel theme={theme} htmlFor="health-med-days">
              Days of the week
            </FieldLabel>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = medicationValues.daysOfWeek.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleMedicationDay(day)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60"
                    style={{
                      borderColor: active ? theme.primary : theme.line,
                      backgroundColor: active ? theme.primarySoft : theme.white,
                      color: active ? theme.primary : theme.muted,
                    }}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <FieldLabel theme={theme} htmlFor="health-med-start">
                Start date
              </FieldLabel>
              <input
                id="health-med-start"
                type="date"
                value={medicationValues.startDate}
                onChange={(event) =>
                  setMedicationValues((prev) => ({ ...prev, startDate: event.target.value }))
                }
                disabled={readOnly}
                className={inputClassName(theme)}
                style={inputStyle(theme)}
              />
            </div>
            <div>
              <FieldLabel theme={theme} htmlFor="health-med-end">
                End date
              </FieldLabel>
              <input
                id="health-med-end"
                type="date"
                value={medicationValues.endDate ?? ""}
                onChange={(event) =>
                  setMedicationValues((prev) => ({
                    ...prev,
                    endDate: event.target.value || null,
                  }))
                }
                disabled={readOnly || medicationValues.ongoing}
                className={inputClassName(theme)}
                style={inputStyle(theme)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold" style={labelStyle(theme)}>
            <input
              type="checkbox"
              checked={medicationValues.ongoing}
              onChange={(event) =>
                setMedicationValues((prev) => ({
                  ...prev,
                  ongoing: event.target.checked,
                  endDate: event.target.checked ? null : prev.endDate,
                }))
              }
              disabled={readOnly}
            />
            Ongoing medication
          </label>
          <div>
            <FieldLabel theme={theme} htmlFor="health-med-instructions">
              Instructions for staff
            </FieldLabel>
            <textarea
              id="health-med-instructions"
              value={medicationValues.instructions}
              onChange={(event) =>
                setMedicationValues((prev) => ({ ...prev, instructions: event.target.value }))
              }
              rows={2}
              disabled={readOnly}
              className={inputClassName(theme)}
              style={inputStyle(theme)}
            />
          </div>
        </>
      ) : null}

      {itemType === "update" ? (
        <>
          <div>
            <FieldLabel theme={theme} htmlFor="health-update-title" required>
              Update title
            </FieldLabel>
            <input
              id="health-update-title"
              type="text"
              value={updateValues.title}
              onChange={(event) =>
                setUpdateValues((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Short summary for teachers"
              disabled={readOnly}
              className={inputClassName(theme)}
              style={inputStyle(theme)}
            />
          </div>
          <div>
            <FieldLabel theme={theme} htmlFor="health-update-details">
              Details
            </FieldLabel>
            <textarea
              id="health-update-details"
              value={updateValues.details}
              onChange={(event) =>
                setUpdateValues((prev) => ({ ...prev, details: event.target.value }))
              }
              rows={3}
              disabled={readOnly}
              className={inputClassName(theme)}
              style={inputStyle(theme)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <FieldLabel theme={theme} htmlFor="health-update-start">
                Effective from
              </FieldLabel>
              <input
                id="health-update-start"
                type="date"
                value={updateValues.startDate}
                onChange={(event) =>
                  setUpdateValues((prev) => ({ ...prev, startDate: event.target.value }))
                }
                disabled={readOnly}
                className={inputClassName(theme)}
                style={inputStyle(theme)}
              />
            </div>
            <div>
              <FieldLabel theme={theme} htmlFor="health-update-end">
                Effective through
              </FieldLabel>
              <input
                id="health-update-end"
                type="date"
                value={updateValues.endDate ?? ""}
                onChange={(event) =>
                  setUpdateValues((prev) => ({
                    ...prev,
                    endDate: event.target.value || null,
                  }))
                }
                disabled={readOnly}
                className={inputClassName(theme)}
                style={inputStyle(theme)}
              />
            </div>
          </div>
        </>
      ) : null}

      <ApplicationStepNotice
        C={adminCompat}
        body="This will notify assigned teachers and the school office."
      />
    </div>
  );
}
