"use client";

import { motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherFormsDocumentsEmptyStateProps = {
  theme: ParentThemeTokens;
  previewMode?: boolean;
  kicker?: string;
  title?: string;
  description?: string;
  createLabel?: string;
  onCreate?: () => void;
};

export default function TeacherFormsDocumentsEmptyState({
  theme,
  previewMode = false,
  kicker = "Family forms",
  title = "Create your first form",
  description = "Upload a PDF or build a form for families to sign — like liability waivers, field trip permissions, or photo releases.",
  createLabel = "Create form",
  onCreate,
}: TeacherFormsDocumentsEmptyStateProps) {
  return (
    <ParentCard theme={theme} className="text-center !py-12">
      <motion.div
        className="flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
        >
          <FileText className="h-7 w-7" />
        </div>
        <AdminSectionKicker theme={theme}>{kicker}</AdminSectionKicker>
        <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-2">
          {title}
        </AdminDisplayHeading>
        <p
          className="mt-3 max-w-md text-sm leading-relaxed"
          style={{ color: theme.muted }}
        >
          {description}
        </p>
        {!previewMode && onCreate ? (
          <div className="mt-8">
            <AdminButton
              theme={theme}
              variant="primary"
              onClick={onCreate}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {createLabel}
            </AdminButton>
          </div>
        ) : null}
      </motion.div>
    </ParentCard>
  );
}
