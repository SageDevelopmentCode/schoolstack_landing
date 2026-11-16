"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  EMPTY_ADMIN_NAV_COUNTS,
  type AdminNavCountKey,
  type AdminNavCountValues,
} from "@/lib/school-admin/admin-nav-counts";

/*
 * Live "needs you" counts the admin shell shows on the sidebar. Pages that
 * hold fresher data report them here so a badge changes the moment the admin
 * acts, without waiting for a refresh. Outside the admin shell (demos,
 * teacher portal) the default is a no-op.
 */

export type AdminNavCounts = {
  counts: AdminNavCountValues;
  report: (key: AdminNavCountKey, count: number) => void;
  /** Ask the server for the latest counts (silent on failure). */
  refresh: () => Promise<void>;
};

const AdminNavCountsContext = createContext<AdminNavCounts>({
  counts: EMPTY_ADMIN_NAV_COUNTS,
  report: () => {},
  refresh: async () => {},
});

export function AdminNavCountsProvider({
  value,
  children,
}: {
  value: AdminNavCounts;
  children: ReactNode;
}) {
  return <AdminNavCountsContext.Provider value={value}>{children}</AdminNavCountsContext.Provider>;
}

export function useAdminNavCounts(): AdminNavCounts {
  return useContext(AdminNavCountsContext);
}
