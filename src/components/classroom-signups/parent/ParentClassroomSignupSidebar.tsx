"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import ParentClassroomSignupResponseForm from "./ParentClassroomSignupResponseForm";
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ParentClassroomSignupStudentOption,
} from "@/lib/classroom-signups/types";
import {
  SIGNUP_TYPE_LABELS,
} from "@/lib/classroom-signups/types";
import { formatSignupDeadline } from "@/lib/classroom-signups/utils";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentClassroomSignupSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  signupId: string | null;
  signup: ClassroomSignup | null;
  initialFamilyResponse: ClassroomSignupResponse | null;
  studentOptions: ParentClassroomSignupStudentOption[];
  readOnly?: boolean;
  onClose: () => void;
  onSubmitted: (
    signupId: string,
    response: ClassroomSignupResponse,
  ) => void;
  onWithdrawn: (signupId: string) => void;
};

export default function ParentClassroomSignupSidebar({
  theme,
  open,
  organizationId,
  signupId,
  signup,
  initialFamilyResponse,
  studentOptions,
  readOnly = false,
  onClose,
  onSubmitted,
  onWithdrawn,
}: ParentClassroomSignupSidebarProps) {
  const [responses, setResponses] = useState<ClassroomSignupResponse[]>([]);
  const [response, setResponse] = useState<ClassroomSignupResponse | null>(
    initialFamilyResponse,
  );
  const [detailStudentOptions, setDetailStudentOptions] =
    useState(studentOptions);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !signupId) return;

    const activeSignupId = signupId;
    let cancelled = false;

    async function loadDetail() {
      setIsLoadingDetail(true);
      setDetailError(null);
      setResponses([]);
      setResponse(initialFamilyResponse);

      let fetchResponse: Response | undefined;
      try {
        const query = new URLSearchParams({ organizationId }).toString();
        fetchResponse = await fetch(
          `/api/parent-portal/classroom-signups/${encodeURIComponent(activeSignupId)}?${query}`,
        );
        const payload = (await fetchResponse.json()) as {
          responses?: ClassroomSignupResponse[];
          familyResponse?: ClassroomSignupResponse | null;
          studentOptions?: ParentClassroomSignupStudentOption[];
          error?: string;
        };

        if (!fetchResponse.ok) {
          throw new Error(payload.error ?? "Failed to load signup.");
        }

        if (cancelled) return;

        setResponses(payload.responses ?? []);
        setResponse(payload.familyResponse ?? initialFamilyResponse);
        if (payload.studentOptions?.length) {
          setDetailStudentOptions(payload.studentOptions);
        } else {
          setDetailStudentOptions(studentOptions);
        }
      } catch (error) {
        if (cancelled) return;
        setDetailError(
          error instanceof Error ? error.message : "Failed to load signup.",
        );
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "classroom_signups.detail",
            error: "",
          },
          error,
          fetchResponse?.status,
        );
      } finally {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [initialFamilyResponse, open, organizationId, signupId, studentOptions]);

  const hasConfirmedResponse = response?.status === "confirmed";
  const canViewClosedSignup =
    signup?.status === "closed" && hasConfirmedResponse;
  const canRespond = signup?.status === "open";
  const canShowContent = signup && (canRespond || canViewClosedSignup);
  const formReadOnly = readOnly || signup?.status === "closed";
  const deadline = signup ? formatSignupDeadline(signup.responseDeadline) : null;

  return (
    <AnimatePresence>
      {open && signup ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="parent-classroom-signup-sidebar"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="parent-classroom-signup-sidebar-title"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,32rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: theme.line, backgroundColor: theme.paper }}
            >
              <div className="min-w-0">
                <p
                  className="m-0 text-xs font-medium"
                  style={{ color: theme.muted }}
                >
                  Help in the classroom
                </p>
                <h2
                  id="parent-classroom-signup-sidebar-title"
                  className="mt-1 truncate text-base font-semibold"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  {signup.title}
                </h2>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                  From {signup.teacherName}
                  {signup.classroomName ? ` · ${signup.classroomName}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 border-0 bg-transparent p-0"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoadingDetail ? (
                <div
                  className="flex items-center justify-center gap-2 py-12 text-sm"
                  style={{ color: theme.muted }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading signup…
                </div>
              ) : detailError ? (
                <p className="text-sm" style={{ color: theme.ink }}>
                  {detailError}
                </p>
              ) : !canShowContent ? (
                <p className="text-sm" style={{ color: theme.ink }}>
                  This signup is no longer accepting responses.
                </p>
              ) : (
                <>
                  <div
                    className="mb-4 flex flex-wrap gap-x-3 gap-y-1 text-xs"
                    style={{ color: theme.muted }}
                  >
                    <span>{SIGNUP_TYPE_LABELS[signup.signupType]}</span>
                    {deadline ? <span>Sign up by {deadline}</span> : null}
                  </div>

                  <p
                    className="mb-5 text-sm leading-relaxed"
                    style={{ color: "#5D6D73" }}
                  >
                    {signup.description}
                  </p>

                  <div
                    className="mb-5 border-t pt-5"
                    style={{ borderColor: theme.line }}
                  >
                    <h3
                      className="mb-3 text-sm font-semibold"
                      style={{ color: theme.ink }}
                    >
                      {formReadOnly ? "Your signup" : "Your response"}
                    </h3>
                    <ParentClassroomSignupResponseForm
                      organizationId={organizationId}
                      signup={signup}
                      existingResponse={response}
                      allResponses={responses}
                      studentOptions={detailStudentOptions}
                      readOnly={formReadOnly}
                      onSubmitted={(nextResponse) => {
                        const nextResponses = [
                          ...responses.filter(
                            (entry) => entry.familyId !== nextResponse.familyId,
                          ),
                          nextResponse,
                        ];
                        setResponse(nextResponse);
                        setResponses(nextResponses);
                        onSubmitted(signup.id, nextResponse);
                      }}
                      onWithdrawn={() => {
                        const familyId = response?.familyId;
                        if (!familyId) return;
                        const nextResponses = responses.filter(
                          (entry) => entry.familyId !== familyId,
                        );
                        setResponse(null);
                        setResponses(nextResponses);
                        onWithdrawn(signup.id);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
