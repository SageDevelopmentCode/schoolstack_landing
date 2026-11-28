"use client";

import type { ReactNode } from "react";

type BlogPostWideDemoProps = {
  children: ReactNode;
  caption?: string;
  /** Optional line under the caption, e.g. a link to the feature page. */
  footer?: ReactNode;
};

export default function BlogPostWideDemo({ children, caption, footer }: BlogPostWideDemoProps) {
  return (
    <figure className="relative left-1/2 right-1/2 my-12 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center">
        {/* .sf-demo keeps the product's own type inside the Garden page. */}
        <div className="sf-demo w-full max-w-[100vw]">{children}</div>
        {caption ? (
          <figcaption className="mt-4 max-w-2xl px-6 text-center text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">
            {caption}
          </figcaption>
        ) : null}
        {footer ? <div className="mt-2 px-6 text-center">{footer}</div> : null}
      </div>
    </figure>
  );
}
