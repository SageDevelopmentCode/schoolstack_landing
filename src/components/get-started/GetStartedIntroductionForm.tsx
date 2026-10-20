"use client";

import { ArrowRight, Calendar, ChevronDown } from "lucide-react";
import PublicFormHoneypotField from "@/components/public-forms/PublicFormHoneypotField";
import GetStartedRoleChoices from "@/components/get-started/GetStartedRoleChoices";
import GetStartedStoryTextField, {
  GetStartedIntroTextArea,
} from "@/components/get-started/GetStartedStoryTextField";
import type { DemoRequestRoleId } from "@/lib/demo-request-roles";
import { DEMO_INTRO_FORM_COPY } from "@/lib/marketing/demo-intro-form-copy";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type GetStartedIntroductionFormData = {
  name: string;
  email: string;
  schoolName: string;
  role: DemoRequestRoleId | "";
  otherDescription: string;
  prepNotes: string;
};

type GetStartedIntroductionFormProps = {
  theme: ParentThemeTokens;
  form: GetStartedIntroductionFormData;
  onFieldChange: <K extends keyof GetStartedIntroductionFormData>(
    key: K,
    value: GetStartedIntroductionFormData[K],
  ) => void;
  errors: Set<string>;
  onClearError: (key: string) => void;
  onSubmit: () => void;
  companyWebsite: string;
  onCompanyWebsiteChange: (value: string) => void;
};

