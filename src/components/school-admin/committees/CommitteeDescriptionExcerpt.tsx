"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import { getCommitteeDescriptionExcerpt } from "@/lib/committees/description-excerpt";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeDescriptionExcerptProps = {
  theme: ParentThemeTokens;
  committeeName: string;
  description: string;
  leaderLine?: string | null;
  className?: string;
};

export default function CommitteeDescriptionExcerpt({
  theme,
  committeeName,
  description,
  leaderLine = null,
  className = "",
}: CommitteeDescriptionExcerptProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { excerpt, isTruncated } = getCommitteeDescriptionExcerpt(description);

  if (!excerpt) {
    return leaderLine ? (
      <p className={`text-[12px] ${className}`} style={{ color: theme.muted }}>
        {leaderLine}
      </p>
    ) : null;
  }

  return (
    <>
      <div className={className}>
        <p className="text-[13px] leading-relaxed" style={{ color: theme.muted }}>
          {excerpt}
        </p>
        {isTruncated ? (
          <AdminTextLink
            theme={theme}
            className="mt-1.5"
            onClick={() => setShowFullDescription(true)}
          >
            Read more
          </AdminTextLink>
        ) : null}
        {leaderLine ? (
          <p className="mt-1 text-[12px]" style={{ color: theme.muted }}>
            {leaderLine}
          </p>
        ) : null}
      </div>

      <AnimatePresence>
        {showFullDescription ? (
          <CommitteeModalShell
            theme={theme}
            title={committeeName}
            kicker="About this committee"
            onClose={() => setShowFullDescription(false)}
            showCloseButton
            maxWidth="md"
          >
            <p className="whitespace-pre-line text-[13px] leading-relaxed" style={{ color: theme.muted }}>
              {description.trim()}
            </p>
            {leaderLine ? (
              <p className="mt-3 text-xs" style={{ color: theme.muted }}>
                {leaderLine}
              </p>
            ) : null}
          </CommitteeModalShell>
        ) : null}
      </AnimatePresence>
    </>
  );
}
