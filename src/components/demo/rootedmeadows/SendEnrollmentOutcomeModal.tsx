"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  FileText,
  Mail,
  Loader2,
  CheckCircle2,
  PenLine,
  ChevronDown,
  ChevronRight,
  Wallet,
  ClipboardList,
  Camera,
  ShieldCheck,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import { ROOTED_MEADOWS_ADMIN_COLORS } from "@/data/school-demos/rootedmeadows-admin-demo";
import {
  ROOTED_MEADOWS_ENROLLMENT_PATHS,
  getEnrollmentContractSections,
  getEnrollmentSendLabel,
  getReferralEmailPreview,
  type EnrollmentOutcomePathId,
  type EnrollmentContractSection,
  type EnrollmentPathConfig,
  type ParentPortalStep,
} from "@/data/school-demos/rooted-meadows-enrollment-contracts";

const C = {
  surface: "#FFFFFF",
  elevated: "#FDFCFB",
  border: ROOTED_MEADOWS_ADMIN_COLORS.border,
  accent: ROOTED_MEADOWS_ADMIN_COLORS.accent,
  accentLight: ROOTED_MEADOWS_ADMIN_COLORS.accentLight,
  accentDark: ROOTED_MEADOWS_ADMIN_COLORS.accentDark,
  secondaryBtnBorder: ROOTED_MEADOWS_ADMIN_COLORS.secondaryBtnBorder,
  clay: ROOTED_MEADOWS_ADMIN_COLORS.clay,
  clayBg: ROOTED_MEADOWS_ADMIN_COLORS.clayBg,
  clayBorder: ROOTED_MEADOWS_ADMIN_COLORS.clayBorder,
  textPrimary: ROOTED_MEADOWS_ADMIN_COLORS.textPrimary,
  textSecondary: ROOTED_MEADOWS_ADMIN_COLORS.textSecondary,
  textTertiary: "#8A7B6E",
  success: "#16A34A",
  successBg: "rgba(22, 163, 74, 0.08)",
  successBorder: "rgba(22, 163, 74, 0.25)",
  warning: "#D97706",
  warningBg: "rgba(217, 119, 6, 0.08)",
  warningBorder: "rgba(217, 119, 6, 0.25)",
  shadowMedium: "0 4px 16px rgba(43,36,29,0.08)",
  r: { xl: "8px", lg: "6px", full: "9999px" },
};

const HIDE_SCROLLBAR: React.CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const SCROLL_AREA_CLASS =
  "overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const PARENT_PORTAL_STEP_ICONS: Record<string, LucideIcon> = {
  fees: Wallet,
  forms: ClipboardList,
  release: Camera,
  records: ShieldCheck,
  agreements: FileCheck,
};

const PARENT_PORTAL_STEP_COLORS: Record<string, string> = {
  fees: C.success,
  forms: "#2563EB",
  release: C.accent,
  records: C.warning,
  agreements: C.clay,
};

