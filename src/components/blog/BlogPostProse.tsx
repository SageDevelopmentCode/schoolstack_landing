import type { ReactNode } from "react";

/** Repo-authored post body in Garden reading type (`.sf-prose`, garden.css). */
export default function BlogPostProse({ children }: { children: ReactNode }) {
  return <div className="sf-prose">{children}</div>;
}
