"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import type { LiveOrganizationOption } from "@/lib/organization-settings/list-live-organizations";

type OrganizationSelectorProps = {
  organizations: LiveOrganizationOption[];
  onSelect: (organization: LiveOrganizationOption) => void;
  disabled?: boolean;
  openingOrganizationId?: string | null;
};

/** Post-auth picker: `organizations` are already limited to the user's schools. */
export default function OrganizationSelector({
  organizations,
  onSelect,
  disabled = false,
  openingOrganizationId = null,
}: OrganizationSelectorProps) {
  const [query, setQuery] = useState("");
  const visibleOrganizations = organizations;
  const showSearch = visibleOrganizations.length > 4;
  const isOpening = Boolean(openingOrganizationId);

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return visibleOrganizations;

    return visibleOrganizations.filter(
      (organization) =>
        organization.name.toLowerCase().includes(normalizedQuery) ||
        organization.slug.toLowerCase().includes(normalizedQuery),
    );
  }, [query, visibleOrganizations]);

  if (visibleOrganizations.length === 0) {
    return (
      <div className="rounded-[26px] border-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)] px-5 py-8 text-center text-sm leading-relaxed text-[var(--sf-soft)]">
        You do not have access to any schools for this account. Go back and try
        signing in with a different account.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSearch ? (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-soft)]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search schools…"
            disabled={isOpening}
            className="w-full rounded-2xl border-2 border-[var(--sf-ink)]/15 bg-white py-3 pl-10 pr-4 text-[15px] text-[var(--sf-ink)] outline-none transition-colors placeholder:text-[var(--sf-ink)]/40 hover:border-[var(--sf-ink)]/40 focus-visible:border-[var(--sf-ink)] focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/25 disabled:opacity-60"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {filteredOrganizations.map((organization) => {
          const isThisOpening = openingOrganizationId === organization.id;

          return (
            <button
              key={organization.id}
              type="button"
              onClick={() => onSelect(organization)}
              disabled={disabled || (isOpening && !isThisOpening)}
              aria-busy={isThisOpening}
              className="grid w-full grid-cols-[minmax(0,5rem)_1fr_auto] items-center gap-3 rounded-[24px] border-2 border-[var(--sf-ink)]/15 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)] hover:shadow-[0_4px_0_0_var(--sf-ink)] focus-visible:-translate-y-0.5 focus-visible:border-[var(--sf-ink)] focus-visible:shadow-[0_4px_0_0_var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <div className="flex h-full min-w-0 items-center justify-center">
                <SchoolDemoWordmark
                  logo={{
                    src: organization.branding.logo.src,
                    alt: organization.branding.logo.alt || organization.name,
                    width: organization.branding.logo.width,
                    height: organization.branding.logo.height,
                    text: organization.branding.logo.src ? undefined : organization.name,
                  }}
                  className="max-h-10 w-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold leading-snug text-[var(--sf-ink)]">
                  {organization.name}
                </p>
              </div>
              {isThisOpening ? (
                <Loader2
                  className="h-5 w-5 shrink-0 animate-spin text-[var(--sf-forest)]"
                  aria-hidden
                />
              ) : (
                <span className="w-5 shrink-0" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      {filteredOrganizations.length === 0 ? (
        <p className="text-center text-sm text-[var(--sf-soft)]">
          No schools match your search.
        </p>
      ) : null}
    </div>
  );
}
