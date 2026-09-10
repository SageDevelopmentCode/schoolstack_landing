"use client";

import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import BulletinAllPostsDialog from "@/components/bulletin/BulletinAllPostsDialog";
import BulletinFeedItem from "@/components/bulletin/BulletinFeedItem";
import BulletinPostDetailSidebar from "@/components/bulletin/BulletinPostDetailSidebar";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const RAIL_VISIBLE_COUNT = 5;

function BulletinRailEmptyState({
  theme,
  title,
  subtitle,
}: {
  theme: ParentThemeTokens;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-lg border border-dashed px-4 py-5"
      style={{ borderColor: theme.line }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.infoBg }}
      >
        <Megaphone className="h-4 w-4" style={{ color: theme.info }} />
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: theme.ink }}>
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.muted }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

type PortalHomeSchoolUpdatesPanelProps = {
  theme: ParentThemeTokens;
  bulletinEnabled: boolean;
  bulletinPosts: BulletinPost[];
};

export default function PortalHomeSchoolUpdatesPanel({
  theme,
  bulletinEnabled,
  bulletinPosts,
}: PortalHomeSchoolUpdatesPanelProps) {
  const [selectedPost, setSelectedPost] = useState<BulletinPost | null>(null);
  const [allPostsOpen, setAllPostsOpen] = useState(false);

  const visiblePosts = useMemo(
    () => bulletinPosts.slice(0, RAIL_VISIBLE_COUNT),
    [bulletinPosts],
  );
  const overflowCount = bulletinPosts.length - visiblePosts.length;

  return (
    <>
      <div
        className="relative flex h-full min-h-full flex-col px-5 py-6 sm:px-6 sm:py-8 lg:rounded-none lg:border-0 lg:px-6 lg:shadow-none"
        style={{
          background: `linear-gradient(135deg, ${theme.infoBg}, ${theme.white})`,
          borderColor: theme.line,
        }}
      >
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 w-1"
          style={{ backgroundColor: theme.info }}
        />
        <ParentDisplayHeading theme={theme} as="h3" size="section" className="mb-4">
          School Bulletin
        </ParentDisplayHeading>
        <div className="flex flex-1 flex-col">
          {bulletinEnabled ? (
            bulletinPosts.length > 0 ? (
              <>
                <div className="space-y-2.5">
                  {visiblePosts.map((post) => (
                    <BulletinFeedItem
                      key={post.id}
                      theme={theme}
                      post={post}
                      onOpenDetail={() => setSelectedPost(post)}
                    />
                  ))}
                </div>
                {overflowCount > 0 ? (
                  <div className="mt-4">
                    <ParentTextLink theme={theme} onClick={() => setAllPostsOpen(true)}>
                      View all (+{overflowCount} more)
                    </ParentTextLink>
                  </div>
                ) : null}
              </>
            ) : (
              <BulletinRailEmptyState
                theme={theme}
                title="No announcements right now"
                subtitle="New updates from your school will show up here when they're posted."
              />
            )
          ) : (
            <BulletinRailEmptyState
              theme={theme}
              title="No bulletin yet"
              subtitle="Your school hasn't turned on announcements here. Check back later."
            />
          )}
        </div>
      </div>

      <BulletinAllPostsDialog
        theme={theme}
        posts={bulletinPosts}
        open={allPostsOpen}
        onClose={() => setAllPostsOpen(false)}
        onOpenPost={setSelectedPost}
      />

      <BulletinPostDetailSidebar
        theme={theme}
        post={selectedPost}
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
}
