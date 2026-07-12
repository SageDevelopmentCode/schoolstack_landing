"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CheckCircle, ClipboardCheck, Clock } from "lucide-react";
import type {
  FamilyChildOverview,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import { applicationStatusBadgeStyle } from "@/lib/admissions/application-status-ui";
import type { ParentQuickAction } from "@/lib/organization-settings/parent-home";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentHomePageProps = {
  branding: OrganizationBranding;
  schoolSlug: string;
  userProfile: FamilyUserProfile;
  children: FamilyChildOverview[];
  quickActions: ParentQuickAction[];
};

const QUICK_ACTION_STYLES: Record<
  string,
  { iconBg: string; iconColor: string }
> = {
  "dollar-sign": { iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  "message-square": { iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  "calendar-days": { iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  "clipboard-list": { iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  megaphone: { iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  users: { iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  heart: { iconBg: "bg-pink-100", iconColor: "text-pink-600" },
};

function studentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? displayName;
}

function greetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function quickActionStyle(iconSlug: string) {
  return (
    QUICK_ACTION_STYLES[iconSlug] ?? {
      iconBg: "bg-gray-100",
      iconColor: "",
    }
  );
}

export default function ParentHomePage({
  branding,
  schoolSlug,
  userProfile,
  children,
  quickActions,
}: ParentHomePageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const name = firstName(userProfile.displayName);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
      <div
        className="relative h-40 overflow-hidden rounded-2xl shadow-sm sm:h-48"
        style={{
          background: `linear-gradient(135deg, ${C.accentDark} 0%, ${C.accent} 55%, ${C.accentMid} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-6">
          <p className="text-sm text-white/75">{greetingPrefix()},</p>
          <p className="text-3xl font-bold leading-tight text-white">{name}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_340px] lg:items-stretch">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              My Children
            </h2>
            {children.length === 0 ? (
              <div
                className="rounded-2xl border px-6 py-10 text-center"
                style={{ borderColor: C.border, backgroundColor: C.elevated }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: C.textSecondary }}
                >
                  We don&apos;t have any student records from your applications
                  yet. Visit your{" "}
                  <Link
                    href={`/school/${schoolSlug}/apply`}
                    className="font-medium underline underline-offset-2"
                    style={{ color: C.accent }}
                  >
                    application dashboard
                  </Link>{" "}
                  to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {children.map((child) => {
                  const badgeStyle = applicationStatusBadgeStyle(child.status, C);
                  const childFirstName = child.studentName.split(" ")[0];

                  return (
                    <div
                      key={child.applicationId}
                      className="flex flex-col items-center gap-3 rounded-2xl border p-4"
                      style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
                    >
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-semibold"
                        style={{
                          backgroundColor: C.accentGlow,
                          color: C.accentDark,
                        }}
                      >
                        {studentInitials(child.studentName)}
                      </div>
                      <div className="w-full min-w-0 text-center">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {childFirstName}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {child.grade ?? "—"}
                        </p>
                        <span
                          className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: badgeStyle.backgroundColor,
                            color: badgeStyle.color,
                          }}
                        >
                          {child.isEnrolled ? (
                            <CheckCircle className="h-2.5 w-2.5" />
                          ) : (
                            <Clock className="h-2.5 w-2.5" />
                          )}
                          {child.statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {quickActions.length > 0 ? (
            <section>
              <h2 className="mb-3 text-base font-semibold text-gray-800">
                Quick Actions
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action) => {
                  const { iconBg, iconColor } = quickActionStyle(action.iconSlug);
                  const Icon = getFeatureIcon(action.iconSlug);

                  return (
                    <Link
                      key={action.key}
                      href={action.href}
                      className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-gray-50"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
                      >
                        <Icon
                          className={`h-5 w-5 ${iconColor}`}
                          style={iconColor ? undefined : { color: C.accent }}
                          strokeWidth={1.5}
                        />
                      </div>
                      <span className="text-xs font-semibold leading-tight text-gray-700">
                        {action.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <div className="flex flex-col gap-8 lg:sticky lg:top-[65px] lg:self-start">
          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Get started
            </h2>
            <div
              className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3"
              style={{
                backgroundColor: `${C.accent}1a`,
                borderColor: `${C.accent}33`,
              }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${C.accent}26` }}
              >
                <ClipboardCheck
                  className="h-4 w-4"
                  style={{ color: C.accent }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold leading-snug"
                  style={{ color: C.accent }}
                >
                  Complete your onboarding
                </p>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: `${C.accent}b3` }}
                >
                  Finish setting up your account
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 flex-shrink-0"
                style={{ color: `${C.accent}99` }}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              Upcoming events
            </h2>
            <div
              className="rounded-2xl border px-4 py-6 text-center"
              style={{ borderColor: C.border, backgroundColor: C.elevated }}
            >
              <p className="text-sm" style={{ color: C.textSecondary }}>
                No events for now
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
