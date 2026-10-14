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
    <BlogPostWideDemo caption="Pull teacher updates into your class updates section">
      <BlogProductDemoFrame contentHeight={920} cropZoom={0.92}>
        <DemoAdminNewsletterEditorPage variant="teacherUpdates" persistImportModal />
      </BlogProductDemoFrame>
    </BlogPostWideDemo>
  );
}
