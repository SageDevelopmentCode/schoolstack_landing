"use client";

import { useState } from "react";

export type NewsletterMediaImageProps = {
  src: string;
  alt: string;
  /** Stable id when src is empty or changes (e.g. photo.id). */
  instanceKey?: string;
  className?: string;
  imageClassName?: string;
  decoding?: "async" | "auto" | "sync";
};

const SKELETON_CLASS = "absolute inset-0 h-full w-full animate-pulse rounded-none bg-[#E4E8E1]";

function NewsletterMediaImageInner({
  src,
  alt,
  className = "",
  imageClassName = "",
  decoding = "async",
}: NewsletterMediaImageProps) {
  const [loaded, setLoaded] = useState(false);
  const effectiveSrc = src.trim();

  if (!effectiveSrc) {
    return (
      <div className={`relative overflow-hidden ${className}`.trim()}>
        <div className={SKELETON_CLASS} aria-hidden />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      {!loaded ? <div className={SKELETON_CLASS} aria-hidden /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={effectiveSrc}
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
  const remountKey = `${props.instanceKey ?? props.alt}:${props.src}`;
  return <NewsletterMediaImageInner key={remountKey} {...props} />;
}
