"use client";

import { motion, useReducedMotion } from "framer-motion";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { CommitteeListItem } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { fadeUp, staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";
import CommitteeStoryCard from "./CommitteeStoryCard";

export default function CommitteeListView({
  committees,
  theme,
  onOpenCommittee,
}: {
  committees: CommitteeListItem[];
  theme: ParentThemeTokens;
  onOpenCommittee: (id: string) => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;

  if (committees.length === 0) {
    return (
      <motion.div variants={fadeUp(reducedMotion)} initial="initial" animate="animate">
        <AdminCard theme={theme} padding="canvas">
          <p className="font-semibold mb-2" style={{ color: theme.ink }}>
            No committees yet
          </p>
          <p className="text-sm text-center max-w-xs mx-auto" style={{ color: theme.muted }}>
            Create a committee workspace from a template to get started.
          </p>
        </AdminCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={committees.map((committee) => committee.id).join("-")}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[13px]"
      variants={staggerContainer(reducedMotion)}
      initial="initial"
      animate="animate"
    >
      {committees.map((committee) => (
        <motion.div key={committee.id} variants={staggerItem(reducedMotion)}>
          <CommitteeStoryCard
            committee={committee}
            theme={theme}
            onOpen={() => onOpenCommittee(committee.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
