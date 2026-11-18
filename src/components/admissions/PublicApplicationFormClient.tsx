"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ApplyFormRouteLoading, {
  ApplyFormRouteLoadingBrandingProvider,
} from "@/components/admissions/ApplyFormRouteLoading";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import PortalHelpFab from "@/components/school/shared/PortalHelpFab";
import ApplyGardenShell from "@/components/admissions/garden/ApplyGardenShell";
import { GSkeleton } from "@/components/school-parent/garden/ui";
import { Loader2 } from "lucide-react";
import { attemptPostSignInRedirect } from "@/lib/auth/resolve-post-sign-in-redirect";
import type { BootstrapApplicantResult } from "@/lib/admissions/applicant-bootstrap";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import {
  familyHasOtherApplications,
  loadApplicationDraft,
  saveApplicationDraft,
  type ApplicationDraft,
  type SaveApplicationDraftInput,
} from "@/lib/admissions/application-draft";
import type { CopyableApplication } from "@/lib/admissions/application-copy";

type CopyableApplicationOption = Pick<
  CopyableApplication,
  "id" | "submittedAt" | "label"
>;
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
import {
  buildParentThemeTokens,
  parentThemeToGardenCompat,
} from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ApplyAuthEntryOption } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";
import { reportApplyOperationalError } from "@/lib/operational-errors-client";

const ApplicationFormExperience = dynamic(
  () => import("@/components/admissions/ApplicationFormExperience"),
);

const ApplicationAuthGate = dynamic(
  () => import("@/components/admissions/ApplicationAuthGate"),
  { loading: () => <ApplyFormRouteLoading label="Loading sign in" /> },
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
  /** Kept for the route's API; the Garden form owns its layout in both cases. */
  shellLayout?: "standalone" | "embedded";
  serverAuthState?: ServerAuthState;
  initialApplicationId?: string | null;
  tourEntryOption?: ApplyAuthEntryOption | null;
};

type ClientPhase = "checking_session" | "auth" | "loading_draft" | "form" | "error";

function getInitialPhase(
  serverAuthState?: ServerAuthState,
  initialApplicationId?: string | null,
): ClientPhase {
  if (serverAuthState === "unauthenticated") {
    return "auth";
  }

  if (initialApplicationId) {
    return "loading_draft";
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
    throw Object.assign(
      new Error(payload.error ?? "Failed to resume your application."),
      { status: response.status },
    );
  }

  return payload;
}

export default function PublicApplicationFormClient(
  props: PublicApplicationFormClientProps,
) {
  return (
    <ApplyFormRouteLoadingBrandingProvider branding={props.branding}>
      <PublicApplicationFormClientContent {...props} />
    </ApplyFormRouteLoadingBrandingProvider>
  );
}