function ParentPortalStepsRow({ steps }: { steps: ParentPortalStep[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {steps.map((step) => {
        const Icon = PARENT_PORTAL_STEP_ICONS[step.id] ?? FileCheck;
        const iconColor = PARENT_PORTAL_STEP_COLORS[step.id] ?? C.textTertiary;
        return (
          <span
            key={step.id}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium"
            style={{
              backgroundColor: C.elevated,
              border: `1px solid ${C.border}`,
              color: C.textTertiary,
            }}
          >
            <Icon
              className="h-2.5 w-2.5 flex-shrink-0"
              style={{ color: iconColor }}
            />
            {step.label}
          </span>
        );
      })}
    </div>
  );
}

export type SendEnrollmentLead = {
  id: string;
  name: string;
  email: string;
  childName: string | null;
  childAge: number | null;
};

function EnrollmentPathCard({
  path,
  selected,
  onSelect,
}: {
  path: EnrollmentPathConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  const isReferral = path.kind === "referral";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-lg p-3.5 transition-all"
      style={{
        backgroundColor: selected
          ? isReferral
            ? C.warningBg
            : C.accentLight
          : C.elevated,
        border: `1.5px solid ${
          selected
            ? isReferral
              ? C.warning
              : C.accent
            : C.border
        }`,
        boxShadow: selected ? C.shadowMedium : "none",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: selected
              ? isReferral
                ? "rgba(217, 119, 6, 0.15)"
                : "rgba(130, 112, 150, 0.18)"
              : C.surface,
            border: `1px solid ${selected ? (isReferral ? C.warningBorder : C.secondaryBtnBorder) : C.border}`,
          }}
        >
          {isReferral ? (
            <Mail
              className="h-4 w-4"
              style={{ color: selected ? C.warning : C.textTertiary }}
            />
          ) : (
            <FileText
              className="h-4 w-4"
              style={{ color: selected ? C.accent : C.textTertiary }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-semibold leading-snug"
            style={{ color: C.textPrimary }}
          >
            {path.title}
          </p>
          <p
            className="mt-1 text-xs leading-relaxed"
            style={{ color: C.textSecondary }}
          >
            {path.subtitle}
          </p>
          {path.parentPortalSteps && (
            <ParentPortalStepsRow steps={path.parentPortalSteps} />
          )}
        </div>
        {selected && (
          <div
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: isReferral ? C.warning : C.accent }}
          >
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
}

function PreviewEmptyState() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center rounded-lg px-6 py-12 text-center"
      style={{
        backgroundColor: C.elevated,
        border: `1px dashed ${C.border}`,
      }}
    >
      <FileText className="mb-3 h-8 w-8" style={{ color: C.textTertiary }} />
      <p className="text-sm font-medium" style={{ color: C.textSecondary }}>
        Select a path to preview
      </p>
    </div>
  );
}

function ContractDocumentPreview({
  title,
  sections,
}: {
  title: string;
  sections: EnrollmentContractSection[];
}) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col ${SCROLL_AREA_CLASS}`}
      style={{ ...HIDE_SCROLLBAR, backgroundColor: C.surface }}
    >
      <div
        className="border-b pb-4"
        style={{ borderColor: C.border }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: C.textTertiary }}
        >
          Rooted Meadows Waldorf School
        </p>
        <h4
          className="mt-1 font-serif text-base font-semibold"
          style={{ color: C.textPrimary, fontFamily: "Georgia, serif" }}
        >
          {title}
        </h4>
      </div>
      <div className="space-y-0 pt-2">
        {sections.map((section, i) => (
          <div
            key={section.id}
            className="py-4"
            style={{
              borderBottom:
                i < sections.length - 1
                  ? `1px solid ${C.border}`
                  : undefined,
            }}
          >
            <h5
              className="mb-2 text-sm font-semibold"
              style={{
                color: C.textPrimary,
                fontFamily: "Georgia, serif",
              }}
            >
              {section.title}
            </h5>
            <p
              className="text-xs leading-relaxed"
              style={{ color: C.textSecondary }}
            >
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralMessagePreview({
  parentName,
  childName,
  schoolSuggestion,
  onSchoolSuggestionChange,
}: {
  parentName: string;
  childName: string;
  schoolSuggestion: string;
  onSchoolSuggestionChange: (value: string) => void;
}) {
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const emailPreview = getReferralEmailPreview({
    parentName,
    childName,
    schoolSuggestion,
  });

  return (
    <div
      className={`flex h-full min-h-0 flex-col ${SCROLL_AREA_CLASS}`}
      style={{ ...HIDE_SCROLLBAR, backgroundColor: C.surface }}
    >
      <div>
        <label
          className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide"
          style={{ color: C.textTertiary }}
        >
          School to suggest
        </label>
        <input
          type="text"
          value={schoolSuggestion}
          onChange={(e) => onSchoolSuggestionChange(e.target.value)}
          placeholder="Green Valley Learning Center"
          className="w-full rounded-md px-3 py-2 text-xs outline-none"
          style={{
            backgroundColor: C.elevated,
            border: `1px solid ${C.border}`,
            color: C.textPrimary,
          }}
        />
        <p className="mt-1.5 text-[10px]" style={{ color: C.textTertiary }}>
          Required before sending
        </p>
      </div>

      <div
        className="mt-4 flex min-h-0 flex-1 flex-col"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <button
          type="button"
          onClick={() => setEmailPreviewOpen((open) => !open)}
          className="flex w-full flex-shrink-0 items-center justify-between py-2.5 text-left"
        >
          <span
            className="text-[10px] font-medium uppercase tracking-wide"
            style={{ color: C.textTertiary }}
          >
            Preview email
          </span>
          {emailPreviewOpen ? (
            <ChevronDown
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: C.textTertiary }}
            />
          ) : (
            <ChevronRight
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: C.textTertiary }}
            />
          )}
        </button>
        <AnimatePresence initial={false}>
          {emailPreviewOpen && (
            <motion.div
              key="referral-email-preview"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div
                className={`max-h-64 pb-1 ${SCROLL_AREA_CLASS}`}
                style={HIDE_SCROLLBAR}
              >
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: C.textTertiary }}
                >
                  Subject
                </p>
                <p
                  className="mb-3 text-xs font-semibold leading-snug"
                  style={{ color: C.textPrimary }}
                >
                  {emailPreview.subject}
                </p>
                <pre
                  className="whitespace-pre-wrap font-sans text-xs leading-relaxed"
                  style={{ color: C.textSecondary }}
                >
                  {emailPreview.body}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SendEnrollmentOutcomeModal({
  lead,
  onClose,
  onSent,
}: {
  lead: SendEnrollmentLead;
  onClose: () => void;
  onSent: (pathId: EnrollmentOutcomePathId) => void;
}) {
  const [selectedPath, setSelectedPath] =
    useState<EnrollmentOutcomePathId | null>(null);
  const [personalNote, setPersonalNote] = useState("");
  const [showPersonalNote, setShowPersonalNote] = useState(false);
  const [schoolSuggestion, setSchoolSuggestion] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const selectedConfig = selectedPath
    ? ROOTED_MEADOWS_ENROLLMENT_PATHS.find((p) => p.id === selectedPath)
    : undefined;
  const childName = lead.childName ?? "your child";
  const isReferral = selectedPath === "better-fit-referral";
  const canSend =
    selectedPath !== null &&
    (!isReferral || schoolSuggestion.trim().length > 0);

  useEffect(() => {
    queueMicrotask(() => {
      setSelectedPath(null);
      setPersonalNote("");
      setShowPersonalNote(false);
      setSchoolSuggestion("");
    });
  }, [lead.id]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !sending) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, sending]);

  useEffect(() => {
    if (!sent || !selectedPath) return;
    const t = setTimeout(() => {
      onSent(selectedPath);
      onClose();
    }, 1500);
    return () => clearTimeout(t);
  }, [sent, onClose, onSent, selectedPath]);

  function handleSend() {
    if (!canSend || !selectedPath) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  }

  const headerSubtitle = sent
    ? "Sent successfully"
    : lead.childName
      ? `Choose the enrollment outcome for ${lead.childName}'s family after the observation visit.`
      : "Choose the path that reflects your admissions decision after the observation visit.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", zIndex: 50 }}
      onClick={sending || sent ? undefined : onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col overflow-hidden"
        style={{
          maxWidth: 920,
          maxHeight: "min(90vh, 680px)",
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: C.r.xl,
          boxShadow: C.shadowMedium,
        }}
      >
        <div
          className="flex flex-shrink-0 items-start justify-between gap-4 px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ color: C.textPrimary }}
            >
              Send enrollment outcome
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
              {headerSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            style={{ color: C.textTertiary }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <CheckCircle2 className="h-12 w-12" style={{ color: C.success }} />
            </motion.div>
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              {isReferral
                ? "Referral message sent"
                : "Enrollment agreement sent"}
            </p>
            <p className="text-xs" style={{ color: C.textTertiary }}>
              {lead.name} will receive an email at {lead.email}
            </p>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              <div
                className={`flex min-h-0 flex-shrink-0 flex-col gap-2 p-4 md:w-[38%] ${SCROLL_AREA_CLASS}`}
                style={{ ...HIDE_SCROLLBAR, borderRight: `1px solid ${C.border}` }}
              >
                {ROOTED_MEADOWS_ENROLLMENT_PATHS.map((path) => (
                  <EnrollmentPathCard
                    key={path.id}
                    path={path}
                    selected={selectedPath === path.id}
                    onSelect={() => setSelectedPath(path.id)}
                  />
                ))}
              </div>

              <div className="flex min-h-0 flex-1 flex-col p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPath ?? "empty"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className={`h-full min-h-0 ${SCROLL_AREA_CLASS}`}
                    style={HIDE_SCROLLBAR}
                  >
                      {selectedPath === null ? (
                        <PreviewEmptyState />
                      ) : isReferral ? (
                        <ReferralMessagePreview
                          key={lead.id}
                          parentName={lead.name}
                          childName={childName}
                          schoolSuggestion={schoolSuggestion}
                          onSchoolSuggestionChange={setSchoolSuggestion}
                        />
                      ) : (
                        <ContractDocumentPreview
                          title={selectedConfig!.documentTitle}
                          sections={getEnrollmentContractSections(selectedPath)}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
              </div>
            </div>

            <div
              className="flex flex-shrink-0 flex-col gap-3 px-5 py-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              {showPersonalNote ? (
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      className="text-xs font-medium"
                      style={{ color: C.textPrimary }}
                    >
                      Personal note to family
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPersonalNote(false);
                        setPersonalNote("");
                      }}
                      className="text-[10px] underline"
                      style={{ color: C.textTertiary }}
                    >
                      Remove note
                    </button>
                  </div>
                  <input
                    type="text"
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="We're so glad Ella visited our classroom..."
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                    style={{
                      backgroundColor: C.elevated,
                      border: `1px solid ${C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                {!showPersonalNote ? (
                  <button
                    type="button"
                    onClick={() => setShowPersonalNote(true)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                    style={{
                      color: C.accent,
                      backgroundColor: C.accentLight,
                      border: `1px solid ${C.secondaryBtnBorder}`,
                    }}
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Add personal note
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  disabled={!canSend || sending}
                  onClick={handleSend}
                  className="flex max-w-[220px] flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-5 py-2.5 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{
                    backgroundColor: isReferral && selectedPath ? C.warning : C.accent,
                    border: `1px solid ${
                      isReferral && selectedPath ? C.warningBorder : C.accentDark
                    }`,
                    minWidth: 140,
                  }}
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <>
                      <span>Send to family</span>
                      {selectedPath && (
                        <span
                          className="max-w-full truncate text-[10px] font-normal opacity-75"
                          title={getEnrollmentSendLabel(selectedPath)}
                        >
                          {getEnrollmentSendLabel(selectedPath)}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
