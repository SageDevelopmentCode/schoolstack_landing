"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import PlatformMessagesModerationPanel from "@/components/admin/PlatformMessagesModerationPanel";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminMessagesPage() {
  const supabase = createClient();
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [organizationsLoading, setOrganizationsLoading] = useState(true);
  const [organizationsError, setOrganizationsError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrganizations() {
      setOrganizationsLoading(true);
      setOrganizationsError(null);

      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) {
        setOrganizationsError(error.message);
        setOrganizations([]);
        setOrganizationId("");
      } else {
        const rows = ((data as OrganizationOption[]) ?? []).map((row) => ({
          id: String(row.id),
          name: String(row.name),
          slug: String(row.slug),
        }));
        setOrganizations(rows);
        setOrganizationId((current) => current || rows[0]?.id || "");
      }

      setOrganizationsLoading(false);
    }

    void loadOrganizations();
  }, [supabase]);

  return (
    <PlatformMessagesModerationPanel
      organizations={organizations}
      organizationId={organizationId}
      onOrganizationChange={setOrganizationId}
      organizationsLoading={organizationsLoading}
      organizationsError={organizationsError}
    />
  );
}
