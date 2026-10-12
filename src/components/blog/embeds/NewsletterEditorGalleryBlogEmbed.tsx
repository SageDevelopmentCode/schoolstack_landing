"use client";

import dynamic from "next/dynamic";
import BlogPostWideDemo from "@/components/blog/BlogPostWideDemo";
import BlogProductDemoFrame from "@/components/blog/BlogProductDemoFrame";

const DemoAdminNewsletterEditorPage = dynamic(
  () => import("@/components/demo/shared/DemoAdminNewsletterEditorPage"),
  { ssr: false },
);

export default function NewsletterEditorGalleryBlogEmbed() {
  return (
    <BlogPostWideDemo caption="Import school photos into your newsletter gallery">
      <BlogProductDemoFrame contentHeight={920} cropZoom={0.92}>
        <DemoAdminNewsletterEditorPage variant="photoGallery" />
      </BlogProductDemoFrame>
    </BlogPostWideDemo>
  );
}
