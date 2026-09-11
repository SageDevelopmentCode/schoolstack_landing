"use client";

import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import PlatformMessagesModerationInbox from "@/components/admin/PlatformMessagesModerationInbox";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

type PlatformMessagesModerationPanelProps = {
  organizations: OrganizationOption[];
  organizationId: string;
  onOrganizationChange: (organizationId: string) => void;
  organizationsLoading: boolean;
  organizationsError: string | null;
};

export default function PlatformMessagesModerationPanel({
  organizations,
  organizationId,
  onOrganizationChange,
  organizationsLoading,
  organizationsError,
}: PlatformMessagesModerationPanelProps) {
  if (organizationsLoading) {
    return <AdminPageState variant="loading" />;
  }

  if (organizationsError) {
    return <AdminPageState variant="error" message={organizationsError} />;
  }

  if (organizations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
        <AdminEmptyState message="No schools found." />
      </div>
    );
  }

  return (
    <PlatformMessagesModerationInbox
      organizationId={organizationId}
      layout="standalone"
      listHeader={
        <AdminListPanelHeader>
          <div className="space-y-1">
            <h1 className="text-sm font-semibold text-admin-text">Messages</h1>
            <p className="text-xs text-admin-muted">
              Read-only oversight of parent, teacher, and school office conversations.
            </p>
          </div>
          <AdminSelect
            value={organizationId}
            onChange={(event) => onOrganizationChange(event.target.value)}
            className="w-full"
            triggerClassName="text-xs px-2 py-1.5 text-admin-text"
            aria-label="School filter"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </AdminSelect>
        </AdminListPanelHeader>
      }
    />
  );
}
