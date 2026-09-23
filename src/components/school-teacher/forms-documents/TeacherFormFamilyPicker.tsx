"use client";

import { useEffect, useState } from "react";
import { Check, Search } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { FormFamilyOption } from "@/lib/school-teacher/forms-documents/load-form-family-options";
import TeacherFormPickerListSkeleton from "./TeacherFormPickerListSkeleton";

type TeacherFormFamilyPickerProps = {
  theme: ParentThemeTokens;
  organizationId: string;
  familySearchApiPath: string;
  selectedFamilyIds: string[];
  selectedFamilies: FormFamilyOption[];
  onChange: (familyIds: string[], families: FormFamilyOption[]) => void;
  layout?: "chips" | "list";
};

function FamilyPickerRow({
  theme,
  family,
  selected,
  onSelect,
}: {
  theme: ParentThemeTokens;
  family: FormFamilyOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-start gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-colors"
      style={{
        borderColor: selected ? "#CCE0CF" : theme.line,
        backgroundColor: selected ? "#EDF5EE" : theme.white,
      }}
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border"
        style={{
          borderColor: selected ? theme.primary : theme.line,
          backgroundColor: selected ? theme.primary : theme.white,
        }}
      >
        {selected ? <Check className="h-3.5 w-3.5" style={{ color: "#fff" }} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold" style={{ color: theme.ink }}>
          {family.name}
        </span>
        {family.studentNames.length > 0 ? (
          <span className="mt-0.5 block truncate text-xs" style={{ color: theme.muted }}>
            {family.studentNames.join(", ")}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export default function TeacherFormFamilyPicker({
  theme,
  organizationId,
  familySearchApiPath,
  selectedFamilyIds,
  selectedFamilies,
  onChange,
  layout = "list",
}: TeacherFormFamilyPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FormFamilyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const params = new URLSearchParams({
            organizationId,
            q: query.trim(),
            limit: "25",
          });
          const response = await fetch(`${familySearchApiPath}?${params}`);
          const payload = (await response.json()) as {
            families?: FormFamilyOption[];
            error?: string;
          };
          if (!response.ok) {
            throw new Error(payload.error ?? "Failed to search families.");
          }
          if (!cancelled) {
            setResults(payload.families ?? []);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Failed to search families.");
            setResults([]);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [familySearchApiPath, organizationId, query]);

  const toggleFamily = (family: FormFamilyOption) => {
    const selected = selectedFamilyIds.includes(family.id);
    if (selected) {
      onChange(
        selectedFamilyIds.filter((id) => id !== family.id),
        selectedFamilies.filter((item) => item.id !== family.id),
      );
      return;
    }

    onChange([...selectedFamilyIds, family.id], [...selectedFamilies, family]);
  };

  const visibleFamilies = [
    ...selectedFamilies,
    ...results.filter((family) => !selectedFamilyIds.includes(family.id)),
  ];

  if (layout === "chips") {
    return (
      <div>
        <div className="relative mb-3">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: theme.muted }}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search families by name or student…"
            className="w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none"
            style={{
              borderColor: theme.line,
              color: theme.ink,
              backgroundColor: theme.cream,
            }}
          />
        </div>

        {loading ? (
          <TeacherFormPickerListSkeleton theme={theme} label="Searching families" />
        ) : null}

        {error ? (
          <p className="py-2 text-sm" style={{ color: theme.alert }}>{error}</p>
        ) : null}

        {!loading && visibleFamilies.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>No families found.</p>
        ) : !loading ? (
          <div className="flex flex-wrap gap-2">
            {visibleFamilies.map((family) => {
              const selected = selectedFamilyIds.includes(family.id);
              return (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => toggleFamily(family)}
                  className="cursor-pointer rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-colors"
                  style={
                    selected
                      ? {
                          backgroundColor: theme.primarySoft,
                          color: theme.primary,
                          borderColor: "#BCD4C1",
                        }
                      : {
                          backgroundColor: theme.white,
                          color: theme.muted,
                          borderColor: theme.line,
                        }
                  }
                >
                  <span>{family.name}</span>
                  {family.studentNames.length > 0 ? (
                    <span className="ml-1 opacity-80">
                      · {family.studentNames.join(", ")}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: theme.muted }}
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search families by name or student…"
          className="w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none"
          style={{
            borderColor: theme.line,
            color: theme.ink,
            backgroundColor: theme.cream,
          }}
        />
      </div>

      {loading ? (
        <TeacherFormPickerListSkeleton theme={theme} label="Searching families" />
      ) : null}

      {error ? (
        <p className="py-2 text-sm" style={{ color: theme.alert }}>{error}</p>
      ) : null}

      {!loading && visibleFamilies.length === 0 ? (
        <p className="text-sm" style={{ color: theme.muted }}>No families found.</p>
      ) : !loading ? (
        <div className="flex flex-col gap-2">
          {visibleFamilies.map((family) => (
            <FamilyPickerRow
              key={family.id}
              theme={theme}
              family={family}
              selected={selectedFamilyIds.includes(family.id)}
              onSelect={() => toggleFamily(family)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
