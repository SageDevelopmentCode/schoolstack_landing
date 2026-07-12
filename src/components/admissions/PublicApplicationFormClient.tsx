"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ApplicationAuthGate from "@/components/admissions/ApplicationAuthGate";
import ApplicationFormExperience from "@/components/admissions/ApplicationFormExperience";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import type { BootstrapApplicantResult } from "@/lib/admissions/applicant-bootstrap";
import {
  familyHasOtherApplications,
  loadApplicationDraft,
  saveApplicationDraft,
  type ApplicationDraft,
  type SaveApplicationDraftInput,
} from "@/lib/admissions/application-draft";
import type { CopyableApplication } from "@/lib/admissions/application-copy";
import {
  getApplicationResponsesForCopy,
  listCopyableApplications,
  pickResponsesForCopy,
} from "@/lib/admissions/application-copy";
import { loadApplicationSummary } from "@/lib/admissions/application-status";
import type {
  ApplicationFormFeeConfig,
  ApplicationFormSchema,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type PublicApplicationFormClientProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  title: string;
  intro: string | null;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
  organizationId: string;
  formVersionId: string;
};

type ClientPhase = "checking_session" | "auth" | "loading_draft" | "form" | "error";

async function bootstrapApplicant(
  organizationId: string,
  formVersionId: string,
  options?: { forceNew?: boolean },
): Promise<BootstrapApplicantResult> {
  const response = await fetch("/api/admissions/applicant-bootstrap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organizationId,
      formVersionId,
      mode: "login",
      forceNew: options?.forceNew === true,
    }),
  });

  const payload = (await response.json()) as BootstrapApplicantResult & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to resume your application.");
  }

  return payload;
}

