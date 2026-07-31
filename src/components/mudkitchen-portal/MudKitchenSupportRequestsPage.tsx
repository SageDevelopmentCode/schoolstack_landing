"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FadeInView } from "@/components/ui/FadeInView";
import { createClient } from "@/utils/supabase/client";
import PortalPageHero from "@/components/mudkitchen-portal/ui/PortalPageHero";
import PortalSectionHeader from "@/components/mudkitchen-portal/ui/PortalSectionHeader";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";
import MudKitchenSupportRequestForm from "@/components/mudkitchen-portal/MudKitchenSupportRequestForm";
import {
  parseSupportRequestStatus,
  SUPPORT_REQUEST_STATUS_META,
  formatSupportRequestTopic,
  type AdminSupportRequestRow,
} from "@/lib/school-admin/support-request-types";

type MudKitchenSupportRequestsPageProps = {
  organizationId: string;
  initialRequests: AdminSupportRequestRow[];
  userEmail?: string | null;
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MudKitchenSupportRequestsPage({
  organizationId,
  initialRequests,
  userEmail,
}: MudKitchenSupportRequestsPageProps) {
  const T = usePortalTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshRequests = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_support_requests")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setRequests(
      ((data as AdminSupportRequestRow[]) ?? []).map((row) => ({
        ...row,
        status: parseSupportRequestStatus(row.status) ?? "open",
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
        updated_at: row.updated_at ?? row.created_at,
      })) as AdminSupportRequestRow[],
    );
    setLoading(false);
    router.refresh();
  }, [organizationId, router]);

  return (
    <>
      <PortalPageHero
        eyebrow="Support"
        title="Reach the MudKitchen team."
        subtitle="Send a message when something comes up — we'll follow up by email."
      />

      <section className="px-6 pb-10 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <MudKitchenSupportRequestForm
            organizationId={organizationId}
            userEmail={userEmail}
            currentPath={pathname}
            onSubmitted={() => void refreshRequests()}
            defaultExpanded={requests.length === 0}
          />
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-[1100px]">
          <PortalSectionHeader
            eyebrow="History"
            title="Your requests"
            subtitle={
              loading
                ? "Refreshing…"
                : "A record of every message you've sent to our team."
            }
          />

          {loadError ? (
            <p className="font-secondary text-sm" style={{ color: T.clay }} role="alert">
              {loadError}
            </p>
          ) : null}

          {requests.length === 0 ? (
            <FadeInView>
              <div
                className="rounded-2xl border px-6 py-10 text-center"
                style={{ backgroundColor: T.surface, borderColor: T.border }}
              >
                <p
                  className="font-secondary text-[15px] leading-relaxed"
                  style={{ color: T.textSecondary }}
                >
                  No requests yet. Use the form above to reach the MudKitchen team.
                </p>
              </div>
            </FadeInView>
          ) : (
            <div className="relative space-y-5">
              <div
                className="pointer-events-none absolute top-3 bottom-3 hidden sm:block"
                style={{
                  left: "11px",
                  borderLeft: `1px dashed ${T.borderStrong}`,
                }}
                aria-hidden
              />

              {requests.map((request, index) => {
                const statusMeta = SUPPORT_REQUEST_STATUS_META[request.status];

                return (
                  <FadeInView key={request.id} delay={index * 0.05}>
                    <article
                      className="relative rounded-2xl border p-6 sm:ml-8 sm:p-7"
                      style={{
                        backgroundColor: T.surface,
                        borderColor: T.border,
                      }}
                    >
                      <span
                        className="absolute top-7 hidden h-3 w-3 -translate-x-[calc(2rem+5px)] rounded-full sm:block"
                        style={{
                          left: 0,
                          backgroundColor: T.accent,
                          boxShadow: `0 0 0 4px ${T.stepBg}`,
                        }}
                        aria-hidden
                      />

                      <div className="mb-4 flex flex-wrap items-center gap-2.5">
                        <time
                          className="font-secondary text-[13px] font-semibold"
                          style={{ color: T.textPrimary }}
                          dateTime={request.created_at}
                        >
                          {formatTimestamp(request.created_at)}
                        </time>
                        <span
                          className="font-secondary rounded-full px-3 py-1 text-[11px] font-medium"
                          style={{
                            color: T.accentDark,
                            backgroundColor: T.stepBg,
                            border: `1px solid ${T.secondaryBtnBorder}`,
                          }}
                        >
                          {formatSupportRequestTopic(request.topic)}
                        </span>
                        <span
                          className="font-secondary inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                          style={{
                            color: T.textSecondary,
                            backgroundColor: T.pageBg,
                            border: `1px solid ${T.border}`,
                          }}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      <h3
                        className="font-heading text-[1.25rem] font-medium leading-snug sm:text-[1.35rem]"
                        style={{ color: T.textPrimary }}
                      >
                        {request.subject?.trim() ||
                          formatSupportRequestTopic(request.topic)}
                      </h3>

                      <p
                        className="font-secondary mt-3 whitespace-pre-wrap text-[15px] leading-relaxed"
                        style={{ color: T.textSecondary }}
                      >
                        {request.description}
                      </p>
                    </article>
                  </FadeInView>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
