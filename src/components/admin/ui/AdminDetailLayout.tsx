import type { ReactNode } from "react";

type AdminDetailLayoutProps = {
  children: ReactNode;
};

export function AdminDetailLayout({ children }: AdminDetailLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">{children}</div>
  );
}
