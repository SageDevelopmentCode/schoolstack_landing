import type { ReactNode } from "react";

type MarketingGardenToolShellProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

/**
 * Garden frame for a free tool: dot-grid paper under the fixed navbar, the
 * Garden gutters and a wide working column.
 */
export default function MarketingGardenToolShell({ children, id, className = "" }: MarketingGardenToolShellProps) {
  return (
    <section
      id={id}
      className={`sf-grid relative min-h-0 pb-20 pt-32 text-[var(--sf-ink)] lg:pb-28 lg:pt-40 ${className}`.trim()}
    >
      <div className="mx-auto min-w-0 max-w-[1240px] px-4 sm:px-10 lg:px-16">{children}</div>
    </section>
  );
}