function FlowStepNav({ theme, activeStep }: { theme: ParentThemeTokens; activeStep: 0 }) {
  const copy = DEMO_INTRO_FORM_COPY;
  return (
    <nav
      className="flex items-center gap-2.5 overflow-x-auto"
      aria-label="Booking progress"
    >
      {copy.steps.map((step, index) => {
        const isActive = step.id === activeStep;
        return (
          <span key={step.id} className="contents">
            {index > 0 ? (
              <span
                className="w-[22px] h-px shrink-0"
                style={{ backgroundColor: "#DCE4D8" }}
                aria-hidden
              />
            ) : null}
            <span
              className="flex items-center gap-2 text-[11px] whitespace-nowrap shrink-0"
              style={{
                color: isActive ? theme.primary : "#87948B",
                fontWeight: isActive ? 700 : 400,
                fontFamily: theme.fontBody,
              }}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className="w-[25px] h-[25px] grid place-items-center rounded-full text-[10px] font-extrabold border"
                style={{
                  backgroundColor: isActive ? theme.primary : theme.white,
                  color: isActive ? theme.white : theme.ink,
                  borderColor: isActive ? theme.primary : "#DDE5D8",
                }}
              >
                {step.id + 1}
              </span>
              {step.label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export default function GetStartedIntroductionForm({
  theme,
  form,
  onFieldChange,
  errors,
  onClearError,
  onSubmit,
  companyWebsite,
  onCompanyWebsiteChange,
}: GetStartedIntroductionFormProps) {
  const copy = DEMO_INTRO_FORM_COPY;
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <main
      className="max-w-[760px] mx-auto bg-white overflow-hidden"
      style={{
        borderRadius: theme.radiusCard,
        border: `1px solid #E0E7E0`,
        boxShadow: theme.shadowCard,
        fontFamily: theme.fontBody,
      }}
      aria-label="Demo introduction form"
    >
      <header
        className="flex items-center justify-between gap-5 px-6 sm:px-8 py-5 border-b"
        style={{ borderColor: theme.line, backgroundColor: "#FCFDFB" }}
      >
        <FlowStepNav theme={theme} activeStep={0} />
      </header>

      <form onSubmit={handleFormSubmit} noValidate>
        <div className="px-6 sm:px-9 pt-8 pb-7">
          <PublicFormHoneypotField
            value={companyWebsite}
            onChange={onCompanyWebsiteChange}
          />

          <div
            className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
            style={{ color: theme.sage }}
          >
            {copy.kicker}
          </div>
          <h1
            className="text-[clamp(27px,4.5vw,35px)] font-semibold leading-[1.15] mt-2.5 tracking-[-0.035em]"
            style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
          >
            {copy.title}
          </h1>
          <p
            className="text-[13px] leading-[1.8] mt-3 m-0"
            style={{ color: theme.muted }}
          >
            {copy.subtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mt-8">
            <GetStartedStoryTextField
              theme={theme}
              variant="intro"
              id="intro-first-name"
              label={copy.firstNameLabel}
              value={form.name}
              onChange={(v) => {
                onFieldChange("name", v);
                onClearError("name");
              }}
              placeholder={copy.firstNamePlaceholder}
              autoComplete="given-name"
              hasError={errors.has("name")}
              errorText={errors.has("name") ? copy.errors.name : undefined}
            />
            <GetStartedStoryTextField
              theme={theme}
              variant="intro"
              id="intro-email"
              type="email"
              label={copy.emailLabel}
              value={form.email}
              onChange={(v) => {
                onFieldChange("email", v);
                onClearError("email");
              }}
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              hasError={errors.has("email")}
              errorText={errors.has("email") ? copy.errors.email : undefined}
            />
            <GetStartedStoryTextField
              theme={theme}
              variant="intro"
              id="intro-school"
              className="sm:col-span-2"
              label={copy.schoolLabel}
              optionalHint={copy.schoolOptional}
              value={form.schoolName}
              onChange={(v) => onFieldChange("schoolName", v)}
              placeholder={copy.schoolPlaceholder}
              autoComplete="organization"
              helperText={copy.schoolHelper}
            />
          </div>

          <GetStartedRoleChoices
            theme={theme}
            variant="intro"
            value={form.role}
            onChange={(role) => {
              onFieldChange("role", role);
              onClearError("role");
            }}
            hasError={errors.has("role")}
          />

          {form.role === "other" ? (
            <GetStartedStoryTextField
              theme={theme}
              variant="intro"
              id="intro-other"
              className="mt-5"
              label={copy.otherLabel}
              optionalHint={copy.otherOptional}
              value={form.otherDescription}
              onChange={(v) => onFieldChange("otherDescription", v)}
              placeholder={copy.otherPlaceholder}
              maxLength={250}
            />
          ) : null}

          <details
            className="group mt-6 border-t pt-5"
            style={{ borderColor: theme.line }}
          >
            <summary
              className="list-none flex justify-between gap-4 items-center cursor-pointer text-[11px] leading-[1.8] [&::-webkit-details-marker]:hidden"
              style={{ color: theme.muted }}
            >
              {copy.notesSummary}
              <span className="inline-flex gap-1.5 items-center shrink-0">
                {copy.notesOptional}
                <ChevronDown
                  size={13}
                  className="transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </span>
            </summary>
            <GetStartedIntroTextArea
              theme={theme}
              id="intro-notes"
              label={copy.notesFieldLabel}
              value={form.prepNotes}
              onChange={(v) => onFieldChange("prepNotes", v)}
              placeholder={copy.notesPlaceholder}
              maxLength={500}
            />
          </details>
        </div>

        <footer
          className="px-6 sm:px-9 py-6 border-t"
          style={{ backgroundColor: theme.cream, borderColor: theme.line }}
        >
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2.5 border-0 rounded-xl text-white py-4 px-4 text-[13px] font-extrabold transition-[opacity,transform] hover:opacity-90 hover:-translate-y-px"
            style={{ backgroundColor: theme.primary, fontFamily: theme.fontBody }}
          >
            {copy.submit}
            <ArrowRight size={16} aria-hidden />
          </button>
          <p
            className="flex gap-1.5 items-center justify-center text-[10px] leading-[1.8] mt-3 mb-0"
            style={{ color: theme.muted }}
          >
            <Calendar size={13} className="shrink-0" aria-hidden />
            {copy.footerNote}
          </p>
        </footer>
      </form>
    </main>
  );
}
