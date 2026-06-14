"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/demo-requests", label: "Demo Requests" },
  { href: "/admin/demo-feedback", label: "Demo Feedback" },
  { href: "/admin/homepage-questions", label: "Homepage Questions" },
  { href: "/admin/research", label: "Research CRM" },
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
              {NAV.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                      active
                        ? "bg-clay-soft text-clay font-medium"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
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
