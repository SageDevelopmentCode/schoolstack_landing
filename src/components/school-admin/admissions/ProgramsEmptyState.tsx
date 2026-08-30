"use client";

import { motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ProgramsEmptyStateProps = {
  theme: ParentThemeTokens;
  onCreate: () => void;
};

export default function ProgramsEmptyState({
  theme,
  onCreate,
}: ProgramsEmptyStateProps) {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-6 py-12 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
      >
        <CalendarDays className="h-7 w-7" />
      </div>
      <AdminSectionKicker theme={theme}>Admissions setup</AdminSectionKicker>
      <AdminDisplayHeading theme={theme} as="h1" size="section" className="mt-2">
        Create your first program
      </AdminDisplayHeading>
      <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: theme.muted }}>
        Programs represent enrollment periods like a school year or summer session.
        You will link each application form to one program.
      </p>

      <div className="mt-8">
        <AdminButton theme={theme} variant="primary" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New program
        </AdminButton>
      </div>
    </motion.div>
  );
}
