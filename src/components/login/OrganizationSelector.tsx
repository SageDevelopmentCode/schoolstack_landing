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
      <div className="rounded-[24px] border border-black/8 bg-[#F7F5F2] px-4 py-8 text-center font-secondary text-sm text-[#1d1a16]/70">
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
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1d1a16]/45"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search schools…"
            disabled={isOpening}
            className="w-full rounded-[12px] border border-black/10 bg-white py-2.5 pl-9 pr-3 font-secondary text-sm text-[#1d1a16] outline-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d1a16] disabled:opacity-60"
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
              className="grid w-full grid-cols-[minmax(0,5rem)_1fr_auto] items-center gap-3 rounded-[24px] border border-black/8 bg-[#F7F5F2] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(30,60,30,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
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
                <p className="font-secondary text-sm font-semibold leading-snug text-[#1d1a16]">
                  {organization.name}
                </p>
              </div>
              {isThisOpening ? (
                <Loader2
                  className="h-5 w-5 shrink-0 animate-spin text-[#1d1a16]"
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
        <p className="text-center font-secondary text-sm text-[#1d1a16]/70">
          No schools match your search.
        </p>
      ) : null}
    </div>
  );
}
