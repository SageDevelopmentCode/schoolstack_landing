"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/marketing", label: "Carousels", exact: true },
  { href: "/admin/marketing/blog", label: "Blog", exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MarketingAdminTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-admin-border px-4 pt-2">
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href, tab.exact);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-2 text-sm font-medium rounded-t-admin-md transition-colors ${
              active
                ? "bg-admin-surface text-admin-text border border-admin-border border-b-admin-surface -mb-px"
                : "text-admin-muted hover:text-admin-text"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
