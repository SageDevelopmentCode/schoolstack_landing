"use client";

import { useState } from "react";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import FreeToolsGrid from "@/components/marketing/free-tools/FreeToolsGrid";
import FreeToolsByStageView from "@/components/marketing/free-tools/FreeToolsByStageView";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

type FreeToolsHubViewTab = "all" | "by_stage";

const VIEW_TABS: { id: FreeToolsHubViewTab; label: string }[] = [
  { id: "by_stage", label: "By stage" },
  { id: "all", label: "All tools" },
];

export default function FreeToolsHubToolsPanel() {
  const [activeTab, setActiveTab] = useState<FreeToolsHubViewTab>("by_stage");

  return (
    <div>
      <TuitionSubTabBar
        theme={theme}
        tabs={VIEW_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ariaLabel="Free tools views"
        testIdPrefix="free-tools-hub"
      />

      <div className="mt-6">
        <div
          id="free-tools-hub-panel-all"
          role="tabpanel"
          aria-labelledby="free-tools-hub-tab-all"
          hidden={activeTab !== "all"}
        >
          {activeTab === "all" ? <FreeToolsGrid /> : null}
        </div>
        <div
          id="free-tools-hub-panel-by_stage"
          role="tabpanel"
          aria-labelledby="free-tools-hub-tab-by_stage"
          hidden={activeTab !== "by_stage"}
        >
          {activeTab === "by_stage" ? <FreeToolsByStageView /> : null}
        </div>
      </div>
    </div>
  );
}