export default function PublicApplicationFormClient({
  branding,
  schoolName,
  schoolSlug,
  title,
  intro,
  schema,
  feeConfig,
  organizationId,
  formVersionId,
}: PublicApplicationFormClientProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceNew = searchParams.get("new") === "1";

  const [phase, setPhase] = useState<ClientPhase>("checking_session");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentReturnPending, setPaymentReturnPending] = useState(
    () => searchParams.get("payment") === "success",
  );
  const [submitted, setSubmitted] = useState(false);
  const [copyableApplications, setCopyableApplications] = useState<CopyableApplication[]>(
    [],
  );
  const [priorFieldValues, setPriorFieldValues] = useState<Record<string, string>>({});
  const [importGeneration, setImportGeneration] = useState(0);
  const [hasOtherApplications, setHasOtherApplications] = useState(false);

  const resumeWithApplication = useCallback(
    async (nextApplicationId: string) => {
      setApplicationId(nextApplicationId);
      setPhase("loading_draft");
      setError(null);

      try {
        const loaded = await loadApplicationDraft(supabase, nextApplicationId);
        const otherApplications = await familyHasOtherApplications(
          supabase,
          organizationId,
          nextApplicationId,
        );
        setHasOtherApplications(otherApplications);
        setDraft(loaded);
        if (loaded.status !== "draft") {
          setSubmitted(true);
        } else {
          const copyable = await listCopyableApplications(
            supabase,
            organizationId,
            formVersionId,
            nextApplicationId,
          );
          setCopyableApplications(copyable);
          if (copyable[0]) {
            const priorResponses = await getApplicationResponsesForCopy(
              supabase,
              copyable[0].id,
            );
            setPriorFieldValues(
              pickResponsesForCopy(priorResponses, schema),
            );
          } else {
            setPriorFieldValues({});
          }
        }
        setPhase("form");
      } catch (err) {
        if (
          err instanceof Error &&
          err.message.includes("already been submitted")
        ) {
          setSubmitted(true);
          setPhase("form");
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your application.",
        );
        setPhase("error");
      }
    },
    [formVersionId, organizationId, schema, supabase],
  );

  const handleBootstrapResult = useCallback(
    async (result: BootstrapApplicantResult) => {
      if (result.action === "redirect_apply_dashboard") {
        router.replace(`/school/${schoolSlug}/apply`);
        return;
      }

      if (result.applicationId) {
        await resumeWithApplication(result.applicationId);
      }
    },
    [resumeWithApplication, router, schoolSlug],
  );

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setPhase("auth");
        return;
      }

      try {
        const result = await bootstrapApplicant(organizationId, formVersionId, {
          forceNew,
        });
        if (cancelled) return;
        await handleBootstrapResult(result);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to resume your application.",
        );
        setPhase("auth");
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [
    forceNew,
    formVersionId,
    handleBootstrapResult,
    organizationId,
    supabase.auth,
  ]);

  useEffect(() => {
    if (!paymentReturnPending || !applicationId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20;

    const poll = async () => {
      while (!cancelled && attempts < maxAttempts) {
        attempts += 1;
        try {
          const summary = await loadApplicationSummary(supabase, applicationId);
          if (summary?.status === "submitted") {
            setDraft((current) =>
              current
                ? {
                    ...current,
                    status: summary.status,
                    feeStatus: summary.feeStatus,
                  }
                : current,
            );
            setSubmitted(true);
            setPaymentReturnPending(false);
            return;
          }
        } catch {
          // Keep polling briefly while webhook processes.
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setPaymentReturnPending(false);
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [applicationId, paymentReturnPending, supabase]);

  const handleBootstrapped = (result: BootstrapApplicantResult) => {
    void handleBootstrapResult(result);
  };

  const handleExitToApplyDashboard = useCallback(() => {
    router.push(`/school/${schoolSlug}/apply`);
  }, [router, schoolSlug]);

  const handleSaveDraft = async (input: SaveApplicationDraftInput) => {
    if (!applicationId) {
      throw new Error("Your application is not ready to save yet.");
    }

    await saveApplicationDraft(supabase, applicationId, input);
    setDraft((current) =>
      current
        ? {
            ...current,
            responses: input.responses,
            acknowledgments: input.acknowledgments,
            stepIndex: input.stepIndex,
          }
        : current,
    );
  };

  const handleImportResponses = async (
    sourceApplicationId: string,
    fieldIds?: string[],
  ) => {
    if (!applicationId || !draft) return;

    const sourceResponses = await getApplicationResponsesForCopy(
      supabase,
      sourceApplicationId,
    );
    const imported = pickResponsesForCopy(sourceResponses, schema, fieldIds);
    const nextResponses = { ...draft.responses, ...imported };

    await saveApplicationDraft(supabase, applicationId, {
      responses: nextResponses,
      acknowledgments: draft.acknowledgments,
      stepIndex: draft.stepIndex,
    });

    setDraft((current) =>
      current
        ? {
            ...current,
            responses: nextResponses,
          }
        : current,
    );
    setImportGeneration((current) => current + 1);
  };

  if (phase === "checking_session" || phase === "loading_draft") {
    return (
      <ApplicationFormPageShell branding={branding}>
        <div
          className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6"
          style={{ color: C.textSecondary }}
        >
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.accent }} />
          <p className="text-sm">
            {phase === "checking_session"
              ? "Checking your session…"
              : "Loading your application…"}
          </p>
        </div>
      </ApplicationFormPageShell>
    );
  }

  if (phase === "error") {
    return (
      <ApplicationFormPageShell branding={branding}>
        <div
          className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12"
          style={{ color: C.textPrimary }}
        >
          <h1 className="text-xl font-semibold" style={{ color: C.accentDark }}>
            Unable to open your application
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            {error ?? "Something went wrong. Please try again."}
          </p>
        </div>
      </ApplicationFormPageShell>
    );
  }

  if (phase === "form" && applicationId && (draft || submitted)) {
    return (
      <ApplicationFormPageShell branding={branding}>
        <ApplicationFormExperience
          key={`${applicationId}-${importGeneration}`}
          branding={branding}
          schoolName={schoolName}
          title={title}
          intro={intro}
          schema={schema}
          feeConfig={feeConfig}
          mode="live"
          applicationId={applicationId}
          organizationId={organizationId}
          initialValues={draft?.responses}
          initialAcknowledgments={draft?.acknowledgments}
          initialStepIndex={draft?.stepIndex ?? 0}
          initialFeeStatus={draft?.feeStatus ?? "not_required"}
          initialStatus={draft?.status ?? (submitted ? "submitted" : "draft")}
          paymentReturnPending={paymentReturnPending}
          schoolSlug={schoolSlug}
          copyableApplications={copyableApplications}
          priorFieldValues={priorFieldValues}
          onImportResponses={handleImportResponses}
          onSaveDraft={draft ? handleSaveDraft : undefined}
          onSubmitted={() => setSubmitted(true)}
          showExitToApplyDashboard={hasOtherApplications}
          onExitToApplyDashboard={handleExitToApplyDashboard}
        />
      </ApplicationFormPageShell>
    );
  }

  return (
    <ApplicationAuthGate
      branding={branding}
      schoolName={schoolName}
      schoolSlug={schoolSlug}
      formTitle={title}
      organizationId={organizationId}
      formVersionId={formVersionId}
      forceNew={forceNew}
      onBootstrapped={handleBootstrapped}
      onRedirectApplyDashboard={() => {
        router.replace(`/school/${schoolSlug}/apply`);
      }}
      onComplete={() => {
        // Form visibility is driven by handleBootstrapResult after bootstrap.
      }}
    />
  );
}
