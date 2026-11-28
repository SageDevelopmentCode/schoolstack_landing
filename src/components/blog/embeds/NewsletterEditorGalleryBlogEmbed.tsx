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
    <BlogPostWideDemo caption="Add photos from your school gallery">
      <BlogProductDemoFrame contentHeight={920} cropZoom={0.92} mobileCropOriginX={0} fitHeight>
        <DemoAdminNewsletterEditorPage variant="photoGallery" />
      </BlogProductDemoFrame>
    </BlogPostWideDemo>
  );
}
