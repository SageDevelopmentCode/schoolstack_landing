"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import type { LiveOrganizationOption } from "@/lib/organization-settings/list-live-organizations";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type OrganizationSelectorProps = {
  organizations: LiveOrganizationOption[];
  onSelect: (organization: LiveOrganizationOption) => void;
  accessibleSlugs?: string[] | null;
  C: AdminThemeTokens;
};

export default function OrganizationSelector({
  organizations,
  onSelect,
  accessibleSlugs = null,
  C,
}: OrganizationSelectorProps) {
  const [query, setQuery] = useState("");
  const visibleOrganizations = useMemo(() => {
    if (!accessibleSlugs) {
      return organizations;
    }

    const allowedSlugs = new Set(accessibleSlugs);
    return organizations.filter((organization) => allowedSlugs.has(organization.slug));
  }, [accessibleSlugs, organizations]);
  const showSearch = visibleOrganizations.length > 4;

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
      <div
        className="rounded-xl border px-4 py-8 text-center text-sm"
        style={{
          borderColor: C.border,
          backgroundColor: C.surface,
          color: C.textSecondary,
        }}
      >
        {accessibleSlugs
          ? "You do not have access to any schools for this role. Try switching tabs or signing in with a different account."
          : "No schools are available for sign-in right now. Please check back later."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSearch ? (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: C.textSecondary }}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search schools…"
            className="w-full rounded-md border py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2"
            style={{
              borderColor: C.inputBorder,
              backgroundColor: C.input,
              color: C.textPrimary,
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {filteredOrganizations.map((organization) => (
          <button
            key={organization.id}
            type="button"
            onClick={() => onSelect(organization)}
            className="grid w-full grid-cols-[20%_80%] items-center gap-3 rounded-lg border p-4 text-left shadow-sm transition hover:shadow-md"
            style={{
              borderColor: C.border,
              backgroundColor: C.surface,
            }}
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
              <p
                className="text-sm font-semibold leading-snug"
                style={{ color: C.textPrimary }}
              >
                {organization.name}
              </p>
            </div>
          </button>
        ))}
      </div>

      {filteredOrganizations.length === 0 ? (
        <p className="text-center text-sm" style={{ color: C.textSecondary }}>
          No schools match your search.
        </p>
      ) : null}
    </div>
  );
}
