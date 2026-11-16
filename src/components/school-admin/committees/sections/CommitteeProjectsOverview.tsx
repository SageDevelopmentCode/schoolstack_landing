"use client";

import { FolderKanban, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import CommitteeSectionEmptyState from "@/components/school-admin/committees/CommitteeSectionEmptyState";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import {
  staggerContainer,
  staggerItem,
} from "@/components/school-admin/committees/committee-motion";
import type { CommitteeProject } from "@/lib/committees/committee-project-mappers";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import CommitteeProjectStoryCard from "./CommitteeProjectStoryCard";
import { CommitteeButton } from "@/components/school-admin/committees/committee-ui";
import { useIsGardenCommittee } from "@/components/school-admin/committees/committee-surface";
import { GardenSectionHeader, plural } from "./garden/committee-garden-section";
import { gBtnPopSm } from "@/components/school-parent/garden/ui";

type CommitteeProjectsOverviewProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  projects: CommitteeProject[];
  readOnly?: boolean;
  onOpenProject: (id: string) => void;
  onEditProjectDetails: (id: string) => void;
  onDeleteProject: (project: CommitteeProject) => void;
  onCreateProject: () => void;
};

export default function CommitteeProjectsOverview({
  theme,
  C,
  projects,
  readOnly = false,
  onOpenProject,
  onEditProjectDetails,
  onDeleteProject,
  onCreateProject,
}: CommitteeProjectsOverviewProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const garden = useIsGardenCommittee();

  return (
    <CommitteeWorkspaceSectionFrame width="full">
      {garden ? (
        <GardenSectionHeader
          kicker="Projects"
          title={projects.length > 0 ? plural(projects.length, "project") : "Projects"}
          description="Create projects for committee initiatives. Each project has a supply list so members know what to bring."
          actions={
            !readOnly ? (
              <button type="button" className={gBtnPopSm} onClick={onCreateProject} data-testid="committee-project-new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New project
              </button>
            ) : null
          }
        />
      ) : (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <AdminSectionKicker theme={theme}>Committee workspace</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-1">
            Projects
          </AdminDisplayHeading>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: theme.muted }}>
            Create projects for committee initiatives. Each project has a supply list so members
            know what to bring.
          </p>
        </div>
        {!readOnly ? (
          <AdminButton
            theme={theme}
            variant="soft"
            className="shrink-0 self-start"
            onClick={onCreateProject}
            data-testid="committee-project-new"
          >
            <Plus className="h-4 w-4" />
            New project
          </AdminButton>
        ) : null}
      </div>
      )}

      {projects.length === 0 ? (
        <div className={garden ? "" : "mt-6"}>
          <CommitteeSectionEmptyState
            theme={theme}
            icon={FolderKanban}
            title="No projects yet"
            description="Create a project to organize supplies, assignments, and planning for committee work."
            action={
              readOnly ? undefined : (
                <CommitteeButton theme={theme} variant="primary" onClick={onCreateProject}>
                  <Plus className="h-4 w-4" />
                  Create project
                </CommitteeButton>
              )
            }
          />
        </div>
      ) : (
        <motion.div
          key={projects.map((project) => project.id).join("-")}
          className={garden ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" : "mt-6 grid grid-cols-1 gap-[13px] md:grid-cols-2 lg:grid-cols-3"}
          variants={staggerContainer(reducedMotion)}
          initial="initial"
          animate="animate"
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={staggerItem(reducedMotion)}>
              <CommitteeProjectStoryCard
                project={project}
                theme={theme}
                C={C}
                readOnly={readOnly}
                onOpen={() => onOpenProject(project.id)}
                onEditDetails={
                  readOnly ? undefined : () => onEditProjectDetails(project.id)
                }
                onDelete={readOnly ? undefined : () => onDeleteProject(project)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </CommitteeWorkspaceSectionFrame>
  );
}
