import type { ReactNode } from "react";

type AdminDetailSectionProps = {
  title: string;
  children: ReactNode;
};

export function AdminDetailSection({ title, children }: AdminDetailSectionProps) {
  return (
    <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3 shadow-xs">
      <h2 className="text-[11px] font-semibold text-admin-faint uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </section>
  );
}
