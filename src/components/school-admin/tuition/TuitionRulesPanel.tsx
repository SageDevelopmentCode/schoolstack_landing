"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import TuitionLateFeeSettingsPanel from "@/components/school-admin/tuition/TuitionLateFeeSettingsPanel";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import {
  DEFAULT_TUITION_RULES_TAB,
  TUITION_RULES_TABS,
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
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
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
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
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
    <div className="flex flex-col gap-5">
      <TuitionSubTabBar
        C={C}
        tabs={TUITION_RULES_TABS}
        activeTab={activeRulesTab}
        onTabChange={handleRulesTabChange}
        ariaLabel="Tuition rules sections"
        testIdPrefix="tuition-rules"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeRulesTab}
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

          {activeRulesTab === "adjustments" ? (
            <div
              className="flex flex-col gap-4"
              id="tuition-rules-panel-adjustments"
              role="tabpanel"
              aria-labelledby="tuition-rules-tab-adjustments"
              data-testid="tuition-rules-panel-adjustments"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  Automatic adjustments apply when enrollments are created.
                </p>
                <button
                  type="button"
                  onClick={() => void handleCreateSiblingRule()}
                  className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md shrink-0"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  <Plus className="w-4 h-4" />
                  Add sibling rule
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-lg text-sm"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="font-medium" style={{ color: C.textPrimary }}>
                          {rule.name}
                        </p>
                        <p style={{ color: C.textTertiary }}>
                          {rule.reason} · priority {rule.priority}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handlePreviewRule(rule)}
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: C.bg,
                            color: C.textPrimary,
                            border: `1px solid ${C.border}`,
                          }}
                          data-testid="tuition-rule-preview-button"
                        >
                          {previewRuleId === rule.id ? "Hide preview" : "Preview"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleRule(rule)}
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: rule.active ? C.accentLight : C.bg,
                            color: rule.active ? C.accent : C.textTertiary,
                          }}
                        >
                          {rule.active ? "Active" : "Inactive"}
                        </button>
                      </div>
                    </div>
                    {previewRuleId === rule.id ? (
                      <div
                        className="border-t px-4 py-3 flex flex-col gap-2"
                        style={{ borderColor: C.border }}
                        data-testid="tuition-rule-preview"
                      >
                        {previewLoading ? (
                          <p className="text-xs" style={{ color: C.textSecondary }}>
                            Loading preview…
                          </p>
                        ) : previewError ? (
                          <p className="text-xs" style={{ color: C.error }}>
                            {previewError}
                          </p>
                        ) : previewMatches.length > 0 ? (
                          <>
                            <p className="text-xs" style={{ color: C.textSecondary }}>
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
                                  <span style={{ color: C.textPrimary }}>
                                    {match.familyName} — {match.studentName}
                                  </span>
                                  {match.alreadyApplied ? (
                                    <span
                                      className="rounded-full px-2 py-0.5 font-medium"
                                      style={{
                                        backgroundColor: C.accentLight,
                                        color: C.accent,
                                      }}
                                    >
                                      Applied
                                    </span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="text-xs" style={{ color: C.textSecondary }}>
                            No families match this rule yet.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
                {!rules.length ? (
                  <p className="text-sm" style={{ color: C.textTertiary }}>
                    No rules configured yet.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
