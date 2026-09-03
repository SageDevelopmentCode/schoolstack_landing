"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import TuitionLateFeeSettingsPanel from "@/components/school-admin/tuition/TuitionLateFeeSettingsPanel";
import {
  DEFAULT_TUITION_RULES_TAB,
  TUITION_ADJUSTMENT_RULES_UI_ENABLED,
  VISIBLE_TUITION_RULES_TABS,
  type TuitionRulesTabId,
} from "@/components/school-admin/tuition/tuition-rules-tabs";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import {
  createAdjustmentRule,
  listAdjustmentRules,
  updateAdjustmentRule,
  type RulePreviewMatch,
} from "@/lib/tuition/rules-engine";
import type { TuitionAdjustmentRule } from "@/lib/tuition/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";

type TuitionRulesPanelProps = {
  organizationId: string;
  branding: OrganizationBranding;
  onRefresh: () => void;
};

export default function TuitionRulesPanel({
  organizationId,
  branding,
}: TuitionRulesPanelProps) {
  void branding;
  const { theme } = useSchoolAdminStoryTheme();
  const supabase = useMemo(() => createClient(), []);
  const reducedMotion = useReducedMotion() ?? false;
  const [rules, setRules] = useState<TuitionAdjustmentRule[]>([]);
  const [previewRuleId, setPreviewRuleId] = useState<string | null>(null);
  const [previewMatches, setPreviewMatches] = useState<RulePreviewMatch[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [activeRulesTab, setActiveRulesTab] = useState<TuitionRulesTabId>(
    DEFAULT_TUITION_RULES_TAB,
  );

  const loadRules = useCallback(async () => {
    const rows = await listAdjustmentRules(supabase, organizationId);
    setRules(rows);
  }, [organizationId, supabase]);

  useEffect(() => {
    if (!TUITION_ADJUSTMENT_RULES_UI_ENABLED) return;

    queueMicrotask(() => {
      void loadRules();
    });
  }, [loadRules]);

  const handleRulesTabChange = (tab: TuitionRulesTabId) => {
    setActiveRulesTab(tab);
    if (tab !== "adjustments") {
      setPreviewRuleId(null);
      setPreviewMatches([]);
      setPreviewError(null);
    }
  };

  const handleCreateSiblingRule = async () => {
    try {
      await createAdjustmentRule(supabase, {
        organizationId,
        name: "Sibling discount",
        priority: 10,
        conditions: {
          all: [{ field: "active_enrollments_in_family", op: "gte", value: 2 }],
        },
        adjustmentType: "percent_discount",
        valuePercent: 10,
        reason: "Sibling discount",
      });
      adminToast.success("Sibling discount rule added");
      await loadRules();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to add sibling rule."));
    }
  };

  const handleToggleRule = async (rule: TuitionAdjustmentRule) => {
    try {
      await updateAdjustmentRule(supabase, rule.id, { active: !rule.active });
      adminToast.success(rule.active ? "Rule deactivated" : "Rule activated");
      await loadRules();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to update rule."));
    }
  };

  const handlePreviewRule = async (rule: TuitionAdjustmentRule) => {
    if (previewRuleId === rule.id) {
      setPreviewRuleId(null);
      setPreviewMatches([]);
      setPreviewError(null);
      return;
    }

    setPreviewRuleId(rule.id);
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const response = await fetch(`/api/tuition/rules/${rule.id}/preview`);
      const payload = (await response.json()) as {
        matches?: RulePreviewMatch[];
        error?: string;
      };

      if (!response.ok) {
        setPreviewMatches([]);
        setPreviewError(payload.error ?? "Failed to load preview.");
        return;
      }

      setPreviewMatches(payload.matches ?? []);
    } catch (error) {
      setPreviewMatches([]);
      setPreviewError(
        error instanceof Error ? error.message : "Failed to load preview.",
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[240px_1fr]">
      <AdminCard
        theme={theme}
        padding="none"
        className="p-2"
        data-testid="tuition-rules-tab-bar"
      >
        <div role="tablist" aria-label="Tuition rules sections" className="flex flex-col gap-1">
          {VISIBLE_TUITION_RULES_TABS.map((tab) => {
            const isActive = activeRulesTab === tab.id;
            const tabId = `tuition-rules-tab-${tab.id}`;
            const panelId = `tuition-rules-panel-${tab.id}`;

            return (
              <button
                key={tab.id}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={() => handleRulesTabChange(tab.id)}
                className="rounded-[11px] border px-[11px] py-[11px] text-left text-[12px] font-bold transition-colors"
                style={
                  isActive
                    ? {
                        backgroundColor: "#EDF5EE",
                        borderColor: "#CCE0CF",
                        color: theme.primary,
                      }
                    : {
                        backgroundColor: "transparent",
                        borderColor: "transparent",
                        color: theme.ink,
                      }
                }
                data-testid={tabId}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </AdminCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeRulesTab}
          className="min-w-0"
          variants={tabPanelVariants(reducedMotion)}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={tabPanelTransition(reducedMotion)}
        >
          {activeRulesTab === "late_fees" ? (
            <div
              id="tuition-rules-panel-late_fees"
              role="tabpanel"
              aria-labelledby="tuition-rules-tab-late_fees"
              data-testid="tuition-rules-panel-late_fees"
            >
              <TuitionLateFeeSettingsPanel
                organizationId={organizationId}
                branding={branding}
              />
            </div>
          ) : null}

          {TUITION_ADJUSTMENT_RULES_UI_ENABLED && activeRulesTab === "adjustments" ? (
            <div
              id="tuition-rules-panel-adjustments"
              role="tabpanel"
              aria-labelledby="tuition-rules-tab-adjustments"
              data-testid="tuition-rules-panel-adjustments"
            >
            <AdminCard
              theme={theme}
              padding="canvas"
              className="flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.ink }}>
                    What tuition discounts or adjustments should apply automatically?
                  </p>
                  <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                    Rules run when enrollments are created or updated.
                  </p>
                </div>
                <AdminButton
                  theme={theme}
                  variant="soft"
                  size="compact"
                  className="shrink-0"
                  onClick={() => void handleCreateSiblingRule()}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add sibling discount rule
                </AdminButton>
              </div>

              <div className="flex flex-col gap-2">
                {rules.map((rule) => (
                  <AdminCard key={rule.id} theme={theme} padding="default" className="!p-0">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium" style={{ color: theme.ink }}>
                          {rule.name}
                        </p>
                        <p style={{ color: theme.muted }}>
                          {rule.reason} · priority {rule.priority}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdminButton
                          theme={theme}
                          variant="outline"
                          size="compact"
                          onClick={() => void handlePreviewRule(rule)}
                          data-testid="tuition-rule-preview-button"
                        >
                          {previewRuleId === rule.id ? "Hide preview" : "Preview"}
                        </AdminButton>
                        <AdminButton
                          theme={theme}
                          variant={rule.active ? "soft" : "outline"}
                          size="compact"
                          onClick={() => void handleToggleRule(rule)}
                        >
                          {rule.active ? "Active" : "Inactive"}
                        </AdminButton>
                      </div>
                    </div>
                    {previewRuleId === rule.id ? (
                      <div
                        className="flex flex-col gap-2 border-t px-4 py-3"
                        style={{ borderColor: "#E1E8E1" }}
                        data-testid="tuition-rule-preview"
                      >
                        {previewLoading ? (
                          <p className="text-xs" style={{ color: theme.muted }}>
                            Loading preview…
                          </p>
                        ) : previewError ? (
                          <p className="text-xs" style={{ color: "#AD574C" }}>
                            {previewError}
                          </p>
                        ) : previewMatches.length > 0 ? (
                          <>
                            <p className="text-xs" style={{ color: theme.muted }}>
                              {previewMatches.length === 1
                                ? "1 student would be affected"
                                : `${previewMatches.length} students would be affected`}
                            </p>
                            <ul className="flex flex-col gap-2">
                              {previewMatches.map((match) => (
                                <li
                                  key={match.assignmentId}
                                  className="flex items-center justify-between gap-3 text-xs"
                                  data-testid="tuition-rule-preview-row"
                                >
                                  <span style={{ color: theme.ink }}>
                                    {match.familyName} — {match.studentName}
                                  </span>
                                  {match.alreadyApplied ? (
                                    <AdminChip theme={theme} tone="success">
                                      Applied
                                    </AdminChip>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="text-xs" style={{ color: theme.muted }}>
                            No families match this rule yet.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </AdminCard>
                ))}
                {!rules.length ? (
                  <p className="text-sm" style={{ color: theme.muted }}>
                    No automatic adjustments yet.
                  </p>
                ) : null}
              </div>
            </AdminCard>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
