"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronRight, FileSignature } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import GardenFormDetailDialog from "@/components/school-parent/forms-documents/garden/GardenFormDetailDialog";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GIcon,
  G_FOCUS,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import type { ParentFormDetail, ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import { formatFormDueDate } from "@/lib/school-teacher/forms-documents/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentBillingTuitionAgreementsSectionProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  agreements: ParentFormListItem[];
  readOnly?: boolean;
  initialFormId?: string | null;
  onAgreementUpdated: (detail: ParentFormDetail) => void;
};

function formatSignedDate(iso: string | null): string {
  if (!iso) return "Signed";
  return `Signed ${new Date(iso).toLocaleDateString()}`;
}

/** Forms tab: tuition agreements to sign, then the signed ones. */
export default function ParentBillingTuitionAgreementsSection({
  theme,
  organizationId,
  agreements,
  readOnly = false,
  initialFormId = null,
  onAgreementUpdated,
}: ParentBillingTuitionAgreementsSectionProps) {
  const reduce = useReducedMotion() === true;
  const [selectedAgreement, setSelectedAgreement] = useState<ParentFormListItem | null>(null);
  const [showSigned, setShowSigned] = useState(false);

  useEffect(() => {
    if (!initialFormId) return;
    const match = agreements.find((item) => item.form.id === initialFormId);
    if (match) {
      queueMicrotask(() => setSelectedAgreement(match));
    }
  }, [agreements, initialFormId]);

  const pendingAgreements = useMemo(
    () => agreements.filter((item) => item.listStatus === "needs_action"),
    [agreements],
  );
  const signedAgreements = useMemo(
    () => agreements.filter((item) => item.listStatus === "signed"),
    [agreements],
  );

  if (agreements.length === 0) return null;

  return (
    <>
      <GCard
        index={1}
        kicker="Tuition agreements"
        title={
          pendingAgreements.length > 0
            ? `${pendingAgreements.length} to sign`
            : "All agreements signed"
        }
        action={
          <div className="flex flex-wrap gap-2">
            {pendingAgreements.length > 0 ? (
              <GChip tone="warning">Needs signature · {pendingAgreements.length}</GChip>
            ) : null}
            {signedAgreements.length > 0 ? (
              <GChip tone="success">Signed · {signedAgreements.length}</GChip>
            ) : null}
          </div>
        }
      >
        <p className="m-0 mb-4 text-[15px] font-semibold text-[var(--sf-soft)]">
          Review and sign agreements assigned to your family.
        </p>

        {pendingAgreements.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {pendingAgreements.map((item) => (
              <li
                key={item.form.id}
                className="relative flex flex-col gap-3 rounded-[14px] bg-[var(--sf-butter)] p-4 pt-5 shadow-[0_10px_20px_-14px_rgba(43,36,29,0.55)] sm:flex-row sm:items-center"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 h-3.5 w-12 -translate-x-1/2 -translate-y-1/2 -rotate-2 rounded-sm bg-white/75"
                />
                <GIcon size="sm">
                  <FileSignature />
                </GIcon>
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                    {item.form.title}
                  </h3>
                  <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/65">
                    Due {formatFormDueDate(item.form.dueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <GChip tone="neutral" className="bg-white/70">Needs signature</GChip>
                  <button
                    type="button"
                    className={gBtnPopSm}
                    disabled={readOnly}
                    onClick={() => setSelectedAgreement(item)}
                  >
                    Review &amp; sign
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-[16px] bg-[var(--sf-mint)] p-4">
            <Tick className="h-9 w-9" color="var(--sf-forest)" />
            <p className="m-0 text-[15px] font-semibold text-[var(--sf-ink)]/80">
              Nothing waiting for your signature.
            </p>
          </div>
        )}

        {signedAgreements.length > 0 ? (
          <div className="mt-5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
            <button
              type="button"
              onClick={() => setShowSigned((current) => !current)}
              aria-expanded={showSigned}
              className={`flex cursor-pointer items-center gap-2 rounded-md text-sm font-extrabold text-[var(--sf-ink)] ${G_FOCUS}`}
            >
              {showSigned ? (
                <ChevronDown className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden />
              )}
              Signed agreements ({signedAgreements.length})
            </button>
            <AnimatePresence initial={false}>
              {showSigned ? (
                <motion.ul
                  key="signed"
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: PORTAL_EASE }}
                  className="sf-paper mt-3 flex flex-col overflow-hidden rounded-xl px-1"
                >
                  {signedAgreements.map((item) => (
                    <li key={item.form.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedAgreement(item)}
                        className={`group flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/70 ${G_FOCUS} focus-visible:ring-inset`}
                      >
                        <Tick className="h-6 w-6" color="var(--sf-forest)" fill="var(--sf-mint)" />
                        <span className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-[var(--sf-ink)]">
                          {item.form.title}
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-[var(--sf-soft)]">
                          {formatSignedDate(item.response.signedAt)}
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </button>
                    </li>
                  ))}
                </motion.ul>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </GCard>

      <GardenFormDetailDialog
        theme={theme}
        open={selectedAgreement != null}
        organizationId={organizationId}
        formId={selectedAgreement?.form.id ?? null}
        initialItem={selectedAgreement}
        readOnly={readOnly}
        onClose={() => setSelectedAgreement(null)}
        onSubmitted={(detail) => {
          onAgreementUpdated(detail);
          setSelectedAgreement(null);
        }}
      />
    </>
  );
}
