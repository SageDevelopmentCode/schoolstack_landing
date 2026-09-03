"use client";

import { useLayoutEffect } from "react";
import type { TuitionDashboardData } from "@/lib/tuition/load-tuition-dashboard-data";
import { useTuitionPageContext } from "./tuition-page-context";

type TuitionDashboardDataProps = {
  dashboardData: TuitionDashboardData;
};

export default function TuitionDashboardData({
  dashboardData,
}: TuitionDashboardDataProps) {
  const { hydrateDashboard } = useTuitionPageContext();

  useLayoutEffect(() => {
    hydrateDashboard(dashboardData);
  }, [dashboardData, hydrateDashboard]);

  return null;
}
