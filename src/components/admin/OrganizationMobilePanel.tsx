"use client";

import { useState } from "react";
import OrganizationMobileUsersPanel from "@/components/admin/OrganizationMobileUsersPanel";
import OrganizationPushNotificationsPanel from "@/components/admin/OrganizationPushNotificationsPanel";

type OrganizationMobilePanelProps = {
  organizationId: string;
};

type MobileSubTab = "users" | "delivery-log";

const SUB_TABS: { id: MobileSubTab; label: string }[] = [
  { id: "users", label: "Users" },
  { id: "delivery-log", label: "Delivery log" },
];

export default function OrganizationMobilePanel({
  organizationId,
}: OrganizationMobilePanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<MobileSubTab>("users");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Mobile
        </h2>
        <p className="text-xs text-admin-muted font-secondary">
          MudKitchen mobile app users and push notification delivery for this
          school.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-1 border-b border-admin-border pb-2"
        role="tablist"
        aria-label="Mobile sections"
      >
        {SUB_TABS.map((tab) => {
          const selected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveSubTab(tab.id)}
              className={`rounded-admin-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                selected
                  ? "bg-admin-accent-soft text-admin-accent"
                  : "text-admin-muted hover:bg-admin-bg hover:text-admin-text"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSubTab === "users" ? (
        <OrganizationMobileUsersPanel organizationId={organizationId} />
      ) : (
        <OrganizationPushNotificationsPanel organizationId={organizationId} />
      )}
    </div>
  );
}
