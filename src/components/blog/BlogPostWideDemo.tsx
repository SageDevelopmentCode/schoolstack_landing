"use client";

import type { ReactNode } from "react";

type BlogPostWideDemoProps = {
  children: ReactNode;
  caption?: string;
};

export default function BlogPostWideDemo({ children, caption }: BlogPostWideDemoProps) {
  return (
    <figure className="not-prose relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] my-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center">
        <div className="w-full max-w-[100vw]">{children}</div>
        {caption ? (
          <figcaption className="mt-3 px-4 text-center text-sm text-text-faint font-secondary sm:px-6">
            {caption}
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
