"use client";

import { useState } from "react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import SkeletonBlock from "@/components/school-admin/skeletons/SkeletonBlock";

export type NewsletterMediaImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  decoding?: "async" | "auto" | "sync";
};

function NewsletterMediaImageInner({
  src,
  alt,
  className = "",
  imageClassName = "",
  decoding = "async",
}: NewsletterMediaImageProps) {
  const { C } = useSchoolAdminStoryTheme();
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      {!loaded ? (
        <SkeletonBlock C={C} className="absolute inset-0 h-full w-full !rounded-none" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        decoding={decoding}
        className={imageClassName}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) {
            setLoaded(true);
          }
        }}
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.2s ease" }}
      />
    </div>
  );
}

export default function NewsletterMediaImage(props: NewsletterMediaImageProps) {
  return <NewsletterMediaImageInner key={props.src} {...props} />;
}
