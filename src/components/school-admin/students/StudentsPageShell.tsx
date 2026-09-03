"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { StudentsTableData } from "@/lib/school-admin/load-students-table-data";
import type { StudentsPageMeta } from "@/lib/school-admin/students-page-meta";
import StudentsPage from "./StudentsPage";
import { StudentsPageContext } from "./students-page-context";

type StudentsPageShellProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  initialMeta: StudentsPageMeta;
  children?: ReactNode;
};

export default function StudentsPageShell({
  organizationId,
  branding,
  slug,
  initialMeta,
  children,
}: StudentsPageShellProps) {
  const [tableData, setTableData] = useState<StudentsTableData | null>(null);

  const hydrateTable = useCallback((data: StudentsTableData) => {
    setTableData(data);
  }, []);

  const contextValue = useMemo(
    () => ({
      hydrateTable,
    }),
    [hydrateTable],
  );

  return (
    <StudentsPageContext.Provider value={contextValue}>
      <StudentsPage
        organizationId={organizationId}
        branding={branding}
        slug={slug}
        initialMeta={initialMeta}
        initialTableData={tableData ?? undefined}
        tableDeferred={tableData === null}
      />
      {children}
    </StudentsPageContext.Provider>
  );
}
