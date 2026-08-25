"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ApplicationAuthGate from "@/components/admissions/ApplicationAuthGate";
import ApplyAuthShell from "@/components/admissions/ApplyAuthShell";
import { ApplyAuthShellLoader } from "@/components/admissions/ApplyAuthShellLoader";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import PortalHelpFab from "@/components/school/shared/PortalHelpFab";
import { attemptPostSignInRedirect } from "@/lib/auth/resolve-post-sign-in-redirect";
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
import {
  clearPaymentReturnQuery,
  hasPaymentPollStarted,
  markPaymentPollStarted,
  PAYMENT_POLL_INTERVAL_MS,
  PAYMENT_POLL_MAX_ATTEMPTS,
  readPaymentReturnPending,
  sleep,
} from "@/lib/admissions/payment-return-polling";
import type {
  ApplicationFormFeeConfig,
  ApplicationFormSchema,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ApplyAuthEntryOption } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

const ApplicationFormExperience = dynamic(
  () => import("@/components/admissions/ApplicationFormExperience"),
);

type ServerAuthState = "unauthenticated" | "authenticated";

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
  shellLayout?: "standalone" | "embedded";
  serverAuthState?: ServerAuthState;
  tourEntryOption?: ApplyAuthEntryOption | null;
};

type ClientPhase = "checking_session" | "auth" | "loading_draft" | "form" | "error";

function getInitialPhase(serverAuthState?: ServerAuthState): ClientPhase {
  if (serverAuthState === "unauthenticated") {
    return "auth";
  }

  return "checking_session";
}

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
  shellLayout = "standalone",
  serverAuthState,
  tourEntryOption = null,
}: PublicApplicationFormClientProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const forceNew = searchParams.get("new") === "1";

  const [phase, setPhase] = useState<ClientPhase>(() =>
    getInitialPhase(serverAuthState),
  );
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentReturnPending, setPaymentReturnPending] = useState(() =>
    readPaymentReturnPending(searchParams),
  );
  const [submitted, setSubmitted] = useState(false);
  const [copyableApplications, setCopyableApplications] = useState<CopyableApplication[]>(
    [],
  );
  const [priorFieldValues, setPriorFieldValues] = useState<Record<string, string>>({});
  const [importGeneration, setImportGeneration] = useState(0);
  const [hasOtherApplications, setHasOtherApplications] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const resumeWithApplication = useCallback(
    async (nextApplicationId: string) => {
      setApplicationId(nextApplicationId);
      setPhase("loading_draft");
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setPhase("auth");
          return;
        }

        setUserEmail(user.email?.trim() || null);

        const loaded = await loadApplicationDraft(supabase, nextApplicationId);
        const otherApplications = await familyHasOtherApplications(
          supabase,
          organizationId,
          user.id,
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
            user.id,
            nextApplicationId,
          );
          setCopyableApplications(copyable);
          if (copyable[0]) {
            const priorResponses = await getApplicationResponsesForCopy(
              supabase,
              copyable[0].id,
              user.id,
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

      if (result.action === "redirect_schedule_tour") {
        router.replace(`/school/${schoolSlug}/apply/schedule-tour`);
        return;
      }

      if (result.action === "redirect_teacher_portal") {
        if (await attemptPostSignInRedirect(router, schoolSlug, "session_restored")) {
          return;
        }
        router.replace(`/school/${schoolSlug}/teacher`);
        return;
      }

      if (result.applicationId) {
        await resumeWithApplication(result.applicationId);
      }
    },
    [resumeWithApplication, router, schoolSlug],
  );

  useEffect(() => {
    if (serverAuthState === "unauthenticated") {
      return;
    }

    let cancelled = false;

    async function checkSession() {
      if (serverAuthState !== "authenticated") {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (!session) {
          setPhase("auth");
          return;
        }
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
    router,
    schoolSlug,
    serverAuthState,
    supabase.auth,
  ]);

  useEffect(() => {
    if (!paymentReturnPending || !applicationId) return;

    const scope = `application:${applicationId}`;
    if (hasPaymentPollStarted(scope)) {
      queueMicrotask(() => setPaymentReturnPending(false));
      return;
    }

    let cancelled = false;
    let attempts = 0;

    markPaymentPollStarted(scope);
    clearPaymentReturnQuery(router, pathname);

    const poll = async () => {
      while (!cancelled && attempts < PAYMENT_POLL_MAX_ATTEMPTS) {
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

        await sleep(PAYMENT_POLL_INTERVAL_MS);
      }

      if (!cancelled) {
        setPaymentReturnPending(false);
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [applicationId, paymentReturnPending, pathname, router, supabase]);

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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const sourceResponses = await getApplicationResponsesForCopy(
      supabase,
      sourceApplicationId,
      user.id,
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

  const embeddedLoader = (message: string) => (
    <div className="flex min-h-dvh items-center justify-center">
      <ApplyAuthShellLoader message={message} C={C} />
    </div>
  );

  if (phase === "checking_session" || phase === "loading_draft") {
    const loader = (
      <ApplyAuthShellLoader
        message={
          phase === "checking_session"
            ? "Checking your session…"
            : "Loading your application…"
        }
        C={C}
      />
    );

    if (shellLayout === "embedded") {
      return embeddedLoader(
        phase === "checking_session"
          ? "Checking your session…"
          : "Loading your application…",
      );
    }

    return (
      <ApplyAuthShell branding={branding} schoolName={schoolName} title={title}>
        {loader}
      </ApplyAuthShell>
    );
  }

  if (phase === "error") {
    const errorContent = (
      <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
        {error ?? "Something went wrong. Please try again."}
      </p>
    );

    if (shellLayout === "embedded") {
      return (
        <div
          className="flex min-h-dvh flex-col items-center justify-center px-6 py-12"
          style={{ backgroundColor: branding.colors.bg, color: C.textPrimary }}
        >
          <h2
            className="text-center text-xl font-semibold"
            style={{ color: C.accentDark }}
          >
            Unable to open your application
          </h2>
          {errorContent}
        </div>
      );
    }

    return (
      <ApplyAuthShell
        branding={branding}
        schoolName={schoolName}
        title="Unable to open your application"
      >
        {errorContent}
      </ApplyAuthShell>
    );
  }

  if (phase === "form" && applicationId && (draft || submitted)) {
    return (
      <>
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
            helpButton={{
              organizationId,
              userEmail,
              currentPath: pathname,
              submitEndpoint: "/api/admissions/support-requests",
            }}
          />
        </ApplicationFormPageShell>
        <PortalHelpFab
          C={C}
          organizationId={organizationId}
          userEmail={userEmail}
          currentPath={pathname}
          submitEndpoint="/api/admissions/support-requests"
          className="max-sm:hidden"
        />
      </>
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
      tourEntryOption={tourEntryOption}
      onBootstrapped={handleBootstrapped}
      onRedirectApplyDashboard={() => {
        router.replace(`/school/${schoolSlug}/apply`);
      }}
      onRedirectScheduleTour={() => {
        router.replace(`/school/${schoolSlug}/apply/schedule-tour`);
      }}
      onComplete={() => {
        // Form visibility is driven by handleBootstrapResult after bootstrap.
      }}
    />
  );
}
