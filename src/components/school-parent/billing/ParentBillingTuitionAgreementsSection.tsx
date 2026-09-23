"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import ParentFormDetailModal from "@/components/school-parent/forms-documents/ParentFormDetailModal";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
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

export default function ParentBillingTuitionAgreementsSection({
  theme,
  organizationId,
  agreements,
  readOnly = false,
  initialFormId = null,
  onAgreementUpdated,
}: ParentBillingTuitionAgreementsSectionProps) {
  const [selectedAgreement, setSelectedAgreement] = useState<ParentFormListItem | null>(null);
  const [showSigned, setShowSigned] = useState(false);

  useEffect(() => {
    if (!initialFormId) return;
    const match = agreements.find((item) => item.form.id === initialFormId);
    if (match) {
      setSelectedAgreement(match);
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
      <ParentCard theme={theme} className="mb-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold" style={{ color: theme.ink }}>
              Tuition agreements
            </h2>
            <p className="mt-1 text-sm" style={{ color: theme.muted }}>
              Review and sign agreements assigned to your family.
            </p>
          </div>
        </div>

        {pendingAgreements.length > 0 ? (
          <div className="mt-4 space-y-3">
            {pendingAgreements.map((item) => (
              <div
                key={item.form.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
                style={{ borderColor: theme.line, backgroundColor: theme.cream }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                    {item.form.title}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                    Due {formatFormDueDate(item.form.dueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ParentChip theme={theme} tone="warning">Needs signature</ParentChip>
                  <ParentButton
                    theme={theme}
                    variant="primary"
                    size="sm"
                    disabled={readOnly}
                    onClick={() => setSelectedAgreement(item)}
                  >
                    Review & sign
                  </ParentButton>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {signedAgreements.length > 0 ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowSigned((current) => !current)}
              className="flex cursor-pointer items-center gap-2 text-sm font-medium"
              style={{ color: theme.ink }}
            >
              {showSigned ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Signed agreements ({signedAgreements.length})
            </button>
            {showSigned ? (
              <div className="mt-3 space-y-2">
                {signedAgreements.map((item) => (
                  <button
                    key={item.form.id}
                    type="button"
                    onClick={() => setSelectedAgreement(item)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-[#F7FAF7]"
                    style={{ borderColor: theme.line }}
                  >
                    <span className="text-sm font-medium" style={{ color: theme.ink }}>
                      {item.form.title}
                    </span>
                    <span className="text-xs" style={{ color: theme.muted }}>
                      {formatSignedDate(item.response.signedAt)}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </ParentCard>

      <ParentFormDetailModal
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
