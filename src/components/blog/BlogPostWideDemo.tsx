"use client";

import type { ReactNode } from "react";

type BlogPostWideDemoProps = {
  children: ReactNode;
  caption?: string;
};

export default function BlogPostWideDemo({ children, caption }: BlogPostWideDemoProps) {
  return (
    <figure className="not-prose relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] my-10">
      <div className="mx-auto flex w-full max-w-[min(100vw-2rem,1200px)] flex-col items-center px-4 sm:px-6">
        {children}
        {caption ? (
          <figcaption className="mt-3 text-center text-sm text-text-faint font-secondary">
            {caption}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
