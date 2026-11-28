"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import BlogPostWideDemo from "@/components/blog/BlogPostWideDemo";
import BlogProductDemoFrame from "@/components/blog/BlogProductDemoFrame";
import { BLOG_DEMOS, type BlogDemoId } from "@/lib/marketing/blog-demos";

/*
 * One loader per portal, so a post downloads only the portals it shows.
 * The demos run on static Luff Learning demo data: no login and no network calls.
 */
const BlogParentDemo = dynamic(() => import("./live/BlogParentDemo"), { ssr: false });
const BlogTeacherDemo = dynamic(() => import("./live/BlogTeacherDemo"), { ssr: false });
const BlogAdminDemo = dynamic(() => import("./live/BlogAdminDemo"), { ssr: false });
const BlogEnrollmentDemo = dynamic(() => import("./live/BlogEnrollmentDemo"), { ssr: false });
const BlogWebsiteDemo = dynamic(() => import("./live/BlogWebsiteDemo"), { ssr: false });
const DemoAdminNewsletterEditorPage = dynamic(() => import("@/components/demo/shared/DemoAdminNewsletterEditorPage"), { ssr: false });

type FrameSettings = { contentHeight: number; cropZoom: number; mobileCropOriginX: number; fitHeight: boolean };

const DEFAULT_FRAME: FrameSettings = { contentHeight: 920, cropZoom: 0.92, mobileCropOriginX: 0, fitHeight: true };

/** Per-demo frame tweaks; anything left out uses DEFAULT_FRAME. */
const FRAME_OVERRIDES: Partial<Record<BlogDemoId, Partial<FrameSettings>>> = {};

function renderDemo(id: BlogDemoId, contentHeight: number): ReactNode {
  switch (id) {
    case "website":
      return <BlogWebsiteDemo toForm={false} contentHeight={contentHeight} />;
    case "website-apply":
      return <BlogWebsiteDemo toForm contentHeight={contentHeight} />;
    case "admin-dashboard":
      return <BlogAdminDemo view="dashboard" contentHeight={contentHeight} />;
    case "admissions-pipeline":
      return <BlogAdminDemo view="admissions" contentHeight={contentHeight} />;
    case "marketing-automations":
      return <BlogAdminDemo view="marketing" contentHeight={contentHeight} />;
    case "newsletter-editor":
      return <DemoAdminNewsletterEditorPage variant="editor" />;
    case "newsletter-teacher-updates":
      return <DemoAdminNewsletterEditorPage variant="teacherUpdates" />;
    case "newsletter-gallery":
      return <DemoAdminNewsletterEditorPage variant="photoGallery" />;
    case "parent-home":
      return <BlogParentDemo view="home" contentHeight={contentHeight} />;
    case "parent-billing":
      return <BlogParentDemo view="billing" contentHeight={contentHeight} />;
    case "parent-messages":
      return <BlogParentDemo view="messages" contentHeight={contentHeight} />;
    case "parent-feed":
      return <BlogParentDemo view="feed" contentHeight={contentHeight} />;
    case "parent-forms":
      return <BlogParentDemo view="forms" contentHeight={contentHeight} />;
    case "parent-calendar":
      return <BlogParentDemo view="calendar" contentHeight={contentHeight} />;
    case "enrollment-checklist":
      return <BlogEnrollmentDemo view="checklist" contentHeight={contentHeight} />;
    case "parent-apply-submitted":
      return <BlogEnrollmentDemo view="apply-submitted" contentHeight={contentHeight} />;
    case "attendance-roll-call":
      return <BlogTeacherDemo view="attendance" contentHeight={contentHeight} />;
    case "staff-hours":
      return <BlogTeacherDemo view="hours" contentHeight={contentHeight} />;
    case "teacher-forms":
      return <BlogTeacherDemo view="forms" contentHeight={contentHeight} />;
  }
}

/**
 * A live product demo inside a blog post, in the laptop frame, mounted when it scrolls into view.
 * `<BlogDemo id="parent-billing" caption="What families see when tuition is due" />`
 */
export default function BlogDemo({ id, caption, featureLink = true }: { id: BlogDemoId; caption?: string; featureLink?: boolean }) {
  const frame = { ...DEFAULT_FRAME, ...FRAME_OVERRIDES[id] };
  const { feature } = BLOG_DEMOS[id];
  return (
    <BlogPostWideDemo
      caption={caption}
      footer={
        featureLink ? (
          <Link
            href={`/features/${feature.slug}`}
            className="text-[14px] font-bold text-[var(--sf-forest)] underline decoration-2 underline-offset-4 hover:text-[var(--sf-ink)]"
          >
            See how {feature.name} works →
          </Link>
        ) : null
      }
    >
      <BlogProductDemoFrame
        contentHeight={frame.contentHeight}
        cropZoom={frame.cropZoom}
        mobileCropOriginX={frame.mobileCropOriginX}
        fitHeight={frame.fitHeight}
      >
        {renderDemo(id, frame.contentHeight)}
      </BlogProductDemoFrame>
    </BlogPostWideDemo>
  );
}
