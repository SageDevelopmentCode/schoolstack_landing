"use client";

import { GChip, type GChipTone } from "@/components/school-parent/garden/ui";
import type { BulletinPostDisplayStatus } from "@/lib/school-bulletin/types";

export const BULLETIN_STATUS_COPY: Record<BulletinPostDisplayStatus, { label: string; tone: GChipTone }> = {
  active: { label: "Active", tone: "success" },
  scheduled: { label: "Scheduled", tone: "info" },
  draft: { label: "Draft", tone: "neutral" },
  expired: { label: "Expired", tone: "warning" },
  archived: { label: "Archived", tone: "neutral" },
};

export function BulletinStatusChip({ status }: { status: BulletinPostDisplayStatus }) {
  const copy = BULLETIN_STATUS_COPY[status];
  return <GChip tone={copy.tone}>{copy.label}</GChip>;
}
