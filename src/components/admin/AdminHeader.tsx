"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarClock,
  MessageSquareText,
  LayoutGrid,
  CircleHelp,
  Building2,
  School,
  ScrollText,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

const NAV: {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
}[] = [
  { href: "/admin/demo-requests", label: "Requests", icon: CalendarCheck, color: "#2563eb" },
  { href: "/admin/availability", label: "Schedule", icon: CalendarClock, color: "#059669" },
  { href: "/admin/demo-feedback", label: "Feedback", icon: MessageSquareText, color: "#7c3aed" },
  { href: "/admin/demos", label: "Demos", icon: LayoutGrid, color: "#d97706" },
  { href: "/admin/homepage-questions", label: "Questions", icon: CircleHelp, color: "#0891b2" },
  { href: "/admin/organizations", label: "Organizations", icon: School, color: "#4f46e5" },
  { href: "/admin/activity", label: "Activity", icon: ScrollText, color: "#0f766e" },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, color: "#2563eb" },
  { href: "/admin/research", label: "CRM", icon: Building2, color: "#db2777" },
];

type AdminHeaderProps = {
  variant?: "minimal" | "full";
  onSignOut?: () => void;
};

export default function AdminHeader({
  variant = "full",
  onSignOut,
}: AdminHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] bg-white border-b border-border font-secondary">
      <div className="h-12 flex items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src="/images/Logo.png"
            alt="MudKitchen"
            className="h-8 w-auto object-contain md:h-9"
          />
        </Link>

        {variant === "full" && (
          <>
            <nav
              className="flex items-center gap-1 flex-1 justify-center"
              aria-label="Admin navigation"
            >
              {NAV.map(({ href, label, icon: Icon, color }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors duration-150 ${
                      active
                        ? "bg-clay-soft text-clay font-medium"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    <Icon
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color }}
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="text-sm font-medium text-text-muted hover:text-text transition-colors duration-150 shrink-0"
              >
                Sign out
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
