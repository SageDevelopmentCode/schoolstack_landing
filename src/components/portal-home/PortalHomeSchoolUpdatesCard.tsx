"use client";

import { MessageSquare } from "lucide-react";
import BulletinMiniFeed from "@/components/bulletin/BulletinMiniFeed";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type PortalHomeSchoolUpdatesCardProps = {
  theme: ParentThemeTokens;
  bulletinEnabled: boolean;
  bulletinPosts: BulletinPost[];
  messagesHref?: string;
  messagesPromo?: {
    title: string;
    subtitle: string;
  };
};

export default function PortalHomeSchoolUpdatesCard({
  theme,
  bulletinEnabled,
  bulletinPosts,
  messagesHref,
  messagesPromo,
}: PortalHomeSchoolUpdatesCardProps) {
  const showMessagesLink = Boolean(messagesHref);
  const messagesOnly = !bulletinEnabled && showMessagesLink;

  return (
    <ParentCard theme={theme} variant="announcement" className="flex h-full flex-col">
      <ParentSectionKicker theme={theme}>School updates</ParentSectionKicker>
      <h3
        className="mb-4 text-base font-semibold"
        style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
      >
        {bulletinEnabled ? "From your school" : "Messages"}
      </h3>
      <div className="flex flex-1 flex-col">
        {bulletinEnabled ? (
          <BulletinMiniFeed theme={theme} posts={bulletinPosts} />
        ) : null}
        {showMessagesLink ? (
          <div className={bulletinEnabled ? "mt-4 border-t border-[#E7ECE7] pt-4" : ""}>
            {messagesOnly && messagesPromo ? (
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.infoBg }}
                >
                  <MessageSquare className="h-4 w-4" style={{ color: theme.info }} />
                </div>
                <div>
                  <strong className="block text-sm" style={{ color: theme.ink }}>
                    {messagesPromo.title}
                  </strong>
                  <p className="m-0 text-xs" style={{ color: "#78858A" }}>
                    {messagesPromo.subtitle}
                  </p>
                </div>
              </div>
            ) : null}
            <div className={messagesOnly && messagesPromo ? "mt-4" : ""}>
              <ParentTextLink theme={theme} href={messagesHref}>
                Open messages
              </ParentTextLink>
            </div>
          </div>
        ) : !bulletinEnabled ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            School announcements and updates will appear here when available.
          </p>
        ) : null}
      </div>
    </ParentCard>
  );
}
