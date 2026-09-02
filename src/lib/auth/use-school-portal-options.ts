"use client";

import { useCallback, useEffect, useState } from "react";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";

type UseSchoolPortalOptionsOptions = {
  enabled?: boolean;
  initialOptions?: SchoolPortalOption[];
};

export function useSchoolPortalOptions(
  organizationId: string,
  slug: string,
  options: UseSchoolPortalOptionsOptions = {},
) {
  const { enabled = true, initialOptions } = options;
  const [portalOptions, setPortalOptions] = useState<SchoolPortalOption[]>(
    initialOptions ?? [],
  );
  const [isLoading, setIsLoading] = useState(
    enabled && initialOptions === undefined,
  );

  const fetchPortalOptions = useCallback(async () => {
    if (!enabled || !organizationId || !slug || initialOptions !== undefined) {
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ organizationId, slug });
      const response = await fetch(
        `/api/school-admin/portal-options?${params.toString()}`,
      );
      if (!response.ok) return;

      const payload = (await response.json()) as { options?: SchoolPortalOption[] };
      setPortalOptions(payload.options ?? []);
    } catch {
      // ignore transient errors
    } finally {
      setIsLoading(false);
    }
  }, [enabled, initialOptions, organizationId, slug]);

  useEffect(() => {
    if (initialOptions !== undefined) {
      setPortalOptions(initialOptions);
      setIsLoading(false);
      return;
    }

    queueMicrotask(() => {
      void fetchPortalOptions();
    });
  }, [fetchPortalOptions, initialOptions]);

  return { options: portalOptions, isLoading };
}
