"use client";

import dynamic from "next/dynamic";
import BlogPostWideDemo from "@/components/blog/BlogPostWideDemo";
import BlogProductDemoFrame from "@/components/blog/BlogProductDemoFrame";

const DemoAdminNewsletterEditorPage = dynamic(
  () => import("@/components/demo/shared/DemoAdminNewsletterEditorPage"),
  { ssr: false },
);

export default function NewsletterEditorTeacherUpdatesBlogEmbed() {
  return (
    <BlogPostWideDemo caption="Add each teacher's update to the newsletter">
      <BlogProductDemoFrame contentHeight={920} cropZoom={0.92} mobileCropOriginX={0} fitHeight>
        <DemoAdminNewsletterEditorPage variant="teacherUpdates" />
      </BlogProductDemoFrame>
    </BlogPostWideDemo>
  );
}
