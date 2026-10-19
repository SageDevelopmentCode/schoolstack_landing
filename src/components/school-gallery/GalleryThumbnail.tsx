"use client";

import { useState } from "react";

type GalleryThumbnailProps = {
  src?: string | null;
  alt: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function GalleryThumbnail({
  src,
  alt,
  className = "h-full w-full object-cover",
  onClick,
  disabled,
}: GalleryThumbnailProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <span className="flex h-full items-center justify-center text-xs text-[#65747A]">
        Unavailable
      </span>
    );
  }

  const content = (
    <>
      {!loaded ? (
        <span
          className="absolute inset-0 animate-pulse bg-[#E8ECEE]"
          aria-hidden
        />
      ) : null}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
        onLoad={() => setLoaded(true)}
      />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="relative h-full w-full overflow-hidden disabled:cursor-not-allowed"
        onClick={onClick}
        disabled={disabled}
      >
        {content}
      </button>
    );
  }

  return <div className="relative h-full w-full overflow-hidden">{content}</div>;
}
