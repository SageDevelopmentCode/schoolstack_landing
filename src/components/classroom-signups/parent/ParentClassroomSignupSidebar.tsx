"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentClassroomSignupSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  signup: ClassroomSignup | null;
  initialResponses: ClassroomSignupResponse[];
  initialFamilyResponse: ClassroomSignupResponse | null;
  studentOptions: ParentClassroomSignupStudentOption[];
  readOnly?: boolean;
  onClose: () => void;
  onSubmitted: (
    signupId: string,
    response: ClassroomSignupResponse,
    allResponses: ClassroomSignupResponse[],
  ) => void;
  onWithdrawn: (
    signupId: string,
    familyId: string,
    allResponses: ClassroomSignupResponse[],
  ) => void;
};

export default function ParentClassroomSignupSidebar({
  theme,
  open,
  organizationId,
  signup,
  initialResponses,
  initialFamilyResponse,
  studentOptions,
  readOnly = false,
  onClose,
  onSubmitted,
  onWithdrawn,
}: ParentClassroomSignupSidebarProps) {
  const [responses, setResponses] = useState(initialResponses);
  const [response, setResponse] = useState<ClassroomSignupResponse | null>(
    initialFamilyResponse,
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

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
              {!canShowContent ? (
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
                    studentOptions={studentOptions}
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
                      onSubmitted(signup.id, nextResponse, nextResponses);
                    }}
                    onWithdrawn={() => {
                      const familyId = response?.familyId;
                      if (!familyId) return;
                      const nextResponses = responses.filter(
                        (entry) => entry.familyId !== familyId,
                      );
                      setResponse(null);
                      setResponses(nextResponses);
                      onWithdrawn(signup.id, familyId, nextResponses);
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
