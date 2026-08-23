"use client";

import Link from "next/link";
import { Eye, X } from "lucide-react";
import type { StaffUserProfile } from "@/lib/staff/teacher-portal-access";

type StaffPreviewShellProps = {
  schoolName: string;
  userProfile: StaffUserProfile;
  children: React.ReactNode;
};

export default function StaffPreviewShell({
  schoolName,
  userProfile,
  children,
}: StaffPreviewShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <div
        className="shrink-0 border-b px-4 py-3 sm:px-6"
        style={{
          backgroundColor: "#F5F0FF",
          borderColor: "#DDD6FE",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-violet-900">
                Previewing teacher portal as {userProfile.displayName}
                <span className="ml-2 rounded-full bg-violet-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                  Read-only
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-violet-800/80">
                {userProfile.email || "No email on file"} · {schoolName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/admin/organizations"
              className="inline-flex items-center gap-1.5 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-xs font-medium text-violet-900 transition hover:bg-violet-50"
            >
              <X className="h-3 w-3" />
              Back to organizations
            </Link>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
