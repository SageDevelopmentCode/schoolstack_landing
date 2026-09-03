"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import {
  TUITION_FAMILY_TABS,
  type TuitionFamilyTabId,
} from "./tuition-family-tabs";

type TuitionFamilyTabBarProps = {
  theme: ParentThemeTokens;
  activeTab: TuitionFamilyTabId;
  onTabChange: (tab: TuitionFamilyTabId) => void;
};

export default function TuitionFamilyTabBar({
  theme,
  activeTab,
  onTabChange,
}: TuitionFamilyTabBarProps) {
  return (
    <TuitionSubTabBar
      theme={theme}
      tabs={TUITION_FAMILY_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      ariaLabel="Family billing sections"
      testIdPrefix="tuition-family"
    />
  );
}
