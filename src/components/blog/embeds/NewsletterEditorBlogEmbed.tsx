"use client";

import dynamic from "next/dynamic";
import BlogPostWideDemo from "@/components/blog/BlogPostWideDemo";
import BlogProductDemoFrame from "@/components/blog/BlogProductDemoFrame";

const DemoAdminNewsletterEditorPage = dynamic(
  () => import("@/components/demo/shared/DemoAdminNewsletterEditorPage"),
  { ssr: false },
);

export default function NewsletterEditorBlogEmbed() {
  return (
    <BlogPostWideDemo caption="MudKitchen school admin — weekly newsletter editor">
      <BlogProductDemoFrame contentHeight={920} cropZoom={0.92}>
        <DemoAdminNewsletterEditorPage />
      </BlogProductDemoFrame>
    </BlogPostWideDemo>
  );
}