function PublicApplicationFormClientContent({
  branding,
  schoolName,
  schoolSlug,
  title,
  intro,
  schema,
  feeConfig,
  organizationId,
  formVersionId,
  serverAuthState,
  initialApplicationId = null,
  tourEntryOption = null,
}: PublicApplicationFormClientProps) {
  const gardenTheme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const C = useMemo(() => parentThemeToGardenCompat(gardenTheme), [gardenTheme]);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const forceNew = searchParams.get("new") === "1";

  const [phase, setPhase] = useState<ClientPhase>(() =>
    getInitialPhase(serverAuthState, initialApplicationId),
  );
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentReturnPending, setPaymentReturnPending] = useState(() =>
    readPaymentReturnPending(searchParams),
  );
  const [submitted, setSubmitted] = useState(false);
  const [copyableApplications, setCopyableApplications] = useState<
    CopyableApplicationOption[]
  >([]);
  const copyableResponsesRef = useRef(
    new Map<string, Record<string, string>>(),
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

      let draftPromise: Promise<ApplicationDraft> | null = null;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setPhase("auth");
          return;
        }

        setUserEmail(user.email?.trim() || null);

        draftPromise = loadApplicationDraft(supabase, nextApplicationId);
        const familyIds = await getFamilyIdsForUser(
          supabase,
          user.id,
          organizationId,
        );
        const [loaded, otherApplications, copyable] = await Promise.all([
          draftPromise,
          familyHasOtherApplications(
            supabase,
            organizationId,
            user.id,
            nextApplicationId,
            familyIds,
          ),
          listCopyableApplications(
            supabase,
            organizationId,
            formVersionId,
            user.id,
            nextApplicationId,
            familyIds,
          ),
        ]);
        setHasOtherApplications(otherApplications);
        setDraft(loaded);
        if (loaded.status !== "draft") {
          setSubmitted(true);
        } else {
          copyableResponsesRef.current = new Map(
            copyable.map((application) => [application.id, application.responses]),
          );
          setCopyableApplications(
            copyable.map(({ id, submittedAt, label }) => ({
              id,
              submittedAt,
              label,
            })),
          );
          const newest = copyable[0];
          setPriorFieldValues(
            newest
              ? pickResponsesForCopy(newest.responses, schema)
              : {},
          );
        }
        setPhase("form");
      } catch (err) {
        void draftPromise?.catch(() => undefined);
        if (
          err instanceof Error &&
          err.message.includes("already been submitted")
        ) {
          setSubmitted(true);
          setPhase("form");
          return;
        }

        reportApplyOperationalError(organizationId, "apply.draft.resume", err, {
          entityType: "application",
          entityId: nextApplicationId,
        });
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
      if (initialApplicationId) {
        if (cancelled) return;
        await resumeWithApplication(initialApplicationId);
        return;
      }

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
        reportApplyOperationalError(organizationId, "apply.applicant_bootstrap", err, {
          responseStatus:
            err && typeof err === "object" && "status" in err
              ? Number((err as { status: number }).status)
              : undefined,
        });
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setError(
          err instanceof Error
            ? err.message
            : "Failed to resume your application.",
        );
        setPhase(session ? "error" : "auth");
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
    initialApplicationId,
    organizationId,
    resumeWithApplication,
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
          // Keep polling briefly while webhook processes. intentionally silent
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

    const cachedResponses = copyableResponsesRef.current.get(sourceApplicationId);
    let sourceResponses = cachedResponses;
    if (!sourceResponses) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      sourceResponses = await getApplicationResponsesForCopy(
        supabase,
        sourceApplicationId,
        user.id,
      );
    }
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
    const message =
      phase === "checking_session" ? "Checking your session…" : "Loading your application…";
    return (
      <ApplyGardenShell branding={branding} schoolName={schoolName}>
        <div role="status" aria-live="polite" className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-8">
          <div className="flex flex-col gap-3">
            <GSkeleton className="h-3 w-40" />
            <GSkeleton className="h-10 w-4/5" />
            <GSkeleton className="h-4 w-full" />
            <GSkeleton className="h-4 w-2/3" />
          </div>
          <div className="rounded-[28px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-5 py-6 shadow-[0_6px_0_0_rgba(43,36,29,0.07)] sm:px-8 sm:py-8">
            <p className="m-0 flex items-center gap-2 text-[13.5px] font-extrabold text-[var(--sf-soft)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--sf-clay)]" aria-hidden />
              {message}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <GSkeleton className="h-11" />
              <GSkeleton className="h-11" />
              <GSkeleton className="h-11 sm:col-span-2" />
            </div>
          </div>
        </div>
      </ApplyGardenShell>
    );
  }

  if (phase === "error") {
    return (
      <ApplyGardenShell branding={branding} schoolName={schoolName} centered>
        <div
          role="alert"
          className="w-full max-w-[520px] rounded-[28px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-6 py-8 text-center shadow-[0_6px_0_0_rgba(43,36,29,0.07)] sm:px-8"
        >
          <h1 className="sf-display m-0 text-[1.6rem] leading-[1.1] text-[var(--sf-ink)]">
            Unable to open your application
          </h1>
          <p className="m-0 mt-3 text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
            {error ?? "Something went wrong. Please try again."}
          </p>
        </div>
      </ApplyGardenShell>
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
          theme={gardenTheme}
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
