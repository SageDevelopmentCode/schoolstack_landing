"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import {
  TUITION_FAMILY_TABS,
  type TuitionFamilyTabId,
} from "./tuition-family-tabs";

type TuitionFamilyTabBarProps = {
  C: AdminThemeTokens;
  activeTab: TuitionFamilyTabId;
  onTabChange: (tab: TuitionFamilyTabId) => void;
};

export default function TuitionFamilyTabBar({
  C,
  activeTab,
  onTabChange,
}: TuitionFamilyTabBarProps) {
  return (
    <TuitionSubTabBar
      C={C}
      tabs={TUITION_FAMILY_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      ariaLabel="Family billing sections"
      testIdPrefix="tuition-family"
    />
  );
}
