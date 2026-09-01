"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDatePill from "@/components/school-parent/ui/ParentDatePill";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { SignupTypeChip } from "@/components/classroom-signups/shared/SignupTypeChip";
import ParentClassroomSignupResponseForm from "./ParentClassroomSignupResponseForm";
import {
  getMockResponsesForSignup,
  getMockSignupById,
} from "@/lib/classroom-signups/mock-data";
import type { ClassroomSignupResponse } from "@/lib/classroom-signups/types";
import { formatSignupDeadline } from "@/lib/classroom-signups/utils";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";

type ParentClassroomSignupDetailPageProps = {
  slug: string;
  signupId: string;
  studentOptions?: { id: string; name: string }[];
  previewBasePath?: string;
  readOnly?: boolean;
};

const DEFAULT_STUDENT_OPTIONS = [
  { id: "student-1", name: "Mia Chen" },
  { id: "student-2", name: "Leo Chen" },
];

export default function ParentClassroomSignupDetailPage({
  slug,
  signupId,
  studentOptions = DEFAULT_STUDENT_OPTIONS,
  previewBasePath,
  readOnly = false,
}: ParentClassroomSignupDetailPageProps) {
  const { theme } = useParentTheme();
  const signup = getMockSignupById(signupId);

  const initialResponse = useMemo(() => {
    const responses = getMockResponsesForSignup(signupId);
    return responses.find((r) => r.status === "confirmed") ?? null;
  }, [signupId]);

  const [response, setResponse] = useState<ClassroomSignupResponse | null>(
    initialResponse,
  );

  const homeHref = previewBasePath
    ? `${previewBasePath}/parent/portal`
    : schoolParentPath(slug, "portal");

  if (!signup || signup.status !== "open") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p style={{ color: theme.ink }}>
          {signup ? "This signup is no longer accepting responses." : "Signup not found."}
        </p>
        <Link
          href={homeHref}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: theme.primary }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    );
  }

  const deadline = formatSignupDeadline(signup.responseDeadline);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href={homeHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: theme.primary }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <ParentSectionKicker theme={theme}>Help in the classroom</ParentSectionKicker>
      <ParentDisplayHeading theme={theme} className="mb-2">
        {signup.title}
      </ParentDisplayHeading>
      <p className="mb-4 text-sm" style={{ color: "#76828A" }}>
        From {signup.teacherName}
        {signup.classroomName ? ` · ${signup.classroomName}` : ""}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SignupTypeChip theme={theme} type={signup.signupType} />
        {deadline ? (
          <ParentDatePill theme={theme} label={`Sign up by ${deadline}`} />
        ) : null}
      </div>

      <ParentCard theme={theme} className="mb-6">
        <p className="text-sm leading-relaxed" style={{ color: "#5D6D73" }}>
          {signup.description}
        </p>
      </ParentCard>

      <ParentCard theme={theme}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: theme.ink }}>
          Your response
        </h3>
        <ParentClassroomSignupResponseForm
          signup={signup}
          existingResponse={response}
          studentOptions={studentOptions}
          readOnly={readOnly}
          onSubmitted={setResponse}
          onWithdrawn={() => setResponse(null)}
        />
      </ParentCard>
    </div>
  );
}
